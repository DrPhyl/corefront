import anthropic

from app.core.config import settings


SYSTEM_PROMPT = """You are an expert React developer. Your task is to generate complete, production-ready React components based on user descriptions.

Guidelines:
- Generate clean, modern React code using functional components and hooks
- Use TypeScript for type safety
- Include proper imports at the top
- Use Tailwind CSS for styling
- Make components responsive and accessible
- Include helpful comments for complex logic
- Export the main component as default

Output format:
- Return ONLY the code, no explanations or markdown code blocks
- The code should be a complete, runnable React component file
- Include all necessary imports
"""


def generate_react_code(prompt: str) -> str:
    """Generate React code using Claude AI."""
    if not settings.ANTHROPIC_API_KEY:
        raise ValueError("ANTHROPIC_API_KEY is not configured")

    client = anthropic.Anthropic(api_key=settings.ANTHROPIC_API_KEY)

    message = client.messages.create(
        model="claude-sonnet-4-20250514",
        max_tokens=4096,
        system=SYSTEM_PROMPT,
        messages=[
            {
                "role": "user",
                "content": f"Create a React component for: {prompt}",
            }
        ],
    )

    # Extract the text content from the response
    return message.content[0].text


def generate_vue_code(prompt: str) -> str:
    """Generate Vue code using Claude AI."""
    if not settings.ANTHROPIC_API_KEY:
        raise ValueError("ANTHROPIC_API_KEY is not configured")

    client = anthropic.Anthropic(api_key=settings.ANTHROPIC_API_KEY)

    vue_system_prompt = """You are an expert Vue.js developer. Your task is to generate complete, production-ready Vue 3 components based on user descriptions.

Guidelines:
- Generate clean, modern Vue 3 code using Composition API
- Use TypeScript for type safety
- Use <script setup> syntax
- Use Tailwind CSS for styling
- Make components responsive and accessible
- Include helpful comments for complex logic

Output format:
- Return ONLY the code, no explanations or markdown code blocks
- The code should be a complete, runnable Vue Single File Component (.vue)
"""

    message = client.messages.create(
        model="claude-sonnet-4-20250514",
        max_tokens=4096,
        system=vue_system_prompt,
        messages=[
            {
                "role": "user",
                "content": f"Create a Vue component for: {prompt}",
            }
        ],
    )

    return message.content[0].text


def generate_svelte_code(prompt: str) -> str:
    """Generate Svelte code using Claude AI."""
    if not settings.ANTHROPIC_API_KEY:
        raise ValueError("ANTHROPIC_API_KEY is not configured")

    client = anthropic.Anthropic(api_key=settings.ANTHROPIC_API_KEY)

    svelte_system_prompt = """You are an expert Svelte developer. Your task is to generate complete, production-ready Svelte components based on user descriptions.

Guidelines:
- Generate clean, modern Svelte code
- Use TypeScript for type safety
- Use Tailwind CSS for styling
- Make components responsive and accessible
- Include helpful comments for complex logic

Output format:
- Return ONLY the code, no explanations or markdown code blocks
- The code should be a complete, runnable Svelte component file (.svelte)
"""

    message = client.messages.create(
        model="claude-sonnet-4-20250514",
        max_tokens=4096,
        system=svelte_system_prompt,
        messages=[
            {
                "role": "user",
                "content": f"Create a Svelte component for: {prompt}",
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
    }

    generator = generators.get(framework.lower())
    if not generator:
        raise ValueError(f"Unsupported framework: {framework}")

    return generator(prompt)
