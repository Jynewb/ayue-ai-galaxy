# AI工具教程库

> 本地运行AI模型工具教程集合 | 适合阿悦账号定位：工具教程类内容

---

## 📦 本地大模型运行工具

### 1. Ollama ⭐⭐⭐⭐⭐
**一句话简介**：在本地运行Kimi、GLM、MiniMax、DeepSeek等大模型

**官网**：https://ollama.com

**GitHub**：https://github.com/ollama/ollama

**Stars**：150K+

**安装教程**：
```bash
# macOS
curl -fsSL https://ollama.com/install.sh | sh

# Linux
curl -fsSL https://ollama.com/install.sh | sh

# Windows
irm https://ollama.com/install.ps1 | iex
```

**运行模型**：
```bash
# 查看可用模型
ollama list

# 运行模型
ollama run gemma3
ollama run deepseek
ollama run qwen
ollama run llama3
ollama run mistral
```

**API调用**：
```bash
curl http://localhost:11434/api/chat -d '{
  "model": "gemma3",
  "messages": [{"role": "user", "content": "Hello"}],
  "stream": false
}'
```

**Python调用**：
```python
pip install ollama
from ollama import chat
response = chat(model='gemma3', messages=[
  {'role': 'user', 'content': 'Why is the sky blue?'},
])
print(response.message.content)
```

**JavaScript调用**：
```javascript
npm i ollama
import ollama from "ollama";
const response = await ollama.chat({
  model: "gemma3",
  messages: [{ role: "user", content: "Hello" }],
});
console.log(response.message.content);
```

**Docker部署**：
```bash
docker run -d -v ollama:/root/.ollama -p 11434:11434 --name ollama ollama/ollama
```

**相关工具（Web界面）**：
- Open WebUI - 网页界面，功能最全
- Lobe Chat - 现代聊天框架
- AnythingLLM - 全平台客户端

---

### 2. LM Studio ⭐⭐⭐⭐
**一句话简介**：本地运行AI模型，图形界面，易上手

**官网**：https://lmstudio.ai

**特点**：
- 图形界面友好
- 支持Kimi、Claude、GPT等
- 模型下载管理方便

**安装教程**：
```bash
# macOS / Linux
curl -fsSL https://lmstudio.ai/install.sh | bash

# Windows
irm https://lmstudio.ai/install.ps1 | iex
```

**无GUI部署（llmster）**：
```bash
curl -fsSL https://lmstudio.ai/install.sh | bash
```

---

### 3. Jan ⭐⭐⭐⭐
**一句话简介**：开源ChatGPT替代，5.2M下载

**官网**：https://jan.ai

**Stars**：25K+

**特点**：
- 完全开源免费
- 支持连接在线模型（OpenAI、Claude、Gemini）
- 支持本地模型（Llama、Mistral、Qwen、DeepSeek、Gemma、Kimi）
- 连接器：Gmail、Notion、Figma、YouTube、Slack、Google Drive、Jira
- 即将支持Memory功能

**下载**：https://jan.ai/download

---

### 4. Text Generation Webui ⭐⭐⭐⭐
**一句话简介**：最权威的本地AI Web UI，老牌稳定

**GitHub**：https://github.com/oobabooga/text-generation-webui

**Stars**：48K+

**特点**：
- 功能强大的Web界面
- 支持多种模型
- 扩展性强
- 社区活跃

---

## 🧠 RAG知识库工具

### 5. MaxKB ⭐⭐⭐⭐⭐
**一句话简介**：开箱即用的RAG聊天机器人

**GitHub**：https://github.com/1Panel-dev/MaxKB/

**Stars**：18K+

**特点**：
- 一键部署
- 支持多种大模型
- 支持向量数据库
- 企业级功能
- 基于1Panel运维面板

**Docker部署**：
```bash
# 方式1：1Panel一键部署（推荐）
# 方式2：Docker部署
docker run -d --name maxkb -p 8080:8080 -v maxkb_data:/data 1panel/maxkb
```

---

### 6. RAGFlow ⭐⭐⭐⭐
**一句话简介**：基于深度文档理解的RAG引擎

**GitHub**：https://github.com/infiniflow/ragflow

**Stars**：22K+

**特点**：
- 深度文档理解
- 支持多种文件格式
- 可视化知识库管理

---

### 7. AnythingLLM ⭐⭐⭐⭐
**一句话简介**：全平台AI应用，RAG+聊天

**GitHub**：https://github.com/Mintplex-Labs/anything-llm

**Stars**：28K+

**特点**：
- Mac/Windows/Linux全平台
- RAG功能
- 多模型支持
- 易于部署

---

## 💻 代码编辑器集成

### 8. Cline ⭐⭐⭐⭐⭐
**一句话简介**：VS Code扩展，AI编程agent

**GitHub**：https://github.com/cline/cline

**Stars**：15K+

**官网**：https://cline.bot

**特点**：
- 基于Claude Sonnet的agentic编程能力
- 自动创建/编辑文件
- 执行终端命令
- 使用浏览器进行测试
- MCP协议扩展工具

**安装**：VS Code扩展商店搜索"Cline"

