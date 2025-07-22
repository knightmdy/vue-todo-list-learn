/**
 * useLocalStorage 组合式函数测试
 * 
 * 测试useLocalStorage组合式函数的各种功能：
 * 1. 基本的读写操作
 * 2. 响应式数据绑定
 * 3. 自动保存机制
 * 4. 错误处理
 * 5. 类型安全
 */

import { nextTick } from 'vue'
import { useLocalStorage, useLocalStorageValue, useLocalStorageBoolean, useLocalStorageArray, useLocalStorageObject } from '@/composables/useLocalStorage'

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {}

  return {
    getItem: jest.fn((key: string) => store[key] || null),
    setItem: jest.fn((key: string, value: string) => {
      store[key] = value.toString()
    }),
    removeItem: jest.fn((key: string) => {
      delete store[key]
    }),
    clear: jest.fn(() => {
      store = {}
    }),
    get length() {
      return Object.keys(store).length
    },
    key: jest.fn((index: number) => {
      const keys = Object.keys(store)
      return keys[index] || null
    })
  }
})()

// 替换全局localStorage
Object.defineProperty(window, 'localStorage', {
  value: localStorageMock
})

describe('useLocalStorage', () => {
  beforeEach(() => {
    // 清理localStorage和重置mock
    localStorageMock.clear()
    jest.clearAllMocks()
  })

  describe('基本功能测试', () => {
    it('应该使用默认值初始化', async () => {
      const defaultValue = 'test-default'
      const { value, loading } = useLocalStorage('test-key', defaultValue, { immediate: false })
      
      expect(value.value).toBe(defaultValue)
      expect(loading.value).toBe(false)
    })

    it('应该能够保存和加载字符串值', async () => {
      const { value, save, load } = useLocalStorage('test-string', 'default', { immediate: false, autoSave: false })
      
      // 设置新值并保存
      value.value = 'new-value'
      const saveResult = await save()
      
      expect(saveResult.success).toBe(true)
      expect(localStorageMock.setItem).toHaveBeenCalledWith('test-string', '"new-value"')
      
      // 重置值并重新加载
      value.value = 'default'
      const loadResult = await load()
      
      expect(loadResult.success).toBe(true)
      expect(value.value).toBe('new-value')
    })

    it('应该能够保存和加载对象值', async () => {
      const defaultObj = { name: 'test', count: 0 }
      const { value, save, load } = useLocalStorage('test-object', defaultObj, { immediate: false, autoSave: false })
      
      // 设置新对象并保存
      const newObj = { name: 'updated', count: 5 }
      value.value = newObj
      const saveResult = await save()
      
      expect(saveResult.success).toBe(true)
      
      // 重置并重新加载
      value.value = defaultObj
      const loadResult = await load()
      
      expect(loadResult.success).toBe(true)
      expect(value.value).toEqual(newObj)
    })

    it('应该能够删除存储的数据', async () => {
      const { value, save, remove } = useLocalStorage('test-remove', 'initial', { immediate: false, autoSave: false })
      
      // 先保存数据
      await save()
      expect(localStorageMock.setItem).toHaveBeenCalled()
      
      // 删除数据
      const removeResult = await remove()
      
      expect(removeResult.success).toBe(true)
      expect(localStorageMock.removeItem).toHaveBeenCalledWith('test-remove')
      expect(value.value).toBe('initial') // 应该重置为默认值
    })

    it('应该能够重置为默认值', () => {
      const defaultValue = 'default'
      const { value, reset } = useLocalStorage('test-reset', defaultValue, { immediate: false })
      
      // 修改值
      value.value = 'changed'
      expect(value.value).toBe('changed')
      
      // 重置
      reset()
      expect(value.value).toBe(defaultValue)
    })
  })

  describe('自动保存功能测试', () => {
    it('应该在值变化时自动保存', async () => {
      const { value } = useLocalStorage('test-auto-save', 'initial', { 
        immediate: false, 
        autoSave: true, 
        saveDelay: 50 
      })
      
      // 修改值
      value.value = 'auto-saved'
      
      // 等待防抖延迟
      await new Promise(resolve => setTimeout(resolve, 100))
      
      expect(localStorageMock.setItem).toHaveBeenCalledWith('test-auto-save', '"auto-saved"')
    })

    it('应该支持禁用自动保存', async () => {
      const { value } = useLocalStorage('test-no-auto-save', 'initial', { 
        immediate: false, 
        autoSave: false 
      })
      
      // 修改值
      value.value = 'not-auto-saved'
      
      // 等待一段时间
      await new Promise(resolve => setTimeout(resolve, 100))
      
      expect(localStorageMock.setItem).not.toHaveBeenCalled()
    })
  })

  describe('立即加载功能测试', () => {
    it('应该在immediate为true时立即加载数据', () => {
      // 先在localStorage中设置数据
      localStorageMock.setItem('test-immediate', '"pre-existing"')
      
      const { value } = useLocalStorage('test-immediate', 'default', { immediate: true })
      
      // 由于是异步加载，需要等待nextTick
      nextTick(() => {
        expect(value.value).toBe('pre-existing')
      })
    })

    it('应该在immediate为false时不立即加载数据', () => {
      // 先在localStorage中设置数据
      localStorageMock.setItem('test-no-immediate', '"pre-existing"')
      
      const { value } = useLocalStorage('test-no-immediate', 'default', { immediate: false })
      
      expect(value.value).toBe('default')
    })
  })

  describe('错误处理测试', () => {
    it('应该处理localStorage不可用的情况', async () => {
      // Mock localStorage抛出错误
      const originalSetItem = localStorageMock.setItem
      localStorageMock.setItem = jest.fn(() => {
        throw new Error('localStorage not available')
      })
      
      const { save, error } = useLocalStorage('test-error', 'default', { immediate: false })
      
      const result = await save()
      
      expect(result.success).toBe(false)
      expect(error.value).toContain('localStorage不可用')
      
      // 恢复原始方法
      localStorageMock.setItem = originalSetItem
    })

    it('应该处理JSON解析错误', async () => {
      // Mock getItem返回无效JSON
      const originalGetItem = localStorageMock.getItem
      localStorageMock.getItem = jest.fn(() => 'invalid-json')
      
      const { load, error } = useLocalStorage('test-invalid-json', 'default', { immediate: false })
      
      const result = await load()
      
      // 应该使用默认值并记录错误
      expect(result.success).toBe(false)
      expect(error.value).toBeTruthy()
      
      // 恢复原始方法
      localStorageMock.getItem = originalGetItem
    })

    it('应该调用错误处理回调', async () => {
      const onError = jest.fn()
      
      // Mock localStorage抛出错误
      localStorageMock.setItem = jest.fn(() => {
        throw new Error('Test error')
      })
      
      const { save } = useLocalStorage('test-error-callback', 'default', { 
        immediate: false,
        onError 
      })
      
      await save()
      
      expect(onError).toHaveBeenCalledWith(expect.stringContaining('localStorage不可用'))
    })
  })

  describe('自定义序列化器测试', () => {
    it('应该支持自定义序列化器配置', () => {
      const customSerializer = {
        read: (value: string) => `read-${value}`,
        write: (value: any) => `write-${value}`
      }
      
      const { value } = useLocalStorage('test-serializer', 'default', {
        immediate: false,
        autoSave: false,
        serializer: customSerializer
      })
      
      // 验证组合式函数可以接受自定义序列化器配置
      expect(value.value).toBe('default')
    })
  })

  describe('加载状态测试', () => {
    it('应该提供loading状态', () => {
      const { loading } = useLocalStorage('test-loading', 'default', { immediate: false })
      
      // 验证loading状态是响应式的
      expect(loading.value).toBe(false)
    })
  })
})

