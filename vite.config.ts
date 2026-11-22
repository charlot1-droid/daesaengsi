import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: { host: true }, // 같은 Wi-Fi의 휴대폰으로 리허설할 때 필요
});
