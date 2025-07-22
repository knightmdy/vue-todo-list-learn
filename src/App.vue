<!--
  Vue Todo List 根组件
  
  这是应用的根组件，负责：
  1. 提供应用的主要布局结构
  2. 管理全局状态和主要业务逻辑
  3. 协调各个子组件的交互
  4. 处理全局错误和加载状态
  
  【知识点】
  - Vue3 单文件组件（SFC）结构：<template>、<script setup>、<style scoped>
  - 组合式 API（Composition API）
  - TypeScript 类型安全
  - Pinia 状态管理
  - 组件通信（props/emit）
  - 响应式与生命周期
  - 工程化与可维护性
  - 无障碍（a11y）与响应式设计
-->

<template>
  <div id="app" class="app-container">
    <!-- 应用头部 -->
    <header class="app-header">
      <div class="app-header__content">
        <h1 class="app-title">
          <span class="app-title__icon">📝</span>
          Vue Todo List
        </h1>
        <p class="app-subtitle">基于Vue 3 + TypeScript的现代化待办事项管理</p>
        
        <!-- 应用统计信息 -->
        <div class="app-stats" v-if="!store.loading && store.initialized">
          <div class="app-stat">
            <span class="app-stat__value">{{ store.totalCount }}</span>
            <span class="app-stat__label">总计</span>
          </div>
          <div class="app-stat">
            <span class="app-stat__value">{{ store.activeCount }}</span>
            <span class="app-stat__label">待完成</span>
          </div>
          <div class="app-stat">
            <span class="app-stat__value">{{ store.completedCount }}</span>
            <span class="app-stat__label">已完成</span>
          </div>
        </div>
      </div>
    </header>
    
    <!-- 主要内容区域 -->
    <main class="app-main" role="main">
      <!-- 全局错误提示 -->
      <div v-if="store.error && !store.loading" class="app-error">
        <div class="app-error__content">
          <span class="app-error__icon">⚠️</span>
          <span class="app-error__message">{{ store.error }}</span>
          <button 
            type="button" 
            class="app-error__dismiss"
            @click="store.clearError"
            title="关闭错误提示"
          >
            ✕
          </button>
        </div>
      </div>

      <!-- Todo应用主体 -->
      <div class="todo-app">
        <!-- 输入区域 -->
        <section class="todo-section todo-section--input" aria-label="添加新的待办事项">
          <TodoInput
            @submit="handleAddTodo"
            :disabled="store.loading"
            placeholder="添加新的待办事项..."
          />
        </section>

        <!-- 过滤器区域 -->
        <section 
          class="todo-section todo-section--filter" 
          aria-label="过滤待办事项"
          v-if="store.hasTodos || store.loading"
        >
          <TodoFilter
            :current-filter="store.filter"
            :total-count="store.totalCount"
            :completed-count="store.completedCount"
            :active-count="store.activeCount"
            :show-stats="false"
            @filter-change="handleFilterChange"
          />
        </section>

        <!-- 列表区域 -->
        <section class="todo-section todo-section--list" aria-label="待办事项列表">
          <TodoList
            :todos="store.filteredTodos"
            :current-filter="store.filter"
            :total-count="store.totalCount"
            :completed-count="store.completedCount"
            :active-count="store.activeCount"
            :loading="store.loading"
            :error="store.error"
            :show-header="store.hasTodos"
            :show-footer="store.hasTodos"
            :show-batch-actions="store.hasTodos"
            @toggle-todo="handleToggleTodo"
            @update-todo="handleUpdateTodo"
            @delete-todo="handleDeleteTodo"
            @toggle-all="handleToggleAll"
            @clear-completed="handleClearCompleted"
            @retry="handleRetry"
          />
        </section>
      </div>
    </main>
    
    <!-- 应用底部 -->
    <footer class="app-footer" role="contentinfo">
      <div class="app-footer__content">
        <p class="app-footer__text">
          &copy; 2024 Vue Todo List - 
          <a 
            href="https://github.com/vuejs/vue" 
            target="_blank" 
            rel="noopener noreferrer"
            class="app-footer__link"
          >
            基于 Vue 3
          </a>
          构建的学习项目
        </p>
        
        <!-- 键盘快捷键提示 -->
        <details class="app-shortcuts">
          <summary class="app-shortcuts__toggle">键盘快捷键</summary>
          <div class="app-shortcuts__content">
            <div class="app-shortcut">
              <kbd>Enter</kbd> - 添加/保存待办事项
            </div>
            <div class="app-shortcut">
              <kbd>Escape</kbd> - 取消编辑
            </div>
            <div class="app-shortcut">
              <kbd>Tab</kbd> - 切换焦点
            </div>
          </div>
        </details>
      </div>
    </footer>
  </div>
