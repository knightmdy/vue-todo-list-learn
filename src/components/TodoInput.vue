<!--
  TodoInput 组件
  【知识点】
  - 受控组件/表单输入
  - props/emit 组件通信
  - 组合式 API + TypeScript
  - 无障碍（a11y）实践
  - 响应式数据与事件处理
  - 样式模块化
-->

<template>
  <div class="todo-input">
    <!-- 输入框容器 -->
    <div class="input-container" :class="{ 'has-error': hasError, 'is-loading': isLoading }">
      <input
        ref="inputRef"
        v-model="inputValue"
        type="text"
        class="todo-input__field"
        :placeholder="placeholder"
        :disabled="isLoading || disabled"
        :maxlength="maxLength"
        @keydown.enter="handleSubmit"
        @blur="handleBlur"
        @focus="handleFocus"
        @input="handleInput"
      />
      
      <!-- 提交按钮 -->
      <button
        type="button"
        class="todo-input__submit"
        :disabled="!canSubmit"
        @click="handleSubmit"
      >
        <span v-if="!isLoading" class="submit-icon">+</span>
        <span v-else class="loading-spinner"></span>
      </button>
    </div>
    
    <!-- 错误提示 -->
    <div v-if="hasError" class="error-message" role="alert">
      {{ errorMessage }}
    </div>
    
    <!-- 字符计数 -->
    <div v-if="showCharCount" class="char-count" :class="{ 'near-limit': isNearLimit }">
      {{ inputValue.length }} / {{ maxLength }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, nextTick, onMounted } from 'vue'

/**
 * 组件属性定义
 */
interface Props {
  /** 输入框占位符文本 */
  placeholder?: string
  
  /** 最大字符长度 */
  maxLength?: number
  
  /** 是否显示字符计数 */
  showCharCount?: boolean
  
  /** 是否自动聚焦 */
  autoFocus?: boolean
  
  /** 防抖延迟（毫秒） */
  debounceDelay?: number
  
  /** 是否禁用 */
  disabled?: boolean
}

/**
 * 组件事件定义
 */
interface Emits {
  /** 提交新的待办事项 */
  (event: 'submit', value: string): void
  
  /** 输入值变化 */
  (event: 'input', value: string): void
  
  /** 获得焦点 */
  (event: 'focus'): void
  
  /** 失去焦点 */
  (event: 'blur'): void
}

// 定义props和emits
const props = withDefaults(defineProps<Props>(), {
  placeholder: '添加新的待办事项...',
  maxLength: 200,
  showCharCount: false,
  autoFocus: false,
  debounceDelay: 300,
  disabled: false
})

const emit = defineEmits<Emits>()

// ===== 响应式状态 =====

/** 输入框引用 */
const inputRef = ref<HTMLInputElement>()

/** 输入值 */
const inputValue = ref('')

/** 错误信息 */
const errorMessage = ref('')

/** 是否正在加载 */
const isLoading = ref(false)

/** 是否获得焦点 */
const isFocused = ref(false)

/** 防抖定时器 */
let debounceTimer: NodeJS.Timeout | null = null

// ===== 计算属性 =====

/** 是否有错误 */
const hasError = computed(() => !!errorMessage.value)

/** 是否可以提交 */
const canSubmit = computed(() => {
  return !props.disabled && 
         !isLoading.value && 
         inputValue.value.trim().length > 0 && 
         inputValue.value.trim().length <= props.maxLength &&
         !hasError.value
})

/** 是否接近字符限制 */
const isNearLimit = computed(() => {
  return inputValue.value.length > props.maxLength * 0.8
})

// ===== 验证函数 =====

/**
 * 验证输入值
 * @param value - 要验证的值
 * @returns 验证结果
 */
const validateInput = (value: string): { isValid: boolean; error?: string } => {
  const trimmedValue = value.trim()
  
  // 检查是否为空
  if (trimmedValue.length === 0) {
    return { isValid: false, error: '请输入待办事项内容' }
  }
  
  // 检查长度限制
  if (trimmedValue.length > props.maxLength) {
    return { isValid: false, error: `内容不能超过 ${props.maxLength} 个字符` }
  }
  
  // 检查特殊字符（可选）
  const invalidChars = /[<>]/g
  if (invalidChars.test(trimmedValue)) {
    return { isValid: false, error: '内容包含无效字符' }
  }
  
  return { isValid: true }
}

/**
 * 设置错误信息
 * @param error - 错误信息
 */
const setError = (error: string) => {
  errorMessage.value = error
}

/**
 * 清除错误信息
 */
const clearError = () => {
  errorMessage.value = ''
}

// ===== 事件处理函数 =====

/**
 * 处理输入事件
 * @param event - 输入事件
 */
const handleInput = (event: Event) => {
  const target = event.target as HTMLInputElement
  const value = target.value
  
  // 清除之前的错误
  clearError()
  
  // 防抖处理
  if (debounceTimer) {
    clearTimeout(debounceTimer)
  }
  
  debounceTimer = setTimeout(() => {
    // 实时验证
    const validation = validateInput(value)
    if (!validation.isValid && value.trim().length > 0) {
      setError(validation.error || '输入无效')
    }
    
    // 触发输入事件
    emit('input', value)
  }, props.debounceDelay)
}

