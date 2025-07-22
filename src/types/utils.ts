// 【知识点】TypeScript 类型声明 utils.ts
// - 定义工具函数相关类型
// - 类型安全与工程化
/**
 * 工具函数和API相关的类型定义
 * 
 * 这个文件定义了工具函数、API调用和其他通用功能的类型，
 * 提供类型安全的工具函数接口。
 */

// 移除未使用的导入

/**
 * 本地存储操作的配置类型
 */
export interface StorageConfig {
  /** 存储键名 */
  key: string
  
  /** 默认值 */
  defaultValue?: any
  
  /** 是否启用压缩 */
  compress?: boolean
  
  /** 是否启用加密 */
  encrypt?: boolean
  
  /** 过期时间（毫秒） */
  expireTime?: number
}

/**
 * 本地存储操作结果类型
 */
export interface StorageResult<T = any> {
  /** 是否成功 */
  success: boolean
  
  /** 返回数据 */
  data?: T
  
  /** 错误信息 */
  error?: string
  
  /** 存储键名 */
  key: string
  
  /** 操作类型 */
  operation: 'get' | 'set' | 'remove' | 'clear'
  
  /** 操作时间戳 */
  timestamp: Date
}

/**
 * 防抖函数的配置类型
 */
export interface DebounceConfig {
  /** 延迟时间（毫秒） */
  delay: number
  
  /** 是否立即执行 */
  immediate?: boolean
  
  /** 最大等待时间（毫秒） */
  maxWait?: number
}

/**
 * 节流函数的配置类型
 */
export interface ThrottleConfig {
  /** 间隔时间（毫秒） */
  interval: number
  
  /** 是否在开始时执行 */
  leading?: boolean
  
  /** 是否在结束时执行 */
  trailing?: boolean
}

/**
 * 日期格式化选项类型
 */
export interface DateFormatOptions {
  /** 日期格式 */
  format?: string
  
  /** 语言环境 */
  locale?: string
  
  /** 时区 */
  timeZone?: string
  
  /** 是否显示相对时间 */
  relative?: boolean
}

/**
 * 验证规则类型
 */
export interface ValidationRule {
  /** 规则名称 */
  name: string
  
  /** 验证函数 */
  validator: (value: any) => boolean | Promise<boolean>
  
  /** 错误消息 */
  message: string
  
  /** 是否必需 */
  required?: boolean
}

/**
 * 验证结果类型
 */
export interface ValidationResult {
  /** 是否通过验证 */
  valid: boolean
  
  /** 错误消息列表 */
  errors: string[]
  
  /** 验证的字段名 */
  field?: string
}

/**
 * UUID生成选项类型
 */
export interface UUIDOptions {
  /** UUID版本 */
  version?: 1 | 4
  
  /** 是否包含连字符 */
  hyphens?: boolean
  
  /** 是否转为大写 */
  uppercase?: boolean
}

/**
 * 深拷贝选项类型
 */
export interface DeepCloneOptions {
  /** 是否克隆函数 */
  cloneFunctions?: boolean
  
  /** 是否克隆正则表达式 */
  cloneRegExp?: boolean
  
  /** 是否克隆日期对象 */
  cloneDate?: boolean
  
  /** 最大深度 */
  maxDepth?: number
}

/**
 * 排序配置类型
 */
export interface SortConfig<T = any> {
  /** 排序字段 */
  field: keyof T
  
  /** 排序方向 */
  direction: 'asc' | 'desc'
  
  /** 自定义比较函数 */
  compareFn?: (a: T, b: T) => number
}

/**
 * 分页配置类型
 */
export interface PaginationConfig {
  /** 当前页码 */
  page: number
  
  /** 每页大小 */
  pageSize: number
  
  /** 总数量 */
  total: number
}

/**
 * 分页结果类型
 */
export interface PaginatedResult<T = any> {
  /** 数据列表 */
  data: T[]
  
  /** 分页信息 */
  pagination: PaginationConfig
  
  /** 是否有下一页 */
  hasNext: boolean
  
  /** 是否有上一页 */
  hasPrev: boolean
}

/**
 * 搜索配置类型
 */
export interface SearchConfig {
  /** 搜索关键词 */
  keyword: string
  
  /** 搜索字段 */
  fields: string[]
  
  /** 是否区分大小写 */
  caseSensitive?: boolean
  
  /** 是否使用正则表达式 */
  useRegex?: boolean
  
  /** 高亮配置 */
  highlight?: {
    enabled: boolean
    className?: string
  }
}

/**
 * 导出配置类型
 */
export interface ExportConfig {
  /** 导出格式 */
  format: 'json' | 'csv' | 'xlsx'
  
  /** 文件名 */
  filename?: string
  
  /** 是否包含标题行 */
  includeHeaders?: boolean
  
  /** 字段映射 */
  fieldMapping?: Record<string, string>
  
  /** 过滤条件 */
  filter?: (item: any) => boolean
}

/**
 * 导入配置类型
 */
export interface ImportConfig {
  /** 导入格式 */
  format: 'json' | 'csv' | 'xlsx'
  
  /** 是否跳过标题行 */
  skipHeaders?: boolean
  
  /** 字段映射 */
  fieldMapping?: Record<string, string>
  
  /** 验证规则 */
  validationRules?: ValidationRule[]
  
  /** 错误处理策略 */
  errorStrategy?: 'skip' | 'stop' | 'collect'
}