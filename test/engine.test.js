import assert from 'node:assert';
import { 
  generateTournament, 
  calculateLeagueStandings, 
  calculateCupAggregate 
} from '../src/utils/tournamentEngine.js';
import { compileTournamentStats } from '../src/utils/hallOfFameCompiler.js';

console.log('🧪 Iniciando Bateria de Testes de Regras de Domínio e Casos de Borda...\n');

// 1. Teste de 3 Jogadores (Liga)
{
  const players = [
    { id: 'p1', name: 'Neymar' },
    { id: 'p2', name: 'Messi' },
    { id: 'p3', name: 'Cristiano' },
  ];

  const tournament = generateTournament(players);
  assert.strictEqual(tournament.format, 'liga', 'Formato deve ser liga');
  assert.strictEqual(tournament.matches.length, 6, 'Liga deve ter exatamente 6 partidas');
  assert.strictEqual(tournament.drawnTeams.length, 6, 'Devem ser sorteados 6 times do pool');

  // Verifica espelhamento e inversão de times
  const ida1 = tournament.matches[0];
  const volta1 = tournament.matches[3]; // volta correspondente do confronto 1
  assert.strictEqual(ida1.matchupKey, volta1.matchupKey, 'Confrontos devem coincidir');
  assert.strictEqual(ida1.teamHome.id, volta1.teamHome.id, 'Times devem ser espelhados');
  assert.strictEqual(ida1.playerHome.id, volta1.playerAway.id, 'Mandante da ida deve ser visitante da volta');

  console.log('✅ Teste 1: Geração da Liga (3 Jogadores) com 6 partidas e espelhamento perfeito!');
}

// 2. Teste de 4 Jogadores (Copa Mata-Mata)
{
  const players = [
    { id: 'p1', name: 'A' },
    { id: 'p2', name: 'B' },
    { id: 'p3', name: 'C' },
    { id: 'p4', name: 'D' },
  ];

  const tournament = generateTournament(players);
  assert.strictEqual(tournament.format, 'copa', 'Formato deve ser copa');
  assert.strictEqual(tournament.matches.length, 6, 'Copa deve ter exatamente 6 partidas (4 semis + 2 final)');
  assert.strictEqual(tournament.drawnTeams.length, 6, 'Total de 6 times sorteados');

  console.log('✅ Teste 2: Geração da Copa (4 Jogadores) com 6 partidas estruturadas!');
}

// 3. Teste de Recálculo Dinâmico da Tabela e "Dedo Gordo" (Placar Retroativo)
{
  const players = [
    { id: 'p1', name: 'Jogador 1' },
    { id: 'p2', name: 'Jogador 2' },
    { id: 'p3', name: 'Jogador 3' },
  ];

  const matches = [
    { playerHome: players[0], playerAway: players[1], scoreHome: 3, scoreAway: 1 }, // P1 vence P2
    { playerHome: players[0], playerAway: players[2], scoreHome: 2, scoreAway: 0 }, // P1 vence P3
    { playerHome: players[1], playerAway: players[2], scoreHome: 1, scoreAway: 1 }, // P2 empata P3
    { playerHome: players[1], playerAway: players[0], scoreHome: 0, scoreAway: 2 }, // P1 vence P2 na volta
    { playerHome: players[2], playerAway: players[0], scoreHome: 0, scoreAway: 1 }, // P1 vence P3 na volta
    { playerHome: players[2], playerAway: players[1], scoreHome: 2, scoreAway: 2 }, // Empate
  ];

  let result = calculateLeagueStandings(players, matches);
  assert.strictEqual(result.standings[0].player.id, 'p1');
  assert.strictEqual(result.standings[0].points, 12, 'P1 deve ter 12 pontos');
  assert.strictEqual(result.standings[0].wins, 4);

  // Cenário "Dedo Gordo": Corrige o primeiro placar retroativamente (de 3x1 para 1x3, vitória de P2)
  const matchesFixed = [...matches];
  matchesFixed[0] = { ...matchesFixed[0], scoreHome: 1, scoreAway: 3 };

  let resultFixed = calculateLeagueStandings(players, matchesFixed);
  assert.strictEqual(resultFixed.standings[0].points, 9, 'P1 recalculado para 9 pontos');
  assert.strictEqual(resultFixed.standings[1].points, 5, 'P2 recalculado para 5 pontos');

  console.log('✅ Teste 3: Recálculo em tempo real e proteção contra "Dedo Gordo" verificado!');
}

