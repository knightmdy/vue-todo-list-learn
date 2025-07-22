/**
 * TodoList组件测试
 * 
 * 测试TodoList组件的所有功能：
 * 1. 基础渲染和待办事项列表显示
 * 2. 空状态处理和友好提示
 * 3. 加载状态和错误状态
 * 4. 事件传递和处理
 * 5. 批量操作功能
 * 6. 统计信息显示
 * 7. 响应式行为
 * 8. 无障碍访问
 */

import { describe, it, expect, jest, beforeEach } from '@jest/globals'
import { mount, VueWrapper } from '@vue/test-utils'
import TodoList from '@/components/TodoList.vue'
import TodoItem from '@/components/TodoItem.vue'
import type { Todo, FilterType } from '@/types/todo'

// 模拟confirm函数
const mockConfirm = jest.fn() as jest.MockedFunction<typeof confirm>
Object.defineProperty(global, 'confirm', {
  value: mockConfirm,
  writable: true
})

describe('TodoList组件', () => {
  // 测试用的待办事项数据
  const mockTodos: Todo[] = [
    {
      id: 'todo-1',
      title: '第一个待办事项',
      completed: false,
      createdAt: new Date('2024-01-01T10:00:00Z'),
      updatedAt: new Date('2024-01-01T10:00:00Z')
    },
    {
      id: 'todo-2',
      title: '第二个待办事项',
      completed: true,
      createdAt: new Date('2024-01-01T11:00:00Z'),
      updatedAt: new Date('2024-01-01T11:30:00Z')
    },
    {
      id: 'todo-3',
      title: '第三个待办事项',
      completed: false,
      createdAt: new Date('2024-01-01T12:00:00Z'),
      updatedAt: new Date('2024-01-01T12:00:00Z')
    }
  ]

  const defaultProps = {
    todos: mockTodos,
    currentFilter: 'all' as FilterType,
    totalCount: 3,
    completedCount: 1,
    activeCount: 2,
    loading: false,
    error: null
  }

  let wrapper: VueWrapper<any>

  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('基础渲染', () => {
    it('应该正确渲染待办事项列表', () => {
      wrapper = mount(TodoList, {
        props: defaultProps
      })

      // 检查是否渲染了正确数量的TodoItem组件
      const todoItems = wrapper.findAllComponents(TodoItem)
      expect(todoItems).toHaveLength(3)

      // 检查是否传递了正确的props
      expect(todoItems[0].props('todo')).toEqual(mockTodos[0])
      expect(todoItems[1].props('todo')).toEqual(mockTodos[1])
      expect(todoItems[2].props('todo')).toEqual(mockTodos[2])
    })

    it('应该显示列表头部信息', () => {
      wrapper = mount(TodoList, {
        props: defaultProps
      })

      const header = wrapper.find('.todo-list__header')
      expect(header.exists()).toBe(true)

      const summaryText = wrapper.find('.todo-list__summary-text')
      expect(summaryText.text()).toContain('显示 3 项待办事项')
    })

    it('应该显示列表底部统计信息', () => {
      wrapper = mount(TodoList, {
        props: defaultProps
      })

      const footer = wrapper.find('.todo-list__footer')
      expect(footer.exists()).toBe(true)

      const stats = wrapper.findAll('.todo-list__stat')
      expect(stats[0].text()).toContain('2 项未完成')
      expect(stats[1].text()).toContain('1 项已完成')
      expect(stats[2].text()).toContain('完成率: 33%')
    })

    it('应该为列表提供正确的ARIA属性', () => {
      wrapper = mount(TodoList, {
        props: defaultProps
      })

      const listContainer = wrapper.find('.todo-list__items')
      expect(listContainer.attributes('role')).toBe('list')
      expect(listContainer.attributes('aria-label')).toContain('待办事项列表，共 3 项')
    })
  })

  describe('空状态处理', () => {
    it('应该在没有待办事项时显示空状态', () => {
      wrapper = mount(TodoList, {
        props: {
          ...defaultProps,
          todos: [],
          totalCount: 0,
          completedCount: 0,
          activeCount: 0
        }
      })

      const emptyState = wrapper.find('.todo-list__empty')
      expect(emptyState.exists()).toBe(true)

      const title = wrapper.find('.todo-list__empty-title')
      expect(title.text()).toBe('还没有待办事项')

      const message = wrapper.find('.todo-list__empty-message')
      expect(message.text()).toContain('开始添加一些待办事项')
    })

    it('应该根据过滤器显示不同的空状态消息', async () => {
      // 测试active过滤器的空状态
      wrapper = mount(TodoList, {
        props: {
          ...defaultProps,
          todos: [],
          currentFilter: 'active',
          totalCount: 0,
          completedCount: 0,
          activeCount: 0
        }
      })

      let title = wrapper.find('.todo-list__empty-title')
      expect(title.text()).toBe('没有未完成的待办事项')

      let message = wrapper.find('.todo-list__empty-message')
      expect(message.text()).toContain('太棒了！所有待办事项都已完成')

      // 测试completed过滤器的空状态
      await wrapper.setProps({ currentFilter: 'completed' })

      title = wrapper.find('.todo-list__empty-title')
      expect(title.text()).toBe('没有已完成的待办事项')

      message = wrapper.find('.todo-list__empty-message')
      expect(message.text()).toContain('还没有完成任何待办事项')
    })

    it('应该在showSuggestions为true时显示建议', () => {
      wrapper = mount(TodoList, {
        props: {
          ...defaultProps,
          todos: [],
          showSuggestions: true
        }
      })

      const suggestions = wrapper.find('.todo-list__empty-suggestions')
      expect(suggestions.exists()).toBe(true)

      const suggestionsList = wrapper.find('.todo-list__empty-suggestions-list')
      expect(suggestionsList.exists()).toBe(true)
    })

    it('应该在showSuggestions为false时隐藏建议', () => {
      wrapper = mount(TodoList, {
        props: {
          ...defaultProps,
          todos: [],
          showSuggestions: false
        }
      })

      const suggestions = wrapper.find('.todo-list__empty-suggestions')
      expect(suggestions.exists()).toBe(false)
    })
  })

  describe('加载和错误状态', () => {
    it('应该在loading为true时显示加载状态', () => {
      wrapper = mount(TodoList, {
        props: {
          ...defaultProps,
          loading: true
        }
      })

      const loadingState = wrapper.find('.todo-list__loading')
      expect(loadingState.exists()).toBe(true)

      const spinner = wrapper.find('.todo-list__loading-spinner')
      expect(spinner.exists()).toBe(true)

      const loadingText = wrapper.find('.todo-list__loading-text')
      expect(loadingText.text()).toBe('正在加载待办事项...')

      // 确保不显示其他状态
      expect(wrapper.find('.todo-list__empty').exists()).toBe(false)
      expect(wrapper.find('.todo-list__container').exists()).toBe(false)
    })

    it('应该在有错误时显示错误状态', () => {
      const errorMessage = '加载失败，请重试'
      wrapper = mount(TodoList, {
        props: {
          ...defaultProps,
          error: errorMessage,
          loading: false
        }
      })

      const errorState = wrapper.find('.todo-list__error')
      expect(errorState.exists()).toBe(true)

      const errorTitle = wrapper.find('.todo-list__error-title')
      expect(errorTitle.text()).toBe('加载失败')

      const errorMsg = wrapper.find('.todo-list__error-message')
      expect(errorMsg.text()).toBe(errorMessage)

      const retryButton = wrapper.find('.todo-list__error-retry')
      expect(retryButton.exists()).toBe(true)
    })

    it('应该在点击重试按钮时触发retry事件', async () => {
      wrapper = mount(TodoList, {
        props: {
          ...defaultProps,
          error: '加载失败',
          loading: false
        }
      })

      const retryButton = wrapper.find('.todo-list__error-retry')
      await retryButton.trigger('click')

      expect(wrapper.emitted('retry')).toBeTruthy()
    })
  })

  describe('事件传递', () => {
    it('应该正确传递toggle-todo事件', async () => {
      wrapper = mount(TodoList, {
        props: defaultProps
      })

      const firstTodoItem = wrapper.findAllComponents(TodoItem)[0]
      await firstTodoItem.vm.$emit('toggle', 'todo-1')

      expect(wrapper.emitted('toggle-todo')).toBeTruthy()
      expect(wrapper.emitted('toggle-todo')?.[0]).toEqual(['todo-1'])
    })

    it('应该正确传递update-todo事件', async () => {
      wrapper = mount(TodoList, {
        props: defaultProps
      })

      const firstTodoItem = wrapper.findAllComponents(TodoItem)[0]
      await firstTodoItem.vm.$emit('update', 'todo-1', '更新后的标题')

      expect(wrapper.emitted('update-todo')).toBeTruthy()
      expect(wrapper.emitted('update-todo')?.[0]).toEqual(['todo-1', '更新后的标题'])
    })

    it('应该正确传递delete-todo事件', async () => {
      wrapper = mount(TodoList, {
        props: defaultProps
      })

      const firstTodoItem = wrapper.findAllComponents(TodoItem)[0]
      await firstTodoItem.vm.$emit('delete', 'todo-1')

      expect(wrapper.emitted('delete-todo')).toBeTruthy()
      expect(wrapper.emitted('delete-todo')?.[0]).toEqual(['todo-1'])
    })
  })

  describe('批量操作', () => {
    it('应该显示批量操作按钮', () => {
      wrapper = mount(TodoList, {
        props: {
          ...defaultProps,
          showBatchActions: true
        }
      })

      const actions = wrapper.find('.todo-list__actions')
      expect(actions.exists()).toBe(true)

      const toggleAllBtn = wrapper.find('.todo-list__action-btn')
      expect(toggleAllBtn.exists()).toBe(true)
    })

    it('应该在showBatchActions为false时隐藏批量操作', () => {
      wrapper = mount(TodoList, {
        props: {
          ...defaultProps,
          showBatchActions: false
        }
      })

      const actions = wrapper.find('.todo-list__actions')
      expect(actions.exists()).toBe(false)
    })

    it('应该在点击全选按钮时触发toggle-all事件', async () => {
      wrapper = mount(TodoList, {
        props: defaultProps
      })

      const toggleAllBtn = wrapper.find('.todo-list__action-btn')
      await toggleAllBtn.trigger('click')

      expect(wrapper.emitted('toggle-all')).toBeTruthy()
      expect(wrapper.emitted('toggle-all')?.[0]).toEqual([true]) // 因为不是所有都完成，所以应该全选
    })

    it('应该根据完成状态显示正确的全选按钮文本', async () => {
      // 测试部分完成状态
      wrapper = mount(TodoList, {
        props: defaultProps
      })

      let toggleAllBtn = wrapper.find('.todo-list__action-btn')
      expect(toggleAllBtn.text()).toBe('全选')
      expect(toggleAllBtn.classes()).not.toContain('todo-list__action-btn--active')

      // 测试全部完成状态
      const allCompletedTodos = mockTodos.map(todo => ({ ...todo, completed: true }))
      await wrapper.setProps({ todos: allCompletedTodos })

      toggleAllBtn = wrapper.find('.todo-list__action-btn')
      expect(toggleAllBtn.text()).toBe('取消全选')
      expect(toggleAllBtn.classes()).toContain('todo-list__action-btn--active')
    })

    it('应该在有已完成项目时显示清除已完成按钮', () => {
      wrapper = mount(TodoList, {
        props: defaultProps
      })

      const clearCompletedBtn = wrapper.find('.todo-list__action-btn--danger')
      expect(clearCompletedBtn.exists()).toBe(true)
      expect(clearCompletedBtn.text()).toBe('清除已完成')
    })

    it('应该在没有已完成项目时隐藏清除已完成按钮', () => {
      const activeTodos = mockTodos.map(todo => ({ ...todo, completed: false }))
      wrapper = mount(TodoList, {
        props: {
          ...defaultProps,
          todos: activeTodos
        }
      })

      const clearCompletedBtn = wrapper.find('.todo-list__action-btn--danger')
      expect(clearCompletedBtn.exists()).toBe(false)
    })

    it('应该在确认后触发clear-completed事件', async () => {
      mockConfirm.mockReturnValue(true)
      
      wrapper = mount(TodoList, {
        props: defaultProps
      })

      const clearCompletedBtn = wrapper.find('.todo-list__action-btn--danger')
      await clearCompletedBtn.trigger('click')

      expect(mockConfirm).toHaveBeenCalledWith('确定要删除所有已完成的待办事项吗？')
      expect(wrapper.emitted('clear-completed')).toBeTruthy()
    })

    it('应该在取消确认时不触发clear-completed事件', async () => {
      mockConfirm.mockReturnValue(false)
      
      wrapper = mount(TodoList, {
        props: defaultProps
      })

      const clearCompletedBtn = wrapper.find('.todo-list__action-btn--danger')
      await clearCompletedBtn.trigger('click')

      expect(mockConfirm).toHaveBeenCalled()
      expect(wrapper.emitted('clear-completed')).toBeFalsy()
    })
  })

  describe('显示控制', () => {
    it('应该在showHeader为false时隐藏头部', () => {
      wrapper = mount(TodoList, {
        props: {
          ...defaultProps,
          showHeader: false
        }
      })

      const header = wrapper.find('.todo-list__header')
      expect(header.exists()).toBe(false)
    })

    it('应该在showFooter为false时隐藏底部', () => {
      wrapper = mount(TodoList, {
        props: {
          ...defaultProps,
          showFooter: false
        }
      })

      const footer = wrapper.find('.todo-list__footer')
      expect(footer.exists()).toBe(false)
    })

    it('应该在列表为空时不显示头部和底部', () => {
      wrapper = mount(TodoList, {
        props: {
          ...defaultProps,
          todos: []
        }
      })

      const header = wrapper.find('.todo-list__header')
      const footer = wrapper.find('.todo-list__footer')
      
      expect(header.exists()).toBe(false)
      expect(footer.exists()).toBe(false)
    })
  })

  describe('统计信息', () => {
    it('应该正确计算和显示完成率', () => {
      const testCases = [
        { total: 10, completed: 4, expected: '40%' },
        { total: 3, completed: 1, expected: '33%' },
        { total: 0, completed: 0, expected: '0%' },
        { total: 5, completed: 5, expected: '100%' }
      ]

      testCases.forEach(({ total, completed, expected }) => {
        wrapper = mount(TodoList, {
          props: {
            ...defaultProps,
            totalCount: total,
            completedCount: completed,
            activeCount: total - completed
          }
        })

        if (total > 0) {
          const stats = wrapper.findAll('.todo-list__stat')
          const completionRateStat = stats.find(stat => stat.text().includes('完成率'))
          expect(completionRateStat?.text()).toContain(expected)
        }
      })
    })

    it('应该显示过滤信息当totalCount与todos.length不同时', () => {
      wrapper = mount(TodoList, {
        props: {
          ...defaultProps,
          todos: mockTodos.slice(0, 2), // 只显示2个
          totalCount: 5 // 但总共有5个
        }
      })

      const summaryText = wrapper.find('.todo-list__summary-text')
      expect(summaryText.text()).toContain('显示 2 项待办事项')
      expect(summaryText.text()).toContain('（共 5 项）')
    })
  })

  describe('响应式行为', () => {
    it('应该在props变化时更新显示', async () => {
      wrapper = mount(TodoList, {
        props: defaultProps
      })

      // 更新待办事项列表
      const newTodos = [...mockTodos, {
        id: 'todo-4',
        title: '新的待办事项',
        completed: false,
        createdAt: new Date(),
        updatedAt: new Date()
      }]

      await wrapper.setProps({
        todos: newTodos,
        totalCount: 4,
        activeCount: 3
      })

      // 检查TodoItem组件数量是否更新
      const todoItems = wrapper.findAllComponents(TodoItem)
      expect(todoItems).toHaveLength(4)

      // 检查统计信息是否更新
      const summaryText = wrapper.find('.todo-list__summary-text')
      expect(summaryText.text()).toContain('显示 4 项待办事项')
    })

    it('应该在从空状态到有数据时正确切换', async () => {
      wrapper = mount(TodoList, {
        props: {
          ...defaultProps,
          todos: [],
          totalCount: 0
        }
      })

      // 初始应该显示空状态
      expect(wrapper.find('.todo-list__empty').exists()).toBe(true)
      expect(wrapper.find('.todo-list__container').exists()).toBe(false)

      // 添加数据后应该显示列表
      await wrapper.setProps({
        todos: mockTodos,
        totalCount: 3
      })

      expect(wrapper.find('.todo-list__empty').exists()).toBe(false)
      expect(wrapper.find('.todo-list__container').exists()).toBe(true)
    })
  })

  describe('边界情况', () => {
    it('应该正确处理空的待办事项数组', () => {
      wrapper = mount(TodoList, {
        props: {
          ...defaultProps,
          todos: []
        }
      })

      expect(wrapper.find('.todo-list__empty').exists()).toBe(true)
      expect(wrapper.findAllComponents(TodoItem)).toHaveLength(0)
    })

    it('应该正确处理大量待办事项', () => {
      const largeTodoList = Array.from({ length: 100 }, (_, i) => ({
        id: `todo-${i}`,
        title: `待办事项 ${i + 1}`,
        completed: i % 2 === 0,
        createdAt: new Date(),
        updatedAt: new Date()
      }))

      wrapper = mount(TodoList, {
        props: {
          ...defaultProps,
          todos: largeTodoList,
          totalCount: 100,
          completedCount: 50,
          activeCount: 50
        }
      })

      const todoItems = wrapper.findAllComponents(TodoItem)
      expect(todoItems).toHaveLength(100)

      const summaryText = wrapper.find('.todo-list__summary-text')
      expect(summaryText.text()).toContain('显示 100 项待办事项')
    })

    it('应该正确处理不一致的统计数据', () => {
      // 这种情况在实际应用中不应该发生，但组件应该能够处理
      wrapper = mount(TodoList, {
        props: {
          ...defaultProps,
          todos: mockTodos, // 3个项目
          totalCount: 10,   // 但说总共有10个
          completedCount: 7, // 已完成7个
          activeCount: 2    // 未完成2个
        }
      })

      // 组件应该显示传入的值，不进行验证
      const stats = wrapper.findAll('.todo-list__stat')
      expect(stats[0].text()).toContain('2 项未完成')
      expect(stats[1].text()).toContain('7 项已完成')
      expect(stats[2].text()).toContain('完成率: 70%')
    })
  })
})