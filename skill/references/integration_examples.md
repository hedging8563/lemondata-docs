# Integration Code Templates

This document provides ready-to-use code templates for integrating LemonData APIs in various programming languages.

## Base Configuration

**Base URL**: `https://api.lemondata.cc`

**Authentication**: All requests require an `Authorization` header with a Bearer token.

---

## Python

### Basic Chat Completion

```python
from openai import OpenAI

client = OpenAI(
    api_key="sk-your-api-key",
    base_url="https://api.lemondata.cc/v1"
)

response = client.chat.completions.create(
    model="gpt-4o",
    messages=[
        {"role": "system", "content": "You are a helpful assistant."},
        {"role": "user", "content": "Hello!"}
    ]
)

print(response.choices[0].message.content)
```

### Streaming Response

```python
from openai import OpenAI

client = OpenAI(
    api_key="sk-your-api-key",
    base_url="https://api.lemondata.cc/v1"
)

stream = client.chat.completions.create(
    model="gpt-4o",
    messages=[{"role": "user", "content": "Tell me a story"}],
    stream=True
)

for chunk in stream:
    if chunk.choices[0].delta.content:
        print(chunk.choices[0].delta.content, end="", flush=True)
```

### Image Generation

```python
from openai import OpenAI

client = OpenAI(
    api_key="sk-your-api-key",
    base_url="https://api.lemondata.cc/v1"
)

response = client.images.generate(
    model="dall-e-3",
    prompt="A beautiful sunset over mountains",
    size="1024x1024",
    quality="standard",
    n=1
)

print(response.data[0].url)
```

### Text Embeddings

```python
from openai import OpenAI

client = OpenAI(
    api_key="sk-your-api-key",
    base_url="https://api.lemondata.cc/v1"
)

response = client.embeddings.create(
    model="text-embedding-3-small",
    input="Your text to embed"
)

print(response.data[0].embedding)
```

### Text to Speech

```python
from openai import OpenAI

client = OpenAI(
    api_key="sk-your-api-key",
    base_url="https://api.lemondata.cc/v1"
)

response = client.audio.speech.create(
    model="tts-1",
    voice="alloy",
    input="Hello, this is a test."
)

response.stream_to_file("output.mp3")
```

### Speech to Text

```python
from openai import OpenAI

client = OpenAI(
    api_key="sk-your-api-key",
    base_url="https://api.lemondata.cc/v1"
)

with open("audio.mp3", "rb") as audio_file:
    response = client.audio.transcriptions.create(
        model="whisper-1",
        file=audio_file
    )

print(response.text)
```

### Claude (Anthropic SDK)

```python
from anthropic import Anthropic

client = Anthropic(
    api_key="sk-your-api-key",
    base_url="https://api.lemondata.cc"  # No /v1 suffix
)

message = client.messages.create(
    model="claude-sonnet-4-5",
    max_tokens=1024,
    messages=[{"role": "user", "content": "Hello, Claude!"}]
)

print(message.content[0].text)
```

---

## JavaScript / Node.js

### Basic Chat Completion

```javascript
import OpenAI from 'openai';

const client = new OpenAI({
  apiKey: 'sk-your-api-key',
  baseURL: 'https://api.lemondata.cc/v1'
});

const response = await client.chat.completions.create({
  model: 'gpt-4o',
  messages: [
    { role: 'system', content: 'You are a helpful assistant.' },
    { role: 'user', content: 'Hello!' }
  ]
});

console.log(response.choices[0].message.content);
```

### Streaming Response

```javascript
import OpenAI from 'openai';

const client = new OpenAI({
  apiKey: 'sk-your-api-key',
  baseURL: 'https://api.lemondata.cc/v1'
});

const stream = await client.chat.completions.create({
  model: 'gpt-4o',
  messages: [{ role: 'user', content: 'Tell me a story' }],
  stream: true
});

for await (const chunk of stream) {
  const content = chunk.choices[0]?.delta?.content;
  if (content) process.stdout.write(content);
}
```

### Image Generation

```javascript
import OpenAI from 'openai';

const client = new OpenAI({
  apiKey: 'sk-your-api-key',
  baseURL: 'https://api.lemondata.cc/v1'
});

const response = await client.images.generate({
  model: 'dall-e-3',
  prompt: 'A beautiful sunset over mountains',
  size: '1024x1024',
  quality: 'standard',
  n: 1
});

console.log(response.data[0].url);
```

### Claude (Anthropic SDK)

```javascript
import Anthropic from '@anthropic-ai/sdk';

const client = new Anthropic({
  apiKey: 'sk-your-api-key',
  baseURL: 'https://api.lemondata.cc'  // No /v1 suffix
});

const message = await client.messages.create({
  model: 'claude-sonnet-4-5',
  max_tokens: 1024,
  messages: [{ role: 'user', content: 'Hello, Claude!' }]
});

console.log(message.content[0].text);
```

---

## Go

### Basic Chat Completion

