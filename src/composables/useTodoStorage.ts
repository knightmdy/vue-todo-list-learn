// 【知识点】Vue3 组合式函数 useTodoStorage
// - 复用待办事项本地存储相关逻辑
// - TypeScript 类型安全
// - 逻辑复用与副作用
// - 工程化最佳实践

import { computed, type ComputedRef } from 'vue'
import type { Todo, FilterType } from '@/types/todo'
import { STORAGE_KEYS } from '@/types'
import { useLocalStorage, useLocalStorageArray, useLocalStorageObject } from './useLocalStorage'

/**
 * 应用设置接口
 */
interface AppSettings {
  /** 应用版本 */
  version: string
  
  /** 主题设置 */
  theme: 'light' | 'dark' | 'auto'
  
  /** 语言设置 */
  language: 'zh-CN' | 'en-US'
  
  /** 是否启用自动保存 */
  autoSave: boolean
  
  /** 自动保存间隔（毫秒） */
  autoSaveInterval: number
  
  /** 最后访问时间 */
  lastAccessTime: string
}

/**
 * 默认应用设置
 */
const DEFAULT_SETTINGS: AppSettings = {
  version: '1.0.0',
  theme: 'auto',
  language: 'zh-CN',
  autoSave: true,
  autoSaveInterval: 1000,
  lastAccessTime: new Date().toISOString()
}

/**
 * useTodoStorage 返回值类型
 */
export interface UseTodoStorageReturn {
  // Todo列表相关
  todos: ReturnType<typeof useLocalStorageArray<Todo>>
  
  // 过滤器相关
  filter: ReturnType<typeof useLocalStorage<FilterType>>
  
  // 应用设置相关
  settings: ReturnType<typeof useLocalStorageObject<AppSettings>>
  
  // 计算属性
  filteredTodos: ComputedRef<Todo[]>
  completedTodos: ComputedRef<Todo[]>
  activeTodos: ComputedRef<Todo[]>
  completedCount: ComputedRef<number>
  activeCount: ComputedRef<number>
  totalCount: ComputedRef<number>
  completionRate: ComputedRef<number>
  
  // 便捷方法
  addTodo: (title: string) => Todo
  updateTodo: (id: string, updates: Partial<Todo>) => boolean
  deleteTodo: (id: string) => boolean
  toggleTodo: (id: string) => boolean
  clearCompleted: () => number
  markAllCompleted: () => void
  markAllActive: () => void
  
  // 存储管理
  exportData: () => string
  importData: (jsonData: string) => boolean
  clearAllData: () => void
  getStorageInfo: () => {
    todosCount: number
    storageUsed: number
    lastSaved: string
  }
}

/**
 * 生成唯一ID
 */
function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substr(2)
}

/**
 * Todo应用的响应式存储组合式函数
 * 
 * @returns Todo存储操作对象
 */
