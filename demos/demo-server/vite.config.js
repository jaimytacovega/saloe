import { defineConfig } from 'vite'


export default defineConfig({
    define: {
        __ENV__: `'${process.env.ENV}'`,
        __BUILD_TIME__: `'${new Date().toISOString()}'`,
        __APP_NAME__: `'demo-server'`,
    },
    plugins: [],
    build: {
        outDir: './dist',
        manifest: true,
        emptyOutDir: true,
        minify: false,
        rollupOptions: {
            input: {},
            output: {
                entryFileNames: `[name].js`,
                chunkFileNames: `[name].js`,
                assetFileNames: `[name].[ext]`,
            },
        },
    },
})