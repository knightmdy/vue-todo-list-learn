// 【知识点】Vue3 组合式函数 useTodos
// - 复用待办事项相关业务逻辑
// - TypeScript 类型安全
// - 响应式数据与副作用
// - 工程化最佳实践
/**
 * useTodos 组合式函数
 * 
 * 这个组合式函数提供了待办事项管理的统一API，封装了：
 * 1. 与Pinia Store的交互
 * 2. 业务逻辑的处理
 * 3. 错误处理和状态管理
 * 4. 响应式数据的暴露
 * 
 * 使用这个组合式函数可以让组件更专注于UI渲染，
 * 而将业务逻辑集中在这里管理。
 */

import { computed, ref, watch, onMounted, onUnmounted, type Ref } from 'vue'
import { useTodoStore } from '@/stores/todoStore'
import type { Todo, FilterType, TodoStats, TodoState } from '@/types/todo'

/**
 * useTodos 组合式函数的返回类型
 */
export interface UseTodosReturn {
  // ===== 响应式数据 =====
  /** 当前过滤后的待办事项列表 */
  todos: Readonly<Ref<Todo[]>>
  /** 当前过滤器类型 */
  currentFilter: Readonly<Ref<FilterType>>
  /** 加载状态 */
  loading: Readonly<Ref<boolean>>
  /** 错误信息 */
  error: Readonly<Ref<string | null>>
  /** 是否已初始化 */
  initialized: Readonly<Ref<boolean>>
  
  // ===== 计算属性 =====
  /** 统计信息 */
  stats: Readonly<Ref<TodoStats>>
  /** 是否有待办事项 */
  hasTodos: Readonly<Ref<boolean>>
  /** 是否所有待办事项都已完成 */
  allCompleted: Readonly<Ref<boolean>>
  /** 是否有已完成的待办事项 */
  hasCompleted: Readonly<Ref<boolean>>
  /** 是否为空状态 */
  isEmpty: Readonly<Ref<boolean>>
  
  // ===== 操作方法 =====
  /** 添加新的待办事项 */
  addTodo: (title: string) => Promise<Todo | null>
  /** 切换待办事项完成状态 */
  toggleTodo: (id: string) => Promise<boolean>
  /** 更新待办事项标题 */
  updateTodo: (id: string, title: string) => Promise<boolean>
  /** 删除待办事项 */
  deleteTodo: (id: string) => Promise<boolean>
  /** 设置过滤器 */
  setFilter: (filter: FilterType) => void
  /** 切换所有待办事项状态 */
  toggleAllTodos: (completed?: boolean) => Promise<void>
  /** 清除所有已完成的待办事项 */
  clearCompleted: () => Promise<number>
  /** 批量添加待办事项 */
  addMultipleTodos: (titles: string[]) => Promise<Todo[]>
  
  // ===== 工具方法 =====
  /** 根据ID查找待办事项 */
  findTodoById: (id: string) => Todo | undefined
  /** 清除错误信息 */
  clearError: () => void
  /** 重新加载数据 */
  reload: () => Promise<void>
  /** 获取状态快照 */
  getSnapshot: () => TodoState
}

/**
 * useTodos 组合式函数配置选项
 */
export interface UseTodosOptions {
  /** 是否自动初始化数据 */
  autoInit?: boolean
  /** 是否启用自动保存 */
  autoSave?: boolean
  /** 错误处理回调 */
  onError?: (error: Error) => void
  /** 数据变化回调 */
  onChange?: (todos: Todo[]) => void
}

/**
 * useTodos 组合式函数
 * 
 * @param options - 配置选项
 * @returns 待办事项管理的API
 */
