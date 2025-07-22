// 【知识点】Vue3 组合式函数 useLocalStorage
// - 响应式封装 localStorage 持久化逻辑
// - TypeScript 泛型与类型安全
// - 逻辑复用与副作用
// - 工程化最佳实践

import { ref, watch, type Ref } from 'vue'
import { getStorageItem, setStorageItem, removeStorageItem } from '@/utils/storage'
import type { StorageResult } from '@/types/utils'

/**
 * useLocalStorage 配置选项
 */
export interface UseLocalStorageOptions {
  /** 是否立即从localStorage加载数据 */
  immediate?: boolean
  
  /** 是否自动保存数据变化 */
  autoSave?: boolean
  
  /** 自动保存的防抖延迟（毫秒） */
  saveDelay?: number
  
  /** 序列化函数 */
  serializer?: {
    read: (value: string) => any
    write: (value: any) => string
  }
  
  /** 错误处理回调 */
  onError?: (error: string) => void
}

/**
 * useLocalStorage 返回值类型
 */
export interface UseLocalStorageReturn<T> {
  /** 响应式的存储值 */
  value: Ref<T>
  
  /** 手动加载数据 */
  load: () => Promise<StorageResult<T>>
  
  /** 手动保存数据 */
  save: (newValue?: T) => Promise<StorageResult<T>>
  
  /** 删除存储的数据 */
  remove: () => Promise<StorageResult<null>>
  
  /** 重置为默认值 */
  reset: () => void
  
  /** 当前是否正在加载 */
  loading: Ref<boolean>
  
  /** 最后一次操作的错误信息 */
  error: Ref<string | null>
}

/**
 * 响应式的localStorage组合式函数
 * 
 * @param key - localStorage的键名
 * @param defaultValue - 默认值
 * @param options - 配置选项
 * @returns 响应式的localStorage操作对象
 */
export function useLocalStorage<T>(
  key: string,
  defaultValue: T,
  options: UseLocalStorageOptions = {}
): UseLocalStorageReturn<T> {
  const {
    immediate = true,
    autoSave = true,
    saveDelay = 300,
    serializer,
    onError
  } = options

  // 响应式状态
  const value = ref<T>(defaultValue) as Ref<T>
  const loading = ref(false)
  const error = ref<string | null>(null)
  
  // 防抖保存定时器
  let saveTimer: NodeJS.Timeout | null = null

  /**
   * 处理错误
   */
  const handleError = (errorMessage: string) => {
    error.value = errorMessage
    if (onError) {
      onError(errorMessage)
    }
    console.error(`[useLocalStorage] ${errorMessage}`)
  }

  /**
   * 从localStorage加载数据
   */
  const load = async (): Promise<StorageResult<T>> => {
    loading.value = true
    error.value = null
    
    try {
      const result = getStorageItem<T>(key, defaultValue)
      
      if (result.success) {
        // 如果有自定义序列化器，使用它来反序列化
        if (serializer && typeof result.data === 'string') {
          try {
            value.value = serializer.read(result.data as string)
          } catch (serializerError) {
            handleError(`反序列化失败: ${serializerError}`)
            value.value = defaultValue
          }
        } else {
          value.value = result.data as T
        }
      } else {
        handleError(result.error || '加载数据失败')
        value.value = defaultValue
      }
      
      return result
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '加载数据时发生未知错误'
      handleError(errorMessage)
      value.value = defaultValue
      
      return {
        success: false,
        error: errorMessage,
        key,
        operation: 'get',
        timestamp: new Date()
      }
    } finally {
      loading.value = false
    }
  }

  /**
   * 保存数据到localStorage
   */
  const save = async (newValue?: T): Promise<StorageResult<T>> => {
    const valueToSave = newValue !== undefined ? newValue : value.value
    loading.value = true
    error.value = null
    
    try {
      let dataToStore: any = valueToSave
      
      // 如果有自定义序列化器，使用它来序列化
      if (serializer) {
        try {
          dataToStore = serializer.write(valueToSave)
        } catch (serializerError) {
          handleError(`序列化失败: ${serializerError}`)
          return {
            success: false,
            error: `序列化失败: ${serializerError}`,
            key,
            operation: 'set',
            timestamp: new Date()
          }
        }
      }
      
      const result = setStorageItem(key, dataToStore)
      
      if (result.success) {
        // 如果传入了新值，更新响应式值
        if (newValue !== undefined) {
          value.value = newValue
        }
      } else {
        handleError(result.error || '保存数据失败')
      }
      
      return result
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '保存数据时发生未知错误'
      handleError(errorMessage)
      
      return {
        success: false,
        error: errorMessage,
        key,
        operation: 'set',
        timestamp: new Date()
      }
    } finally {
      loading.value = false
    }
  }

  /**
   * 删除存储的数据
   */
  const remove = async (): Promise<StorageResult<null>> => {
    loading.value = true
    error.value = null
    
    try {
      const result = removeStorageItem(key)
      
      if (result.success) {
        value.value = defaultValue
      } else {
        handleError(result.error || '删除数据失败')
      }
      
      return result
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '删除数据时发生未知错误'
      handleError(errorMessage)
      
      return {
        success: false,
        error: errorMessage,
        key,
        operation: 'remove',
        timestamp: new Date()
      }
    } finally {
      loading.value = false
    }
  }

  /**
   * 重置为默认值
   */
  const reset = () => {
    value.value = defaultValue
    error.value = null
  }

  /**
   * 防抖保存函数
   */
  const debouncedSave = () => {
    if (saveTimer) {
      clearTimeout(saveTimer)
    }
    
    saveTimer = setTimeout(() => {
      save()
    }, saveDelay)
  }

  // 如果启用自动保存，监听值的变化
  if (autoSave) {
    watch(
      value,
      () => {
        debouncedSave()
      },
      { deep: true }
    )
  }

  // 如果启用立即加载，在组合式函数初始化时加载数据
  if (immediate) {
    load()
  }

  return {
    value,
    load,
    save,
    remove,
    reset,
    loading,
    error
  }
}

