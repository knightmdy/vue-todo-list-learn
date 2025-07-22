// 【知识点】TypeScript 类型声明 todo.ts
// - 定义待办事项相关的数据结构和类型
// - 接口、类型别名、枚举等
// - 类型安全与工程化
/**
 * Todo应用的核心类型定义
 * 
 * 这个文件定义了Todo应用中使用的所有TypeScript类型和接口，
 * 确保整个应用的类型安全和代码提示。
 */

/**
 * 待办事项接口
 * 
 * 定义了单个待办事项的数据结构，包含：
 * - 唯一标识符
 * - 标题内容
 * - 完成状态
 * - 时间戳信息
 */
export interface Todo {
  /** 唯一标识符，使用UUID格式 */
  id: string
  
  /** 待办事项的标题内容 */
  title: string
  
  /** 完成状态，true表示已完成，false表示未完成 */
  completed: boolean
  
  /** 创建时间戳 */
  createdAt: Date
  
  /** 最后更新时间戳 */
  updatedAt: Date
}

/**
 * 过滤器类型
 * 
 * 定义了待办事项的过滤选项：
 * - 'all': 显示所有待办事项
 * - 'active': 只显示未完成的待办事项
 * - 'completed': 只显示已完成的待办事项
 */
export type FilterType = 'all' | 'active' | 'completed'

/**
 * Todo应用的状态接口
 * 
 * 定义了应用的全局状态结构，用于Pinia状态管理
 */
export interface TodoState {
  /** 待办事项列表 */
  todos: Todo[]
  
  /** 当前激活的过滤器 */
  filter: FilterType
  
  /** 加载状态，用于显示加载指示器 */
  loading: boolean
  
  /** 错误信息，用于显示错误提示 */
  error: string | null
}

/**
 * 创建新待办事项的输入数据
 * 
 * 用于创建新待办事项时的数据传递，
 * 不包含id和时间戳，这些会在创建时自动生成
 */
export interface CreateTodoInput {
  /** 待办事项标题 */
  title: string
}

/**
 * 更新待办事项的输入数据
 * 
 * 用于更新现有待办事项时的数据传递，
 * 所有字段都是可选的，只更新提供的字段
 */
export interface UpdateTodoInput {
  /** 可选的新标题 */
  title?: string
  
  /** 可选的新完成状态 */
  completed?: boolean
}

/**
 * 过滤器选项配置
 * 
 * 定义了过滤器的显示配置，用于UI组件
 */
export interface FilterOption {
  /** 过滤器的值 */
  value: FilterType
  
  /** 过滤器的显示标签 */
  label: string
  
  /** 过滤器的描述 */
  description: string
}

/**
 * 统计信息接口
 * 
 * 用于显示待办事项的统计数据
 */
export interface TodoStats {
  /** 总数量 */
  total: number
  
  /** 已完成数量 */
  completed: number
  
  /** 未完成数量 */
  active: number
  
  /** 完成百分比 */
  completionRate: number
}