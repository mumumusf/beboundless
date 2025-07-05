#!/usr/bin/env node

const readline = require('readline');
const https = require('https');
const { URL } = require('url');

// 创建命令行交互界面
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// 颜色输出工具
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  red: '\x1b[31m',
  cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

// 获取订单数据
async function fetchOrderData(orderId) {
  const url = `https://explorer.beboundless.xyz/orders/${orderId}`;
  
  return new Promise((resolve, reject) => {
    const options = {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    };
    
    https.get(url, options, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        try {
          const orderData = parseOrderData(data);
          resolve(orderData);
        } catch (error) {
          reject(new Error(`数据解析失败: ${error.message}`));
        }
      });
    }).on('error', (error) => {
      reject(new Error(`网络请求失败: ${error.message}`));
    });
  });
}

// 解析订单数据
function parseOrderData(html) {
  const order = {};
  
  // 提取关键信息的正则表达式 - 更全面的匹配模式
  const patterns = {
    // 基本信息
    state: /Order state[^>]*>([^<]+)<|state[^>]*>([^<]+)<|Fulfilled|Pending|Cancelled/i,
    cycles: /Program cycles[^>]*>([0-9,]+)\s*cycles|([0-9,]+)\s*cycles/i,
    totalCycles: /total cycles[^>]*>([0-9,]+)\s*cycles|([0-9,]+)\s*cycles/i,
    deliveryTime: /Proof delivery time[^>]*>([0-9]+)\s*minute[^<]*([0-9]+)\s*second|([0-9]+)\s*minute[^<]*([0-9]+)\s*second/i,
    effectiveMHz: /Effective MHz[^>]*>([0-9.]+)\s*MHz|([0-9.]+)\s*MHz/i,
    ethPerMC: /ETH per Megacycle[^>]*>([0-9.]+)\s*ETH\/MC|([0-9.]+)\s*ETH\/MC/i,
    
    // 价格信息
    minPrice: /最低价格[^>]*>([0-9.]+)\s*以太币|Min Price[^>]*>([0-9.]+)\s*ETH/i,
    maxPrice: /最高价格[^>]*>([0-9.]+)\s*ETH|Max Price[^>]*>([0-9.]+)\s*ETH|End:\s*([0-9.]+)\s*ETH/i,
    
    // 交易哈希
    lockTxn: /锁定 txn[^>]*>([0-9a-fA-Fx]+)|Lock Transaction[^>]*>([0-9a-fA-Fx]+)/i,
    fulfillTxn: /已成交交易[^>]*>([0-9a-fA-Fx]+)|Fulfill Transaction[^>]*>([0-9a-fA-Fx]+)/i,
    proofTxn: /Proof已交付交易[^>]*>([0-9a-fA-Fx]+)|Proof Delivery Transaction[^>]*>([0-9a-fA-Fx]+)/i,
    
    // 区块信息
    lockBlock: /锁定块[^>]*>([0-9]+)|Lock Block[^>]*>([0-9]+)/i,
    fulfillBlock: /Fulfill 区块[^>]*>([0-9]+)|Fulfill Block[^>]*>([0-9]+)/i,
    proofBlock: /证明交付的区块[^>]*>([0-9]+)|Proof Delivery Block[^>]*>([0-9]+)/i,
    
    // 时间戳
    bidStartTime: /出价开始时间戳[^>]*>([0-9\/\s:]+)|Bid Start Timestamp[^>]*>([0-9\/\s:]+)/i,
    lockTimestamp: /锁定区块时间戳[^>]*>([0-9\/\s:]+)|Lock Timestamp[^>]*>([0-9\/\s:]+)/i,
    fulfillTimestamp: /履行区块时间戳[^>]*>([0-9\/\s:]+)|Fulfill Timestamp[^>]*>([0-9\/\s:]+)/i,
    
    // 拍卖参数
    rampUpPeriod: /爬坡期[^>]*>([0-9]+)\s*分[^>]*([0-9]+)\s*秒|Ramp up period[^>]*>([0-9]+)\s*mins?\s*([0-9]+)\s*secs?/i,
    lockTimeout: /锁定超时[^>]*>([0-9]+)\s*分钟|Lock timeout[^>]*>([0-9]+)\s*mins?/i,
    expiry: /超时[^>]*>([0-9]+)\s*分钟|Expiry[^>]*>([0-9]+)\s*mins?/i,
    
    // 技术细节
    imageId: /图像 ID[^>]*>([0-9a-fA-Fx]+)|Image ID[^>]*>([0-9a-fA-Fx]+)/i,
    ipfsUrl: /img 网址[^>]*>(https:\/\/[^<]+)|IPFS URL[^>]*>(https:\/\/[^<]+)/i,
    segments: /段[^>]*>([0-9]+)\s*段|Segments[^>]*>([0-9]+)/i,
    predicateType: /谓词类型[^>]*>([^<]+)|Predicate Type[^>]*>([^<]+)/i,
    predicateData: /谓词数据[^>]*>([0-9a-fA-Fx]+)|Predicate Data[^>]*>([0-9a-fA-Fx]+)/i
  };
  
  // 提取基本数据
  order.state = extractMatch(html, patterns.state) || 'Unknown';
  
  // 提取程序周期
  const cyclesMatch = html.match(patterns.cycles);
  if (cyclesMatch) {
    order.programCycles = parseInt((cyclesMatch[1] || cyclesMatch[2])?.replace(/,/g, '') || '0');
  }
  
  // 提取总周期
  const totalCyclesMatch = html.match(patterns.totalCycles);
  if (totalCyclesMatch) {
    order.totalCycles = parseInt((totalCyclesMatch[1] || totalCyclesMatch[2])?.replace(/,/g, '') || '0');
  }
  
  // 提取交付时间
  const timeMatch = html.match(patterns.deliveryTime);
  if (timeMatch) {
    const minutes = parseInt(timeMatch[1] || timeMatch[3] || '0');
    const seconds = parseInt(timeMatch[2] || timeMatch[4] || '0');
    order.deliveryTimeSeconds = minutes * 60 + seconds;
  }
  
  // 提取有效MHz
  const mhzMatch = html.match(patterns.effectiveMHz);
  if (mhzMatch) {
    order.effectiveMHz = parseFloat(mhzMatch[1] || mhzMatch[2] || '0');
  }
  
  // 提取ETH/MC
  const ethMatch = html.match(patterns.ethPerMC);
  if (ethMatch) {
    order.ethPerMC = parseFloat(ethMatch[1] || ethMatch[2] || '0');
  }
  
  // 提取价格信息
  const maxPriceMatch = html.match(patterns.maxPrice);
  if (maxPriceMatch) {
    order.maxPrice = parseFloat(maxPriceMatch[1] || maxPriceMatch[2] || maxPriceMatch[3] || '0');
  }
  
  // 提取交易哈希
  order.lockTxn = extractMatch(html, patterns.lockTxn);
  order.fulfillTxn = extractMatch(html, patterns.fulfillTxn);
  order.proofTxn = extractMatch(html, patterns.proofTxn);
  
  // 提取区块信息
  order.lockBlock = extractMatch(html, patterns.lockBlock);
  order.fulfillBlock = extractMatch(html, patterns.fulfillBlock);
  order.proofBlock = extractMatch(html, patterns.proofBlock);
  
  // 提取时间戳
  order.bidStartTime = extractMatch(html, patterns.bidStartTime);
  order.lockTimestamp = extractMatch(html, patterns.lockTimestamp);
  order.fulfillTimestamp = extractMatch(html, patterns.fulfillTimestamp);
  
  // 提取拍卖参数
  const rampMatch = html.match(patterns.rampUpPeriod);
  if (rampMatch) {
    const minutes = parseInt(rampMatch[1] || rampMatch[3] || '0');
    const seconds = parseInt(rampMatch[2] || rampMatch[4] || '0');
    order.rampUpPeriod = `${minutes}分${seconds}秒`;
  }
  
  order.lockTimeout = extractMatch(html, patterns.lockTimeout);
  order.expiry = extractMatch(html, patterns.expiry);
  
  // 提取技术细节
  order.imageId = extractMatch(html, patterns.imageId);
  order.ipfsUrl = extractMatch(html, patterns.ipfsUrl);
  order.segments = extractMatch(html, patterns.segments);
  order.predicateType = extractMatch(html, patterns.predicateType);
  order.predicateData = extractMatch(html, patterns.predicateData);
  
  // 如果没有找到有效数据，提供默认值
  if (!order.programCycles && !order.totalCycles) {
    log('⚠️ 未能解析到订单数据，可能是订单ID错误或网络问题', 'yellow');
  }
  
  return order;
}

