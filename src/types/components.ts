// 【知识点】TypeScript 类型声明 components.ts
// - 定义组件 props、事件等类型
// - 类型安全与工程化
/**
 * 组件相关的类型定义
 * 
 * 这个文件定义了Vue组件中使用的Props、Emits和其他相关类型，
 * 确保组件间的类型安全通信。
 */

import type { Todo, FilterType, CreateTodoInput, UpdateTodoInput } from './todo'

/**
 * TodoItem组件的Props类型
 */
export interface TodoItemProps {
  /** 待办事项数据 */
  todo: Todo
  
  /** 是否处于编辑模式 */
  editing?: boolean
  
  /** 是否禁用操作 */
  disabled?: boolean
}

/**
 * TodoItem组件的Emits类型
 */
export interface TodoItemEmits {
  /** 切换完成状态事件 */
  toggle: [id: string]
  
  /** 更新待办事项事件 */
  update: [id: string, data: UpdateTodoInput]
  
  /** 删除待办事项事件 */
  delete: [id: string]
  
  /** 开始编辑事件 */
  'edit-start': [id: string]
  
  /** 结束编辑事件 */
  'edit-end': [id: string]
}

/**
 * TodoInput组件的Props类型
 */
export interface TodoInputProps {
  /** 占位符文本 */
  placeholder?: string
  
  /** 是否禁用输入 */
  disabled?: boolean
  
  /** 是否自动聚焦 */
  autofocus?: boolean
  
  /** 最大字符长度 */
  maxLength?: number
}

/**
 * TodoInput组件的Emits类型
 */
export interface TodoInputEmits {
  /** 添加新待办事项事件 */
  add: [data: CreateTodoInput]
  
  /** 输入变化事件 */
  'input-change': [value: string]
  
  /** 输入聚焦事件 */
  focus: []
  
  /** 输入失焦事件 */
  blur: []
}

/**
 * TodoFilter组件的Props类型
 */
export interface TodoFilterProps {
  /** 当前激活的过滤器 */
  modelValue: FilterType
  
  /** 是否显示统计信息 */
  showStats?: boolean
  
  /** 是否禁用过滤器 */
  disabled?: boolean
}

/**
 * TodoFilter组件的Emits类型
 */
export interface TodoFilterEmits {
  /** 过滤器变化事件 */
  'update:modelValue': [value: FilterType]
  
  /** 过滤器点击事件 */
  'filter-click': [filter: FilterType]
}

/**
 * TodoList组件的Props类型
 */
export interface TodoListProps {
  /** 待办事项列表 */
  todos: Todo[]
  
  /** 是否显示加载状态 */
  loading?: boolean
  
  /** 是否显示空状态 */
  showEmpty?: boolean
  
  /** 空状态提示文本 */
  emptyText?: string
}

/**
 * TodoList组件的Emits类型
 */
export interface TodoListEmits {
  /** 切换待办事项状态 */
  'todo-toggle': [id: string]
  
  /** 更新待办事项 */
  'todo-update': [id: string, data: UpdateTodoInput]
  
  /** 删除待办事项 */
  'todo-delete': [id: string]
  
  /** 列表滚动事件 */
  scroll: [event: Event]
}

/**
 * 通用按钮组件的Props类型
 */
export interface ButtonProps {
  /** 按钮类型 */
  type?: 'primary' | 'secondary' | 'danger' | 'success' | 'warning'
  
  /** 按钮尺寸 */
  size?: 'small' | 'medium' | 'large'
  
  /** 是否禁用 */
  disabled?: boolean
  
  /** 是否显示加载状态 */
  loading?: boolean
  
  /** 按钮图标 */
  icon?: string
  
  /** 是否为块级按钮 */
  block?: boolean
}

/**
 * 通用输入框组件的Props类型
 */
export interface InputProps {
  /** 输入值 */
  modelValue: string
  
  /** 输入类型 */
  type?: 'text' | 'password' | 'email' | 'number'
  
  /** 占位符 */
  placeholder?: string
  
  /** 是否禁用 */
  disabled?: boolean
  
  /** 是否只读 */
  readonly?: boolean
  
  /** 最大长度 */
  maxLength?: number
  
  /** 是否显示清除按钮 */
  clearable?: boolean
  
  /** 验证状态 */
  status?: 'success' | 'warning' | 'error'
  
  /** 帮助文本 */
  helpText?: string
}

/**
 * 模态框组件的Props类型
 */
export interface ModalProps {
  /** 是否显示模态框 */
  visible: boolean
  
  /** 模态框标题 */
  title?: string
  
  /** 是否显示关闭按钮 */
  closable?: boolean
  
  /** 是否点击遮罩关闭 */
  maskClosable?: boolean
  
  /** 模态框宽度 */
  width?: string | number
  
  /** 是否居中显示 */
  centered?: boolean
}

/**
 * 确认对话框的配置类型
 */
export interface ConfirmConfig {
  /** 标题 */
  title: string
  
  /** 内容 */
  content: string
  
  /** 确认按钮文本 */
  okText?: string
  
  /** 取消按钮文本 */
  cancelText?: string
  
  /** 确认按钮类型 */
  okType?: 'primary' | 'danger'
  
  /** 确认回调 */
  onOk?: () => void | Promise<void>
  
  /** 取消回调 */
  onCancel?: () => void
}