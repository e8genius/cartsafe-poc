import re
from pathlib import Path
from typing import List, Dict, Tuple, Optional

# Match WhatsApp message header: e.g. "10/9/24, 15:55 - "
# We allow optional Unicode directional marks like \u200e (left-to-right mark) or \u200f (right-to-left mark) at the start
MSG_START_RE = re.compile(
    r"^[\u200e\u200f\u202a-\u202e]*(\d{1,2}/\d{1,2}/\d{2,4},\s\d{2}:\d{2})\s-\s(.*)$"
)

# Common media/file indicators to skip
MEDIA_INDICATORS = [
    r".*\.vcf \(file attached\)",
    r"<Media omitted>",
    r"<מדיה הושמטה>",
    r"image omitted",
    r"video omitted",
    r"audio omitted",
    r"sticker omitted",
    r"document omitted",
    r"gif omitted"
]
MEDIA_RE = re.compile("|".join(MEDIA_INDICATORS), re.IGNORECASE)

# System message keywords (English)
SYSTEM_KEYWORDS = [
    "created group",
    "joined using this group's invite link",
    "joined using a group link",
    "was added",
    "added",
    "left",
    "changed the subject",
    "changed the group description",
    "changed this group's",
    "Messages and calls are end-to-end encrypted"
]

def is_system_message(text: str) -> bool:
    """Checks if a message block is a system message."""
    # If there is no colon in the text, it's likely a system message (no sender)
    if ":" not in text:
        return True
    
    # Even if there is a colon, check if the sender part contains system keywords
    # (e.g. "Shirley Weissman added arbelg and +972 52-281-9952" has no colon, but just in case)
    first_colon = text.find(":")
    sender_candidate = text[:first_colon]
    for kw in SYSTEM_KEYWORDS:
        if kw in sender_candidate:
            return True
            
    return False

def clean_unicode(text: str) -> str:
    """Strips directional Unicode control characters."""
    return re.sub(r"[\u200e\u200f\u202a-\u202e]", "", text)

def parse_whatsapp_file(file_path: Path) -> List[Dict]:
    """
    Parses a WhatsApp export text file into message blocks.
    Handles multiline messages, multiline sender names, and cleans Unicode marks.
    """
    if not file_path.exists():
        raise FileNotFoundError(f"WhatsApp chat file not found at: {file_path}")
        
    raw_lines = file_path.read_text(encoding="utf-8").splitlines()
    
    raw_messages = []
    current_msg = None
    
    for line in raw_lines:
        match = MSG_START_RE.match(line)
        if match:
            if current_msg:
                raw_messages.append(current_msg)
            timestamp = match.group(1)
            rest = clean_unicode(match.group(2))
            current_msg = {
                "timestamp": timestamp,
                "raw_text": rest,
            }
        else:
            if current_msg:
                cleaned_line = clean_unicode(line)
                current_msg["raw_text"] += "\n" + cleaned_line
                
    if current_msg:
        raw_messages.append(current_msg)
        
    # Process and filter messages
    parsed_messages = []
    sender_map = {} # Maps original sender string to "User N"
    
    for msg in raw_messages:
        text = msg["raw_text"]
        
        # 1. Filter out system messages
        if is_system_message(text):
            continue
            
        # 2. Extract sender and content by splitting on the first colon
        colon_idx = text.find(":")
        sender = text[:colon_idx].strip()
        content = text[colon_idx + 1:].strip()
        
        # 3. Filter out media attachments/omitted messages
        if MEDIA_RE.match(content) or not content:
            continue
            
        # 4. Anonymize sender (Option B)
        if sender not in sender_map:
            sender_map[sender] = f"User {len(sender_map) + 1}"
        anonymized_sender = f"[{sender_map[sender]}]"
        
        parsed_messages.append({
            "timestamp": msg["timestamp"],
            "sender": anonymized_sender,
            "content": content
        })
        
    return parsed_messages
