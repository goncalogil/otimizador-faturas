const esbuild = require('esbuild');

esbuild.build({
    entryPoints: ['src/index.ts', 'src/serviceWorker.ts', 'src/popup.ts'],
    outdir: 'dist',
    bundle: true,
    platform: 'browser',
    minify: true,
}).catch(() => process.exit(1));
