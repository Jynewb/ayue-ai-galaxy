﻿﻿# OpenClaw Windows Auto Installer v4.0 (Ultra Stable)
# Author: TAO小助理

# ========================================
# Custom Watermark - Edit below
$watermark = "★★★ 阿悦很严格定制版 ★★★"
$watermark2 = "仅供内部使用，禁止外传"
$watermark3 = "仅供交流分享，抖音号：AIToker123"
# ========================================

# 强制设置编码
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8
$OutputEncoding = [System.Text.Encoding]::UTF8

$ErrorActionPreference = "Stop"

# 显示水印
Write-Host ""
Write-Host "########################################" -ForegroundColor Red
Write-Host "#" -ForegroundColor Red
Write-Host "#  $watermark" -ForegroundColor Yellow
Write-Host "#  $watermark2" -ForegroundColor Yellow
Write-Host "#  $watermark3" -ForegroundColor Yellow
Write-Host "#" -ForegroundColor Red
Write-Host "########################################" -ForegroundColor Red
Write-Host ""
Write-Host ""

function Write-Step($num, $total, $msg) {
    Write-Host "[$num/$total] $msg" -ForegroundColor Yellow
}

function Write-Good($msg) {
    Write-Host "[OK] $msg" -ForegroundColor Green
}

function Write-Fail($msg) {
    Write-Host "[FAIL] $msg" -ForegroundColor Red
    Read-Host "Press Enter to exit"
    exit 1
}

function Test-Command($cmd) {
    try { $null = Get-Command $cmd -ErrorAction Stop; return $true } catch { return $false }
}

function Refresh-EnvPath {
    $env:Path = [System.Environment]::GetEnvironmentVariable("Path","Machine") + ";" + [System.Environment]::GetEnvironmentVariable("Path","User")
}

Write-Step 1 7 "Checking Node.js..."
if (Test-Command "node") {
    Write-Good "Node.js: $(node --version)"
} else {
    if (Test-Command "winget") {
        winget install OpenJS.NodeJS.LTS --accept-source-agreements --accept-package-agreements
        $waited = 0
        while (-not (Test-Command "node") -and $waited -lt 180) {
            Start-Sleep -Seconds 5; $waited += 5; Refresh-EnvPath
        }
        if (Test-Command "node") { Write-Good "Node.js installed: $(node --version)" }
        else { Write-Fail "Node.js installation failed" }
    } else { Write-Fail "winget not found" }
}
Refresh-EnvPath
if (-not (Test-Command "npm")) { Write-Fail "npm not available" }

Write-Step 2 7 "Setting npm mirror..."
npm config set registry https://registry.npmmirror.com 2>$null
Write-Good "npm mirror set"

Write-Step 3 7 "Checking pnpm..."
if (Test-Command "pnpm") { Write-Good "pnpm installed" }
else {
    npm install -g pnpm --registry=https://registry.npmmirror.com 2>$null
    Start-Sleep -Seconds 3; Refresh-EnvPath
    if (Test-Command "pnpm") { Write-Good "pnpm installed" }
    else { Write-Fail "pnpm installation failed" }
}

Write-Step 4 7 "Installing OpenClaw..."
if (Test-Command "openclaw") { Write-Good "OpenClaw installed" }
else {
    npm install -g openclaw --registry=https://registry.npmmirror.com 2>$null
    Start-Sleep -Seconds 5; Refresh-EnvPath
    if (Test-Command "openclaw") { Write-Good "OpenClaw installed" }
    else { Write-Fail "OpenClaw installation failed" }
}

Write-Step 5 7 "Stopping existing Gateway..."
Get-Process -Name "openclaw-gateway" -ErrorAction SilentlyContinue | Stop-Process -Force -ErrorAction SilentlyContinue
Start-Sleep -Seconds 2
Write-Good "Gateway stopped"

Write-Step 6 7 "Configuring AI Model..."
Write-Host ""
Write-Host "Select AI Model:" -ForegroundColor Cyan
Write-Host "  1. MiniMax M2.5 (Standard)"
Write-Host "  2. MiniMax M2.5 HighSpeed"
Write-Host "  3. Qwen3.5 (Free)"
Write-Host "  4. Kimi K2.5"
Write-Host "  5. DeepSeek V3"
Write-Host "  6. GPT-4o"
Write-Host "  7. Claude 4"
Write-Host "  8. Gemini 2.5 Pro"
Write-Host "  9. GLM-5"
$choice = Read-Host "Enter number (1-9)"
if ([string]::IsNullOrWhiteSpace($choice)) { $choice = "1" }

