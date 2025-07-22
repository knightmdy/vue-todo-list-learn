/**
 * TodoFilter组件测试
 * 
 * 测试TodoFilter组件的所有功能：
 * 1. 基础渲染和过滤器选项显示
 * 2. 过滤器切换功能
 * 3. 数量统计显示
 * 4. 激活状态的视觉反馈
 * 5. 键盘交互支持
 * 6. 无障碍访问功能
 * 7. 响应式行为
 */

import { describe, it, expect, jest, beforeEach } from '@jest/globals'
import { mount, VueWrapper } from '@vue/test-utils'
import TodoFilter from '@/components/TodoFilter.vue'
import type { FilterType } from '@/types/todo'

describe('TodoFilter组件', () => {
  // 默认props
  const defaultProps = {
    currentFilter: 'all' as FilterType,
    totalCount: 10,
    completedCount: 4,
    activeCount: 6,
    showStats: true
  }

  let wrapper: VueWrapper<any>

  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('基础渲染', () => {
    it('应该正确渲染过滤器标题', () => {
      wrapper = mount(TodoFilter, {
        props: defaultProps
      })

      const title = wrapper.find('.todo-filter__title')
      expect(title.exists()).toBe(true)
      expect(title.text()).toBe('筛选待办事项')
    })

    it('应该渲染所有过滤器选项', () => {
      wrapper = mount(TodoFilter, {
        props: defaultProps
      })

      const options = wrapper.findAll('.todo-filter__option')
      expect(options).toHaveLength(3)

      // 检查选项标签
      const labels = options.map(option => 
        option.find('.todo-filter__option-label').text()
      )
      expect(labels).toEqual(['全部', '未完成', '已完成'])
    })

    it('应该显示每个过滤器对应的数量', () => {
      wrapper = mount(TodoFilter, {
        props: defaultProps
      })

      const counts = wrapper.findAll('.todo-filter__option-count')
      expect(counts).toHaveLength(3)

      // 检查数量显示
      expect(counts[0].text()).toBe('10') // 全部
      expect(counts[1].text()).toBe('6')  // 未完成
      expect(counts[2].text()).toBe('4')  // 已完成
    })

    it('应该高亮显示当前激活的过滤器', () => {
      wrapper = mount(TodoFilter, {
        props: {
          ...defaultProps,
          currentFilter: 'active'
        }
      })

      const options = wrapper.findAll('.todo-filter__option')
      
      // 检查激活状态
      expect(options[0].classes()).not.toContain('todo-filter__option--active') // 全部
      expect(options[1].classes()).toContain('todo-filter__option--active')     // 未完成
      expect(options[2].classes()).not.toContain('todo-filter__option--active') // 已完成
    })

    it('应该为激活的过滤器数量徽章应用特殊样式', () => {
      wrapper = mount(TodoFilter, {
        props: {
          ...defaultProps,
          currentFilter: 'completed'
        }
      })

      const counts = wrapper.findAll('.todo-filter__option-count')
      
      // 检查激活状态的数量徽章
      expect(counts[0].classes()).not.toContain('todo-filter__option-count--active') // 全部
      expect(counts[1].classes()).not.toContain('todo-filter__option-count--active') // 未完成
      expect(counts[2].classes()).toContain('todo-filter__option-count--active')     // 已完成
    })
  })

  describe('统计信息显示', () => {
    it('应该在showStats为true时显示统计信息', () => {
      wrapper = mount(TodoFilter, {
        props: {
          ...defaultProps,
          showStats: true
        }
      })

      const stats = wrapper.find('.todo-filter__stats')
      expect(stats.exists()).toBe(true)

      const statItems = wrapper.findAll('.todo-filter__stat')
      expect(statItems).toHaveLength(4)
    })

    it('应该在showStats为false时隐藏统计信息', () => {
      wrapper = mount(TodoFilter, {
        props: {
          ...defaultProps,
          showStats: false
        }
      })

      const stats = wrapper.find('.todo-filter__stats')
      expect(stats.exists()).toBe(false)
    })

    it('应该正确显示统计数据', () => {
      wrapper = mount(TodoFilter, {
        props: defaultProps
      })

      const statValues = wrapper.findAll('.todo-filter__stat-value')
      
      expect(statValues[0].text()).toBe('10')  // 总计
      expect(statValues[1].text()).toBe('4')   // 已完成
      expect(statValues[2].text()).toBe('6')   // 未完成
      expect(statValues[3].text()).toBe('40%') // 完成率
    })

    it('应该正确计算完成率', () => {
      // 测试不同的完成率计算
      const testCases = [
        { total: 10, completed: 4, expected: '40%' },
        { total: 3, completed: 1, expected: '33%' },
        { total: 0, completed: 0, expected: '0%' },
        { total: 5, completed: 5, expected: '100%' }
      ]

      testCases.forEach(({ total, completed, expected }) => {
        wrapper = mount(TodoFilter, {
          props: {
            ...defaultProps,
            totalCount: total,
            completedCount: completed,
            activeCount: total - completed
          }
        })

        const completionRate = wrapper.findAll('.todo-filter__stat-value')[3]
        expect(completionRate.text()).toBe(expected)
      })
    })
  })

  describe('过滤器切换功能', () => {
    it('应该在点击过滤器选项时触发filter-change事件', async () => {
      wrapper = mount(TodoFilter, {
        props: defaultProps
      })

      const activeOption = wrapper.findAll('.todo-filter__option')[1] // 未完成
      await activeOption.trigger('click')

      // 检查是否触发了filter-change事件
      expect(wrapper.emitted('filter-change')).toBeTruthy()
      expect(wrapper.emitted('filter-change')?.[0]).toEqual(['active'])
    })

    it('应该在点击当前激活的过滤器时不触发事件', async () => {
      wrapper = mount(TodoFilter, {
        props: {
          ...defaultProps,
          currentFilter: 'all'
        }
      })

      const allOption = wrapper.findAll('.todo-filter__option')[0] // 全部
      await allOption.trigger('click')

      // 检查是否没有触发filter-change事件
      expect(wrapper.emitted('filter-change')).toBeFalsy()
    })

    it('应该支持键盘导航 - Enter键', async () => {
      wrapper = mount(TodoFilter, {
        props: defaultProps
      })

      const completedOption = wrapper.findAll('.todo-filter__option')[2] // 已完成
      await completedOption.trigger('keydown.enter')

      // 检查是否触发了filter-change事件
      expect(wrapper.emitted('filter-change')).toBeTruthy()
      expect(wrapper.emitted('filter-change')?.[0]).toEqual(['completed'])
    })

    it('应该支持键盘导航 - Space键', async () => {
      wrapper = mount(TodoFilter, {
        props: defaultProps
      })

      const activeOption = wrapper.findAll('.todo-filter__option')[1] // 未完成
      await activeOption.trigger('keydown.space')

      // 检查是否触发了filter-change事件
      expect(wrapper.emitted('filter-change')).toBeTruthy()
      expect(wrapper.emitted('filter-change')?.[0]).toEqual(['active'])
    })
  })

  describe('无障碍访问', () => {
    it('应该为过滤器选项容器提供正确的role和aria-label', () => {
      wrapper = mount(TodoFilter, {
        props: defaultProps
      })

      const optionsContainer = wrapper.find('.todo-filter__options')
      expect(optionsContainer.attributes('role')).toBe('tablist')
      expect(optionsContainer.attributes('aria-label')).toContain('过滤器选项')
      expect(optionsContainer.attributes('aria-label')).toContain('当前选中: 全部')
    })

    it('应该为每个过滤器选项提供正确的ARIA属性', () => {
      wrapper = mount(TodoFilter, {
        props: {
          ...defaultProps,
          currentFilter: 'active'
        }
      })

      const options = wrapper.findAll('.todo-filter__option')
      
      // 检查role属性
      options.forEach(option => {
        expect(option.attributes('role')).toBe('tab')
      })

      // 检查aria-pressed属性
      expect(options[0].attributes('aria-pressed')).toBe('false') // 全部
      expect(options[1].attributes('aria-pressed')).toBe('true')  // 未完成（激活）
      expect(options[2].attributes('aria-pressed')).toBe('false') // 已完成

      // 检查aria-label属性
      expect(options[0].attributes('aria-label')).toContain('全部，10项')
      expect(options[1].attributes('aria-label')).toContain('未完成，6项')
      expect(options[2].attributes('aria-label')).toContain('已完成，4项')
    })

    it('应该为过滤器选项提供title属性作为工具提示', () => {
      wrapper = mount(TodoFilter, {
        props: defaultProps
      })

      const options = wrapper.findAll('.todo-filter__option')
      
      expect(options[0].attributes('title')).toBe('显示所有待办事项')
      expect(options[1].attributes('title')).toBe('只显示未完成的待办事项')
      expect(options[2].attributes('title')).toBe('只显示已完成的待办事项')
    })
  })

  describe('响应式行为', () => {
    it('应该在props变化时更新显示', async () => {
      wrapper = mount(TodoFilter, {
        props: defaultProps
      })

      // 更新props
      await wrapper.setProps({
        currentFilter: 'completed',
        totalCount: 15,
        completedCount: 8,
        activeCount: 7
      })

      // 检查激活状态是否更新
      const options = wrapper.findAll('.todo-filter__option')
      expect(options[2].classes()).toContain('todo-filter__option--active')

      // 检查数量是否更新
      const counts = wrapper.findAll('.todo-filter__option-count')
      expect(counts[0].text()).toBe('15') // 全部
      expect(counts[1].text()).toBe('7')  // 未完成
      expect(counts[2].text()).toBe('8')  // 已完成

      // 检查统计信息是否更新
      const statValues = wrapper.findAll('.todo-filter__stat-value')
      expect(statValues[0].text()).toBe('15')  // 总计
      expect(statValues[1].text()).toBe('8')   // 已完成
      expect(statValues[2].text()).toBe('7')   // 未完成
      expect(statValues[3].text()).toBe('53%') // 完成率
    })

    it('应该在currentFilter变化时更新aria-label', async () => {
      wrapper = mount(TodoFilter, {
        props: defaultProps
      })

      // 更新当前过滤器
      await wrapper.setProps({
        currentFilter: 'completed'
      })

      const optionsContainer = wrapper.find('.todo-filter__options')
      expect(optionsContainer.attributes('aria-label')).toContain('当前选中: 已完成')
    })
  })

  describe('边界情况', () => {
    it('应该正确处理零数量的情况', () => {
      wrapper = mount(TodoFilter, {
        props: {
          currentFilter: 'all',
          totalCount: 0,
          completedCount: 0,
          activeCount: 0,
          showStats: true
        }
      })

      // 检查数量显示
      const counts = wrapper.findAll('.todo-filter__option-count')
      expect(counts[0].text()).toBe('0') // 全部
      expect(counts[1].text()).toBe('0') // 未完成
      expect(counts[2].text()).toBe('0') // 已完成

      // 检查完成率
      const statValues = wrapper.findAll('.todo-filter__stat-value')
      expect(statValues[3].text()).toBe('0%') // 完成率
    })

    it('应该正确处理大数量的情况', () => {
      wrapper = mount(TodoFilter, {
        props: {
          currentFilter: 'all',
          totalCount: 9999,
          completedCount: 5000,
          activeCount: 4999,
          showStats: true
        }
      })

      // 检查数量显示
      const counts = wrapper.findAll('.todo-filter__option-count')
      expect(counts[0].text()).toBe('9999') // 全部
      expect(counts[1].text()).toBe('4999') // 未完成
      expect(counts[2].text()).toBe('5000') // 已完成
    })

    it('应该正确处理不一致的数量（totalCount ≠ completedCount + activeCount）', () => {
      // 这种情况在实际应用中不应该发生，但组件应该能够处理
      wrapper = mount(TodoFilter, {
        props: {
          currentFilter: 'all',
          totalCount: 10,
          completedCount: 3,
          activeCount: 5, // 3 + 5 ≠ 10
          showStats: true
        }
      })

      // 组件应该显示传入的值，不进行验证
      const counts = wrapper.findAll('.todo-filter__option-count')
      expect(counts[0].text()).toBe('10') // 全部
      expect(counts[1].text()).toBe('5')  // 未完成
      expect(counts[2].text()).toBe('3')  // 已完成
    })
  })

  describe('事件处理', () => {
    it('应该正确处理所有过滤器类型的切换', async () => {
      wrapper = mount(TodoFilter, {
        props: {
          ...defaultProps,
          currentFilter: 'all'
        }
      })

      const options = wrapper.findAll('.todo-filter__option')

      // 测试切换到 'active'
      await options[1].trigger('click')
      expect(wrapper.emitted('filter-change')?.[0]).toEqual(['active'])

      // 重置组件状态
      await wrapper.setProps({ currentFilter: 'active' })

      // 测试切换到 'completed'
      await options[2].trigger('click')
      expect(wrapper.emitted('filter-change')?.[1]).toEqual(['completed'])

      // 重置组件状态
      await wrapper.setProps({ currentFilter: 'completed' })

      // 测试切换到 'all'
      await options[0].trigger('click')
      expect(wrapper.emitted('filter-change')?.[2]).toEqual(['all'])
    })

    it('应该在多次点击同一选项时只触发一次事件', async () => {
      wrapper = mount(TodoFilter, {
        props: {
          ...defaultProps,
          currentFilter: 'all'
        }
      })

      const activeOption = wrapper.findAll('.todo-filter__option')[1]

      // 第一次点击应该触发事件
      await activeOption.trigger('click')
      expect(wrapper.emitted('filter-change')).toHaveLength(1)

      // 更新props模拟状态变化
      await wrapper.setProps({ currentFilter: 'active' })

      // 再次点击同一选项不应该触发事件
      await activeOption.trigger('click')
      expect(wrapper.emitted('filter-change')).toHaveLength(1)
    })
  })
})