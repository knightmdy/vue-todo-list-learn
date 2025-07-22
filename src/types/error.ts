// 【知识点】TypeScript 类型声明 error.ts
// - 定义错误类型和错误码枚举
// - 类型安全与工程化
/**
 * 错误处理相关的类型定义
 * 
 * 这个文件定义了应用中错误处理相关的类型和接口，
 * 提供统一的错误处理机制。
 */

/**
 * 错误代码枚举
 * 
 * 定义了应用中可能出现的各种错误类型的代码
 */
export enum ErrorCode {
  // 验证错误
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  EMPTY_TITLE = 'EMPTY_TITLE',
  TITLE_TOO_LONG = 'TITLE_TOO_LONG',
  
  // 存储错误
  STORAGE_ERROR = 'STORAGE_ERROR',
  STORAGE_NOT_AVAILABLE = 'STORAGE_NOT_AVAILABLE',
  STORAGE_QUOTA_EXCEEDED = 'STORAGE_QUOTA_EXCEEDED',
  STORAGE_DATA_CORRUPTED = 'STORAGE_DATA_CORRUPTED',
  
  // 操作错误
  TODO_NOT_FOUND = 'TODO_NOT_FOUND',
  DUPLICATE_TODO = 'DUPLICATE_TODO',
  
  // 系统错误
  UNKNOWN_ERROR = 'UNKNOWN_ERROR',
  NETWORK_ERROR = 'NETWORK_ERROR'
}

/**
 * 应用错误类
 * 
 * 扩展了标准Error类，添加了错误代码和上下文信息
 */
export class TodoError extends Error {
  constructor(
    message: string,
    public code: ErrorCode,
    public context?: Record<string, any>
  ) {
    super(message)
    this.name = 'TodoError'
    
    // 确保错误堆栈正确显示
    if ('captureStackTrace' in Error) {
      ;(Error as any).captureStackTrace(this, TodoError)
    }
  }
}

/**
 * 错误处理结果接口
 * 
 * 用于统一的错误处理返回格式
 */
export interface ErrorResult {
  /** 是否成功 */
  success: false
  
  /** 错误信息 */
  error: TodoError
  
  /** 错误发生时间 */
  timestamp: Date
}

/**
 * 成功结果接口
 * 
 * 用于统一的成功处理返回格式
 */
export interface SuccessResult<T = any> {
  /** 是否成功 */
  success: true
  
  /** 返回数据 */
  data: T
  
  /** 操作完成时间 */
  timestamp: Date
}

/**
 * 操作结果联合类型
 * 
 * 统一的操作结果类型，可以是成功或失败
 */
export type Result<T = any> = SuccessResult<T> | ErrorResult

/**
 * 验证错误详情接口
 * 
 * 用于表单验证错误的详细信息
 */
export interface ValidationError {
  /** 字段名 */
  field: string
  
  /** 错误消息 */
  message: string
  
  /** 错误代码 */
  code: ErrorCode
  
  /** 当前值 */
  value?: any
}

/**
 * 错误处理配置接口
 * 
 * 用于配置错误处理行为
 */
export interface ErrorHandlerConfig {
  /** 是否在控制台显示错误 */
  logToConsole: boolean
  
  /** 是否显示用户友好的错误提示 */
  showUserMessage: boolean
  
  /** 是否自动重试 */
  autoRetry: boolean
  
  /** 最大重试次数 */
  maxRetries: number
  
  /** 重试延迟（毫秒） */
  retryDelay: number
}