describe('useLocalStorageValue', () => {
  beforeEach(() => {
    localStorageMock.clear()
    jest.clearAllMocks()
  })

  it('应该返回响应式的值', () => {
    const value = useLocalStorageValue('test-value', 'default')
    
    expect(value.value).toBe('default')
    
    // 修改值
    value.value = 'changed'
    expect(value.value).toBe('changed')
  })
})

describe('useLocalStorageBoolean', () => {
  beforeEach(() => {
    localStorageMock.clear()
    jest.clearAllMocks()
  })

  it('应该支持布尔值操作', () => {
    const { value, toggle } = useLocalStorageBoolean('test-boolean', false, { immediate: false })
    
    expect(value.value).toBe(false)
    
    // 切换值
    toggle()
    expect(value.value).toBe(true)
    
    toggle()
    expect(value.value).toBe(false)
  })
})

describe('useLocalStorageArray', () => {
  beforeEach(() => {
    localStorageMock.clear()
    jest.clearAllMocks()
  })

  it('应该支持数组操作', () => {
    const { value, push, pop, clear } = useLocalStorageArray<string>('test-array', [], { immediate: false })
    
    expect(value.value).toEqual([])
    
    // 添加元素
    push('item1')
    push('item2')
    expect(value.value).toEqual(['item1', 'item2'])
    
    // 移除元素
    const popped = pop()
    expect(popped).toBe('item2')
    expect(value.value).toEqual(['item1'])
    
    // 清空数组
    clear()
    expect(value.value).toEqual([])
  })
})

describe('useLocalStorageObject', () => {
  beforeEach(() => {
    localStorageMock.clear()
    jest.clearAllMocks()
  })

  it('应该支持对象操作', () => {
    const defaultObj = { name: 'test', count: 0 }
    const { value, update, set, get } = useLocalStorageObject('test-object', defaultObj, { immediate: false })
    
    expect(value.value).toEqual(defaultObj)
    
    // 更新部分属性
    update({ count: 5 })
    expect(value.value).toEqual({ name: 'test', count: 5 })
    
    // 设置单个属性
    set('name', 'updated')
    expect(value.value.name).toBe('updated')
    
    // 获取单个属性
    const name = get('name')
    expect(name).toBe('updated')
  })
})