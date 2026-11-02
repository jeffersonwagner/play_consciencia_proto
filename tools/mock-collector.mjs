// Coletor simulado: imita o Apps Script da planilha (tools/apps-script/Code.gs)
// para testar a build de pesquisa sem conta Google. Uso:
//   node tools/mock-collector.mjs            (porta 8787)
//   npm run dev:pesquisa                     (jogo apontando para ele)
// Período e liga/desliga: edite MOCK abaixo ou passe ?inicio=&fim=&ativa= em
// GET /config-teste. Os dados recebidos ficam em tools/.mock-coleta.json e
// podem ser vistos em http://localhost:8787/?acao=dados
import { createServer } from 'node:http';
import { writeFileSync } from 'node:fs';

const day = offset => {
  const d = new Date();
  d.setDate(d.getDate() + offset);
  return d.toLocaleDateString('sv-SE'); // AAAA-MM-DD
};

const MOCK = {
  ativa: 'SIM', inicio: day(-1), fim: day(30), ciclo: 1, modos: '1,2', protagonista: 'julia',
  tolerancia_dias: 7, token: 'token-de-teste', mensagem: '',
};
const data = { Participantes: [], Respostas: [], Eventos: [], Lotes: [] };
const save = () => writeFileSync(new URL('./.mock-coleta.json', import.meta.url), JSON.stringify(data, null, 2));

const parse = (s, end) => {
  const [y, m, d] = s.split('-').map(Number);
  const date = new Date(y, m - 1, d);
  if (end) date.setHours(23, 59, 59, 999);
  return date;
};

function gravar(body) {
  if (body.token !== MOCK.token) return { ok: false, erro: 'token_invalido' };
  const lote = body.lote;
  if (!/^(sim)$/i.test(MOCK.ativa)) return { ok: false, erro: 'coleta_inativa' };
  const start = parse(MOCK.inicio), end = parse(MOCK.fim, true);
  const sessionStart = new Date(lote.session.startedAt);
  if (sessionStart < start || sessionStart > end) return { ok: false, erro: 'sessao_fora_do_periodo' };
  if (Date.now() > end.getTime() + MOCK.tolerancia_dias * 86400000) return { ok: false, erro: 'coleta_encerrada' };
  if (data.Lotes.some(l => l.lote === lote.id)) return { ok: true, repetido: true };
  const aba = { eventos: 'Eventos', respostas: 'Respostas', participantes: 'Participantes' }[lote.kind];
  const now = new Date().toISOString();
  for (const row of lote.rows) {
    if (lote.kind === 'participantes') {
      const chave = `${row.participante}|${row.protagonista ?? ''}`;
      const i = data.Participantes.findIndex(r => r.chave === chave);
      const linha = { recebido_em: now, ...row, chave };
      if (i >= 0) data.Participantes[i] = linha; else data.Participantes.push(linha);
    } else {
      data[aba].push({ recebido_em: now, ...row });
    }
  }
  data.Lotes.push({ lote: lote.id, tipo: lote.kind, participante: lote.session.participant, linhas: lote.rows.length, recebido_em: now });
  save();
  return { ok: true };
}

createServer((req, res) => {
  const url = new URL(req.url, 'http://localhost');
  const send = obj => {
    res.writeHead(200, { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' });
    res.end(JSON.stringify(obj));
  };
  if (req.method === 'GET') {
    const acao = url.searchParams.get('acao');
    if (acao === 'config') return send({ ...MOCK, token: undefined });
    if (acao === 'dados') return send(data);
    if (url.pathname === '/config-teste') {
      for (const k of ['ativa', 'inicio', 'fim', 'modos', 'ciclo']) if (url.searchParams.has(k)) MOCK[k] = url.searchParams.get(k);
      return send(MOCK);
    }
    return send({ ok: true, servico: 'coletor simulado' });
  }
  let body = '';
  req.on('data', c => { body += c; });
  req.on('end', () => {
    try { send(gravar(JSON.parse(body))); } catch { send({ ok: false, erro: 'formato_invalido' }); }
  });
}).listen(8787, () => console.log('Coletor simulado em http://localhost:8787'));
