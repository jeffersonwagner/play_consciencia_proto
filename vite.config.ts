import { defineConfig } from 'vite';
import { viteSingleFile } from 'vite-plugin-singlefile';

// A build gera um único index.html (JS, CSS e fontes embutidos) + a pasta
// assets/ ao lado. Assim, dist/ funciona tanto hospedado (GitHub Pages)
// quanto aberto direto do disco/pendrive em laboratório, sem internet.
// `vite build --mode pesquisa` gera a versão de coleta de dados em
// dist-pesquisa/ (ver .env.pesquisa e docs/CICLO1.md).
export default defineConfig(({ mode }) => ({
  base: './',
  plugins: [viteSingleFile()],
  define: {
    __APP_VERSION__: JSON.stringify(process.env.npm_package_version ?? 'dev'),
  },
  build: {
    outDir: mode === 'pesquisa' ? 'dist-pesquisa' : 'dist',
  },
}));