</template>

<script setup lang="ts">
/**
 * 【知识点】Vue3 组合式 API + TypeScript
 * - <script setup> 语法糖，简化组件书写
 * - lang="ts" 启用 TypeScript 静态类型检查
 * - 组合式 API 便于逻辑复用和类型推断
 */

import { onMounted, onErrorCaptured, nextTick } from 'vue' // Vue3 核心API
import { useTodoStore } from './stores/todoStore' // Pinia 状态管理
import { TodoInput, TodoFilter, TodoList } from './components' // 组件化开发
import type { FilterType } from './types/todo' // TypeScript 类型导入

// ===== 状态管理 =====

/**
 * 【知识点】Pinia 状态管理
 * - useTodoStore() 返回响应式 store 实例
 * - 全局状态集中管理，便于组件间共享
 */
const store = useTodoStore()

// ===== 事件处理函数 =====

/**
 * 处理添加待办事项
 * 【知识点】组件通信/事件处理
 * - 子组件通过 emit 触发 @submit 事件，父组件处理业务逻辑
 */
const handleAddTodo = async (title: string) => {
  try {
    store.addTodo(title)
  } catch (error) {
    console.error('添加待办事项失败:', error)
  }
}

/**
 * 处理切换待办事项完成状态
 * 【知识点】事件处理/错误处理
 */
const handleToggleTodo = async (id: string) => {
  try {
    store.toggleTodo(id)
  } catch (error) {
    console.error('切换待办事项状态失败:', error)
    store.setError('切换待办事项状态失败')
  }
}

/**
 * 处理更新待办事项
 * 【知识点】事件处理/类型安全
 */
const handleUpdateTodo = async (id: string, title: string) => {
  try {
    store.updateTodo(id, title)
  } catch (error) {
    console.error('更新待办事项失败:', error)
    store.setError('更新待办事项失败')
  }
}

/**
 * 处理删除待办事项
 */
const handleDeleteTodo = async (id: string) => {
  try {
    store.deleteTodo(id)
  } catch (error) {
    console.error('删除待办事项失败:', error)
    store.setError('删除待办事项失败')
  }
}

/**
 * 处理过滤器变更
 * 【知识点】类型约束/枚举
 */
const handleFilterChange = (filter: FilterType) => {
  try {
    store.setFilter(filter)
  } catch (error) {
    console.error('切换过滤器失败:', error)
    store.setError('切换过滤器失败')
  }
}

/**
 * 处理切换所有待办事项状态
 * 【知识点】批量操作/状态同步
 */
const handleToggleAll = (completed: boolean) => {
  try {
    store.toggleAllTodos(completed)
  } catch (error) {
    console.error('批量切换状态失败:', error)
    store.setError('批量操作失败')
  }
}

/**
 * 处理清除所有已完成的待办事项
 */
const handleClearCompleted = () => {
  try {
    store.clearCompleted()
  } catch (error) {
    console.error('清除已完成项目失败:', error)
    store.setError('清除已完成项目失败')
  }
}

/**
 * 处理重试操作
 * 【知识点】异步流程/错误恢复
 */
const handleRetry = async () => {
  try {
    store.clearError()
    await nextTick()
    await store.loadFromStorage()
  } catch (error) {
    console.error('重试失败:', error)
    store.setError('重试失败，请检查网络连接')
  }
}

// ===== 生命周期钩子 =====

/**
 * 组件挂载时初始化数据
 * 【知识点】生命周期钩子 onMounted
 * - 组件首次渲染后执行初始化逻辑
 */
onMounted(async () => {
  try {
    await store.loadFromStorage()
  } catch (error) {
    console.error('初始化应用失败:', error)
    store.setError('应用初始化失败，请刷新页面重试')
  }
})

/**
 * 全局错误处理
 * 【知识点】onErrorCaptured 捕获子组件错误
 */
