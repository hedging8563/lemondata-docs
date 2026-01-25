#!/usr/bin/env python3
"""
LemonData API Search Script

Automatically fetches the latest model list from LemonData API and searches.
Extracts model name, category, pricing, and description.
"""

import re
import sys
import json
from typing import List, Dict, Optional

try:
    import requests
except ImportError:
    print("Please install the requests library: pip install requests")
    sys.exit(1)

# LemonData API endpoints
MODELS_API_URL = "https://api.lemondata.cc/v1/models"
PRICING_API_URL = "https://api.lemondata.cc/v1/pricing"


def fetch_models(api_key: Optional[str] = None) -> List[Dict]:
    """
    Fetch the latest model list from LemonData.

    Args:
        api_key: LemonData API Key (optional, some endpoints may require it)

    Returns:
        List of models

    Raises:
        Exception: If request fails
    """
    headers = {}
    if api_key:
        headers["Authorization"] = f"Bearer {api_key}"

    try:
        response = requests.get(MODELS_API_URL, headers=headers, timeout=30)
        response.raise_for_status()
        data = response.json()
        return data.get("data", [])
    except requests.exceptions.RequestException as e:
        raise Exception(f"Failed to fetch model list: {e}")


def fetch_pricing(api_key: Optional[str] = None) -> Dict[str, Dict]:
    """
    Fetch model pricing information.

    Args:
        api_key: LemonData API Key

    Returns:
        Model pricing dictionary {model_id: pricing_info}
    """
    headers = {}
    if api_key:
        headers["Authorization"] = f"Bearer {api_key}"

    try:
        response = requests.get(PRICING_API_URL, headers=headers, timeout=30)
        response.raise_for_status()
        data = response.json()
        pricing = {}
        for item in data.get("data", []):
            pricing[item["model"]] = item.get("pricing", {})
        return pricing
    except requests.exceptions.RequestException:
        return {}


def get_model_category(model_id: str, owned_by: str) -> str:
    """
    Infer category based on model ID and provider.

    Args:
        model_id: Model ID
        owned_by: Model provider

    Returns:
        Model category
    """
    model_lower = model_id.lower()

    # Video generation
    if any(x in model_lower for x in ["sora", "runway", "kling", "luma", "pika", "video"]):
        return "🎬 Video Generation"

    # Music generation
    if any(x in model_lower for x in ["suno", "music", "udio"]):
        return "🎵 Music Generation"

    # 3D models
    if any(x in model_lower for x in ["tripo", "3d", "mesh"]):
        return "🗿 3D Models"

    # Image generation
    if any(x in model_lower for x in ["dall-e", "dalle", "midjourney", "flux", "sd", "stable", "imagen", "ideogram"]):
        return "🎨 Image Generation"

    # Audio
    if any(x in model_lower for x in ["tts", "whisper", "speech", "audio"]):
        return "🎤 Audio Processing"

    # Embeddings
    if any(x in model_lower for x in ["embedding", "embed"]):
        return "📊 Embeddings"

    # Rerank
    if "rerank" in model_lower:
        return "🔄 Rerank"

    # Default to chat models
    return "💬 Chat Completion"


def enrich_models(models: List[Dict], pricing: Dict[str, Dict]) -> List[Dict]:
    """
    Enrich model information with category and pricing.

    Args:
        models: Model list
        pricing: Pricing information

    Returns:
        Enriched model list
    """
    enriched = []
    for model in models:
        model_id = model.get("id", "")
        owned_by = model.get("owned_by", "")
        price_info = pricing.get(model_id, {})

        enriched.append({
            "id": model_id,
            "owned_by": owned_by,
            "category": get_model_category(model_id, owned_by),
            "input_price": price_info.get("input_per_1m"),
            "output_price": price_info.get("output_per_1m"),
            "per_request": price_info.get("per_request"),
            "is_lock_price": price_info.get("is_lock_price", False)
        })
    return enriched


def search_models(
    models: List[Dict],
    keyword: Optional[str] = None,
    category: Optional[str] = None
) -> List[Dict]:
    """
    Search models.

    Args:
        models: Model list
        keyword: Keyword (searches in model ID and provider)
        category: Category keyword

    Returns:
        Matching model list
    """
    results = models

    if category:
        category_lower = category.lower()
        results = [
            m for m in results
            if category_lower in m.get("category", "").lower()
        ]

    if keyword:
        keyword_lower = keyword.lower()
        results = [
            m for m in results
            if keyword_lower in m.get("id", "").lower() or
               keyword_lower in m.get("owned_by", "").lower() or
               keyword_lower in m.get("category", "").lower()
        ]

    return results


