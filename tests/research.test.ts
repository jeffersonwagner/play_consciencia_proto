import { describe, expect, it } from 'vitest';
import { protagonists } from '../content/protagonists';
import { scenarios } from '../content/espelho/scenarios';
import { SaveStore, newFragmentos } from '../src/core/save';
import { prefixedStore, type KeyValueStore } from '../src/core/storage';
import { Telemetry } from '../src/core/telemetry';
import { newDossie } from '../src/modes/dossie/rules';
import { answer, newEspelho } from '../src/modes/espelho/rules';
import { newPonte } from '../src/modes/ponte/rules';
import { collectionStatus, loadConfig, parseConfig, type CollectionConfig } from '../src/research/collection';
import { SUMMARY_COLUMNS, eventsToCSV, modeMinutes, summaryCSV, summaryRows, toCSV } from '../src/research/export';
import { SessionStore, generateCode, newSession, sanitizeGroup } from '../src/research/session';
import { INSTRUMENTS, ciclo2PosJogo, ciclo2PreJogo, instrumentsFor, score, tcle } from '../content/research';
import { SyncQueue, appsScriptSender, type Batch, type SendResult } from '../src/research/sync';

function memoryStore(): KeyValueStore {
  const data = new Map<string, string>();
  return {
    getItem: k => data.get(k) ?? null,
    setItem: (k, v) => { data.set(k, v); },
    removeItem: k => { data.delete(k); },
  };
}

const session = (code = 'PNC-AB12') => newSession({
  code, group: 'Ciclo 1', appVersion: '0.5.0', tcleVersion: 'v1', requiredModes: [1, 2, 3], protagonist: 'julia',
  cycle: 1, audioConsent: 'Não', now: new Date('2026-12-02T13:00:00Z'),
});

describe('período da coleta', () => {
  const cfg = (over: Partial<CollectionConfig> = {}): CollectionConfig =>
    ({ ativa: true, inicio: '2026-12-01', fim: '2026-12-15', modos: [1, 2, 3], protagonista: 'julia', ciclo: 1, ...over });

  it('abre no primeiro dia e fecha no fim do último', () => {
    expect(collectionStatus(cfg(), new Date(2026, 10, 30, 23, 59))).toBe('antes');
    expect(collectionStatus(cfg(), new Date(2026, 11, 1, 0, 0))).toBe('aberta');
    expect(collectionStatus(cfg(), new Date(2026, 11, 15, 23, 59))).toBe('aberta');
    expect(collectionStatus(cfg(), new Date(2026, 11, 16, 0, 0))).toBe('encerrada');
  });

  it('desligada na planilha ou sem configuração', () => {
    expect(collectionStatus(cfg({ ativa: false }), new Date(2026, 11, 5))).toBe('inativa');
    expect(collectionStatus(null)).toBe('indisponivel');
  });

  it('lê a configuração da planilha (SIM/NÃO, modos em texto)', () => {
    expect(parseConfig({ ativa: 'SIM', inicio: '2026-12-01', fim: '2026-12-15', modos: '1, 2,3', protagonista: 'julia' }))
      .toMatchObject({ ativa: true, modos: [1, 2, 3], ciclo: 1 });
    expect(parseConfig({ ativa: 'SIM', inicio: '2026-12-01', fim: '2026-12-15', ciclo: '2' })).toMatchObject({ ciclo: 2, modos: [1, 2] });
    // Planilha em pt-BR pode transformar "1,2,3" em número com ponto
    expect(parseConfig({ ativa: 'SIM', inicio: '2026-12-01', fim: '2026-12-15', modos: '1.2.3' })?.modos).toEqual([1, 2, 3]);
    expect(parseConfig({ ativa: 'NÃO', inicio: '2026-12-01', fim: '2026-12-15' })?.ativa).toBe(false);
    expect(parseConfig({ ativa: 'SIM', inicio: '', fim: '' })).toBeNull();
  });

  it('sem internet, usa a última configuração guardada', async () => {
    const store = memoryStore();
    const ok = (async () => ({ json: async () => ({ ativa: 'SIM', inicio: '2026-12-01', fim: '2026-12-15' }) })) as unknown as typeof fetch;
    const offline = (async () => { throw new Error('offline'); }) as unknown as typeof fetch;
    expect((await loadConfig(store, 'https://x', ok)).fromCache).toBe(false);
    const cached = await loadConfig(store, 'https://x', offline);
    expect(cached).toMatchObject({ fromCache: true, config: { inicio: '2026-12-01' } });
    expect((await loadConfig(memoryStore(), 'https://x', offline)).config).toBeNull();
  });
});

