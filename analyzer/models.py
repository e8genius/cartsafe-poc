from enum import Enum
from typing import List
from pydantic import BaseModel, Field

class SeverityEnum(str, Enum):
    HIGH = "High"
    MEDIUM = "Medium"
    LOW = "Low"

class InsightItem(BaseModel):
    category: str = Field(
        description="Business area category of the problem (e.g., Logistics, Shopify Bugs, Marketing, Payments, Customer Service, Inventory, etc.)"
    )
    problem_statement: str = Field(
        description="A concise description in English of the user's need, pain point, or problem extracted from the messages."
    )
    severity_signal: SeverityEnum = Field(
        description="The severity level (High, Medium, or Low) based on the frequency of the issue or the emotional tone of the discussion in the chunk."
    )
    original_quote: str = Field(
        description="A short snippet of the original Hebrew message demonstrating this problem, to keep the context real and verifiable."
    )

class InsightExtraction(BaseModel):
    insights: List[InsightItem] = Field(
        description="A list of product insights, pain points, or problems discussed in the message chunk."
    )