```go
package main

import (
    "context"
    "fmt"
    "github.com/sashabaranov/go-openai"
)

func main() {
    config := openai.DefaultConfig("sk-your-api-key")
    config.BaseURL = "https://api.lemondata.cc/v1"
    client := openai.NewClientWithConfig(config)

    resp, err := client.CreateChatCompletion(
        context.Background(),
        openai.ChatCompletionRequest{
            Model: "gpt-4o",
            Messages: []openai.ChatCompletionMessage{
                {Role: openai.ChatMessageRoleUser, Content: "Hello!"},
            },
        },
    )
    if err != nil {
        panic(err)
    }

    fmt.Println(resp.Choices[0].Message.Content)
}
```

### Streaming Response

```go
package main

import (
    "context"
    "fmt"
    "io"
    "github.com/sashabaranov/go-openai"
)

func main() {
    config := openai.DefaultConfig("sk-your-api-key")
    config.BaseURL = "https://api.lemondata.cc/v1"
    client := openai.NewClientWithConfig(config)

    stream, err := client.CreateChatCompletionStream(
        context.Background(),
        openai.ChatCompletionRequest{
            Model:  "gpt-4o",
            Messages: []openai.ChatCompletionMessage{
                {Role: openai.ChatMessageRoleUser, Content: "Tell me a story"},
            },
            Stream: true,
        },
    )
    if err != nil {
        panic(err)
    }
    defer stream.Close()

    for {
        response, err := stream.Recv()
        if err == io.EOF {
            break
        }
        if err != nil {
            panic(err)
        }
        fmt.Print(response.Choices[0].Delta.Content)
    }
}
```

---

## PHP

### Basic Chat Completion

```php
<?php
$ch = curl_init('https://api.lemondata.cc/v1/chat/completions');

curl_setopt_array($ch, [
    CURLOPT_RETURNTRANSFER => true,
    CURLOPT_POST => true,
    CURLOPT_HTTPHEADER => [
        'Content-Type: application/json',
        'Authorization: Bearer sk-your-api-key'
    ],
    CURLOPT_POSTFIELDS => json_encode([
        'model' => 'gpt-4o',
        'messages' => [
            ['role' => 'user', 'content' => 'Hello!']
        ]
    ])
]);

$response = curl_exec($ch);
curl_close($ch);

$data = json_decode($response, true);
echo $data['choices'][0]['message']['content'];
```

### Image Generation

```php
<?php
$ch = curl_init('https://api.lemondata.cc/v1/images/generations');

curl_setopt_array($ch, [
    CURLOPT_RETURNTRANSFER => true,
    CURLOPT_POST => true,
    CURLOPT_HTTPHEADER => [
        'Content-Type: application/json',
        'Authorization: Bearer sk-your-api-key'
    ],
    CURLOPT_POSTFIELDS => json_encode([
        'model' => 'dall-e-3',
        'prompt' => 'A beautiful sunset over mountains',
        'size' => '1024x1024',
        'n' => 1
    ])
]);

$response = curl_exec($ch);
curl_close($ch);

$data = json_decode($response, true);
echo $data['data'][0]['url'];
```

---

## cURL

### Basic Chat Completion

```bash
curl -X POST "https://api.lemondata.cc/v1/chat/completions" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer sk-your-api-key" \
  -d '{
    "model": "gpt-4o",
    "messages": [
      {"role": "user", "content": "Hello!"}
    ]
  }'
```

### Image Generation

```bash
curl -X POST "https://api.lemondata.cc/v1/images/generations" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer sk-your-api-key" \
  -d '{
    "model": "dall-e-3",
    "prompt": "A beautiful sunset over mountains",
    "size": "1024x1024",
    "n": 1
  }'
```

### Text to Speech

```bash
curl -X POST "https://api.lemondata.cc/v1/audio/speech" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer sk-your-api-key" \
  -d '{
    "model": "tts-1",
    "voice": "alloy",
    "input": "Hello, this is a test."
  }' \
  --output output.mp3
```

---

## Integration Best Practices

### 1. Use Environment Variables

```python
import os
from openai import OpenAI

client = OpenAI(
    api_key=os.environ.get("LEMONDATA_API_KEY"),
    base_url="https://api.lemondata.cc/v1"
)
```

### 2. Add Error Handling

```python
from openai import OpenAI, APIError, RateLimitError

client = OpenAI(
    api_key="sk-your-api-key",
    base_url="https://api.lemondata.cc/v1"
)

try:
    response = client.chat.completions.create(
        model="gpt-4o",
        messages=[{"role": "user", "content": "Hello!"}]
    )
    print(response.choices[0].message.content)
except RateLimitError:
    print("Rate limit exceeded. Please wait and try again.")
except APIError as e:
    print(f"API error: {e}")
```

### 3. Set Appropriate Timeouts

```python
from openai import OpenAI

client = OpenAI(
    api_key="sk-your-api-key",
    base_url="https://api.lemondata.cc/v1",
    timeout=60.0  # 60 seconds timeout
)
```

### 4. Log API Calls for Debugging

```python
import logging
from openai import OpenAI

logging.basicConfig(level=logging.DEBUG)

client = OpenAI(
    api_key="sk-your-api-key",
    base_url="https://api.lemondata.cc/v1"
)
```
