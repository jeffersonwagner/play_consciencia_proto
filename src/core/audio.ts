// ============================================================
// MÚSICA
// Troca a faixa conforme a cena. Se a faixa for a mesma que já está
// tocando, não faz nada (continua sem reiniciar). Se for diferente
// (ou null), faz crossfade suave. Volume e mudo são configuração de
// sessão e não entram no save.
// ============================================================

export class MusicPlayer {
  private current: HTMLAudioElement | null = null;
  private currentTrack: string | null = null;
  volume = 0.35;   // 0.0 a 1.0
  muted = false;

  update(trackUrl: string | null): void {
    if (trackUrl === this.currentTrack) return;

    // Faz fade-out e remove a faixa antiga (se houver)
    if (this.current) fadeOut(this.current, 800);

    this.currentTrack = trackUrl;

    // Cena de silêncio: só para a anterior
    if (!trackUrl) {
      this.current = null;
      return;
    }

    // Cria nova faixa e faz fade-in
    const audio = new Audio(trackUrl);
    audio.loop = true;
    audio.volume = 0;
    this.current = audio;

    const target = this.muted ? 0 : this.volume;
    audio.play().then(() => fadeIn(audio, target, 800)).catch(err => {
      // Navegador bloqueou autoplay (antes da 1ª interação). Como o jogo
      // começa com clique, isso raramente ocorre; se ocorrer, a faixa
      // fica pronta para tocar no próximo gesto do usuário.
      console.warn('Autoplay bloqueado — música tocará após interação.', err);
    });
  }

  /** Recebe 0–100. Mexer no volume com o som mudo desfaz o mudo. */
  setVolume(percent: number): void {
    this.volume = percent / 100;
    if (this.muted && this.volume > 0) this.muted = false;
    if (this.current) this.current.volume = this.muted ? 0 : this.volume;
  }

  toggleMute(): boolean {
    this.muted = !this.muted;
    if (this.current) this.current.volume = this.muted ? 0 : this.volume;
    return this.muted;
  }

  stop(): void {
    if (this.current) {
      fadeOut(this.current, 600);
      this.current = null;
      this.currentTrack = null;
    }
  }
}

function fadeIn(audio: HTMLAudioElement, targetVol: number, duration: number): void {
  const steps = 20;
  let step = 0;
  const interval = setInterval(() => {
    step++;
    audio.volume = Math.min((targetVol / steps) * step, targetVol);
    if (step >= steps) clearInterval(interval);
  }, duration / steps);
}

function fadeOut(audio: HTMLAudioElement, duration: number): void {
  const startVol = audio.volume;
  const steps = 20;
  let step = 0;
  const interval = setInterval(() => {
    step++;
    audio.volume = Math.max(startVol - (startVol / steps) * step, 0);
    if (step >= steps) {
      clearInterval(interval);
      audio.pause();
      audio.src = '';
    }
  }, duration / steps);
}
