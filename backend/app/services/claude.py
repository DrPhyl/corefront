import anthropic

from app.core.config import settings


VANILLA_HTML_PROMPT = """You are an expert frontend developer. Generate a complete, self-contained HTML file.

STRICT RULES:
- Output ONE complete HTML file starting with <!DOCTYPE html>
- Use ONLY inline CSS in a <style> tag - no external CSS files
- Use ONLY vanilla JavaScript in a <script> tag - no React, no Vue, no frameworks
- You MAY use Tailwind CSS via: <script src="https://cdn.tailwindcss.com"></script>
- NO import/export statements
- NO TypeScript
- NO npm packages
- Make it beautiful, responsive, and production-quality
- Include realistic placeholder content

Output ONLY the raw HTML. No markdown, no backticks, no explanation."""


REACT_SYSTEM_PROMPT = VANILLA_HTML_PROMPT
VUE_SYSTEM_PROMPT = VANILLA_HTML_PROMPT
SVELTE_SYSTEM_PROMPT = VANILLA_HTML_PROMPT
NEXTJS_SYSTEM_PROMPT = VANILLA_HTML_PROMPT
FASTAPI_SYSTEM_PROMPT = VANILLA_HTML_PROMPT


def generate_react_code(prompt: str) -> str:
    """Generate React code using Claude AI."""
    if not settings.ANTHROPIC_API_KEY:
        raise ValueError("ANTHROPIC_API_KEY is not configured")

    client = anthropic.Anthropic(api_key=settings.ANTHROPIC_API_KEY)

    message = client.messages.create(
        model="claude-sonnet-4-20250514",
        max_tokens=4096,
        system=REACT_SYSTEM_PROMPT,
        messages=[
            {
                "role": "user",
                "content": f"Create a React application for: {prompt}",
            }
        ],
    )

    return message.content[0].text


def generate_vue_code(prompt: str) -> str:
    """Generate Vue code using Claude AI."""
    if not settings.ANTHROPIC_API_KEY:
        raise ValueError("ANTHROPIC_API_KEY is not configured")

    client = anthropic.Anthropic(api_key=settings.ANTHROPIC_API_KEY)

    message = client.messages.create(
        model="claude-sonnet-4-20250514",
        max_tokens=4096,
        system=VUE_SYSTEM_PROMPT,
        messages=[
            {
                "role": "user",
                "content": f"Create a Vue application for: {prompt}",
            }
        ],
    )

    return message.content[0].text


def generate_svelte_code(prompt: str) -> str:
    """Generate Svelte-equivalent code using Claude AI."""
    if not settings.ANTHROPIC_API_KEY:
        raise ValueError("ANTHROPIC_API_KEY is not configured")

    client = anthropic.Anthropic(api_key=settings.ANTHROPIC_API_KEY)

    message = client.messages.create(
        model="claude-sonnet-4-20250514",
        max_tokens=4096,
        system=SVELTE_SYSTEM_PROMPT,
        messages=[
            {
                "role": "user",
                "content": f"Create a web application for: {prompt}",
            }
        ],
    )

    return message.content[0].text


def generate_nextjs_code(prompt: str) -> str:
    """Generate Next.js-style code using Claude AI."""
    if not settings.ANTHROPIC_API_KEY:
        raise ValueError("ANTHROPIC_API_KEY is not configured")

    client = anthropic.Anthropic(api_key=settings.ANTHROPIC_API_KEY)

    message = client.messages.create(
        model="claude-sonnet-4-20250514",
        max_tokens=4096,
        system=NEXTJS_SYSTEM_PROMPT,
        messages=[
            {
                "role": "user",
                "content": f"Create a Next.js-style application for: {prompt}",
            }
        ],
    )

    return message.content[0].text


def generate_fastapi_code(prompt: str) -> str:
    """Generate FastAPI documentation page using Claude AI."""
    if not settings.ANTHROPIC_API_KEY:
        raise ValueError("ANTHROPIC_API_KEY is not configured")

    client = anthropic.Anthropic(api_key=settings.ANTHROPIC_API_KEY)

    message = client.messages.create(
        model="claude-sonnet-4-20250514",
        max_tokens=4096,
        system=FASTAPI_SYSTEM_PROMPT,
        messages=[
            {
                "role": "user",
                "content": f"Create API documentation for: {prompt}",
            }
        ],
    )

    return message.content[0].text


def generate_code(prompt: str, framework: str = "react") -> str:
    """Generate code for the specified framework."""
    generators = {
        "react": generate_react_code,
        "vue": generate_vue_code,
        "svelte": generate_svelte_code,
        "nextjs": generate_nextjs_code,
        "fastapi": generate_fastapi_code,
    }

    generator = generators.get(framework.lower())
    if not generator:
        raise ValueError(f"Unsupported framework: {framework}")

    return generator(prompt)
