# 💜 佑安 Mi 的云端博客

基于 Next.js 16 + Vercel + CloudBase 的现代化博客系统

## 🎯 特性

- ✅ 深色毛玻璃 UI 风格
- ✅ 管理后台部署到 Vercel
- ✅ 配置实时保存到云端
- ✅ 文章存入 CloudBase 数据库
- ✅ 密码安全（环境变量存储）

## 🚀 快速开始

### 1. 安装依赖

```bash
npm install
```

### 2. 配置环境变量

创建 `.env.local` 文件：

```bash
ADMIN_USERNAME=admin
ADMIN_PASSWORD=your_password
CLOUDBASE_ENV_ID=a-d6gb40txde961926e
CLOUDBASE_REGION=ap-shanghai
```

### 3. 本地开发

```bash
npm run dev
```

访问 http://localhost:3000

## 📦 部署到 Vercel

1. 推送代码到 GitHub
2. 在 Vercel 导入项目
3. 配置环境变量
4. 点击 Deploy

## 📁 项目结构

```
blog-cloud/
├── app/
│   ├── admin/          # 管理后台
│   ├── api/            # API 路由
│   ├── components/     # 组件
│   ├── context/        # React Context
│   └── lib/            # 工具函数
├── public/             # 静态资源
└── package.json
```

## 💜 作者

佑安 Mi - 在代码、学术与分子动力学模拟间穿梭的普通人
