#!/usr/bin/env node

/**
 * 选题建议生成器
 * 基于竞品数据分析生成选题建议
 */

const fs = require('fs');

const DATA_FILE = '/Users/jytao/Desktop/小助理的工作日常/竞品数据库.json';
const OUTPUT_FILE = '/Users/jytao/Desktop/小助理的工作日常/选题建议报告.md';

// 选题模板库
const TOPIC_TEMPLATES = {
  '工具教程': [
    '{工具名}保姆级教程，5分钟入门',
    '2026年最强{工具名}攻略',
    '别人不会告诉你的{工具名}技巧',
    '{工具名} vs {竞品}，实测对比',
    '免费无限用？{工具名}薅羊毛指南'
  ],
  '效率提升': [
    '打工人的{效率}神器，效率翻倍',
    '3个{效率}技巧，告别加班',
    '用AI{效率}，月入十万',
    '{效率}工作流搭建指南'
  ],
  '对比测评': [
    '{工具A} vs {工具B}，谁更强？',
    '2026年AI工具横评，{工具}排第几？',
    '用了{工具}三个月，说说真实感受',
    '{工具}到底能不能打？实测告诉你'
  ],
  '变现方式': [
    '用{工具}做副业，单日收入破千',
    '{工具}变现指南，附详细步骤',
    '普通人如何用{工具}月入五位数',
    '{工具}+{平台}新玩法，2026红利'
  ],
  'AI视频': [
    '{工具}生成视频保姆级教程',
    '用{工具}做爆款视频的秘诀',
    '{工具}视频效果实测，对比即梦',
    'AI视频神器{工具}，零基础也能上手'
  ],
  'AI编程': [
    '用{工具}写代码，效率提升10倍',
    '{工具}编程入门，3小时学会',
    'AI编程神器{工具}，小白也能写APP',
    '{工具}开发小程序实战教程'
  ]
};

// 生成选题建议
function generateSuggestions(data) {
  const suggestions = [];
  const { accounts, hot_topics } = data;
  
  // 1. 基于热门话题生成选题
  hot_topics.slice(0, 5).forEach(hot => {
    const topic = hot.topic;
    
    if (topic.includes('OpenClaw') || topic.includes('Claw')) {
      suggestions.push({
        title: 'OpenClaw 2026最新教程，入门到进阶',
        category: '工具教程',
        priority: 'high',
        reason: `热度上升，竞品${accounts.filter(a => a.topics?.includes('OpenClaw')).length}个账号在推`,
        hooks: [
          '90%的人不知道OpenClaw还能这样用',
          '2026最火AI工具，零基础也能学会'
        ]
      });
    }
    
    if (topic.includes('AI视频') || topic.includes('可灵') || topic.includes('视频')) {
      suggestions.push({
        title: '可灵AI3.0 vs 即梦AI，谁是王者？',
        category: '对比测评',
        priority: 'high',
        reason: '视频是2026最大热点，多个竞品在发',
        hooks: [
          '实测可灵3.0 vs 即梦AI，差距有点大',
          'AI视频工具横评，这一款彻底赢了'
        ]
      });
    }
    
    if (topic.includes('编程') || topic.includes('代码')) {
      suggestions.push({
        title: '用AI编程月入十万？真相是这样的',
        category: 'AI编程',
        priority: 'medium',
        reason: '林亦LYi在推，编程类内容数据好',
        hooks: [
          'AI编程3个月，说说我的真实收入',
          '程序员真的要失业了？'
        ]
      });
    }
    
    if (topic.includes('NotebookLM')) {
      suggestions.push({
        title: 'NotebookLM完全指南，99%的人没用过',
        category: '工具教程',
        priority: 'medium',
        reason: '秋芝2046在推的新热点',
        hooks: [
          '这个AI工具比ChatGPT还好用',
          'NotebookLM正确用法，大部分人不知道'
        ]
      });
    }
  });
  
  // 2. 基于竞品分析生成选题
  const contentTypes = {
    'AI工具/教程': { templates: TOPIC_TEMPLATES['工具教程'], priority: 'high' },
    'AI工具/评测': { templates: TOPIC_TEMPLATES['对比测评'], priority: 'high' },
    '编程/AI工具': { templates: TOPIC_TEMPLATES['AI编程'], priority: 'medium' },
    'AI工具/效率': { templates: TOPIC_TEMPLATES['效率提升'], priority: 'medium' }
  };
  
  // 3. 差异化选题（竞品没做过的）
  const existingTopics = hot_topics.map(t => t.topic);
  const diffSuggestions = [
    {
      title: '2026年AI工具避坑指南，这5个千万别碰',
      category: '工具测评',
      priority: 'high',
      reason: '竞品没做过，争议性强易爆',
      hooks: ['这些AI工具白送都不要', '2026 AI工具红黑榜']
    },
    {
      title: '用AI做抖音一个月数据复盘',
      category: '经验分享',
      priority: 'medium',
      reason: '真实数据分享，有参考价值',
      hooks: ['AI做抖音30天，收入公开', '用AI做自媒体一个月，数据出来了']
    },
    {
      title: '2026年最适合普通人的AI变现方式',
      category: '变现',
      priority: 'high',
      reason: '变现是永恒热点，受众广',
      hooks: ['普通人AI变现，门槛最低的方法', '2026 AI搞钱新方向']
    }
  ];
  
  suggestions.push(...diffSuggestions);
  
  // 去重
  const unique = [];
  const titles = new Set();
  suggestions.forEach(s => {
    if (!titles.has(s.title)) {
      titles.add(s.title);
      unique.push(s);
    }
  });
  
  return unique.slice(0, 15);
}

