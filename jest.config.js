export default {
  testEnvironment: 'jsdom',
  
  // 文件扩展名处理
  moduleFileExtensions: ['js', 'ts', 'json', 'vue'],
  
  // 转换配置
  transform: {
    '^.+\\.vue$': '@vue/vue3-jest',
    '^.+\\.(ts|tsx)$': ['ts-jest', {
      tsconfig: 'tsconfig.json'
    }],
    '^.+\\.(js|jsx)$': ['ts-jest', {
      tsconfig: 'tsconfig.json'
    }]
  },
  
  // 模块名映射
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1'
  },
  
  // 测试文件匹配模式
  testMatch: [
    '<rootDir>/tests/**/*.test.(js|ts)',
    '<rootDir>/src/**/__tests__/*.test.(js|ts)'
  ],
  
  // 覆盖率配置
  collectCoverageFrom: [
    'src/**/*.{ts,vue}',
    '!src/main.ts',
    '!src/**/*.d.ts',
    '!**/node_modules/**'
  ],
  
  // 覆盖率阈值
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80
    }
  },
  
  // 测试环境设置
  setupFilesAfterEnv: ['<rootDir>/tests/setup.ts'],
  
  // 忽略的文件
  testPathIgnorePatterns: ['/node_modules/', '/dist/'],
  
  // 清除模拟
  clearMocks: true,
  
  // 详细输出
  verbose: true,
  
  // Vue 3 Jest 配置
  testEnvironmentOptions: {
    customExportConditions: ['node', 'node-addons']
  },
  
  // 全局变量
  globals: {
    'vue-jest': {
      pug: {
        doctype: 'html'
      }
    }
  }
}