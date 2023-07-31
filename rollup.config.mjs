import svelte from 'rollup-plugin-svelte';
import resolve from '@rollup/plugin-node-resolve';
import autoPreprocess from 'svelte-preprocess'; // Import svelte-preprocess

export default {
  input: 'embed.js',
  output: {
    format: 'iife',
    file: 'dist.js',
    sourcemap: false,
  },
  plugins: [
    svelte({
      preprocess: autoPreprocess({ postcss: true }), // Use svelte-preprocess for processing CSS
      emitCss: false, // Set to false to prevent the default CSS extraction
    }),
    resolve({ browser: true, dedupe: ['svelte'] }),
  ],
};
