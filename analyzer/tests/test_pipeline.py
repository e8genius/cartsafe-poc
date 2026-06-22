import pytest
from pathlib import Path
from parser import parse_whatsapp_file, is_system_message, clean_unicode
from chunker import chunk_messages
from models import InsightItem, SeverityEnum, InsightExtraction

def test_clean_unicode():
    # Test stripping of directional characters
    raw_str = "\u200e10/9/24, 15:09 - \u200fMessage"
    cleaned = clean_unicode(raw_str)
    assert "\u200e" not in cleaned
    assert "\u200f" not in cleaned
    assert cleaned == "10/9/24, 15:09 - Message"

def test_is_system_message():
    assert is_system_message("Messages and calls are end-to-end encrypted. Learn more.")
    assert is_system_message("Amir Barhak joined using a group link.")
    assert is_system_message("Shirley Weissman added arbelg and +972 52-281-9952")
    assert is_system_message("You joined using this group's invite link")
    
    # User messages must have a colon separating sender and message
    assert not is_system_message("+972 50-777-8488: Hello world")
    assert not is_system_message("קארן רודנר:\nHello")

def test_parse_whatsapp_file(tmp_path):
    # Create mock chat file
    mock_file = tmp_path / "mock_chat.txt"
    content = (
        "\u200e10/9/24, 15:09 - Messages and calls are end-to-end encrypted.\n"
        "10/9/24, 15:55 - +972 50-777-8488: Hello, this is a message!\n"
        "10/9/24, 16:03 - Amir Barhak joined using a group link.\n"
        "10/9/24, 17:13 - +972 54-260-7122: First line of a message\n"
        "Second line of that same message\n"
        "10/12/24, 19:27 - קארן רודנר\n"
        "Simple as that: This is a multiline sender name!\n"
        "10/12/24, 20:00 - +972 50-696-6757: file.vcf (file attached)\n"
    )
    mock_file.write_text(content, encoding="utf-8")
    
    messages = parse_whatsapp_file(mock_file)
    
    assert len(messages) == 3
    
    # First message
    assert messages[0]["sender"] == "[User 1]"
    assert messages[0]["content"] == "Hello, this is a message!"
    assert messages[0]["timestamp"] == "10/9/24, 15:55"
    
    # Second message (multiline content)
    assert messages[1]["sender"] == "[User 2]"
    assert messages[1]["content"] == "First line of a message\nSecond line of that same message"
    assert messages[1]["timestamp"] == "10/9/24, 17:13"
    
    # Third message (multiline sender name)
    assert messages[2]["sender"] == "[User 3]"
    assert messages[2]["content"] == "This is a multiline sender name!"
    assert messages[2]["timestamp"] == "10/12/24, 19:27"

def test_chunk_messages():
    messages = [{"id": i} for i in range(100)]
    
    # Chunk size 40, overlap 10
    chunks = chunk_messages(messages, chunk_size=40, overlap=10)
    
    # Step size is 30 (40 - 10)
    # Chunk 0: 0-40
    # Chunk 1: 30-70
    # Chunk 2: 60-100
    # Chunk 3: 90-100 (size 10, which is <= overlap. Since len(chunk) <= overlap, it will be skipped by the loop constraint)
    assert len(chunks) == 3
    assert len(chunks[0]) == 40
    assert chunks[0][0]["id"] == 0
    assert chunks[0][-1]["id"] == 39
    
    assert len(chunks[1]) == 40
    assert chunks[1][0]["id"] == 30
    assert chunks[1][-1]["id"] == 69
    
    assert len(chunks[2]) == 40
    assert chunks[2][0]["id"] == 60
    assert chunks[2][-1]["id"] == 99

def test_pydantic_models():
    # Verify we can validate InsightItem and InsightExtraction
    item = InsightItem(
        category="Logistics",
        problem_statement="Shopify shipments are delayed.",
        severity_signal=SeverityEnum.HIGH,
        original_quote="יש עיכוב במשלוחים"
    )
    
    extraction = InsightExtraction(insights=[item])
    
    assert len(extraction.insights) == 1
    assert extraction.insights[0].category == "Logistics"
    assert extraction.insights[0].severity_signal == "High"
    assert extraction.insights[0].original_quote == "יש עיכוב במשלוחים"
