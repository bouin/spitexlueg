import { defineConfig } from 'vite';
import path from 'path';

export default defineConfig({
    build: {
        outDir: 'Resources/Public/Assets/Dist',
        emptyOutDir: true,
        manifest: true,
        rollupOptions: {
            input: {
                app: path.resolve(__dirname, 'Resources/Public/Assets/Src/JavaScript/app.js'),
            },
            output: {
                entryFileNames: 'JavaScript/[name].js',
                chunkFileNames: 'JavaScript/[name].js',
                assetFileNames: (assetInfo) => {
                    const fileName = assetInfo.name ?? '';

                    if (fileName.endsWith('.css')) {
                        return 'Css/[name][extname]';
                    }

                    if (/\.(png|jpe?g|svg|gif|webp|avif)$/i.test(fileName)) {
                        return 'Images/[name][extname]';
                    }

                    if (/\.(woff2?|ttf|otf|eot)$/i.test(fileName)) {
                        return 'Fonts/[name][extname]';
                    }

                    return 'Assets/[name][extname]';
                },
            },
        },
    },
});