$models = @{
    "1" = @{id="MiniMax-M2.5"; name="MiniMax M2.5"; provider="minimax";}
    "2" = @{id="MiniMax-M2.5-highspeed"; name="MiniMax M2.5 HighSpeed"; provider="minimax";}
    "3" = @{id="coder-model"; name="Qwen3.5"; provider="qwen-portal"; free=$true;}
    "4" = @{id="kimi-k2.5"; name="Kimi K2.5"; provider="kimi";}
    "5" = @{id="deepseek-chat"; name="DeepSeek V3"; provider="deepseek";}
    "6" = @{id="gpt-4o"; name="GPT-4o"; provider="openai";}
    "7" = @{id="claude-sonnet-4-20250514"; name="Claude 4"; provider="anthropic";}
    "8" = @{id="gemini-2.0-pro-exp-02-05"; name="Gemini 2.5 Pro"; provider="google";}
    "9" = @{id="glm-5"; name="GLM-5"; provider="zhipu";}
}
$cfg = $models[$choice]; if (-not $cfg) { $cfg = $models["1"] }
Write-Host "Selected: $($cfg.name)" -ForegroundColor Green

if ($cfg.free) { $apiKey = "qwen-oauth" }
else {
    $apiKey = Read-Host "Enter $($cfg.name) API Key"
    if ([string]::IsNullOrWhiteSpace($apiKey)) { Write-Fail "API Key required" }
}

Write-Step 7 7 "Configuring Feishu..."
$feishuAppId = Read-Host "Enter Feishu App ID"
$feishuAppSecret = Read-Host "Enter Feishu App Secret"
if ([string]::IsNullOrWhiteSpace($feishuAppId)) { Write-Fail "App ID required" }

$configDir = "$env:USERPROFILE\.openclaw"
if (-not (Test-Path $configDir)) { New-Item -ItemType Directory -Path $configDir -Force | Out-Null }
$token = -join ((65..90) + (97..122) + (48..57) | Get-Random -Count 64 | ForEach-Object {[char]$_})

$baseUrls = @{
    "minimax"="https://api.minimaxi.com/anthropic"; "anthropic-messages"="anthropic-messages"
    "qwen-portal"="https://portal.qwen.ai/v1"; "openai-completions"="openai-completions"
    "kimi"="https://api.kimi.com/coding/v1"
    "deepseek"="https://api.deepseek.com/v1"
    "openai"="https://api.openai.com/v1"
    "anthropic"="https://api.anthropic.com/v1"
    "google"="https://generativelanguage.googleapis.com/v1beta"
    "zhipu"="https://open.bigmodel.cn/api/paas/v4"
}
$baseUrl = $baseUrls[$cfg.provider]
$api = if ($cfg.provider -eq "minimax" -or $cfg.provider -eq "anthropic") { "anthropic-messages" } else { "openai-completions" }
$primaryModel = "$($cfg.provider)/$($cfg.id)"

$envStr = if ($cfg.provider -eq "openai") { '"env": {"OPENAI_API_KEY": "' + $apiKey + '"},' }
elseif ($cfg.provider -eq "anthropic") { '"env": {"ANTHROPIC_API_KEY": "' + $apiKey + '"},' }
elseif ($cfg.provider -eq "google") { '"env": {"GEMINI_API_KEY": "' + $apiKey + '"},' }
elseif ($cfg.provider -eq "deepseek") { '"env": {"DEEPSEEK_API_KEY": "' + $apiKey + '"},' }
elseif ($cfg.provider -eq "minimax") { '"env": {"MINIMAX_API_KEY": "' + $apiKey + '"},' }
else { "" }

$configJson = @"
{
  "meta": {"lastTouchedVersion": "2026.3.5"},
  $envStr
  "models": {"providers": {"$($cfg.provider)": {"baseUrl": "$baseUrl", "apiKey": "$apiKey", "api": "$api", "models": [{"id": "$($cfg.id)", "name": "$($cfg.name)", "contextWindow": 128000, "maxTokens": 8192}]}}},
  "channels": {"feishu": {"accounts": {"default": {"appId": "$feishuAppId", "appSecret": "$feishuAppSecret", "enabled": true, "streaming": false}}, "dmPolicy": "pairing", "allowFrom": []}},
  "gateway": {"port": 18792, "mode": "local", "bind": "loopback", "auth": {"mode": "token", "token": "$token"}},
  "agents": {"defaults": {"model": {"primary": "$primaryModel"}, "workspace": "$configDir\workspace"}}
}
"@
$configJson | Out-File -FilePath "$configDir\openclaw.json" -Encoding UTF8
Write-Good "Config generated"

Write-Host "Starting Gateway..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-Command", "openclaw gateway" -NoNewWindow
Start-Sleep -Seconds 5

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "   SUCCESS! OpenClaw is ready!" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Model: $($cfg.name)"
Write-Host "Now configure Feishu in developer portal!" -ForegroundColor Yellow
Read-Host "Press Enter to exit"