function extractMatch(text, pattern) {
  const match = text.match(pattern);
  return match ? match[1] : null;
}

// 分析订单并生成建议
function analyzeOrder(order) {
  const analysis = {
    difficulty: 'medium',
    profitability: 'low',
    competition: 'high',
    recommendations: {}
  };
  
  // 分析难度
  if (order.programCycles > 5000000) {
    analysis.difficulty = 'high';
  } else if (order.programCycles < 1000000) {
    analysis.difficulty = 'low';
  }
  
  // 分析盈利性 - 基于最高价格和ETH/MC
  if (order.maxPrice) {
    if (order.maxPrice > 0.00001) {
      analysis.profitability = 'high';
    } else if (order.maxPrice > 0.000001) {
      analysis.profitability = 'medium';
    }
  } else if (order.ethPerMC > 0.000001) {
    analysis.profitability = 'high';
  } else if (order.ethPerMC > 0.0000001) {
    analysis.profitability = 'medium';
  }
  
  // 分析竞争激烈程度
  if (order.deliveryTimeSeconds < 60) {
    analysis.competition = 'very_high';
  } else if (order.deliveryTimeSeconds < 120) {
    analysis.competition = 'high';
  } else if (order.deliveryTimeSeconds < 300) {
    analysis.competition = 'medium';
  } else {
    analysis.competition = 'low';
  }
  
  // 生成配置建议
  generateRecommendations(analysis, order);
  
  return analysis;
}

