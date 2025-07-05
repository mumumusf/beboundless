# 🚀 Vercel 部署指南

## 📋 部署前检查

### ✅ 必需文件清单
- [x] `vercel.json` - Vercel配置文件
- [x] `api/webhook.js` - Webhook处理器（包含订单分析功能）
- [x] `setup-webhook.js` - Webhook设置脚本
- [x] `package.json` - 项目配置

### 🔧 功能完整性
- [x] 📊 证明者查询功能
- [x] 🔍 订单分析功能（新增）
- [x] 🌍 中英双语支持
- [x] ⚙️ GPU配置建议
- [x] 💡 智能分析功能

## 🎯 部署步骤

### 1. 安装 Vercel CLI
```bash
npm install -g vercel
```

### 2. 登录 Vercel
```bash
vercel login
```

### 3. 部署项目
```bash
vercel --prod
```

### 4. 记录部署URL
部署完成后，Vercel会提供一个URL，例如：
```
https://your-bot-name.vercel.app
```

### 5. 设置Webhook
修改 `setup-webhook.js` 中的 `WEBHOOK_URL`：
```javascript
const WEBHOOK_URL = 'https://your-bot-name.vercel.app/api/webhook';
```

然后运行：
```bash
node setup-webhook.js set
```

### 6. 验证部署
```bash
node setup-webhook.js info
```

## 🌟 新功能说明

### 📊 订单分析功能
现在机器人支持两种分析模式：

1. **订单ID分析**
   - 自动获取Boundless Explorer数据
   - 智能解析订单信息
   - 生成精准配置建议

2. **手动输入分析**
   - 支持程序周期数输入
   - 交付时间参数设置
   - ETH收益率配置

### ⚙️ 智能配置建议
- **mcycle_price**: 基于盈利性智能定价
- **peak_prove_khz**: 根据难度优化频率
- **max_mcycle_limit**: 动态周期限制
- **min_deadline**: 智能截止时间建议
- **max_concurrent_proofs**: 并发处理优化
- **lockin_priority_gas**: 竞争度Gas费调整

### 📈 智能分析指标
- **难度评估**: 低/中/高三级评估
- **盈利分析**: 基于市场数据的收益预测
- **竞争分析**: 实时竞争激烈程度评估

## 📱 Telegram 使用指南

### 基本命令
```
/start - 启动机器人
/query - 查询证明者数据
/analyze - 分析订单数据（新功能）
/language - 切换语言
/help - 帮助信息
```

### 订单分析流程
```
1. 发送 /analyze
2. 选择分析模式：
   📋 订单ID分析 → 输入订单ID → 获取分析结果
   📝 手动输入 → 逐步输入参数 → 获取分析结果
```

## 🔧 环境变量配置

在Vercel面板中设置环境变量：
- `BOT_TOKEN`: 你的Telegram机器人Token

## 🚨 重要提示

### ⚠️ 配置免责声明
所有GPU配置建议仅供参考，实际使用时请：
- 根据具体硬件情况调试
- 监控系统稳定性
- 逐步优化参数
- 注意散热和功耗

### 🔄 状态管理限制
- Vercel无服务器函数重启时会丢失用户状态
- 适合短期交互使用
- 长期状态需要外部存储

## 🎉 部署优势

### ✅ Vercel 部署优势
- **零维护**: 无需24/7服务器运行
- **自动扩展**: 根据负载自动调整
- **全球CDN**: 世界各地快速响应
- **HTTPS自动**: 安全连接保证
- **免费层**: 个人使用完全免费

### 🚀 性能特性
- **快速响应**: Webhook模式实时处理
- **高可用性**: 99.9%+ 服务可用性
- **智能分析**: AI驱动的配置建议
- **多语言**: 无缝中英文切换

## 🛟 故障排除

### 常见问题

1. **Webhook设置失败**
   ```bash
   # 检查URL是否正确
   curl -X POST https://your-bot-name.vercel.app/api/webhook
   ```

2. **机器人无响应**
   ```bash
   # 检查Webhook状态
   node setup-webhook.js info
   ```

3. **订单分析失败**
   - 检查订单ID格式
   - 确认网络连接正常
   - 验证Boundless Explorer可访问性

### 调试模式
在Vercel面板中查看函数日志，获取详细错误信息。

## 📞 技术支持

- **Telegram频道**: https://t.me/YOYOZKS
- **问题反馈**: 通过Telegram联系
- **功能建议**: 欢迎提出改进意见

---

**🎯 现在你的机器人已经是一个完整的Beboundless生态分析工具了！** 