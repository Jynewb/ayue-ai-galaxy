# OpenClaw Windows一键安装脚本 (PowerShell) v2.0
# 作者：TAO小助理
# 功能：自动检测并安装Node.js + OpenClaw + 飞书配置

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "   OpenClaw 一键安装 for Windows" -ForegroundColor Cyan
Write-Host "   版本: v2.0 (完全自动)" -ForegroundColor Gray
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# 0. 设置执行策略（如果需要）
$currentPolicy = Get-ExecutionPolicy -Scope CurrentUser
if ($currentPolicy -eq "Restricted") {
    Write-Host "⚙️  正在设置执行策略..." -ForegroundColor Yellow
    Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser -Force
}

# 1. 检测/安装 Node.js
Write-Host "[1/6] 检测 Node.js..." -ForegroundColor Yellow

$nodeCheck = Get-Command node -ErrorAction SilentlyContinue
if ($nodeCheck) {
    $nodeVersion = node --version
    Write-Host "✅ Node.js 已安装: $nodeVersion" -ForegroundColor Green
} else {
    Write-Host "❌ 未检测到 Node.js" -ForegroundColor Red
    Write-Host "🚀 正在自动安装 Node.js..." -ForegroundColor Green
    
    # 方法1: 尝试用winget安装
    $wingetCheck = Get-Command winget -ErrorAction SilentlyContinue
    if ($wingetCheck) {
        Write-Host "   使用 winget 安装..." -ForegroundColor Gray
        winget install OpenJS.NodeJS.LTS --accept-source-agreements --accept-package-agreements
    } else {
        # 方法2: 下载安装包静默安装
        Write-Host "   下载 Node.js 安装包..." -ForegroundColor Gray
        $nodeUrl = "https://nodejs.org/dist/v20.11.1/node-v20.11.1-x64.msi"
        $installerPath = "$env:TEMP\node-installer.msi"
        
        try {
            Write-Host "   正在下载... (可能需要1-2分钟)" -ForegroundColor Gray
            Invoke-WebRequest -Uri $nodeUrl -OutFile $installerPath -UseBasicParsing
            
            Write-Host "   正在安装... (需要1-2分钟)" -ForegroundColor Gray
            Start-Process msiexec.exe -ArgumentList "/i `"$installerPath`" /quiet /norestart" -Wait -NoNewWindow
            
            Write-Host "   清理安装包..." -ForegroundColor Gray
            Remove-Item $installerPath -Force
            
            # 刷新环境变量
            $env:Path = [System.Environment]::GetEnvironmentVariable("Path","Machine") + ";" + [System.Environment]::GetEnvironmentVariable("Path","User")
            
            Write-Host "✅ Node.js 安装完成!" -ForegroundColor Green
        } catch {
            Write-Host "❌ 自动安装失败，请手动安装" -ForegroundColor Red
            Write-Host ""
            Write-Host "请手动完成以下步骤：" -ForegroundColor Yellow
            Write-Host "  1. 打开 https://nodejs.org/" -ForegroundColor White
            Write-Host "  2. 点击 'Windows Installer'" -ForegroundColor White
            Write-Host "  3. 运行安装包，一步步Next" -ForegroundColor White
            Write-Host "  4. 重新运行此脚本" -ForegroundColor White
            Write-Host ""
            Read-Host "按回车键退出"
            exit 1
        }
    }
}

# 2. 安装 pnpm
Write-Host ""
Write-Host "[2/6] 检测 pnpm..." -ForegroundColor Yellow

$pnpmCheck = Get-Command pnpm -ErrorAction SilentlyContinue
if ($pnpmCheck) {
    Write-Host "✅ pnpm 已安装" -ForegroundColor Green
} else {
    Write-Host "⚙️  正在安装 pnpm..." -ForegroundColor Yellow
    npm install -g pnpm
    Write-Host "✅ pnpm 安装完成" -ForegroundColor Green
}

# 3. 安装 OpenClaw
Write-Host ""
Write-Host "[3/6] 安装 OpenClaw..." -ForegroundColor Yellow

$openclawCheck = Get-Command openclaw -ErrorAction SilentlyContinue
if ($openclawCheck) {
    Write-Host "✅ OpenClaw 已安装" -ForegroundColor Green
    Write-Host "   正在更新到最新版本..." -ForegroundColor Gray
    npm install -g openclaw
} else {
    Write-Host "🚀 正在安装 OpenClaw..." -ForegroundColor Green
    npm install -g openclaw
    Write-Host "✅ OpenClaw 安装完成" -ForegroundColor Green
}

# 4. 配置飞书
Write-Host ""
Write-Host "[4/6] 配置飞书账号" -ForegroundColor Yellow
Write-Host ""
Write-Host "请在飞书开放平台创建应用：" -ForegroundColor White
Write-Host "  1. 打开 https://open.feishu.cn/" -ForegroundColor Gray
Write-Host "  2. 创建「企业自建应用」" -ForegroundColor Gray
Write-Host "  3. 获取 App ID 和 App Secret" -ForegroundColor Gray
Write-Host "  4. 添加权限：im:message:send_as_bot, im:message:receive_as_bot" -ForegroundColor Gray
Write-Host ""

$feishuAppId = Read-Host "请输入飞书 App ID (直接回车跳过)"
$feishuAppSecret = Read-Host "请输入飞书 App Secret (直接回车跳过)"

if ([string]::IsNullOrEmpty($feishuAppId)) { $feishuAppId = "" }
if ([string]::IsNullOrEmpty($feishuAppSecret)) { $feishuAppSecret = "" }

# 5. 生成配置文件
Write-Host ""
Write-Host "[5/6] 生成配置文件..." -ForegroundColor Yellow

$configDir = "$env:USERPROFILE\.openclaw"
if (!(Test-Path $configDir)) {
    New-Item -ItemType Directory -Path $configDir -Force | Out-Null
}

# 生成随机token
$randomToken = -join ((65..90) + (97..122) + (48..57) | Get-Random -Count 64 | ForEach-Object {[char]$_})

# 生成配置文件（streaming: false 解决长链接问题）
$configJson = @"
{
  "meta": {
    "lastTouchedVersion": "2026.3.2",
    "lastTouchedAt": "$(Get-Date -Format "yyyy-MM-ddTHH:mm:ss.fffZ")"
  },
  "channels": {
    "feishu": {
      "accounts": {
        "default": {
          "appId": "$feishuAppId",
          "appSecret": "$feishuAppSecret",
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
      "token": "$randomToken"
    }
  },
  "agents": {
    "defaults": {
      "model": {
        "primary": "minimax/MiniMax-M2.5-highspeed"
      },
      "workspace": "$configDir\workspace"
    }
  }
}
"@

$configJson | Out-File -FilePath "$configDir\openclaw.json" -Encoding UTF8
Write-Host "✅ 配置文件已生成" -ForegroundColor Green

# 6. 启动服务
Write-Host ""
Write-Host "[6/6] 启动服务..." -ForegroundColor Yellow

$openclawProcess = Get-Process -Name "openclaw-gateway" -ErrorAction SilentlyContinue
if ($openclawProcess) {
    Write-Host "⚠️  OpenClaw 已在运行中" -ForegroundColor Yellow
} else {
    Write-Host "🚀 正在启动服务..." -ForegroundColor Green
    Start-Process powershell -ArgumentList "-Command", "openclaw gateway start" -NoNewWindow
    Start-Sleep -Seconds 3
    Write-Host "✅ 服务已启动" -ForegroundColor Green
}

# 完成
Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "   🎉 安装完成！" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "📋 下一步：" -ForegroundColor White
Write-Host "  1. 打开飞书，开始聊天！" -ForegroundColor Gray
Write-Host "  2. 查看状态: openclaw status" -ForegroundColor Gray
Write-Host ""
Write-Host "📖 文档: https://docs.openclaw.ai" -ForegroundColor Gray
Write-Host ""

# 创建桌面说明文件
$desktopPath = [Environment]::GetFolderPath("Desktop")
$readmeContent = @"
🦞 OpenClaw 安装完成！

使用方法：
1. 打开终端（PowerShell或CMD）
2. 运行: openclaw gateway start
3. 打开飞书，开始聊天！

常见问题：
- 启动服务：openclaw gateway start
- 查看状态：openclaw status
- 停止服务：关闭终端窗口

文档：https://docs.openclaw.ai
"@

$readmeContent | Out-File -FilePath "$desktopPath\OpenClaw使用说明.txt" -Encoding UTF8

Write-Host "📄 已桌面创建说明文件" -ForegroundColor Green
Write-Host ""

Read-Host "按回车键退出"
