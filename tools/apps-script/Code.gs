/**
 * Play na Consciência — receptor da coleta de dados (Google Apps Script).
 *
 * Instalação: ver docs/COLETA.md. Resumo:
 *   1. Na planilha da coleta: Extensões > Apps Script > cole este arquivo.
 *   2. Execute a função `configurar` uma vez (cria as abas e a aba Config).
 *   3. Implantar > Nova implantação > App da Web
 *      (Executar como: você; Quem pode acessar: qualquer pessoa).
 *   4. Copie o endereço /exec para VITE_COLLECT_URL em .env.pesquisa.local.
 *
 * Regras aplicadas aqui (o jogo aplica as mesmas, mas quem decide é o
 * servidor): coleta ativa, token correto, sessão iniciada dentro do
 * período e recebimento até `tolerancia_dias` depois do fim (para dados
 * que ficaram na fila de um computador sem internet).
 */

var ABAS = {
  config: 'Config',
  participantes: 'Participantes',
  respostas: 'Respostas',
  eventos: 'Eventos',
  lotes: 'Lotes',
};

var CONFIG_PADRAO = [
  ['chave', 'valor', 'descrição'],
  ['ativa', 'NÃO', 'SIM para aceitar dados; NÃO desliga a coleta (o jogo funciona normalmente, sem pesquisa).'],
  ['inicio', '', 'Primeiro dia da coleta (data).'],
  ['fim', '', 'Último dia da coleta (data). Depois dele, nenhuma nova participação é aceita.'],
  ['ciclo', 1, 'Ciclo de avaliação: 1 = questionário reduzido pós-sessão (sem pré-teste); 2 = pré-jogo e pós-jogo completos.'],
  ['modos', '1,2', 'Modos que o participante conclui antes do questionário final (Ciclo 1: 1,2).'],
  ['protagonista', 'julia', 'História usada na coleta.'],
  ['tolerancia_dias', 7, 'Dias após o fim em que ainda se aceitam dados de sessões iniciadas no período (envio atrasado por falta de internet).'],
  ['token', '', 'Senha compartilhada com o jogo (VITE_COLLECT_TOKEN). Gerada pela função configurar.'],
  ['mensagem', '', 'Texto opcional mostrado aos participantes quando a coleta não está aberta.'],
];

// ------------------------------------------------------------
// INSTALAÇÃO
// ------------------------------------------------------------
function configurar() {
  var ss = SpreadsheetApp.getActive();
  var config = ss.getSheetByName(ABAS.config);
  if (!config) {
    config = ss.insertSheet(ABAS.config, 0);
    var chaves = CONFIG_PADRAO.map(function (l) { return l[0]; });
    // "1,2" em planilha pt-BR vira o número 1,2: a célula de modos fica como texto
    config.getRange(chaves.indexOf('modos') + 1, 2).setNumberFormat('@');
    config.getRange(1, 1, CONFIG_PADRAO.length, 3).setValues(CONFIG_PADRAO);
    config.getRange(2, 2).setValue('NÃO');
    var token = Utilities.getUuid().replace(/-/g, '').slice(0, 20);
    config.getRange(chaves.indexOf('token') + 1, 2).setValue(token);
    config.setFrozenRows(1);
    config.autoResizeColumns(1, 3);
  }
  [ABAS.participantes, ABAS.respostas, ABAS.eventos, ABAS.lotes].forEach(function (nome) {
    if (!ss.getSheetByName(nome)) {
      var aba = ss.insertSheet(nome);
      aba.getRange(1, 1).setValue(nome === ABAS.lotes ? 'lote' : 'recebido_em');
      if (nome === ABAS.lotes) aba.getRange(1, 2, 1, 4).setValues([['tipo', 'participante', 'linhas', 'recebido_em']]);
      aba.setFrozenRows(1);
    }
  });
  var aviso = 'Planilha preparada. Preencha a aba Config (ativa, início, fim) e copie o token para o jogo.';
  // O alerta só aparece com a planilha aberta; executado pelo editor, vai para o registro
  try {
    SpreadsheetApp.getUi().alert(aviso);
  } catch (err) {
    Logger.log(aviso);
  }
}

// ------------------------------------------------------------
// CONFIGURAÇÃO
// ------------------------------------------------------------
function lerConfig() {
  var aba = SpreadsheetApp.getActive().getSheetByName(ABAS.config);
  var valores = aba.getDataRange().getValues();
  var cfg = {};
  var tz = Session.getScriptTimeZone();
  for (var i = 1; i < valores.length; i++) {
    var chave = String(valores[i][0]).trim();
    var valor = valores[i][1];
    if (valor instanceof Date) valor = Utilities.formatDate(valor, tz, 'yyyy-MM-dd');
    if (chave) cfg[chave] = valor;
  }
  return cfg;
}

function configPublica(cfg) {
  return {
    ativa: /^(sim|true|1)$/i.test(String(cfg.ativa)),
    inicio: String(cfg.inicio || ''),
    fim: String(cfg.fim || ''),
    ciclo: Number(cfg.ciclo) === 2 ? 2 : 1,
    // Se a planilha converteu "1,2" em número, volta a separar os modos
    modos: String(cfg.modos || '1,2').replace(/\./g, ','),
    protagonista: String(cfg.protagonista || 'julia'),
    mensagem: String(cfg.mensagem || ''),
  };
}

