<!--
  TodoFilter 组件
  【知识点】
  - props/emit 组件通信
  - 过滤器逻辑与状态管理
  - 组合式 API + TypeScript
  - 响应式数据
  - 无障碍（a11y）实践
  - 样式模块化
-->

<template>
  <div class="todo-filter">
    <!-- 过滤器标题 -->
    <h3 class="todo-filter__title">筛选待办事项</h3>
    
    <!-- 过滤器选项列表 -->
    <div 
      class="todo-filter__options"
      role="tablist"
      :aria-label="'过滤器选项，当前选中: ' + currentFilterLabel"
    >
      <button
        v-for="option in filterOptions"
        :key="option.value"
        type="button"
        class="todo-filter__option"
        :class="{
          'todo-filter__option--active': option.value === currentFilter
        }"
        :aria-pressed="option.value === currentFilter"
        :aria-label="`${option.label}，${getFilterCount(option.value)}项`"
        :title="option.description"
        role="tab"
        @click="handleFilterChange(option.value)"
        @keydown.enter="handleFilterChange(option.value)"
        @keydown.space.prevent="handleFilterChange(option.value)"
      >
        <!-- 过滤器标签 -->
        <span class="todo-filter__option-label">
          {{ option.label }}
        </span>
        
        <!-- 数量徽章 -->
        <span 
          class="todo-filter__option-count"
          :class="{
            'todo-filter__option-count--active': option.value === currentFilter
          }"
        >
          {{ getFilterCount(option.value) }}
        </span>
      </button>
    </div>
    
    <!-- 统计信息 -->
    <div class="todo-filter__stats" v-if="showStats">
      <div class="todo-filter__stat">
        <span class="todo-filter__stat-label">总计:</span>
        <span class="todo-filter__stat-value">{{ totalCount }}</span>
      </div>
      <div class="todo-filter__stat">
        <span class="todo-filter__stat-label">已完成:</span>
        <span class="todo-filter__stat-value">{{ completedCount }}</span>
      </div>
      <div class="todo-filter__stat">
        <span class="todo-filter__stat-label">未完成:</span>
        <span class="todo-filter__stat-value">{{ activeCount }}</span>
      </div>
      <div class="todo-filter__stat">
        <span class="todo-filter__stat-label">完成率:</span>
        <span class="todo-filter__stat-value">{{ completionRate }}%</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { FilterType, FilterOption } from '@/types/todo'

// ===== Props =====
interface Props {
  /** 当前激活的过滤器 */
  currentFilter: FilterType
  /** 总待办事项数量 */
  totalCount: number
  /** 已完成待办事项数量 */
  completedCount: number
  /** 未完成待办事项数量 */
  activeCount: number
  /** 是否显示统计信息 */
  showStats?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  showStats: true
})

// ===== Emits =====
interface Emits {
  /** 过滤器变更事件 */
  'filter-change': [filter: FilterType]
}

const emit = defineEmits<Emits>()

// ===== 计算属性 =====

/**
 * 过滤器选项配置
 */
const filterOptions = computed((): FilterOption[] => [
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
])

/**
 * 当前过滤器的显示标签
 */
const currentFilterLabel = computed(() => {
  const option = filterOptions.value.find(opt => opt.value === props.currentFilter)
  return option?.label || '全部'
})

/**
 * 完成率百分比
 */
const completionRate = computed(() => {
  if (props.totalCount === 0) return 0
  return Math.round((props.completedCount / props.totalCount) * 100)
})

// ===== 方法 =====

/**
 * 获取指定过滤器对应的待办事项数量
 * @param filter - 过滤器类型
 * @returns 对应的数量
 */
const getFilterCount = (filter: FilterType): number => {
  switch (filter) {
    case 'all':
      return props.totalCount
    case 'active':
      return props.activeCount
    case 'completed':
      return props.completedCount
    default:
      return 0
  }
}

/**
 * 处理过滤器变更
 * @param filter - 新的过滤器类型
 */
const handleFilterChange = (filter: FilterType) => {
  if (filter !== props.currentFilter) {
    emit('filter-change', filter)
  }
}
</script>