// 生成报告
function generateReport(data) {
  const suggestions = generateSuggestions(data);
  const { hot_topics, accounts } = data;
  
  const report = `# 📊 选题建议报告

**生成时间**: ${new Date().toLocaleString('zh-CN')}

---

## 🔥 近期热门话题

| 话题 | 热度 | 趋势 |
|------|------|------|
${hot_topics.map(t => `| ${t.topic} | ${'🔥'.repeat(Math.min(t.mentions, 3))} | ${t.trend === 'rising' ? '📈上升' : '➡️稳定'} |`).join('\n')}

---

## 📋 选题建议

### ⭐ 高优先级

${suggestions.filter(s => s.priority === 'high').map((s, i) => `
#### ${i + 1}. ${s.title}
- **分类**: ${s.category}
- **理由**: ${s.reason}
- **爆款Hook**:
${s.hooks.map(h => `  - ${h}`).join('\n')}
`).join('\n')}

### 📌 中优先级

${suggestions.filter(s => s.priority === 'medium').map((s, i) => `
#### ${s.title}
- **分类**: ${s.category}
- **理由**: ${s.reason}
`).join('\n')}

---

## 🎯 建议拍摄顺序

1. **可灵AI3.0 vs 即梦AI对比** - 热点+对比，爆款概率高
2. **2026年AI工具避坑指南** - 差异化，竞争少
3. **OpenClaw最新教程** - 竞品验证过的话题
4. **普通人AI变现** - 受众广，易传播

---

## 📈 数据来源

- 采集账号: ${accounts.length}个
- 更新时间: ${data.updated_at}

**对标账号**:
${accounts.map(a => `- ${a.name} (${a.topics?.slice(0,3).join(', ') || 'AI相关'})`).join('\n')}
`;

  return report;
}

// 主函数
function main() {
  console.log('📊 生成选题建议报告...');
  
  if (!fs.existsSync(DATA_FILE)) {
    console.error('❌ 竞品数据库不存在，请先运行采集脚本');
    process.exit(1);
  }
  
  const data = JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
  const report = generateReport(data);
  
  fs.writeFileSync(OUTPUT_FILE, report);
  console.log(`✅ 报告已保存: ${OUTPUT_FILE}`);
  
  // 打印摘要
  console.log('\n📋 选题建议摘要:');
  const suggestions = generateSuggestions(data);
  suggestions.slice(0, 5).forEach((s, i) => {
    console.log(`  ${i + 1}. [${s.priority}] ${s.title}`);
  });
}

main();
