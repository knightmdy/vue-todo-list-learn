/**
 * Todo Store 测试
 * 
 * 测试Todo Store的各种功能：
 * 1. 基本的CRUD操作
 * 2. 过滤器功能
 * 3. 计算属性
 * 4. 错误处理
 * 5. 批量操作
 * 6. 本地存储集成
 */

import { createPinia, setActivePinia } from 'pinia'
import { useTodoStore } from '@/stores/todoStore'
import type { Todo, FilterType } from '@/types/todo'
import * as todoStorage from '@/utils/todoStorage'

// Mock todoStorage functions
let mockIdCounter = 0
jest.mock('@/utils/todoStorage', () => ({
  generateId: jest.fn(() => 'mock-id-' + (++mockIdCounter)),
  saveTodos: jest.fn(),
  loadTodos: jest.fn(),
  saveFilter: jest.fn(),
  loadFilter: jest.fn()
}))

describe('useTodoStore', () => {
  beforeEach(() => {
    // 为每个测试创建新的Pinia实例
    setActivePinia(createPinia())
    
    // 重置所有mock
    jest.clearAllMocks()
    
    // 重置ID计数器
    mockIdCounter = 0
    
    // 设置默认的mock返回值
    ;(todoStorage.saveTodos as jest.Mock).mockReturnValue({ success: true })
    ;(todoStorage.saveFilter as jest.Mock).mockReturnValue({ success: true })
    ;(todoStorage.loadTodos as jest.Mock).mockReturnValue({ success: true, data: [] })
    ;(todoStorage.loadFilter as jest.Mock).mockReturnValue({ success: true, data: 'all' })
  })

  describe('初始状态', () => {
    it('应该有正确的初始状态', () => {
      const store = useTodoStore()
      
      expect(store.todos).toEqual([])
      expect(store.filter).toBe('all')
      expect(store.loading).toBe(false)
      expect(store.error).toBeNull()
    })

    it('应该有正确的初始计算属性', () => {
      const store = useTodoStore()
      
      expect(store.filteredTodos).toEqual([])
      expect(store.completedCount).toBe(0)
      expect(store.activeCount).toBe(0)
      expect(store.totalCount).toBe(0)
      expect(store.hasTodos).toBe(false)
      expect(store.allCompleted).toBe(false)
    })
  })

  describe('添加待办事项', () => {
    it('应该能够添加新的待办事项', () => {
      const store = useTodoStore()
      const title = '测试待办事项'
      
      const todo = store.addTodo(title)
      
      expect(todo).toBeDefined()
      expect(todo.title).toBe(title)
      expect(todo.completed).toBe(false)
      expect(todo.id).toBeTruthy()
      expect(todo.createdAt).toBeInstanceOf(Date)
      expect(todo.updatedAt).toBeInstanceOf(Date)
      
      expect(store.todos).toHaveLength(1)
      expect(store.todos[0]).toStrictEqual(todo)
    })

    it('应该拒绝空标题', () => {
      const store = useTodoStore()
      
      expect(() => store.addTodo('')).toThrow('待办事项标题不能为空')
      expect(() => store.addTodo('   ')).toThrow('待办事项标题不能为空')
      
      expect(store.todos).toHaveLength(0)
      expect(store.error).toBe('待办事项标题不能为空')
    })

    it('应该拒绝过长的标题', () => {
      const store = useTodoStore()
      const longTitle = 'a'.repeat(201)
      
      expect(() => store.addTodo(longTitle)).toThrow('待办事项标题不能超过200个字符')
      
      expect(store.todos).toHaveLength(0)
      expect(store.error).toBe('待办事项标题不能超过200个字符')
    })

    it('应该自动修剪标题的空白字符', () => {
      const store = useTodoStore()
      const title = '  测试待办事项  '
      
      const todo = store.addTodo(title)
      
      expect(todo.title).toBe('测试待办事项')
    })
  })

  describe('切换待办事项状态', () => {
    it('应该能够切换待办事项的完成状态', () => {
      const store = useTodoStore()
      const todo = store.addTodo('测试待办事项')
      const originalUpdatedAt = todo.updatedAt
      
      // 等待一毫秒确保时间戳不同
      setTimeout(() => {
        const success = store.toggleTodo(todo.id)
        
        expect(success).toBe(true)
        expect(todo.completed).toBe(true)
        expect(todo.updatedAt.getTime()).toBeGreaterThan(originalUpdatedAt.getTime())
        
        // 再次切换
        store.toggleTodo(todo.id)
        expect(todo.completed).toBe(false)
      }, 1)
    })

    it('应该处理不存在的待办事项ID', () => {
      const store = useTodoStore()
      
      const success = store.toggleTodo('non-existent-id')
      
      expect(success).toBe(false)
      expect(store.error).toBe('未找到ID为 non-existent-id 的待办事项')
    })
  })

  describe('删除待办事项', () => {
    it('应该能够删除待办事项', () => {
      const store = useTodoStore()
      const todo = store.addTodo('测试待办事项')
      
      const success = store.deleteTodo(todo.id)
      
      expect(success).toBe(true)
      expect(store.todos).toHaveLength(0)
    })

    it('应该处理不存在的待办事项ID', () => {
      const store = useTodoStore()
      
      const success = store.deleteTodo('non-existent-id')
      
      expect(success).toBe(false)
      expect(store.error).toBe('未找到ID为 non-existent-id 的待办事项')
    })
  })

  describe('更新待办事项', () => {
    it('应该能够更新待办事项标题', () => {
      const store = useTodoStore()
      const todo = store.addTodo('原始标题')
      const originalUpdatedAt = todo.updatedAt
      
      setTimeout(() => {
        const success = store.updateTodo(todo.id, '更新后的标题')
        
        expect(success).toBe(true)
        expect(todo.title).toBe('更新后的标题')
        expect(todo.updatedAt.getTime()).toBeGreaterThan(originalUpdatedAt.getTime())
      }, 1)
    })

    it('应该拒绝空标题更新', () => {
      const store = useTodoStore()
      const todo = store.addTodo('原始标题')
      
      const success = store.updateTodo(todo.id, '')
      
      expect(success).toBe(false)
      expect(todo.title).toBe('原始标题')
      expect(store.error).toBe('待办事项标题不能为空')
    })

    it('应该处理不存在的待办事项ID', () => {
      const store = useTodoStore()
      
      const success = store.updateTodo('non-existent-id', '新标题')
      
      expect(success).toBe(false)
      expect(store.error).toBe('未找到ID为 non-existent-id 的待办事项')
    })
  })

  describe('过滤器功能', () => {
    beforeEach(() => {
      const store = useTodoStore()
      // 添加测试数据
      store.addTodo('未完成任务1')
      store.addTodo('未完成任务2')
      const completedTodo = store.addTodo('已完成任务')
      store.toggleTodo(completedTodo.id)
    })

    it('应该能够设置过滤器', () => {
      const store = useTodoStore()
      
      store.setFilter('active')
      expect(store.filter).toBe('active')
      
      store.setFilter('completed')
      expect(store.filter).toBe('completed')
      
      store.setFilter('all')
      expect(store.filter).toBe('all')
    })

    it('应该正确过滤待办事项 - all', () => {
      const store = useTodoStore()
      
      store.setFilter('all')
      expect(store.filteredTodos).toHaveLength(3)
    })

    it('应该正确过滤待办事项 - active', () => {
      const store = useTodoStore()
      
      store.setFilter('active')
      expect(store.filteredTodos).toHaveLength(2)
      expect(store.filteredTodos.every(todo => !todo.completed)).toBe(true)
    })

    it('应该正确过滤待办事项 - completed', () => {
      const store = useTodoStore()
      
      store.setFilter('completed')
      expect(store.filteredTodos).toHaveLength(1)
      expect(store.filteredTodos.every(todo => todo.completed)).toBe(true)
    })
  })

  describe('计算属性', () => {
    beforeEach(() => {
      const store = useTodoStore()
      // 添加测试数据
      store.addTodo('任务1')
      store.addTodo('任务2')
      const todo3 = store.addTodo('任务3')
      store.toggleTodo(todo3.id)
    })

    it('应该正确计算completedCount', () => {
      const store = useTodoStore()
      expect(store.completedCount).toBe(1)
    })

    it('应该正确计算activeCount', () => {
      const store = useTodoStore()
      expect(store.activeCount).toBe(2)
    })

    it('应该正确计算totalCount', () => {
      const store = useTodoStore()
      expect(store.totalCount).toBe(3)
    })

    it('应该正确计算hasTodos', () => {
      const store = useTodoStore()
      expect(store.hasTodos).toBe(true)
      
      store.clearAllTodos()
      expect(store.hasTodos).toBe(false)
    })

    it('应该正确计算allCompleted', () => {
      const store = useTodoStore()
      
      // 清空现有数据，重新开始测试
      store.clearAllTodos()
      expect(store.allCompleted).toBe(false)
      
      // 添加新任务
      const todo1 = store.addTodo('任务1')
      const todo2 = store.addTodo('任务2')
      expect(store.allCompleted).toBe(false)
      
      // 完成所有任务
      store.toggleTodo(todo1.id)
      store.toggleTodo(todo2.id)
      expect(store.allCompleted).toBe(true)
    })

    it('应该能够根据ID查找待办事项', () => {
      const store = useTodoStore()
      const firstTodo = store.todos[0]
      
      const foundTodo = store.getTodoById(firstTodo.id)
      expect(foundTodo).toBe(firstTodo)
      
      const notFound = store.getTodoById('non-existent-id')
      expect(notFound).toBeUndefined()
    })
  })

  describe('批量操作', () => {
    it('应该能够切换所有待办事项状态', () => {
      const store = useTodoStore()
      store.addTodo('任务1')
      store.addTodo('任务2')
      store.addTodo('任务3')
      
      // 全部完成
      store.toggleAllTodos(true)
      expect(store.todos.every(todo => todo.completed)).toBe(true)
      
      // 全部未完成
      store.toggleAllTodos(false)
      expect(store.todos.every(todo => !todo.completed)).toBe(true)
    })

    it('应该能够清除已完成的待办事项', () => {
      const store = useTodoStore()
      const uncompletedTodo = store.addTodo('未完成任务')
      const completedTodo = store.addTodo('已完成任务')
      store.toggleTodo(completedTodo.id)
      
      const clearedCount = store.clearCompleted()
      
      expect(clearedCount).toBe(1)
      expect(store.todos).toHaveLength(1)
      expect(store.todos[0].id).toBe(uncompletedTodo.id)
      expect(store.todos[0].title).toBe('未完成任务')
    })

    it('应该能够添加多个待办事项', () => {
      const store = useTodoStore()
      const titles = ['任务1', '任务2', '任务3']
      
      const newTodos = store.addMultipleTodos(titles)
      
      expect(newTodos).toHaveLength(3)
      expect(store.todos).toHaveLength(3)
      expect(store.todos.map(todo => todo.title)).toEqual(titles)
    })

    it('应该过滤空标题', () => {
      const store = useTodoStore()
      const titles = ['任务1', '', '任务2', '   ', '任务3']
      
      const newTodos = store.addMultipleTodos(titles)
      
      expect(newTodos).toHaveLength(3)
      expect(store.todos).toHaveLength(3)
    })
  })

  describe('状态管理', () => {
    it('应该能够设置加载状态', () => {
      const store = useTodoStore()
      
      store.setLoading(true)
      expect(store.loading).toBe(true)
      
      store.setLoading(false)
      expect(store.loading).toBe(false)
    })

    it('应该能够设置和清除错误', () => {
      const store = useTodoStore()
      
      store.setError('测试错误')
      expect(store.error).toBe('测试错误')
      
      store.clearError()
      expect(store.error).toBeNull()
    })

    it('应该能够获取状态快照', () => {
      const store = useTodoStore()
      store.addTodo('测试任务')
      store.setFilter('active')
      store.setLoading(true)
      
      const snapshot = store.getStateSnapshot()
      
      expect(snapshot.todos).toHaveLength(1)
      expect(snapshot.filter).toBe('active')
      expect(snapshot.loading).toBe(true)
      
      // 快照应该是独立的副本
      store.addTodo('另一个任务')
      expect(snapshot.todos).toHaveLength(1)
    })

    it('应该能够设置待办事项列表', () => {
      const store = useTodoStore()
      const todos: Todo[] = [
        {
          id: '1',
          title: '任务1',
          completed: false,
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          id: '2',
          title: '任务2',
          completed: true,
          createdAt: new Date(),
          updatedAt: new Date()
        }
      ]
      
      store.setTodos(todos)
      
      expect(store.todos).toEqual(todos)
      expect(store.totalCount).toBe(2)
      expect(store.completedCount).toBe(1)
      expect(store.activeCount).toBe(1)
    })

    it('应该能够清空所有待办事项', () => {
      const store = useTodoStore()
      store.addTodo('任务1')
      store.addTodo('任务2')
      
      store.clearAllTodos()
      
      expect(store.todos).toHaveLength(0)
      expect(store.hasTodos).toBe(false)
    })
  })

  describe('本地存储集成', () => {
    it('应该能够从本地存储加载数据', async () => {
      const mockTodos: Todo[] = [
        {
          id: '1',
          title: '存储的任务1',
          completed: false,
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          id: '2',
          title: '存储的任务2',
          completed: true,
          createdAt: new Date(),
          updatedAt: new Date()
        }
      ]
      
      // Mock加载函数返回测试数据
      ;(todoStorage.loadTodos as jest.Mock).mockReturnValue({
        success: true,
        data: mockTodos
      })
      ;(todoStorage.loadFilter as jest.Mock).mockReturnValue({
        success: true,
        data: 'active'
      })
      
      const store = useTodoStore()
      
      // 初始状态应该为空
      expect(store.todos).toEqual([])
      expect(store.filter).toBe('all')
      expect(store.initialized).toBe(false)
      
      // 加载数据
      await store.loadFromStorage()
      
      // 验证数据已加载
      expect(store.todos).toEqual(mockTodos)
      expect(store.filter).toBe('active')
      expect(store.initialized).toBe(true)
      expect(store.loading).toBe(false)
      
      // 验证调用了正确的存储函数
      expect(todoStorage.loadTodos).toHaveBeenCalled()
      expect(todoStorage.loadFilter).toHaveBeenCalled()
    })

    it('应该处理加载失败的情况', async () => {
      // Mock加载函数返回失败结果
      ;(todoStorage.loadTodos as jest.Mock).mockReturnValue({
        success: false,
        error: '加载待办事项失败'
      })
      ;(todoStorage.loadFilter as jest.Mock).mockReturnValue({
        success: true,
        data: 'all'
      })
      
      const store = useTodoStore()
      
      await store.loadFromStorage()
      
      // 验证错误状态
      expect(store.error).toContain('加载待办事项失败')
      expect(store.initialized).toBe(true)
      expect(store.loading).toBe(false)
    })

    it('应该在数据变化时自动保存到本地存储', async () => {
      const store = useTodoStore()
      
      // 先初始化
      await store.loadFromStorage()
      
      // 清除之前的调用记录
      jest.clearAllMocks()
      
      // 添加待办事项
      store.addTodo('新任务')
      
      // 等待下一个tick让watch触发
      await new Promise(resolve => setTimeout(resolve, 0))
      
      // 验证自动保存被调用
      expect(todoStorage.saveTodos).toHaveBeenCalledWith(store.todos)
    })

    it('应该在过滤器变化时自动保存', async () => {
      const store = useTodoStore()
      
      // 先初始化
      await store.loadFromStorage()
      
      // 清除之前的调用记录
      jest.clearAllMocks()
      
      // 改变过滤器
      store.setFilter('completed')
      
      // 等待下一个tick让watch触发
      await new Promise(resolve => setTimeout(resolve, 0))
      
      // 验证自动保存被调用
      expect(todoStorage.saveFilter).toHaveBeenCalledWith('completed')
    })

    it('应该能够手动保存待办事项到存储', async () => {
      const store = useTodoStore()
      store.addTodo('测试任务')
      
      await store.saveTodosToStorage()
      
      expect(todoStorage.saveTodos).toHaveBeenCalledWith(store.todos)
    })

    it('应该能够手动保存过滤器到存储', async () => {
      const store = useTodoStore()
      store.setFilter('active')
      
      await store.saveFilterToStorage()
      
      expect(todoStorage.saveFilter).toHaveBeenCalledWith('active')
    })

    it('应该处理保存失败的情况', async () => {
      // Mock保存函数返回失败结果
      ;(todoStorage.saveTodos as jest.Mock).mockReturnValue({
        success: false,
        error: '保存失败'
      })
      
      const store = useTodoStore()
      store.addTodo('测试任务')
      
      await store.saveTodosToStorage()
      
      expect(store.error).toContain('保存待办事项失败')
    })

    it('应该在初始化前不自动保存', async () => {
      const store = useTodoStore()
      
      // 在初始化前添加数据
      store.addTodo('测试任务')
      
      // 等待一段时间
      await new Promise(resolve => setTimeout(resolve, 10))
      
      // 验证没有调用保存函数（因为还没初始化）
      expect(todoStorage.saveTodos).not.toHaveBeenCalled()
      
      // 初始化后再修改数据
      await store.loadFromStorage()
      jest.clearAllMocks()
      
      store.addTodo('另一个任务')
      await new Promise(resolve => setTimeout(resolve, 0))
      
      // 现在应该调用保存函数
      expect(todoStorage.saveTodos).toHaveBeenCalled()
    })
  })
})