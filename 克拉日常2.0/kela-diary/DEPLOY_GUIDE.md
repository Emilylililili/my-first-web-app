# Vercel 部署指南

## 🚀 部署步骤

### 1. 准备环境
确保你已经在本地测试通过：
```bash
npm install
npm run build
```

### 2. Vercel 平台设置

#### 方法一：通过 Vercel 网站
1. 访问 [vercel.com](https://vercel.com)
2. 点击 "New Project"
3. 导入你的 GitHub 仓库
4. 配置项目：
   - **Framework Preset**: Vue.js
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
   - **Install Command**: `npm install`

#### 方法二：通过 Vercel CLI
```bash
npm i -g vercel
vercel
```

### 3. 环境变量配置
在 Vercel 控制台中添加环境变量：
- `OPENROUTER_API_KEY`: 你的 OpenRouter API 密钥

### 4. 项目结构说明
```
api/
└── openrouter.js       # Serverless 函数，处理 API 代理
src/
├── services/
│   ├── aiBackground.ts # 已修改为使用 /api/openrouter
│   └── aiService.ts    # AI 服务配置
└── ...
vercel.json             # Vercel 配置文件
```

### 5. 重要注意事项

#### ✅ 已完成的配置
- [x] 创建 Vercel serverless 函数处理 API 代理
- [x] 修改前端 API 路径为 `/api/openrouter`
- [x] 创建 vercel.json 配置文件
- [x] 修复 TypeScript 类型错误

#### ⚠️ 部署前检查
1. **API 密钥**: 确保在 Vercel 控制台设置了 `OPENROUTER_API_KEY`
2. **构建测试**: 本地运行 `npm run build` 应该成功
3. **API 路径**: 前端代码现在使用 `/api/openrouter` 而不是 `/openrouter`

#### 🔧 可选优化
- 添加自定义域名
- 启用 HTTPS (Vercel 默认提供)
- 设置环境变量保护

### 6. 部署后验证
1. 访问部署的 URL
2. 测试 AI 功能是否正常工作
3. 检查浏览器控制台是否有 API 调用错误

### 7. 故障排除

#### API 调用失败
- 检查 Vercel 控制台中的环境变量
- 查看 Vercel Functions 日志
- 确认 API 密钥有效

#### 构建失败
- 检查 Node.js 版本是否符合要求 (^20.19.0 || >=22.12.0)
- 运行 `npm run lint` 检查代码质量
- 运行 `npm run type-check` 检查类型错误

### 8. 性能优化建议
- 考虑使用 CDN 加速静态资源
- 启用 Vercel Analytics 监控性能
- 使用 Vercel Edge Functions 优化响应时间

---

🎉 完成以上步骤后，你的项目应该能成功部署到 Vercel 并正常运行 AI 功能！