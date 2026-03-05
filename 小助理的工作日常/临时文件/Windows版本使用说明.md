# 🦞 OpenClaw Windows一键安装

> 一键安装脚本 for Windows

---

## 📦 包含文件

1. `openclaw-install-windows.ps1` - 一键安装脚本
2. `使用说明.txt` - 简单使用指南

---

## 🚀 使用步骤（只需3步）

### 第1步：准备工作

1. 下载本文件夹所有文件
2. 放到一个文件夹（比如桌面的"OpenClaw"文件夹）

### 第2步：获取飞书密钥（免费）

1. 打开 https://open.feishu.cn/
2. 创建「企业自建应用」
3. 获取 **App ID** 和 **App Secret**
4. 添加权限：`im:message:send_as_bot`、`im:message:receive_as_bot`

### 第3步：运行脚本

1. **右键** `openclaw-install-windows.ps1`
2. 选择「使用PowerShell运行」
3. 按提示操作：
   - 输入飞书 App ID
   - 输入飞书 App Secret
4. 等待安装完成！

---

## ⚠️ 重要提示

- **必须使用管理员权限运行PowerShell！**
- 右键脚本 → 选择"使用PowerShell运行"
- 如果报错"无法运行脚本"，先运行：
  ```
  Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
  ```

---

## ❓ 常见问题

### Q: 找不到Node.js？
A: 下载安装：https://nodejs.org/ （选LTS版本）

### Q: 飞书连接不上？
A: 检查App ID和Secret是否正确，权限是否添加

### Q: 想停止服务怎么办？
A: 关闭终端窗口即可

---

## 📞 联系我们

有问题请联系客服
