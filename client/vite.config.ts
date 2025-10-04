import type { UserConfigFnObject } from 'vite'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react';

export default defineConfig(() => {
    return {
        build: {
            outDir: 'build',
        },
        plugins: [react()],
    };
}) satisfies UserConfigFnObject
