#!/usr/bin/env node

import fs from 'fs'
import path from 'path'
import { execSync } from 'child_process'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

console.log('🚀 开始构建性能分析...')

// 清理之前的构建文件
if (fs.existsSync('dist')) {
  fs.rmSync('dist', { recursive: true, force: true })
  console.log('✅ 清理旧的构建文件')
}

// 记录构建开始时间
const buildStartTime = Date.now()

try {
  // 执行构建
  console.log('📦 开始构建...')
  execSync('npx vite build', { stdio: 'inherit' })
  
  const buildEndTime = Date.now()
  const buildTime = ((buildEndTime - buildStartTime) / 1000).toFixed(2)
  
  console.log(`✅ 构建完成，耗时: ${buildTime}s`)
  
  // 分析构建结果
  console.log('📊 分析构建结果...')
  
  const distPath = path.join(__dirname, '../dist')
  const stats = analyzeBundle(distPath)
  
  // 生成报告
  generateReport(stats, buildTime)
  
  console.log('📈 构建报告已生成: dist/build-report.json')
  
} catch (error) {
  console.error('❌ 构建失败:', error.message)
  process.exit(1)
}

function analyzeBundle(distPath) {
  const stats = {
    totalSize: 0,
    gzipSize: 0,
    files: [],
    chunks: {
      js: [],
      css: [],
      assets: []
    }
  }
  
  function walkDir(dir, relativePath = '') {
    const files = fs.readdirSync(dir)
    
    files.forEach(file => {
      const filePath = path.join(dir, file)
      const relativeFilePath = path.join(relativePath, file)
      const stat = fs.statSync(filePath)
      
      if (stat.isDirectory()) {
        walkDir(filePath, relativeFilePath)
      } else {
        const size = stat.size
        stats.totalSize += size
        
        const fileInfo = {
          name: relativeFilePath,
          size: size,
          sizeFormatted: formatBytes(size)
        }
        
        stats.files.push(fileInfo)
        
        // 分类文件
        if (file.endsWith('.js')) {
          stats.chunks.js.push(fileInfo)
        } else if (file.endsWith('.css')) {
          stats.chunks.css.push(fileInfo)
        } else {
          stats.chunks.assets.push(fileInfo)
        }
      }
    })
  }
  
  walkDir(distPath)
  
  // 排序文件（按大小降序）
  stats.files.sort((a, b) => b.size - a.size)
  stats.chunks.js.sort((a, b) => b.size - a.size)
  stats.chunks.css.sort((a, b) => b.size - a.size)
  stats.chunks.assets.sort((a, b) => b.size - a.size)
  
  return stats
}

function generateReport(stats, buildTime) {
  const report = {
    buildTime: `${buildTime}s`,
    timestamp: new Date().toISOString(),
    summary: {
      totalFiles: stats.files.length,
      totalSize: formatBytes(stats.totalSize),
      jsFiles: stats.chunks.js.length,
      cssFiles: stats.chunks.css.length,
      assetFiles: stats.chunks.assets.length
    },
    chunks: {
      javascript: stats.chunks.js.map(file => ({
        name: file.name,
        size: file.sizeFormatted,
        sizeBytes: file.size
      })),
      css: stats.chunks.css.map(file => ({
        name: file.name,
        size: file.sizeFormatted,
        sizeBytes: file.size
      })),
      assets: stats.chunks.assets.map(file => ({
        name: file.name,
        size: file.sizeFormatted,
        sizeBytes: file.size
      }))
    },
    recommendations: generateRecommendations(stats)
  }
  
  // 保存报告
  fs.writeFileSync(
    path.join(__dirname, '../dist/build-report.json'),
    JSON.stringify(report, null, 2)
  )
  
  // 打印摘要
  console.log('\n📊 构建摘要:')
  console.log(`   总文件数: ${report.summary.totalFiles}`)
  console.log(`   总大小: ${report.summary.totalSize}`)
  console.log(`   JS文件: ${report.summary.jsFiles} 个`)
  console.log(`   CSS文件: ${report.summary.cssFiles} 个`)
  console.log(`   资源文件: ${report.summary.assetFiles} 个`)
  
  if (report.recommendations.length > 0) {
    console.log('\n💡 优化建议:')
    report.recommendations.forEach((rec, index) => {
      console.log(`   ${index + 1}. ${rec}`)
    })
  }
}

function generateRecommendations(stats) {
  const recommendations = []
  
  // 检查大文件
  const largeFiles = stats.files.filter(file => file.size > 500 * 1024) // 500KB
  if (largeFiles.length > 0) {
    recommendations.push(`发现 ${largeFiles.length} 个大文件(>500KB)，考虑进一步代码分割`)
  }
  
  // 检查JS文件数量
  if (stats.chunks.js.length > 10) {
    recommendations.push('JS文件数量较多，考虑合并小文件以减少HTTP请求')
  }
  
  // 检查总体积
  if (stats.totalSize > 2 * 1024 * 1024) { // 2MB
    recommendations.push('总体积较大，考虑启用Gzip压缩和资源优化')
  }
  
  return recommendations
}

function formatBytes(bytes, decimals = 2) {
  if (bytes === 0) return '0 Bytes'
  
  const k = 1024
  const dm = decimals < 0 ? 0 : decimals
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i]
}