import { defineConfig } from 'vite';
import { viteSingleFile } from 'vite-plugin-singlefile';

// A build gera um único index.html (JS, CSS e fontes embutidos) + a pasta
// assets/ ao lado. Assim, dist/ funciona tanto hospedado (GitHub Pages)
// quanto aberto direto do disco/pendrive em laboratório, sem internet.
export default defineConfig({
  base: './',
  plugins: [viteSingleFile()],
});