/**
 * 处理提交事件
 */
const handleSubmit = async () => {
  if (!canSubmit.value) {
    return
  }
  
  const trimmedValue = inputValue.value.trim()
  
  // 最终验证
  const validation = validateInput(trimmedValue)
  if (!validation.isValid) {
    setError(validation.error || '输入无效')
    return
  }
  
  try {
    isLoading.value = true
    clearError()
    
    // 触发提交事件
    emit('submit', trimmedValue)
    
    // 清空输入框
    inputValue.value = ''
    
    // 重新聚焦到输入框
    await nextTick()
    inputRef.value?.focus()
    
  } catch (error) {
    setError('提交失败，请重试')
    console.error('TodoInput submit error:', error)
  } finally {
    isLoading.value = false
  }
}

/**
 * 处理获得焦点事件
 */
const handleFocus = () => {
  isFocused.value = true
  clearError()
  emit('focus')
}

/**
 * 处理失去焦点事件
 */
const handleBlur = () => {
  isFocused.value = false
  
  // 失去焦点时进行验证
  if (inputValue.value.trim().length > 0) {
    const validation = validateInput(inputValue.value)
    if (!validation.isValid) {
      setError(validation.error || '输入无效')
    }
  }
  
  emit('blur')
}

// ===== 公共方法 =====

/**
 * 聚焦到输入框
 */
const focus = () => {
  inputRef.value?.focus()
}

/**
 * 清空输入框
 */
const clear = () => {
  inputValue.value = ''
  clearError()
}

/**
 * 设置输入值
 * @param value - 要设置的值
 */
const setValue = (value: string) => {
  inputValue.value = value
}

// 暴露公共方法
defineExpose({
  focus,
  clear,
  setValue
})

// ===== 生命周期 =====

onMounted(() => {
  if (props.autoFocus) {
    nextTick(() => {
      focus()
    })
  }
})
</script>

<style scoped>
.todo-input {
  width: 100%;
  margin-bottom: 1rem;
}

.input-container {
  position: relative;
  display: flex;
  align-items: center;
  border: 2px solid #e1e5e9;
  border-radius: 8px;
  background-color: #ffffff;
  transition: all 0.2s ease;
}

.input-container:focus-within {
  border-color: #007bff;
  box-shadow: 0 0 0 3px rgba(0, 123, 255, 0.1);
}

.input-container.has-error {
  border-color: #dc3545;
}

.input-container.has-error:focus-within {
  border-color: #dc3545;
  box-shadow: 0 0 0 3px rgba(220, 53, 69, 0.1);
}

.input-container.is-loading {
  opacity: 0.7;
}

.todo-input__field {
  flex: 1;
  padding: 12px 16px;
  border: none;
  outline: none;
  font-size: 16px;
  line-height: 1.5;
  background: transparent;
  color: #333;
}

.todo-input__field::placeholder {
  color: #6c757d;
}

.todo-input__field:disabled {
  cursor: not-allowed;
  color: #6c757d;
}

.todo-input__submit {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 44px;
  height: 44px;
  margin: 4px;
  border: none;
  border-radius: 6px;
  background-color: #007bff;
  color: white;
  font-size: 20px;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.2s ease;
}

.todo-input__submit:hover:not(:disabled) {
  background-color: #0056b3;
  transform: translateY(-1px);
}

.todo-input__submit:active:not(:disabled) {
  transform: translateY(0);
}

.todo-input__submit:disabled {
  background-color: #6c757d;
  cursor: not-allowed;
  transform: none;
}

.submit-icon {
  line-height: 1;
}

.loading-spinner {
  width: 16px;
  height: 16px;
  border: 2px solid transparent;
  border-top: 2px solid currentColor;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.error-message {
  margin-top: 8px;
  padding: 8px 12px;
  background-color: #f8d7da;
  border: 1px solid #f5c6cb;
  border-radius: 4px;
  color: #721c24;
  font-size: 14px;
}

.char-count {
  margin-top: 4px;
  text-align: right;
  font-size: 12px;
  color: #6c757d;
}

.char-count.near-limit {
  color: #fd7e14;
  font-weight: 500;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .todo-input__field {
    font-size: 16px; /* 防止iOS缩放 */
  }
  
  .input-container {
    border-radius: 6px;
  }
  
  .todo-input__submit {
    width: 40px;
    height: 40px;
    font-size: 18px;
  }
}

/* 无障碍访问支持 */
@media (prefers-reduced-motion: reduce) {
  .input-container,
  .todo-input__submit,
  .loading-spinner {
    transition: none;
    animation: none;
  }
}

/* 高对比度模式支持 */
@media (prefers-contrast: high) {
  .input-container {
    border-width: 3px;
  }
  
  .todo-input__submit {
    border: 2px solid currentColor;
  }
}
</style>