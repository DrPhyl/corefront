import anthropic

from app.core.config import settings


REACT_SYSTEM_PROMPT = """You are an expert frontend developer. Generate a single, complete,
self-contained HTML file that works directly in a browser without any build step.

Rules:
- Output ONE complete HTML file starting with <!DOCTYPE html>
- Use inline CSS in a <style> tag in the <head>
- Use vanilla JavaScript or include CDN links for libraries
- For React components, use: <script src="https://unpkg.com/react@18/umd/react.development.js"> and ReactDOM
- For Tailwind CSS, use: <script src="https://cdn.tailwindcss.com">
- NO import/export statements - use CDN scripts only
- NO TypeScript - use plain JavaScript
- Make it visually polished, responsive, and production-ready
- Include all content, styles, and logic in the single file

Output ONLY the HTML file content, starting with <!DOCTYPE html>
Do not include any explanation or markdown code blocks."""


VUE_SYSTEM_PROMPT = """You are an expert frontend developer. Generate a single, complete,
self-contained HTML file that works directly in a browser without any build step.

Rules:
- Output ONE complete HTML file starting with <!DOCTYPE html>
- Use Vue 3 via CDN: <script src="https://unpkg.com/vue@3/dist/vue.global.js">
- Use inline CSS in a <style> tag in the <head>
- For Tailwind CSS, use: <script src="https://cdn.tailwindcss.com">
- NO import/export statements - use CDN scripts only
- NO TypeScript - use plain JavaScript
- Use Vue's Options API or Composition API with setup()
- Make it visually polished, responsive, and production-ready
- Include all content, styles, and logic in the single file

Output ONLY the HTML file content, starting with <!DOCTYPE html>
Do not include any explanation or markdown code blocks."""


SVELTE_SYSTEM_PROMPT = """You are an expert frontend developer. Generate a single, complete,
self-contained HTML file that works directly in a browser without any build step.

Since Svelte requires compilation, create an equivalent vanilla JS implementation:
- Output ONE complete HTML file starting with <!DOCTYPE html>
- Use inline CSS in a <style> tag in the <head>
- Use vanilla JavaScript for reactivity (no framework needed)
- For Tailwind CSS, use: <script src="https://cdn.tailwindcss.com">
- Make it visually polished, responsive, and production-ready
- Include all content, styles, and logic in the single file
- Implement reactive behavior with vanilla JS event listeners and DOM manipulation

Output ONLY the HTML file content, starting with <!DOCTYPE html>
Do not include any explanation or markdown code blocks."""


NEXTJS_SYSTEM_PROMPT = """You are an expert frontend developer. Generate a single, complete,
self-contained HTML file that works directly in a browser without any build step.

Rules:
- Output ONE complete HTML file starting with <!DOCTYPE html>
- Use React via CDN: <script src="https://unpkg.com/react@18/umd/react.development.js">
- Use ReactDOM via CDN: <script src="https://unpkg.com/react-dom@18/umd/react-dom.development.js">
- Use Babel for JSX: <script src="https://unpkg.com/@babel/standalone/babel.min.js">
- For Tailwind CSS, use: <script src="https://cdn.tailwindcss.com">
- NO import/export statements - use CDN scripts only
- NO TypeScript - use plain JavaScript with JSX
- Simulate Next.js patterns (components, layouts) but in a single HTML file
- Make it visually polished, responsive, and production-ready
- Include all content, styles, and logic in the single file

Output ONLY the HTML file content, starting with <!DOCTYPE html>
Do not include any explanation or markdown code blocks."""


FASTAPI_SYSTEM_PROMPT = """You are an expert developer. Generate a single, complete,
self-contained HTML file that serves as an interactive API documentation/demo page.

Rules:
- Output ONE complete HTML file starting with <!DOCTYPE html>
- Create a beautiful API documentation page showing the endpoints that would be created
- Include interactive examples with sample request/response JSON
- Use inline CSS in a <style> tag in the <head>
- For Tailwind CSS, use: <script src="https://cdn.tailwindcss.com">
- Make it look like professional API docs (similar to Swagger/OpenAPI)
- Include endpoint descriptions, methods (GET, POST, etc.), parameters, and example responses
- Add copy-to-clipboard functionality for code examples
- Make it visually polished, responsive, and production-ready

Output ONLY the HTML file content, starting with <!DOCTYPE html>
Do not include any explanation or markdown code blocks."""


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
