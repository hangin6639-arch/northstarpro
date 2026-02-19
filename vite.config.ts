import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
    // 모든 환경변수를 불러옵니다.
    const env = loadEnv(mode, '.', '');
    
    return {
      server: {
        port: 3000,
        host: '0.0.0.0',
      },
      plugins: [react()],
      define: {
        // openai 라이브러리가 브라우저에서 process.env.OPENAI_API_KEY를 찾을 수 있도록 매핑
        'process.env.OPENAI_API_KEY': JSON.stringify(env.VITE_OPENAI_API_KEY)
      },
      resolve: {
        alias: {
          '@': path.resolve(__dirname, '.'),
        }
      }
    };
});
