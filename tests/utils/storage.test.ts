/**
 * 存储工具函数测试
 * 
 * 测试localStorage相关的工具函数，包括：
 * 1. 基础存储操作
 * 2. 错误处理
 * 3. 数据序列化和反序列化
 * 4. 存储可用性检测
 */

import {
  isStorageAvailable,
  getStorageItem,
  setStorageItem,
  removeStorageItem,
  clearStorage,
  getStorageUsage,
  batchStorageOperations
} from '@/utils/storage'

describe('存储工具函数测试', () => {
  beforeEach(() => {
    // 清空localStorage
    localStorage.clear()
    jest.clearAllMocks()
  })

  describe('isStorageAvailable', () => {
    test('localStorage可用时返回true', () => {
      expect(isStorageAvailable()).toBe(true)
    })
  })

  describe('setStorageItem', () => {
    test('成功保存字符串数据', () => {
      const result = setStorageItem('test-key', 'test-value')
      
      expect(result.success).toBe(true)
      expect(result.data).toBe('test-value')
      expect(result.key).toBe('test-key')
      expect(result.operation).toBe('set')
      
      // 验证数据确实被保存
      expect(localStorage.getItem('test-key')).toBe('"test-value"')
    })

    test('成功保存对象数据', () => {
      const testData = { name: '测试', value: 123 }
      const result = setStorageItem('test-object', testData)
      
      expect(result.success).toBe(true)
      expect(result.data).toEqual(testData)
      
      // 验证数据确实被保存
      expect(localStorage.getItem('test-object')).toBe(JSON.stringify(testData))
    })

    test('成功保存数组数据', () => {
      const testArray = [1, 2, 3, '测试']
      const result = setStorageItem('test-array', testArray)
      
      expect(result.success).toBe(true)
      expect(result.data).toEqual(testArray)
    })
  })

  describe('getStorageItem', () => {
    test('成功获取存在的数据', () => {
      // 先保存数据
      const testData = { name: '测试数据', id: 1 }
      setStorageItem('test-key', testData)
      
      // 获取数据
      const result = getStorageItem('test-key')
      
      expect(result.success).toBe(true)
      expect(result.data).toEqual(testData)
      expect(result.key).toBe('test-key')
      expect(result.operation).toBe('get')
    })

    test('获取不存在的键时返回默认值', () => {
      const defaultValue = '默认值'
      const result = getStorageItem('non-existent-key', defaultValue)
      
      expect(result.success).toBe(true)
      expect(result.data).toBe(defaultValue)
    })

    test('获取不存在的键且无默认值时返回undefined', () => {
      const result = getStorageItem('non-existent-key')
      
      expect(result.success).toBe(true)
      expect(result.data).toBeUndefined()
    })

    test('数据损坏时返回错误', () => {
      // 直接设置无效的JSON数据
      localStorage.setItem('corrupted-key', 'invalid json {')
      
      const result = getStorageItem('corrupted-key')
      
      expect(result.success).toBe(false)
      expect(result.error).toContain('数据反序列化失败')
    })
  })

  describe('removeStorageItem', () => {
    test('成功删除存在的数据', () => {
      // 先保存数据
      setStorageItem('test-key', 'test-value')
      expect(localStorage.getItem('test-key')).not.toBeNull()
      
      // 删除数据
      const result = removeStorageItem('test-key')
      
      expect(result.success).toBe(true)
      expect(result.data).toBe(null)
      expect(result.key).toBe('test-key')
      expect(result.operation).toBe('remove')
      expect(localStorage.getItem('test-key')).toBeNull()
    })

    test('删除不存在的键也返回成功', () => {
      const result = removeStorageItem('non-existent-key')
      
      expect(result.success).toBe(true)
      expect(result.data).toBe(null)
    })
  })

  describe('clearStorage', () => {
    test('成功清空所有数据', () => {
      // 先保存一些数据
      setStorageItem('key1', 'value1')
      setStorageItem('key2', 'value2')
      expect(localStorage.length).toBeGreaterThan(0)
      
      // 清空存储
      const result = clearStorage()
      
      expect(result.success).toBe(true)
      expect(result.data).toBe(null)
      expect(result.key).toBe('*')
      expect(result.operation).toBe('clear')
      expect(localStorage.length).toBe(0)
    })
  })

  describe('getStorageUsage', () => {
    test('返回存储使用情况', () => {
      // 保存一些数据
      setStorageItem('key1', 'value1')
      setStorageItem('key2', { data: 'test' })
      
      const usage = getStorageUsage()
      
      // 在测试环境中，使用情况可能为0，这是正常的
      expect(usage.used).toBeGreaterThanOrEqual(0)
      expect(usage.total).toBe(5 * 1024 * 1024) // 5MB
      expect(usage.available).toBe(usage.total - usage.used)
      expect(usage.percentage).toBeGreaterThanOrEqual(0)
      expect(usage.percentage).toBeLessThanOrEqual(100)
    })
  })

  describe('batchStorageOperations', () => {
    test('批量执行多种存储操作', () => {
      const operations = [
        { type: 'set' as const, key: 'key1', value: 'value1' },
        { type: 'set' as const, key: 'key2', value: { data: 'test' } },
        { type: 'get' as const, key: 'key1' },
        { type: 'get' as const, key: 'non-existent', defaultValue: 'default' },
        { type: 'remove' as const, key: 'key2' }
      ]
      
      const results = batchStorageOperations(operations)
      
      expect(results).toHaveLength(5)
      
      // 检查设置操作结果
      expect(results[0].success).toBe(true)
      expect(results[0].operation).toBe('set')
      expect(results[1].success).toBe(true)
      expect(results[1].operation).toBe('set')
      
      // 检查获取操作结果
      expect(results[2].success).toBe(true)
      expect(results[2].data).toBe('value1')
      expect(results[2].operation).toBe('get')
      
      expect(results[3].success).toBe(true)
      expect(results[3].data).toBe('default')
      expect(results[3].operation).toBe('get')
      
      // 检查删除操作结果
      expect(results[4].success).toBe(true)
      expect(results[4].operation).toBe('remove')
    })

    test('不支持的操作类型返回错误', () => {
      const operations = [
        { type: 'invalid' as any, key: 'key1', value: 'value1' }
      ]
      
      const results = batchStorageOperations(operations)
      
      expect(results).toHaveLength(1)
      expect(results[0].success).toBe(false)
      expect(results[0].error).toContain('不支持的操作类型')
    })
  })

  describe('数据类型处理', () => {
    test('正确处理各种数据类型', () => {
      const testCases = [
        { key: 'string', value: '字符串测试' },
        { key: 'number', value: 42 },
        { key: 'boolean', value: true },
        { key: 'null', value: null },
        { key: 'array', value: [1, 2, '三', { four: 4 }] },
        { key: 'object', value: { name: '测试', nested: { value: 123 } } },
        { key: 'date', value: new Date('2024-01-01') }
      ]
      
      // 保存所有测试数据
      testCases.forEach(({ key, value }) => {
        const setResult = setStorageItem(key, value)
        expect(setResult.success).toBe(true)
      })
      
      // 获取并验证所有测试数据
      testCases.forEach(({ key, value }) => {
        const getResult = getStorageItem(key)
        expect(getResult.success).toBe(true)
        
        if (value instanceof Date) {
          // 日期对象会被序列化为字符串
          expect(getResult.data).toBe(value.toISOString())
        } else {
          expect(getResult.data).toEqual(value)
        }
      })
    })
  })
})