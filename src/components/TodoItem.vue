<!--
  TodoItem 组件
  【知识点】
  - props/emit 组件通信
  - 事件处理与状态切换
  - 组合式 API + TypeScript
  - 响应式数据
  - 无障碍（a11y）实践
  - 样式模块化
-->

<template>
  <div 
    class="todo-item"
    :class="{
      'todo-item--completed': todo.completed,
      'todo-item--editing': isEditing
    }"
  >
    <!-- 完成状态复选框 -->
    <label class="todo-item__checkbox-wrapper">
      <input
        type="checkbox"
        class="todo-item__checkbox"
        :checked="todo.completed"
        @change="handleToggle"
        :aria-label="`标记 ${todo.title} 为${todo.completed ? '未完成' : '已完成'}`"
      />
      <span class="todo-item__checkmark"></span>
    </label>

    <!-- 待办事项内容区域 -->
    <div class="todo-item__content">
      <!-- 显示模式 -->
      <div 
        v-if="!isEditing"
        class="todo-item__display"
        @dblclick="startEditing"
        :title="todo.completed ? '双击编辑（已完成）' : '双击编辑'"
      >
        <span 
          class="todo-item__title"
          :class="{ 'todo-item__title--completed': todo.completed }"
        >
          {{ todo.title }}
        </span>
        <time 
          class="todo-item__timestamp"
          :datetime="todo.updatedAt.toISOString()"
          :title="`创建于: ${formatDate(todo.createdAt)}, 更新于: ${formatDate(todo.updatedAt)}`"
        >
          {{ formatRelativeTime(todo.updatedAt) }}
        </time>
      </div>

      <!-- 编辑模式 -->
      <div 
        v-else
        class="todo-item__edit"
      >
        <input
          ref="editInput"
          v-model="editTitle"
          type="text"
          class="todo-item__edit-input"
          :placeholder="'编辑待办事项...'"
          @keyup.enter="saveEdit"
          @keyup.escape="cancelEdit"
          @blur="saveEdit"
          maxlength="200"
          :aria-label="`编辑待办事项: ${todo.title}`"
        />
        <div class="todo-item__edit-actions">
          <button
            type="button"
            class="todo-item__edit-btn todo-item__edit-btn--save"
            @click="saveEdit"
            :disabled="!editTitle.trim()"
            title="保存更改 (Enter)"
          >
            ✓
          </button>
          <button
            type="button"
            class="todo-item__edit-btn todo-item__edit-btn--cancel"
            @click="cancelEdit"
            title="取消编辑 (Escape)"
          >
            ✕
          </button>
        </div>
      </div>
    </div>

    <!-- 删除按钮 -->
    <button
      v-if="!isEditing"
      type="button"
      class="todo-item__delete"
      @click="handleDelete"
      :aria-label="`删除待办事项: ${todo.title}`"
      title="删除此待办事项"
    >
      <span class="todo-item__delete-icon">🗑️</span>
    </button>
  </div>
</template>

<script setup lang="ts">
import { ref, nextTick, computed } from 'vue'
import type { Todo } from '@/types/todo'

// ===== Props =====
interface Props {
  /** 待办事项数据 */
  todo: Todo
}

const props = defineProps<Props>()

// ===== Emits =====
interface Emits {
  /** 切换完成状态事件 */
  toggle: [id: string]
  /** 更新待办事项事件 */
  update: [id: string, title: string]
  /** 删除待办事项事件 */
  delete: [id: string]
}

const emit = defineEmits<Emits>()

// ===== 响应式数据 =====

/** 是否处于编辑模式 */
const isEditing = ref(false)

/** 编辑时的标题内容 */
const editTitle = ref('')

/** 编辑输入框的引用 */
const editInput = ref<HTMLInputElement>()

// ===== 计算属性 =====

/** 格式化的相对时间 */
const formatRelativeTime = computed(() => {
  return (date: Date): string => {
    const now = new Date()
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000)
    
    if (diffInSeconds < 60) {
      return '刚刚'
    } else if (diffInSeconds < 3600) {
      const minutes = Math.floor(diffInSeconds / 60)
      return `${minutes}分钟前`
    } else if (diffInSeconds < 86400) {
      const hours = Math.floor(diffInSeconds / 3600)
      return `${hours}小时前`
    } else {
      const days = Math.floor(diffInSeconds / 86400)
      return `${days}天前`
    }
  }
})

/** 格式化完整日期 */
const formatDate = computed(() => {
  return (date: Date): string => {
    return date.toLocaleString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    })
  }
})

// ===== 方法 =====

/**
 * 处理完成状态切换
 */
const handleToggle = () => {
  emit('toggle', props.todo.id)
}

/**
 * 开始编辑模式
 */
const startEditing = async () => {
  if (isEditing.value) return
  
  isEditing.value = true
  editTitle.value = props.todo.title
  
  // 等待DOM更新后聚焦输入框
  await nextTick()
  if (editInput.value) {
    editInput.value.focus()
    editInput.value.select()
  }
}

/**
 * 保存编辑
 */
