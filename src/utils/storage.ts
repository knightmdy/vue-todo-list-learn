// 【知识点】工具函数 storage.ts
// - 封装 localStorage 操作，提升代码复用性
// - TypeScript 类型安全
// - 工程化最佳实践

import { ErrorCode, TodoError } from '@/types/error'
import type { StorageConfig, StorageResult } from '@/types/utils'

/**
 * 检查localStorage是否可用
 * 
 * 在某些环境下（如隐私模式、存储被禁用等），localStorage可能不可用
 * 这个函数用于检测localStorage的可用性
 */
export function isStorageAvailable(): boolean {
  try {
    // 尝试写入和读取测试数据
    const testKey = '__storage_test__'
    const testValue = 'test'
    
    localStorage.setItem(testKey, testValue)
    const retrievedValue = localStorage.getItem(testKey)
    localStorage.removeItem(testKey)
    
    return retrievedValue === testValue
  } catch (error) {
    // 如果出现任何错误，说明localStorage不可用
    return false
  }
}

/**
 * 安全地序列化数据
 * 
 * 将JavaScript对象转换为JSON字符串，处理可能的序列化错误
 * 
 * @param data - 要序列化的数据
 * @returns 序列化后的字符串或错误
 */
function serializeData(data: any): string {
  try {
    return JSON.stringify(data)
  } catch (error) {
    throw new TodoError(
      '数据序列化失败',
      ErrorCode.STORAGE_ERROR,
      { data, originalError: error }
    )
  }
}

/**
 * 安全地反序列化数据
 * 
 * 将JSON字符串转换为JavaScript对象，处理可能的解析错误
 * 
 * @param jsonString - 要反序列化的JSON字符串
 * @returns 反序列化后的数据或错误
 */
function deserializeData<T = any>(jsonString: string): T {
  try {
    return JSON.parse(jsonString) as T
  } catch (error) {
    throw new TodoError(
      '数据反序列化失败，可能数据已损坏',
      ErrorCode.STORAGE_DATA_CORRUPTED,
      { jsonString, originalError: error }
    )
  }
}

/**
 * 从localStorage获取数据
 * 
 * 类型安全地从localStorage读取数据，包含完整的错误处理
 * 
 * @param key - 存储键名
 * @param defaultValue - 默认值（当键不存在时返回）
 * @returns 存储操作结果
 */
export function getStorageItem<T = any>(
  key: string,
  defaultValue?: T
): StorageResult<T> {
  const timestamp = new Date()
  
  try {
    // 检查localStorage是否可用
    if (!isStorageAvailable()) {
      throw new TodoError(
        'localStorage不可用',
        ErrorCode.STORAGE_NOT_AVAILABLE,
        { key }
      )
    }
    
    // 尝试获取数据
    const item = localStorage.getItem(key)
    
    // 如果键不存在，返回默认值
    if (item === null) {
      return {
        success: true,
        data: defaultValue as T,
        key,
        operation: 'get',
        timestamp
      }
    }
    
    // 反序列化数据
    const data = deserializeData<T>(item)
    
    return {
      success: true,
      data,
      key,
      operation: 'get',
      timestamp
    }
  } catch (error) {
    const errorMessage = error instanceof TodoError 
      ? error.message 
      : '获取存储数据时发生未知错误'
    
    return {
      success: false,
      error: errorMessage,
      key,
      operation: 'get',
      timestamp
    }
  }
}

/**
 * 向localStorage保存数据
 * 
 * 类型安全地向localStorage写入数据，包含完整的错误处理
 * 
 * @param key - 存储键名
 * @param value - 要保存的数据
 * @returns 存储操作结果
 */
export function setStorageItem<T = any>(
  key: string,
  value: T
): StorageResult<T> {
  const timestamp = new Date()
  
  try {
    // 检查localStorage是否可用
    if (!isStorageAvailable()) {
      throw new TodoError(
        'localStorage不可用',
        ErrorCode.STORAGE_NOT_AVAILABLE,
        { key, value }
      )
    }
    
    // 序列化数据
    const serializedValue = serializeData(value)
    
    // 尝试保存数据
    localStorage.setItem(key, serializedValue)
    
    return {
      success: true,
      data: value,
      key,
      operation: 'set',
      timestamp
    }
  } catch (error) {
    let errorMessage = '保存存储数据时发生未知错误'
    
    if (error instanceof TodoError) {
      errorMessage = error.message
    } else if (error instanceof DOMException) {
      // 处理存储配额超出错误
      if (error.name === 'QuotaExceededError') {
        errorMessage = '存储空间不足，无法保存数据'
      }
    }
    
    return {
      success: false,
      error: errorMessage,
      key,
      operation: 'set',
      timestamp
    }
  }
}