describe('sessão do participante', () => {
  it('gera códigos sem caracteres ambíguos', () => {
    expect(generateCode(() => 0)).toBe('PNC-AAAA');
    for (let i = 0; i < 50; i++) expect(generateCode()).toMatch(/^PNC-[A-HJKMNP-Z2-9]{4}$/);
  });

  it('limpa o grupo vindo do link', () => {
    expect(sanitizeGroup('Turma A<script>')).toBe('Turma Ascript');
    expect(sanitizeGroup(null)).toBe('');
  });

  it('registra o aceite do TCLE e arquiva a participação ao encerrar', () => {
    const sessions = new SessionStore(memoryStore());
    sessions.start(session());
    expect(sessions.current()?.consent).toEqual({ acceptedAt: '2026-12-02T13:00:00.000Z', tcleVersion: 'v1' });
    sessions.update(s => { s.preDoneAt = 'x'; });
    expect(sessions.current()?.preDoneAt).toBe('x');
    sessions.close([], {});
    expect(sessions.current()).toBeNull();
    expect(sessions.archive()).toHaveLength(1);
  });

  it('a telemetria acrescenta o contexto e avisa os ouvintes', () => {
    const telemetry = new Telemetry(memoryStore());
    const heard: string[] = [];
    telemetry.context = () => ({ participant: 'PNC-AB12' });
    telemetry.onTrack(e => heard.push(`${e.type}:${e.participant}`));
    telemetry.track('fragmentos.start');
    expect(heard).toEqual(['fragmentos.start:PNC-AB12']);
  });
});

describe('fila de envio', () => {
  const s = { participant: 'PNC-AB12', startedAt: '2026-12-02T13:00:00Z' };

  function queueWith(results: SendResult[]) {
    const sent: Batch[] = [];
    const queue = new SyncQueue(memoryStore(), async batch => {
      const result = results.shift() ?? 'ok';
      if (result !== 'retry') sent.push(batch);
      return { result, reason: result };
    });
    return { queue, sent };
  }

  it('junta eventos no mesmo lote, mas o resumo do participante vai separado', () => {
    const { queue } = queueWith([]);
    queue.enqueue('eventos', [{ a: 1 }], s);
    queue.enqueue('eventos', [{ a: 2 }], s);
    queue.enqueue('participantes', [{ p: 1 }], s);
    queue.enqueue('participantes', [{ p: 2 }], s);
    expect(queue.pending().map(b => `${b.kind}:${b.rows.length}`)).toEqual(['eventos:2', 'participantes:1', 'participantes:1']);
  });

  it('sem conexão, mantém os lotes e reenvia depois (sem duplicar)', async () => {
    const { queue, sent } = queueWith(['retry']);
    queue.enqueue('eventos', [{ a: 1 }], s);
    expect(await queue.flush()).toEqual({ sent: 0, pending: 1 });
    queue.enqueue('eventos', [{ a: 2 }], s); // o lote antigo foi fechado: este vai num novo
    expect(await queue.flush()).toEqual({ sent: 2, pending: 0 });
    expect(sent.map(b => b.rows.length)).toEqual([1, 1]);
    expect(new Set(sent.map(b => b.id)).size).toBe(2);
  });

  it('lotes recusados saem da fila e ficam registrados', async () => {
    const { queue } = queueWith(['rejected']);
    queue.enqueue('eventos', [{ a: 1 }], s);
    await queue.flush();
    expect(queue.pending()).toEqual([]);
    expect(queue.rejected()[0].reason).toBe('rejected');
  });

  it('interpreta as respostas do Apps Script', async () => {
    const reply = (body: unknown) => (async () => ({ json: async () => body })) as unknown as typeof fetch;
    const batch: Batch = { id: '1', kind: 'eventos', rows: [], sealed: true, session: s };
    expect(await appsScriptSender('u', 't', reply({ ok: true }))(batch)).toEqual({ result: 'ok' });
    expect((await appsScriptSender('u', 't', reply({ ok: false, erro: 'coleta_encerrada' }))(batch)).result).toBe('rejected');
    expect((await appsScriptSender('u', 't', reply({ ok: false, erro: 'ocupado', tentar_novamente: true }))(batch)).result).toBe('retry');
    expect((await appsScriptSender('', 't')(batch)).result).toBe('retry');
  });
});

