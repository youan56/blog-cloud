# 部署指南

## 1. 准备工作

### 1.1 CloudBase 配置
- ✅ 环境ID: `a-d6gb40txde961926e`
- ✅ 区域: `ap-shanghai`
- ✅ Publishable Key: 已创建
- ✅ 登录方式: 用户名密码已启用

### 1.2 创建 CloudBase 用户
登录前需要在 CloudBase 控制台创建第一个用户：
1. 访问: https://tcb.cloud.tencent.com/dev?envId=a-d6gb40txde961926e
2. 进入「用户管理」→「用户列表」
3. 点击「添加用户」创建管理员账号

## 2. Vercel 部署

### 方式一: 通过 Vercel CLI（推荐）

```bash
# 安装 Vercel CLI
npm i -g vercel

# 登录 Vercel
vercel login

# 部署
vercel

# 生产环境部署
vercel --prod
```

### 方式二: 通过 Vercel Dashboard

1. 访问 https://vercel.com/new
2. 导入 Git 仓库（需要先推送到 GitHub）
3. 框架预设选择「Vite」
4. 点击「Deploy」

## 3. 环境变量配置（可选）

如果需要动态配置，可以在 Vercel 中设置环境变量：
- `VITE_CLOUDBASE_ENV_ID`
- `VITE_CLOUDBASE_REGION`
- `VITE_CLOUDBASE_ACCESS_KEY`

## 4. 自定义域名配置

### 4.1 在 Vercel 添加域名
1. 进入项目设置 → Domains
2. 添加域名: `admin.hanyouan.cloud`
3. 配置 DNS CNAME 记录

### 4.2 DNS 配置
在腾讯云 DNS 控制台添加 CNAME 记录：
```
类型: CNAME
主机记录: admin
记录值: cname.vercel-dns.com
```

## 5. 本地测试

```bash
# 安装依赖
npm install

# 开发模式
npm run dev

# 构建
npm run build

# 预览构建结果
npm run preview
```

## 6. 项目结构

```
xinghuisama-admin/
├── src/
│   ├── lib/
│   │   ├── AuthContext.tsx    # 认证上下文
│   │   └── cloudbase.ts       # CloudBase 配置
│   ├── pages/
│   │   ├── LoginPage.tsx      # 登录页
│   │   └── Dashboard.tsx      # 管理后台
│   ├── types/
│   │   └── index.ts           # 类型定义
│   ├── App.tsx                # 主应用
│   ├── main.tsx               # 入口文件
│   └── index.css              # 全局样式
├── package.json
├── tsconfig.json
├── vite.config.ts
└── README.md
```

## 7. 功能说明

### 已实现功能
- ✅ 用户登录/登出
- ✅ 文章列表展示
- ✅ 文章删除
- ✅ 登录状态保护

### 待扩展功能
- ⏳ 文章创建/编辑
- ⏳ 标签管理
- ⏳ 图片上传
- ⏳ Markdown 编辑器
- ⏳ 预览功能

## 8. 数据库结构

### posts 集合
```javascript
{
  _id: string,
  title: string,
  content: string,
  summary: string,
  coverImage: string,
  tags: string[],
  status: 'draft' | 'published',
  createdAt: Date,
  updatedAt: Date,
  authorId: string,
  authorName: string
}
```

## 9. 注意事项

1. **Publishable Key 安全性**: 当前 Publishable Key 写在代码中，生产环境建议使用环境变量
2. **数据库权限**: 确保已配置数据库安全规则
3. **HTTPS**: Vercel 自动提供 HTTPS，无需额外配置
4. **域名解析**: 自定义域名配置后需等待 DNS 生效（通常 5-10 分钟）