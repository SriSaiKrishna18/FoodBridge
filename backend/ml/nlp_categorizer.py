"""
NLP Food Auto-Categorizer for FoodBridge
Extracts food type, items, and quantity from natural language text
"""
import re
from typing import List, Dict


# Food keyword mappings
FOOD_KEYWORDS = {
    "cooked": [
        "biryani", "curry", "rice", "dal", "dhal", "sambar", "rasam", "sabzi",
        "roti", "chapati", "naan", "paratha", "idli", "dosa", "upma", "poha",
        "khichdi", "pulao", "fried rice", "pasta", "noodles", "soup",
        "paneer", "chicken", "mutton", "fish", "egg", "omelette",
        "rajma", "chole", "aloo", "gobi", "palak", "meals", "lunch", "dinner",
        "cooked", "prepared", "homemade", "leftover", "thali", "combo"
    ],
    "bakery": [
        "bread", "cake", "pastry", "cookie", "biscuit", "muffin", "croissant",
        "donut", "bun", "roll", "sandwich", "pizza", "burger", "toast",
        "pie", "brownie", "cupcake", "scone", "bagel", "puff"
    ],
    "fruits_vegetables": [
        "apple", "banana", "orange", "mango", "grape", "watermelon", "papaya",
        "tomato", "potato", "onion", "carrot", "spinach", "cabbage", "beans",
        "fruit", "vegetable", "salad", "greens", "fresh", "organic",
        "cucumber", "lettuce", "broccoli", "corn", "peas"
    ],
    "dairy": [
        "milk", "cheese", "yogurt", "curd", "butter", "cream", "paneer",
        "buttermilk", "lassi", "ghee", "ice cream", "milkshake", "whey"
    ],
    "packaged": [
        "packaged", "sealed", "canned", "bottled", "packet", "box",
        "chips", "snacks", "biscuits", "instant", "ready to eat", "preserved",
        "jar", "tin", "tetra pack", "vacuum sealed"
    ],
    "beverages": [
        "juice", "tea", "coffee", "water", "soda", "drink", "shake",
        "smoothie", "lemonade", "chaas", "nimbu pani", "beverage"
    ],
    "raw": [
        "raw", "uncooked", "meat", "flour", "grain", "pulse", "lentil",
        "spice", "oil", "sugar", "salt", "atta", "maida", "sooji", "rava"
    ]
}

# Quantity patterns
QUANTITY_PATTERNS = [
    (r'(\d+\.?\d*)\s*(kg|kilogram|kilos)', 'kg'),
    (r'(\d+\.?\d*)\s*(g|gram|grams)', 'g'),
    (r'(\d+\.?\d*)\s*(l|liter|litre|litres|liters)', 'l'),
    (r'(\d+\.?\d*)\s*(ml|milliliter)', 'ml'),
    (r'(\d+\.?\d*)\s*(plate|plates|serving|servings|portion|portions)', 'servings'),
    (r'(\d+\.?\d*)\s*(piece|pieces|pcs|items|packs|packets|boxes|bags)', 'pieces'),
    (r'(\d+)\s*(dozen)', 'dozen'),
]


def categorize_food(text: str) -> Dict:
    """
    Analyze food description text and extract category, items, and quantity.
    
    Args:
        text: Natural language food description (e.g., "leftover biryani and bread from a wedding")
    
    Returns:
        dict with food_category, detected_items, estimated_quantity, confidence
    """
    text_lower = text.lower().strip()

    # Detect food items
    detected_items = []
    category_scores = {}

    for category, keywords in FOOD_KEYWORDS.items():
        score = 0
        for keyword in keywords:
            if keyword in text_lower:
                detected_items.append(keyword)
                score += 1
        if score > 0:
            category_scores[category] = score

    # Determine best category
    if category_scores:
        best_category = max(category_scores, key=category_scores.get)
        total_keywords = sum(category_scores.values())
        confidence = min(category_scores[best_category] / max(total_keywords, 1), 1.0)
    else:
        best_category = "other"
        confidence = 0.3

    # Remove duplicates from detected items
    detected_items = list(set(detected_items))

    # Extract quantity
    estimated_quantity = "Not specified"
    for pattern, unit in QUANTITY_PATTERNS:
        match = re.search(pattern, text_lower)
        if match:
            estimated_quantity = f"{match.group(1)} {unit}"
            break

    # If no specific quantity found, try to infer from serving words
    if estimated_quantity == "Not specified":
        serving_words = re.findall(r'(\d+)\s*(?:people|person|guests|members)', text_lower)
        if serving_words:
            estimated_quantity = f"~{serving_words[0]} servings"
        elif any(w in text_lower for w in ["large", "big", "lots", "plenty", "bulk"]):
            estimated_quantity = "Large quantity"
        elif any(w in text_lower for w in ["small", "little", "few", "some"]):
            estimated_quantity = "Small quantity"
        elif any(w in text_lower for w in ["medium", "moderate"]):
            estimated_quantity = "Medium quantity"

    # Boost confidence if quantity was detected
    if estimated_quantity != "Not specified":
        confidence = min(confidence + 0.1, 1.0)

    return {
        "food_category": best_category,
        "detected_items": detected_items[:10],  # Cap at 10 items
        "estimated_quantity": estimated_quantity,
        "confidence": round(confidence, 2),
    }
