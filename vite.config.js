import { defineConfig } from 'vite'
import typo3 from 'vite-plugin-typo3'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
    plugins: [
        // Discovers Configuration/ViteEntrypoints.json in all TYPO3 extensions,
        // sets outDir to public/_assets/vite/, enables the manifest and wires up
        // the DDEV dev server (host/port/origin come from ddev-vite-sidecar).
        typo3(),
        tailwindcss(),
    ],
})
