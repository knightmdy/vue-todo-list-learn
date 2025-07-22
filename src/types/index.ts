// 【知识点】TypeScript 类型声明模块化导出
// - 统一导出所有类型声明，便于类型复用和类型推断
// - 工程化最佳实践：集中管理类型声明

export * from './todo'
export * from './error'
export * from './components'
export * from './utils'

import type { FilterOption, TodoState } from './todo'

/**
 * 常用的过滤器选项配置
 */
export const FILTER_OPTIONS: FilterOption[] = [
  {
    value: 'all',
    label: '全部',
    description: '显示所有待办事项'
  },
  {
    value: 'active',
    label: '未完成',
    description: '只显示未完成的待办事项'
  },
  {
    value: 'completed',
    label: '已完成',
    description: '只显示已完成的待办事项'
  }
]

/**
 * 默认的Todo状态
 */
export const DEFAULT_TODO_STATE: TodoState = {
  todos: [],
  filter: 'all',
  loading: false,
  error: null
}

/**
 * 验证规则常量
 */
export const VALIDATION_RULES = {
  /** 标题最大长度 */
  MAX_TITLE_LENGTH: 200,
  
  /** 标题最小长度 */
  MIN_TITLE_LENGTH: 1,
  
  /** 最大待办事项数量 */
  MAX_TODOS_COUNT: 1000
} as const

/**
 * 存储键名常量
 */
export const STORAGE_KEYS = {
  /** 待办事项列表 */
  TODOS: 'vue-todo-list:todos',
  
  /** 过滤器状态 */
  FILTER: 'vue-todo-list:filter',
  
  /** 用户设置 */
  SETTINGS: 'vue-todo-list:settings'
} as const

/**
 * 事件名称常量
 */
export const EVENT_NAMES = {
  /** 待办事项添加 */
  TODO_ADDED: 'todo:added',
  
  /** 待办事项更新 */
  TODO_UPDATED: 'todo:updated',
  
  /** 待办事项删除 */
  TODO_DELETED: 'todo:deleted',
  
  /** 过滤器变化 */
  FILTER_CHANGED: 'filter:changed',
  
  /** 数据加载 */
  DATA_LOADED: 'data:loaded',
  
  /** 错误发生 */
  ERROR_OCCURRED: 'error:occurred'
} as const