describe('dados exportados', () => {
  it('CSV usa ";", escapa aspas/quebras e vírgula decimal', () => {
    expect(toCSV([{ a: 'x;y', b: 'diz "oi"', c: 1.5, d: null }])).toBe('a;b;c;d\r\n"x;y";"diz ""oi""";1,5;\r\n');
  });

  it('eventos viram linhas com colunas fixas e o resto em "outros"', () => {
    const csv = eventsToCSV([{ at: '2026-12-02T13:00:00Z', type: 'ponte.choice', participant: 'P07', delta: 8, extra: [1, 2] }]);
    expect(csv).toContain('"{""extra"":[1,2]}"');
  });

  it('calcula a duração de cada modo pelos eventos', () => {
    const events = [
      { at: '2026-12-02T13:00:00Z', type: 'fragmentos.start', protagonist: 'julia' },
      { at: '2026-12-02T13:12:30Z', type: 'fragmentos.end', protagonist: 'julia' },
    ];
    expect(modeMinutes(events, 'fragmentos.', 'julia')).toBe(12.5);
    expect(modeMinutes(events, 'ponte.')).toBeNull();
  });

  it('resumo por participante reúne os indicadores dos quatro modos', () => {
    const saves = new SaveStore(memoryStore());
    saves.updateCampaign('julia', c => {
      c.fragmentos = { ...newFragmentos('cena1'), completed: true, ally: 'carla', flags: { apagou_foto: true } };
      c.ponte = { ...newPonte('carla', 50), trust: 100, ending: 'positivo', victory: true, cards: ['violencia-patrimonial'] };
      c.dossie = { ...newDossie(65), wellbeing: 90, ending: 'positivo', tags: ['patrimonial'], order: ['nae'], done: { nae: 'default' } };
    });
    const espelho = newEspelho(scenarios);
    for (const sc of scenarios) answer(espelho, scenarios, sc.options.findIndex(o => o.profile === 'ativo'), 100);
    saves.setEspelho(espelho);

    const [row] = summaryRows(session('PNC-AB12'), saves.snapshot(), [], protagonists);
    expect(row).toMatchObject({
      participante: 'PNC-AB12', protagonista: 'julia', m1_aliado: 'carla', m1_flags: 'apagou_foto=true',
      m2_final: 'positivo', m2_vitoria: true, m3_final: 'positivo', m3_encaminhamentos: 'nae:default',
      final_global: 'positivo', m4_perfil: 'ativo', m4_ativo: scenarios.length,
    });
    for (const key of Object.keys(row)) expect(SUMMARY_COLUMNS, key).toContain(key);
    const empty = summaryCSV(summaryRows(session(), new SaveStore(memoryStore()).snapshot(), [], protagonists));
    expect(empty.split('\r\n')[0].split(';')).toEqual(SUMMARY_COLUMNS);
  });
});

describe('instrumentos da pesquisa', () => {
  const items = (q: typeof ciclo2PreJogo) => q.sections.flatMap(sec => sec.items);

  it('Ciclo 1 não tem pré-teste; Ciclo 2 tem pré e pós; ciclo desconhecido usa o 1', () => {
    expect(instrumentsFor(1).pre).toBeUndefined();
    expect(instrumentsFor(1).post.id).toBe('pos_c1');
    expect(instrumentsFor(2).pre?.id).toBe('pre');
    expect(instrumentsFor(2).post.id).toBe('pos');
    expect(instrumentsFor(9)).toBe(INSTRUMENTS[1]);
  });

  it('ids únicos em cada questionário e alternativa correta entre as opções', () => {
    for (const { pre, post } of Object.values(INSTRUMENTS)) {
      for (const q of [pre, post].filter(Boolean) as typeof ciclo2PreJogo[]) {
        const ids = items(q).map(i => i.id);
        expect(new Set(ids).size).toBe(ids.length);
        for (const i of items(q)) if (i.type === 'escolha' && i.correct) expect(i.options).toContain(i.correct);
      }
    }
  });

  it('pré e pós do Ciclo 2 repetem os itens de Bloom e de atitude com os mesmos ids', () => {
    const pre = items(ciclo2PreJogo).filter(i => /^(bloom|atitude)_/.test(i.id));
    const pos = items(ciclo2PosJogo).filter(i => /^(bloom|atitude)_/.test(i.id));
    expect(pre).toHaveLength(14);
    expect(pos).toEqual(pre);
  });

  it('conta acertos nos itens de conhecimento', () => {
    const answers = Object.fromEntries(items(ciclo2PreJogo).flatMap(i => (i.type === 'escolha' && i.correct ? [[i.id, i.correct]] : [])));
    expect(score(ciclo2PreJogo, answers)).toEqual({ correct: 9, total: 9 });
    expect(score(ciclo2PreJogo, { ...answers, bloom_1: 'Ciúme normal em relacionamentos saudáveis' })).toEqual({ correct: 8, total: 9 });
    expect(score(instrumentsFor(1).post, {}).total).toBe(0);
  });

  it('TCLE completo (13 seções) com declaração e pergunta de áudio', () => {
    expect(tcle.sections).toHaveLength(13);
    expect(tcle.declarations.length).toBeGreaterThan(0);
    expect(tcle.audioQuestion).toMatch(/áudio/);
  });
});

describe('jogo completo na build de avaliação (?avaliacao=0)', () => {
  it('guarda o progresso separado do das participações', () => {
    const base = memoryStore();
    const participation = new SaveStore(base);
    const test = new SaveStore(prefixedStore(base, 'teste_'));
    test.updateCampaign('julia', c => { c.fragmentos = newFragmentos('cena1'); });
    expect(test.campaign('julia').fragmentos).toBeDefined();
    expect(participation.campaign('julia').fragmentos).toBeUndefined();
  });
});
