const https = require('https');

// 配置
const BOT_TOKEN = '8185015603:AAE26ZwNvlPfp-24_rLhGygkgid-Ft80Nkc';
const WEBHOOK_URL = 'https://beboundless.vercel.app/api/webhook'; // 您的Vercel应用URL

// 设置webhook
async function setWebhook() {
    return new Promise((resolve, reject) => {
        const data = JSON.stringify({
            url: WEBHOOK_URL,
            allowed_updates: ['message', 'callback_query']
        });
        
        const options = {
            hostname: 'api.telegram.org',
            port: 443,
            path: `/bot${BOT_TOKEN}/setWebhook`,
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Content-Length': Buffer.byteLength(data)
            }
        };
        
        const req = https.request(options, (res) => {
            let responseData = '';
            
            res.on('data', (chunk) => {
                responseData += chunk;
            });
            
            res.on('end', () => {
                try {
                    const response = JSON.parse(responseData);
                    resolve(response);
                } catch (error) {
                    reject(error);
                }
            });
        });
        
        req.on('error', (error) => {
            reject(error);
        });
        
        req.write(data);
        req.end();
    });
}

// 获取webhook信息
async function getWebhookInfo() {
    return new Promise((resolve, reject) => {
        const options = {
            hostname: 'api.telegram.org',
            port: 443,
            path: `/bot${BOT_TOKEN}/getWebhookInfo`,
            method: 'GET'
        };
        
        const req = https.request(options, (res) => {
            let responseData = '';
            
            res.on('data', (chunk) => {
                responseData += chunk;
            });
            
            res.on('end', () => {
                try {
                    const response = JSON.parse(responseData);
                    resolve(response);
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

// 删除webhook
async function deleteWebhook() {
    return new Promise((resolve, reject) => {
        const options = {
            hostname: 'api.telegram.org',
            port: 443,
            path: `/bot${BOT_TOKEN}/deleteWebhook`,
            method: 'POST'
        };
        
        const req = https.request(options, (res) => {
            let responseData = '';
            
            res.on('data', (chunk) => {
                responseData += chunk;
            });
            
            res.on('end', () => {
                try {
                    const response = JSON.parse(responseData);
                    resolve(response);
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

// 主函数
async function main() {
    const command = process.argv[2];
    
    try {
        if (command === 'set') {
            console.log('设置webhook...');
            const result = await setWebhook();
            console.log('Webhook设置结果:', result);
        } else if (command === 'info') {
            console.log('获取webhook信息...');
            const result = await getWebhookInfo();
            console.log('Webhook信息:', result);
        } else if (command === 'delete') {
            console.log('删除webhook...');
            const result = await deleteWebhook();
            console.log('Webhook删除结果:', result);
        } else {
            console.log('使用方法:');
            console.log('  node setup-webhook.js set     - 设置webhook');
            console.log('  node setup-webhook.js info    - 获取webhook信息');
            console.log('  node setup-webhook.js delete  - 删除webhook');
            console.log('');
            console.log('注意: 部署到Vercel后，请修改WEBHOOK_URL为你的实际URL');
        }
    } catch (error) {
        console.error('错误:', error);
    }
}

main(); 