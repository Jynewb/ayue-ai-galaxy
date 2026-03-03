#!/usr/bin/env node

/**
 * 竞品数据采集系统 v2.0
 * 改进：深入分析视频内容，识别核心主题，区分新旧话题
 */

const { execSync } = require('child_process');
const fs = require('fs');

const TAVILY_SCRIPT = '/Users/jytao/.openclaw/workspace/skills/tavily-search/scripts/search.mjs';
const OUTPUT_DIR = '/Users/jytao/Desktop/小助理的工作日常/';

// 竞品账号
const COMPETITORS = [
  { id: 'qiuzhi2046', name: '秋芝2046', query: '秋芝2046 抖音 视频 2026年' },
  { id: 'tech_ppx', name: '技术爬爬虾', query: '技术爬爬虾 抖音 AI 教程 2026年' },
  { id: 'ai_laosi', name: 'AI老撕机', query: 'AI老撕机 抖音 2026年' },
  { id: 'linyi', name: '林亦LYi', query: '林亦LYi 抖音 AI 2026年' },
  { id: 'laomai', name: '老麦的工具库', query: '老麦的工具库 抖音 2026年' }
];

// 内容类型关键词（用于识别视频核心内容）
const CONTENT_TYPES = {
  '教程': ['教程', '教学', '入门', '保姆级', '零基础', '学会', '使用', '方法', '步骤'],
  '测评': ['测评', '对比', '横评', '实测', '评测', '体验', '怎么样', '好不好'],
  '工具': ['工具', '软件', '神器', 'APP', '网站', '平台'],
  '变现': ['变现', '赚钱', '副业', '收入', '月入', '接单', '项目'],
  '避坑': ['避坑', '踩坑', '智商税', '割韭菜', '骗局', '别买', '千万别'],
  '资讯': ['新闻', '更新', '发布', '新功能', '上线', '来了']
};

// 新兴热点词（2026年的）
const NEW_HOT_WORDS = [
  'Claude Code', 'OpenClaw', 'Cursor', 'Windsurf', 'Trae', 'Nano Banana',
  '即梦', 'Seedream', 'Seedance', '可灵', '可灵AI3.0', 'Lovable',
  'Manus', 'Gemini 2.0', 'GPT-4.5', 'Sora', 'Veo3', 'Runway',
  'N8N', 'ComfyUI', 'Forge', 'WebUI', 'Ollama'
];

// 搜索函数
function search(query) {
  try {
    return execSync(`node ${TAVILY_SCRIPT} "${query}"`, {
      encoding: 'utf8',
      timeout: 30000
    });
  } catch (e) {
    console.error(`搜索失败: ${query}`);
    return null;
  }
}

// 深度分析视频内容
function analyzeContent(text) {
  const result = {
    coreTopics: [],      // 核心话题
    contentType: null,  // 内容类型
    isNew: false,       // 是否新热点
    tools: [],          // 涉及的工具
    hooks: []           // 可能的爆款钩子
  };
  
  // 1. 识别内容类型
  let maxTypeScore = 0;
  Object.entries(CONTENT_TYPES).forEach(([type, keywords]) => {
    let score = 0;
    keywords.forEach(kw => {
      if (text.includes(kw)) score++;
    });
    if (score > maxTypeScore) {
      maxTypeScore = score;
      result.contentType = type;
    }
  });
  
  // 2. 识别核心话题和工具
  NEW_HOT_WORDS.forEach(word => {
    if (text.includes(word)) {
      result.tools.push(word);
      result.isNew = true;
    }
  });
  
  // 3. 提取核心话题
  const topicPatterns = [
    /([A-Za-z0-9\u4e00-\u9fa5]+AI[\u4e00-\u9fa5]*)/g,
    /(免费|本地部署|安装|教程|测评|对比)/g
  ];
  
  // 4. 识别爆款钩子
  if (text.includes('免费') || text.includes('无限')) result.hooks.push('免费');
  if (text.includes('保姆级') || text.includes('零基础')) result.hooks.push('保姆级');
  if (text.includes('对比') || text.includes('vs')) result.hooks.push('对比');
  if (text.includes('避坑') || text.includes('踩坑')) result.hooks.push('避坑');
  if (text.includes('月入') || text.includes('变现')) result.hooks.push('变现');
  
  return result;
}

// 主函数
async function main() {
  console.log('🚀 竞品数据采集 v2.0 开始...\n');
  
  const allData = [];
  const allTools = [];
  
  for (const competitor of COMPETITORS) {
    console.log(`📡 采集: ${competitor.name}`);
    const result = search(competitor.query);
    
    if (result) {
      const analysis = analyzeContent(result);
      
      allData.push({
        name: competitor.name,
        contentType: analysis.contentType,
        isNew: analysis.isNew,
        tools: analysis.tools,
        hooks: analysis.hooks,
        rawText: result.substring(0, 500)
      });
      
      allTools.push(...analysis.tools);
    }
    
    await new Promise(r => setTimeout(r, 1500));
  }
  
  // 统计工具热度
  const toolCounts = {};
  allTools.forEach(t => {
    toolCounts[t] = (toolCounts[t] || 0) + 1;
  });
  
  const hotTools = Object.entries(toolCounts)
    .sort((a, b) => b[1] - a[1])
    .map(([tool, count]) => ({ tool, count, isNew: true }))
    .slice(0, 10);
  
  // 统计内容类型
  const contentTypeStats = {};
  allData.forEach(d => {
    if (d.contentType) {
      contentTypeStats[d.contentType] = (contentTypeStats[d.contentType] || 0) + 1;
    }
  });
  
  // 保存
  const data = {
    competitors: allData,
    hotTools,
    contentTypeStats,
    updatedAt: new Date().toISOString()
  };
  
  fs.writeFileSync(`${OUTPUT_DIR}竞品数据v2.json`, JSON.stringify(data, null, 2));
  
  console.log('\n📊 统计结果:');
  console.log('  热门工具:', hotTools.map(t => t.tool).join(', '));
  console.log('  内容类型:', Object.entries(contentTypeStats).map(([k, v]) => `${k}:${v}`).join(', '));
  
  console.log('\n✅ 采集完成!');
}

main().catch(console.error);