export function useTodos(options: UseTodosOptions = {}): UseTodosReturn {
  const {
    autoInit = true,
    autoSave = true, // eslint-disable-line @typescript-eslint/no-unused-vars
    onError,
    onChange
  } = options

  // ===== Store 实例 =====
  const store = useTodoStore()

  // ===== 内部状态 =====
  const isProcessing = ref(false)

  // ===== 响应式数据 =====
  const todos = computed(() => store.filteredTodos)
  const currentFilter = computed(() => store.filter)
  const loading = computed(() => store.loading || isProcessing.value)
  const error = computed(() => store.error)
  const initialized = computed(() => store.initialized)

  // ===== 计算属性 =====
  
  /**
   * 统计信息
   */
  const stats = computed((): TodoStats => {
    const total = store.totalCount
    const completed = store.completedCount
    const active = store.activeCount
    const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0

    return {
      total,
      completed,
      active,
      completionRate
    }
  })

  /**
   * 是否有待办事项
   */
  const hasTodos = computed(() => store.hasTodos)

  /**
   * 是否所有待办事项都已完成
   */
  const allCompleted = computed(() => store.allCompleted)

  /**
   * 是否有已完成的待办事项
   */
  const hasCompleted = computed(() => store.completedCount > 0)

  /**
   * 是否为空状态
   */
  const isEmpty = computed(() => {
    return !loading.value && !error.value && todos.value.length === 0
  })

  // ===== 操作方法 =====

  /**
   * 添加新的待办事项
   * @param title - 待办事项标题
   * @returns 新创建的待办事项，失败时返回null
   */
  const addTodo = async (title: string): Promise<Todo | null> => {
    if (isProcessing.value) return null

    try {
      isProcessing.value = true
      const newTodo = store.addTodo(title)
      
      // 触发变化回调
      if (onChange) {
        onChange(store.todos)
      }
      
      return newTodo
    } catch (error) {
      const err = error instanceof Error ? error : new Error('添加待办事项失败')
      handleError(err)
      return null
    } finally {
      isProcessing.value = false
    }
  }

  /**
   * 切换待办事项完成状态
   * @param id - 待办事项ID
   * @returns 是否操作成功
   */
  const toggleTodo = async (id: string): Promise<boolean> => {
    if (isProcessing.value) return false

    try {
      isProcessing.value = true
      const success = store.toggleTodo(id)
      
      if (success && onChange) {
        onChange(store.todos)
      }
      
      return success
    } catch (error) {
      const err = error instanceof Error ? error : new Error('切换待办事项状态失败')
      handleError(err)
      return false
    } finally {
      isProcessing.value = false
    }
  }

  /**
   * 更新待办事项标题
   * @param id - 待办事项ID
   * @param title - 新标题
   * @returns 是否操作成功
   */
  const updateTodo = async (id: string, title: string): Promise<boolean> => {
    if (isProcessing.value) return false

    try {
      isProcessing.value = true
      const success = store.updateTodo(id, title)
      
      if (success && onChange) {
        onChange(store.todos)
      }
      
      return success
    } catch (error) {
      const err = error instanceof Error ? error : new Error('更新待办事项失败')
      handleError(err)
      return false
    } finally {
      isProcessing.value = false
    }
  }

  /**
   * 删除待办事项
   * @param id - 待办事项ID
   * @returns 是否操作成功
   */
  const deleteTodo = async (id: string): Promise<boolean> => {
    if (isProcessing.value) return false

    try {
      isProcessing.value = true
      const success = store.deleteTodo(id)
      
      if (success && onChange) {
        onChange(store.todos)
      }
      
      return success
    } catch (error) {
      const err = error instanceof Error ? error : new Error('删除待办事项失败')
      handleError(err)
      return false
    } finally {
      isProcessing.value = false
    }
  }

  /**
   * 设置过滤器
   * @param filter - 过滤器类型
   */
  const setFilter = (filter: FilterType): void => {
    try {
      store.setFilter(filter)
    } catch (error) {
      const err = error instanceof Error ? error : new Error('设置过滤器失败')
      handleError(err)
    }
  }

  /**
   * 切换所有待办事项状态
   * @param completed - 目标完成状态，不传则自动判断
   */
  const toggleAllTodos = async (completed?: boolean): Promise<void> => {
    if (isProcessing.value) return

    try {
      isProcessing.value = true
      const targetState = completed !== undefined ? completed : !allCompleted.value
      store.toggleAllTodos(targetState)
      
      if (onChange) {
        onChange(store.todos)
      }
    } catch (error) {
      const err = error instanceof Error ? error : new Error('批量切换状态失败')
      handleError(err)
    } finally {
      isProcessing.value = false
    }
  }

  /**
   * 清除所有已完成的待办事项
   * @returns 被删除的待办事项数量
   */
  const clearCompleted = async (): Promise<number> => {
    if (isProcessing.value) return 0

    try {
      isProcessing.value = true
      const count = store.clearCompleted()
      
      if (count > 0 && onChange) {
        onChange(store.todos)
      }
      
      return count
    } catch (error) {
      const err = error instanceof Error ? error : new Error('清除已完成项目失败')
      handleError(err)
      return 0
    } finally {
      isProcessing.value = false
    }
  }

  /**
   * 批量添加待办事项
   * @param titles - 待办事项标题数组
   * @returns 新创建的待办事项数组
   */
  const addMultipleTodos = async (titles: string[]): Promise<Todo[]> => {
    if (isProcessing.value) return []

    try {
      isProcessing.value = true
      const newTodos = store.addMultipleTodos(titles)
      
      if (newTodos.length > 0 && onChange) {
        onChange(store.todos)
      }
      
      return newTodos
    } catch (error) {
      const err = error instanceof Error ? error : new Error('批量添加待办事项失败')
      handleError(err)
      return []
    } finally {
      isProcessing.value = false
    }
  }

  // ===== 工具方法 =====

  /**
   * 根据ID查找待办事项
   * @param id - 待办事项ID
   * @returns 找到的待办事项，不存在时返回undefined
   */
  const findTodoById = (id: string): Todo | undefined => {
    return store.getTodoById(id)
  }

  /**
   * 清除错误信息
   */
  const clearError = (): void => {
    store.clearError()
  }

  /**
   * 重新加载数据
   */
  const reload = async (): Promise<void> => {
    if (isProcessing.value) return

    try {
      isProcessing.value = true
      await store.loadFromStorage()
    } catch (error) {
      const err = error instanceof Error ? error : new Error('重新加载数据失败')
      handleError(err)
    } finally {
      isProcessing.value = false
    }
  }

  /**
   * 获取状态快照
   * @returns 当前状态的快照
   */
  const getSnapshot = () => {
    return store.getStateSnapshot()
  }

  // ===== 内部方法 =====

  /**
   * 错误处理
   * @param error - 错误对象
   */
  const handleError = (error: Error): void => {
    console.error('[useTodos]', error.message, error)
    
    // 设置store错误状态
    store.setError(error.message)
    
    // 调用外部错误处理回调
    if (onError) {
      onError(error)
    }
  }

  // ===== 生命周期 =====

  /**
   * 初始化数据
   */
  const initialize = async (): Promise<void> => {
    if (!autoInit || initialized.value) return

    try {
      await store.loadFromStorage()
    } catch (error) {
      const err = error instanceof Error ? error : new Error('初始化失败')
      handleError(err)
    }
  }

  // ===== 监听器 =====

  /**
   * 监听数据变化，触发onChange回调
   */
  let unwatch: (() => void) | null = null
  
  if (onChange) {
    unwatch = watch(
      () => store.todos,
      (newTodos) => {
        onChange(newTodos)
      },
      { deep: true }
    )
  }

  // ===== 挂载和卸载 =====

  onMounted(() => {
    initialize()
  })

  onUnmounted(() => {
    // 清理监听器
    if (unwatch) {
      unwatch()
    }
  })

  // ===== 返回API =====
  return {
    // 响应式数据
    todos,
    currentFilter,
    loading,
    error,
    initialized,
    
    // 计算属性
    stats,
    hasTodos,
    allCompleted,
    hasCompleted,
    isEmpty,
    
    // 操作方法
    addTodo,
    toggleTodo,
    updateTodo,
    deleteTodo,
    setFilter,
    toggleAllTodos,
    clearCompleted,
    addMultipleTodos,
    
    // 工具方法
    findTodoById,
    clearError,
    reload,
    getSnapshot
  }
}

/**
 * 导出类型定义
 */
// Types are already exported above

/**
 * 默认导出
 */
export default useTodos
