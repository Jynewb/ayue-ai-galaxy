#!/usr/bin/env node

/**
 * 阿悦账号数据分析 + 选题推荐系统
 * 基于账号历史数据，智能生成选题建议
 */

const XLSX = require('xlsx');
const fs = require('fs');

const DATA_FILE = '/Users/jytao/.openclaw/media/inbound/e29f0653-46cc-40f9-bf6b-2bb9f87ca2ce.xlsx';
const OUTPUT_DIR = '/Users/jytao/Desktop/小助理的工作日常/';

// ============ 1. 账号画像分析 ============
function analyzeAccountProfile(data) {
  // 按播放量排序
  const sorted = [...data].sort((a, b) => parseInt(b.播放量) - parseInt(a.播放量));
  
  // 分析高频词（在爆款中）
  const keywordStats = {
    'OpenClaw': { count: 0, avgViews: 0, totalViews: 0 },
    '本地部署': { count: 0, avgViews: 0, totalViews: 0 },
    '免费': { count: 0, avgViews: 0, totalViews: 0 },
    '教程': { count: 0, avgViews: 0, totalViews: 0 },
    '干货': { count: 0, avgViews: 0, totalViews: 0 },
    '视频生成': { count: 0, avgViews: 0, totalViews: 0 },
    '图片生成': { count: 0, avgViews: 0, totalViews: 0 },
    '测评': { count: 0, avgViews: 0, totalViews: 0 },
    '对比': { count: 0, avgViews: 0, totalViews: 0 },
    'ComfyUI': { count: 0, avgViews: 0, totalViews: 0 },
  };
  
  let totalCount = 0;
  
  sorted.slice(0, 10).forEach(v => {
    const title = v.作品名称;
    const views = parseInt(v.播放量);
    
    Object.keys(keywordStats).forEach(kw => {
      if (title.includes(kw)) {
        keywordStats[kw].count++;
        keywordStats[kw].totalViews += views;
        totalCount++;
      }
    });
  });
  
  // 计算平均播放
  Object.keys(keywordStats).forEach(kw => {
    if (keywordStats[kw].count > 0) {
      keywordStats[kw].avgViews = Math.round(keywordStats[kw].totalViews / keywordStats[kw].count);
    }
  });
  
  // 时长分析
  const durationStats = {};
  data.forEach(v => {
    const d = v.体裁;
    if (!durationStats[d]) durationStats[d] = { count: 0, totalViews: 0, totalFans: 0 };
    durationStats[d].count++;
    durationStats[d].totalViews += parseInt(v.播放量);
    durationStats[d].totalFans += parseInt(v.粉丝增量) || 0;
  });
  
  Object.keys(durationStats).forEach(d => {
    durationStats[d].avgViews = Math.round(durationStats[d].totalViews / durationStats[d].count);
    durationStats[d].avgFans = Math.round(durationStats[d].totalFans / durationStats[d].count);
  });
  
  return {
    topVideos: sorted.slice(0, 5),
    keywordStats,
    durationStats,
    totalVideos: data.length,
    totalViews: data.reduce((sum, v) => sum + parseInt(v.播放量), 0),
    totalFans: data.reduce((sum, v) => sum + (parseInt(v.粉丝增量) || 0), 0)
  };
}

// ============ 2. 擅长领域识别 ============
function identifyStrengths(profile) {
  const strengths = [];
  
  // 基于关键词平均播放
  Object.entries(profile.keywordStats)
    .filter(([_, v]) => v.count >= 1)
    .sort((a, b) => b[1].avgViews - a[1].avgViews)
    .forEach(([kw, v]) => {
      strengths.push({
        keyword: kw,
        count: v.count,
        avgViews: v.avgViews,
        level: v.avgViews > 50000 ? 'S' : v.avgViews > 20000 ? 'A' : v.avgViews > 5000 ? 'B' : 'C'
      });
    });
  
  // 基于时长
  const bestDuration = Object.entries(profile.durationStats)
    .sort((a, b) => b[1].avgViews - a[1].avgViews)[0];
  
  return {
    topKeywords: strengths.slice(0, 5),
    bestDuration: bestDuration[0],
    bestDurationAvgViews: bestDuration[1].avgViews
  };
}