**支持模型**：
- OpenAI
- Anthropic (Claude)
- Google Gemini
- AWS Bedrock
- Azure
- 本地模型（LM Studio/Ollama）

---

### 9. Continue ⭐⭐⭐⭐
**一句话简介**：开源AI代码助手，支持多IDE

**GitHub**：https://github.com/continuedev/continue

**Stars**：22K+

**特点**：
- 支持VS Code、JetBrains等
- 自定义模型
- 本地和云端模型

---

### 10. Void / OpenCode ⭐⭐⭐⭐
**一句话简介**：开源AI代码编辑器，Cursor替代

**GitHub**：https://github.com/voideditor/void

**特点**：
- 开源免费
- AI代码编辑
- Cursor替代方案

---

## 🔧 模型微调工具

### 11. Unsloth ⭐⭐⭐⭐⭐
**一句话简介**：加速微调LLM，30倍速度提升

**官网**：https://unsloth.ai

**GitHub**：https://github.com/unslothai/unsloth

**Stars**：28K+

**特点**：
- 30倍快于Flash Attention 2
- 90%更少显存占用
- 支持NVIDIA T4到H100
- 支持AMD和Intel GPU

**免费使用**：
- Google Colab免费GPU
- Kaggle Notebooks

**定价**：
- 免费版：开源标准版
- Pro版：2.5倍加速
- 企业版：30倍加速+多节点支持

---

## 🌐 Web界面

### 12. Open WebUI ⭐⭐⭐⭐⭐
**一句话简介**：功能最全的自托管AI界面

**GitHub**：https://github.com/open-webui/open-webui

**Stars**：35K+

**官网**：https://openwebui.com

**特点**：
- Docker一键部署
- Ollama/OpenAI API集成
- RAG知识库（9种向量数据库）
- 语音/视频通话
- 图像生成集成（DALL-E、ComfyUI）
- 多模型对话
- 权限管理
- 支持PWA移动端

**Docker部署**：
```bash
# 基础部署
docker run -d -p 3000:8080 \
  --add-host=host.docker.internal:host-gateway \
  -v open-webui:/app/backend/data \
  --name open-webui \
  ghcr.io/open-webui/open-webui:main

# 带Ollama
docker run -d --gpus all -p 3000:8080 \
  -v ollama:/root/.ollama \
  -v open-webui:/app/backend/data \
  --name open-webui \
  ghcr.io/open-webui/open-webui:ollama
```

**pip安装**：
```bash
pip install open-webui
python -m open_webui serve
```

---

### 13. Lobe Chat ⭐⭐⭐⭐
**一句话简介**：现代聊天框架，插件生态

**GitHub**：https://github.com/lobehub/lobe-chat

**Stars**：30K+

**特点**：
-现代化UI
- 插件系统丰富
- 支持Ollama

---

### 14. LibreChat ⭐⭐⭐⭐
**一句话简介**：增强版ChatGPT，多提供商支持

**GitHub**：https://github.com/danny-avila/LibreChat

**Stars**：20K+

---

### 15. NextChat ⭐⭐⭐⭐
**一句话简介**：跨平台ChatGPT UI

**GitHub**：https://github.com/ChatGPTNextWeb/ChatGPT-Next-Web

**Stars**：35K+

---

## 🔌 开发者SDK

### 16. LangChain
**官网**：https://python.langchain.com

**Python调用Ollama**：
```python
from langchain.chat_models import ChatOllama
llm = ChatOllama(model="gemma3")
response = llm.invoke("Hello")
```

**文档**：https://python.langchain.com/docs/integrations/chat/ollama/

---

### 17. LlamaIndex
**官网**：https://docs.llamaindex.ai

**用途**：LLM应用的数据框架

**文档**：https://docs.llamaindex.ai/en/stable/examples/llm/ollama/

---

### 18. LiteLLM ⭐⭐⭐⭐
**一句话简介**：统一API for 100+ LLM提供商

**GitHub**：https://github.com/BerriAI/litellm

**Stars**：15K+

---

## 📚 学习资源

### Ollama文档
- CLI参考：https://docs.ollama.com/cli
- API参考：https://docs.ollama.com/api
- 导入模型：https://docs.ollama.com/import
- Modelfile：https://docs.ollama.com/modelfile

### 模型库
- 全部模型：https://ollama.com/library

---

## 🎯 选题建议（适合阿悦账号）

| 选题 | 评分 | 理由 |
|------|------|------|
| Ollama本地部署教程 | ⭐⭐⭐⭐⭐ | 刚需、爆款潜力 |
| Cline编程agent教程 | ⭐⭐⭐⭐⭐ | 编程类热门 |
| Open WebUI搭建个人AI | ⭐⭐⭐⭐ | 功能全、可做系列 |
| Unsloth微调教程 | ⭐⭐⭐⭐ | 技术深度够 |
| MaxKB知识库搭建 | ⭐⭐⭐⭐ | 企业需求大 |
| Jan vs ChatGPT对比 | ⭐⭐⭐ | 有争议性 |

---

*最后更新：2026-03-04*
*适合内容方向：工具教程、操作指南、对比测评*
