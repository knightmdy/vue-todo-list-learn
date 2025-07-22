/**
 * 类型定义测试文件
 * 
 * 这个文件测试类型定义的正确性和完整性，
 * 确保所有类型都能正确导入和使用。
 */

import type {
  Todo,
  FilterType,
  TodoState,
  CreateTodoInput,
  UpdateTodoInput
} from '@/types/todo'

import {
  ErrorCode,
  TodoError,
  type Result
} from '@/types/error'

import type {
  TodoItemProps,
  TodoInputProps,
  TodoFilterProps
} from '@/types/components'

import {
  FILTER_OPTIONS,
  DEFAULT_TODO_STATE,
  VALIDATION_RULES,
  STORAGE_KEYS
} from '@/types'

describe('类型定义测试', () => {
  test('Todo接口类型检查', () => {
    const todo: Todo = {
      id: 'test-id',
      title: '测试待办事项',
      completed: false,
      createdAt: new Date(),
      updatedAt: new Date()
    }
    
    expect(typeof todo.id).toBe('string')
    expect(typeof todo.title).toBe('string')
    expect(typeof todo.completed).toBe('boolean')
    expect(todo.createdAt).toBeInstanceOf(Date)
    expect(todo.updatedAt).toBeInstanceOf(Date)
  })
  
  test('FilterType类型检查', () => {
    const filters: FilterType[] = ['all', 'active', 'completed']
    
    filters.forEach(filter => {
      expect(['all', 'active', 'completed']).toContain(filter)
    })
  })
  
  test('TodoState接口类型检查', () => {
    const state: TodoState = {
      todos: [],
      filter: 'all',
      loading: false,
      error: null
    }
    
    expect(Array.isArray(state.todos)).toBe(true)
    expect(['all', 'active', 'completed']).toContain(state.filter)
    expect(typeof state.loading).toBe('boolean')
    expect(state.error === null || typeof state.error === 'string').toBe(true)
  })
  
  test('CreateTodoInput接口类型检查', () => {
    const input: CreateTodoInput = {
      title: '新的待办事项'
    }
    
    expect(typeof input.title).toBe('string')
  })
  
  test('UpdateTodoInput接口类型检查', () => {
    const input: UpdateTodoInput = {
      title: '更新的标题',
      completed: true
    }
    
    expect(typeof input.title).toBe('string')
    expect(typeof input.completed).toBe('boolean')
  })
  
  test('ErrorCode枚举检查', () => {
    expect(ErrorCode.VALIDATION_ERROR).toBe('VALIDATION_ERROR')
    expect(ErrorCode.EMPTY_TITLE).toBe('EMPTY_TITLE')
    expect(ErrorCode.STORAGE_ERROR).toBe('STORAGE_ERROR')
  })
  
  test('TodoError类检查', () => {
    const error = new TodoError(
      '测试错误',
      ErrorCode.VALIDATION_ERROR,
      { field: 'title' }
    )
    
    expect(error).toBeInstanceOf(Error)
    expect(error).toBeInstanceOf(TodoError)
    expect(error.message).toBe('测试错误')
    expect(error.code).toBe(ErrorCode.VALIDATION_ERROR)
    expect(error.context).toEqual({ field: 'title' })
  })
  
  test('常量定义检查', () => {
    expect(FILTER_OPTIONS).toHaveLength(3)
    expect(FILTER_OPTIONS[0].value).toBe('all')
    expect(FILTER_OPTIONS[1].value).toBe('active')
    expect(FILTER_OPTIONS[2].value).toBe('completed')
    
    expect(DEFAULT_TODO_STATE.todos).toEqual([])
    expect(DEFAULT_TODO_STATE.filter).toBe('all')
    expect(DEFAULT_TODO_STATE.loading).toBe(false)
    expect(DEFAULT_TODO_STATE.error).toBe(null)
    
    expect(VALIDATION_RULES.MAX_TITLE_LENGTH).toBe(200)
    expect(VALIDATION_RULES.MIN_TITLE_LENGTH).toBe(1)
    expect(VALIDATION_RULES.MAX_TODOS_COUNT).toBe(1000)
    
    expect(STORAGE_KEYS.TODOS).toBe('vue-todo-list:todos')
    expect(STORAGE_KEYS.FILTER).toBe('vue-todo-list:filter')
    expect(STORAGE_KEYS.SETTINGS).toBe('vue-todo-list:settings')
  })
  
  test('组件Props类型检查', () => {
    const todo: Todo = {
      id: 'test-id',
      title: '测试',
      completed: false,
      createdAt: new Date(),
      updatedAt: new Date()
    }
    
    const todoItemProps: TodoItemProps = {
      todo,
      editing: false,
      disabled: false
    }
    
    expect(todoItemProps.todo).toBe(todo)
    expect(typeof todoItemProps.editing).toBe('boolean')
    expect(typeof todoItemProps.disabled).toBe('boolean')
    
    const todoInputProps: TodoInputProps = {
      placeholder: '请输入待办事项',
      disabled: false,
      autofocus: true,
      maxLength: 200
    }
    
    expect(typeof todoInputProps.placeholder).toBe('string')
    expect(typeof todoInputProps.disabled).toBe('boolean')
    expect(typeof todoInputProps.autofocus).toBe('boolean')
    expect(typeof todoInputProps.maxLength).toBe('number')
    
    const todoFilterProps: TodoFilterProps = {
      modelValue: 'all',
      showStats: true,
      disabled: false
    }
    
    expect(['all', 'active', 'completed']).toContain(todoFilterProps.modelValue)
    expect(typeof todoFilterProps.showStats).toBe('boolean')
    expect(typeof todoFilterProps.disabled).toBe('boolean')
  })
  
  test('Result类型检查', () => {
    const successResult: Result<string> = {
      success: true,
      data: '成功数据',
      timestamp: new Date()
    }
    
    const errorResult: Result = {
      success: false,
      error: new TodoError('测试错误', ErrorCode.UNKNOWN_ERROR),
      timestamp: new Date()
    }
    
    if (successResult.success) {
      expect(typeof successResult.data).toBe('string')
      expect(successResult.timestamp).toBeInstanceOf(Date)
    }
    
    if (!errorResult.success) {
      expect(errorResult.error).toBeInstanceOf(TodoError)
      expect(errorResult.timestamp).toBeInstanceOf(Date)
    }
  })
})