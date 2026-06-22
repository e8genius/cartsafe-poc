from typing import List, Dict

def chunk_messages(
    messages: List[Dict], 
    chunk_size: int = 70, 
    overlap: int = 5
) -> List[List[Dict]]:
    """
    Groups a list of parsed messages into chunks of `chunk_size` messages,
    with an optional `overlap` between adjacent chunks to maintain context.
    """
    if not messages:
        return []
        
    if chunk_size <= 0:
        raise ValueError("chunk_size must be greater than 0")
        
    if overlap < 0 or overlap >= chunk_size:
        raise ValueError("overlap must be non-negative and less than chunk_size")
        
    chunks = []
    step = chunk_size - overlap
    
    for i in range(0, len(messages), step):
        chunk = messages[i:i + chunk_size]
        
        # If this is the last chunk and it's extremely small (e.g. fewer messages than the overlap size),
        # and we already have at least one chunk, we can skip it since those messages were already 
        # largely covered in the previous chunk.
        if len(chunk) <= overlap and len(chunks) > 0:
            break
            
        chunks.append(chunk)
        
    return chunks
