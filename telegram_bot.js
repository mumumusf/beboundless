const TelegramBot = require('node-telegram-bot-api');
const https = require('https');

// 机器人Token
const token = '8185015603:AAE26ZwNvlPfp-24_rLhGygkgid-Ft80Nkc';

// 创建机器人实例
const bot = new TelegramBot(token, { polling: true });

// 用户状态存储
const userStates = new Map();

// 语言配置
const languages = {
    'zh': {
        welcome: `🌟 欢迎使用 Beboundless 全能分析机器人！

━━━━━━━━━━━━━━━━━━━━━━━━━
📊 专业的区块链数据分析工具
━━━━━━━━━━━━━━━━━━━━━━━━━

🎯 主要功能:
• 📈 实时查询证明者统计数据
• 🔍 智能分析订单数据
• ⚙️ 生成GPU配置建议
• 🌐 支持主网/测试网双网络
• 🔄 显示订单数量和成功率
• 💎 查看证明周期和收益信息

🚀 快速开始:
/query - 📊 查询证明者数据
/analyze - 🔍 分析订单数据
/language - 🌍 切换语言
/help - ❓ 帮助文档

━━━━━━━━━━━━━━━━━━━━━━━━━
💬 联系频道: https://t.me/YOYOZKS
━━━━━━━━━━━━━━━━━━━━━━━━━`,
        
        help: `📚 详细使用指南

━━━━━━━━━━━━━━━━━━━━━━━━━
🔍 证明者查询流程
━━━━━━━━━━━━━━━━━━━━━━━━━

📝 步骤说明:
1️⃣ 发送 /query 命令
2️⃣ 选择网络类型 (主网/测试网)
3️⃣ 输入证明者地址
4️⃣ 获取详细统计信息

━━━━━━━━━━━━━━━━━━━━━━━━━
🔍 订单分析流程
━━━━━━━━━━━━━━━━━━━━━━━━━

📝 步骤说明:
1️⃣ 发送 /analyze 命令
2️⃣ 输入订单ID或手动输入数据
3️⃣ 获取智能分析结果
4️⃣ 查看GPU配置建议

━━━━━━━━━━━━━━━━━━━━━━━━━
📊 查询结果包含
━━━━━━━━━━━━━━━━━━━━━━━━━

• 🌐 网络类型
• 📍 证明者地址 (简化显示)
• 📈 接受订单总数
• ⚡ 证明周期数量
• ✅ 任务完成成功率

━━━━━━━━━━━━━━━━━━━━━━━━━
🔍 分析结果包含
━━━━━━━━━━━━━━━━━━━━━━━━━

• 📊 订单基本信息
• 📈 智能分析 (难度/盈利/竞争)
• ⚙️ GPU配置建议
• 💡 优化建议

━━━━━━━━━━━━━━━━━━━━━━━━━
🌍 多语言支持
━━━━━━━━━━━━━━━━━━━━━━━━━

/language - 中文 ⇄ English

━━━━━━━━━━━━━━━━━━━━━━━━━
📝 地址格式要求
━━━━━━━━━━━━━━━━━━━━━━━━━

✅ 正确格式: 0x + 40位十六进制字符
📋 示例: 0xa1b2c3d4e5f6789012345678901234567890abcd

━━━━━━━━━━━━━━━━━━━━━━━━━
🌐 支持的网络
━━━━━━━━━━━━━━━━━━━━━━━━━

🔧 测试网: explorer.testnet.beboundless.xyz
🌐 主网: explorer.beboundless.xyz

━━━━━━━━━━━━━━━━━━━━━━━━━
💬 联系频道: https://t.me/YOYOZKS
━━━━━━━━━━━━━━━━━━━━━━━━━`,

        selectNetwork: '🌐 请选择要查询的网络类型:',
        testnet: '🔧 测试网络',
        mainnet: '🌐 主网络',
        networkSelected: '✅ 网络已选择:',
        enterAddress: '📝 请输入要查询的证明者地址:\n\n💡 地址格式: 0x + 40位十六进制字符',
        invalidAddress: '❌ 地址格式错误！\n\n📋 请输入有效的以太坊地址\n格式: 0x开头的40位十六进制字符',
        querying: '🔍 正在查询数据中，请稍候...',
        queryError: '❌ 查询失败:',
        useQueryFirst: '💡 请先使用 /query 命令开始查询',
        continueQuery: '🔄 继续查询，请使用 /query 命令',
        
        // 结果格式化
        network: '🌐 网络:',
        proverAddress: '📍 证明者地址:',
        ordersAccepted: '📊 接受订单数:',
        cyclesProved: '🔄 证明周期数:',
        successRate: '✅ 完成成功率:',
        
        // 语言切换
        selectLanguage: '请选择语言 / Please select language:',
        chinese: '🇨🇳 中文',
        english: '🇺🇸 English',
        languageChanged: '✅ 语言已切换为中文',
        
        // 网络名称
        testnetName: '测试网',
        mainnetName: '主网',
        
        // 订单分析相关
        analyzeWelcome: '🔍 欢迎使用订单分析功能！',
        selectAnalyzeMode: '请选择分析模式:',
        analyzeByOrderId: '🆔 通过订单ID分析',
        analyzeManually: '📝 手动输入数据',
        enterOrderId: '请输入订单ID:\n\n💡 格式: 0x开头的交易哈希',
        invalidOrderId: '❌ 订单ID格式错误！\n\n请输入有效的订单ID',
        analyzingOrder: '🔍 正在分析订单数据，请稍候...',
        analyzeError: '❌ 分析失败:',
        
        // 手动输入
        enterProgramCycles: '请输入程序周期数:\n\n💡 例如: 6294047',
        enterDeliveryTime: '请输入交付时间(秒):\n\n💡 例如: 72',
        enterEthPerMC: '请输入每兆周期收益:\n\n💡 例如: 0.00000001 (可选，输入0跳过)',
        
        // 分析结果文本
        analysisResult: '📊 订单分析结果',
        basicInfo: '🔍 订单基本信息',
        smartAnalysis: '📈 智能分析',
        recommendations: '⚙️ 推荐配置',
        suggestions: '💡 配置建议',
        
        // 分析级别
        difficultyLow: '🟢 低 (轻松处理)',
        difficultyMedium: '🟡 中等 (需要优化)',
        difficultyHigh: '🔴 高 (需要强力GPU)',
        profitabilityLow: '📉 低 (收益有限)',
        profitabilityMedium: '📊 中等 (收益适中)',
        profitabilityHigh: '📈 高 (收益丰厚)',
        competitionLow: '🐌 低 (竞争不激烈)',
        competitionMedium: '🏃 中等 (适度竞争)',
        competitionHigh: '🏃‍♂️ 高 (激烈竞争)',
        competitionVeryHigh: '🔥 极高 (白热化竞争)'
    },
    
    'en': {
        welcome: `🌟 Welcome to Beboundless All-in-One Analytics Bot!

━━━━━━━━━━━━━━━━━━━━━━━━━
📊 Professional Blockchain Data Analytics Tool
━━━━━━━━━━━━━━━━━━━━━━━━━

🎯 Key Features:
• 📈 Real-time prover statistics
• 🔍 Intelligent order analysis
• ⚙️ GPU configuration recommendations
• 🌐 Mainnet/Testnet dual network support
• 🔄 Order count and success rate tracking
• 💎 Proof cycles and earnings data

🚀 Quick Start:
/query - 📊 Query Prover Data
/analyze - 🔍 Analyze Order Data
/language - 🌍 Switch Language
/help - ❓ Help Guide

━━━━━━━━━━━━━━━━━━━━━━━━━
💬 Contact Channel: https://t.me/YOYOZKS
━━━━━━━━━━━━━━━━━━━━━━━━━`,
        
        help: `📚 Detailed User Guide

━━━━━━━━━━━━━━━━━━━━━━━━━
🔍 Query Process
━━━━━━━━━━━━━━━━━━━━━━━━━

📝 Step-by-Step:
1️⃣ Send /query command
2️⃣ Select network type (Mainnet/Testnet)
3️⃣ Enter prover address
4️⃣ Get detailed statistics

━━━━━━━━━━━━━━━━━━━━━━━━━
📊 Query Results Include
━━━━━━━━━━━━━━━━━━━━━━━━━

• 🌐 Network type
• 📍 Prover address (shortened)
• 📈 Total orders accepted
• ⚡ Proof cycles count
• ✅ Task success rate

━━━━━━━━━━━━━━━━━━━━━━━━━
🌍 Multi-language Support
━━━━━━━━━━━━━━━━━━━━━━━━━

/language - 中文 ⇄ English

━━━━━━━━━━━━━━━━━━━━━━━━━
📝 Address Format Requirements
━━━━━━━━━━━━━━━━━━━━━━━━━

✅ Correct format: 0x + 40 hex characters
📋 Example: 0xa1b2c3d4e5f6789012345678901234567890abcd

━━━━━━━━━━━━━━━━━━━━━━━━━
🌐 Supported Networks
━━━━━━━━━━━━━━━━━━━━━━━━━

🔧 Testnet: explorer.testnet.beboundless.xyz
🌐 Mainnet: explorer.beboundless.xyz

━━━━━━━━━━━━━━━━━━━━━━━━━
💬 Contact Channel: https://t.me/YOYOZKS
━━━━━━━━━━━━━━━━━━━━━━━━━`,

        selectNetwork: '🌐 Please select the network type to query:',
        testnet: '🔧 Test Network',
        mainnet: '🌐 Main Network',
        networkSelected: '✅ Network selected:',
        enterAddress: '📝 Please enter the prover address to query:\n\n💡 Address format: 0x + 40 hex characters',
        invalidAddress: '❌ Invalid address format!\n\n📋 Please enter a valid Ethereum address\nFormat: 40-character hex starting with 0x',
        querying: '🔍 Querying data, please wait...',
        queryError: '❌ Query failed:',
        useQueryFirst: '💡 Please use /query command first to start querying',
        continueQuery: '🔄 To continue querying, please use /query command',
        
        // 结果格式化
        network: '🌐 Network:',
        proverAddress: '📍 Prover Address:',
        ordersAccepted: '📊 Orders Accepted:',
        cyclesProved: '🔄 Cycles Proved:',
        successRate: '✅ Success Rate:',
        
        // 语言切换
        selectLanguage: '请选择语言 / Please select language:',
        chinese: '🇨🇳 中文',
        english: '🇺🇸 English',
        languageChanged: '✅ Language switched to English',
        
        // 网络名称
        testnetName: 'Testnet',
        mainnetName: 'Mainnet',
        
        // 订单分析相关
        analyzeWelcome: '🔍 Welcome to Order Analysis!',
        selectAnalyzeMode: 'Please select analysis mode:',
        analyzeByOrderId: '🆔 Analyze by Order ID',
        analyzeManually: '📝 Manual Data Input',
        enterOrderId: 'Please enter Order ID:\n\n💡 Format: Hash starting with 0x',
        invalidOrderId: '❌ Invalid Order ID format!\n\nPlease enter a valid Order ID',
        analyzingOrder: '🔍 Analyzing order data, please wait...',
        analyzeError: '❌ Analysis failed:',
        
        // 手动输入
        enterProgramCycles: 'Please enter program cycles:\n\n💡 Example: 6294047',
        enterDeliveryTime: 'Please enter delivery time (seconds):\n\n💡 Example: 72',
        enterEthPerMC: 'Please enter ETH per megacycle:\n\n💡 Example: 0.00000001 (optional, enter 0 to skip)',
        
        // 分析结果文本
        analysisResult: '📊 Order Analysis Result',
        basicInfo: '🔍 Order Basic Information',
        smartAnalysis: '📈 Smart Analysis',
        recommendations: '⚙️ Recommended Configuration',
        suggestions: '💡 Configuration Suggestions',
        
        // 分析级别
        difficultyLow: '🟢 Low (Easy Processing)',
        difficultyMedium: '🟡 Medium (Needs Optimization)',
        difficultyHigh: '🔴 High (Requires Powerful GPU)',
        profitabilityLow: '📉 Low (Limited Profit)',
        profitabilityMedium: '📊 Medium (Moderate Profit)',
        profitabilityHigh: '📈 High (High Profit)',
        competitionLow: '🐌 Low (Low Competition)',
        competitionMedium: '🏃 Medium (Moderate Competition)',
        competitionHigh: '🏃‍♂️ High (Intense Competition)',
        competitionVeryHigh: '🔥 Very High (Fierce Competition)'
    }
};

