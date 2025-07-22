<!--
  TodoList 组件
  【知识点】
  - 列表渲染与性能优化
  - props/emit 组件通信
  - 组合式 API + TypeScript
  - 响应式数据
  - 无障碍（a11y）实践
  - 样式模块化
-->

<template>
  <div class="todo-list">
    <!-- 加载状态 -->
    <div v-if="loading" class="todo-list__loading">
      <div class="todo-list__loading-spinner"></div>
      <p class="todo-list__loading-text">正在加载待办事项...</p>
    </div>

    <!-- 错误状态 -->
    <div v-else-if="error" class="todo-list__error">
      <div class="todo-list__error-icon">⚠️</div>
      <h3 class="todo-list__error-title">加载失败</h3>
      <p class="todo-list__error-message">{{ error }}</p>
      <button 
        type="button" 
        class="todo-list__error-retry"
        @click="handleRetry"
      >
        重试
      </button>
    </div>

    <!-- 空状态 -->
    <div v-else-if="isEmpty" class="todo-list__empty">
      <div class="todo-list__empty-icon">📝</div>
      <h3 class="todo-list__empty-title">{{ emptyTitle }}</h3>
      <p class="todo-list__empty-message">{{ emptyMessage }}</p>
      <div class="todo-list__empty-suggestions" v-if="showSuggestions">
        <p class="todo-list__empty-suggestions-title">你可以：</p>
        <ul class="todo-list__empty-suggestions-list">
          <li>添加一个新的待办事项</li>
          <li>检查其他过滤器选项</li>
          <li>完成一些已有的任务</li>
        </ul>
      </div>
    </div>

    <!-- 待办事项列表 -->
    <div v-else class="todo-list__container">
      <!-- 列表头部信息 -->
      <div class="todo-list__header" v-if="showHeader">
        <div class="todo-list__summary">
          <span class="todo-list__summary-text">
            显示 {{ todos.length }} 项待办事项
            <span v-if="totalCount !== todos.length" class="todo-list__summary-filtered">
              （共 {{ totalCount }} 项）
            </span>
          </span>
        </div>
        
        <!-- 批量操作 -->
        <div class="todo-list__actions" v-if="showBatchActions && todos.length > 0">
          <button
            type="button"
            class="todo-list__action-btn"
            :class="{ 'todo-list__action-btn--active': allCompleted }"
            @click="handleToggleAll"
            :title="allCompleted ? '标记所有为未完成' : '标记所有为已完成'"
          >
            {{ allCompleted ? '取消全选' : '全选' }}
          </button>
          
          <button
            v-if="hasCompleted"
            type="button"
            class="todo-list__action-btn todo-list__action-btn--danger"
            @click="handleClearCompleted"
            title="删除所有已完成的待办事项"
          >
            清除已完成
          </button>
        </div>
      </div>

      <!-- 待办事项列表 -->
      <div 
        class="todo-list__items"
        role="list"
        :aria-label="`待办事项列表，共 ${todos.length} 项`"
      >
        <TransitionGroup
          name="todo-item"
          tag="div"
          class="todo-list__items-container"
        >
          <div
            v-for="todo in todos"
            :key="todo.id"
            class="todo-list__item-wrapper"
            role="listitem"
          >
            <TodoItem
              :todo="todo"
              @toggle="handleToggleTodo"
              @update="handleUpdateTodo"
              @delete="handleDeleteTodo"
            />
          </div>
        </TransitionGroup>
      </div>

      <!-- 列表底部信息 -->
      <div class="todo-list__footer" v-if="showFooter && todos.length > 0">
        <div class="todo-list__stats">
          <span class="todo-list__stat">
            <strong>{{ activeCount }}</strong> 项未完成
          </span>
          <span class="todo-list__stat">
            <strong>{{ completedCount }}</strong> 项已完成
          </span>
          <span class="todo-list__stat" v-if="totalCount > 0">
            完成率: <strong>{{ completionRate }}%</strong>
          </span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import TodoItem from './TodoItem.vue'
import type { Todo, FilterType } from '@/types/todo'

// ===== Props =====
interface Props {
  /** 待办事项列表 */
  todos: Todo[]
  /** 当前过滤器类型 */
  currentFilter?: FilterType
  /** 总待办事项数量（用于显示过滤信息） */
  totalCount?: number
  /** 已完成数量 */
  completedCount?: number
  /** 未完成数量 */
  activeCount?: number
  /** 加载状态 */
  loading?: boolean
  /** 错误信息 */
  error?: string | null
  /** 是否显示列表头部 */
  showHeader?: boolean
  /** 是否显示列表底部 */
  showFooter?: boolean
  /** 是否显示批量操作 */
  showBatchActions?: boolean
  /** 是否显示空状态建议 */
  showSuggestions?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  currentFilter: 'all',
  totalCount: 0,
  completedCount: 0,
  activeCount: 0,
  loading: false,
  error: null,
  showHeader: true,
  showFooter: true,
  showBatchActions: true,
  showSuggestions: true
})

