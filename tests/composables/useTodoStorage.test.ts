/**
 * useTodoStorage 组合式函数测试
 * 
 * 测试Todo应用专用的响应式存储组合式函数，包括：
 * 1. Todo列表的响应式管理
 * 2. 过滤器状态的持久化
 * 3. 应用设置的管理
 * 4. 计算属性和便捷方法
 */

import { nextTick } from 'vue'
import { useTodoStorage } from '@/composables/useTodoStorage'
import type { Todo } from '@/types/todo'

// 等待函数，用于测试异步操作
const wait = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

// 创建测试Todo的辅助函数
const createTestTodo = (id: string, title: string, completed = false): Todo => ({
  id,
  title,
  completed,
  createdAt: new Date('2024-01-01T10:00:00Z'),
  updatedAt: new Date('2024-01-01T10:00:00Z')
})

describe('useTodoStorage 组合式函数测试', () => {
  beforeEach(() => {
    // 清空localStorage
    localStorage.clear()
    jest.clearAllMocks()
  })

  describe('基础功能', () => {
    test('初始化时返回正确的默认值', async () => {
      const storage = useTodoStorage()
      
      await nextTick()
      await wait(10)
      
      expect(storage.todos.value.value).toEqual([])
      expect(storage.filter.value.value).toBe('all')
      expect(storage.settings.value.value.version).toBe('1.0.0')
      expect(storage.settings.value.value.theme).toBe('auto')
      expect(storage.settings.value.value.language).toBe('zh-CN')
    })

    test('计算属性正确计算', async () => {
      const storage = useTodoStorage()
      
      // 添加测试数据
      const todo1 = createTestTodo('1', 'Todo 1', false)
      const todo2 = createTestTodo('2', 'Todo 2', true)
      const todo3 = createTestTodo('3', 'Todo 3', false)
      
      storage.todos.value.value = [todo1, todo2, todo3]
      
      await nextTick()
      
      expect(storage.totalCount.value).toBe(3)
      expect(storage.activeCount.value).toBe(2)
      expect(storage.completedCount.value).toBe(1)
      expect(storage.completionRate.value).toBe(33) // 1/3 * 100 = 33.33 -> 33
      
      expect(storage.activeTodos.value).toEqual([todo1, todo3])
      expect(storage.completedTodos.value).toEqual([todo2])
    })

    test('过滤器正确工作', async () => {
      const storage = useTodoStorage()
      
      const todo1 = createTestTodo('1', 'Active Todo', false)
      const todo2 = createTestTodo('2', 'Completed Todo', true)
      
      storage.todos.value.value = [todo1, todo2]
      
      await nextTick()
      
      // 测试 'all' 过滤器
      storage.filter.value.value = 'all'
      await nextTick()
      expect(storage.filteredTodos.value).toEqual([todo1, todo2])
      
      // 测试 'active' 过滤器
      storage.filter.value.value = 'active'
      await nextTick()
      expect(storage.filteredTodos.value).toEqual([todo1])
      
      // 测试 'completed' 过滤器
      storage.filter.value.value = 'completed'
      await nextTick()
      expect(storage.filteredTodos.value).toEqual([todo2])
    })
  })

  describe('Todo操作方法', () => {
    test('addTodo 正确添加新的Todo', () => {
      const storage = useTodoStorage()
      
      const newTodo = storage.addTodo('New Todo Item')
      
      expect(newTodo.title).toBe('New Todo Item')
      expect(newTodo.completed).toBe(false)
      expect(newTodo.id).toBeDefined()
      expect(newTodo.createdAt).toBeInstanceOf(Date)
      expect(newTodo.updatedAt).toBeInstanceOf(Date)
      
      expect(storage.todos.value.value).toContainEqual(newTodo)
      expect(storage.totalCount.value).toBe(1)
    })

    test('addTodo 自动修剪标题空格', () => {
      const storage = useTodoStorage()
      
      const newTodo = storage.addTodo('  Trimmed Todo  ')
      
      expect(newTodo.title).toBe('Trimmed Todo')
    })

    test('updateTodo 正确更新Todo', () => {
      const storage = useTodoStorage()
      
      const todo = storage.addTodo('Original Title')
      const originalUpdatedAt = todo.updatedAt
      
      // 等待一毫秒确保时间戳不同
      setTimeout(() => {
        const success = storage.updateTodo(todo.id, { 
          title: 'Updated Title',
          completed: true 
        })
        
        expect(success).toBe(true)
        
        const updatedTodo = storage.todos.value.value.find(t => t.id === todo.id)
        expect(updatedTodo?.title).toBe('Updated Title')
        expect(updatedTodo?.completed).toBe(true)
        expect(updatedTodo?.updatedAt.getTime()).toBeGreaterThan(originalUpdatedAt.getTime())
      }, 1)
    })

    test('updateTodo 对不存在的Todo返回false', () => {
      const storage = useTodoStorage()
      
      const success = storage.updateTodo('non-existent-id', { title: 'New Title' })
      
      expect(success).toBe(false)
    })

    test('deleteTodo 正确删除Todo', () => {
      const storage = useTodoStorage()
      
      const todo1 = storage.addTodo('Todo 1')
      const todo2 = storage.addTodo('Todo 2')
      
      expect(storage.totalCount.value).toBe(2)
      
      const success = storage.deleteTodo(todo1.id)
      
      expect(success).toBe(true)
      expect(storage.totalCount.value).toBe(1)
      expect(storage.todos.value.value.find(t => t.id === todo1.id)).toBeUndefined()
      expect(storage.todos.value.value.find(t => t.id === todo2.id)).toBeDefined()
    })

    test('deleteTodo 对不存在的Todo返回false', () => {
      const storage = useTodoStorage()
      
      const success = storage.deleteTodo('non-existent-id')
      
      expect(success).toBe(false)
    })

    test('toggleTodo 正确切换完成状态', () => {
      const storage = useTodoStorage()
      
      const todo = storage.addTodo('Toggle Todo')
      expect(todo.completed).toBe(false)
      
      const success1 = storage.toggleTodo(todo.id)
      expect(success1).toBe(true)
      
      const updatedTodo1 = storage.todos.value.value.find(t => t.id === todo.id)
      expect(updatedTodo1?.completed).toBe(true)
      
      const success2 = storage.toggleTodo(todo.id)
      expect(success2).toBe(true)
      
      const updatedTodo2 = storage.todos.value.value.find(t => t.id === todo.id)
      expect(updatedTodo2?.completed).toBe(false)
    })

    test('toggleTodo 对不存在的Todo返回false', () => {
      const storage = useTodoStorage()
      
      const success = storage.toggleTodo('non-existent-id')
      
      expect(success).toBe(false)
    })
  })

  describe('批量操作方法', () => {
    test('clearCompleted 清除所有已完成的Todo', () => {
      const storage = useTodoStorage()
      
      storage.addTodo('Active Todo 1')
      const completedTodo1 = storage.addTodo('Completed Todo 1')
      storage.addTodo('Active Todo 2')
      const completedTodo2 = storage.addTodo('Completed Todo 2')
      
      // 标记为完成
      storage.toggleTodo(completedTodo1.id)
      storage.toggleTodo(completedTodo2.id)
      
      expect(storage.totalCount.value).toBe(4)
      expect(storage.completedCount.value).toBe(2)
      
      const clearedCount = storage.clearCompleted()
      
      expect(clearedCount).toBe(2)
      expect(storage.totalCount.value).toBe(2)
      expect(storage.completedCount.value).toBe(0)
      expect(storage.activeCount.value).toBe(2)
    })

    test('markAllCompleted 标记所有Todo为已完成', () => {
      const storage = useTodoStorage()
      
      storage.addTodo('Todo 1')
      storage.addTodo('Todo 2')
      storage.addTodo('Todo 3')
      
      expect(storage.completedCount.value).toBe(0)
      
      storage.markAllCompleted()
      
      expect(storage.completedCount.value).toBe(3)
      expect(storage.activeCount.value).toBe(0)
      
      // 验证所有Todo都被标记为完成
      storage.todos.value.value.forEach(todo => {
        expect(todo.completed).toBe(true)
      })
    })

    test('markAllActive 标记所有Todo为未完成', () => {
      const storage = useTodoStorage()
      
      const todo1 = storage.addTodo('Todo 1')
      const todo2 = storage.addTodo('Todo 2')
      const todo3 = storage.addTodo('Todo 3')
      
      // 先标记为完成
      storage.toggleTodo(todo1.id)
      storage.toggleTodo(todo2.id)
      storage.toggleTodo(todo3.id)
      
      expect(storage.completedCount.value).toBe(3)
      
      storage.markAllActive()
      
      expect(storage.completedCount.value).toBe(0)
      expect(storage.activeCount.value).toBe(3)
      
      // 验证所有Todo都被标记为未完成
      storage.todos.value.value.forEach(todo => {
        expect(todo.completed).toBe(false)
      })
    })
  })

  describe('数据导入导出', () => {
    test('exportData 正确导出数据', () => {
      const storage = useTodoStorage()
      
      storage.addTodo('Export Todo 1')
      storage.addTodo('Export Todo 2')
      storage.filter.value.value = 'active'
      storage.settings.update({ theme: 'dark' })
      
      const exportedData = storage.exportData()
      const parsedData = JSON.parse(exportedData)
      
      expect(parsedData.todos).toHaveLength(2)
      expect(parsedData.filter).toBe('active')
      expect(parsedData.settings.theme).toBe('dark')
      expect(parsedData.version).toBe('1.0.0')
      expect(parsedData.exportTime).toBeDefined()
    })

    test('importData 正确导入有效数据', () => {
      const storage = useTodoStorage()
      
      const importData = {
        todos: [
          createTestTodo('1', 'Imported Todo 1', false),
          createTestTodo('2', 'Imported Todo 2', true)
        ],
        filter: 'completed',
        settings: {
          theme: 'dark',
          language: 'en-US'
        },
        version: '1.0.0',
        exportTime: new Date().toISOString()
      }
      
      const success = storage.importData(JSON.stringify(importData))
      
      expect(success).toBe(true)
      expect(storage.totalCount.value).toBe(2)
      expect(storage.filter.value.value).toBe('completed')
      expect(storage.settings.get('theme')).toBe('dark')
      expect(storage.settings.get('language')).toBe('en-US')
    })

    test('importData 拒绝无效数据', () => {
      const storage = useTodoStorage()
      
      // 测试无效JSON
      let success = storage.importData('invalid json {')
      expect(success).toBe(false)
      
      // 测试缺少todos字段
      success = storage.importData(JSON.stringify({ filter: 'all' }))
      expect(success).toBe(false)
      
      // 测试todos不是数组
      success = storage.importData(JSON.stringify({ todos: 'not an array' }))
      expect(success).toBe(false)
      
      // 测试Todo项格式不正确
      success = storage.importData(JSON.stringify({ 
        todos: [{ title: 'Missing ID' }] 
      }))
      expect(success).toBe(false)
    })

    test('clearAllData 清除所有数据', () => {
      const storage = useTodoStorage()
      
      storage.addTodo('Todo to be cleared')
      storage.filter.value.value = 'active'
      storage.settings.update({ theme: 'dark' })
      
      expect(storage.totalCount.value).toBe(1)
      expect(storage.filter.value.value).toBe('active')
      expect(storage.settings.get('theme')).toBe('dark')
      
      storage.clearAllData()
      
      expect(storage.totalCount.value).toBe(0)
      expect(storage.filter.value.value).toBe('all')
      expect(storage.settings.get('theme')).toBe('auto') // 重置为默认值
    })
  })

  describe('存储信息', () => {
    test('getStorageInfo 返回正确的存储信息', () => {
      const storage = useTodoStorage()
      
      storage.addTodo('Info Todo 1')
      storage.addTodo('Info Todo 2')
      
      const info = storage.getStorageInfo()
      
      expect(info.todosCount).toBe(2)
      expect(info.storageUsed).toBeGreaterThan(0)
      expect(info.lastSaved).toBeDefined()
      expect(typeof info.lastSaved).toBe('string')
    })
  })

  describe('响应式和持久化', () => {
    test('数据变化时自动保存到localStorage', async () => {
      const storage = useTodoStorage()
      
      // 清空现有数据确保测试隔离
      storage.clearAllData()
      await wait(100)
      
      // 确保初始状态为空
      expect(storage.todos.value.value.length).toBe(0)
      
      storage.addTodo('Auto Save Todo')
      
      // 等待自动保存
      await wait(600) // saveDelay 是 500ms
      
      // 检查localStorage中是否有数据
      const storedTodos = localStorage.getItem('vue-todo-list:todos')
      expect(storedTodos).not.toBeNull()
      
      const parsedTodos = JSON.parse(storedTodos!)
      expect(parsedTodos).toHaveLength(1)
      expect(parsedTodos[0].title).toBe('Auto Save Todo')
    })

    test('从localStorage恢复数据', async () => {
      // 先在localStorage中设置数据
      const testTodos = [
        createTestTodo('1', 'Restored Todo 1', false),
        createTestTodo('2', 'Restored Todo 2', true)
      ]
      
      localStorage.setItem('vue-todo-list:todos', JSON.stringify(testTodos))
      localStorage.setItem('vue-todo-list:filter', JSON.stringify('completed'))
      
      // 创建新的storage实例
      const storage = useTodoStorage()
      
      // 等待数据加载
      await nextTick()
      await wait(10)
      
      expect(storage.totalCount.value).toBe(2)
      expect(storage.filter.value.value).toBe('completed')
      expect(storage.todos.value.value[0].title).toBe('Restored Todo 1')
      expect(storage.todos.value.value[1].title).toBe('Restored Todo 2')
    })
  })

  describe('边界情况和错误处理', () => {
    test('处理空字符串标题', () => {
      const storage = useTodoStorage()
      
      const todo = storage.addTodo('   ')
      
      expect(todo.title).toBe('')
      expect(storage.totalCount.value).toBe(1)
    })

    test('处理重复ID的情况', () => {
      const storage = useTodoStorage()
      
      const todo1 = storage.addTodo('Todo 1')
      const todo2 = storage.addTodo('Todo 2')
      
      // ID应该是唯一的
      expect(todo1.id).not.toBe(todo2.id)
    })

    test('completionRate 在没有Todo时返回0', () => {
      const storage = useTodoStorage()
      
      expect(storage.completionRate.value).toBe(0)
    })

    test('clearCompleted 在没有已完成Todo时返回0', () => {
      const storage = useTodoStorage()
      
      storage.addTodo('Active Todo')
      
      const clearedCount = storage.clearCompleted()
      
      expect(clearedCount).toBe(0)
      expect(storage.totalCount.value).toBe(1)
    })
  })
})