// 获取用户语言设置
function getUserLanguage(chatId) {
    const userState = userStates.get(chatId);
    return userState?.language || 'zh'; // 默认中文
}

// 获取文本
function getText(chatId, key) {
    const lang = getUserLanguage(chatId);
    return languages[lang][key] || languages['zh'][key];
}

// 验证地址格式
function isValidAddress(address) {
    const ethAddressRegex = /^0x[a-fA-F0-9]{40}$/;
    return ethAddressRegex.test(address);
}

// 格式化数字
function formatNumber(num) {
    if (num >= 1000000) {
        return (num / 1000000).toFixed(2) + 'M';
    } else if (num >= 1000) {
        return (num / 1000).toFixed(2) + 'K';
    }
    return num.toString();
}

// 查询beboundless数据
async function queryBeboundless(address, isMainnet = false) {
    return new Promise((resolve, reject) => {
        const hostname = isMainnet ? 'explorer.beboundless.xyz' : 'explorer.testnet.beboundless.xyz';
        const queryParams = '?_rsc=jj5uu';
        
        const options = {
            hostname: hostname,
            port: 443,
            path: `/provers/${address}${queryParams}`,
            method: 'GET',
            headers: {
                'Accept': '*/*',
                'Accept-Encoding': 'gzip, deflate, br, zstd',
                'Accept-Language': 'zh-CN,zh;q=0.9,en;q=0.8,en-GB;q=0.7,en-US;q=0.6',
                'Next-Router-Prefetch': '1',
                'Next-Router-State-Tree': '%5B%22%22%2C%7B%22children%22%3A%5B%22provers%22%2C%7B%22children%22%3A%5B%22__PAGE__%22%2C%7B%7D%2Cnull%2Cnull%5D%7D%2Cnull%2Cnull%5D%7D%2Cnull%2Cnull%2Ctrue%5D',
                'Next-Url': '/provers',
                'Priority': 'i',
                'Referer': `https://${hostname}/provers`,
                'Rsc': '1',
                'Sec-Ch-Ua': '"Not)A;Brand";v="8", "Chromium";v="138", "Microsoft Edge";v="138"',
                'Sec-Ch-Ua-Mobile': '?0',
                'Sec-Ch-Ua-Platform': '"Windows"',
                'Sec-Fetch-Dest': 'empty',
                'Sec-Fetch-Mode': 'cors',
                'Sec-Fetch-Site': 'same-origin',
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36 Edg/138.0.0.0'
            }
        };

        const req = https.request(options, (res) => {
            let data = '';
            
            // 处理 gzip 压缩
            let stream = res;
            if (res.headers['content-encoding'] === 'gzip') {
                const zlib = require('zlib');
                stream = res.pipe(zlib.createGunzip());
            }
            
            stream.on('data', (chunk) => {
                data += chunk;
            });
            
            stream.on('end', () => {
                try {
                    let proverData = null;
                    
                    // 查找包含统计数据的行
                    const statsMatch = data.match(/29:\{"maxMhz":([^}]+)\}/);
                    if (statsMatch) {
                        try {
                            const statsJson = '{' + statsMatch[1] + '}';
                            proverData = JSON.parse(statsJson);
                        } catch (e) {
                            // 解析失败，继续下一步
                        }
                    }
                    
                    // 如果没有找到统计数据，尝试其他方式
                    if (!proverData) {
                        const orderCountMatch = data.match(/"orderCount":(\d+)/);
                        const maxMhzMatch = data.match(/"maxMhz":([0-9.]+)/);
                        const successRateMatch = data.match(/"successRate":([0-9.]+)/);
                        const totalCyclesMatch = data.match(/"totalCycles":(\d+)/);
                        
                        if (orderCountMatch && maxMhzMatch) {
                            proverData = {
                                orderCount: parseInt(orderCountMatch[1]),
                                maxMhz: parseFloat(maxMhzMatch[1]),
                                successRate: successRateMatch ? parseFloat(successRateMatch[1]) : 0,
                                totalCycles: totalCyclesMatch ? parseInt(totalCyclesMatch[1]) : 0,
                                stakeEarnings: {}
                            };
                        }
                    }
                    
                    if (proverData) {
                        resolve(proverData);
                    } else {
                        reject(new Error('未找到证明者数据'));
                    }
                    
                } catch (error) {
                    reject(error);
                }
            });
        });
        
        req.on('error', (error) => {
            reject(error);
        });
        
        req.end();
    });
}