onErrorCaptured((error, _instance, info) => {
  console.error('组件错误:', error, info)
  store.setError(`组件错误: ${error.message}`)
  
  // 返回false阻止错误继续传播
  return false
})

// ===== 开发环境调试 =====
if (import.meta.env.DEV) {
  console.log('Vue Todo List 应用已启动！')
  console.log('Store:', store)
}
</script>

<style scoped>
/* ===== 基础布局样式 ===== */
.app-container {
  min-height: 100vh;
  display: grid;
  grid-template-rows: auto 1fr auto;
  max-width: 900px;
  margin: 0 auto;
  padding: 20px;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: #333;
}

/* ===== 应用头部样式 ===== */
.app-header {
  text-align: center;
  margin-bottom: 2rem;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border-radius: 16px;
  padding: 2rem;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.app-header__content {
  max-width: 600px;
  margin: 0 auto;
}

.app-title {
  font-size: 2.5rem;
  font-weight: 700;
  color: #2c3e50;
  margin-bottom: 0.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
}

.app-title__icon {
  font-size: 2rem;
  animation: bounce 2s infinite;
}

@keyframes bounce {
  0%, 20%, 50%, 80%, 100% {
    transform: translateY(0);
  }
  40% {
    transform: translateY(-10px);
  }
  60% {
    transform: translateY(-5px);
  }
}

.app-subtitle {
  color: #7f8c8d;
  font-size: 1.1rem;
  margin-bottom: 1.5rem;
  line-height: 1.4;
}

/* ===== 应用统计样式 ===== */
.app-stats {
  display: flex;
  justify-content: center;
  gap: 2rem;
  margin-top: 1.5rem;
}

.app-stat {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 0.75rem 1rem;
  background: rgba(59, 130, 246, 0.1);
  border-radius: 8px;
  border: 1px solid rgba(59, 130, 246, 0.2);
  min-width: 80px;
}

.app-stat__value {
  font-size: 1.5rem;
  font-weight: 700;
  color: #3b82f6;
  line-height: 1;
}

.app-stat__label {
  font-size: 0.75rem;
  color: #6b7280;
  margin-top: 0.25rem;
  font-weight: 500;
}

/* ===== 主要内容区域样式 ===== */
.app-main {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

/* ===== 全局错误提示样式 ===== */
.app-error {
  background: #fef2f2;
  border: 1px solid #fecaca;
  border-radius: 8px;
  padding: 1rem;
  margin-bottom: 1rem;
  animation: slideDown 0.3s ease-out;
}

@keyframes slideDown {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.app-error__content {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.app-error__icon {
  font-size: 1.25rem;
  flex-shrink: 0;
}

.app-error__message {
  flex: 1;
  color: #dc2626;
  font-weight: 500;
}

.app-error__dismiss {
  background: none;
  border: none;
  color: #dc2626;
  cursor: pointer;
  padding: 0.25rem;
  border-radius: 4px;
  font-size: 1rem;
  line-height: 1;
  transition: background-color 0.2s ease;
}

.app-error__dismiss:hover {
  background: rgba(220, 38, 38, 0.1);
}

/* ===== Todo应用主体样式 ===== */
.todo-app {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.todo-section {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.todo-section--input {
  padding: 1.5rem;
}

.todo-section--filter {
  padding: 1rem;
}

.todo-section--list {
  padding: 0;
}

/* ===== 应用底部样式 ===== */
.app-footer {
  text-align: center;
  margin-top: 2rem;
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(10px);
  border-radius: 12px;
  padding: 1.5rem;
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.app-footer__content {
  max-width: 600px;
  margin: 0 auto;
}

.app-footer__text {
  color: #6b7280;
  font-size: 0.9rem;
  margin: 0 0 1rem 0;
  line-height: 1.5;
}

.app-footer__link {
  color: #3b82f6;
  text-decoration: none;
  font-weight: 500;
  transition: color 0.2s ease;
}

.app-footer__link:hover {
  color: #2563eb;
  text-decoration: underline;
}

/* ===== 键盘快捷键样式 ===== */
.app-shortcuts {
  margin-top: 1rem;
}

.app-shortcuts__toggle {
  color: #6b7280;
  font-size: 0.8rem;
  cursor: pointer;
  padding: 0.5rem;
  border-radius: 4px;
  transition: background-color 0.2s ease;
  user-select: none;
}

.app-shortcuts__toggle:hover {
  background: rgba(107, 114, 128, 0.1);
}

.app-shortcuts__content {
  margin-top: 0.75rem;
  padding: 1rem;
  background: #f9fafb;
  border-radius: 8px;
  border: 1px solid #e5e7eb;
}

.app-shortcut {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.5rem;
  font-size: 0.8rem;
  color: #4b5563;
}

.app-shortcut:last-child {
  margin-bottom: 0;
}

.app-shortcut kbd {
  background: #e5e7eb;
  color: #374151;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-size: 0.75rem;
  font-weight: 600;
  border: 1px solid #d1d5db;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
  min-width: 2rem;
  text-align: center;
}

/* ===== 响应式设计 ===== */
@media (max-width: 768px) {
  .app-container {
    padding: 16px;
    max-width: 100%;
  }
  
  .app-header {
    padding: 1.5rem;
    margin-bottom: 1.5rem;
  }
  
  .app-title {
    font-size: 2rem;
  }
  
  .app-subtitle {
    font-size: 1rem;
  }
  
  .app-stats {
    gap: 1rem;
    flex-wrap: wrap;
  }
  
  .app-stat {
    min-width: 70px;
    padding: 0.5rem 0.75rem;
  }
  
  .app-stat__value {
    font-size: 1.25rem;
  }
  
  .app-main {
    gap: 1rem;
  }
  
  .todo-section--input {
    padding: 1rem;
  }
  
  .app-footer {
    padding: 1rem;
  }
  
  .app-shortcuts__content {
    padding: 0.75rem;
  }
}

@media (max-width: 480px) {
  .app-container {
    padding: 12px;
  }
  
  .app-header {
    padding: 1rem;
  }
  
  .app-title {
    font-size: 1.75rem;
    flex-direction: column;
    gap: 0.25rem;
  }
  
  .app-title__icon {
    font-size: 1.5rem;
  }
  
  .app-stats {
    justify-content: space-around;
  }
  
  .app-stat {
    min-width: 60px;
    padding: 0.5rem;
  }
  
  .app-error__content {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.5rem;
  }
  
  .app-error__dismiss {
    align-self: flex-end;
  }
}

/* ===== 无障碍访问增强 ===== */
@media (prefers-reduced-motion: reduce) {
  .app-title__icon {
    animation: none;
  }
  
  .app-error {
    animation: none;
  }
  
  .app-footer__link,
  .app-shortcuts__toggle,
  .app-error__dismiss {
    transition: none;
  }
}

/* 高对比度模式支持 */
@media (prefers-contrast: high) {
  .app-header,
  .todo-section,
  .app-footer {
    border-width: 2px;
    border-color: #000;
  }
  
  .app-error {
    border-width: 2px;
  }
  
  .app-shortcuts__content {
    border-width: 2px;
  }
}

/* 深色模式支持 */
@media (prefers-color-scheme: dark) {
  .app-container {
    background: linear-gradient(135deg, #1e293b 0%, #334155 100%);
    color: #f1f5f9;
  }
  
  .app-header,
  .todo-section,
  .app-footer {
    background: rgba(30, 41, 59, 0.95);
    border-color: rgba(148, 163, 184, 0.2);
  }
  
  .app-title {
    color: #f1f5f9;
  }
  
  .app-subtitle {
    color: #94a3b8;
  }
  
  .app-stat {
    background: rgba(59, 130, 246, 0.2);
    border-color: rgba(59, 130, 246, 0.3);
  }
  
  .app-error {
    background: rgba(220, 38, 38, 0.1);
    border-color: rgba(220, 38, 38, 0.3);
  }
  
  .app-footer__text {
    color: #94a3b8;
  }
  
  .app-shortcuts__content {
    background: #374151;
    border-color: #4b5563;
  }
  
  .app-shortcut {
    color: #d1d5db;
  }
  
  .app-shortcut kbd {
    background: #4b5563;
    color: #f3f4f6;
    border-color: #6b7280;
  }
}

/* ===== 焦点指示器增强 ===== */
.app-error__dismiss:focus-visible,
.app-footer__link:focus-visible,
.app-shortcuts__toggle:focus-visible {
  outline: 2px solid #3b82f6;
  outline-offset: 2px;
}
</style>