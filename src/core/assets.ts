// Converte IDs de assets usados no conteúdo em caminhos relativos a public/.
// Manter estas regras em um só lugar permite que o validador de conteúdo
// (tests/content.test.ts) confira se cada arquivo realmente existe.

export const assetPath = {
  sprite: (id: string) => `assets/characters/${id}.webp`,
  background: (id: string) => `assets/backgrounds/${id}.webp`,
  music: (id: string) => `assets/audio/music/${id}.mp3`,
  document: (id: string) => `assets/documents/${id}.webp`,
};

/** URL pública do asset, respeitando o `base` do Vite. */
export function assetUrl(path: string): string {
  return import.meta.env.BASE_URL + path;
}