const saveEdit = () => {
  if (!isEditing.value) return
  
  const newTitle = editTitle.value.trim()
  
  // 如果标题为空，取消编辑
  if (!newTitle) {
    cancelEdit()
    return
  }
  
  // 如果标题没有变化，直接取消编辑
  if (newTitle === props.todo.title) {
    cancelEdit()
    return
  }
  
  // 发送更新事件
  emit('update', props.todo.id, newTitle)
  
  // 退出编辑模式
  isEditing.value = false
  editTitle.value = ''
}

/**
 * 取消编辑
 */
const cancelEdit = () => {
  isEditing.value = false
  editTitle.value = ''
}

/**
 * 处理删除操作
 */
const handleDelete = () => {
  // 简单的确认对话框
  if (confirm(`确定要删除待办事项"${props.todo.title}"吗？`)) {
    emit('delete', props.todo.id)
  }
}
</script>

<style scoped>
/* ===== 基础样式 ===== */
.todo-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px;
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  transition: all 0.2s ease;
  position: relative;
}

.todo-item:hover {
  border-color: #d1d5db;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.todo-item--completed {
  background: #f9fafb;
  opacity: 0.8;
}

.todo-item--editing {
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

/* ===== 复选框样式 ===== */
.todo-item__checkbox-wrapper {
  display: flex;
  align-items: center;
  cursor: pointer;
  position: relative;
}

.todo-item__checkbox {
  position: absolute;
  opacity: 0;
  cursor: pointer;
}

.todo-item__checkmark {
  width: 20px;
  height: 20px;
  border: 2px solid #d1d5db;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
  background: white;
}

.todo-item__checkbox:checked + .todo-item__checkmark {
  background: #3b82f6;
  border-color: #3b82f6;
}

.todo-item__checkbox:checked + .todo-item__checkmark::after {
  content: '✓';
  color: white;
  font-size: 12px;
  font-weight: bold;
}

.todo-item__checkbox:focus + .todo-item__checkmark {
  outline: 2px solid #3b82f6;
  outline-offset: 2px;
}

/* ===== 内容区域样式 ===== */
.todo-item__content {
  flex: 1;
  min-width: 0;
}

.todo-item__display {
  cursor: pointer;
  padding: 4px 0;
}

.todo-item__title {
  display: block;
  font-size: 16px;
  line-height: 1.5;
  color: #1f2937;
  word-break: break-word;
  margin-bottom: 4px;
  transition: all 0.2s ease;
}

.todo-item__title--completed {
  text-decoration: line-through;
  color: #6b7280;
}

.todo-item__timestamp {
  font-size: 12px;
  color: #9ca3af;
  font-style: italic;
}

/* ===== 编辑模式样式 ===== */
.todo-item__edit {
  display: flex;
  align-items: center;
  gap: 8px;
}

.todo-item__edit-input {
  flex: 1;
  padding: 8px 12px;
  border: 1px solid #d1d5db;
  border-radius: 4px;
  font-size: 16px;
  line-height: 1.5;
  outline: none;
  transition: border-color 0.2s ease;
}

.todo-item__edit-input:focus {
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.todo-item__edit-actions {
  display: flex;
  gap: 4px;
}

.todo-item__edit-btn {
  width: 28px;
  height: 28px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  font-weight: bold;
  transition: all 0.2s ease;
}

.todo-item__edit-btn--save {
  background: #10b981;
  color: white;
}

.todo-item__edit-btn--save:hover:not(:disabled) {
  background: #059669;
}

.todo-item__edit-btn--save:disabled {
  background: #d1d5db;
  color: #9ca3af;
  cursor: not-allowed;
}

.todo-item__edit-btn--cancel {
  background: #ef4444;
  color: white;
}

.todo-item__edit-btn--cancel:hover {
  background: #dc2626;
}

/* ===== 删除按钮样式 ===== */
.todo-item__delete {
  width: 32px;
  height: 32px;
  border: none;
  background: transparent;
  cursor: pointer;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
  opacity: 0;
}

.todo-item:hover .todo-item__delete {
  opacity: 1;
}

.todo-item__delete:hover {
  background: #fee2e2;
}

.todo-item__delete:focus {
  opacity: 1;
  outline: 2px solid #ef4444;
  outline-offset: 2px;
}

.todo-item__delete-icon {
  font-size: 16px;
  filter: grayscale(1);
  transition: filter 0.2s ease;
}

.todo-item__delete:hover .todo-item__delete-icon {
  filter: none;
}

/* ===== 响应式设计 ===== */
@media (max-width: 768px) {
  .todo-item {
    padding: 12px;
    gap: 8px;
  }
  
  .todo-item__title {
    font-size: 14px;
  }
  
  .todo-item__edit-input {
    font-size: 14px;
    padding: 6px 8px;
  }
  
  .todo-item__delete {
    opacity: 1; /* 在移动端始终显示删除按钮 */
  }
}

/* ===== 无障碍访问增强 ===== */
@media (prefers-reduced-motion: reduce) {
  .todo-item,
  .todo-item__checkmark,
  .todo-item__title,
  .todo-item__edit-input,
  .todo-item__edit-btn,
  .todo-item__delete,
  .todo-item__delete-icon {
    transition: none;
  }
}

/* 高对比度模式支持 */
@media (prefers-contrast: high) {
  .todo-item {
    border-width: 2px;
  }
  
  .todo-item__checkmark {
    border-width: 3px;
  }
  
  .todo-item__edit-input {
    border-width: 2px;
  }
}
</style>