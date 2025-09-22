import { fileURLToPath, URL } from 'node:url'
import { defineConfig, loadEnv } from 'vite'
import vue from '@vitejs/plugin-vue'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  // 加载环境变量
  const env = loadEnv(mode, process.cwd(), '')
  
  return {
    plugins: [
      vue()
    ],
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url))
      },
    },
    server: {
      proxy: {
        // 安全代理到 OpenRouter，并在服务器侧注入密钥与必要请求头
        '/openrouter': {
          target: 'https://openrouter.ai',
          changeOrigin: true,
          secure: true,
          rewrite: (path) => path.replace(/^\/openrouter/, '/api/v1/chat/completions'),
          configure: (proxy, options) => {
            const apiKey = env.OPENROUTER_API_KEY
            
            proxy.on('proxyReq', (proxyReq, req) => {
               if (apiKey) {
                 const authHeader = `Bearer ${apiKey}`
                 proxyReq.setHeader('Authorization', authHeader)
               }
               
               // 推荐添加的识别头
               proxyReq.setHeader('HTTP-Referer', 'http://localhost')
               proxyReq.setHeader('X-Title', 'Kela Diary')
               proxyReq.setHeader('Content-Type', 'application/json')
               // 禁用压缩以便调试
               proxyReq.setHeader('Accept-Encoding', 'identity')
               
               console.log('Request headers:', proxyReq.getHeaders())
               
               // 记录请求体
               let body = ''
               req.on('data', chunk => {
                 body += chunk.toString()
               })
               req.on('end', () => {
                 console.log('OpenRouter Request Body:', body)
               })
             })
             
             proxy.on('proxyRes', (proxyRes, req, res) => {
               console.log('OpenRouter Response Status:', proxyRes.statusCode)
               console.log('OpenRouter Response Headers:', proxyRes.headers)
               
               const chunks = []
               proxyRes.on('data', (chunk) => {
                 chunks.push(chunk)
               })
               
               proxyRes.on('end', () => {
                 let responseBody = Buffer.concat(chunks)
                 
                 // 处理 gzip 压缩的响应
                 if (proxyRes.headers['content-encoding'] === 'gzip') {
                   const zlib = require('zlib')
                   try {
                     responseBody = zlib.gunzipSync(responseBody)
                   } catch (err) {
                     console.error('Failed to decompress gzip response:', err)
                   }
                 }
                 
                 console.log('OpenRouter Response Body:', responseBody.toString())
               })
               
               proxyRes.on('error', (err) => {
                 console.error('Proxy Response Error:', err)
               })
             })
             
             proxy.on('error', (err, req, res) => {
               console.error('Proxy Error:', err)
             })
           }
        }
      }
    }
  }
})