function generateRecommendations(analysis, order) {
  const recs = analysis.recommendations;
  
  // 基于难度调整参数
  if (analysis.difficulty === 'high') {
    recs.max_mcycle_limit = Math.min(50000, order.programCycles);
    recs.peak_prove_khz = 400;
    recs.min_deadline = 300;
  } else if (analysis.difficulty === 'medium') {
    recs.max_mcycle_limit = Math.min(25000, order.programCycles);
    recs.peak_prove_khz = 450;
    recs.min_deadline = 240;
  } else {
    recs.max_mcycle_limit = Math.min(15000, order.programCycles);
    recs.peak_prove_khz = 500;
    recs.min_deadline = 180;
  }
  
  // 基于盈利性调整价格
  if (analysis.profitability === 'high') {
    recs.mcycle_price = "0.000000000001";
  } else if (analysis.profitability === 'medium') {
    recs.mcycle_price = "0.0000000000008";
  } else {
    recs.mcycle_price = "0.0000000000005";
  }
  
  // 基于竞争调整Gas费
  if (analysis.competition === 'very_high') {
    recs.lockin_priority_gas = 60000000000;
  } else if (analysis.competition === 'high') {
    recs.lockin_priority_gas = 45000000000;
  } else if (analysis.competition === 'medium') {
    recs.lockin_priority_gas = 30000000000;
  } else {
    recs.lockin_priority_gas = 20000000000;
  }
  
  // 并发建议
  if (order.deliveryTimeSeconds < 90) {
    recs.max_concurrent_proofs = 1;
  } else {
    recs.max_concurrent_proofs = 2;
  }
}

