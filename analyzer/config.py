import os
from pathlib import Path
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

class Config:
    LLM_PROVIDER = os.getenv("LLM_PROVIDER", "google").lower()
    
    OPENAI_API_KEY = os.getenv("OPENAI_API_KEY", "")
    GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "")
    
    # Defaults depending on provider
    DEFAULT_MODEL = "gemini-2.5-flash" if LLM_PROVIDER == "google" else "gpt-4o-mini"
    LLM_MODEL = os.getenv("LLM_MODEL", DEFAULT_MODEL)
    
    try:
        MAX_CONCURRENT_REQUESTS = int(os.getenv("MAX_CONCURRENT_REQUESTS", "5"))
    except ValueError:
        MAX_CONCURRENT_REQUESTS = 5
        
    try:
        RETRY_ATTEMPTS = int(os.getenv("RETRY_ATTEMPTS", "5"))
    except ValueError:
        RETRY_ATTEMPTS = 5
        
    try:
        CHUNK_SIZE = int(os.getenv("CHUNK_SIZE", "70"))
    except ValueError:
        CHUNK_SIZE = 70
        
    try:
        CHUNK_OVERLAP = int(os.getenv("CHUNK_OVERLAP", "5"))
    except ValueError:
        CHUNK_OVERLAP = 5
        
    INPUT_FILE = os.getenv("INPUT_FILE", "WhatsApp Chat with מנהלי.ות איקומרס.txt")
    OUTPUT_FILE = os.getenv("OUTPUT_FILE", "results.csv")
    
    # Progress Cache for resuming checkpoint
    PROGRESS_CACHE_FILE = ".progress_cache.json"

    @classmethod
    def validate(cls):
        """Validates critical configurations."""
        if cls.LLM_PROVIDER not in ("google", "openai"):
            raise ValueError(f"LLM_PROVIDER must be 'google' or 'openai', got '{cls.LLM_PROVIDER}'")
            
        if cls.LLM_PROVIDER == "google" and not cls.GEMINI_API_KEY:
            # Check if GEMINI_API_KEY is in environment or fallback to google application default
            if not os.getenv("GEMINI_API_KEY") and not os.getenv("GOOGLE_API_KEY"):
                raise ValueError("GEMINI_API_KEY or GOOGLE_API_KEY environment variable is required when LLM_PROVIDER='google'")
                
        if cls.LLM_PROVIDER == "openai" and not cls.OPENAI_API_KEY:
            raise ValueError("OPENAI_API_KEY environment variable is required when LLM_PROVIDER='openai'")
            
        if not Path(cls.INPUT_FILE).exists():
            raise FileNotFoundError(f"Input file not found at: {cls.INPUT_FILE}")
