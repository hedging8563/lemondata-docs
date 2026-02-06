#!/usr/bin/env node
/**
 * Generate llms.txt and llms-full.txt for AI tooling
 *
 * Usage:
 *   node scripts/generate-llms-txt.mjs
 *
 * Output:
 *   - llms.txt: Concise summary with key links
 *   - llms-full.txt: Full documentation content
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DOCS_ROOT = path.join(__dirname, '..');

// Read docs.json to get navigation structure
const docsConfig = JSON.parse(fs.readFileSync(path.join(DOCS_ROOT, 'docs.json'), 'utf8'));

// Extract English pages from navigation
function getEnglishPages() {
  const pages = [];
  const enNav = docsConfig.navigation.languages.find(l => l.language === 'en');
  if (!enNav) return pages;

  for (const tab of enNav.tabs) {
    for (const group of tab.groups) {
      for (const page of group.pages) {
        pages.push({
          group: group.group,
          tab: tab.tab,
          path: page,
        });
      }
    }
  }
  return pages;
}

// Read and parse MDX file
function readMdxFile(pagePath) {
  const filePath = path.join(DOCS_ROOT, `${pagePath}.mdx`);
  if (!fs.existsSync(filePath)) {
    return null;
  }

  const content = fs.readFileSync(filePath, 'utf8');

  // Extract frontmatter
  const frontmatterMatch = content.match(/^---\n([\s\S]*?)\n---/);
  let title = pagePath;
  let description = '';

  if (frontmatterMatch) {
    const frontmatter = frontmatterMatch[1];
    const titleMatch = frontmatter.match(/title:\s*["']?([^"'\n]+)["']?/);
    const descMatch = frontmatter.match(/description:\s*["']?([^"'\n]+)["']?/);
    if (titleMatch) title = titleMatch[1];
    if (descMatch) description = descMatch[1];
  }

  // Remove frontmatter and convert MDX to plain text
  let body = content.replace(/^---\n[\s\S]*?\n---\n*/, '');

  // Remove MDX components
  body = body.replace(/<[A-Z][^>]*>[\s\S]*?<\/[A-Z][^>]*>/g, '');
  body = body.replace(/<[A-Z][^>]*\/>/g, '');
  body = body.replace(/<CodeGroup>[\s\S]*?<\/CodeGroup>/g, (match) => {
    // Extract code blocks from CodeGroup
    const codeBlocks = match.match(/```[\s\S]*?```/g) || [];
    return codeBlocks.slice(0, 1).join('\n\n'); // Keep first code block only
  });

  // Clean up
  body = body.replace(/<[^>]+>/g, ''); // Remove remaining HTML tags
  body = body.replace(/\n{3,}/g, '\n\n'); // Normalize newlines
  body = body.trim();

  return { title, description, body, path: pagePath };
}

