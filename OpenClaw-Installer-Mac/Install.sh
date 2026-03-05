#!/bin/bash
echo "=========================================="
echo "   OpenClaw Auto Installer"
echo "=========================================="
echo ""
echo "Starting installation..."
echo ""

# 设置编码
export LANG=en_US.UTF-8

# 运行安装脚本
bash "$(dirname "$0")/openclaw-install-mac.sh"

echo ""
echo "Press Enter to exit..."
read