<style scoped>
/* ===== 基础样式 ===== */
.todo-filter {
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.todo-filter__title {
  margin: 0 0 16px 0;
  font-size: 18px;
  font-weight: 600;
  color: #1f2937;
  text-align: center;
}

/* ===== 过滤器选项样式 ===== */
.todo-filter__options {
  display: flex;
  gap: 8px;
  margin-bottom: 20px;
  border-radius: 6px;
  background: #f3f4f6;
  padding: 4px;
}

.todo-filter__option {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  border: none;
  border-radius: 4px;
  background: transparent;
  color: #6b7280;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  position: relative;
  min-height: 44px; /* 确保触摸友好的最小高度 */
}

.todo-filter__option:hover {
  background: #e5e7eb;
  color: #374151;
}

.todo-filter__option:focus {
  outline: 2px solid #3b82f6;
  outline-offset: 2px;
}

.todo-filter__option--active {
  background: #3b82f6;
  color: white;
  box-shadow: 0 2px 4px rgba(59, 130, 246, 0.2);
}

.todo-filter__option--active:hover {
  background: #2563eb;
  color: white;
}

.todo-filter__option-label {
  font-weight: 500;
}

.todo-filter__option-count {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 24px;
  height: 20px;
  padding: 0 6px;
  background: #d1d5db;
  color: #374151;
  font-size: 12px;
  font-weight: 600;
  border-radius: 10px;
  transition: all 0.2s ease;
}

.todo-filter__option-count--active {
  background: rgba(255, 255, 255, 0.2);
  color: white;
}

/* ===== 统计信息样式 ===== */
.todo-filter__stats {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
  padding-top: 16px;
  border-top: 1px solid #e5e7eb;
}

.todo-filter__stat {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 12px;
  background: #f9fafb;
  border-radius: 4px;
}

.todo-filter__stat-label {
  font-size: 13px;
  color: #6b7280;
  font-weight: 500;
}

.todo-filter__stat-value {
  font-size: 14px;
  color: #1f2937;
  font-weight: 600;
}

/* ===== 响应式设计 ===== */
@media (max-width: 768px) {
  .todo-filter {
    padding: 16px;
  }
  
  .todo-filter__title {
    font-size: 16px;
    margin-bottom: 12px;
  }
  
  .todo-filter__options {
    flex-direction: column;
    gap: 4px;
    margin-bottom: 16px;
  }
  
  .todo-filter__option {
    padding: 10px 12px;
    min-height: 40px;
  }
  
  .todo-filter__option-label {
    font-size: 13px;
  }
  
  .todo-filter__option-count {
    min-width: 20px;
    height: 18px;
    font-size: 11px;
  }
  
  .todo-filter__stats {
    grid-template-columns: 1fr;
    gap: 8px;
    padding-top: 12px;
  }
  
  .todo-filter__stat {
    padding: 6px 10px;
  }
  
  .todo-filter__stat-label {
    font-size: 12px;
  }
  
  .todo-filter__stat-value {
    font-size: 13px;
  }
}

/* 超小屏幕适配 */
@media (max-width: 480px) {
  .todo-filter__options {
    gap: 2px;
  }
  
  .todo-filter__option {
    padding: 8px 10px;
    font-size: 13px;
  }
  
  .todo-filter__stats {
    grid-template-columns: 1fr 1fr;
    gap: 6px;
  }
}

/* ===== 无障碍访问增强 ===== */
@media (prefers-reduced-motion: reduce) {
  .todo-filter__option,
  .todo-filter__option-count {
    transition: none;
  }
}

/* 高对比度模式支持 */
@media (prefers-contrast: high) {
  .todo-filter {
    border-width: 2px;
  }
  
  .todo-filter__option {
    border: 1px solid transparent;
  }
  
  .todo-filter__option--active {
    border-color: #1f2937;
  }
  
  .todo-filter__option:focus {
    outline-width: 3px;
  }
}

/* 深色模式支持（预留） */
@media (prefers-color-scheme: dark) {
  .todo-filter {
    background: #1f2937;
    border-color: #374151;
    color: #f9fafb;
  }
  
  .todo-filter__title {
    color: #f9fafb;
  }
  
  .todo-filter__options {
    background: #374151;
  }
  
  .todo-filter__option {
    color: #d1d5db;
  }
  
  .todo-filter__option:hover {
    background: #4b5563;
    color: #f3f4f6;
  }
  
  .todo-filter__option--active {
    background: #3b82f6;
    color: white;
  }
  
  .todo-filter__option-count {
    background: #4b5563;
    color: #d1d5db;
  }
  
  .todo-filter__option-count--active {
    background: rgba(255, 255, 255, 0.2);
    color: white;
  }
  
  .todo-filter__stats {
    border-color: #374151;
  }
  
  .todo-filter__stat {
    background: #374151;
  }
  
  .todo-filter__stat-label {
    color: #9ca3af;
  }
  
  .todo-filter__stat-value {
    color: #f3f4f6;
  }
}

/* ===== 动画效果 ===== */
.todo-filter__option-count {
  transform: scale(1);
}

.todo-filter__option:hover .todo-filter__option-count {
  transform: scale(1.05);
}

.todo-filter__option--active .todo-filter__option-count {
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.8;
  }
}

/* 焦点指示器增强 */
.todo-filter__option:focus-visible {
  outline: 2px solid #3b82f6;
  outline-offset: 2px;
  box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.1);
}
</style>