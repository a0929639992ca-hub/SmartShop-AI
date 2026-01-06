import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  // Load env file based on `mode` in the current working directory.
  const env = loadEnv(mode, (process as any).cwd(), '');

  // 修正：優先讀取 VITE_API_KEY (Vercel/Vite 常用慣例)，若無則讀取 API_KEY
  const apiKey = env.VITE_API_KEY || env.API_KEY || '';

  return {
    plugins: [react()],
    define: {
      // 將抓到的 key 注入到 process.env.API_KEY，讓前端程式碼可以使用
      'process.env.API_KEY': JSON.stringify(apiKey),
    },
  };
});