/**
 * 从localStorage删除数据
 * 
 * 安全地从localStorage删除指定键的数据
 * 
 * @param key - 要删除的存储键名
 * @returns 存储操作结果
 */
export function removeStorageItem(key: string): StorageResult<null> {
  const timestamp = new Date()
  
  try {
    // 检查localStorage是否可用
    if (!isStorageAvailable()) {
      throw new TodoError(
        'localStorage不可用',
        ErrorCode.STORAGE_NOT_AVAILABLE,
        { key }
      )
    }
    
    // 删除数据
    localStorage.removeItem(key)
    
    return {
      success: true,
      data: null,
      key,
      operation: 'remove',
      timestamp
    }
  } catch (error) {
    const errorMessage = error instanceof TodoError 
      ? error.message 
      : '删除存储数据时发生未知错误'
    
    return {
      success: false,
      error: errorMessage,
      key,
      operation: 'remove',
      timestamp
    }
  }
}

/**
 * 清空localStorage中的所有数据
 * 
 * 谨慎使用：这会删除所有localStorage中的数据
 * 
 * @returns 存储操作结果
 */
export function clearStorage(): StorageResult<null> {
  const timestamp = new Date()
  
  try {
    // 检查localStorage是否可用
    if (!isStorageAvailable()) {
      throw new TodoError(
        'localStorage不可用',
        ErrorCode.STORAGE_NOT_AVAILABLE
      )
    }
    
    // 清空所有数据
    localStorage.clear()
    
    return {
      success: true,
      data: null,
      key: '*',
      operation: 'clear',
      timestamp
    }
  } catch (error) {
    const errorMessage = error instanceof TodoError 
      ? error.message 
      : '清空存储数据时发生未知错误'
    
    return {
      success: false,
      error: errorMessage,
      key: '*',
      operation: 'clear',
      timestamp
    }
  }
}

/**
 * 获取localStorage的使用情况
 * 
 * 返回localStorage的存储使用统计信息
 * 注意：这个功能在某些浏览器中可能不准确
 * 
 * @returns 存储使用情况信息
 */
export function getStorageUsage(): {
  used: number
  total: number
  available: number
  percentage: number
} {
  try {
    if (!isStorageAvailable()) {
      return {
        used: 0,
        total: 0,
        available: 0,
        percentage: 0
      }
    }
    
    // 计算已使用的存储空间
    let used = 0
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i)
      if (key) {
        const value = localStorage.getItem(key)
        if (value) {
          used += value.length + key.length
        }
      }
    }
    
    // 大多数浏览器的localStorage限制约为5MB
    const total = 5 * 1024 * 1024 // 5MB in bytes
    const available = total - used
    const percentage = (used / total) * 100
    
    return {
      used,
      total,
      available,
      percentage: Math.round(percentage * 100) / 100
    }
  } catch (error) {
    return {
      used: 0,
      total: 0,
      available: 0,
      percentage: 0
    }
  }
}

/**
 * 带配置的存储操作
 * 
 * 提供更高级的存储操作，支持配置选项
 * 
 * @param config - 存储配置
 * @param value - 要保存的值（仅在设置时需要）
 * @returns 存储操作结果
 */
export function storageWithConfig<T = any>(
  config: StorageConfig,
  value?: T
): StorageResult<T> {
  const { key, defaultValue } = config
  
  if (value !== undefined) {
    // 设置操作
    return setStorageItem(key, value)
  } else {
    // 获取操作
    return getStorageItem(key, defaultValue)
  }
}

/**
 * 批量存储操作
 * 
 * 一次性处理多个存储操作，提高性能
 * 
 * @param operations - 存储操作列表
 * @returns 所有操作的结果
 */
export function batchStorageOperations(
  operations: Array<{
    type: 'get' | 'set' | 'remove'
    key: string
    value?: any
    defaultValue?: any
  }>
): StorageResult<any>[] {
  return operations.map(op => {
    switch (op.type) {
      case 'get':
        return getStorageItem(op.key, op.defaultValue)
      case 'set':
        return setStorageItem(op.key, op.value)
      case 'remove':
        return removeStorageItem(op.key)
      default:
        return {
          success: false,
          error: '不支持的操作类型',
          key: op.key,
          operation: op.type as any,
          timestamp: new Date()
        }
    }
  })
}