// 显示分析结果
function displayAnalysis(order, analysis) {
  log('\n' + '='.repeat(80), 'cyan');
  log('📊 订单完整分析报告', 'bright');
  log('='.repeat(80), 'cyan');
  
  log(`\n🔍 订单基本信息:`, 'yellow');
  log(`   状态: ${order.state || '未知'}`);
  log(`   程序周期: ${order.programCycles?.toLocaleString() || '未知'}`);
  log(`   总周期: ${order.totalCycles?.toLocaleString() || '未知'}`);
  log(`   交付时间: ${order.deliveryTimeSeconds || '未知'} 秒`);
  log(`   有效MHz: ${order.effectiveMHz || '未知'}`);
  log(`   每兆周期收益: ${order.ethPerMC || '未知'} ETH/MC`);
  
  // 价格信息
  if (order.maxPrice) {
    log(`\n💰 价格信息:`, 'yellow');
    log(`   最低价格: 0 ETH`);
    log(`   最高价格: ${order.maxPrice} ETH`);
  }
  
  // 交易哈希
  if (order.lockTxn || order.fulfillTxn || order.proofTxn) {
    log(`\n🔗 交易哈希:`, 'yellow');
    if (order.lockTxn) log(`   锁定交易: ${order.lockTxn}`);
    if (order.fulfillTxn) log(`   成交交易: ${order.fulfillTxn}`);
    if (order.proofTxn) log(`   证明交付: ${order.proofTxn}`);
  }
  
  // 区块信息
  if (order.lockBlock || order.fulfillBlock || order.proofBlock) {
    log(`\n🧱 区块信息:`, 'yellow');
    if (order.lockBlock) log(`   锁定区块: ${order.lockBlock}`);
    if (order.fulfillBlock) log(`   履行区块: ${order.fulfillBlock}`);
    if (order.proofBlock) log(`   证明区块: ${order.proofBlock}`);
  }
  
  // 时间戳
  if (order.bidStartTime || order.lockTimestamp || order.fulfillTimestamp) {
    log(`\n⏰ 时间戳:`, 'yellow');
    if (order.bidStartTime) log(`   出价开始: ${order.bidStartTime}`);
    if (order.lockTimestamp) log(`   锁定时间: ${order.lockTimestamp}`);
    if (order.fulfillTimestamp) log(`   履行时间: ${order.fulfillTimestamp}`);
  }
  
  // 拍卖参数
  if (order.rampUpPeriod || order.lockTimeout || order.expiry) {
    log(`\n🎯 拍卖参数:`, 'yellow');
    if (order.rampUpPeriod) log(`   爬坡期: ${order.rampUpPeriod}`);
    if (order.lockTimeout) log(`   锁定超时: ${order.lockTimeout} 分钟`);
    if (order.expiry) log(`   超时期限: ${order.expiry} 分钟`);
  }
  
  // 技术细节
  if (order.imageId || order.ipfsUrl || order.segments || order.predicateType) {
    log(`\n🔬 技术细节:`, 'yellow');
    if (order.imageId) log(`   图像ID: ${order.imageId}`);
    if (order.ipfsUrl) log(`   IPFS链接: ${order.ipfsUrl}`);
    if (order.segments) log(`   段数: ${order.segments}`);
    if (order.predicateType) log(`   谓词类型: ${order.predicateType}`);
    if (order.predicateData) log(`   谓词数据: ${order.predicateData.substring(0, 32)}...`);
  }
  
  log(`\n📈 智能分析:`, 'green');
  log(`   难度级别: ${getDifficultyText(analysis.difficulty)}`);
  log(`   盈利能力: ${getProfitabilityText(analysis.profitability)}`);
  log(`   竞争程度: ${getCompetitionText(analysis.competition)}`);
  
  log(`\n⚙️ 推荐配置:`, 'bright');
  log(`   mcycle_price: "${analysis.recommendations.mcycle_price}"`);
  log(`   peak_prove_khz: ${analysis.recommendations.peak_prove_khz}`);
  log(`   max_mcycle_limit: ${analysis.recommendations.max_mcycle_limit}`);
  log(`   min_deadline: ${analysis.recommendations.min_deadline}`);
  log(`   max_concurrent_proofs: ${analysis.recommendations.max_concurrent_proofs}`);
  log(`   lockin_priority_gas: ${analysis.recommendations.lockin_priority_gas}`);
  
  log(`\n💡 配置建议:`, 'blue');
  generateAdvice(analysis);
}