// 4. Teste de Empate Absoluto e Habilitação de Jogo Extra
{
  const players = [
    { id: 'p1', name: 'Alpha' },
    { id: 'p2', name: 'Beta' },
    { id: 'p3', name: 'Gama' },
  ];

  // Configura cenário onde Alpha e Beta empatam exatamente em tudo
  const matches = [
    { playerHome: players[0], playerAway: players[1], scoreHome: 1, scoreAway: 1 },
    { playerHome: players[0], playerAway: players[2], scoreHome: 2, scoreAway: 0 },
    { playerHome: players[1], playerAway: players[2], scoreHome: 2, scoreAway: 0 },
    { playerHome: players[1], playerAway: players[0], scoreHome: 1, scoreAway: 1 },
    { playerHome: players[2], playerAway: players[0], scoreHome: 0, scoreAway: 2 },
    { playerHome: players[2], playerAway: players[1], scoreHome: 0, scoreAway: 2 },
  ];

  const result = calculateLeagueStandings(players, matches);
  assert.strictEqual(result.allCompleted, true);
  assert.strictEqual(result.absoluteTie, true, 'Deve acusar empate absoluto');
  assert.strictEqual(result.tiedLeaders.length >= 2, true, 'Deve identificar os líderes empatados');

  console.log('✅ Teste 4: Detecção precisa de Empate Absoluto para acionar jogo extra!');
}

// 5. Teste de Pênaltis no Mata-Mata (Copa)
{
  const pA = { id: 'pA', name: 'Time A' };
  const pB = { id: 'pB', name: 'Time B' };

  const matchIda = {
    playerHome: pA,
    playerAway: pB,
    scoreHome: 2,
    scoreAway: 1,
  };

  const matchVolta = {
    playerHome: pB,
    playerAway: pA,
    scoreHome: 2,
    scoreAway: 1,
    penaltiesHome: null,
    penaltiesAway: null,
  };

  // Agregado: 3 x 3 -> Precisa de pênaltis!
  let agg = calculateCupAggregate(matchIda, matchVolta);
  assert.strictEqual(agg.needsPenalties, true, 'Empate agregado deve pedir pênaltis');
  assert.strictEqual(agg.isCompleted, false, 'Sem pênaltis ainda não está encerrado');

  // Adiciona resultado dos pênaltis: B ganha nos pênaltis 4x3
  matchVolta.penaltiesHome = 4;
  matchVolta.penaltiesAway = 3;

  agg = calculateCupAggregate(matchIda, matchVolta);
  assert.strictEqual(agg.isCompleted, true);
  assert.strictEqual(agg.winnerId, pB.id, 'pB deve ser o vencedor dos pênaltis');

  console.log('✅ Teste 5: Decisão por pênaltis diretos após empate no agregado funcionando perfeitamente!');
}

// 6. Teste de Integridade do Hall da Fama
{
  const initialHall = {};
  const mockTournament = {
    id: 't1',
    format: 'liga',
    players: [{ id: 'p1', name: 'Campeão' }, { id: 'p2', name: 'Vice' }, { id: 'p3', name: 'Bronze' }],
    matches: [
      {
        playerHome: { id: 'p1', name: 'Campeão' },
        playerAway: { id: 'p2', name: 'Vice' },
        teamHome: { name: 'Real Madrid' },
        teamAway: { name: 'Barcelona' },
        scoreHome: 5,
        scoreAway: 0,
      },
    ],
  };

  const { updatedHallOfFame, completedTournament } = compileTournamentStats(initialHall, mockTournament);
  assert.strictEqual(updatedHallOfFame['p1'].titles, 1, 'Campeão deve ter 1 título');
  assert.strictEqual(updatedHallOfFame['p1'].goalsFor, 5, 'Deve registrar 5 gols');
  assert.strictEqual(updatedHallOfFame['p1'].biggestWin.goalsFor, 5, 'Deve registrar a maior goleada');

  console.log('✅ Teste 6: Compilação do Hall da Fama e estatísticas globais validada!');
}

console.log('\n🎉 TODOS OS TESTES PASSARAM COM SUCESSO!\n');

