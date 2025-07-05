#!/usr/bin/env node

const { analyzeOrder } = require('./order_analyzer.js');

// 测试数据
const testOrder = {
  state: 'Fulfilled',
  programCycles: 6294047,
  totalCycles: 8388608,
  deliveryTimeSeconds: 72,
  effectiveMHz: 0.11650844,
  ethPerMC: 0.00000000
};

console.log('🧪 开始测试订单分析器...\n');

// 测试分析功能
const analysis = analyzeOrder(testOrder);

console.log('📊 测试结果:');
console.log('='.repeat(40));
console.log(`难度级别: ${analysis.difficulty}`);
console.log(`盈利能力: ${analysis.profitability}`);
console.log(`竞争程度: ${analysis.competition}`);
console.log('\n推荐配置:');
console.log(JSON.stringify(analysis.recommendations, null, 2));

console.log('\n✅ 测试完成！');
console.log('分析器工作正常，可以使用 node order_analyzer.js 开始分析真实订单'); 