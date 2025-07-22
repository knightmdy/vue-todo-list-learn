// 【知识点】工具函数 todoStorage.ts
// - 封装待办事项相关的本地存储逻辑
// - TypeScript 类型安全
// - 工程化最佳实践
/**
 * Todo应用专用的存储工具函数
 * 
 * 这个文件提供了专门针对Todo应用的存储操作，包括：
 * 1. Todo列表的保存和加载
 * 2. 过滤器状态的持久化
 * 3. 应用设置的存储
 * 4. 数据迁移和版本管理
 * 5. ID生成工具
 */

import type { Todo, FilterType } from '@/types/todo'
import type { StorageResult } from '@/types/utils'
import { STORAGE_KEYS } from '@/types'
import { ErrorCode, TodoError } from '@/types/error'
import {
  getStorageItem,
  setStorageItem,
  removeStorageItem,
  isStorageAvailable
} from './storage'

/**
 * 生成唯一ID
 * 
 * 使用时间戳和随机数生成唯一标识符
 * 
 * @returns 唯一ID字符串
 */
export function generateId(): string {
  const timestamp = Date.now().toString(36)
  const randomPart = Math.random().toString(36).substring(2, 8)
  return `${timestamp}-${randomPart}`
}

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
 * 保存Todo列表到本地存储
 * 
 * @param todos - 要保存的Todo列表
 * @returns 存储操作结果
 */
export function saveTodos(todos: Todo[]): StorageResult<Todo[]> {
  try {
    // 验证数据
    if (!Array.isArray(todos)) {
      throw new TodoError(
        'Todo列表必须是数组类型',
        ErrorCode.VALIDATION_ERROR,
        { todos }
      )
    }
    
    // 验证每个Todo项的结构
    for (const todo of todos) {
      if (!todo.id || typeof todo.title !== 'string') {
        throw new TodoError(
          'Todo项数据格式不正确',
          ErrorCode.VALIDATION_ERROR,
          { todo }
        )
      }
    }
    
    // 保存到localStorage
    const result = setStorageItem(STORAGE_KEYS.TODOS, todos)
    
    if (result.success) {
      console.log(`✅ 成功保存 ${todos.length} 个待办事项`)
    }
    
    return result
  } catch (error) {
    const errorMessage = error instanceof TodoError 
      ? error.message 
      : '保存Todo列表时发生未知错误'
    
    console.error('❌ 保存Todo列表失败:', errorMessage)
    
    return {
      success: false,
      error: errorMessage,
      key: STORAGE_KEYS.TODOS,
      operation: 'set',
      timestamp: new Date()
    }
  }
}

/**
 * 从本地存储加载Todo列表
 * 
 * @returns 存储操作结果，包含Todo列表
 */
export function loadTodos(): StorageResult<Todo[]> {
  try {
    const result = getStorageItem<Todo[]>(STORAGE_KEYS.TODOS, [])
    
    if (result.success && result.data) {
      // 验证加载的数据
      if (!Array.isArray(result.data)) {
        throw new TodoError(
          '存储的Todo数据格式不正确',
          ErrorCode.STORAGE_DATA_CORRUPTED,
          { data: result.data }
        )
      }
      
      // 转换日期字符串为Date对象
      const todos = result.data.map(todo => ({
        ...todo,
        createdAt: new Date(todo.createdAt),
        updatedAt: new Date(todo.updatedAt)
      }))
      
      console.log(`✅ 成功加载 ${todos.length} 个待办事项`)
      
      return {
        ...result,
        data: todos
      }
    }
    
    return result
  } catch (error) {
    const errorMessage = error instanceof TodoError 
      ? error.message 
      : '加载Todo列表时发生未知错误'
    
    console.error('❌ 加载Todo列表失败:', errorMessage)
    
    return {
      success: false,
      error: errorMessage,
      key: STORAGE_KEYS.TODOS,
      operation: 'get',
      timestamp: new Date()
    }
  }
}

/**
 * 保存过滤器状态到本地存储
 * 
 * @param filter - 当前的过滤器状态
 * @returns 存储操作结果
 */
