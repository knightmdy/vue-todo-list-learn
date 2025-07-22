// 【知识点】Pinia 状态管理
// - 定义全局 store，集中管理待办事项数据和业务逻辑
// - TypeScript 类型安全，提升开发体验
// - 组合式 API 便于逻辑复用
// - 状态持久化（localStorage）
// - 工程化最佳实践
/**
 * Todo Store - Pinia状态管理
 * 
 * 这个Store管理待办事项应用的所有状态，包括：
 * 1. 待办事项列表的CRUD操作
 * 2. 过滤器状态管理
 * 3. 计算属性（过滤后的待办事项、统计信息等）
 * 4. 与本地存储的集成
 */

import { defineStore } from 'pinia'
import { computed, ref, watch } from 'vue'
import type { Todo, FilterType, TodoState } from '@/types/todo'
import { generateId, saveTodos, loadTodos, saveFilter, loadFilter } from '@/utils/todoStorage'

/**
 * Todo Store
 * 使用组合式API风格定义Store
 */
export const useTodoStore = defineStore('todo', () => {
  // ===== State =====
  
  /** 待办事项列表 */
  const todos = ref<Todo[]>([])
  
  /** 当前过滤器 */
  const filter = ref<FilterType>('all')
  
  /** 加载状态 */
  const loading = ref(false)
  
  /** 错误信息 */
  const error = ref<string | null>(null)
  
  /** 是否已初始化 */
  const initialized = ref(false)

  // ===== 本地存储集成 =====
  
  /**
   * 保存待办事项到本地存储
   */
  const saveTodosToStorage = async () => {
    try {
      const result = saveTodos(todos.value)
      if (!result.success) {
        setError(`保存待办事项失败: ${result.error}`)
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '保存待办事项时发生未知错误'
      setError(errorMessage)
    }
  }
  
  /**
   * 保存过滤器到本地存储
   */
  const saveFilterToStorage = async () => {
    try {
      const result = saveFilter(filter.value)
      if (!result.success) {
        setError(`保存过滤器状态失败: ${result.error}`)
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '保存过滤器状态时发生未知错误'
      setError(errorMessage)
    }
  }
  
  /**
   * 从本地存储加载数据
   */
  const loadFromStorage = async () => {
    setLoading(true)
    clearError()
    
    try {
      // 加载待办事项
      const todosResult = loadTodos()
      if (todosResult.success && todosResult.data) {
        todos.value = todosResult.data
      } else if (!todosResult.success) {
        setError(`加载待办事项失败: ${todosResult.error}`)
      }
      
      // 加载过滤器状态
      const filterResult = loadFilter()
      if (filterResult.success && filterResult.data) {
        filter.value = filterResult.data
      } else if (!filterResult.success) {
        setError(`加载过滤器状态失败: ${filterResult.error}`)
      }
      
      initialized.value = true
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '加载数据时发生未知错误'
      setError(errorMessage)
    } finally {
      setLoading(false)
    }
  }
  
  // 监听数据变化，自动保存到本地存储
  watch(
    todos,
    () => {
      if (initialized.value) {
        saveTodosToStorage()
      }
    },
    { deep: true }
  )
  
  watch(
    filter,
    () => {
      if (initialized.value) {
        saveFilterToStorage()
      }
    }
  )

  // ===== Getters =====
  
  /**
   * 根据当前过滤器返回过滤后的待办事项
   */
  const filteredTodos = computed(() => {
    switch (filter.value) {
      case 'active':
        return todos.value.filter(todo => !todo.completed)
      case 'completed':
        return todos.value.filter(todo => todo.completed)
      case 'all':
      default:
        return todos.value
    }
  })
  
  /**
   * 已完成的待办事项数量
   */
  const completedCount = computed(() => {
    return todos.value.filter(todo => todo.completed).length
  })
  
  /**
   * 未完成的待办事项数量
   */
  const activeCount = computed(() => {
    return todos.value.filter(todo => !todo.completed).length
  })
  
  /**
   * 待办事项总数
   */
  const totalCount = computed(() => {
    return todos.value.length
  })
  
  /**
   * 是否有待办事项
   */
  const hasTodos = computed(() => {
    return todos.value.length > 0
  })
  
  /**
   * 是否所有待办事项都已完成
   */
  const allCompleted = computed(() => {
    return todos.value.length > 0 && todos.value.every(todo => todo.completed)
  })
  
  /**
   * 根据ID查找待办事项
   */
  const getTodoById = computed(() => {
    return (id: string): Todo | undefined => {
      return todos.value.find(todo => todo.id === id)
    }
  })

  // ===== Actions =====
  
  /**
   * 设置错误信息
   */
  const setError = (errorMessage: string | null) => {
    error.value = errorMessage
    if (errorMessage) {
      console.error('[TodoStore]', errorMessage)
    }
  }
  
  /**
   * 清除错误信息
   */
  const clearError = () => {
    error.value = null
  }
  
  /**
   * 添加新的待办事项
   * @param title - 待办事项标题
   * @returns 新创建的待办事项
   */
  const addTodo = (title: string): Todo => {
    // 验证输入
    if (!title || title.trim().length === 0) {
      const errorMsg = '待办事项标题不能为空'
      setError(errorMsg)
      throw new Error(errorMsg)
    }
    
    if (title.trim().length > 200) {
      const errorMsg = '待办事项标题不能超过200个字符'
      setError(errorMsg)
      throw new Error(errorMsg)
    }
    
    clearError()
    
    const now = new Date()
    const newTodo: Todo = {
      id: generateId(),
      title: title.trim(),
      completed: false,
      createdAt: now,
      updatedAt: now
    }
    
    todos.value.push(newTodo)
    return newTodo
  }
  
  /**
   * 切换待办事项的完成状态
   * @param id - 待办事项ID
   * @returns 是否操作成功
   */
  const toggleTodo = (id: string): boolean => {
    const todo = todos.value.find(t => t.id === id)
    
    if (!todo) {
      const errorMsg = `未找到ID为 ${id} 的待办事项`
      setError(errorMsg)
      return false
    }
    
    clearError()
    todo.completed = !todo.completed
    todo.updatedAt = new Date()
    
    return true
  }
  
  /**
   * 删除待办事项
   * @param id - 待办事项ID
   * @returns 是否操作成功
   */
  const deleteTodo = (id: string): boolean => {
    const index = todos.value.findIndex(t => t.id === id)
    
    if (index === -1) {
      const errorMsg = `未找到ID为 ${id} 的待办事项`
      setError(errorMsg)
      return false
    }
    
    clearError()
    todos.value.splice(index, 1)
    
    return true
  }
  
  /**
   * 更新待办事项标题
   * @param id - 待办事项ID
   * @param title - 新标题
   * @returns 是否操作成功
   */
  const updateTodo = (id: string, title: string): boolean => {
    // 验证输入
    if (!title || title.trim().length === 0) {
      const errorMsg = '待办事项标题不能为空'
      setError(errorMsg)
      return false
    }
    
    if (title.trim().length > 200) {
      const errorMsg = '待办事项标题不能超过200个字符'
      setError(errorMsg)
      return false
    }
    
    const todo = todos.value.find(t => t.id === id)
    
    if (!todo) {
      const errorMsg = `未找到ID为 ${id} 的待办事项`
      setError(errorMsg)
      return false
    }
    
    clearError()
    todo.title = title.trim()
    todo.updatedAt = new Date()
    
    return true
  }
  
  /**
   * 设置过滤器
   * @param newFilter - 新的过滤器类型
   */
  const setFilter = (newFilter: FilterType) => {
    filter.value = newFilter
    clearError()
  }
  
  /**
   * 切换所有待办事项的完成状态
   * @param completed - 目标完成状态
   */
  const toggleAllTodos = (completed: boolean) => {
    const now = new Date()
    
    todos.value.forEach(todo => {
      if (todo.completed !== completed) {
        todo.completed = completed
        todo.updatedAt = now
      }
    })
    
    clearError()
  }
  
  /**
   * 清除所有已完成的待办事项
   * @returns 被删除的待办事项数量
   */
  const clearCompleted = (): number => {
    const completedTodos = todos.value.filter(todo => todo.completed)
    const count = completedTodos.length
    
    todos.value = todos.value.filter(todo => !todo.completed)
    clearError()
    
    return count
  }
  
  /**
   * 设置待办事项列表
   * @param newTodos - 新的待办事项列表
   */
  const setTodos = (newTodos: Todo[]) => {
    todos.value = newTodos
    clearError()
  }
  
  /**
   * 清空所有待办事项
   */
  const clearAllTodos = () => {
    todos.value = []
    clearError()
  }
  
  /**
   * 设置加载状态
   * @param isLoading - 是否正在加载
   */
  const setLoading = (isLoading: boolean) => {
    loading.value = isLoading
  }
  
  /**
   * 批量操作：添加多个待办事项
   * @param titles - 待办事项标题数组
   * @returns 新创建的待办事项数组
   */
  const addMultipleTodos = (titles: string[]): Todo[] => {
    const validTitles = titles.filter(title => title && title.trim().length > 0)
    
    if (validTitles.length === 0) {
      const errorMsg = '没有有效的待办事项标题'
      setError(errorMsg)
      return []
    }
    
    clearError()
    
    const now = new Date()
    const newTodos: Todo[] = validTitles.map(title => ({
      id: generateId(),
      title: title.trim(),
      completed: false,
      createdAt: now,
      updatedAt: now
    }))
    
    todos.value.push(...newTodos)
    return newTodos
  }
  
  /**
   * 获取Store的状态快照
   * @returns 当前状态的快照
   */
  const getStateSnapshot = (): TodoState => {
    return {
      todos: [...todos.value],
      filter: filter.value,
      loading: loading.value,
      error: error.value
    }
  }

  // 返回Store的公共API
  return {
    // State
    todos,
    filter,
    loading,
    error,
    initialized,
    
    // Getters
    filteredTodos,
    completedCount,
    activeCount,
    totalCount,
    hasTodos,
    allCompleted,
    getTodoById,
    
    // Actions
    addTodo,
    toggleTodo,
    deleteTodo,
    updateTodo,
    setFilter,
    toggleAllTodos,
    clearCompleted,
    setTodos,
    clearAllTodos,
    setLoading,
    setError,
    clearError,
    addMultipleTodos,
    getStateSnapshot,
    
    // Storage Actions
    loadFromStorage,
    saveTodosToStorage,
    saveFilterToStorage
  }
})

/**
 * 导出Store的类型定义，用于TypeScript类型推断
 */
export type TodoStore = ReturnType<typeof useTodoStore>