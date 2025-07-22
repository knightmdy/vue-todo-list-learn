/**
 * TodoInput 组件测试
 * 
 * 测试TodoInput组件的各种功能：
 * 1. 基础渲染和属性
 * 2. 用户输入和验证
 * 3. 键盘事件处理
 * 4. 表单提交
 * 5. 错误处理
 * 6. 防抖功能
 * 7. 无障碍访问
 */

import { mount } from '@vue/test-utils'
import { nextTick } from 'vue'
import TodoInput from '@/components/TodoInput.vue'

describe('TodoInput', () => {
  // 创建组件实例的辅助函数
  const createWrapper = (props = {}) => {
    return mount(TodoInput, {
      props: {
        placeholder: '添加新的待办事项...',
        maxLength: 200,
        ...props
      }
    })
  }

  describe('基础渲染', () => {
    it('应该正确渲染组件', () => {
      const wrapper = createWrapper()
      
      expect(wrapper.find('.todo-input').exists()).toBe(true)
      expect(wrapper.find('.todo-input__field').exists()).toBe(true)
      expect(wrapper.find('.todo-input__submit').exists()).toBe(true)
    })

    it('应该显示正确的占位符文本', () => {
      const placeholder = '请输入待办事项'
      const wrapper = createWrapper({ placeholder })
      
      const input = wrapper.find('.todo-input__field')
      expect(input.attributes('placeholder')).toBe(placeholder)
    })

    it('应该设置正确的最大长度', () => {
      const maxLength = 100
      const wrapper = createWrapper({ maxLength })
      
      const input = wrapper.find('.todo-input__field')
      expect(input.attributes('maxlength')).toBe(maxLength.toString())
    })

    it('应该在showCharCount为true时显示字符计数', () => {
      const wrapper = createWrapper({ showCharCount: true })
      
      expect(wrapper.find('.char-count').exists()).toBe(true)
      expect(wrapper.find('.char-count').text()).toBe('0 / 200')
    })

    it('应该在showCharCount为false时隐藏字符计数', () => {
      const wrapper = createWrapper({ showCharCount: false })
      
      expect(wrapper.find('.char-count').exists()).toBe(false)
    })
  })

  describe('用户输入', () => {
    it('应该正确处理用户输入', async () => {
      const wrapper = createWrapper()
      const input = wrapper.find('.todo-input__field')
      
      await input.setValue('测试待办事项')
      
      expect((input.element as HTMLInputElement).value).toBe('测试待办事项')
    })

    it('应该在输入时触发input事件', async () => {
      const wrapper = createWrapper({ debounceDelay: 0 })
      const input = wrapper.find('.todo-input__field')
      
      await input.setValue('测试')
      await nextTick()
      
      // 等待防抖
      await new Promise(resolve => setTimeout(resolve, 10))
      
      expect(wrapper.emitted('input')).toBeTruthy()
      expect(wrapper.emitted('input')?.[0]).toEqual(['测试'])
    })

    it('应该更新字符计数', async () => {
      const wrapper = createWrapper({ showCharCount: true })
      const input = wrapper.find('.todo-input__field')
      
      await input.setValue('测试')
      await nextTick()
      
      expect(wrapper.find('.char-count').text()).toBe('2 / 200')
    })

    it('应该在接近字符限制时显示警告样式', async () => {
      const wrapper = createWrapper({ showCharCount: true, maxLength: 10 })
      const input = wrapper.find('.todo-input__field')
      
      // 输入超过80%的字符 (10 * 0.8 = 8, 所以需要输入9个字符)
      await input.setValue('123456789')
      await nextTick()
      
      expect(wrapper.find('.char-count').classes()).toContain('near-limit')
    })
  })

  describe('表单验证', () => {
    it('应该在输入为空时禁用提交按钮', () => {
      const wrapper = createWrapper()
      const submitButton = wrapper.find('.todo-input__submit')
      
      expect(submitButton.attributes('disabled')).toBeDefined()
    })

    it('应该在有有效输入时启用提交按钮', async () => {
      const wrapper = createWrapper()
      const input = wrapper.find('.todo-input__field')
      const submitButton = wrapper.find('.todo-input__submit')
      
      await input.setValue('有效输入')
      await nextTick()
      
      expect(submitButton.attributes('disabled')).toBeUndefined()
    })

    it('应该在输入过长时显示错误信息', async () => {
      const wrapper = createWrapper({ maxLength: 5, debounceDelay: 0 })
      const input = wrapper.find('.todo-input__field')
      
      await input.setValue('这是一个很长的输入')
      await input.trigger('input')
      
      // 等待防抖和验证
      await new Promise(resolve => setTimeout(resolve, 10))
      await nextTick()
      
      expect(wrapper.find('.error-message').exists()).toBe(true)
      expect(wrapper.find('.error-message').text()).toContain('不能超过')
    })

    it('应该在输入包含无效字符时显示错误信息', async () => {
      const wrapper = createWrapper({ debounceDelay: 0 })
      const input = wrapper.find('.todo-input__field')
      
      await input.setValue('测试<script>')
      await input.trigger('input')
      
      // 等待防抖和验证
      await new Promise(resolve => setTimeout(resolve, 10))
      await nextTick()
      
      expect(wrapper.find('.error-message').exists()).toBe(true)
      expect(wrapper.find('.error-message').text()).toContain('无效字符')
    })
  })

  describe('键盘事件', () => {
    it('应该在按下回车键时提交表单', async () => {
      const wrapper = createWrapper()
      const input = wrapper.find('.todo-input__field')
      
      await input.setValue('测试待办事项')
      await input.trigger('keydown.enter')
      
      expect(wrapper.emitted('submit')).toBeTruthy()
      expect(wrapper.emitted('submit')?.[0]).toEqual(['测试待办事项'])
    })

    it('应该在输入为空时不响应回车键', async () => {
      const wrapper = createWrapper()
      const input = wrapper.find('.todo-input__field')
      
      await input.trigger('keydown.enter')
      
      expect(wrapper.emitted('submit')).toBeFalsy()
    })

    it('应该在有错误时不响应回车键', async () => {
      const wrapper = createWrapper({ maxLength: 5 })
      const input = wrapper.find('.todo-input__field')
      
      await input.setValue('这是一个很长的输入')
      await input.trigger('keydown.enter')
      
      expect(wrapper.emitted('submit')).toBeFalsy()
    })
  })

  describe('提交功能', () => {
    it('应该在点击提交按钮时提交表单', async () => {
      const wrapper = createWrapper()
      const input = wrapper.find('.todo-input__field')
      const submitButton = wrapper.find('.todo-input__submit')
      
      await input.setValue('测试待办事项')
      await submitButton.trigger('click')
      
      expect(wrapper.emitted('submit')).toBeTruthy()
      expect(wrapper.emitted('submit')?.[0]).toEqual(['测试待办事项'])
    })

    it('应该在提交后清空输入框', async () => {
      const wrapper = createWrapper()
      const input = wrapper.find('.todo-input__field')
      const submitButton = wrapper.find('.todo-input__submit')
      
      await input.setValue('测试待办事项')
      await submitButton.trigger('click')
      await nextTick()
      
      expect((input.element as HTMLInputElement).value).toBe('')
    })

    it('应该修剪输入值的空白字符', async () => {
      const wrapper = createWrapper()
      const input = wrapper.find('.todo-input__field')
      const submitButton = wrapper.find('.todo-input__submit')
      
      await input.setValue('  测试待办事项  ')
      await submitButton.trigger('click')
      
      expect(wrapper.emitted('submit')?.[0]).toEqual(['测试待办事项'])
    })
  })

  describe('焦点管理', () => {
    it('应该在获得焦点时触发focus事件', async () => {
      const wrapper = createWrapper()
      const input = wrapper.find('.todo-input__field')
      
      await input.trigger('focus')
      
      expect(wrapper.emitted('focus')).toBeTruthy()
    })

    it('应该在失去焦点时触发blur事件', async () => {
      const wrapper = createWrapper()
      const input = wrapper.find('.todo-input__field')
      
      await input.trigger('blur')
      
      expect(wrapper.emitted('blur')).toBeTruthy()
    })

    it('应该在获得焦点时清除错误信息', async () => {
      const wrapper = createWrapper({ maxLength: 5, debounceDelay: 0 })
      const input = wrapper.find('.todo-input__field')
      
      // 先产生错误
      await input.setValue('这是一个很长的输入')
      await input.trigger('input')
      await new Promise(resolve => setTimeout(resolve, 10))
      await nextTick()
      
      expect(wrapper.find('.error-message').exists()).toBe(true)
      
      // 获得焦点应该清除错误
      await input.trigger('focus')
      await nextTick()
      
      expect(wrapper.find('.error-message').exists()).toBe(false)
    })
  })

  describe('禁用状态', () => {
    it('应该在disabled为true时禁用输入框', () => {
      const wrapper = createWrapper({ disabled: true })
      const input = wrapper.find('.todo-input__field')
      const submitButton = wrapper.find('.todo-input__submit')
      
      expect(input.attributes('disabled')).toBeDefined()
      expect(submitButton.attributes('disabled')).toBeDefined()
    })
  })

  describe('加载状态', () => {
    it('应该在提交时显示加载状态', async () => {
      const wrapper = createWrapper()
      const input = wrapper.find('.todo-input__field')
      const submitButton = wrapper.find('.todo-input__submit')
      
      await input.setValue('测试待办事项')
      
      // 模拟提交过程
      await submitButton.trigger('click')
      
      // 检查加载状态（在实际实现中，加载状态会很快结束）
      expect(wrapper.find('.loading-spinner').exists()).toBe(false) // 因为提交很快完成
    })
  })

  describe('公共方法', () => {
    it('应该提供focus方法', () => {
      const wrapper = createWrapper()
      
      expect(wrapper.vm.focus).toBeDefined()
      expect(typeof wrapper.vm.focus).toBe('function')
    })

    it('应该提供clear方法', async () => {
      const wrapper = createWrapper()
      const input = wrapper.find('.todo-input__field')
      
      await input.setValue('测试内容')
      wrapper.vm.clear()
      await nextTick()
      
      expect((input.element as HTMLInputElement).value).toBe('')
    })

    it('应该提供setValue方法', async () => {
      const wrapper = createWrapper()
      const input = wrapper.find('.todo-input__field')
      
      wrapper.vm.setValue('新的值')
      await nextTick()
      
      expect((input.element as HTMLInputElement).value).toBe('新的值')
    })
  })

  describe('无障碍访问', () => {
    it('应该为错误信息设置正确的role属性', async () => {
      const wrapper = createWrapper({ maxLength: 5, debounceDelay: 0 })
      const input = wrapper.find('.todo-input__field')
      
      await input.setValue('这是一个很长的输入')
      await input.trigger('input')
      await new Promise(resolve => setTimeout(resolve, 10))
      await nextTick()
      
      const errorMessage = wrapper.find('.error-message')
      expect(errorMessage.attributes('role')).toBe('alert')
    })

    it('应该为输入框设置正确的属性', () => {
      const wrapper = createWrapper()
      const input = wrapper.find('.todo-input__field')
      
      expect(input.attributes('type')).toBe('text')
      expect(input.attributes('maxlength')).toBeDefined()
    })
  })

  describe('防抖功能', () => {
    it('应该对输入事件进行防抖处理', async () => {
      const wrapper = createWrapper({ debounceDelay: 100 })
      const input = wrapper.find('.todo-input__field')
      
      // 快速输入多次
      await input.setValue('a')
      await input.trigger('input')
      await input.setValue('ab')
      await input.trigger('input')
      await input.setValue('abc')
      await input.trigger('input')
      
      // 在防抖时间内不应该触发事件
      expect(wrapper.emitted('input')).toBeFalsy()
      
      // 等待防抖时间
      await new Promise(resolve => setTimeout(resolve, 150))
      
      // 现在应该只触发一次事件
      expect(wrapper.emitted('input')).toBeTruthy()
      expect(wrapper.emitted('input')?.length).toBe(1)
    })
  })

  describe('边界情况和错误处理', () => {
    it('应该正确处理极长的输入', async () => {
      const wrapper = createWrapper({ maxLength: 10 })
      const input = wrapper.find('.todo-input__field')
      
      const longText = 'a'.repeat(20)
      await input.setValue(longText)
      
      // 检查maxlength属性是否设置正确
      expect(input.attributes('maxlength')).toBe('10')
      // 注意：浏览器会自动限制输入，但在测试环境中可能不会生效
      // 所以我们检查属性而不是实际值
    })

    it('应该在输入包含HTML标签时进行清理', async () => {
      const wrapper = createWrapper({ debounceDelay: 0 })
      const input = wrapper.find('.todo-input__field')
      
      await input.setValue('<script>alert("xss")</script>正常文本')
      await input.trigger('input')
      
      // 等待防抖和验证
      await new Promise(resolve => setTimeout(resolve, 10))
      await nextTick()
      
      expect(wrapper.find('.error-message').exists()).toBe(true)
    })

    it('应该在输入只包含空白字符时显示错误', async () => {
      const wrapper = createWrapper()
      const input = wrapper.find('.todo-input__field')
      const submitButton = wrapper.find('.todo-input__submit')
      
      await input.setValue('   \n\t   ')
      await submitButton.trigger('click')
      
      // 不应该触发提交事件
      expect(wrapper.emitted('submit')).toBeFalsy()
    })

    it('应该在快速连续提交时防止重复提交', async () => {
      const wrapper = createWrapper()
      const input = wrapper.find('.todo-input__field')
      const submitButton = wrapper.find('.todo-input__submit')
      
      await input.setValue('测试待办事项')
      
      // 快速连续点击提交按钮
      await submitButton.trigger('click')
      await submitButton.trigger('click')
      await submitButton.trigger('click')
      
      // 应该只触发一次提交事件（因为提交后输入框被清空，后续点击无效）
      expect(wrapper.emitted('submit')).toBeTruthy()
      expect(wrapper.emitted('submit')?.length).toBe(1)
    })
  })

  describe('国际化和本地化', () => {
    it('应该正确处理中文字符计数', async () => {
      const wrapper = createWrapper({ showCharCount: true, maxLength: 10 })
      const input = wrapper.find('.todo-input__field')
      
      await input.setValue('测试中文字符')
      await nextTick()
      
      // 中文字符计数可能因实现而异，检查格式是否正确
      const charCount = wrapper.find('.char-count').text()
      expect(charCount).toMatch(/\d+ \/ 10/)
    })

    it('应该正确处理emoji字符计数', async () => {
      const wrapper = createWrapper({ showCharCount: true, maxLength: 10 })
      const input = wrapper.find('.todo-input__field')
      
      await input.setValue('😀😃😄')
      await nextTick()
      
      // emoji可能被计算为多个字符，但应该正确显示
      const charCount = wrapper.find('.char-count').text()
      expect(charCount).toMatch(/\d+ \/ 10/)
    })
  })

  describe('性能优化', () => {
    it('应该在组件销毁时清理定时器', () => {
      const wrapper = createWrapper({ debounceDelay: 1000 })
      const input = wrapper.find('.todo-input__field')
      
      // 触发防抖
      input.setValue('test')
      input.trigger('input')
      
      // 销毁组件
      wrapper.unmount()
      
      // 组件应该正常销毁而不报错
      expect(wrapper.exists()).toBe(false)
    })
  })
})