/** Converte "AAAA-MM-DD" em data no fuso da planilha (início ou fim do dia). */
function dia(texto, fimDoDia) {
  var m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(texto));
  if (!m) return null;
  var tz = Session.getScriptTimeZone();
  var hora = fimDoDia ? '23:59:59' : '00:00:00';
  var offset = Utilities.formatDate(new Date(), tz, 'XXX');
  return new Date(m[1] + '-' + m[2] + '-' + m[3] + 'T' + hora + offset);
}

// ------------------------------------------------------------
// ENDPOINTS
// ------------------------------------------------------------
function doGet(e) {
  if (e && e.parameter && e.parameter.acao === 'config') return json(configPublica(lerConfig()));
  return json({ ok: true, servico: 'Play na Consciência — coleta' });
}

function doPost(e) {
  var corpo;
  try {
    corpo = JSON.parse(e.postData.contents);
  } catch (err) {
    return json({ ok: false, erro: 'formato_invalido' });
  }

  var cfg = lerConfig();
  if (!cfg.token || corpo.token !== String(cfg.token)) return json({ ok: false, erro: 'token_invalido' });
  if (corpo.acao !== 'gravar' || !corpo.lote) return json({ ok: false, erro: 'acao_invalida' });

  var lote = corpo.lote;
  var tipo = { eventos: ABAS.eventos, respostas: ABAS.respostas, participantes: ABAS.participantes }[lote.kind];
  if (!tipo || !Array.isArray(lote.rows)) return json({ ok: false, erro: 'lote_invalido' });

  // Período: a sessão precisa ter começado dentro dele, e o envio
  // atrasado é aceito só até `tolerancia_dias` depois do fim.
  var publica = configPublica(cfg);
  var inicio = dia(publica.inicio, false);
  var fim = dia(publica.fim, true);
  var inicioSessao = new Date(lote.session && lote.session.startedAt);
  var limite = fim ? new Date(fim.getTime() + Number(cfg.tolerancia_dias || 0) * 86400000) : null;
  if (!publica.ativa) return json({ ok: false, erro: 'coleta_inativa' });
  if (!inicio || !fim || isNaN(inicioSessao)) return json({ ok: false, erro: 'periodo_nao_configurado' });
  if (inicioSessao < inicio || inicioSessao > fim) return json({ ok: false, erro: 'sessao_fora_do_periodo' });
  if (new Date() > limite) return json({ ok: false, erro: 'coleta_encerrada' });

  var trava = LockService.getScriptLock();
  if (!trava.tryLock(20000)) return json({ ok: false, erro: 'ocupado', tentar_novamente: true });
  try {
    var ss = SpreadsheetApp.getActive();
    var lotes = ss.getSheetByName(ABAS.lotes);
    var ids = lotes.getLastRow() > 1 ? lotes.getRange(2, 1, lotes.getLastRow() - 1, 1).getValues() : [];
    for (var i = 0; i < ids.length; i++) {
      if (ids[i][0] === lote.id) return json({ ok: true, repetido: true });
    }

    var aba = ss.getSheetByName(tipo);
    var agora = new Date();
    if (lote.kind === 'participantes') {
      lote.rows.forEach(function (linha) { substituirLinha(aba, linha, agora); });
    } else {
      acrescentarLinhas(aba, lote.rows, agora);
    }
    lotes.appendRow([lote.id, lote.kind, lote.session.participant, lote.rows.length, agora]);
    return json({ ok: true });
  } finally {
    trava.releaseLock();
  }
}

// ------------------------------------------------------------
// ESCRITA
// ------------------------------------------------------------

/** Garante que o cabeçalho tenha todas as colunas; devolve o cabeçalho. */
function cabecalho(aba, chaves) {
  var ultima = Math.max(aba.getLastColumn(), 1);
  var atual = aba.getRange(1, 1, 1, ultima).getValues()[0].map(String);
  if (!atual[0]) atual = ['recebido_em'];
  var novas = chaves.filter(function (k) { return atual.indexOf(k) < 0; });
  if (novas.length) {
    atual = atual.concat(novas);
    aba.getRange(1, 1, 1, atual.length).setValues([atual]);
  }
  return atual;
}

function chavesDe(linhas) {
  var chaves = [];
  linhas.forEach(function (l) {
    Object.keys(l).forEach(function (k) { if (chaves.indexOf(k) < 0) chaves.push(k); });
  });
  return chaves;
}

function valor(v) {
  if (v === null || v === undefined) return '';
  return v;
}

function acrescentarLinhas(aba, linhas, agora) {
  if (!linhas.length) return;
  var cab = cabecalho(aba, chavesDe(linhas));
  var valores = linhas.map(function (l) {
    return cab.map(function (k) { return k === 'recebido_em' ? agora : valor(l[k]); });
  });
  aba.getRange(aba.getLastRow() + 1, 1, valores.length, cab.length).setValues(valores);
}

/** Uma linha por participante e protagonista: substitui a anterior, se houver. */
function substituirLinha(aba, linha, agora) {
  linha.chave = String(linha.participante) + '|' + String(linha.protagonista || '');
  var cab = cabecalho(aba, chavesDe([linha]));
  var col = cab.indexOf('chave') + 1;
  var n = aba.getLastRow() - 1;
  var alvo = aba.getLastRow() + 1;
  if (n > 0) {
    var chaves = aba.getRange(2, col, n, 1).getValues();
    for (var i = 0; i < chaves.length; i++) {
      if (chaves[i][0] === linha.chave) { alvo = i + 2; break; }
    }
  }
  var valores = cab.map(function (k) { return k === 'recebido_em' ? agora : valor(linha[k]); });
  aba.getRange(alvo, 1, 1, cab.length).setValues([valores]);
}

function json(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}