/**
 * 创建一个简化版本的useLocalStorage，只返回响应式值
 * 
 * @param key - localStorage的键名
 * @param defaultValue - 默认值
 * @param options - 配置选项
 * @returns 响应式的值
 */
export function useLocalStorageValue<T>(
  key: string,
  defaultValue: T,
  options?: UseLocalStorageOptions
): Ref<T> {
  const { value } = useLocalStorage(key, defaultValue, options)
  return value
}

/**
 * 创建一个用于布尔值的useLocalStorage
 * 
 * @param key - localStorage的键名
 * @param defaultValue - 默认值
 * @param options - 配置选项
 * @returns 布尔值的localStorage操作对象
 */
export function useLocalStorageBoolean(
  key: string,
  defaultValue = false,
  options?: UseLocalStorageOptions
): UseLocalStorageReturn<boolean> & {
  toggle: () => void
} {
  const storage = useLocalStorage(key, defaultValue, options)
  
  const toggle = () => {
    storage.value.value = !storage.value.value
  }
  
  return {
    ...storage,
    toggle
  }
}

/**
 * 创建一个用于数组的useLocalStorage
 * 
 * @param key - localStorage的键名
 * @param defaultValue - 默认值
 * @param options - 配置选项
 * @returns 数组的localStorage操作对象
 */
export function useLocalStorageArray<T>(
  key: string,
  defaultValue: T[] = [],
  options?: UseLocalStorageOptions
): UseLocalStorageReturn<T[]> & {
  push: (item: T) => void
  pop: () => T | undefined
  shift: () => T | undefined
  unshift: (item: T) => void
  splice: (start: number, deleteCount?: number, ...items: T[]) => T[]
  clear: () => void
} {
  const storage = useLocalStorage(key, defaultValue, options)
  
  const push = (item: T) => {
    storage.value.value.push(item)
  }
  
  const pop = (): T | undefined => {
    return storage.value.value.pop()
  }
  
  const shift = (): T | undefined => {
    return storage.value.value.shift()
  }
  
  const unshift = (item: T) => {
    storage.value.value.unshift(item)
  }
  
  const splice = (start: number, deleteCount?: number, ...items: T[]): T[] => {
    return storage.value.value.splice(start, deleteCount || 0, ...items)
  }
  
  const clear = () => {
    storage.value.value = []
  }
  
  return {
    ...storage,
    push,
    pop,
    shift,
    unshift,
    splice,
    clear
  }
}

/**
 * 创建一个用于对象的useLocalStorage
 * 
 * @param key - localStorage的键名
 * @param defaultValue - 默认值
 * @param options - 配置选项
 * @returns 对象的localStorage操作对象
 */
export function useLocalStorageObject<T extends Record<string, any>>(
  key: string,
  defaultValue: T,
  options?: UseLocalStorageOptions
): UseLocalStorageReturn<T> & {
  update: (updates: Partial<T>) => void
  set: <K extends keyof T>(key: K, value: T[K]) => void
  get: <K extends keyof T>(key: K) => T[K]
} {
  const storage = useLocalStorage(key, defaultValue, options)
  
  const update = (updates: Partial<T>) => {
    storage.value.value = { ...storage.value.value, ...updates }
  }
  
  const set = <K extends keyof T>(objKey: K, value: T[K]) => {
    storage.value.value[objKey] = value
  }
  
  const get = <K extends keyof T>(objKey: K): T[K] => {
    return storage.value.value[objKey]
  }
  
  return {
    ...storage,
    update,
    set,
    get
  }
}