// ============ 3. 选题评分系统 ============
function scoreTopics(topics, strengths) {
  const scored = [];
  
  // 你的擅长关键词
  const myStrengths = strengths.topKeywords.map(s => s.keyword);
  
  topics.forEach(topic => {
    let score = 0;
    let reasons = [];
    
    // 1. 擅长匹配度（40%权重）
    const matchCount = myStrengths.filter(s => 
      topic.title.includes(s) || topic.content.includes(s)
    ).length;
    
    if (matchCount >= 2) {
      score += 40;
      reasons.push('✅ 高度匹配擅长领域');
    } else if (matchCount === 1) {
      score += 20;
      reasons.push('✅ 部分匹配');
    } else {
      score += 0;
      reasons.push('⚠️ 新领域，有风险');
    }
    
    // 2. 热点新鲜度（30%权重）
    if (topic.isNew) {
      score += 30;
      reasons.push('✅ 新鲜热点');
    } else if (topic.isRising) {
      score += 15;
      reasons.push('✅ 上升趋势');
    } else {
      score += 5;
      reasons.push('⚠️ 可能过时');
    }
    
    // 3. 抖音算法友好度（30%权重）
    if (topic.hookType === 'result') {
      score += 15; // 结果导向
      reasons.push('✅ 结果导向标题');
    }
    if (topic.hookType === 'controversy') {
      score += 10; // 争议性
      reasons.push('✅ 争议性强');
    }
    if (topic.hookType === 'free') {
      score += 15; // 免费
      reasons.push('✅ 免费是流量密码');
    }
    
    scored.push({
      ...topic,
      score,
      reasons
    });
  });
  
  return scored.sort((a, b) => b.score - a.score);
}

// ============ 4. 生成选题建议 ============
function generateRecommendations(competitorTopics, strengths) {
  const recommendations = [];
  
  // 基于擅长扩展的选题
  const topicTemplates = [
    // OpenClaw相关（最强数据验证）
    {
      title: '2026年最新OpenClaw安装教程，零基础也能学会',
      content: 'OpenClaw最新安装指南，覆盖Mac/Windows',
      category: '教程',
      hookType: 'tutorial',
      isNew: true,
      isRising: true
    },
    {
      title: 'OpenClaw + Claude Code 联动，效率翻倍',
      content: 'OpenClaw使用Claude Code的完整工作流',
      category: '教程',
      hookType: 'combo',
      isNew: true,
      isRising: true
    },
    // 本地部署相关
    {
      title: '免费本地部署AI生图模型，配置要求最低',
      content: '最低配置也能跑SD类模型',
      category: '教程',
      hookType: 'free',
      isNew: true,
      isRising: true
    },
    // 测评对比（但要做差异化）
    {
      title: '2026年免费本地AI工具横评，这几个够用了',
      content: '免费工具对比，选最省钱的',
      category: '测评',
      hookType: 'free',
      isNew: true,
      isRising: false
    },
    // 避坑系列（差异化）
    {
      title: 'AI工具这些坑千万别踩，2026避坑指南',
      content: '盘点常见智商税和割韭菜',
      category: '避坑',
      hookType: 'controversy',
      isNew: true,
      isRising: true
    },
    // 变现相关
    {
      title: '用AI做副业，普通人也能月入过万',
      content: '真实案例分享+具体方法',
      category: '变现',
      hookType: 'result',
      isNew: false,
      isRising: true
    },
    // 新热点：Google Nano Banana
    {
      title: 'Google Nano Banana 2 实测，比SD更快',
      content: 'Google最新生图模型体验',
      category: '测评',
      hookType: 'new',
      isNew: true,
      isRising: true
    },
    // 新热点：即梦/Seedream
    {
      title: '字节即梦AI vs Seedream 5.0，真实对比',
      content: '国产AI生图工具实测',
      category: '测评',
      hookType: 'compare',
      isNew: true,
      isRising: true
    },
  ];
  
  // 评分
  const scored = scoreTopics(topicTemplates, strengths);
  
  return scored;
}

