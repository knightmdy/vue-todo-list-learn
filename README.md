# Vue Todo List

<div align="center">

![Vue Todo List](https://img.shields.io/badge/Vue-3.4.0-4FC08D?style=for-the-badge&logo=vue.js&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-5.3.2-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-5.0.0-646CFF?style=for-the-badge&logo=vite&logoColor=white)
![Pinia](https://img.shields.io/badge/Pinia-2.1.7-FFD859?style=for-the-badge&logo=pinia&logoColor=black)

一个基于Vue 3 + TypeScript的现代化待办事项管理应用，展示了现代前端开发的最佳实践。

[在线演示](https://knightmdy.github.io/vue-todo-list-learn/) · [报告问题](https://github.com/knightmdy/vue-todo-list-learn/issues) · [功能请求](https://github.com/knightmdy/vue-todo-list-learn/issues)

</div>

---

## 🚩 项目亮点

- ✅ **已成功部署** - 通过 GitHub Actions 自动化部署到 GitHub Pages
- 🎯 **现代化架构** - Vue 3 组合式API + TypeScript + Vite
- 🏗️ **完整工程化** - ESLint + Prettier + Jest + 自动化测试
- 📱 **响应式设计** - 支持桌面端和移动端，优雅的用户界面
- 💾 **数据持久化** - 本地存储，刷新页面数据不丢失
- 🧪 **测试覆盖** - 80%+ 测试覆盖率，保证代码质量
- ⚡ **性能优化** - 代码分割、资源压缩、缓存策略
- 🔧 **开发体验** - 热重载、类型检查、代码提示

---

## 🚀 技术栈与知识点速览

- **Vue 3**：组合式API、单文件组件（SFC）、生命周期、props/emit、无障碍
- **TypeScript**：类型声明、接口、类型推断、泛型、类型安全
- **Vite**：极速开发、热重载、现代构建、环境变量
- **Pinia**：集中式状态管理、store模块化、响应式
- **Jest**：单元测试、覆盖率、测试驱动开发
- **ESLint + Prettier**：代码规范、自动格式化
- **pnpm**：高效包管理，提升依赖一致性和安装速度
- **GitHub Actions**：CI/CD 自动化部署，DevOps 实践

## 🏗 前端工程化全景

> 本项目把「实习阶段必学」的工程化能力浓缩为一张图 + 一张表，让你一眼看懂技术栈所处的层级。

### 📊 全景图（Mermaid）
```mermaid
%% 前端工程化金字塔
graph TD
  A[部署层 Release] --> B[测试层 Test]
  B --> C[构建层 Build]
  C --> D[规范层 Lint]
  D --> E[依赖层 Package]

  A:::release
  B:::test
  C:::build
  D:::lint
  E:::pkg

  classDef release fill:#ffedd5,stroke:#f97316
  classDef test    fill:#dbeafe,stroke:#3b82f6
  classDef build   fill:#dcfce7,stroke:#16a34a
  classDef lint    fill:#f3e8ff,stroke:#9333ea
  classDef pkg     fill:#fef3c7,stroke:#ca8a04
---

## 📁 项目结构与工程化说明

```
vue-todo-list-learn/
├── .github/
│   └── workflows/
│       └── deploy.yml    # GitHub Actions 自动化部署配置
├── public/               # 静态资源
├── src/
│   ├── components/       # 可复用Vue组件，props/emit类型声明，样式模块化
│   ├── composables/      # 组合式函数，逻辑复用，类型安全
│   ├── stores/           # Pinia状态管理，集中式store，类型推断
│   ├── types/            # TypeScript类型声明，接口、枚举、类型别名
│   ├── utils/            # 工具函数，localStorage封装，类型安全
│   ├── styles/           # 全局与组件样式，支持深色模式和响应式
│   ├── App.vue           # 根组件，布局与全局逻辑
│   ├── main.ts           # 应用入口，挂载与全局配置
│   └── vite-env.d.ts     # Vite 环境变量类型定义
├── tests/                # 单元与集成测试，Jest覆盖
├── docs/                 # 项目文档
│   └── DEPLOYMENT.md     # 详细部署指南
├── package.json          # 项目依赖与脚本
├── vite.config.ts        # Vite配置（包含GitHub Pages部署配置）
├── tsconfig.json         # TypeScript配置
├── tsconfig.test.json    # 测试专用TypeScript配置
└── jest.config.js        # Jest测试配置
```

---

## 🛠️ 开发命令（pnpm）

### 基础命令
```bash
# 安装依赖
pnpm install

# 启动开发服务器 (http://localhost:5173)
pnpm run dev

# 构建生产版本
pnpm run build

# 预览生产构建
pnpm run preview
```

### 测试命令
```bash
# 运行所有测试
pnpm run test

# 监听模式运行测试
pnpm run test:watch

# 生成测试覆盖率报告
pnpm run test:coverage
```

### 代码质量
```bash
# 代码检查
pnpm run lint

# 自动修复代码问题
pnpm run lint:fix

# 格式化代码
pnpm run format
```

### 构建分析
```bash
# 构建分析 (带可视化)
pnpm run build:analyze

# 构建性能报告
pnpm run build:report

# 完整生产构建
pnpm run build:prod
```

---

## � 部署说明

### 自动化部署

本项目已配置 GitHub Actions 自动化部署：

1. **触发条件**：推送到 `main` 分支
2. **构建环境**：Node.js 18 + pnpm 8
3. **部署目标**：GitHub Pages
4. **访问地址**：https://knightmdy.github.io/vue-todo-list-learn/

### 部署配置要点

```typescript
// vite.config.ts - GitHub Pages 部署配置
export default defineConfig({
  base: '/vue-todo-list-learn/', // 仓库名作为 base 路径
  // ...其他配置
})
```

### 手动部署

```bash
# 构建项目
pnpm run build

# 部署到 GitHub Pages（如果配置了 gh-pages）
pnpm run deploy
```

---

## �🎯 学习目标

通过这个项目，你将学习到：

1. **Vue 3 组合式API** - 现代Vue开发模式
2. **TypeScript** - 类型安全的JavaScript开发
3. **状态管理** - 使用Pinia管理应用状态
4. **组件化开发** - 可复用组件的设计和实现
5. **测试驱动开发** - 使用Jest进行单元测试
6. **现代构建工具** - Vite的配置和使用
7. **代码质量** - ESLint和Prettier的配置
8. **响应式设计** - 移动端适配
9. **pnpm包管理** - 更快更优的依赖管理体验
10. **CI/CD实践** - GitHub Actions 自动化部署

---

## 📚 功能特性

- ✅ 添加、编辑、删除待办事项
- ✅ 标记完成状态
- ✅ 过滤显示（全部、未完成、已完成）
- ✅ 本地存储数据持久化
- ✅ 响应式设计
- ✅ 完整的测试覆盖
- ✅ TypeScript类型安全
- ✅ 现代化UI设计
- ✅ 自动化部署

---

## 🔧 开发环境要求

- Node.js >= 18.0.0
- pnpm >= 8.0.0
- Git

---

## 📖 快速开始

### 1. 克隆项目

```bash
git clone https://github.com/knightmdy/vue-todo-list-learn.git
cd vue-todo-list-learn
```

### 2. 安装依赖

```bash
pnpm install
```

### 3. 启动开发服务器

```bash
pnpm run dev
```

### 4. 打开浏览器

访问 http://localhost:5173

---

## 🏗️ 项目架构详解

### 核心技术选型理由

1. **Vue 3 组合式API**
   - 更好的 TypeScript 支持
   - 逻辑复用更灵活
   - 性能优化更明显

2. **TypeScript**
   - 编译时类型检查
   - 更好的 IDE 支持
   - 代码重构更安全

3. **Vite**
   - 开发服务器启动极快
   - 热重载响应迅速
   - 现代化的构建工具

4. **Pinia**
   - Vue 3 官方推荐
   - 更好的 TypeScript 支持
   - 更简洁的 API

### 工程化实践

#### 代码规范
- **ESLint**: 代码质量检查
- **Prettier**: 代码格式化
- **TypeScript**: 类型安全

#### 测试策略
- **单元测试**: Jest + Vue Test Utils
- **组件测试**: 测试用户交互
- **覆盖率**: 80%+ 测试覆盖

#### 自动化部署
- **GitHub Actions**: CI/CD 流水线
- **自动构建**: 代码推送触发
- **自动部署**: 构建成功后部署

---

## 🔍 故障排除

### 常见问题

1. **页面空白**
   - 检查 `vite.config.ts` 中的 `base` 配置
   - 确保与仓库名一致

2. **TypeScript 错误**
   - 检查 `tsconfig.json` 配置
   - 确保安装了必要的类型定义

3. **部署失败**
   - 查看 GitHub Actions 日志
   - 检查依赖安装是否成功

### 调试技巧

- 使用 Vue DevTools 调试组件状态
- 使用浏览器开发者工具检查网络请求
- 查看 GitHub Actions 详细日志

---

## 🤝 贡献指南

1. Fork 项目
2. 创建功能分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 打开 Pull Request

---

## 📄 许可证

本项目采用 MIT 许可证 - 查看 [LICENSE](LICENSE) 文件了解详情。

---

## 🙏 致谢

- Vue.js 团队提供的优秀框架
- TypeScript 团队的类型系统
- Vite 团队的现代化构建工具
- 开源社区的贡献和支持

---

## 📞 联系方式

- GitHub: [@knightmdy](https://github.com/knightmdy)
- 项目地址: [vue-todo-list-learn](https://github.com/knightmdy/vue-todo-list-learn)
- 在线演示: [Live Demo](https://knightmdy.github.io/vue-todo-list-learn/)

---