// ============ 订单分析相关函数 ============

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
    
    // 提取关键信息的正则表达式
    const patterns = {
        state: /Order state[^>]*>([^<]+)<|state[^>]*>([^<]+)<|Fulfilled|Pending|Cancelled/i,
        cycles: /Program cycles[^>]*>([0-9,]+)\s*cycles|([0-9,]+)\s*cycles/i,
        totalCycles: /total cycles[^>]*>([0-9,]+)\s*cycles|([0-9,]+)\s*cycles/i,
        deliveryTime: /Proof delivery time[^>]*>([0-9]+)\s*minute[^<]*([0-9]+)\s*second|([0-9]+)\s*minute[^<]*([0-9]+)\s*second/i,
        effectiveMHz: /Effective MHz[^>]*>([0-9.]+)\s*MHz|([0-9.]+)\s*MHz/i,
        ethPerMC: /ETH per Megacycle[^>]*>([0-9.]+)\s*ETH\/MC|([0-9.]+)\s*ETH\/MC/i,
        maxPrice: /最高价格[^>]*>([0-9.]+)\s*ETH|Max Price[^>]*>([0-9.]+)\s*ETH|End:\s*([0-9.]+)\s*ETH/i
    };
    
    // 提取基本数据
    order.state = extractOrderMatch(html, patterns.state) || 'Unknown';
    
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
    
    return order;
}