// ===== Emits =====
interface Emits {
  /** 切换待办事项完成状态 */
  'toggle-todo': [id: string]
  /** 更新待办事项 */
  'update-todo': [id: string, title: string]
  /** 删除待办事项 */
  'delete-todo': [id: string]
  /** 切换所有待办事项状态 */
  'toggle-all': [completed: boolean]
  /** 清除所有已完成的待办事项 */
  'clear-completed': []
  /** 重试加载 */
  'retry': []
}

const emit = defineEmits<Emits>()

// ===== 计算属性 =====

/**
 * 是否为空状态
 */
const isEmpty = computed(() => {
  return !props.loading && !props.error && props.todos.length === 0
})

/**
 * 是否所有待办事项都已完成
 */
const allCompleted = computed(() => {
  return props.todos.length > 0 && props.todos.every(todo => todo.completed)
})

/**
 * 是否有已完成的待办事项
 */
const hasCompleted = computed(() => {
  return props.todos.some(todo => todo.completed)
})

/**
 * 完成率百分比
 */
const completionRate = computed(() => {
  if (props.totalCount === 0) return 0
  return Math.round((props.completedCount / props.totalCount) * 100)
})

/**
 * 空状态标题
 */
const emptyTitle = computed(() => {
  switch (props.currentFilter) {
    case 'active':
      return '没有未完成的待办事项'
    case 'completed':
      return '没有已完成的待办事项'
    case 'all':
    default:
      return '还没有待办事项'
  }
})

/**
 * 空状态消息
 */
const emptyMessage = computed(() => {
  switch (props.currentFilter) {
    case 'active':
      return '太棒了！所有待办事项都已完成。'
    case 'completed':
      return '还没有完成任何待办事项，加油！'
    case 'all':
    default:
      return '开始添加一些待办事项来管理你的任务吧。'
  }
})

// ===== 方法 =====

/**
 * 处理切换待办事项状态
 */
const handleToggleTodo = (id: string) => {
  emit('toggle-todo', id)
}

/**
 * 处理更新待办事项
 */
const handleUpdateTodo = (id: string, title: string) => {
  emit('update-todo', id, title)
}

/**
 * 处理删除待办事项
 */
const handleDeleteTodo = (id: string) => {
  emit('delete-todo', id)
}

/**
 * 处理切换所有待办事项状态
 */
const handleToggleAll = () => {
  emit('toggle-all', !allCompleted.value)
}

/**
 * 处理清除所有已完成的待办事项
 */
const handleClearCompleted = () => {
  if (confirm('确定要删除所有已完成的待办事项吗？')) {
    emit('clear-completed')
  }
}

/**
 * 处理重试加载
 */
const handleRetry = () => {
  emit('retry')
}
</script>

<style scoped>
/* ===== 基础样式 ===== */
.todo-list {
  width: 100%;
  max-width: 100%;
}

/* ===== 加载状态样式 ===== */
.todo-list__loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  text-align: center;
}

.todo-list__loading-spinner {
  width: 40px;
  height: 40px;
  border: 4px solid #f3f4f6;
  border-top: 4px solid #3b82f6;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 16px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.todo-list__loading-text {
  color: #6b7280;
  font-size: 16px;
  margin: 0;
}

/* ===== 错误状态样式 ===== */
.todo-list__error {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  text-align: center;
}

.todo-list__error-icon {
  font-size: 48px;
  margin-bottom: 16px;
}

.todo-list__error-title {
  color: #dc2626;
  font-size: 20px;
  font-weight: 600;
  margin: 0 0 8px 0;
}

.todo-list__error-message {
  color: #6b7280;
  font-size: 16px;
  margin: 0 0 24px 0;
  max-width: 400px;
}

.todo-list__error-retry {
  background: #3b82f6;
  color: white;
  border: none;
  border-radius: 6px;
  padding: 12px 24px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s ease;
}

.todo-list__error-retry:hover {
  background: #2563eb;
}

/* ===== 空状态样式 ===== */
.todo-list__empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  text-align: center;
}

.todo-list__empty-icon {
  font-size: 64px;
  margin-bottom: 24px;
  opacity: 0.6;
}

.todo-list__empty-title {
  color: #1f2937;
  font-size: 24px;
  font-weight: 600;
  margin: 0 0 12px 0;
}

.todo-list__empty-message {
  color: #6b7280;
  font-size: 16px;
  margin: 0 0 32px 0;
  max-width: 400px;
  line-height: 1.5;
}

.todo-list__empty-suggestions {
  background: #f9fafb;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  padding: 20px;
  max-width: 300px;
}

.todo-list__empty-suggestions-title {
  color: #374151;
  font-size: 14px;
  font-weight: 600;
  margin: 0 0 12px 0;
}

.todo-list__empty-suggestions-list {
  color: #6b7280;
  font-size: 14px;
  margin: 0;
  padding-left: 20px;
  text-align: left;
}

.todo-list__empty-suggestions-list li {
  margin-bottom: 8px;
  line-height: 1.4;
}

/* ===== 列表容器样式 ===== */
.todo-list__container {
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

/* ===== 列表头部样式 ===== */
.todo-list__header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  background: #f9fafb;
  border-bottom: 1px solid #e5e7eb;
  flex-wrap: wrap;
  gap: 12px;
}