function getDifficultyText(difficulty) {
  const texts = {
    low: '🟢 低 (轻松处理)',
    medium: '🟡 中等 (需要优化)',
    high: '🔴 高 (需要强力GPU)'
  };
  return texts[difficulty] || difficulty;
}

function getProfitabilityText(profitability) {
  const texts = {
    low: '📉 低 (收益有限)',
    medium: '📊 中等 (收益适中)',
    high: '📈 高 (收益丰厚)'
  };
  return texts[profitability] || profitability;
}

function getCompetitionText(competition) {
  const texts = {
    low: '🐌 低 (竞争不激烈)',
    medium: '🏃 中等 (适度竞争)',
    high: '🏃‍♂️ 高 (激烈竞争)',
    very_high: '🔥 极高 (白热化竞争)'
  };
  return texts[competition] || competition;
}

function generateAdvice(analysis) {
  const advice = [];
  
  if (analysis.difficulty === 'high') {
    advice.push('   • 高难度任务，建议使用RTX 4080/4090级别显卡');
    advice.push('   • 增加最小截止时间，确保任务完成');
  }
  
  if (analysis.profitability === 'low') {
    advice.push('   • 低盈利任务，建议降低报价以增加中标机会');
    advice.push('   • 考虑寻找更高价值的任务类型');
  }
  
  if (analysis.competition === 'very_high') {
    advice.push('   • 竞争极其激烈，建议提高Gas费用');
    advice.push('   • 优化硬件配置，提升处理速度');
  }
  
  if (analysis.recommendations.max_concurrent_proofs === 1) {
    advice.push('   • 建议单任务处理，确保稳定性');
  }
  
  if (advice.length === 0) {
    advice.push('   • 配置已优化，可直接使用');
  }
  
  advice.forEach(item => log(item));
}

// 主函数
async function main() {
  log('🚀 Boundless订单分析器', 'bright');
  log('输入订单ID来获取配置建议\n', 'cyan');
  
  rl.question('请输入订单ID: ', async (orderId) => {
    try {
      log('\n⏳ 正在获取订单数据...', 'yellow');
      
      const orderData = await fetchOrderData(orderId);
      
      // 检查是否成功获取数据
      if (!orderData.programCycles && !orderData.totalCycles) {
        log('⚠️ 无法自动解析订单数据，是否手动输入? (y/n)', 'yellow');
        
        rl.question('', (answer) => {
          if (answer.toLowerCase() === 'y') {
            manualInput();
          } else {
            log('分析终止', 'red');
            rl.close();
          }
        });
        return;
      }
      
      const analysis = analyzeOrder(orderData);
      displayAnalysis(orderData, analysis);
      
      log('\n✅ 分析完成！', 'green');
      log('建议运行2-3小时测试配置效果', 'blue');
      
    } catch (error) {
      log(`\n❌ 错误: ${error.message}`, 'red');
      log('是否手动输入订单数据? (y/n)', 'yellow');
      
      rl.question('', (answer) => {
        if (answer.toLowerCase() === 'y') {
          manualInput();
        } else {
          log('分析终止', 'red');
          rl.close();
        }
      });
    }
  });
}

// 手动输入数据
function manualInput() {
  log('\n📝 手动输入订单数据:', 'cyan');
  
  const manualOrder = {};
  
  rl.question('程序周期数 (例如: 6294047): ', (cycles) => {
    manualOrder.programCycles = parseInt(cycles) || 0;
    
    rl.question('交付时间(秒) (例如: 72): ', (time) => {
      manualOrder.deliveryTimeSeconds = parseInt(time) || 0;
      
      rl.question('每兆周期收益 (例如: 0.00000001): ', (ethPerMC) => {
        manualOrder.ethPerMC = parseFloat(ethPerMC) || 0;
        
        manualOrder.state = 'Manual Input';
        
        const analysis = analyzeOrder(manualOrder);
        displayAnalysis(manualOrder, analysis);
        
        log('\n✅ 分析完成！', 'green');
        log('建议运行2-3小时测试配置效果', 'blue');
        
        rl.close();
      });
    });
  });
}

// 运行脚本
if (require.main === module) {
  main();
}

module.exports = { analyzeOrder, fetchOrderData }; 