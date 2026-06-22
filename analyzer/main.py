import os
import sys
import argparse
import asyncio
import logging
from pathlib import Path
import pandas as pd
from tqdm.asyncio import tqdm

from config import Config
from parser import parse_whatsapp_file
from chunker import chunk_messages
from extractor import LLMExtractor

# Set up logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
    handlers=[
        logging.StreamHandler(sys.stdout)
    ]
)
logger = logging.getLogger("main")
# Suppress noisy library logs
logging.getLogger("httpx").setLevel(logging.WARNING)
logging.getLogger("openai").setLevel(logging.WARNING)

def parse_args():
    parser = argparse.ArgumentParser(description="WhatsApp Chat Insight Extractor")
    parser.add_argument(
        "-i", "--input", 
        default=Config.INPUT_FILE,
        help=f"Path to WhatsApp export txt file (default: {Config.INPUT_FILE})"
    )
    parser.add_argument(
        "-o", "--output", 
        default=Config.OUTPUT_FILE,
        help=f"Path to output CSV file (default: {Config.OUTPUT_FILE})"
    )
    parser.add_argument(
        "-c", "--chunk-size", 
        type=int,
        default=Config.CHUNK_SIZE,
        help=f"Number of messages per chunk (default: {Config.CHUNK_SIZE})"
    )
    parser.add_argument(
        "-v", "--overlap", 
        type=int,
        default=Config.CHUNK_OVERLAP,
        help=f"Number of overlapping messages between chunks (default: {Config.CHUNK_OVERLAP})"
    )
    parser.add_argument(
        "-p", "--provider", 
        choices=["google", "openai"],
        default=Config.LLM_PROVIDER,
        help=f"LLM API provider (default: {Config.LLM_PROVIDER})"
    )
    parser.add_argument(
        "-m", "--model", 
        default=Config.LLM_MODEL,
        help=f"LLM Model name (default: {Config.LLM_MODEL})"
    )
    parser.add_argument(
        "--clear-cache", 
        action="store_true",
        help="Clear the progress cache to re-process all chunks from scratch"
    )
    parser.add_argument(
        "--dry-run", 
        action="store_true",
        help="Run the pipeline locally using simulated/mock insights (no LLM API keys needed)"
    )
    return parser.parse_args()

async def async_main():
    args = parse_args()
    
    # Override configuration with CLI arguments
    Config.INPUT_FILE = args.input
    Config.OUTPUT_FILE = args.output
    Config.CHUNK_SIZE = args.chunk_size
    Config.CHUNK_OVERLAP = args.overlap
    Config.LLM_PROVIDER = args.provider
    Config.LLM_MODEL = args.model
    
    # Handle cache clearing if requested
    if args.clear_cache:
        cache_path = Path(Config.PROGRESS_CACHE_FILE)
        if cache_path.exists():
            cache_path.unlink()
            logger.info("Cleared progress cache file.")
            
    # Validate configuration if not dry run
    if not args.dry_run:
        try:
            Config.validate()
        except Exception as e:
            logger.error(f"Configuration error: {e}")
            sys.exit(1)
        logger.info(f"Using Provider: {Config.LLM_PROVIDER.upper()} | Model: {Config.LLM_MODEL}")
    else:
        logger.info("Running in DRY-RUN mode (Simulated LLM responses)")
        
    logger.info(f"Reading file: {Config.INPUT_FILE}")
    
    # 1. Parse and Clean WhatsApp file
    try:
        messages = parse_whatsapp_file(Path(Config.INPUT_FILE))
        logger.info(f"Successfully parsed {len(messages)} user messages (excluding system messages and media).")
    except Exception as e:
        logger.critical(f"Failed to parse input file: {e}")
        sys.exit(1)
        
    if not messages:
        logger.warning("No messages parsed. Exiting.")
        sys.exit(0)
        
    # 2. Chunk Messages
    chunks = chunk_messages(messages, chunk_size=Config.CHUNK_SIZE, overlap=Config.CHUNK_OVERLAP)
    logger.info(f"Grouped messages into {len(chunks)} chunks (size: {Config.CHUNK_SIZE}, overlap: {Config.CHUNK_OVERLAP}).")
    
    # 3. Initialize Extractor
    try:
        extractor = LLMExtractor(dry_run=args.dry_run)
    except Exception as e:
        logger.critical(f"Failed to initialize LLM Extractor: {e}")
        sys.exit(1)
        
    # Check if there are cached entries
    cached_count = len(extractor.cache.get("processed_chunks", {}))
    if cached_count > 0:
        logger.info(f"Found {cached_count} already processed chunks in cache. Resuming progress.")
        
    # 4. Create tasks and process concurrently
    tasks = []
    for idx, chunk in enumerate(chunks):
        tasks.append(extractor.extract_insights_from_chunk(idx, chunk))
        
    logger.info(f"Extracting insights asynchronously with concurrency limit of {Config.MAX_CONCURRENT_REQUESTS}...")
    
    # tqdm.gather handles progress display and concurrent run
    chunk_results = await tqdm.gather(*tasks, desc="Processing chunks")
    
    # 5. Flatten results and prepare for export
    all_rows = []
    
    for idx, (chunk, insights) in enumerate(zip(chunks, chunk_results)):
        # Calculate date/time range for this chunk to provide better context in the CSV
        start_time = chunk[0]["timestamp"] if chunk else "N/A"
        end_time = chunk[-1]["timestamp"] if chunk else "N/A"
        
        for item in insights:
            # We add metadata about the chunk to each row
            row = {
                "chunk_id": idx,
                "start_time": start_time,
                "end_time": end_time,
                "category": item.get("category", ""),
                "problem_statement": item.get("problem_statement", ""),
                "severity_signal": item.get("severity_signal", ""),
                "original_quote": item.get("original_quote", "")
            }
            all_rows.append(row)
            
    # 6. Save to CSV
    if not all_rows:
        logger.warning("No insights extracted from the chat log. Output file will not be created.")
        return
        
    df = pd.DataFrame(all_rows)
    
    # Reorder columns to place categories/statements first
    columns_order = ["category", "problem_statement", "severity_signal", "original_quote", "chunk_id", "start_time", "end_time"]
    df = df[columns_order]
    
    try:
        # Use utf-8-sig encoding so Excel opens Hebrew text correctly
        df.to_csv(Config.OUTPUT_FILE, index=False, encoding="utf-8-sig")
        logger.info(f"Successfully exported {len(all_rows)} insights to: {Config.OUTPUT_FILE}")
        
        # Display short statistics
        logger.info("\n--- Category Breakdown ---")
        cat_counts = df["category"].value_counts().head(10)
        for cat, val in cat_counts.items():
            logger.info(f"  {cat}: {val}")
            
        logger.info("\n--- Severity Breakdown ---")
        sev_counts = df["severity_signal"].value_counts()
        for sev, val in sev_counts.items():
            logger.info(f"  {sev}: {val}")
            
    except Exception as e:
        logger.error(f"Failed to export results to CSV: {e}")

if __name__ == "__main__":
    asyncio.run(async_main())