export function saveFilter(filter: FilterType): StorageResult<FilterType> {
  try {
    // 验证过滤器值
    const validFilters: FilterType[] = ['all', 'active', 'completed']
    if (!validFilters.includes(filter)) {
      throw new TodoError(
        '无效的过滤器类型',
        ErrorCode.VALIDATION_ERROR,
        { filter, validFilters }
      )
    }
    
    const result = setStorageItem(STORAGE_KEYS.FILTER, filter)
    
    if (result.success) {
      console.log(`✅ 成功保存过滤器状态: ${filter}`)
    }
    
    return result
  } catch (error) {
    const errorMessage = error instanceof TodoError 
      ? error.message 
      : '保存过滤器状态时发生未知错误'
    
    console.error('❌ 保存过滤器状态失败:', errorMessage)
    
    return {
      success: false,
      error: errorMessage,
      key: STORAGE_KEYS.FILTER,
      operation: 'set',
      timestamp: new Date()
    }
  }
}

/**
 * 从本地存储加载过滤器状态
 * 
 * @returns 存储操作结果，包含过滤器状态
 */
export function loadFilter(): StorageResult<FilterType> {
  try {
    const result = getStorageItem<FilterType>(STORAGE_KEYS.FILTER, 'all')
    
    if (result.success && result.data) {
      // 验证过滤器值
      const validFilters: FilterType[] = ['all', 'active', 'completed']
      if (!validFilters.includes(result.data)) {
        console.warn('⚠️ 存储的过滤器状态无效，使用默认值')
        return {
          ...result,
          data: 'all'
        }
      }
      
      console.log(`✅ 成功加载过滤器状态: ${result.data}`)
    }
    
    return result
  } catch (error) {
    const errorMessage = error instanceof TodoError 
      ? error.message 
      : '加载过滤器状态时发生未知错误'
    
    console.error('❌ 加载过滤器状态失败:', errorMessage)
    
    return {
      success: false,
      error: errorMessage,
      key: STORAGE_KEYS.FILTER,
      operation: 'get',
      timestamp: new Date()
    }
  }
}

/**
 * 保存应用设置到本地存储
 * 
 * @param settings - 应用设置
 * @returns 存储操作结果
 */
export function saveSettings(settings: Partial<AppSettings>): StorageResult<AppSettings> {
  try {
    // 加载现有设置
    const currentResult = getStorageItem<AppSettings>(STORAGE_KEYS.SETTINGS, DEFAULT_SETTINGS)
    const currentSettings = currentResult.success ? currentResult.data! : DEFAULT_SETTINGS
    
    // 合并设置
    const newSettings: AppSettings = {
      ...currentSettings,
      ...settings,
      lastAccessTime: new Date().toISOString()
    }
    
    const result = setStorageItem(STORAGE_KEYS.SETTINGS, newSettings)
    
    if (result.success) {
      console.log('✅ 成功保存应用设置')
    }
    
    return result
  } catch (error) {
    const errorMessage = error instanceof TodoError 
      ? error.message 
      : '保存应用设置时发生未知错误'
    
    console.error('❌ 保存应用设置失败:', errorMessage)
    
    return {
      success: false,
      error: errorMessage,
      key: STORAGE_KEYS.SETTINGS,
      operation: 'set',
      timestamp: new Date()
    }
  }
}

/**
 * 从本地存储加载应用设置
 * 
 * @returns 存储操作结果，包含应用设置
 */
export function loadSettings(): StorageResult<AppSettings> {
  try {
    const result = getStorageItem<AppSettings>(STORAGE_KEYS.SETTINGS, DEFAULT_SETTINGS)
    
    if (result.success) {
      console.log('✅ 成功加载应用设置')
    }
    
    return result
  } catch (error) {
    const errorMessage = error instanceof TodoError 
      ? error.message 
      : '加载应用设置时发生未知错误'
    
    console.error('❌ 加载应用设置失败:', errorMessage)
    
    return {
      success: false,
      error: errorMessage,
      key: STORAGE_KEYS.SETTINGS,
      operation: 'get',
      timestamp: new Date()
    }
  }
}

/**
 * 加载完整的应用状态
 * 
 * 一次性加载所有持久化的应用状态
 * 
 * @returns 完整的应用状态
 */
export function loadAppState(): {
  todos: Todo[]
  filter: FilterType
  settings: AppSettings
  errors: string[]
} {
  const errors: string[] = []
  
  // 加载Todo列表
  const todosResult = loadTodos()
  const todos = todosResult.success ? todosResult.data! : []
  if (!todosResult.success) {
    errors.push(`加载Todo列表失败: ${todosResult.error}`)
  }
  
  // 加载过滤器状态
  const filterResult = loadFilter()
  const filter = filterResult.success ? filterResult.data! : 'all'
  if (!filterResult.success) {
    errors.push(`加载过滤器状态失败: ${filterResult.error}`)
  }
  
  // 加载应用设置
  const settingsResult = loadSettings()
  const settings = settingsResult.success ? settingsResult.data! : DEFAULT_SETTINGS
  if (!settingsResult.success) {
    errors.push(`加载应用设置失败: ${settingsResult.error}`)
  }
  
  console.log('📊 应用状态加载完成:', {
    todosCount: todos.length,
    filter,
    errorsCount: errors.length
  })
  
  return {
    todos,
    filter,
    settings,
    errors
  }
}

