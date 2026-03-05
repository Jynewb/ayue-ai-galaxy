#!/bin/bash
# OpenClaw Auto Installer for Mac
# 双击此文件即可运行

cd "$(dirname "$0")"

# 显示水印
echo ""
echo "########################################"
echo "#"
echo "#  ★★★ 阿悦很严格定制版 ★★★"
echo "#  仅供内部使用，禁止外传"
echo "#  仅供交流分享，抖音号：AIToker123"
echo "#"
echo "########################################"
echo ""

# 检查 Node.js
if ! command -v node &> /dev/null; then
    echo "[1/7] Installing Node.js..."
    brew install node
else
    echo "[OK] Node.js: $(node --version)"
fi

# 检查 pnpm
if ! command -v pnpm &> /dev/null; then
    echo "[2/7] Installing pnpm..."
    npm install -g pnpm
else
    echo "[OK] pnpm installed"
fi

# 安装 OpenClaw
if ! command -v openclaw &> /dev/null; then
    echo "[3/7] Installing OpenClaw..."
    npm install -g openclaw
else
    echo "[OK] OpenClaw installed"
fi

echo "[4/7] Configuration..."
echo ""

# 选择模型
echo "Select AI Model:"
echo "  1. MiniMax M2.5 (Standard)"
echo "  2. MiniMax M2.5 HighSpeed"
echo "  3. Qwen3.5 (Free)"
echo "  4. Kimi K2.5"
echo "  5. DeepSeek V3"
echo "  6. GPT-4o"
echo "  7. Claude 4"
echo "  8. Gemini 2.5 Pro"
echo "  9. GLM-5"
read -p "Enter number (1-9): " choice

case $choice in
    1) model_id="MiniMax-M2.5"; provider="minimax";;
    2) model_id="MiniMax-M2.5-highspeed"; provider="minimax";;
    3) model_id="coder-model"; provider="qwen-portal";;
    4) model_id="kimi-k2.5"; provider="kimi";;
    5) model_id="deepseek-chat"; provider="deepseek";;
    6) model_id="gpt-4o"; provider="openai";;
    7) model_id="claude-sonnet-4-20250514"; provider="anthropic";;
    8) model_id="gemini-2.0-pro-exp-02-05"; provider="google";;
    9) model_id="glm-5"; provider="zhipu";;
    *) model_id="MiniMax-M2.5"; provider="minimax";;
esac

echo "Selected: $model_id"
echo ""

# 输入 API Key
read -p "Enter API Key: " api_key
if [ -z "$api_key" ]; then
    echo "API Key required!"
    exit 1
fi

# 输入飞书 App ID
read -p "Enter Feishu App ID (skip for now): " feishu_app_id

# 输入飞书 App Secret  
read -p "Enter Feishu App Secret (skip for now): " feishu_app_secret

echo ""
echo "[5/7] Generating config..."

# 创建配置目录
config_dir="$HOME/.openclaw"
mkdir -p "$config_dir"

# 生成配置文件
cat > "$config_dir/openclaw.json" << EOF
{
  "meta": {"lastTouchedVersion": "2026.3.5"},
  "env": {"${provider^^}_API_KEY": "$api_key"},
  "models": {"providers": {"$provider": {"baseUrl": "https://api.minimaxi.com/anthropic", "apiKey": "$api_key", "api": "anthropic-messages", "models": [{"id": "$model_id", "name": "$model_id", "contextWindow": 128000, "maxTokens": 8192}]}}},
  "channels": {"feishu": {"accounts": {"default": {"appId": "$feishu_app_id", "appSecret": "$feishu_app_secret", "enabled": true, "streaming": false}}, "dmPolicy": "pairing", "allowFrom": []}},
  "gateway": {"port": 18792, "mode": "local", "bind": "loopback"},
  "agents": {"defaults": {"model": {"primary": "$provider/$model_id"}}}
}
EOF

echo "[OK] Config generated"

echo ""
echo "========================================"
echo "   SUCCESS! OpenClaw is ready!"
echo "========================================"
echo ""
echo "Now run: openclaw gateway"
echo "Then configure Feishu in developer portal!"

read -p "Press Enter to exit..."
