const https = require('https');
const readline = require('readline');

// 创建读取接口
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

// 查询函数
function queryBeboundless(address, isMainnet = false) {
    // 构建查询 URL
    const baseUrl = isMainnet ? 
        'https://explorer.beboundless.xyz/provers/' : 
        'https://explorer.testnet.beboundless.xyz/provers/';
    const queryParams = '?_rsc=jj5uu';
    const fullUrl = baseUrl + address + queryParams;
    

    
    // 请求选项
    const hostname = isMainnet ? 'explorer.beboundless.xyz' : 'explorer.testnet.beboundless.xyz';
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
            'Referer': 'https://explorer.testnet.beboundless.xyz/provers',
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
    
    // 发送请求
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
                // 从响应数据中提取关键信息
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
                    // 查找包含数字的模式
                    const orderCountMatch = data.match(/"orderCount":(\d+)/);
                    const maxMhzMatch = data.match(/"maxMhz":([0-9.]+)/);
                    const successRateMatch = data.match(/"successRate":([0-9.]+)/);
                    const totalCyclesMatch = data.match(/"totalCycles":(\d+)/);
                    const orderEarningsMatch = data.match(/"orderEarnings":(\d+)/);
                    const avgEthPerMcMatch = data.match(/"avgEthPerMc":([0-9.e-]+)/);
                    
                    if (orderCountMatch && maxMhzMatch) {
                        proverData = {
                            orderCount: parseInt(orderCountMatch[1]),
                            maxMhz: parseFloat(maxMhzMatch[1]),
                            successRate: successRateMatch ? parseFloat(successRateMatch[1]) : 0,
                            totalCycles: totalCyclesMatch ? parseInt(totalCyclesMatch[1]) : 0,
                            orderEarnings: orderEarningsMatch ? parseInt(orderEarningsMatch[1]) : 0,
                            avgEthPerMc: avgEthPerMcMatch ? parseFloat(avgEthPerMcMatch[1]) : 0,
                            stakeEarnings: {}
                        };
                    }
                }
                
                if (proverData) {
                    displayProverTable(address, proverData, isMainnet);
                }
                
            } catch (error) {
                // 解析错误，不显示任何信息
            }
            
            // 继续查询或退出
            promptForNextQuery();
        });
    });
    
    req.on('error', (error) => {
        promptForNextQuery();
    });
    
    req.end();
}

// 验证地址格式
function isValidAddress(address) {
    // 检查是否是有效的以太坊地址格式
    const ethAddressRegex = /^0x[a-fA-F0-9]{40}$/;
    return ethAddressRegex.test(address);
}

// 显示简化的证明者数据
function displayProverTable(address, data, isMainnet = false) {
    // 格式化数据
    const shortAddress = address.substring(0, 6) + '...' + address.substring(38);
    const orderCount = data.orderCount || 0;
    const totalCycles = formatNumber(data.totalCycles || 0);
    const successRate = (data.successRate || 0).toFixed(2);
    const networkName = isMainnet ? '主网' : '测试网';
    
    console.log(`网络: ${networkName}`);
    console.log(`证明者地址: ${shortAddress}`);
    console.log(`接受订单数: ${orderCount}`);
    console.log(`证明周期数: ${totalCycles}`);
    console.log(`完成成功率: ${successRate}%`);
}

// 格式化数字（添加千位分隔符）
function formatNumber(num) {
    if (num >= 1000000) {
        return (num / 1000000).toFixed(2) + 'M';
    } else if (num >= 1000) {
        return (num / 1000).toFixed(2) + 'K';
    }
    return num.toString();
}

// 格式化ETH金额
function formatEthAmount(wei) {
    if (wei === 0) return '0 ETH';
    const eth = wei / 1e18;
    if (eth < 0.0001) {
        return eth.toExponential(4) + ' ETH';
    }
    return eth.toFixed(7) + ' ETH';
}

// 提示用户输入下一个查询
function promptForNextQuery() {
    // 检查 readline 接口是否还在活动状态
    if (rl.closed) {
        return;
    }
    
    rl.question('\n是否继续查询？(y/n): ', (answer) => {
        if (answer.toLowerCase() === 'y' || answer.toLowerCase() === 'yes') {
            promptForNetwork();
        } else {
            rl.close();
        }
    });
}

// 提示用户选择网络
function promptForNetwork() {
    rl.question('请选择网络 (1: 测试网, 2: 主网): ', (choice) => {
        const isMainnet = choice.trim() === '2';
        promptForAddress(isMainnet);
    });
}

// 提示用户输入地址
function promptForAddress(isMainnet = false) {
    const networkName = isMainnet ? '主网' : '测试网';
    rl.question(`请输入要查询的地址 (${networkName}) (例如: 0xb744874877ecb800eebf37217bd26f4411d2b326): `, (address) => {
        if (!address.trim()) {
            promptForAddress(isMainnet);
            return;
        }
        
        // 去除空格并转换为小写
        const cleanAddress = address.trim().toLowerCase();
        
        // 验证地址格式
        if (!isValidAddress(cleanAddress)) {
            promptForAddress(isMainnet);
            return;
        }
        
        // 执行查询
        queryBeboundless(cleanAddress, isMainnet);
    });
}

// 主程序
function main() {
    promptForNetwork();
}

// 启动程序
main(); 