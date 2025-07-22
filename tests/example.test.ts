/**
 * 示例测试文件
 * 
 * 这个文件用于验证测试环境是否正确配置
 */

describe('项目初始化测试', () => {
  test('测试环境配置正确', () => {
    expect(true).toBe(true)
  })
  
  test('localStorage模拟正常工作', () => {
    localStorage.setItem('test', 'value')
    expect(localStorage.setItem).toHaveBeenCalledWith('test', 'value')
  })
})