/**
 * 保存完整的应用状态
 * 
 * 一次性保存所有需要持久化的应用状态
 * 
 * @param state - 应用状态
 * @returns 保存操作的结果
 */
export function saveAppState(state: {
  todos: Todo[]
  filter: FilterType
  settings?: Partial<AppSettings>
}): {
  success: boolean
  errors: string[]
} {
  const errors: string[] = []
  
  // 保存Todo列表
  const todosResult = saveTodos(state.todos)
  if (!todosResult.success) {
    errors.push(`保存Todo列表失败: ${todosResult.error}`)
  }
  
  // 保存过滤器状态
  const filterResult = saveFilter(state.filter)
  if (!filterResult.success) {
    errors.push(`保存过滤器状态失败: ${filterResult.error}`)
  }
  
  // 保存应用设置
  if (state.settings) {
    const settingsResult = saveSettings(state.settings)
    if (!settingsResult.success) {
      errors.push(`保存应用设置失败: ${settingsResult.error}`)
    }
  }
  
  const success = errors.length === 0
  
  console.log('💾 应用状态保存完成:', {
    success,
    errorsCount: errors.length
  })
  
  return {
    success,
    errors
  }
}

/**
 * 清除所有应用数据
 * 
 * 谨慎使用：这会删除所有Todo数据和设置
 * 
 * @returns 清除操作的结果
 */
export function clearAppData(): {
  success: boolean
  errors: string[]
} {
  const errors: string[] = []
  
  // 删除Todo列表
  const todosResult = removeStorageItem(STORAGE_KEYS.TODOS)
  if (!todosResult.success) {
    errors.push(`删除Todo列表失败: ${todosResult.error}`)
  }
  
  // 删除过滤器状态
  const filterResult = removeStorageItem(STORAGE_KEYS.FILTER)
  if (!filterResult.success) {
    errors.push(`删除过滤器状态失败: ${filterResult.error}`)
  }
  
  // 删除应用设置
  const settingsResult = removeStorageItem(STORAGE_KEYS.SETTINGS)
  if (!settingsResult.success) {
    errors.push(`删除应用设置失败: ${settingsResult.error}`)
  }
  
  const success = errors.length === 0
  
  console.log('🗑️ 应用数据清除完成:', {
    success,
    errorsCount: errors.length
  })
  
  return {
    success,
    errors
  }
}

/**
 * 检查存储健康状态
 * 
 * 检查localStorage的可用性和数据完整性
 * 
 * @returns 健康检查结果
 */
export function checkStorageHealth(): {
  available: boolean
  dataIntegrity: boolean
  usage: {
    used: number
    total: number
    percentage: number
  }
  issues: string[]
} {
  const issues: string[] = []
  
  // 检查localStorage可用性
  const available = isStorageAvailable()
  if (!available) {
    issues.push('localStorage不可用')
  }
  
  // 检查数据完整性
  let dataIntegrity = true
  if (available) {
    const todosResult = loadTodos()
    const filterResult = loadFilter()
    const settingsResult = loadSettings()
    
    if (!todosResult.success) {
      dataIntegrity = false
      issues.push('Todo数据损坏')
    }
    
    if (!filterResult.success) {
      dataIntegrity = false
      issues.push('过滤器数据损坏')
    }
    
    if (!settingsResult.success) {
      dataIntegrity = false
      issues.push('设置数据损坏')
    }
  }
  
  // 获取存储使用情况
  const usage = {
    used: 0,
    total: 0,
    percentage: 0
  }
  
  if (available) {
    try {
      let used = 0
      for (const key of Object.values(STORAGE_KEYS)) {
        const item = localStorage.getItem(key)
        if (item) {
          used += item.length + key.length
        }
      }
      
      const total = 5 * 1024 * 1024 // 5MB
      usage.used = used
      usage.total = total
      usage.percentage = Math.round((used / total) * 10000) / 100
    } catch (error) {
      issues.push('无法获取存储使用情况')
    }
  }
  
  return {
    available,
    dataIntegrity,
    usage,
    issues
  }
}