import { defineConfig } from 'vite'
import { resolve } from 'path'


export default defineConfig({
    build: {
        lib: {
            entry: {
                actions: resolve(__dirname, 'src/actions.js'),
                'cloudflare-kv': resolve(__dirname, 'src/cloudflare-kv.js'),
                'cloudflare-worker': resolve(__dirname, 'src/cloudflare-worker.js'),
                cookie: resolve(__dirname, 'src/cookie.js'),
                html: resolve(__dirname, 'src/html.js'),
                router: resolve(__dirname, 'src/router.js'),
                'urlpattern': resolve(__dirname, 'src/urlpattern.js'),
                util: resolve(__dirname, 'src/util.js'),
                vite: resolve(__dirname, 'src/vite.js'),
                worker: resolve(__dirname, 'src/worker.js'),
            },
            name: 'salo',
            fileName: (format) => `[name].${format}.js`,
        },
        rollupOptions: {
            external: ['fs', 'path', '@cloudflare/kv-asset-handler', 'urlpattern-polyfill'],
            output: {
                globals: {
                    fs: 'fs',
                    path: 'path',
                    '@cloudflare/kv-asset-handler': 'getAssetFromKV',
                    'urlpattern-polyfill': 'URLPatternPolyfill',
                },
            },
        },
    },
})