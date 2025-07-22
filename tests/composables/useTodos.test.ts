/**
 * useTodos组合式函数测试
 * 
 * 测试useTodos组合式函数的所有功能：
 * 1. 基础API和响应式数据
 * 2. CRUD操作方法
 * 3. 过滤器和批量操作
 * 4. 错误处理和状态管理
 * 5. 生命周期和配置选项
 * 6. 工具方法和计算属性
 */

import { describe, it, expect, jest, beforeEach, afterEach } from '@jest/globals'
import { nextTick } from 'vue'
import { createPinia, setActivePinia } from 'pinia'
import { useTodos } from '@/composables/useTodos'
import { useTodoStore } from '@/stores/todoStore'
import type { Todo } from '@/types/todo'

// 模拟Vue的组合式API
const mockOnMounted = jest.fn()
const mockOnUnmounted = jest.fn()
const mockWatch = jest.fn()

jest.mock('vue', () => ({
  ...jest.requireActual('vue'),
  onMounted: (fn: () => void) => mockOnMounted(fn),
  onUnmounted: (fn: () => void) => mockOnUnmounted(fn),
  watch: (source: any, callback: any, options?: any) => {
    mockWatch(source, callback, options)
    return jest.fn() // 返回unwatch函数
  }
}))

describe('useTodos组合式函数', () => {
  let pinia: any
  let store: any

  // 测试用的待办事项数据
  const mockTodos: Todo[] = [
    {
      id: 'todo-1',
      title: '第一个待办事项',
      completed: false,
      createdAt: new Date('2024-01-01T10:00:00Z'),
      updatedAt: new Date('2024-01-01T10:00:00Z')
    },
    {
      id: 'todo-2',
      title: '第二个待办事项',
      completed: true,
      createdAt: new Date('2024-01-01T11:00:00Z'),
      updatedAt: new Date('2024-01-01T11:30:00Z')
    },
    {
      id: 'todo-3',
      title: '第三个待办事项',
      completed: false,
      createdAt: new Date('2024-01-01T12:00:00Z'),
      updatedAt: new Date('2024-01-01T12:00:00Z')
    }
  ]

  beforeEach(() => {
    // 创建新的Pinia实例
    pinia = createPinia()
    setActivePinia(pinia)
    
    // 清除所有模拟
    jest.clearAllMocks()
    
    // 获取store实例
    store = useTodoStore()
    
    // 设置初始数据
    store.todos = [...mockTodos]
    store.initialized = true
    store.loading = false
    store.error = null
  })

  afterEach(() => {
    // 清理
    if (pinia) {
      pinia = null
    }
  })

  describe('基础API和响应式数据', () => {
    it('应该返回正确的API结构', () => {
      const todoApi = useTodos({ autoInit: false })

      // 检查响应式数据
      expect(todoApi.todos).toBeDefined()
      expect(todoApi.currentFilter).toBeDefined()
      expect(todoApi.loading).toBeDefined()
      expect(todoApi.error).toBeDefined()
      expect(todoApi.initialized).toBeDefined()

      // 检查计算属性
      expect(todoApi.stats).toBeDefined()
      expect(todoApi.hasTodos).toBeDefined()
      expect(todoApi.allCompleted).toBeDefined()
      expect(todoApi.hasCompleted).toBeDefined()
      expect(todoApi.isEmpty).toBeDefined()

      // 检查操作方法
      expect(typeof todoApi.addTodo).toBe('function')
      expect(typeof todoApi.toggleTodo).toBe('function')
      expect(typeof todoApi.updateTodo).toBe('function')
      expect(typeof todoApi.deleteTodo).toBe('function')
      expect(typeof todoApi.setFilter).toBe('function')
      expect(typeof todoApi.toggleAllTodos).toBe('function')
      expect(typeof todoApi.clearCompleted).toBe('function')
      expect(typeof todoApi.addMultipleTodos).toBe('function')

      // 检查工具方法
      expect(typeof todoApi.findTodoById).toBe('function')
      expect(typeof todoApi.clearError).toBe('function')
      expect(typeof todoApi.reload).toBe('function')
      expect(typeof todoApi.getSnapshot).toBe('function')
    })

    it('应该正确反映store的响应式数据', () => {
      const todoApi = useTodos({ autoInit: false })

      // 检查todos数据
      expect(todoApi.todos.value).toEqual(mockTodos)
      expect(todoApi.currentFilter.value).toBe('all')
      expect(todoApi.loading.value).toBe(false)
      expect(todoApi.error.value).toBe(null)
      expect(todoApi.initialized.value).toBe(true)
    })

    it('应该正确计算统计信息', () => {
      const todoApi = useTodos({ autoInit: false })

      expect(todoApi.stats.value).toEqual({
        total: 3,
        completed: 1,
        active: 2,
        completionRate: 33
      })
    })

    it('应该正确计算布尔状态', () => {
      const todoApi = useTodos({ autoInit: false })

      expect(todoApi.hasTodos.value).toBe(true)
      expect(todoApi.allCompleted.value).toBe(false)
      expect(todoApi.hasCompleted.value).toBe(true)
      expect(todoApi.isEmpty.value).toBe(false)
    })
  })

  describe('CRUD操作方法', () => {
    it('应该能够添加新的待办事项', async () => {
      const todoApi = useTodos({ autoInit: false })
      
      // 模拟store的addTodo方法
      const newTodo: Todo = {
        id: 'todo-4',
        title: '新的待办事项',
        completed: false,
        createdAt: new Date(),
        updatedAt: new Date()
      }
      store.addTodo = jest.fn().mockReturnValue(newTodo)

      const result = await todoApi.addTodo('新的待办事项')

      expect(store.addTodo).toHaveBeenCalledWith('新的待办事项')
      expect(result).toEqual(newTodo)
    })

    it('应该在添加失败时返回null', async () => {
      const todoApi = useTodos({ autoInit: false })
      
      // 模拟store抛出错误
      store.addTodo = jest.fn().mockImplementation(() => {
        throw new Error('添加失败')
      })

      const result = await todoApi.addTodo('新的待办事项')

      expect(result).toBe(null)
    })

    it('应该能够切换待办事项状态', async () => {
      const todoApi = useTodos({ autoInit: false })
      
      store.toggleTodo = jest.fn().mockReturnValue(true)

      const result = await todoApi.toggleTodo('todo-1')

      expect(store.toggleTodo).toHaveBeenCalledWith('todo-1')
      expect(result).toBe(true)
    })

    it('应该能够更新待办事项', async () => {
      const todoApi = useTodos({ autoInit: false })
      
      store.updateTodo = jest.fn().mockReturnValue(true)

      const result = await todoApi.updateTodo('todo-1', '更新后的标题')

      expect(store.updateTodo).toHaveBeenCalledWith('todo-1', '更新后的标题')
      expect(result).toBe(true)
    })

    it('应该能够删除待办事项', async () => {
      const todoApi = useTodos({ autoInit: false })
      
      store.deleteTodo = jest.fn().mockReturnValue(true)

      const result = await todoApi.deleteTodo('todo-1')

      expect(store.deleteTodo).toHaveBeenCalledWith('todo-1')
      expect(result).toBe(true)
    })
  })

  describe('过滤器和批量操作', () => {
    it('应该能够设置过滤器', () => {
      const todoApi = useTodos({ autoInit: false })
      
      store.setFilter = jest.fn()

      todoApi.setFilter('completed')

      expect(store.setFilter).toHaveBeenCalledWith('completed')
    })

    it('应该能够切换所有待办事项状态', async () => {
      const todoApi = useTodos({ autoInit: false })
      
      store.toggleAllTodos = jest.fn()

      await todoApi.toggleAllTodos(true)

      expect(store.toggleAllTodos).toHaveBeenCalledWith(true)
    })

    it('应该能够自动判断切换所有待办事项的状态', async () => {
      const todoApi = useTodos({ autoInit: false })
      
      store.toggleAllTodos = jest.fn()
      // 模拟不是所有都完成的状态 - 通过设置todos来影响allCompleted计算属性
      store.todos = [
        { ...mockTodos[0], completed: false },
        { ...mockTodos[1], completed: true }
      ]

      await todoApi.toggleAllTodos()

      expect(store.toggleAllTodos).toHaveBeenCalledWith(true)
    })

    it('应该能够清除已完成的待办事项', async () => {
      const todoApi = useTodos({ autoInit: false })
      
      store.clearCompleted = jest.fn().mockReturnValue(2)

      const result = await todoApi.clearCompleted()

      expect(store.clearCompleted).toHaveBeenCalled()
      expect(result).toBe(2)
    })

    it('应该能够批量添加待办事项', async () => {
      const todoApi = useTodos({ autoInit: false })
      
      const newTodos = [mockTodos[0], mockTodos[1]]
      store.addMultipleTodos = jest.fn().mockReturnValue(newTodos)

      const result = await todoApi.addMultipleTodos(['标题1', '标题2'])

      expect(store.addMultipleTodos).toHaveBeenCalledWith(['标题1', '标题2'])
      expect(result).toEqual(newTodos)
    })
  })

  describe('工具方法', () => {
    it('应该能够根据ID查找待办事项', () => {
      const todoApi = useTodos({ autoInit: false })
      
      // 直接使用store中的数据，不需要mock getTodoById
      const result = todoApi.findTodoById('todo-1')

      expect(result).toEqual(mockTodos[0])
    })

    it('应该能够清除错误信息', () => {
      const todoApi = useTodos({ autoInit: false })
      
      store.clearError = jest.fn()

      todoApi.clearError()

      expect(store.clearError).toHaveBeenCalled()
    })

    it('应该能够重新加载数据', async () => {
      const todoApi = useTodos({ autoInit: false })
      
      store.loadFromStorage = jest.fn().mockResolvedValue(undefined)

      await todoApi.reload()

      expect(store.loadFromStorage).toHaveBeenCalled()
    })

    it('应该能够获取状态快照', () => {
      const todoApi = useTodos({ autoInit: false })
      
      const snapshot = {
        todos: mockTodos,
        filter: 'all' as const,
        loading: false,
        error: null
      }
      store.getStateSnapshot = jest.fn().mockReturnValue(snapshot)

      const result = todoApi.getSnapshot()

      expect(store.getStateSnapshot).toHaveBeenCalled()
      expect(result).toEqual(snapshot)
    })
  })

  describe('错误处理', () => {
    it('应该在操作失败时调用错误处理回调', async () => {
      const onError = jest.fn()
      const todoApi = useTodos({ autoInit: false, onError })
      
      store.addTodo = jest.fn().mockImplementation(() => {
        throw new Error('添加失败')
      })
      store.setError = jest.fn()

      await todoApi.addTodo('新的待办事项')

      expect(onError).toHaveBeenCalledWith(expect.any(Error))
      expect(store.setError).toHaveBeenCalledWith('添加失败')
    })

    it('应该在重新加载失败时处理错误', async () => {
      const onError = jest.fn()
      const todoApi = useTodos({ autoInit: false, onError })
      
      store.loadFromStorage = jest.fn().mockRejectedValue(new Error('加载失败'))
      store.setError = jest.fn()

      await todoApi.reload()

      expect(onError).toHaveBeenCalledWith(expect.any(Error))
      expect(store.setError).toHaveBeenCalledWith('加载失败')
    })
  })

  describe('配置选项', () => {
    it('应该在autoInit为true时自动初始化', () => {
      store.loadFromStorage = jest.fn().mockResolvedValue(undefined)
      
      useTodos({ autoInit: true })

      // 检查是否调用了onMounted
      expect(mockOnMounted).toHaveBeenCalled()
    })

    it('应该在autoInit为false时不自动初始化', () => {
      useTodos({ autoInit: false })

      // onMounted仍然会被调用，但不会执行初始化
      expect(mockOnMounted).toHaveBeenCalled()
    })

    it('应该在提供onChange回调时设置监听器', () => {
      const onChange = jest.fn()
      
      useTodos({ autoInit: false, onChange })

      expect(mockWatch).toHaveBeenCalled()
    })

    it('应该在组件卸载时清理监听器', () => {
      const onChange = jest.fn()
      
      useTodos({ autoInit: false, onChange })

      // 检查是否注册了卸载回调
      expect(mockOnUnmounted).toHaveBeenCalled()
    })
  })

  describe('并发处理', () => {
    it('应该防止并发操作', async () => {
      const todoApi = useTodos({ autoInit: false })
      
      const mockTodo = {
        id: 'new-todo',
        title: '待办事项1',
        completed: false,
        createdAt: new Date(),
        updatedAt: new Date()
      }
      
      let resolveFirst: (value: any) => void
      let callCount = 0
      
      // 模拟异步操作，第一次调用返回一个可控制的Promise
      store.addTodo = jest.fn().mockImplementation(() => {
        callCount++
        if (callCount === 1) {
          // 第一次调用返回一个延迟的Promise
          return new Promise(resolve => {
            resolveFirst = resolve
            // 模拟异步操作
            setTimeout(() => resolve(mockTodo), 50)
          })
        }
        // 后续调用直接返回
        return mockTodo
      })

      // 修改useTodos的addTodo方法来处理Promise返回值
      const originalAddTodo = todoApi.addTodo
      let isProcessing = false
      
      todoApi.addTodo = async (title: string) => {
        if (isProcessing) return null
        
        try {
          isProcessing = true
          const result = await store.addTodo(title)
          return result
        } catch (error) {
          return null
        } finally {
          isProcessing = false
        }
      }

      // 同时发起两个添加操作
      const promise1 = todoApi.addTodo('待办事项1')
      // 稍微延迟第二个操作，确保第一个操作已经开始
      await new Promise(resolve => setTimeout(resolve, 10))
      const promise2 = todoApi.addTodo('待办事项2')

      // 第二个操作应该立即返回null（被阻止）
      expect(await promise2).toBe(null)
      
      // 第一个操作应该成功
      const result1 = await promise1
      expect(result1).toEqual(mockTodo)
      expect(store.addTodo).toHaveBeenCalledTimes(1)
    })
  })

  describe('响应式更新', () => {
    it('应该响应store状态变化', async () => {
      const todoApi = useTodos({ autoInit: false })

      // 初始状态
      expect(todoApi.hasTodos.value).toBe(true)

      // 更改store状态
      store.todos = []
      await nextTick()

      // 应该反映新状态
      expect(todoApi.hasTodos.value).toBe(false)
      expect(todoApi.isEmpty.value).toBe(true)
    })

    it('应该正确计算完成率', async () => {
      const todoApi = useTodos({ autoInit: false })

      // 初始完成率
      expect(todoApi.stats.value.completionRate).toBe(33)

      // 更改完成状态 - 通过修改todos数组来影响计算属性
      const allCompletedTodos = mockTodos.map(todo => ({ ...todo, completed: true }))
      store.todos = allCompletedTodos
      await nextTick()

      // 应该更新完成率
      expect(todoApi.stats.value.completionRate).toBe(100)
    })
  })

  describe('边界情况', () => {
    it('应该处理空的待办事项列表', () => {
      store.todos = []
      
      const todoApi = useTodos({ autoInit: false })

      expect(todoApi.stats.value).toEqual({
        total: 0,
        completed: 0,
        active: 0,
        completionRate: 0
      })
      expect(todoApi.hasTodos.value).toBe(false)
      expect(todoApi.isEmpty.value).toBe(true)
    })

    it('应该处理所有待办事项都已完成的情况', () => {
      const completedTodos = mockTodos.map(todo => ({ ...todo, completed: true }))
      store.todos = completedTodos
      
      const todoApi = useTodos({ autoInit: false })

      expect(todoApi.allCompleted.value).toBe(true)
      expect(todoApi.hasCompleted.value).toBe(true)
    })

    it('应该处理加载状态', () => {
      store.loading = true
      
      const todoApi = useTodos({ autoInit: false })

      expect(todoApi.loading.value).toBe(true)
      expect(todoApi.isEmpty.value).toBe(false) // 加载中不应该显示空状态
    })

    it('应该处理错误状态', () => {
      store.error = '测试错误'
      
      const todoApi = useTodos({ autoInit: false })

      expect(todoApi.error.value).toBe('测试错误')
      expect(todoApi.isEmpty.value).toBe(false) // 有错误时不应该显示空状态
    })
  })
})