// ============ 主函数 ============
function main() {
  console.log('📊 开始分析阿悦账号数据...');
  
  // 读取数据
  const workbook = XLSX.readFile(DATA_FILE);
  const data = XLSX.utils.sheet_to_json(workbook.Sheets[workbook.SheetNames[0]]);
  
  console.log(`📁 加载 ${data.length} 条视频数据`);
  
  // 1. 分析账号画像
  console.log('🔍 分析账号画像...');
  const profile = analyzeAccountProfile(data);
  
  // 2. 识别擅长
  console.log('🎯 识别擅长领域...');
  const strengths = identifyStrengths(profile);
  
  console.log('\n📈 擅长领域:');
  strengths.topKeywords.forEach(kw => {
    console.log(`  ${kw.level}级: ${kw.keyword} (${kw.avgViews}平均播放, ${kw.count}个视频)`);
  });
  console.log(`  最佳时长: ${strengths.bestDuration} (平均${strengths.bestDurationAvgViews}播放)`);
  
  // 3. 生成选题建议
  console.log('\n📝 生成选题建议...');
  const recommendations = generateRecommendations([], strengths);
  
  // 4. 保存结果
  const result = {
    profile,
    strengths,
    recommendations: recommendations.slice(0, 8)
  };
  
  fs.writeFileSync(`${OUTPUT_DIR}账号分析+选题推荐.json`, JSON.stringify(result, null, 2));
  
  // 5. 生成报告
  let report = `# 🎯 阿悦账号分析 + 智能选题推荐

**生成时间**: ${new Date().toLocaleString('zh-CN')}

---

## 📊 账号画像

### 基础数据
- 视频总数: ${profile.totalVideos}条
- 总播放量: ${profile.totalViews.toLocaleString()}
- 总粉丝增量: ${profile.totalFans}

### 🏆 擅长领域（数据验证）

| 等级 | 关键词 | 平均播放 | 视频数 |
|------|--------|----------|--------|
${strengths.topKeywords.map(kw => `| ${kw.level} | ${kw.keyword} | ${kw.avgViews.toLocaleString()} | ${kw.count} |`).join('\n')}

### ⏱️ 最佳内容时长
- **${strengths.bestDuration}** (平均 ${strengths.bestDurationAvgViews.toLocaleString()} 播放)

---

## 🎯 智能选题推荐

### 评分算法
\`\`\`
选题评分 = 擅长匹配度(40%) + 热点新鲜度(30%) + 抖音友好度(30%)
\`\`\`

### ⭐ TOP 8 选题建议

${recommendations.slice(0, 8).map((r, i) => `
#### ${i + 1}. [${r.score}分] ${r.title}
- **分类**: ${r.category}
- **理由**: ${r.reasons.join(', ')}
`).join('\n')}

---

## 💡 执行建议

### 优先级
1. **立即做**: ${recommendations[0]?.title}
2. **本周做**: ${recommendations[1]?.title}
3. **储备**: ${recommendations[2]?.title}

### 标题公式（基于数据验证）
\`\`\`
{结果/数字} + {核心关键词} + {行动词}
例：19.7万人观看的OpenClaw安装教程，零基础也能学会
\`\`\`

### 必带标签
- #干货分享
- #本地部署
- #AI教程
`;

  fs.writeFileSync(`${OUTPUT_DIR}智能选题推荐.md`, report);
  
  console.log('\n✅ 分析完成!');
  console.log(`📁 输出: ${OUTPUT_DIR}智能选题推荐.md`);
  
  // 打印TOP3
  console.log('\n🎯 TOP 3 选题:');
  recommendations.slice(0, 3).forEach((r, i) => {
    console.log(`  ${i+1}. [${r.score}分] ${r.title}`);
  });
}

main();