.todo-list__summary-text {
  color: #6b7280;
  font-size: 14px;
  font-weight: 500;
}

.todo-list__summary-filtered {
  color: #9ca3af;
  font-size: 13px;
}

.todo-list__actions {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.todo-list__action-btn {
  background: #f3f4f6;
  color: #374151;
  border: 1px solid #d1d5db;
  border-radius: 4px;
  padding: 6px 12px;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.todo-list__action-btn:hover {
  background: #e5e7eb;
  border-color: #9ca3af;
}

.todo-list__action-btn--active {
  background: #3b82f6;
  color: white;
  border-color: #3b82f6;
}

.todo-list__action-btn--active:hover {
  background: #2563eb;
  border-color: #2563eb;
}

.todo-list__action-btn--danger {
  background: #fef2f2;
  color: #dc2626;
  border-color: #fecaca;
}

.todo-list__action-btn--danger:hover {
  background: #fee2e2;
  border-color: #fca5a5;
}

/* ===== 列表项样式 ===== */
.todo-list__items {
  position: relative;
}

.todo-list__items-container {
  display: flex;
  flex-direction: column;
}

.todo-list__item-wrapper {
  border-bottom: 1px solid #f3f4f6;
}

.todo-list__item-wrapper:last-child {
  border-bottom: none;
}

/* ===== 列表底部样式 ===== */
.todo-list__footer {
  padding: 16px 20px;
  background: #f9fafb;
  border-top: 1px solid #e5e7eb;
}

.todo-list__stats {
  display: flex;
  justify-content: center;
  gap: 24px;
  flex-wrap: wrap;
}

.todo-list__stat {
  color: #6b7280;
  font-size: 14px;
}

.todo-list__stat strong {
  color: #1f2937;
  font-weight: 600;
}

/* ===== 过渡动画 ===== */
.todo-item-enter-active,
.todo-item-leave-active {
  transition: all 0.3s ease;
}

.todo-item-enter-from {
  opacity: 0;
  transform: translateY(-20px);
}

.todo-item-leave-to {
  opacity: 0;
  transform: translateX(100%);
}

.todo-item-move {
  transition: transform 0.3s ease;
}

/* ===== 响应式设计 ===== */
@media (max-width: 768px) {
  .todo-list__header {
    flex-direction: column;
    align-items: stretch;
    gap: 16px;
  }
  
  .todo-list__actions {
    justify-content: center;
  }
  
  .todo-list__empty {
    padding: 40px 16px;
  }
  
  .todo-list__empty-icon {
    font-size: 48px;
    margin-bottom: 16px;
  }
  
  .todo-list__empty-title {
    font-size: 20px;
  }
  
  .todo-list__empty-message {
    font-size: 14px;
  }
  
  .todo-list__stats {
    gap: 16px;
    justify-content: space-around;
  }
  
  .todo-list__stat {
    font-size: 13px;
  }
}

@media (max-width: 480px) {
  .todo-list__header {
    padding: 12px 16px;
  }
  
  .todo-list__footer {
    padding: 12px 16px;
  }
  
  .todo-list__stats {
    flex-direction: column;
    gap: 8px;
    text-align: center;
  }
  
  .todo-list__action-btn {
    padding: 8px 12px;
    font-size: 12px;
  }
}

/* ===== 无障碍访问增强 ===== */
@media (prefers-reduced-motion: reduce) {
  .todo-list__loading-spinner {
    animation: none;
  }
  
  .todo-item-enter-active,
  .todo-item-leave-active,
  .todo-item-move {
    transition: none;
  }
  
  .todo-list__action-btn {
    transition: none;
  }
}

/* 高对比度模式支持 */
@media (prefers-contrast: high) {
  .todo-list__container {
    border-width: 2px;
  }
  
  .todo-list__header,
  .todo-list__footer {
    border-width: 2px;
  }
  
  .todo-list__action-btn {
    border-width: 2px;
  }
}

/* 深色模式支持（预留） */
@media (prefers-color-scheme: dark) {
  .todo-list__container {
    background: #1f2937;
    border-color: #374151;
  }
  
  .todo-list__header,
  .todo-list__footer {
    background: #374151;
    border-color: #4b5563;
  }
  
  .todo-list__empty-title {
    color: #f9fafb;
  }
  
  .todo-list__empty-message,
  .todo-list__loading-text,
  .todo-list__summary-text,
  .todo-list__stat {
    color: #d1d5db;
  }
  
  .todo-list__stat strong {
    color: #f3f4f6;
  }
  
  .todo-list__action-btn {
    background: #4b5563;
    color: #d1d5db;
    border-color: #6b7280;
  }
  
  .todo-list__action-btn:hover {
    background: #6b7280;
  }
  
  .todo-list__empty-suggestions {
    background: #374151;
    border-color: #4b5563;
  }
  
  .todo-list__empty-suggestions-title {
    color: #f3f4f6;
  }
  
  .todo-list__empty-suggestions-list {
    color: #d1d5db;
  }
}
</style>