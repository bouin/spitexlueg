import { defineConfig } from 'vite';
import path from 'path';

export default defineConfig({
    build: {
        outDir: 'Resources/Public/Assets/Dist',
        emptyOutDir: true,
        manifest: true,
        // TYPO3 serves this folder from /_assets/<hash>/…, which vite does not
        // know about. Its generated preload/CSS URLs would be resolved against
        // base "/" and 404, so:
        //  - keep all CSS in the single app.css that TypoScript includes,
        //  - drop modulepreload, so dynamic import() uses plain relative
        //    specifiers, which the browser resolves correctly on its own.
        cssCodeSplit: false,
        modulePreload: false,
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
                        // With cssCodeSplit disabled vite names the single
                        // bundle "style.css"; keep it as app.css, which is what
                        // TypoScript includes.
                        return fileName === 'style.css' ? 'Css/app.css' : 'Css/[name][extname]';
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