# LemonData API Integration Skill for Claude Code

<p align="center">
  <img src="https://lemondata.cc/logo.svg" alt="LemonData Logo" width="120">
</p>

<p align="center">
  <strong>Quickly integrate hundreds of AI APIs with Claude Code</strong>
</p>

<p align="center">
  <a href="https://lemondata.cc">Website</a> •
  <a href="https://docs.lemondata.cc">Documentation</a> •
  <a href="https://lemondata.cc/en/models">Models</a> •
  <a href="https://lemondata.cc/#pricing">Pricing</a>
</p>

---

## 🎯 What Can This Skill Do?

When you want to use AI features in your code (like GPT-4, image generation, speech recognition, etc.), this skill will:

1. ✅ **Automatically search** LemonData's hundreds of APIs
2. ✅ **Find the best API** for your needs
3. ✅ **Generate complete, runnable code** in Python, JavaScript, Go, PHP, or cURL
4. ✅ **Configure your API Key** properly
5. ✅ **Provide usage examples** and best practices

**Just describe your needs in natural language, and get complete API integration code!**

## 📦 Installation

### Option 1: npx (Recommended)

```bash
npx add-skill hedging8563/lemondata-api-skill -y
```

This will automatically install the skill to all detected coding agents (Claude Code, Cursor, Copilot, etc.).

### Option 2: Share GitHub URL

1. Open **Claude Code**
2. Paste this link in the chat:
   ```
   https://github.com/hedging8563/lemondata-api-skill
   ```
3. Claude Code will automatically recognize and load the skill

### Option 3: Git Clone

```bash
# Personal installation (available in all projects)
git clone https://github.com/hedging8563/lemondata-api-skill.git ~/.claude/skills/lemondata-api-integration

# Or project-specific installation (shared with team via git)
git clone https://github.com/hedging8563/lemondata-api-skill.git .claude/skills/lemondata-api-integration
```

### Verify Installation

Ask Claude Code:
```
What skills are available?
```

If you see `lemondata-api-integration`, you're ready!

## 🚀 Quick Start

### Get Your API Key

1. Visit [lemondata.cc](https://lemondata.cc)
2. Sign in or create an account
3. Go to [Dashboard → API Keys](https://lemondata.cc/dashboard/api)
4. Create and copy your key (format: `sk-...`)

### Start Using

Just chat naturally with Claude Code:

```
I want to use GPT-4 in my Python project
```

```
How do I generate images with Midjourney in Node.js?
```

```
Integrate speech-to-text API in Go
```

## 🎨 Supported Features

| Feature Type | Examples |
|-------------|----------|
| 💬 Chat | GPT-4o, Claude, Gemini, DeepSeek |
| 🎨 Image Generation | Midjourney, Flux, Stable Diffusion |
| 🎬 Video Generation | Sora, Runway, Kling, Luma AI |
| 🎵 Music Generation | Suno |
| 🗿 3D Models | Tripo3D |
| 🎤 Audio | Text-to-Speech, Speech-to-Text |
| 📊 Embeddings | text-embedding-3 |
| 🔄 Rerank | bce-reranker, qwen3-rerank |

## 💡 Key Features

### OpenAI SDK Compatible

Most APIs work directly with OpenAI SDKs - just change the base URL:

```python
from openai import OpenAI

client = OpenAI(
    api_key="sk-your-api-key",
    base_url="https://api.lemondata.cc/v1"
)
```

### Native Format Support

- **Anthropic Messages API** for Claude models
- **Google Gemini API** for Gemini models

### Multi-Language Code Generation

- Python
- JavaScript / Node.js
- Go
- PHP
- cURL

## ⚠️ Security Best Practices

- ✅ Store API Key in environment variables
- ✅ Use backend frameworks for web apps
- ❌ Never expose API Key in frontend code
- ❌ Never commit API Key to Git

## 📚 Resources

- [API Documentation](https://docs.lemondata.cc)
- [Available Models](https://lemondata.cc/en/models)
- [Pricing](https://lemondata.cc/#pricing) (30% lower than official prices)
- [Dashboard](https://lemondata.cc/dashboard)

## 📄 License

MIT License - see [LICENSE](LICENSE) for details.

---

<p align="center">
  Made with ❤️ by <a href="https://lemondata.cc">LemonData</a>
</p>
