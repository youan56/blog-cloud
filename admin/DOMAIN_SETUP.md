# CloudBase 自定义域名配置指南

## 当前状态检查

✅ **CloudBase 环境已就绪**
- 环境ID: `a-d6gb40txde961926e`
- 区域: `ap-shanghai`
- 默认域名: `a-d6gb40txde961926e-1302011077.tcloudbaseapp.com`

✅ **Vercel 博客管理后台已开发完成**
- 登录页面 + 管理后台
- 连接 CloudBase 认证和数据库
- 已本地构建成功

## 域名配置流程

### 方案选择

根据你的需求，我建议两种方案：

**方案 A: 纯 CloudBase 托管**（推荐）
- 前端静态文件托管到 CloudBase
- 后端 API 使用 CloudBase 云函数
- 统一管理，开发简单

**方案 B: Vercel + CloudBase 混合**（当前方案）
- 前端部署到 Vercel
- 后端用 CloudBase
- 需要配置跨域（已完成）

### 详细配置步骤

#### 1. 在 CloudBase 控制台绑定域名
访问: https://tcb.cloud.tencent.com/dev?envId=a-d6gb40txde961926e

1. 进入「设置」→「域名管理」
2. 点击「绑定域名」
3. 输入: `www.hanyouan.cloud`
4. 选择自动签发证书（推荐）或上传已有证书
5. 提交申请

#### 2. 在腾讯云 DNS 配置 CNAME
域名: `hanyouan.cloud`（在腾讯云注册的）

添加两条记录：

**记录 1: Vercel 管理后台**
```
类型: CNAME
主机记录: admin
记录值: cname.vercel-dns.com
```

**记录 2: CloudBase 静态托管**
```
类型: CNAME  
主机记录: www
记录值: a-d6gb40txde961926e-1302011077.tcloudbaseapp.com
```

#### 3. 等待 DNS 生效
- DNS 生效时间: 5-30 分钟
- SSL 证书签发时间: 2-10 分钟

#### 4. 验证配置
访问以下地址检查是否正常：
- `https://admin.hanyouan.cloud` → Vercel 管理后台
- `https://www.hanyouan.cloud` → CloudBase 静态托管

## 备选方案（简单部署）

如果你希望快速上线，可以使用 CloudBase 的静态托管功能来托管管理后台：

### 步骤 1: 部署到 CloudBase 静态托管
```bash
# 进入项目目录
cd /root/.openclaw/workspace/xinghuisama-admin

# 安装 CloudBase CLI
npm install -g @cloudbase/cli

# 登录 CloudBase
tcb login

# 部署到静态托管
tcb hosting deploy ./dist -e a-d6gb40txde961926e
```

### 步骤 2: 访问地址
- 临时地址: `https://a-d6gb40txde961926e-1302011077.tcloudbaseapp.com`
- 配置后地址: `https://www.hanyouan.cloud`

## 常见问题

### Q: 为什么需要 SSL 证书？
A: CloudBase 要求 HTTPS 访问，会提供免费的自动 SSL 证书。

### Q: 两个域名（admin 和 www）怎么选择？
A: 建议：
- `admin.hanyouan.cloud` → 管理后台
- `www.hanyouan.cloud` → 用户访问的博客
- `blog.hanyouan.cloud` → 也可用作管理后台

### Q: 数据库还没创建？
A: 需要手动创建 `posts` 集合：
1. 进入 CloudBase 控制台 → 数据库
2. 创建集合: `posts`
3. 设置权限规则（初始可设为所有人可读写）

## 项目部署总结

✅ **已完成**
1. 完整的 React + TypeScript 管理后台
2. 集成 CloudBase 用户认证
3. 博客文章 CRUD 基础功能
4. 响应式 UI 设计
5. 构建打包配置

🚀 **下一步建议**
1. 将项目推送到 GitHub
2. 连接到 Vercel 自动部署
3. 配置自定义域名
4. 创建初始管理员账户
5. 完善文章编辑功能

需要我帮你执行哪个步骤？建议先推到 GitHub，然后部署到 Vercel。