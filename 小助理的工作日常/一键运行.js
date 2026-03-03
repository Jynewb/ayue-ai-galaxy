#!/usr/bin/env node

/**
 * 阿悦AI内容助手 - 一键运行
 * 每天早上8点自动运行
 * 输出：选题建议 + 竞品动态
 */

const { execSync } = require('child_process');
const fs = require('fs');

const OUTPUT_DIR = '/Users/jytao/Desktop/小助理的工作日常/';

console.log('='.repeat(50));
console.log('🚀 阿悦AI内容助手 开始运行');
console.log('='.repeat(50));

// 1. 采集数据
console.log('\n📡 步骤1: 采集竞品数据...');
try {
  execSync(`node ${OUTPUT_DIR}竞品数据采集.js`, { 
    cwd: OUTPUT_DIR,
    timeout: 180000 
  });
  console.log('✅ 数据采集完成');
} catch (e) {
  console.error('❌ 数据采集失败:', e.message);
}

// 2. 生成选题建议
console.log('\n📊 步骤2: 生成选题建议...');
try {
  execSync(`node ${OUTPUT_DIR}选题建议生成.js`, { 
    cwd: OUTPUT_DIR,
    timeout: 10000 
  });
  console.log('✅ 选题建议生成完成');
} catch (e) {
  console.error('❌ 选题建议生成失败:', e.message);
}

// 3. 生成动态预警
console.log('\n🚨 步骤3: 生成竞品动态预警...');
try {
  execSync(`node ${OUTPUT_DIR}竞品动态监控.js`, { 
    cwd: OUTPUT_DIR,
    timeout: 10000 
  });
  console.log('✅ 动态预警生成完成');
} catch (e) {
  console.error('❌ 动态预警生成失败:', e.message);
}

// 4. 读取并展示结果
console.log('\n' + '='.repeat(50));
console.log('📋 今日选题建议');
console.log('='.repeat(50));

try {
  const report = fs.readFileSync(`${OUTPUT_DIR}选题建议报告.md`, 'utf8');
  // 只打印关键部分
  const lines = report.split('\n');
  let inSection = false;
  lines.forEach(line => {
    if (line.includes('## 🔥')) inSection = true;
    if (line.startsWith('## ') && inSection && !line.includes('🔥')) inSection = false;
    if (inSection || line.includes('### ⭐') || line.includes('### 1.') || line.includes('🎯 建议')) {
      console.log(line);
    }
  });
} catch (e) {
  console.log('读取报告失败');
}

console.log('\n' + '='.repeat(50));
console.log('✨ 运行完成！');
console.log('='.repeat(50));

// 输出文件位置
console.log('\n📁 输出文件:');
console.log(`  - 竞品数据库: ${OUTPUT_DIR}竞品数据库.json`);
console.log(`  - 选题建议: ${OUTPUT_DIR}选题建议报告.md`);
console.log(`  - 动态预警: ${OUTPUT_DIR}竞品动态预警.md`);
