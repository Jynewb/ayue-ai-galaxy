#!/usr/bin/env node

/**
 * 竞品数据采集脚本
 * 功能：自动抓取对标账号最新视频数据
 * 定时：每天早上8点运行
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const TAVILY_SCRIPT = '/Users/jytao/.openclaw/workspace/skills/tavily-search/scripts/search.mjs';
const DATA_FILE = '/Users/jytao/Desktop/小助理的工作日常/竞品数据库.json';
const OUTPUT_DIR = '/Users/jytao/Desktop/小助理的工作日常/';

// 对标账号列表
const ACCOUNTS = [
  { id: 'qiuzhi2046', name: '秋芝2046', query: '秋芝2046 抖音 AI 视频 2026' },
  { id: 'tech_ppx', name: '技术爬爬虾', query: '技术爬爬虾 抖音 AI 教程 2026' },
  { id: 'ai_laosi', name: 'AI老撕机', query: 'AI老撕机 抖音 AI 工具 2026' },
  { id: 'linyi_lYi', name: '林亦LYi', query: '林亦LYi 抖音 AI 编程 2026' },
  { id: 'laomai', name: '老麦的工具库', query: '老麦的工具库 抖音 AI 效率 2026' },
  { id: 'money_dazu', name: '钱大柱', query: '钱大柱 抖音 AI 2026' },
  { id: 'shejishi_doo', name: '设计师doo', query: '设计师doo 抖音 AI 设计 2026' },
  { id: 'shennonglaogou', name: '神烦老狗', query: '神烦老狗 抖音 AI 测评 2026' },
  { id: 'qualia', name: '夸利亚Qualia', query: '夸利亚Qualia 抖音 AI 2026' }
];

// 搜索函数
function search(query) {
  try {
    const result = execSync(`node ${TAVILY_SCRIPT} "${query}"`, {
      encoding: 'utf8',
      timeout: 30000
    });
    return result;
  } catch (e) {
    console.error(`搜索失败: ${query}`, e.message);
    return null;
  }
}

// 解析搜索结果
function parseResults(result) {
  if (!result) return { topics: [], videos: [] };
  
  const topics = [];
  const videos = [];
  
  // 提取话题标签
  const topicMatches = result.match(/#[\u4e00-\u9fa5A-Za-z]+/g) || [];
  topicMatches.forEach(t => {
    if (!topics.includes(t.replace('#', ''))) {
      topics.push(t.replace('#', ''));
    }
  });
  
  // 提取视频信息
  const lines = result.split('\n');
  lines.forEach(line => {
    if (line.includes('抖音') && (line.includes('发布') || line.includes('收获'))) {
      videos.push(line.trim());
    }
  });
  
  return { topics: topics.slice(0, 10), videos: videos.slice(0, 5) };
}

// 主函数
async function main() {
  console.log('🚀 开始采集竞品数据...');
  
  const allTopics = [];
  const accountData = [];
  
  for (const account of ACCOUNTS) {
    console.log(`📡 采集: ${account.name}`);
    const result = search(account.query);
    const { topics, videos } = parseResults(result);
    
    accountData.push({
      id: account.id,
      name: account.name,
      platform: '抖音',
      topics: topics,
      recent_videos: videos,
      last_updated: new Date().toISOString().split('T')[0]
    });
    
    allTopics.push(...topics);
    
    // 避免请求过快
    await new Promise(r => setTimeout(r, 1000));
  }
  
  // 统计话题热度
  const topicCounts = {};
  allTopics.forEach(t => {
    topicCounts[t] = (topicCounts[t] || 0) + 1;
  });
  
  const hotTopics = Object.entries(topicCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([topic, count]) => ({
      topic,
      mentions: count,
      trend: count > 2 ? 'rising' : 'stable'
    }));
  
  // 保存数据
  const data = {
    accounts: accountData,
    hot_topics: hotTopics,
    updated_at: new Date().toISOString()
  };
  
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
  console.log(`✅ 数据已保存到: ${DATA_FILE}`);
  console.log(`📊 采集到 ${hotTopics.length} 个热门话题`);
  
  return data;
}

main().catch(console.error);
