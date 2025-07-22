/**
 * Todo存储工具函数测试
 * 
 * 测试Todo应用专用的存储函数，包括：
 * 1. Todo列表的保存和加载
 * 2. 过滤器状态的持久化
 * 3. 应用设置的存储
 * 4. 完整应用状态的管理
 */

import type { Todo, FilterType } from '@/types/todo'
import { STORAGE_KEYS } from '@/types'
import {
  saveTodos,
  loadTodos,
  saveFilter,
  loadFilter,
  saveSettings,
  loadSettings,
  loadAppState,
  saveAppState,
  clearAppData,
  checkStorageHealth
} from '@/utils/todoStorage'

// 测试数据
const createMockTodo = (id: string, title: string, completed = false): Todo => ({
  id,
  title,
  completed,
  createdAt: new Date('2024-01-01T10:00:00Z'),
  updatedAt: new Date('2024-01-01T10:00:00Z')
})

const mockTodos: Todo[] = [
  createMockTodo('1', '学习Vue 3'),
  createMockTodo('2', '完成项目', true),
  createMockTodo('3', '写单元测试')
]

describe('Todo存储工具函数测试', () => {
  beforeEach(() => {
    // 清空localStorage
    localStorage.clear()
    jest.clearAllMocks()
    
    // 清除console输出
    jest.spyOn(console, 'log').mockImplementation(() => {})
    jest.spyOn(console, 'error').mockImplementation(() => {})
    jest.spyOn(console, 'warn').mockImplementation(() => {})
  })

  afterEach(() => {
    // 恢复console方法
    jest.restoreAllMocks()
  })

  describe('saveTodos', () => {
    test('成功保存Todo列表', () => {
      const result = saveTodos(mockTodos)
      
      expect(result.success).toBe(true)
      expect(result.data).toEqual(mockTodos)
      expect(result.key).toBe(STORAGE_KEYS.TODOS)
      expect(result.operation).toBe('set')
      
      // 验证console.log被调用
      expect(console.log).toHaveBeenCalledWith('✅ 成功保存 3 个待办事项')
    })

    test('保存空数组时成功', () => {
      const result = saveTodos([])
      
      expect(result.success).toBe(true)
      expect(result.data).toEqual([])
      expect(console.log).toHaveBeenCalledWith('✅ 成功保存 0 个待办事项')
    })

    test('传入非数组时返回验证错误', () => {
      const result = saveTodos('not an array' as any)
      
      expect(result.success).toBe(false)
      expect(result.error).toContain('Todo列表必须是数组类型')
      expect(console.error).toHaveBeenCalledWith(
        '❌ 保存Todo列表失败:',
        'Todo列表必须是数组类型'
      )
    })

    test('Todo项数据格式不正确时返回验证错误', () => {
      const invalidTodos = [
        { id: '1', title: '正常Todo', completed: false, createdAt: new Date(), updatedAt: new Date() },
        { id: '', title: 'ID为空', completed: false, createdAt: new Date(), updatedAt: new Date() }, // 无效：ID为空
        { title: '缺少ID', completed: false, createdAt: new Date(), updatedAt: new Date() } // 无效：缺少ID
      ]
      
      const result = saveTodos(invalidTodos as Todo[])
      
      expect(result.success).toBe(false)
      expect(result.error).toContain('Todo项数据格式不正确')
    })
  })

  describe('loadTodos', () => {
    test('成功加载Todo列表', () => {
      // 先保存数据
      saveTodos(mockTodos)
      
      // 加载数据
      const result = loadTodos()
      
      expect(result.success).toBe(true)
      expect(result.data).toHaveLength(3)
      expect(result.data![0].title).toBe('学习Vue 3')
      expect(result.data![1].completed).toBe(true)
      
      // 验证日期对象被正确转换
      expect(result.data![0].createdAt).toBeInstanceOf(Date)
      expect(result.data![0].updatedAt).toBeInstanceOf(Date)
      
      expect(console.log).toHaveBeenCalledWith('✅ 成功加载 3 个待办事项')
    })

    test('没有存储数据时返回空数组', () => {
      const result = loadTodos()
      
      expect(result.success).toBe(true)
      expect(result.data).toEqual([])
      expect(console.log).toHaveBeenCalledWith('✅ 成功加载 0 个待办事项')
    })

    test('存储数据格式不正确时返回错误', () => {
      // 直接设置无效数据
      localStorage.setItem(STORAGE_KEYS.TODOS, JSON.stringify('not an array'))
      
      const result = loadTodos()
      
      expect(result.success).toBe(false)
      expect(result.error).toContain('存储的Todo数据格式不正确')
      expect(console.error).toHaveBeenCalledWith(
        '❌ 加载Todo列表失败:',
        '存储的Todo数据格式不正确'
      )
    })

    test('存储数据损坏时返回错误', () => {
      // 设置损坏的JSON数据
      localStorage.setItem(STORAGE_KEYS.TODOS, 'invalid json {')
      
      const result = loadTodos()
      
      expect(result.success).toBe(false)
      expect(result.error).toContain('数据反序列化失败')
    })
  })

  describe('saveFilter', () => {
    test('成功保存有效的过滤器状态', () => {
      const validFilters: FilterType[] = ['all', 'active', 'completed']
      
      validFilters.forEach(filter => {
        const result = saveFilter(filter)
        
        expect(result.success).toBe(true)
        expect(result.data).toBe(filter)
        expect(result.key).toBe(STORAGE_KEYS.FILTER)
        expect(console.log).toHaveBeenCalledWith(`✅ 成功保存过滤器状态: ${filter}`)
      })
    })

    test('保存无效过滤器时返回验证错误', () => {
      const result = saveFilter('invalid' as FilterType)
      
      expect(result.success).toBe(false)
      expect(result.error).toContain('无效的过滤器类型')
      expect(console.error).toHaveBeenCalledWith(
        '❌ 保存过滤器状态失败:',
        '无效的过滤器类型'
      )
    })
  })

  describe('loadFilter', () => {
    test('成功加载过滤器状态', () => {
      // 先保存过滤器状态
      saveFilter('completed')
      
      // 加载过滤器状态
      const result = loadFilter()
      
      expect(result.success).toBe(true)
      expect(result.data).toBe('completed')
      expect(console.log).toHaveBeenCalledWith('✅ 成功加载过滤器状态: completed')
    })

    test('没有存储数据时返回默认值', () => {
      const result = loadFilter()
      
      expect(result.success).toBe(true)
      expect(result.data).toBe('all')
    })

    test('存储的过滤器状态无效时返回默认值', () => {
      // 直接设置无效的过滤器状态
      localStorage.setItem(STORAGE_KEYS.FILTER, JSON.stringify('invalid'))
      
      const result = loadFilter()
      
      expect(result.success).toBe(true)
      expect(result.data).toBe('all')
      expect(console.warn).toHaveBeenCalledWith('⚠️ 存储的过滤器状态无效，使用默认值')
    })
  })

  describe('saveSettings', () => {
    test('成功保存应用设置', () => {
      const settings = {
        theme: 'dark' as const,
        language: 'en-US' as const,
        autoSave: false
      }
      
      const result = saveSettings(settings)
      
      expect(result.success).toBe(true)
      expect(result.data!.theme).toBe('dark')
      expect(result.data!.language).toBe('en-US')
      expect(result.data!.autoSave).toBe(false)
      expect(result.data!.lastAccessTime).toBeDefined()
      expect(console.log).toHaveBeenCalledWith('✅ 成功保存应用设置')
    })

    test('部分更新设置时合并现有设置', () => {
      // 先保存初始设置
      saveSettings({ theme: 'light' as const, autoSave: true })
      
      // 部分更新设置
      const result = saveSettings({ theme: 'dark' as const })
      
      expect(result.success).toBe(true)
      expect(result.data!.theme).toBe('dark')
      expect(result.data!.autoSave).toBe(true) // 保持之前的值
    })
  })

  describe('loadSettings', () => {
    test('成功加载应用设置', () => {
      // 先保存设置
      saveSettings({ theme: 'dark' as const })
      
      // 加载设置
      const result = loadSettings()
      
      expect(result.success).toBe(true)
      expect(result.data!.theme).toBe('dark')
      expect(console.log).toHaveBeenCalledWith('✅ 成功加载应用设置')
    })

    test('没有存储数据时返回默认设置', () => {
      const result = loadSettings()
      
      expect(result.success).toBe(true)
      expect(result.data!.version).toBe('1.0.0')
      expect(result.data!.theme).toBe('auto')
      expect(result.data!.language).toBe('zh-CN')
      expect(result.data!.autoSave).toBe(true)
    })
  })

  describe('loadAppState', () => {
    test('成功加载完整应用状态', () => {
      // 先保存一些数据
      saveTodos(mockTodos)
      saveFilter('active')
      saveSettings({ theme: 'dark' as const })
      
      // 加载完整状态
      const state = loadAppState()
      
      expect(state.todos).toHaveLength(3)
      expect(state.filter).toBe('active')
      expect(state.settings.theme).toBe('dark')
      expect(state.errors).toHaveLength(0)
      
      expect(console.log).toHaveBeenCalledWith('📊 应用状态加载完成:', {
        todosCount: 3,
        filter: 'active',
        errorsCount: 0
      })
    })

    test('部分数据加载失败时收集错误', () => {
      // 设置损坏的Todo数据
      localStorage.setItem(STORAGE_KEYS.TODOS, 'invalid json')
      
      // 正常的过滤器数据
      saveFilter('completed')
      
      const state = loadAppState()
      
      expect(state.todos).toEqual([]) // 使用默认值
      expect(state.filter).toBe('completed') // 正常加载
      expect(state.errors).toHaveLength(1)
      expect(state.errors[0]).toContain('加载Todo列表失败')
    })
  })

  describe('saveAppState', () => {
    test('成功保存完整应用状态', () => {
      const appState = {
        todos: mockTodos,
        filter: 'active' as FilterType,
        settings: { theme: 'dark' as const }
      }
      
      const result = saveAppState(appState)
      
      expect(result.success).toBe(true)
      expect(result.errors).toHaveLength(0)
      
      expect(console.log).toHaveBeenCalledWith('💾 应用状态保存完成:', {
        success: true,
        errorsCount: 0
      })
    })
  })

  describe('clearAppData', () => {
    test('成功清除所有应用数据', () => {
      // 先保存一些数据
      saveTodos(mockTodos)
      saveFilter('active')
      saveSettings({ theme: 'dark' as const })
      
      // 验证数据存在
      expect(localStorage.getItem(STORAGE_KEYS.TODOS)).not.toBeNull()
      expect(localStorage.getItem(STORAGE_KEYS.FILTER)).not.toBeNull()
      expect(localStorage.getItem(STORAGE_KEYS.SETTINGS)).not.toBeNull()
      
      // 清除数据
      const result = clearAppData()
      
      expect(result.success).toBe(true)
      expect(result.errors).toHaveLength(0)
      
      // 验证数据被删除
      expect(localStorage.getItem(STORAGE_KEYS.TODOS)).toBeNull()
      expect(localStorage.getItem(STORAGE_KEYS.FILTER)).toBeNull()
      expect(localStorage.getItem(STORAGE_KEYS.SETTINGS)).toBeNull()
      
      expect(console.log).toHaveBeenCalledWith('🗑️ 应用数据清除完成:', {
        success: true,
        errorsCount: 0
      })
    })
  })

  describe('checkStorageHealth', () => {
    test('存储健康时返回正常状态', () => {
      // 保存一些正常数据
      saveTodos(mockTodos)
      saveFilter('active')
      saveSettings({ theme: 'light' as const })
      
      const health = checkStorageHealth()
      
      expect(health.available).toBe(true)
      expect(health.dataIntegrity).toBe(true)
      expect(health.usage.used).toBeGreaterThan(0)
      expect(health.usage.total).toBe(5 * 1024 * 1024)
      expect(health.usage.percentage).toBeGreaterThan(0)
      expect(health.issues).toHaveLength(0)
    })

    test('数据损坏时返回相应状态', () => {
      // 设置损坏的数据
      localStorage.setItem(STORAGE_KEYS.TODOS, 'invalid json')
      localStorage.setItem(STORAGE_KEYS.FILTER, JSON.stringify('invalid-filter'))
      
      const health = checkStorageHealth()
      
      expect(health.available).toBe(true)
      expect(health.dataIntegrity).toBe(false)
      expect(health.issues).toContain('Todo数据损坏')
    })
  })

  describe('边界情况和错误处理', () => {
    test('处理包含特殊字符的Todo标题', () => {
      const specialTodos: Todo[] = [
        createMockTodo('1', '包含emoji的标题 🎉✨'),
        createMockTodo('2', '包含引号的标题 "测试"'),
        createMockTodo('3', '包含换行符的标题\n第二行'),
        createMockTodo('4', '包含HTML标签的标题 <script>alert("test")</script>')
      ]
      
      const saveResult = saveTodos(specialTodos)
      expect(saveResult.success).toBe(true)
      
      const loadResult = loadTodos()
      expect(loadResult.success).toBe(true)
      expect(loadResult.data![0].title).toBe('包含emoji的标题 🎉✨')
      expect(loadResult.data![1].title).toBe('包含引号的标题 "测试"')
      expect(loadResult.data![2].title).toBe('包含换行符的标题\n第二行')
      expect(loadResult.data![3].title).toBe('包含HTML标签的标题 <script>alert("test")</script>')
    })

    test('处理日期对象的序列化和反序列化', () => {
      const now = new Date()
      const todoWithDate = createMockTodo('1', '测试日期')
      todoWithDate.createdAt = now
      todoWithDate.updatedAt = now
      
      const saveResult = saveTodos([todoWithDate])
      expect(saveResult.success).toBe(true)
      
      const loadResult = loadTodos()
      expect(loadResult.success).toBe(true)
      expect(loadResult.data![0].createdAt).toBeInstanceOf(Date)
      expect(loadResult.data![0].createdAt.getTime()).toBe(now.getTime())
    })
  })
})