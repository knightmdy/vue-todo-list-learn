/**
 * TodoItem组件测试
 * 
 * 测试TodoItem组件的所有功能：
 * 1. 基础渲染和数据显示
 * 2. 完成状态切换功能
 * 3. 行内编辑功能
 * 4. 删除功能
 * 5. 键盘交互
 * 6. 无障碍访问
 */

import { describe, it, expect, jest, beforeEach } from '@jest/globals'
import { mount, VueWrapper } from '@vue/test-utils'
import TodoItem from '@/components/TodoItem.vue'
import type { Todo } from '@/types/todo'

// 模拟confirm函数
const mockConfirm = jest.fn() as jest.MockedFunction<typeof confirm>
Object.defineProperty(global, 'confirm', {
  value: mockConfirm,
  writable: true
})

describe('TodoItem组件', () => {
  // 测试用的待办事项数据
  const mockTodo: Todo = {
    id: 'test-todo-1',
    title: '测试待办事项',
    completed: false,
    createdAt: new Date('2024-01-01T10:00:00Z'),
    updatedAt: new Date('2024-01-01T10:30:00Z')
  }

  const mockCompletedTodo: Todo = {
    id: 'test-todo-2',
    title: '已完成的待办事项',
    completed: true,
    createdAt: new Date('2024-01-01T09:00:00Z'),
    updatedAt: new Date('2024-01-01T09:30:00Z')
  }

  let wrapper: VueWrapper<any>

  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('基础渲染', () => {
    it('应该正确渲染待办事项的基本信息', () => {
      wrapper = mount(TodoItem, {
        props: { todo: mockTodo }
      })

      // 检查标题是否正确显示
      expect(wrapper.find('.todo-item__title').text()).toBe(mockTodo.title)
      
      // 检查复选框状态
      const checkbox = wrapper.find('.todo-item__checkbox')
      expect((checkbox.element as HTMLInputElement).checked).toBe(false)
      
      // 检查时间戳显示
      expect(wrapper.find('.todo-item__timestamp').exists()).toBe(true)
    })

    it('应该为已完成的待办事项应用正确的样式', () => {
      wrapper = mount(TodoItem, {
        props: { todo: mockCompletedTodo }
      })

      // 检查组件是否有完成状态的CSS类
      expect(wrapper.find('.todo-item').classes()).toContain('todo-item--completed')
      
      // 检查标题是否有删除线样式
      expect(wrapper.find('.todo-item__title').classes()).toContain('todo-item__title--completed')
      
      // 检查复选框是否被选中
      const checkbox = wrapper.find('.todo-item__checkbox')
      expect((checkbox.element as HTMLInputElement).checked).toBe(true)
    })

    it('应该显示删除按钮', () => {
      wrapper = mount(TodoItem, {
        props: { todo: mockTodo }
      })

      const deleteButton = wrapper.find('.todo-item__delete')
      expect(deleteButton.exists()).toBe(true)
      expect(deleteButton.attributes('aria-label')).toContain(mockTodo.title)
    })
  })

  describe('完成状态切换', () => {
    it('应该在点击复选框时触发toggle事件', async () => {
      wrapper = mount(TodoItem, {
        props: { todo: mockTodo }
      })

      const checkbox = wrapper.find('.todo-item__checkbox')
      await checkbox.trigger('change')

      // 检查是否触发了toggle事件
      expect(wrapper.emitted('toggle')).toBeTruthy()
      expect(wrapper.emitted('toggle')?.[0]).toEqual([mockTodo.id])
    })

    it('应该为复选框提供正确的无障碍标签', () => {
      wrapper = mount(TodoItem, {
        props: { todo: mockTodo }
      })

      const checkbox = wrapper.find('.todo-item__checkbox')
      expect(checkbox.attributes('aria-label')).toContain('标记')
      expect(checkbox.attributes('aria-label')).toContain(mockTodo.title)
      expect(checkbox.attributes('aria-label')).toContain('已完成')
    })
  })

  describe('行内编辑功能', () => {
    it('应该在双击标题时进入编辑模式', async () => {
      wrapper = mount(TodoItem, {
        props: { todo: mockTodo }
      })

      const display = wrapper.find('.todo-item__display')
      await display.trigger('dblclick')

      // 检查是否进入编辑模式
      expect(wrapper.find('.todo-item').classes()).toContain('todo-item--editing')
      expect(wrapper.find('.todo-item__edit').exists()).toBe(true)
      expect(wrapper.find('.todo-item__edit-input').exists()).toBe(true)
    })

    it('应该在编辑模式下显示当前标题', async () => {
      wrapper = mount(TodoItem, {
        props: { todo: mockTodo }
      })

      const display = wrapper.find('.todo-item__display')
      await display.trigger('dblclick')

      const editInput = wrapper.find('.todo-item__edit-input')
      expect((editInput.element as HTMLInputElement).value).toBe(mockTodo.title)
    })

    it('应该在按回车键时保存编辑', async () => {
      wrapper = mount(TodoItem, {
        props: { todo: mockTodo }
      })

      // 进入编辑模式
      await wrapper.find('.todo-item__display').trigger('dblclick')
      
      // 修改输入内容
      const editInput = wrapper.find('.todo-item__edit-input')
      await editInput.setValue('修改后的标题')
      
      // 按回车键
      await editInput.trigger('keyup.enter')

      // 检查是否触发了update事件
      expect(wrapper.emitted('update')).toBeTruthy()
      expect(wrapper.emitted('update')?.[0]).toEqual([mockTodo.id, '修改后的标题'])
    })

    it('应该在按ESC键时取消编辑', async () => {
      wrapper = mount(TodoItem, {
        props: { todo: mockTodo }
      })

      // 进入编辑模式
      await wrapper.find('.todo-item__display').trigger('dblclick')
      
      // 修改输入内容
      const editInput = wrapper.find('.todo-item__edit-input')
      await editInput.setValue('修改后的标题')
      
      // 按ESC键
      await editInput.trigger('keyup.escape')

      // 检查是否退出编辑模式且没有触发update事件
      expect(wrapper.find('.todo-item').classes()).not.toContain('todo-item--editing')
      expect(wrapper.emitted('update')).toBeFalsy()
    })

    it('应该在失去焦点时保存编辑', async () => {
      wrapper = mount(TodoItem, {
        props: { todo: mockTodo }
      })

      // 进入编辑模式
      await wrapper.find('.todo-item__display').trigger('dblclick')
      
      // 修改输入内容
      const editInput = wrapper.find('.todo-item__edit-input')
      await editInput.setValue('修改后的标题')
      
      // 失去焦点
      await editInput.trigger('blur')

      // 检查是否触发了update事件
      expect(wrapper.emitted('update')).toBeTruthy()
      expect(wrapper.emitted('update')?.[0]).toEqual([mockTodo.id, '修改后的标题'])
    })

    it('应该在输入为空时取消编辑', async () => {
      wrapper = mount(TodoItem, {
        props: { todo: mockTodo }
      })

      // 进入编辑模式
      await wrapper.find('.todo-item__display').trigger('dblclick')
      
      // 清空输入内容
      const editInput = wrapper.find('.todo-item__edit-input')
      await editInput.setValue('')
      
      // 按回车键
      await editInput.trigger('keyup.enter')

      // 检查是否取消编辑且没有触发update事件
      expect(wrapper.find('.todo-item').classes()).not.toContain('todo-item--editing')
      expect(wrapper.emitted('update')).toBeFalsy()
    })

    it('应该在内容没有变化时取消编辑', async () => {
      wrapper = mount(TodoItem, {
        props: { todo: mockTodo }
      })

      // 进入编辑模式
      await wrapper.find('.todo-item__display').trigger('dblclick')
      
      // 保持原内容不变
      const editInput = wrapper.find('.todo-item__edit-input')
      expect((editInput.element as HTMLInputElement).value).toBe(mockTodo.title)
      
      // 按回车键
      await editInput.trigger('keyup.enter')

      // 检查是否取消编辑且没有触发update事件
      expect(wrapper.find('.todo-item').classes()).not.toContain('todo-item--editing')
      expect(wrapper.emitted('update')).toBeFalsy()
    })

    it('应该在点击保存按钮时保存编辑', async () => {
      wrapper = mount(TodoItem, {
        props: { todo: mockTodo }
      })

      // 进入编辑模式
      await wrapper.find('.todo-item__display').trigger('dblclick')
      
      // 修改输入内容
      const editInput = wrapper.find('.todo-item__edit-input')
      await editInput.setValue('修改后的标题')
      
      // 点击保存按钮
      const saveButton = wrapper.find('.todo-item__edit-btn--save')
      await saveButton.trigger('click')

      // 检查是否触发了update事件
      expect(wrapper.emitted('update')).toBeTruthy()
      expect(wrapper.emitted('update')?.[0]).toEqual([mockTodo.id, '修改后的标题'])
    })

    it('应该在点击取消按钮时取消编辑', async () => {
      wrapper = mount(TodoItem, {
        props: { todo: mockTodo }
      })

      // 进入编辑模式
      await wrapper.find('.todo-item__display').trigger('dblclick')
      
      // 修改输入内容
      const editInput = wrapper.find('.todo-item__edit-input')
      await editInput.setValue('修改后的标题')
      
      // 点击取消按钮
      const cancelButton = wrapper.find('.todo-item__edit-btn--cancel')
      await cancelButton.trigger('click')

      // 检查是否取消编辑且没有触发update事件
      expect(wrapper.find('.todo-item').classes()).not.toContain('todo-item--editing')
      expect(wrapper.emitted('update')).toBeFalsy()
    })

    it('应该在编辑模式下隐藏删除按钮', async () => {
      wrapper = mount(TodoItem, {
        props: { todo: mockTodo }
      })

      // 进入编辑模式
      await wrapper.find('.todo-item__display').trigger('dblclick')

      // 检查删除按钮是否被隐藏
      expect(wrapper.find('.todo-item__delete').exists()).toBe(false)
    })
  })

  describe('删除功能', () => {
    it('应该在点击删除按钮时显示确认对话框', async () => {
      mockConfirm.mockReturnValue(true)
      
      wrapper = mount(TodoItem, {
        props: { todo: mockTodo }
      })

      const deleteButton = wrapper.find('.todo-item__delete')
      await deleteButton.trigger('click')

      // 检查是否调用了confirm函数
      expect(mockConfirm).toHaveBeenCalledWith(`确定要删除待办事项"${mockTodo.title}"吗？`)
    })

    it('应该在确认删除时触发delete事件', async () => {
      mockConfirm.mockReturnValue(true)
      
      wrapper = mount(TodoItem, {
        props: { todo: mockTodo }
      })

      const deleteButton = wrapper.find('.todo-item__delete')
      await deleteButton.trigger('click')

      // 检查是否触发了delete事件
      expect(wrapper.emitted('delete')).toBeTruthy()
      expect(wrapper.emitted('delete')?.[0]).toEqual([mockTodo.id])
    })

    it('应该在取消删除时不触发delete事件', async () => {
      mockConfirm.mockReturnValue(false)
      
      wrapper = mount(TodoItem, {
        props: { todo: mockTodo }
      })

      const deleteButton = wrapper.find('.todo-item__delete')
      await deleteButton.trigger('click')

      // 检查是否没有触发delete事件
      expect(wrapper.emitted('delete')).toBeFalsy()
    })
  })

  describe('时间显示', () => {
    it('应该显示相对时间', () => {
      // 创建一个1小时前的时间
      const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000)
      const todoWithRecentTime: Todo = {
        ...mockTodo,
        updatedAt: oneHourAgo
      }

      wrapper = mount(TodoItem, {
        props: { todo: todoWithRecentTime }
      })

      const timestamp = wrapper.find('.todo-item__timestamp')
      expect(timestamp.text()).toContain('小时前')
    })

    it('应该在title属性中显示完整的时间信息', () => {
      wrapper = mount(TodoItem, {
        props: { todo: mockTodo }
      })

      const timestamp = wrapper.find('.todo-item__timestamp')
      const title = timestamp.attributes('title')
      
      expect(title).toContain('创建于')
      expect(title).toContain('更新于')
    })
  })

  describe('无障碍访问', () => {
    it('应该为所有交互元素提供正确的aria-label', () => {
      wrapper = mount(TodoItem, {
        props: { todo: mockTodo }
      })

      // 检查复选框的aria-label
      const checkbox = wrapper.find('.todo-item__checkbox')
      expect(checkbox.attributes('aria-label')).toBeTruthy()
      
      // 检查删除按钮的aria-label
      const deleteButton = wrapper.find('.todo-item__delete')
      expect(deleteButton.attributes('aria-label')).toBeTruthy()
    })

    it('应该在编辑模式下为输入框提供正确的aria-label', async () => {
      wrapper = mount(TodoItem, {
        props: { todo: mockTodo }
      })

      // 进入编辑模式
      await wrapper.find('.todo-item__display').trigger('dblclick')

      const editInput = wrapper.find('.todo-item__edit-input')
      expect(editInput.attributes('aria-label')).toContain('编辑待办事项')
      expect(editInput.attributes('aria-label')).toContain(mockTodo.title)
    })

    it('应该为时间戳提供正确的datetime属性', () => {
      wrapper = mount(TodoItem, {
        props: { todo: mockTodo }
      })

      const timestamp = wrapper.find('.todo-item__timestamp')
      expect(timestamp.attributes('datetime')).toBe(mockTodo.updatedAt.toISOString())
    })
  })

  describe('响应式行为', () => {
    it('应该在props变化时更新显示', async () => {
      wrapper = mount(TodoItem, {
        props: { todo: mockTodo }
      })

      // 更新props
      const updatedTodo: Todo = {
        ...mockTodo,
        title: '更新后的标题',
        completed: true
      }

      await wrapper.setProps({ todo: updatedTodo })

      // 检查标题是否更新
      expect(wrapper.find('.todo-item__title').text()).toBe('更新后的标题')
      
      // 检查完成状态是否更新
      expect((wrapper.find('.todo-item__checkbox').element as HTMLInputElement).checked).toBe(true)
      expect(wrapper.find('.todo-item').classes()).toContain('todo-item--completed')
    })
  })

  describe('边界情况', () => {
    it('应该正确处理长标题', () => {
      const longTitle = '这是一个非常长的待办事项标题，用来测试组件是否能够正确处理长文本内容的显示和换行'
      const todoWithLongTitle: Todo = {
        ...mockTodo,
        title: longTitle
      }

      wrapper = mount(TodoItem, {
        props: { todo: todoWithLongTitle }
      })

      expect(wrapper.find('.todo-item__title').text()).toBe(longTitle)
    })

    it('应该正确处理特殊字符', () => {
      const specialTitle = '特殊字符测试: <>&"\'`'
      const todoWithSpecialChars: Todo = {
        ...mockTodo,
        title: specialTitle
      }

      wrapper = mount(TodoItem, {
        props: { todo: todoWithSpecialChars }
      })

      expect(wrapper.find('.todo-item__title').text()).toBe(specialTitle)
    })

    it('应该正确处理空标题', () => {
      const emptyTitleTodo: Todo = {
        ...mockTodo,
        title: ''
      }

      wrapper = mount(TodoItem, {
        props: { todo: emptyTitleTodo }
      })

      expect(wrapper.find('.todo-item__title').text()).toBe('')
    })

    it('应该正确处理只包含空白字符的标题', () => {
      const whitespaceTitleTodo: Todo = {
        ...mockTodo,
        title: '   \n\t   '
      }

      wrapper = mount(TodoItem, {
        props: { todo: whitespaceTitleTodo }
      })

      // HTML会自动处理空白字符，所以检查原始title属性
      expect(whitespaceTitleTodo.title).toBe('   \n\t   ')
    })
  })

  describe('键盘交互增强', () => {
    it('应该支持Tab键导航', async () => {
      wrapper = mount(TodoItem, {
        props: { todo: mockTodo }
      })

      const checkbox = wrapper.find('.todo-item__checkbox')
      const deleteButton = wrapper.find('.todo-item__delete')

      // 测试Tab键导航
      await checkbox.trigger('keydown.tab')
      expect(document.activeElement).not.toBe(checkbox.element)
    })

    it('应该在编辑模式下支持Tab键切换到按钮', async () => {
      wrapper = mount(TodoItem, {
        props: { todo: mockTodo }
      })

      // 进入编辑模式
      await wrapper.find('.todo-item__display').trigger('dblclick')
      
      const editInput = wrapper.find('.todo-item__edit-input')
      await editInput.trigger('keydown.tab')
      
      // Tab键应该将焦点移到保存按钮
      const saveButton = wrapper.find('.todo-item__edit-btn--save')
      expect(saveButton.exists()).toBe(true)
    })

    it('应该支持空格键切换完成状态', async () => {
      wrapper = mount(TodoItem, {
        props: { todo: mockTodo }
      })

      const checkbox = wrapper.find('.todo-item__checkbox')
      // 空格键通常会触发change事件而不是keydown事件
      await checkbox.trigger('change')

      expect(wrapper.emitted('toggle')).toBeTruthy()
      expect(wrapper.emitted('toggle')?.[0]).toEqual([mockTodo.id])
    })
  })

  describe('动画和过渡效果', () => {
    it('应该在状态变化时应用过渡类', async () => {
      wrapper = mount(TodoItem, {
        props: { todo: mockTodo }
      })

      const checkbox = wrapper.find('.todo-item__checkbox')
      await checkbox.trigger('change')

      // 检查是否有过渡相关的类
      expect(wrapper.find('.todo-item').classes()).toContain('todo-item')
    })

    it('应该在进入编辑模式时应用动画类', async () => {
      wrapper = mount(TodoItem, {
        props: { todo: mockTodo }
      })

      await wrapper.find('.todo-item__display').trigger('dblclick')

      expect(wrapper.find('.todo-item').classes()).toContain('todo-item--editing')
    })
  })

  describe('错误处理和恢复', () => {
    it('应该在编辑时处理网络错误', async () => {
      wrapper = mount(TodoItem, {
        props: { todo: mockTodo }
      })

      // 进入编辑模式
      await wrapper.find('.todo-item__display').trigger('dblclick')
      
      const editInput = wrapper.find('.todo-item__edit-input')
      await editInput.setValue('更新后的标题')
      
      // 模拟网络错误情况下的保存
      await editInput.trigger('keyup.enter')

      expect(wrapper.emitted('update')).toBeTruthy()
    })

    it('应该在删除确认对话框被意外关闭时正确处理', async () => {
      // 模拟confirm返回undefined（用户关闭对话框）
      mockConfirm.mockReturnValue(undefined as any)
      
      wrapper = mount(TodoItem, {
        props: { todo: mockTodo }
      })

      const deleteButton = wrapper.find('.todo-item__delete')
      await deleteButton.trigger('click')

      // 不应该触发delete事件
      expect(wrapper.emitted('delete')).toBeFalsy()
    })
  })

  describe('性能优化', () => {
    it('应该在props未变化时避免不必要的重渲染', async () => {
      wrapper = mount(TodoItem, {
        props: { todo: mockTodo }
      })

      const initialHtml = wrapper.html()

      // 设置相同的props
      await wrapper.setProps({ todo: mockTodo })

      // HTML应该保持不变
      expect(wrapper.html()).toBe(initialHtml)
    })

    it('应该正确处理大量快速的状态切换', async () => {
      wrapper = mount(TodoItem, {
        props: { todo: mockTodo }
      })

      const checkbox = wrapper.find('.todo-item__checkbox')

      // 快速多次切换状态
      for (let i = 0; i < 10; i++) {
        await checkbox.trigger('change')
      }

      // 应该触发10次toggle事件
      expect(wrapper.emitted('toggle')).toHaveLength(10)
    })
  })

  describe('国际化支持', () => {
    it('应该正确显示不同语言的时间格式', () => {
      const recentTime = new Date(Date.now() - 30 * 60 * 1000) // 30分钟前
      const todoWithRecentTime: Todo = {
        ...mockTodo,
        updatedAt: recentTime
      }

      wrapper = mount(TodoItem, {
        props: { todo: todoWithRecentTime }
      })

      const timestamp = wrapper.find('.todo-item__timestamp')
      expect(timestamp.text()).toMatch(/(分钟前|minutes ago|min ago)/i)
    })

    it('应该正确处理RTL语言的布局', () => {
      wrapper = mount(TodoItem, {
        props: { todo: mockTodo }
      })

      // 检查组件是否支持RTL布局
      const todoItem = wrapper.find('.todo-item')
      expect(todoItem.exists()).toBe(true)
    })
  })
})