export function useTodoStorage(): UseTodoStorageReturn {
  // 初始化各个存储
  const todos = useLocalStorageArray<Todo>(STORAGE_KEYS.TODOS, [], {
    immediate: true,
    autoSave: true,
    saveDelay: 500,
    onError: (error) => {
      console.error('Todo列表存储错误:', error)
    }
  })
  
  const filter = useLocalStorage<FilterType>(STORAGE_KEYS.FILTER, 'all', {
    immediate: true,
    autoSave: true,
    saveDelay: 100,
    onError: (error) => {
      console.error('过滤器存储错误:', error)
    }
  })
  
  const settings = useLocalStorageObject<AppSettings>(STORAGE_KEYS.SETTINGS, DEFAULT_SETTINGS, {
    immediate: true,
    autoSave: true,
    saveDelay: 1000,
    onError: (error) => {
      console.error('设置存储错误:', error)
    }
  })

  // 计算属性
  const filteredTodos = computed(() => {
    const currentFilter = filter.value.value
    const todoList = todos.value.value
    
    switch (currentFilter) {
      case 'active':
        return todoList.filter(todo => !todo.completed)
      case 'completed':
        return todoList.filter(todo => todo.completed)
      case 'all':
      default:
        return todoList
    }
  })
  
  const completedTodos = computed(() => 
    todos.value.value.filter(todo => todo.completed)
  )
  
  const activeTodos = computed(() => 
    todos.value.value.filter(todo => !todo.completed)
  )
  
  const completedCount = computed(() => completedTodos.value.length)
  
  const activeCount = computed(() => activeTodos.value.length)
  
  const totalCount = computed(() => todos.value.value.length)
  
  const completionRate = computed(() => {
    const total = totalCount.value
    if (total === 0) return 0
    return Math.round((completedCount.value / total) * 100)
  })

  // 便捷方法
  const addTodo = (title: string): Todo => {
    const newTodo: Todo = {
      id: generateId(),
      title: title.trim(),
      completed: false,
      createdAt: new Date(),
      updatedAt: new Date()
    }
    
    todos.push(newTodo)
    
    // 更新最后访问时间
    settings.set('lastAccessTime', new Date().toISOString())
    
    return newTodo
  }
  
  const updateTodo = (id: string, updates: Partial<Todo>): boolean => {
    const todoIndex = todos.value.value.findIndex(todo => todo.id === id)
    if (todoIndex === -1) return false
    
    const updatedTodo = {
      ...todos.value.value[todoIndex],
      ...updates,
      updatedAt: new Date()
    }
    
    todos.value.value[todoIndex] = updatedTodo
    return true
  }
  
  const deleteTodo = (id: string): boolean => {
    const todoIndex = todos.value.value.findIndex(todo => todo.id === id)
    if (todoIndex === -1) return false
    
    todos.splice(todoIndex, 1)
    return true
  }
  
  const toggleTodo = (id: string): boolean => {
    const todo = todos.value.value.find(todo => todo.id === id)
    if (!todo) return false
    
    return updateTodo(id, { completed: !todo.completed })
  }
  
  const clearCompleted = (): number => {
    const completedTodoIds = completedTodos.value.map(todo => todo.id)
    const clearedCount = completedTodoIds.length
    
    todos.value.value = todos.value.value.filter(todo => !todo.completed)
    
    return clearedCount
  }
  
  const markAllCompleted = (): void => {
    todos.value.value.forEach(todo => {
      if (!todo.completed) {
        todo.completed = true
        todo.updatedAt = new Date()
      }
    })
  }
  
  const markAllActive = (): void => {
    todos.value.value.forEach(todo => {
      if (todo.completed) {
        todo.completed = false
        todo.updatedAt = new Date()
      }
    })
  }

  // 存储管理
  const exportData = (): string => {
    const exportData = {
      todos: todos.value.value,
      filter: filter.value.value,
      settings: settings.value.value,
      exportTime: new Date().toISOString(),
      version: '1.0.0'
    }
    
    return JSON.stringify(exportData, null, 2)
  }
  
  const importData = (jsonData: string): boolean => {
    try {
      const data = JSON.parse(jsonData)
      
      // 验证数据格式
      if (!data.todos || !Array.isArray(data.todos)) {
        throw new Error('无效的Todo数据格式')
      }
      
      // 验证每个Todo项
      for (const todo of data.todos) {
        if (!todo.id || typeof todo.title !== 'string' || typeof todo.completed !== 'boolean') {
          throw new Error('Todo项数据格式不正确')
        }
        
        // 确保日期字段是Date对象
        todo.createdAt = new Date(todo.createdAt)
        todo.updatedAt = new Date(todo.updatedAt)
      }
      
      // 导入数据
      todos.value.value = data.todos
      
      if (data.filter && ['all', 'active', 'completed'].includes(data.filter)) {
        filter.value.value = data.filter
      }
      
      if (data.settings && typeof data.settings === 'object') {
        settings.update(data.settings)
      }
      
      return true
    } catch (error) {
      console.error('导入数据失败:', error)
      return false
    }
  }
  
  const clearAllData = (): void => {
    todos.clear()
    filter.reset()
    settings.reset()
  }
  
  const getStorageInfo = () => {
    return {
      todosCount: totalCount.value,
      storageUsed: JSON.stringify({
        todos: todos.value.value,
        filter: filter.value.value,
        settings: settings.value.value
      }).length,
      lastSaved: settings.get('lastAccessTime')
    }
  }

  return {
    // 存储对象
    todos,
    filter,
    settings,
    
    // 计算属性
    filteredTodos,
    completedTodos,
    activeTodos,
    completedCount,
    activeCount,
    totalCount,
    completionRate,
    
    // 便捷方法
    addTodo,
    updateTodo,
    deleteTodo,
    toggleTodo,
    clearCompleted,
    markAllCompleted,
    markAllActive,
    
    // 存储管理
    exportData,
    importData,
    clearAllData,
    getStorageInfo
  }
}