// Generate llms.txt (concise version)
function generateLlmsTxt() {
  return `# LemonData

> Unified AI API Gateway - Access 300+ AI models through a single API

LemonData is an AI API aggregation platform providing unified access to models from OpenAI, Anthropic, Google, DeepSeek, and more.

## Quick Start

Base URL: https://api.lemondata.cc/v1
Authentication: Bearer token (API key from dashboard)

\`\`\`bash
curl https://api.lemondata.cc/v1/chat/completions \\
  -H "Authorization: Bearer sk-your-api-key" \\
  -H "Content-Type: application/json" \\
  -d '{"model": "gpt-4o", "messages": [{"role": "user", "content": "Hello!"}]}'
\`\`\`

## Documentation

- [Introduction](https://docs.lemondata.cc/introduction): Overview and key features
- [Quickstart](https://docs.lemondata.cc/quickstart): Get started in 2 minutes
- [Authentication](https://docs.lemondata.cc/authentication): API key management
- [API Formats](https://docs.lemondata.cc/guides/api-formats): OpenAI, Anthropic, Gemini formats
- [Streaming](https://docs.lemondata.cc/guides/streaming): Real-time responses
- [Caching](https://docs.lemondata.cc/guides/caching): Semantic caching for cost reduction
- [Error Handling](https://docs.lemondata.cc/guides/error-handling): Error codes and handling

## API Reference

- [Chat Completions](https://docs.lemondata.cc/api-reference/chat/create-completion): POST /v1/chat/completions
- [Messages (Anthropic)](https://docs.lemondata.cc/api-reference/messages/create-message): POST /v1/messages
- [Responses (OpenAI)](https://docs.lemondata.cc/api-reference/responses/create-response): POST /v1/responses
- [Gemini](https://docs.lemondata.cc/api-reference/gemini/generate-content): POST /v1beta/models/{model}:generateContent
- [Images](https://docs.lemondata.cc/api-reference/images/create-image): POST /v1/images/generations
- [Video](https://docs.lemondata.cc/api-reference/video/create-video): POST /v1/video/generations
- [Audio](https://docs.lemondata.cc/api-reference/audio/create-speech): POST /v1/audio/speech
- [Embeddings](https://docs.lemondata.cc/api-reference/embeddings/create-embedding): POST /v1/embeddings
- [Models](https://docs.lemondata.cc/api-reference/models/list-models): GET /v1/models

## Supported Capabilities

| Capability | Example Models |
|------------|----------------|
| Chat | GPT-4o, Claude 3.5, Gemini 2.0, DeepSeek R1 |
| Vision | GPT-4o, Claude 3.5 Sonnet, Gemini |
| Image Generation | DALL-E 3, Midjourney, Flux, Ideogram |
| Video Generation | Sora, Runway Gen-3, Kling, Vidu |
| Audio | Whisper, TTS-1, MiniMax |
| Embeddings | text-embedding-3-small |
| Music | Suno |
| 3D | Tripo3D |

## Integrations

- [Cursor](https://docs.lemondata.cc/integrations/cursor)
- [Claude Code](https://docs.lemondata.cc/integrations/claude-code)
- [OpenAI SDK](https://docs.lemondata.cc/integrations/openai-sdk)
- [Anthropic SDK](https://docs.lemondata.cc/integrations/anthropic-sdk)
- [LangChain](https://docs.lemondata.cc/integrations/langchain)
- [Vercel AI SDK](https://docs.lemondata.cc/integrations/vercel-ai-sdk)

## Key Features

- **OpenAI Compatible**: Drop-in replacement, just change base URL
- **Multi-Format API**: Use OpenAI, Anthropic, or Gemini formats with one API key
- **Semantic Caching**: Intelligent caching reduces costs and latency
- **Smart Routing**: Automatic failover and load balancing
- **Pay As You Go**: No subscriptions, competitive pricing

## Links

- Website: https://lemondata.cc
- Dashboard: https://lemondata.cc/dashboard
- Models: https://lemondata.cc/en/models
- API Status: https://lemondata.cc/status
- Support: support@lemondata.cc
`;
}

// Generate llms-full.txt (full documentation)
function generateLlmsFullTxt() {
  const pages = getEnglishPages();
  const sections = [];

  sections.push(`# LemonData - Full Documentation

> Unified AI API Gateway - Access 300+ AI models through a single API

Generated: ${new Date().toISOString()}
Source: https://docs.lemondata.cc

---
`);

  let currentTab = '';
  let currentGroup = '';

  for (const page of pages) {
    const doc = readMdxFile(page.path);
    if (!doc) continue;

    // Add tab header
    if (page.tab !== currentTab) {
      currentTab = page.tab;
      sections.push(`\n# ${currentTab}\n`);
    }

    // Add group header
    if (page.group !== currentGroup) {
      currentGroup = page.group;
      sections.push(`\n## ${currentGroup}\n`);
    }

    // Add page content
    sections.push(`### ${doc.title}

${doc.description ? `> ${doc.description}\n` : ''}
URL: https://docs.lemondata.cc/${page.path}

${doc.body}

---
`);
  }

  return sections.join('\n');
}

// Main
function main() {
  console.log('Generating llms.txt files...');

  // Generate llms.txt
  const llmsTxt = generateLlmsTxt();
  fs.writeFileSync(path.join(DOCS_ROOT, 'llms.txt'), llmsTxt);
  console.log('  ✓ llms.txt');

  // Generate llms-full.txt
  const llmsFullTxt = generateLlmsFullTxt();
  fs.writeFileSync(path.join(DOCS_ROOT, 'llms-full.txt'), llmsFullTxt);
  console.log('  ✓ llms-full.txt');

  // Stats
  const llmsTxtSize = (Buffer.byteLength(llmsTxt) / 1024).toFixed(1);
  const llmsFullTxtSize = (Buffer.byteLength(llmsFullTxt) / 1024).toFixed(1);
  console.log(`\nGenerated:`);
  console.log(`  llms.txt: ${llmsTxtSize} KB`);
  console.log(`  llms-full.txt: ${llmsFullTxtSize} KB`);
}

main();
