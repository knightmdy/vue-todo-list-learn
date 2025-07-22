# Vue Todo List API 文档

本文档详细描述了Vue Todo List应用的API接口、组件接口和类型定义。

## 目录

- [组件API](#组件api)
- [组合式函数API](#组合式函数api)
- [Store API](#store-api)
- [工具函数API](#工具函数api)
- [类型定义](#类型定义)

## 组件API

### TodoInput 组件

输入组件，用于添加新的待办事项。

#### Props

| 属性 | 类型 | 默认值 | 描述 |
|------|------|--------|------|
| `placeholder` | `string` | `'添加新的待办事项...'` | 输入框占位符文本 |
| `disabled` | `boolean` | `false` | 是否禁用输入框 |
| `maxLength` | `number` | `100` | 最大输入长度 |
| `autoFocus` | `boolean` | `false` | 是否自动聚焦 |

#### Events

| 事件名 | 参数 | 描述 |
|--------|------|------|
| `add-todo` | `(title: string)` | 添加待办事项时触发 |
| `input-change` | `(value: string)` | 输入内容变化时触发 |

#### 使用示例

```vue
<template>
  <TodoInput
    placeholder="请输入待办事项..."
    :disabled="loading"
    @add-todo="handleAddTodo"
  />
</template>
```

### TodoItem 组件

单个待办事项组件，显示和编辑待办事项。

#### Props

| 属性 | 类型 | 默认值 | 描述 |
|------|------|--------|------|
| `todo` | `Todo` | - | 待办事项数据 |
| `editable` | `boolean` | `true` | 是否可编辑 |
| `showActions` | `boolean` | `true` | 是否显示操作按钮 |

#### Events

| 事件名 | 参数 | 描述 |
|--------|------|------|
| `toggle-todo` | `(id: string)` | 切换完成状态时触发 |
| `update-todo` | `(id: string, title: string)` | 更新标题时触发 |
| `delete-todo` | `(id: string)` | 删除待办事项时触发 |

### TodoList 组件

待办事项列表容器组件。

#### Props

| 属性 | 类型 | 默认值 | 描述 |
|------|------|--------|------|
| `todos` | `Todo[]` | `[]` | 待办事项列表 |
| `loading` | `boolean` | `false` | 加载状态 |
| `error` | `string \| null` | `null` | 错误信息 |
| `showHeader` | `boolean` | `true` | 是否显示头部 |
| `showFooter` | `boolean` | `true` | 是否显示底部 |

#### Events

| 事件名 | 参数 | 描述 |
|--------|------|------|
| `toggle-todo` | `(id: string)` | 切换待办事项状态 |
| `update-todo` | `(id: string, title: string)` | 更新待办事项 |
| `delete-todo` | `(id: string)` | 删除待办事项 |
| `toggle-all` | `(completed: boolean)` | 切换所有待办事项状态 |
| `clear-completed` | `()` | 清除已完成的待办事项 |

### TodoFilter 组件

过滤器组件，用于筛选待办事项。

#### Props

| 属性 | 类型 | 默认值 | 描述 |
|------|------|--------|------|
| `currentFilter` | `FilterType` | `'all'` | 当前过滤器 |
| `totalCount` | `number` | `0` | 总数量 |
| `activeCount` | `number` | `0` | 未完成数量 |
| `completedCount` | `number` | `0` | 已完成数量 |

#### Events

| 事件名 | 参数 | 描述 |
|--------|------|------|
| `filter-change` | `(filter: FilterType)` | 过滤器变化时触发 |

## 组合式函数API

### useTodos

主要的业务逻辑组合式函数。

#### 参数

```typescript
interface UseTodosOptions {
  autoInit?: boolean      // 是否自动初始化
  autoSave?: boolean      // 是否自动保存
  onError?: (error: Error) => void  // 错误回调
  onChange?: (todos: Todo[]) => void // 变化回调
}
```

#### 返回值

```typescript
interface UseTodosReturn {
  // 响应式数据
  todos: Readonly<Ref<Todo[]>>
  currentFilter: Readonly<Ref<FilterType>>
  loading: Readonly<Ref<boolean>>
  error: Readonly<Ref<string | null>>
  
  // 计算属性
  stats: Readonly<Ref<TodoStats>>
  hasTodos: Readonly<Ref<boolean>>
  isEmpty: Readonly<Ref<boolean>>
  
  // 操作方法
  addTodo: (title: string) => Promise<Todo | null>
  toggleTodo: (id: string) => Promise<boolean>
  updateTodo: (id: string, title: string) => Promise<boolean>
  deleteTodo: (id: string) => Promise<boolean>
  setFilter: (filter: FilterType) => void
  clearCompleted: () => Promise<number>
  
  // 工具方法
  findTodoById: (id: string) => Todo | undefined
  clearError: () => void
  reload: () => Promise<void>
}
```

### useLocalStorage

本地存储组合式函数。

#### 参数

```typescript
function useLocalStorage<T>(
  key: string,
  defaultValue: T,
  options?: {
    serializer?: {
      read: (value: string) => T
      write: (value: T) => string
    }
  }
)
```

#### 返回值

```typescript
interface UseLocalStorageReturn<T> {
  value: Ref<T>
  setValue: (newValue: T) => void
  removeValue: () => void
}
```

## Store API

### useTodoStore

Pinia状态管理store。

#### State

```typescript
interface TodoState {
  todos: Todo[]
  filter: FilterType
  loading: boolean
  error: string | null
  initialized: boolean
}
```

#### Getters

```typescript
interface TodoGetters {
  filteredTodos: Todo[]
  totalCount: number
  activeCount: number
  completedCount: number
  hasTodos: boolean
  allCompleted: boolean
}
```

#### Actions

```typescript
interface TodoActions {
  // CRUD操作
  addTodo: (title: string) => Todo
  updateTodo: (id: string, title: string) => boolean
  deleteTodo: (id: string) => boolean
  toggleTodo: (id: string) => boolean
  
  // 批量操作
  toggleAllTodos: (completed: boolean) => void
  clearCompleted: () => number
  addMultipleTodos: (titles: string[]) => Todo[]
  
  // 过滤器
  setFilter: (filter: FilterType) => void
  
  // 存储操作
  loadFromStorage: () => Promise<void>
  saveToStorage: () => Promise<void>
  
  // 工具方法
  getTodoById: (id: string) => Todo | undefined
  setError: (error: string) => void
  clearError: () => void
  getStateSnapshot: () => TodoState
}
```

## 工具函数API

### storage.ts

通用存储工具函数。

```typescript
// 保存数据到localStorage
export function saveToStorage<T>(key: string, data: T): void

// 从localStorage加载数据
export function loadFromStorage<T>(key: string, defaultValue: T): T

// 从localStorage删除数据
export function removeFromStorage(key: string): void

// 清空localStorage
export function clearStorage(): void

// 检查localStorage是否可用
export function isStorageAvailable(): boolean
```

### todoStorage.ts

待办事项专用存储工具函数。

```typescript
// 保存待办事项列表
export function saveTodos(todos: Todo[]): Promise<void>

// 加载待办事项列表
export function loadTodos(): Promise<Todo[]>

// 清空待办事项
export function clearTodos(): Promise<void>

// 导出待办事项为JSON
export function exportTodos(todos: Todo[]): string

// 从JSON导入待办事项
export function importTodos(jsonData: string): Todo[]

// 备份待办事项
export function backupTodos(todos: Todo[]): Promise<string>

// 恢复待办事项
export function restoreTodos(backupData: string): Promise<Todo[]>
```

## 类型定义

### 核心类型

```typescript
// 待办事项接口
interface Todo {
  id: string
  title: string
  completed: boolean
  createdAt: Date
  updatedAt: Date
}

// 过滤器类型
type FilterType = 'all' | 'active' | 'completed'

// 统计信息接口
interface TodoStats {
  total: number
  completed: number
  active: number
  completionRate: number
}

// 状态接口
interface TodoState {
  todos: Todo[]
  filter: FilterType
  loading: boolean
  error: string | null
  initialized: boolean
}
```

---

*API文档版本: 1.0.0*  
*最后更新: 2024年*