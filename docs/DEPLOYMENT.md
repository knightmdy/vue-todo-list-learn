# Vue Todo List 部署指南

本文档详细介绍了Vue Todo List应用的部署流程和配置选项。

## 目录

- [构建准备](#构建准备)
- [本地构建](#本地构建)
- [静态托管部署](#静态托管部署)
- [服务器部署](#服务器部署)
- [CDN配置](#cdn配置)
- [性能优化](#性能优化)
- [监控和维护](#监控和维护)

## 构建准备

### 环境要求

- Node.js >= 16.0.0
- npm >= 7.0.0 或 yarn >= 1.22.0
- Git

### 依赖检查

```bash
# 检查Node.js版本
node --version

# 检查npm版本
npm --version

# 安装项目依赖
npm install
```

### 环境变量配置

创建生产环境配置文件：

```bash
# .env.production
VITE_APP_TITLE=Vue Todo List
VITE_APP_VERSION=1.0.0
VITE_APP_API_URL=https://api.example.com
VITE_APP_STORAGE_PREFIX=vue_todo_
VITE_APP_ENABLE_ANALYTICS=true
```

## 本地构建

### 标准构建

```bash
# 构建生产版本
npm run build

# 预览构建结果
npm run preview
```

### 构建分析

```bash
# 带分析的构建
npm run build:analyze

# 生成构建报告
npm run build:report
```

### 构建输出

构建完成后，`dist/` 目录包含：

```
dist/
├── assets/
│   ├── index-[hash].js      # 主应用代码
│   ├── index-[hash].css     # 样式文件
│   └── vendor-[hash].js     # 第三方库
├── index.html               # 入口HTML文件
└── favicon.ico              # 网站图标
```

## 静态托管部署

### Netlify 部署

1. **通过Git连接**
   ```bash
   # 推送代码到GitHub/GitLab
   git add .
   git commit -m "Ready for deployment"
   git push origin main
   ```

2. **Netlify配置**
   - 构建命令: `npm run build`
   - 发布目录: `dist`
   - Node版本: `16`

3. **netlify.toml配置**
   ```toml
   [build]
     publish = "dist"
     command = "npm run build"
   
   [build.environment]
     NODE_VERSION = "16"
   
   [[redirects]]
     from = "/*"
     to = "/index.html"
     status = 200
   
   [[headers]]
     for = "/assets/*"
     [headers.values]
       Cache-Control = "public, max-age=31536000, immutable"
   ```

### Vercel 部署

1. **安装Vercel CLI**
   ```bash
   npm i -g vercel
   ```

2. **部署命令**
   ```bash
   # 首次部署
   vercel

   # 生产部署
   vercel --prod
   ```

3. **vercel.json配置**
   ```json
   {
     "buildCommand": "npm run build",
     "outputDirectory": "dist",
     "framework": "vite",
     "rewrites": [
       { "source": "/(.*)", "destination": "/index.html" }
     ],
     "headers": [
       {
         "source": "/assets/(.*)",
         "headers": [
           {
             "key": "Cache-Control",
             "value": "public, max-age=31536000, immutable"
           }
         ]
       }
     ]
   }
   ```

### GitHub Pages 部署

1. **安装gh-pages**
   ```bash
   npm install --save-dev gh-pages
   ```

2. **package.json配置**
   ```json
   {
     "scripts": {
       "deploy": "npm run build && gh-pages -d dist"
     },
     "homepage": "https://username.github.io/vue-todo-list"
   }
   ```

3. **部署命令**
   ```bash
   npm run deploy
   ```

4. **GitHub Actions自动部署**
   ```yaml
   # .github/workflows/deploy.yml
   name: Deploy to GitHub Pages
   
   on:
     push:
       branches: [ main ]
   
   jobs:
     deploy:
       runs-on: ubuntu-latest
       steps:
         - uses: actions/checkout@v3
         
         - name: Setup Node.js
           uses: actions/setup-node@v3
           with:
             node-version: '16'
             cache: 'npm'
         
         - name: Install dependencies
           run: npm ci
         
         - name: Build
           run: npm run build
         
         - name: Deploy
           uses: peaceiris/actions-gh-pages@v3
           with:
             github_token: ${{ secrets.GITHUB_TOKEN }}
             publish_dir: ./dist
   ```

## 服务器部署

### Nginx 配置

1. **基础配置**
   ```nginx
   server {
       listen 80;
       server_name your-domain.com;
       root /var/www/vue-todo-list/dist;
       index index.html;
   
       # Gzip压缩
       gzip on;
       gzip_vary on;
       gzip_min_length 1024;
       gzip_types text/plain text/css text/xml text/javascript application/javascript application/xml+rss application/json;
   
       # 静态资源缓存
       location /assets/ {
           expires 1y;
           add_header Cache-Control "public, immutable";
       }
   
       # SPA路由支持
       location / {
           try_files $uri $uri/ /index.html;
       }
   
       # 安全头
       add_header X-Frame-Options "SAMEORIGIN" always;
       add_header X-XSS-Protection "1; mode=block" always;
       add_header X-Content-Type-Options "nosniff" always;
   }
   ```

2. **HTTPS配置**
   ```nginx
   server {
       listen 443 ssl http2;
       server_name your-domain.com;
       
       ssl_certificate /path/to/certificate.crt;
       ssl_certificate_key /path/to/private.key;
       
       # SSL配置
       ssl_protocols TLSv1.2 TLSv1.3;
       ssl_ciphers ECDHE-RSA-AES256-GCM-SHA512:DHE-RSA-AES256-GCM-SHA512;
       ssl_prefer_server_ciphers off;
       
       # 其他配置同上...
   }
   
   # HTTP重定向到HTTPS
   server {
       listen 80;
       server_name your-domain.com;
       return 301 https://$server_name$request_uri;
   }
   ```

### Docker 部署

1. **Dockerfile**
   ```dockerfile
   # 构建阶段
   FROM node:16-alpine as build-stage
   WORKDIR /app
   COPY package*.json ./
   RUN npm ci --only=production
   COPY . .
   RUN npm run build
   
   # 生产阶段
   FROM nginx:alpine as production-stage
   COPY --from=build-stage /app/dist /usr/share/nginx/html
   COPY nginx.conf /etc/nginx/nginx.conf
   EXPOSE 80
   CMD ["nginx", "-g", "daemon off;"]
   ```

2. **docker-compose.yml**
   ```yaml
   version: '3.8'
   services:
     vue-todo-list:
       build: .
       ports:
         - "80:80"
       environment:
         - NODE_ENV=production
       restart: unless-stopped
   ```

3. **构建和运行**
   ```bash
   # 构建镜像
   docker build -t vue-todo-list .
   
   # 运行容器
   docker run -d -p 80:80 vue-todo-list
   
   # 使用docker-compose
   docker-compose up -d
   ```

## CDN配置

### 资源CDN优化

1. **配置CDN域名**
   ```javascript
   // vite.config.ts
   export default defineConfig({
     build: {
       rollupOptions: {
         output: {
           assetFileNames: 'assets/[name]-[hash][extname]'
         }
       }
     },
     base: process.env.NODE_ENV === 'production' 
       ? 'https://cdn.example.com/vue-todo-list/' 
       : '/'
   })
   ```

2. **第三方库CDN**
   ```html
   <!-- index.html -->
   <script src="https://unpkg.com/vue@3/dist/vue.global.js"></script>
   <script src="https://unpkg.com/pinia@2/dist/pinia.iife.js"></script>
   ```

### 缓存策略

```javascript
// 服务端缓存配置
const cacheConfig = {
  // HTML文件 - 不缓存
  '*.html': 'no-cache',
  
  // 静态资源 - 长期缓存
  '/assets/*': 'public, max-age=31536000, immutable',
  
  // API接口 - 短期缓存
  '/api/*': 'public, max-age=300'
}
```

## 性能优化

### 构建优化

1. **代码分割**
   ```javascript
   // vite.config.ts
   export default defineConfig({
     build: {
       rollupOptions: {
         output: {
           manualChunks: {
             vendor: ['vue', 'pinia'],
             utils: ['./src/utils/index.ts']
           }
         }
       }
     }
   })
   ```

2. **资源压缩**
   ```javascript
   import { defineConfig } from 'vite'
   import { resolve } from 'path'
   
   export default defineConfig({
     build: {
       minify: 'terser',
       terserOptions: {
         compress: {
           drop_console: true,
           drop_debugger: true
         }
       }
     }
   })
   ```

### 运行时优化

1. **预加载关键资源**
   ```html
   <link rel="preload" href="/assets/main.js" as="script">
   <link rel="preload" href="/assets/main.css" as="style">
   ```

2. **Service Worker缓存**
   ```javascript
   // sw.js
   const CACHE_NAME = 'vue-todo-list-v1'
   const urlsToCache = [
     '/',
     '/assets/main.js',
     '/assets/main.css'
   ]
   
   self.addEventListener('install', event => {
     event.waitUntil(
       caches.open(CACHE_NAME)
         .then(cache => cache.addAll(urlsToCache))
     )
   })
   ```

## 监控和维护

### 错误监控

1. **Sentry集成**
   ```javascript
   // main.ts
   import * as Sentry from '@sentry/vue'
   
   Sentry.init({
     app,
     dsn: 'YOUR_SENTRY_DSN',
     environment: process.env.NODE_ENV
   })
   ```

2. **自定义错误上报**
   ```javascript
   // utils/errorReporting.ts
   export function reportError(error: Error, context?: any) {
     if (process.env.NODE_ENV === 'production') {
       // 发送到错误监控服务
       console.error('Error reported:', error, context)
     }
   }
   ```

### 性能监控

1. **Web Vitals**
   ```javascript
   // utils/performance.ts
   import { getCLS, getFID, getFCP, getLCP, getTTFB } from 'web-vitals'
   
   getCLS(console.log)
   getFID(console.log)
   getFCP(console.log)
   getLCP(console.log)
   getTTFB(console.log)
   ```

2. **自定义指标**
   ```javascript
   // 页面加载时间
   window.addEventListener('load', () => {
     const loadTime = performance.now()
     console.log('Page load time:', loadTime)
   })
   ```

### 健康检查

1. **健康检查端点**
   ```javascript
   // 如果有后端API
   app.get('/health', (req, res) => {
     res.json({
       status: 'ok',
       timestamp: new Date().toISOString(),
       version: process.env.npm_package_version
     })
   })
   ```

2. **前端健康检查**
   ```javascript
   // utils/healthCheck.ts
   export function checkAppHealth() {
     return {
       localStorage: isLocalStorageAvailable(),
       performance: performance.now() < 5000,
       timestamp: new Date().toISOString()
     }
   }
   ```

## 故障排除

### 常见部署问题

1. **路由404错误**
   - 确保服务器配置了SPA路由回退
   - 检查base路径配置

2. **静态资源加载失败**
   - 检查资源路径配置
   - 验证CDN配置

3. **环境变量未生效**
   - 确保环境变量以`VITE_`开头
   - 检查构建时的环境变量注入

### 性能问题诊断

1. **使用Lighthouse**
   ```bash
   # 安装Lighthouse CLI
   npm install -g lighthouse
   
   # 运行性能测试
   lighthouse https://your-domain.com --output html --output-path ./report.html
   ```

2. **Bundle分析**
   ```bash
   # 分析构建包大小
   npm run build:analyze
   ```

---

*部署指南版本: 1.0.0*  
*最后更新: 2024年*