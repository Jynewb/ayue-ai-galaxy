#!/bin/bash

# OpenClaw 一键安装脚本 v2.0
# 作者：TAO小助理
# 用途：一键安装OpenClaw + 飞书配置

set -e

echo "========================================"
echo "   🦞 OpenClaw 一键安装脚本 v2.0"
echo "========================================"
echo ""

# 颜色定义
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# 检查是否Root用户（不应该用root）
if [ "$EUID" -eq 0 ]; then
    echo -e "${RED}⚠️  请不要使用root用户运行此脚本！${NC}"
    exit 1
fi

# 1. 检测Node.js
echo -e "${YELLOW}[1/5] 检测环境...${NC}"

if command -v node &> /dev/null; then
    NODE_VERSION=$(node -v)
    echo -e "✅ Node.js 已安装: $NODE_VERSION"
else
    echo -e "${RED}❌ 未检测到Node.js${NC}"
    echo ""
    echo "请先安装 Node.js："
    echo "  macOS: brew install node"
    echo "  Linux: curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash - && sudo apt-get install -y nodejs"
    echo "  Windows: https://nodejs.org/"
    exit 1
fi

# 检测pnpm
if command -v pnpm &> /dev/null; then
    echo -e "✅ pnpm 已安装"
else
    echo -e "${YELLOW}⚠️  未检测到pnpm，正在安装...${NC}"
    npm install -g pnpm
    echo -e "✅ pnpm 安装完成"
fi

# 2. 安装OpenClaw
echo ""
echo -e "${YELLOW}[2/5] 安装 OpenClaw...${NC}"

if command -v openclaw &> /dev/null; then
    echo -e "✅ OpenClaw 已安装"
    echo -e "${YELLOW}正在更新到最新版本...${NC}"
    npm install -g openclaw
else
    echo -e "✅ 正在全局安装 OpenClaw..."
    npm install -g openclaw
fi

# 3. 配置飞书
echo ""
echo -e "${YELLOW}[3/5] 配置飞书账号${NC}"
echo ""
echo "请在飞书开放平台创建应用获取 App ID 和 App Secret："
echo "  1. 打开 https://open.feishu.cn/"
echo "  2. 创建企业自建应用"
echo "  3. 获取 App ID 和 App Secret"
echo "  4. 添加应用权限：im:message:send_as_bot, im:message:receive_as_bot"
echo ""

read -p "请输入飞书 App ID (直接回车跳过): " FEISHU_APP_ID
read -p "请输入飞书 App Secret (直接回车跳过): " FEISHU_APP_SECRET

# 如果用户没输入，给默认值
FEISHU_APP_ID=${FEISHU_APP_ID:-""}
FEISHU_APP_SECRET=${FEISHU_APP_SECRET:-""}

# 4. 生成配置文件
echo ""
echo -e "${YELLOW}[4/5] 生成配置文件...${NC}"

CONFIG_DIR="$HOME/.openclaw"
mkdir -p "$CONFIG_DIR"

# 生成随机token
RANDOM_TOKEN=$(openssl rand -hex 32 2>/dev/null || cat /dev/urandom | tr -dc 'a-f0-9' | fold -w 64 | head -n 1)

# 检查是否已存在配置文件
if [ -f "$CONFIG_DIR/openclaw.json" ]; then
    echo -e "${YELLOW}⚠️  配置文件已存在，是否覆盖？${NC}"
    read -p "输入 'y' 确认覆盖，其他键跳过: " CONFIRM
    if [ "$CONFIRM" != "y" ]; then
        echo -e "✅ 跳过配置生成，使用现有配置"
    else
        # 备份旧配置
        cp "$CONFIG_DIR/openclaw.json" "$CONFIG_DIR/openclaw.json.backup.$(date +%s)"
        echo -e "✅ 已备份旧配置"
    fi
fi

# 生成openclaw.json（只在用户确认或文件不存在时）
if [ ! -f "$CONFIG_DIR/openclaw.json" ] || [ "$CONFIRM" = "y" ]; then
    cat > "$CONFIG_DIR/openclaw.json" << EOF
{
  "meta": {
    "lastTouchedVersion": "2026.3.2",
    "lastTouchedAt": "$(date -u +"%Y-%m-%dT%H:%M:%S.%3NZ")"
  },
  "channels": {
    "feishu": {
      "accounts": {
        "default": {
          "appId": "$FEISHU_APP_ID",
          "appSecret": "$FEISHU_APP_SECRET",
          "enabled": true,
          "streaming": false
        }
      },
      "dmPolicy": "pairing",
      "allowFrom": []
    }
  },
  "gateway": {
    "port": 18792,
    "mode": "local",
    "bind": "loopback",
    "auth": {
      "mode": "token",
      "token": "$RANDOM_TOKEN"
    }
  },
  "agents": {
    "defaults": {
      "model": {
        "primary": "minimax/MiniMax-M2.5-highspeed"
      },
      "workspace": "$HOME/.openclaw/workspace"
    }
  }
}
EOF
    echo -e "✅ 配置文件已生成: $CONFIG_DIR/openclaw.json"
else
    echo -e "✅ 保留现有配置"
fi

# 5. 启动服务
echo ""
echo -e "${YELLOW}[5/5] 启动 OpenClaw...${NC}"

# 检查是否已启动
if pgrep -f "openclaw-gateway" > /dev/null; then
    echo -e "⚠️  OpenClaw 已在运行中"
else
    echo -e "🚀 正在启动服务..."
    openclaw gateway start &
    sleep 3
    echo -e "✅ 服务已启动"
fi

echo ""
echo "========================================"
echo -e "   🎉 安装完成！"
echo "========================================"
echo ""
echo "📋 下一步操作："
echo "  1. 查看状态: openclaw status"
echo "  2. 打开飞书，开始聊天吧！"
echo ""
echo "📖 文档: https://docs.openclaw.ai"
echo ""
