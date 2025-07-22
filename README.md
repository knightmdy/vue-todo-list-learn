# Vue Todo List

<div align="center">

![Vue Todo List](https://img.shields.io/badge/Vue-3.4.0-4FC08D?style=for-the-badge&logo=vue.js&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-5.3.2-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-5.0.0-646CFF?style=for-the-badge&logo=vite&logoColor=white)
![Pinia](https://img.shields.io/badge/Pinia-2.1.7-FFD859?style=for-the-badge&logo=pinia&logoColor=black)

一个基于Vue 3 + TypeScript的现代化待办事项管理应用，展示了现代前端开发的最佳实践。

[在线演示](https://your-demo-url.com) · [报告问题](https://github.com/your-repo/issues) · [功能请求](https://github.com/your-repo/issues)

</div>

---

## 🚩 实习生面试/自我介绍亮点

- 熟练掌握 Vue3 组合式API、TypeScript 类型安全开发
- 熟悉 Vite 工程化、Pinia 状态管理、Jest 单元测试
- 具备模块化、组件化、响应式、无障碍（a11y）等现代前端能力
- 代码注释规范，工程目录清晰，便于团队协作和维护
- 熟练使用 pnpm 进行依赖管理，体验更快的包安装和更优的工程一致性
- 80%+ 单元测试覆盖，重视代码质量与可维护性

---

## ✨ 特性亮点

🎯 **现代化架构** - Vue 3 组合式API + TypeScript + Vite  
🏗️ **完整工程化** - ESLint + Prettier + Jest + 自动化测试  
📱 **响应式设计** - 支持桌面端和移动端，优雅的用户界面  
💾 **数据持久化** - 本地存储，刷新页面数据不丢失  
🧪 **测试覆盖** - 80%+ 测试覆盖率，保证代码质量  
⚡ **性能优化** - 代码分割、资源压缩、缓存策略  
🔧 **开发体验** - 热重载、类型检查、代码提示

---

## 🚀 技术栈与知识点速览

- **Vue 3**：组合式API、单文件组件（SFC）、生命周期、props/emit、无障碍
- **TypeScript**：类型声明、接口、类型推断、泛型、类型安全
- **Vite**：极速开发、热重载、现代构建、环境变量
- **Pinia**：集中式状态管理、store模块化、响应式
- **Jest**：单元测试、覆盖率、测试驱动开发
- **ESLint + Prettier**：代码规范、自动格式化
- **pnpm**：高效包管理，提升依赖一致性和安装速度
- **工程化**：模块化目录、类型集中管理、组合式函数、工具函数、自动化测试、CI/CD 友好

---

## 📁 项目结构与工程化说明

```
TestProject/
├── public/           # 静态资源
├── src/
│   ├── components/   # 可复用Vue组件，props/emit类型声明，样式模块化
│   ├── composables/  # 组合式函数，逻辑复用，类型安全
│   ├── stores/       # Pinia状态管理，集中式store，类型推断
│   ├── types/        # TypeScript类型声明，接口、枚举、类型别名
│   ├── utils/        # 工具函数，localStorage封装，类型安全
│   ├── styles/       # 全局与组件样式，支持深色模式和响应式
│   ├── App.vue       # 根组件，布局与全局逻辑
│   └── main.ts       # 应用入口，挂载与全局配置
├── tests/            # 单元与集成测试，Jest覆盖
├── package.json      # 项目依赖与脚本
├── vite.config.ts    # Vite配置
├── tsconfig.json     # TypeScript配置
└── jest.config.js    # Jest测试配置
```

---

## 🛠️ 开发命令（pnpm）

### 基础命令
```bash
# 安装依赖
pnpm install

# 启动开发服务器 (http://localhost:3000)
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

## 🎯 学习目标

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

---

## 🔧 开发环境要求

- Node.js >= 16.0.0
- pnpm >= 7.0.0

---

## 📖 开发指南

### 1. 快速开始

```bash
# 克隆项目
git clone <repository-url>
cd TestProject

# 安装依赖
pnpm install

# 启动开发服务器
pnpm run dev

# 打开浏览器访问 http://localhost:3000
```

### 2. 项目架构与工程化实践

#### 核心概念
- **组合式API**: 使用Vue 3的组合式API进行逻辑复用
- **类型安全**: 全面的TypeScript类型定义
- **状态管理**: Pinia进行集中状态管理
- **组件化**: 可复用的Vue组件设计
- **工程化**: 目录模块化、类型集中管理、自动化测试、代码规范

#### 目录说明
```
src/
├── components/           # Vue组件（props/emit类型、样式模块化）
├── composables/          # 组合式函数（逻辑复用、类型安全）
├── stores/               # Pinia状态管理（集中store、类型推断）
├── types/                # TypeScript类型（接口、枚举、类型别名）
├── utils/                # 工具函数（localStorage封装、类型安全）
├── styles/               # 样式文件（全局/组件、深色模式）
```

### 3. 核心功能实现

#### 状态管理 (Pinia)
```typescript
// stores/todoStore.ts
export const useTodoStore = defineStore('todo', () => {
  const todos = ref<Todo[]>([])
  const filter = ref<FilterType>('all')
  
  const filteredTodos = computed(() => {
    // 过滤逻辑
  })
  
  const addTodo = (title: string) => {
    // 添加逻辑
  }
  
  return { todos, filter, filteredTodos, addTodo }
})
```

#### 组合式函数
```typescript
// composables/useTodos.ts
export function useTodos() {
  const store = useTodoStore()
  
  const addTodo = async (title: string) => {
    // 业务逻辑
  }
  
  return { addTodo, /* 其他方法 */ }
}
```

### 4. 代码规范

#### ESLint配置
- Vue 3 + TypeScript规则
- 自动修复常见问题
- 提交前检查

#### Prettier配置
- 统一代码格式
- 自动格式化
- 编辑器集成

#### 最佳实践
- 使用组合式API而非选项式API
- 优先使用TypeScript类型而非any
- 组件props和emits必须定义类型
- 使用单一职责原则设计组件
- 目录结构清晰、注释规范

### 5. 测试策略

#### 单元测试
```bash
# 运行所有测试
pnpm run test

# 监听模式
pnpm run test:watch

# 覆盖率报告
pnpm run test:coverage
```

#### 测试覆盖
- **组件测试**: 所有Vue组件
- **工具函数测试**: 纯函数逻辑
- **状态管理测试**: Pinia store
- **集成测试**: 用户交互流程

#### 测试示例
```typescript
// tests/components/TodoItem.test.ts
describe('TodoItem', () => {
  it('should render todo item correctly', () => {
    const wrapper = mount(TodoItem, {
      props: { todo: mockTodo }
    })
    expect(wrapper.text()).toContain(mockTodo.title)
  })
})
```

### 6. 性能优化

#### 构建优化
- 代码分割和懒加载
- 资源压缩和缓存
- Tree-shaking优化

#### 运行时优化
- 响应式数据优化
- 组件渲染优化
- 内存泄漏防护

### 7. 部署指南

#### 构建生产版本
```bash
# 标准构建
pnpm run build

# 带分析的构建
pnpm run build:analyze

# 完整构建报告
pnpm run build:prod
```

#### 部署选项
- **静态托管**: Netlify, Vercel, GitHub Pages
- **CDN部署**: 配置缓存策略
- **服务器部署**: Nginx配置示例

### 8. 故障排除

#### 常见问题
1. **TypeScript错误**: 检查类型定义
2. **构建失败**: 清理node_modules重新安装
3. **测试失败**: 检查Jest配置和模拟数据
4. **样式问题**: 检查CSS作用域和优先级

#### 调试技巧
- 使用Vue DevTools
- 浏览器开发者工具
- TypeScript编译器检查
- ESLint错误提示

---

## 🤝 贡献指南

1. Fork 项目
2. 创建功能分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 打开 Pull Request

## 📄 许可证

本项目采用 MIT 许可证 - 查看 [LICENSE](LICENSE) 文件了解详情。

## 🙏 致谢

感谢Vue.js团队和开源社区提供的优秀工具和资源。