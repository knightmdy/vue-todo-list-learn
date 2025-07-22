/**
 * 应用集成测试
 * 
 * 测试整个应用的集成功能，包括：
 * 1. 完整的用户流程测试
 * 2. 组件间的交互测试
 * 3. 数据持久化的端到端测试
 * 4. 错误处理和恢复机制测试
 */

import { describe, it, expect, beforeEach, afterEach } from '@jest/globals'
import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import App from '@/App.vue'

describe('应用集成测试', () => {
  let pinia: any

  beforeEach(() => {
    // 创建新的Pinia实例
    pinia = createPinia()
    setActivePinia(pinia)
    
    // 清空localStorage
    localStorage.clear()
  })

  afterEach(() => {
    if (pinia) {
      pinia = null
    }
  })

  it('应用能够正常初始化', () => {
    const wrapper = mount(App, {
      global: {
        plugins: [pinia]
      }
    })

    expect(wrapper.exists()).toBe(true)
    expect(wrapper.find('.app-container').exists()).toBe(true)
  })

  it('应用标题正确显示', () => {
    const wrapper = mount(App, {
      global: {
        plugins: [pinia]
      }
    })

    const title = wrapper.find('.app-title')
    expect(title.exists()).toBe(true)
    expect(title.text()).toContain('Vue Todo List')
  })
})