function extractOrderMatch(text, pattern) {
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
    
    // 分析盈利性
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

// 格式化分析结果
function formatAnalysisResult(order, analysis, chatId) {
    const lang = getUserLanguage(chatId);
    
    // 获取难度文本
    const difficultyTexts = {
        'low': getText(chatId, 'difficultyLow'),
        'medium': getText(chatId, 'difficultyMedium'),
        'high': getText(chatId, 'difficultyHigh')
    };
    
    // 获取盈利性文本
    const profitabilityTexts = {
        'low': getText(chatId, 'profitabilityLow'),
        'medium': getText(chatId, 'profitabilityMedium'),
        'high': getText(chatId, 'profitabilityHigh')
    };
    
    // 获取竞争程度文本
    const competitionTexts = {
        'low': getText(chatId, 'competitionLow'),
        'medium': getText(chatId, 'competitionMedium'),
        'high': getText(chatId, 'competitionHigh'),
        'very_high': getText(chatId, 'competitionVeryHigh')
    };
    
    let result = `━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
    result += `${getText(chatId, 'analysisResult')}\n`;
    result += `━━━━━━━━━━━━━━━━━━━━━━━━━\n\n`;
    
    result += `${getText(chatId, 'basicInfo')}:\n`;
    result += `   ${lang === 'zh' ? '状态' : 'Status'}: ${order.state || (lang === 'zh' ? '未知' : 'Unknown')}\n`;
    result += `   ${lang === 'zh' ? '程序周期' : 'Program Cycles'}: ${order.programCycles?.toLocaleString() || (lang === 'zh' ? '未知' : 'Unknown')}\n`;
    result += `   ${lang === 'zh' ? '交付时间' : 'Delivery Time'}: ${order.deliveryTimeSeconds || (lang === 'zh' ? '未知' : 'Unknown')} ${lang === 'zh' ? '秒' : 'seconds'}\n`;
    result += `   ${lang === 'zh' ? '有效MHz' : 'Effective MHz'}: ${order.effectiveMHz || (lang === 'zh' ? '未知' : 'Unknown')}\n\n`;
    
    result += `${getText(chatId, 'smartAnalysis')}:\n`;
    result += `   ${lang === 'zh' ? '难度级别' : 'Difficulty'}: ${difficultyTexts[analysis.difficulty]}\n`;
    result += `   ${lang === 'zh' ? '盈利能力' : 'Profitability'}: ${profitabilityTexts[analysis.profitability]}\n`;
    result += `   ${lang === 'zh' ? '竞争程度' : 'Competition'}: ${competitionTexts[analysis.competition]}\n\n`;
    
    result += `${getText(chatId, 'recommendations')}:\n`;
    result += `   mcycle_price: "${analysis.recommendations.mcycle_price}"\n`;
    result += `   peak_prove_khz: ${analysis.recommendations.peak_prove_khz}\n`;
    result += `   max_mcycle_limit: ${analysis.recommendations.max_mcycle_limit}\n`;
    result += `   min_deadline: ${analysis.recommendations.min_deadline}\n`;
    result += `   max_concurrent_proofs: ${analysis.recommendations.max_concurrent_proofs}\n`;
    result += `   lockin_priority_gas: ${analysis.recommendations.lockin_priority_gas}\n\n`;
    
    result += `${getText(chatId, 'suggestions')}:\n`;
    
    // 生成建议
    const suggestions = [];
    if (analysis.difficulty === 'high') {
        suggestions.push(lang === 'zh' ? '• 高难度任务，建议使用RTX 4080/4090级别显卡' : '• High difficulty task, recommend RTX 4080/4090 GPU');
        suggestions.push(lang === 'zh' ? '• 增加最小截止时间，确保任务完成' : '• Increase minimum deadline to ensure completion');
    }
    
    if (analysis.profitability === 'low') {
        suggestions.push(lang === 'zh' ? '• 低盈利任务，建议降低报价以增加中标机会' : '• Low profit task, recommend lower pricing for better chances');
        suggestions.push(lang === 'zh' ? '• 考虑寻找更高价值的任务类型' : '• Consider looking for higher value task types');
    }
    
    if (analysis.competition === 'very_high') {
        suggestions.push(lang === 'zh' ? '• 竞争极其激烈，建议提高Gas费用' : '• Very intense competition, recommend higher Gas fees');
        suggestions.push(lang === 'zh' ? '• 优化硬件配置，提升处理速度' : '• Optimize hardware configuration for better speed');
    }
    
    if (analysis.recommendations.max_concurrent_proofs === 1) {
        suggestions.push(lang === 'zh' ? '• 建议单任务处理，确保稳定性' : '• Recommend single task processing for stability');
    }
    
    if (suggestions.length === 0) {
        suggestions.push(lang === 'zh' ? '• 配置已优化，可直接使用' : '• Configuration optimized, ready to use');
    }
    
    result += suggestions.join('\n');
    result += `\n\n✅ ${lang === 'zh' ? '分析完成！' : 'Analysis completed!'}`;
    result += `\n\n⚠️ ${lang === 'zh' ? '配置是参考建议，实际按照机器调试' : 'Configuration is a reference suggestion, adjust according to actual machine testing'}`;
    
    return result;
}

// 格式化查询结果
function formatResult(address, data, isMainnet, chatId) {
    const shortAddress = address.substring(0, 6) + '...' + address.substring(38);
    const orderCount = data.orderCount || 0;
    const totalCycles = formatNumber(data.totalCycles || 0);
    const successRate = (data.successRate || 0).toFixed(2);
    const networkName = isMainnet ? getText(chatId, 'mainnetName') : getText(chatId, 'testnetName');
    
    return `${getText(chatId, 'network')} ${networkName}
${getText(chatId, 'proverAddress')} ${shortAddress}
${getText(chatId, 'ordersAccepted')} ${orderCount}
${getText(chatId, 'cyclesProved')} ${totalCycles}
${getText(chatId, 'successRate')} ${successRate}%`;
}

// /start 命令
bot.onText(/\/start/, (msg) => {
    const chatId = msg.chat.id;
    
    // 保持语言设置，清除其他状态
    const currentState = userStates.get(chatId);
    const currentLang = currentState?.language || 'zh';
    userStates.set(chatId, { language: currentLang });
    
    bot.sendMessage(chatId, getText(chatId, 'welcome'));
});

// /help 命令
bot.onText(/\/help/, (msg) => {
    const chatId = msg.chat.id;
    
    // 确保用户有默认语言设置
    if (!userStates.has(chatId)) {
        userStates.set(chatId, { language: 'zh' });
    }
    
    bot.sendMessage(chatId, getText(chatId, 'help'));
});

// /language 命令
bot.onText(/\/language/, (msg) => {
    const chatId = msg.chat.id;
    
    // 确保用户有默认语言设置
    if (!userStates.has(chatId)) {
        userStates.set(chatId, { language: 'zh' });
    }
    
    const currentState = userStates.get(chatId);
    userStates.set(chatId, { ...currentState, step: 'selectLanguage' });
    
    const keyboard = {
        reply_markup: {
            inline_keyboard: [
                [
                    { text: getText(chatId, 'chinese'), callback_data: 'lang_zh' },
                    { text: getText(chatId, 'english'), callback_data: 'lang_en' }
                ]
            ]
        }
    };
    
    bot.sendMessage(chatId, getText(chatId, 'selectLanguage'), keyboard);
});

// /query 命令
bot.onText(/\/query/, (msg) => {
    const chatId = msg.chat.id;
    
    // 确保用户有默认语言设置
    if (!userStates.has(chatId)) {
        userStates.set(chatId, { language: 'zh' });
    }
    
    const currentState = userStates.get(chatId);
    userStates.set(chatId, { ...currentState, step: 'selectNetwork' });
    
    const keyboard = {
        reply_markup: {
            inline_keyboard: [
                [
                    { text: getText(chatId, 'testnet'), callback_data: 'network_testnet' },
                    { text: getText(chatId, 'mainnet'), callback_data: 'network_mainnet' }
                ]
            ]
        }
    };
    
    bot.sendMessage(chatId, getText(chatId, 'selectNetwork'), keyboard);
});

// /analyze 命令
bot.onText(/\/analyze/, (msg) => {
    const chatId = msg.chat.id;
    
    // 确保用户有默认语言设置
    if (!userStates.has(chatId)) {
        userStates.set(chatId, { language: 'zh' });
    }
    
    const currentState = userStates.get(chatId);
    userStates.set(chatId, { ...currentState, step: 'selectAnalyzeMode' });
    
    const keyboard = {
        reply_markup: {
            inline_keyboard: [
                [
                    { text: getText(chatId, 'analyzeByOrderId'), callback_data: 'analyze_by_id' },
                    { text: getText(chatId, 'analyzeManually'), callback_data: 'analyze_manual' }
                ]
            ]
        }
    };
    
    bot.sendMessage(chatId, getText(chatId, 'analyzeWelcome') + '\n\n' + getText(chatId, 'selectAnalyzeMode'), keyboard);
});

// 处理按钮回调
bot.on('callback_query', async (callbackQuery) => {
    const msg = callbackQuery.message;
    const chatId = msg.chat.id;
    const data = callbackQuery.data;
    
    // 确保用户有默认语言设置
    if (!userStates.has(chatId)) {
        userStates.set(chatId, { language: 'zh' });
    }
    
    if (data.startsWith('lang_')) {
        // 语言切换
        const newLang = data.replace('lang_', '');
        const currentState = userStates.get(chatId);
        userStates.set(chatId, { ...currentState, language: newLang });
        
        bot.editMessageText(
            getText(chatId, 'languageChanged'),
            {
                chat_id: chatId,
                message_id: msg.message_id
            }
        );
    } else if (data.startsWith('network_')) {
        // 网络选择
        const isMainnet = data === 'network_mainnet';
        const networkName = isMainnet ? getText(chatId, 'mainnetName') : getText(chatId, 'testnetName');
        
        const currentState = userStates.get(chatId);
        userStates.set(chatId, { 
            ...currentState,
            step: 'waitingForAddress', 
            isMainnet: isMainnet 
        });
        
        bot.editMessageText(
            `${getText(chatId, 'networkSelected')} ${networkName}\n\n${getText(chatId, 'enterAddress')}`,
            {
                chat_id: chatId,
                message_id: msg.message_id
            }
        );
    } else if (data.startsWith('analyze_')) {
        // 分析模式选择
        const currentState = userStates.get(chatId);
        
        if (data === 'analyze_by_id') {
            userStates.set(chatId, { 
                ...currentState,
                step: 'waitingForOrderId'
            });
            
            bot.editMessageText(
                getText(chatId, 'enterOrderId'),
                {
                    chat_id: chatId,
                    message_id: msg.message_id
                }
            );
        } else if (data === 'analyze_manual') {
            userStates.set(chatId, { 
                ...currentState,
                step: 'waitingForCycles',
                manualData: {}
            });
            
            bot.editMessageText(
                getText(chatId, 'enterProgramCycles'),
                {
                    chat_id: chatId,
                    message_id: msg.message_id
                }
            );
        }
    }
});

// 处理普通消息
bot.on('message', async (msg) => {
    const chatId = msg.chat.id;
    const text = msg.text;
    
    // 忽略命令消息
    if (text?.startsWith('/')) {
        return;
    }
    
    // 确保用户有默认语言设置
    if (!userStates.has(chatId)) {
        userStates.set(chatId, { language: 'zh' });
    }
    
    const userState = userStates.get(chatId);
    
    if (!userState || !userState.step) {
        bot.sendMessage(chatId, getText(chatId, 'useQueryFirst'));
        return;
    }
    
    if (userState.step === 'waitingForAddress') {
        const address = text.trim().toLowerCase();
        
        // 验证地址格式
        if (!isValidAddress(address)) {
            bot.sendMessage(chatId, getText(chatId, 'invalidAddress'));
            return;
        }
        
        // 显示查询中的消息
        const loadingMsg = await bot.sendMessage(chatId, getText(chatId, 'querying'));
        
        try {
            // 查询数据
            const result = await queryBeboundless(address, userState.isMainnet);
            
            // 格式化并发送结果
            const formattedResult = formatResult(address, result, userState.isMainnet, chatId);
            
            // 删除加载消息
            bot.deleteMessage(chatId, loadingMsg.message_id);
            
            // 发送结果
            bot.sendMessage(chatId, formattedResult);
            
            // 保持语言设置，清除其他状态
            userStates.set(chatId, { language: userState.language });
            
            // 提供继续查询的选项
            setTimeout(() => {
                bot.sendMessage(chatId, getText(chatId, 'continueQuery'));
            }, 1000);
            
        } catch (error) {
            // 删除加载消息
            bot.deleteMessage(chatId, loadingMsg.message_id);
            
            bot.sendMessage(chatId, `${getText(chatId, 'queryError')} ${error.message}`);
            
            // 保持语言设置，清除其他状态
            userStates.set(chatId, { language: userState.language });
        }
    } else if (userState.step === 'waitingForOrderId') {
        const orderId = text.trim();
        
        // 验证订单ID格式（简单验证）
        if (!orderId || orderId.length < 10) {
            bot.sendMessage(chatId, getText(chatId, 'invalidOrderId'));
            return;
        }
        
        // 显示分析中的消息
        const loadingMsg = await bot.sendMessage(chatId, getText(chatId, 'analyzingOrder'));
        
        try {
            // 获取订单数据
            const orderData = await fetchOrderData(orderId);
            
            // 分析订单
            const analysis = analyzeOrder(orderData);
            
            // 格式化结果
            const formattedResult = formatAnalysisResult(orderData, analysis, chatId);
            
            // 删除加载消息
            bot.deleteMessage(chatId, loadingMsg.message_id);
            
            // 发送结果
            bot.sendMessage(chatId, formattedResult);
            
            // 保持语言设置，清除其他状态
            userStates.set(chatId, { language: userState.language });
            
        } catch (error) {
            // 删除加载消息
            bot.deleteMessage(chatId, loadingMsg.message_id);
            
            bot.sendMessage(chatId, `${getText(chatId, 'analyzeError')} ${error.message}`);
            
            // 保持语言设置，清除其他状态
            userStates.set(chatId, { language: userState.language });
        }
    } else if (userState.step === 'waitingForCycles') {
        const cycles = parseInt(text.trim());
        
        if (!cycles || cycles <= 0) {
            bot.sendMessage(chatId, getText(chatId, 'enterProgramCycles'));
            return;
        }
        
        // 保存周期数据
        const currentState = userStates.get(chatId);
        userStates.set(chatId, { 
            ...currentState,
            step: 'waitingForDeliveryTime',
            manualData: { programCycles: cycles }
        });
        
        bot.sendMessage(chatId, getText(chatId, 'enterDeliveryTime'));
        
    } else if (userState.step === 'waitingForDeliveryTime') {
        const deliveryTime = parseInt(text.trim());
        
        if (!deliveryTime || deliveryTime <= 0) {
            bot.sendMessage(chatId, getText(chatId, 'enterDeliveryTime'));
            return;
        }
        
        // 保存交付时间数据
        const currentState = userStates.get(chatId);
        userStates.set(chatId, { 
            ...currentState,
            step: 'waitingForEthPerMC',
            manualData: { 
                ...currentState.manualData,
                deliveryTimeSeconds: deliveryTime
            }
        });
        
        bot.sendMessage(chatId, getText(chatId, 'enterEthPerMC'));
        
    } else if (userState.step === 'waitingForEthPerMC') {
        const ethPerMC = parseFloat(text.trim());
        
        // 创建手动订单数据
        const manualOrder = {
            state: 'Manual Input',
            programCycles: userState.manualData.programCycles,
            deliveryTimeSeconds: userState.manualData.deliveryTimeSeconds,
            ethPerMC: ethPerMC > 0 ? ethPerMC : 0
        };
        
        // 显示分析中的消息
        const loadingMsg = await bot.sendMessage(chatId, getText(chatId, 'analyzingOrder'));
        
        try {
            // 分析订单
            const analysis = analyzeOrder(manualOrder);
            
            // 格式化结果
            const formattedResult = formatAnalysisResult(manualOrder, analysis, chatId);
            
            // 删除加载消息
            bot.deleteMessage(chatId, loadingMsg.message_id);
            
            // 发送结果
            bot.sendMessage(chatId, formattedResult);
            
            // 保持语言设置，清除其他状态
            userStates.set(chatId, { language: userState.language });
            
        } catch (error) {
            // 删除加载消息
            bot.deleteMessage(chatId, loadingMsg.message_id);
            
            bot.sendMessage(chatId, `${getText(chatId, 'analyzeError')} ${error.message}`);
            
            // 保持语言设置，清除其他状态
            userStates.set(chatId, { language: userState.language });
        }
    }
});

// 错误处理
bot.on('error', (error) => {
    console.error('Telegram Bot Error:', error);
});

// 启动机器人
console.log('🤖 Beboundless 查询机器人已启动...');
console.log('📱 Bot Token:', token);
console.log('🌐 等待用户消息...'); 