def format_model_info(model: Dict, index: int = 0) -> str:
    """
    Format model information as readable text.

    Args:
        model: Model information dictionary
        index: Index number (0 means no index)

    Returns:
        Formatted text
    """
    prefix = f"{index}. " if index > 0 else ""

    # Format pricing
    if model.get("is_lock_price") and model.get("per_request"):
        price_str = f"${model['per_request']}/request"
    elif model.get("input_price"):
        price_str = f"Input ${model['input_price']}/1M, Output ${model.get('output_price', 'N/A')}/1M"
    else:
        price_str = "Pricing TBD"

    return f"""{prefix}**{model['id']}**
   - Category: {model['category']}
   - Provider: {model['owned_by']}
   - Pricing: {price_str}
   - Docs: https://docs.lemondata.cc/api-reference"""


def get_api_endpoint(category: str) -> str:
    """
    Return the corresponding API endpoint based on category.

    Args:
        category: Model category

    Returns:
        API endpoint path
    """
    endpoints = {
        "💬 Chat Completion": "/v1/chat/completions",
        "🎨 Image Generation": "/v1/images/generations",
        "🎬 Video Generation": "/v1/video/generations",
        "🎵 Music Generation": "/v1/music/generations",
        "🗿 3D Models": "/v1/3d/generations",
        "🎤 Audio Processing": "/v1/audio/speech or /v1/audio/transcriptions",
        "📊 Embeddings": "/v1/embeddings",
        "🔄 Rerank": "/v1/rerank"
    }
    return endpoints.get(category, "/v1/chat/completions")


def main():
    """
    Command line usage example.
    """
    if len(sys.argv) > 1 and sys.argv[1] in ['-h', '--help']:
        print("Usage:")
        print("  python search_api.py [keyword] [category]")
        print()
        print("Description:")
        print("  Script automatically fetches the latest model list from LemonData API")
        print()
        print("Examples:")
        print("  python search_api.py                    # List all models")
        print("  python search_api.py GPT                # Search for models containing GPT")
        print("  python search_api.py claude             # Search for Claude models")
        print("  python search_api.py '' video           # Search for video generation models")
        print("  python search_api.py flux image         # Search for Flux in image generation")
        sys.exit(0)

    keyword = sys.argv[1] if len(sys.argv) > 1 and sys.argv[1] else None
    category = sys.argv[2] if len(sys.argv) > 2 else None

    # Fetch the latest model list
    print("Fetching latest model list from LemonData...")
    try:
        models = fetch_models()
        pricing = fetch_pricing()
        models = enrich_models(models, pricing)
        print(f"✓ Success, found {len(models)} models")
        print()
    except Exception as e:
        print(f"✗ {e}")
        sys.exit(1)

    # Search
    if keyword or category:
        results = search_models(models, keyword, category)
        print(f"Search results: {len(results)} matching models")
        print()

        if len(results) == 0:
            print("No matching models found, try different keywords")
            print()
            print("Available categories:")
            categories = set(m["category"] for m in models)
            for cat in sorted(categories):
                count = len([m for m in models if m["category"] == cat])
                print(f"  - {cat} ({count} models)")
            sys.exit(0)

        for i, model in enumerate(results[:20], 1):
            print(format_model_info(model, i))
            print(f"   - API Endpoint: {get_api_endpoint(model['category'])}")
            print()

        if len(results) > 20:
            print(f"... {len(results) - 20} more models not shown")
            print("Use more specific keywords to filter")
    else:
        # Show category statistics
        print("Model category statistics:")
        print()
        categories = {}
        for m in models:
            cat = m["category"]
            if cat not in categories:
                categories[cat] = []
            categories[cat].append(m)

        for cat in sorted(categories.keys()):
            model_list = categories[cat]
            print(f"{cat} ({len(model_list)} models)")
            # Show first 5 examples
            for m in model_list[:5]:
                print(f"  - {m['id']}")
            if len(model_list) > 5:
                print(f"  ... {len(model_list) - 5} more")
            print()

        print(f"API Endpoint: {get_api_endpoint('💬 Chat Completion')}")
        print()
        print("Search for specific models using keywords, e.g.:")
        print("  python search_api.py GPT")
        print("  python search_api.py claude")
        print("  python search_api.py flux")


if __name__ == '__main__':
    main()
