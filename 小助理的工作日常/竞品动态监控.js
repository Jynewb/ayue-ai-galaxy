#!/usr/bin/env node

/**
 * 竞品动态监控与预警
 * 功能：检测竞品账号异常动态，推送预警
 */

const fs = require('fs');

const DATA_FILE = '/Users/jytao/Desktop/小助理的工作日常/竞品数据库.json';
const ALERT_FILE = '/Users/jytao/Desktop/小助理的工作日常/竞品动态预警.md';

// 需要监控的关键词
const MONITOR_KEYWORDS = [
  '免费', '无限', '永久', '白嫖', '破解',
  '爆款', '教程', '保姆级', '入门',
  '对比', '测评', '横评', ' vs ',
  '变现', '赚钱', '副业', '月入'
];

// 分析竞品动态
function analyzeCompetitorMovement(data) {
  const alerts = [];
  const { accounts, hot_topics } = data;
  
  // 1. 检测上升趋势的话题
  hot_topics.forEach(topic => {
    if (topic.trend === 'rising' && topic.mentions >= 3) {
      alerts.push({
        type: 'trend',
        level: 'high',
        title: '🔥 新热点出现',
        content: `${topic.topic} 在多个竞品账号中出现，建议跟进`,
        reason: `${topic.mentions}个账号在推`
      });
    }
  });
  
  // 2. 检测新账号/新话题
  accounts.forEach(account => {
    if (account.topics) {
      account.topics.forEach(topic => {
        if (topic.includes('2026') || topic.includes('最新')) {
          alerts.push({
            type: 'new',
            level: 'medium',
            title: '📢 新内容趋势',
            content: `${account.name} 正在推 ${topic}`,
            reason: '新话题值得关注'
          });
        }
      });
    }
  });
  
  // 3. 检测高频内容类型
  const contentTypeCount = {};
  accounts.forEach(account => {
    if (account.topics) {
      account.topics.forEach(topic => {
        contentTypeCount[topic] = (contentTypeCount[topic] || 0) + 1;
      });
    }
  });
  
  // 4. 生成建议
  const suggestions = [];
  
  // 视频类建议
  if (contentTypeCount['视频'] || contentTypeCount['AI视频']) {
    suggestions.push({
      title: '📹 AI视频是热点',
      content: '多个竞品在推AI视频内容，建议优先做'
    });
  }
  
  // 编程类建议
  if (contentTypeCount['编程'] || contentTypeCount['代码']) {
    suggestions.push({
      title: '💻 编程内容数据好',
      content: '林亦LYi的编程内容播放量高，可参考'
    });
  }
  
  // 效率类建议
  if (contentTypeCount['效率'] || contentTypeCount['神器']) {
    suggestions.push({
      title: '⚡ 效率工具受众广',
      content: '老麦的工具库专注这个方向，可差异化做'
    });
  }
  
  return { alerts: alerts.slice(0, 10), suggestions };
}

// 生成预警报告
function generateAlertReport(data) {
  const { alerts, suggestions } = analyzeCompetitorMovement(data);
  
  const report = `# 🚨 竞品动态预警

**生成时间**: ${new Date().toLocaleString('zh-CN')}

---

## 📊 热门话题趋势

${data.hot_topics.slice(0, 5).map(t => `- **${t.topic}**: ${t.mentions}个竞品在推`).join('\n')}

---

## 🚨 预警动态

${alerts.length > 0 ? alerts.map(a => `
### ${a.title}
- **内容**: ${a.content}
- **原因**: ${a.reason}
`).join('\n') : '暂无新预警'}

---

## 💡 策略建议

${suggestions.length > 0 ? suggestions.map(s => `
### ${s.title}
${s.content}
`).join('\n') : '暂无建议'}

---

## 🎯 今日行动建议

1. **优先**: 关注 ${data.hot_topics[0]?.topic || 'AI视频'} 相关内容
2. **差异化**: 尝试竞品没做过的角度
3. **跟进**: ${data.accounts[0]?.name || '秋芝2046'} 的最新选题方向

---

**数据更新: ${data.updated_at}**
`;

  return report;
}

// 主函数
function main() {
  console.log('🔍 分析竞品动态...');
  
  if (!fs.existsSync(DATA_FILE)) {
    console.error('❌ 数据不存在');
    process.exit(1);
  }
  
  const data = JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
  const report = generateAlertReport(data);
  
  fs.writeFileSync(ALERT_FILE, report);
  console.log(`✅ 预警报告已保存: ${ALERT_FILE}`);
  
  // 打印摘要
  const { alerts, suggestions } = analyzeCompetitorMovement(data);
  console.log(`\n📊 发现 ${alerts.length} 个预警，${suggestions.length} 条建议`);
}

main();
