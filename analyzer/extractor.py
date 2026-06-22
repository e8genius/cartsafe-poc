import json
import logging
import asyncio
from pathlib import Path
from typing import List, Dict, Any, Optional
from tenacity import retry, stop_after_attempt, wait_exponential

from config import Config
from models import InsightExtraction, InsightItem

logger = logging.getLogger("extractor")

# Define the system prompt for the LLM
SYSTEM_PROMPT = """You are an expert product researcher and business analyst.
Analyze the following WhatsApp chat transcript of e-commerce store managers discussing daily business problems, tools, and operations.
Your task is to identify and extract structured insights about their pain points, business problems, and tool complaints.

For each pain point/problem identified, extract:
1. category: The business area (e.g., Logistics, Shopify Bugs, Marketing, Payments, Customer Service, Inventory, etc.). Standardize this category name to English.
2. problem_statement: A concise description of the user need, complaint, or pain point, translated and summarized in English.
3. severity_signal: High, Medium, or Low, based on the emotional tone (frustration, urgency) or how frequently the issue is brought up in this transcript chunk.
4. original_quote: A short snippet of the original Hebrew message showing this exact problem. Keep the Hebrew context real and verifiable.

Do not hallucinate or make up complaints. Only extract complaints actually mentioned in the transcript.
If no complaints or issues are mentioned in the transcript, return an empty list of insights."""

class LLMExtractor:
    def __init__(self, dry_run: bool = False):
        self.dry_run = dry_run
        self.semaphore = asyncio.Semaphore(Config.MAX_CONCURRENT_REQUESTS)
        
        if not dry_run:
            Config.validate()
            self.provider = Config.LLM_PROVIDER
            self.model = Config.LLM_MODEL
            
            # Initialize the appropriate client
            if self.provider == "google":
                from google import genai
                self.google_client = genai.Client(api_key=Config.GEMINI_API_KEY)
                self.openai_client = None
            else:
                from openai import AsyncOpenAI
                self.openai_client = AsyncOpenAI(api_key=Config.OPENAI_API_KEY)
                self.google_client = None
        else:
            self.provider = "mock"
            self.model = "mock-model"
            self.google_client = None
            self.openai_client = None

        self.cache_path = Path(Config.PROGRESS_CACHE_FILE)
        self.cache = self._load_cache()

    def _load_cache(self) -> Dict[str, Any]:
        """Loads progress from cache file if it exists."""
        if self.cache_path.exists():
            try:
                with open(self.cache_path, "r", encoding="utf-8") as f:
                    return json.load(f)
            except Exception as e:
                logger.warning(f"Failed to load cache: {e}. Starting fresh.")
        return {"processed_chunks": {}}

    def _save_cache(self):
        """Saves current cache to disk atomically."""
        temp_path = self.cache_path.with_suffix(".tmp")
        try:
            with open(temp_path, "w", encoding="utf-8") as f:
                json.dump(self.cache, f, ensure_ascii=False, indent=2)
            temp_path.replace(self.cache_path)
        except Exception as e:
            logger.error(f"Failed to save cache: {e}")

    def get_cached_result(self, chunk_idx: int) -> Optional[List[Dict[str, Any]]]:
        """Returns cached results for a chunk index if it exists."""
        idx_str = str(chunk_idx)
        return self.cache["processed_chunks"].get(idx_str)

    def save_to_cache(self, chunk_idx: int, insights: List[Dict[str, Any]]):
        """Saves chunk extraction results to cache."""
        idx_str = str(chunk_idx)
        self.cache["processed_chunks"][idx_str] = insights
        self._save_cache()

    def format_chunk_messages(self, messages: List[Dict[str, Any]]) -> str:
        """Formats the list of messages into a single text block for the LLM."""
        formatted_lines = []
        for msg in messages:
            formatted_lines.append(f"[{msg['timestamp']}] {msg['sender']}: {msg['content']}")
        return "\n".join(formatted_lines)

    @retry(
        stop=stop_after_attempt(5),
        wait=wait_exponential(multiplier=1, min=2, max=15),
        reraise=True
    )
    async def _call_llm_api_with_retry(self, prompt: str) -> InsightExtraction:
        """Calls the LLM API with structured output configuration and retry logic."""
        if self.provider == "google":
            from google.genai import types
            
            # The new google-genai SDK uses client.aio for async operations
            response = await self.google_client.aio.models.generate_content(
                model=self.model,
                contents=prompt,
                config=types.GenerateContentConfig(
                    response_mime_type="application/json",
                    response_schema=InsightExtraction,
                    system_instruction=SYSTEM_PROMPT,
                    temperature=0.1, # Low temperature for analytical accuracy
                )
            )
            
            # The response text will be JSON validating the response_schema
            try:
                data = json.loads(response.text)
                return InsightExtraction.model_validate(data)
            except Exception as e:
                logger.error(f"Failed to parse Gemini response as Pydantic model: {e}. Raw text: {response.text}")
                raise
        else:
            # OpenAI Beta Structured Outputs
            response = await self.openai_client.beta.chat.completions.parse(
                model=self.model,
                messages=[
                    {"role": "system", "content": SYSTEM_PROMPT},
                    {"role": "user", "content": prompt}
                ],
                response_format=InsightExtraction,
                temperature=0.1,
            )
            return response.choices[0].message.parsed

    async def extract_insights_from_chunk(self, chunk_idx: int, messages: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """
        Processes a single chunk of messages. Utilizes the semaphore to control concurrency.
        Returns a list of extracted insight dicts.
        """
        # Check cache first
        cached = self.get_cached_result(chunk_idx)
        if cached is not None:
            return cached

        # Handle Dry-Run Mode
        if self.dry_run:
            insights = []
            text_block = self.format_chunk_messages(messages)
            
            # Simple keyword matching to simulate realistic extraction for the demo
            if "שופיפיי" in text_block or "Shopify" in text_block:
                insights.append({
                    "category": "Shopify Bugs",
                    "problem_statement": "Discussion about Shopify plugins or builders affecting site speed.",
                    "severity_signal": "Medium",
                    "original_quote": "קחי בחשבון שהם עלולות להשפיע על זמני טעינת עמודים באתר"
                })
            if "סליקה" in text_block or "ביט" in text_block or "תשלום" in text_block:
                insights.append({
                    "category": "Payments",
                    "problem_statement": "Managers discussing Bit payment integration fees and UX.",
                    "severity_signal": "High",
                    "original_quote": "מחפשים אלטרנטיבה לסליקת ביט לא דרך משולם"
                })
            
            # Fallback general insight if no keywords match
            if not insights:
                insights.append({
                    "category": "General Operations",
                    "problem_statement": "E-commerce general discussion or tool queries.",
                    "severity_signal": "Low",
                    "original_quote": messages[0]["content"][:60] if messages else "N/A"
                })
                
            # Simulate slight delay to show progress bar moving nicely
            await asyncio.sleep(0.01)
            self.save_to_cache(chunk_idx, insights)
            return insights

        prompt = self.format_chunk_messages(messages)
        
        async with self.semaphore:
            try:
                extraction = await self._call_llm_api_with_retry(prompt)
                
                # Convert Pydantic model to list of dicts
                insights = [item.model_dump() for item in extraction.insights]
                
                # Save to cache
                self.save_to_cache(chunk_idx, insights)
                return insights
            except Exception as e:
                logger.error(f"Failed processing chunk {chunk_idx}: {e}")
                # Return empty list on failure after all retries to allow overall pipeline to proceed,
                # but we don't cache it so it can be retried in future runs.
                return []
