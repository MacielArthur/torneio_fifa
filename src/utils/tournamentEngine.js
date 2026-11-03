import { TEAMS } from '../data/teams.js';

/**
 * Fisher-Yates shuffle algorithm for true randomness
 */
export function shuffleArray(array) {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

/**
 * Creates a new tournament structure based on selected players
 * @param {Array} selectedPlayers - Array of 3 or 4 player objects
 */
export function generateTournament(selectedPlayers) {
  if (!selectedPlayers || (selectedPlayers.length !== 3 && selectedPlayers.length !== 4)) {
    throw new Error('O campeonato deve ter exatamente 3 ou 4 participantes.');
  }

  const isLiga = selectedPlayers.length === 3;
  const shuffledTeams = shuffleArray(TEAMS);
  
  // Rule: exactly 6 teams drawn from the pool of 9
  const drawnTeams = shuffledTeams.slice(0, 6);

  if (isLiga) {
    return generateLeagueTournament(selectedPlayers, drawnTeams);
  } else {
    return generateCupTournament(selectedPlayers, drawnTeams);
  }
}

/**
 * Generates League format for 3 players (A, B, C)
 * Total 6 matches (3 matchups x Ida & Volta)
 */
function generateLeagueTournament(players, drawnTeams) {
  const [p1, p2, p3] = shuffleArray(players);

  // Matchup 1: P1 x P2 (uses drawnTeams[0] and drawnTeams[1])
  // Matchup 2: P1 x P3 (uses drawnTeams[2] and drawnTeams[3])
  // Matchup 3: P2 x P3 (uses drawnTeams[4] and drawnTeams[5])
  
  const matches = [
    // Round 1
    {
      id: 'm1_p1_p2_ida',
      round: 1,
      matchupName: `${p1.name} x ${p2.name} (Ida)`,
      playerHome: p1,
      playerAway: p2,
      teamHome: drawnTeams[0],
      teamAway: drawnTeams[1],
      scoreHome: null,
      scoreAway: null,
      status: 'pendente', // 'pendente' | 'encerrado'
      isLeg: 'ida',
      matchupKey: 'p1_p2',
    },
    {
      id: 'm2_p1_p3_ida',
      round: 1,
      matchupName: `${p1.name} x ${p3.name} (Ida)`,
      playerHome: p1,
      playerAway: p3,
      teamHome: drawnTeams[2],
      teamAway: drawnTeams[3],
      scoreHome: null,
      scoreAway: null,
      status: 'pendente',
      isLeg: 'ida',
      matchupKey: 'p1_p3',
    },
    {
      id: 'm3_p2_p3_ida',
      round: 2,
      matchupName: `${p2.name} x ${p3.name} (Ida)`,
      playerHome: p2,
      playerAway: p3,
      teamHome: drawnTeams[4],
      teamAway: drawnTeams[5],
      scoreHome: null,
      scoreAway: null,
      status: 'pendente',
      isLeg: 'ida',
      matchupKey: 'p2_p3',
    },

    // Return Legs (Inversion of teams is mandatory)
    {
      id: 'm4_p1_p2_volta',
      round: 2,
      matchupName: `${p2.name} x ${p1.name} (Volta)`,
      playerHome: p2,
      playerAway: p1,
      teamHome: drawnTeams[0], // Note: P2 now has team 0, P1 has team 1!
      teamAway: drawnTeams[1],
      scoreHome: null,
      scoreAway: null,
      status: 'pendente',
      isLeg: 'volta',
      matchupKey: 'p1_p2',
    },
    {
      id: 'm5_p1_p3_volta',
      round: 3,
      matchupName: `${p3.name} x ${p1.name} (Volta)`,
      playerHome: p3,
      playerAway: p1,
      teamHome: drawnTeams[2], // P3 now has team 2, P1 has team 3!
      teamAway: drawnTeams[3],
      scoreHome: null,
      scoreAway: null,
      status: 'pendente',
      isLeg: 'volta',
      matchupKey: 'p1_p3',
    },
    {
      id: 'm6_p2_p3_volta',
      round: 3,
      matchupName: `${p3.name} x ${p2.name} (Volta)`,
      playerHome: p3,
      playerAway: p2,
      teamHome: drawnTeams[4], // P3 now has team 4, P2 has team 5!
      teamAway: drawnTeams[5],
      scoreHome: null,
      scoreAway: null,
      status: 'pendente',
      isLeg: 'volta',
      matchupKey: 'p2_p3',
    },
  ];

  return {
    id: 'tournament_' + Date.now(),
    format: 'liga',
    status: 'em_andamento',
    createdAt: new Date().toISOString(),
    players: [p1, p2, p3],
    drawnTeams,
    matches,
    tieBreakerMatch: null, // Only enabled if absolute tie
    winner: null,
  };
}

/**
 * Generates Cup format for 4 players (Semifinals + Final)
 * Semis: 2 legs each (4 matches). Final: 2 legs (2 matches). Total = 6 matches.
 */
function generateCupTournament(players, drawnTeams) {
  const [p1, p2, p3, p4] = shuffleArray(players);

  // Teams:
  // Semi 1: drawnTeams[0] & drawnTeams[1]
  // Semi 2: drawnTeams[2] & drawnTeams[3]
  // Final: drawnTeams[4] & drawnTeams[5]

  const matches = [
    // SEMIFINAL 1
    {
      id: 'semi1_ida',
      stage: 'semi1',
      stageName: 'Semifinal 1 (Ida)',
      playerHome: p1,
      playerAway: p2,
      teamHome: drawnTeams[0],
      teamAway: drawnTeams[1],
      scoreHome: null,
      scoreAway: null,
      status: 'pendente',
      isLeg: 'ida',
    },
    {
      id: 'semi1_volta',
      stage: 'semi1',
      stageName: 'Semifinal 1 (Volta)',
      playerHome: p2,
      playerAway: p1,
      teamHome: drawnTeams[0], // Inverted: P2 controls team 0, P1 controls team 1
      teamAway: drawnTeams[1],
      scoreHome: null,
      scoreAway: null,
      penaltiesHome: null,
      penaltiesAway: null,
      status: 'pendente',
      isLeg: 'volta',
      winnerId: null,
    },

    // SEMIFINAL 2
    {
      id: 'semi2_ida',
      stage: 'semi2',
      stageName: 'Semifinal 2 (Ida)',
      playerHome: p3,
      playerAway: p4,
      teamHome: drawnTeams[2],
      teamAway: drawnTeams[3],
      scoreHome: null,
      scoreAway: null,
      status: 'pendente',
      isLeg: 'ida',
    },
    {
      id: 'semi2_volta',
      stage: 'semi2',
      stageName: 'Semifinal 2 (Volta)',
      playerHome: p4,
      playerAway: p3,
      teamHome: drawnTeams[2], // Inverted: P4 controls team 2, P3 controls team 3
      teamAway: drawnTeams[3],
      scoreHome: null,
      scoreAway: null,
      penaltiesHome: null,
      penaltiesAway: null,
      status: 'pendente',
      isLeg: 'volta',
      winnerId: null,
    },

    // GRANDE FINAL (starts unassigned until Semis conclude)
    {
      id: 'final_ida',
      stage: 'final',
      stageName: 'Grande Final (Ida)',
      playerHome: null, // Decided by Semi 1
      playerAway: null, // Decided by Semi 2
      teamHome: drawnTeams[4],
      teamAway: drawnTeams[5],
      scoreHome: null,
      scoreAway: null,
      status: 'bloqueado', // waiting for finalists
      isLeg: 'ida',
    },
    {
      id: 'final_volta',
      stage: 'final',
      stageName: 'Grande Final (Volta)',
      playerHome: null,
      playerAway: null,
      teamHome: drawnTeams[4], // Inverted
      teamAway: drawnTeams[5],
      scoreHome: null,
      scoreAway: null,
      penaltiesHome: null,
      penaltiesAway: null,
      status: 'bloqueado',
      isLeg: 'volta',
      winnerId: null,
    },
  ];

  return {
    id: 'tournament_' + Date.now(),
    format: 'copa',
    status: 'em_andamento',
    createdAt: new Date().toISOString(),
    players: [p1, p2, p3, p4],
    drawnTeams,
    matches,
    winner: null,
  };
}

/**
 * Calculates current League Standings with tie-breaker criteria:
 * 1º Pontos
 * 2º Saldo de Gols
 * 3º Gols Pró
 * 4º Confronto Direto
 * 5º Partida Extra (quando há empate absoluto)
 */
export function calculateLeagueStandings(players, matches) {
  // Initialize table for all players
  const stats = {};
  players.forEach((p) => {
    stats[p.id] = {
      player: p,
      matchesPlayed: 0,
      wins: 0,
      draws: 0,
      losses: 0,
      goalsFor: 0,
      goalsAgainst: 0,
      goalDifference: 0,
      points: 0,
    };
  });

  // Calculate from completed matches
  matches.forEach((m) => {
    if (m.scoreHome !== null && m.scoreAway !== null) {
      const home = stats[m.playerHome.id];
      const away = stats[m.playerAway.id];

      if (home && away) {
        home.matchesPlayed += 1;
        away.matchesPlayed += 1;

        home.goalsFor += m.scoreHome;
        home.goalsAgainst += m.scoreAway;
        away.goalsFor += m.scoreAway;
        away.goalsAgainst += m.scoreHome;

        if (m.scoreHome > m.scoreAway) {
          home.wins += 1;
          home.points += 3;
          away.losses += 1;
        } else if (m.scoreHome < m.scoreAway) {
          away.wins += 1;
          away.points += 3;
          home.losses += 1;
        } else {
          home.draws += 1;
          away.draws += 1;
          home.points += 1;
          away.points += 1;
        }

        home.goalDifference = home.goalsFor - home.goalsAgainst;
        away.goalDifference = away.goalsFor - away.goalsAgainst;
      }
    }
  });

  const standingsList = Object.values(stats);

  // Sorting function adhering strictly to criteria:
  standingsList.sort((a, b) => {
    // 1º Pontos
    if (b.points !== a.points) return b.points - a.points;

    // 2º Saldo de Gols
    if (b.goalDifference !== a.goalDifference) return b.goalDifference - a.goalDifference;

    // 3º Gols Pró
    if (b.goalsFor !== a.goalsFor) return b.goalsFor - a.goalsFor;

    // 4º Confronto Direto (entre A e B se empatados)
    const headToHead = calculateHeadToHead(a.player.id, b.player.id, matches);
    if (headToHead !== 0) return headToHead;

    return 0; // Empate absoluto
  });

  // Check if there is an absolute tie for 1st place when all 6 matches are finished
  const allMatchesCompleted = matches.every((m) => m.scoreHome !== null && m.scoreAway !== null);
  let absoluteTie = false;
  let tiedLeaders = [];

  if (allMatchesCompleted && standingsList.length >= 2) {
    const leader = standingsList[0];
    const second = standingsList[1];

    if (
      leader.points === second.points &&
      leader.goalDifference === second.goalDifference &&
      leader.goalsFor === second.goalsFor &&
      calculateHeadToHead(leader.player.id, second.player.id, matches) === 0
    ) {
      absoluteTie = true;
      tiedLeaders = [leader.player, second.player];
      // Check if 3rd is also tied
      if (standingsList[2]) {
        const third = standingsList[2];
        if (
          third.points === leader.points &&
          third.goalDifference === leader.goalDifference &&
          third.goalsFor === leader.goalsFor
        ) {
          tiedLeaders.push(third.player);
        }
      }
    }
  }

  return {
    standings: standingsList,
    allCompleted: allMatchesCompleted,
    absoluteTie,
    tiedLeaders,
  };
}

/**
 * Calculates head-to-head between two players
 * Returns negative if A is ahead, positive if B is ahead, 0 if tied
 */
function calculateHeadToHead(playerAId, playerBId, matches) {
  let ptsA = 0;
  let ptsB = 0;
  let gdA = 0;

  matches.forEach((m) => {
    const isAvsB =
      (m.playerHome.id === playerAId && m.playerAway.id === playerBId) ||
      (m.playerHome.id === playerBId && m.playerAway.id === playerAId);

    if (isAvsB && m.scoreHome !== null && m.scoreAway !== null) {
      const aIsHome = m.playerHome.id === playerAId;
      const scoreA = aIsHome ? m.scoreHome : m.scoreAway;
      const scoreB = aIsHome ? m.scoreAway : m.scoreHome;

      gdA += scoreA - scoreB;
      if (scoreA > scoreB) ptsA += 3;
      else if (scoreB > scoreA) ptsB += 3;
      else {
        ptsA += 1;
        ptsB += 1;
      }
    }
  });

  if (ptsA !== ptsB) return ptsB - ptsA;
  if (gdA !== 0) return -gdA;
  return 0;
}

/**
 * Evaluates aggregate and penalty winners for Cup ties (Ida e Volta)
 */
export function calculateCupAggregate(matchIda, matchVolta) {
  if (
    matchIda.scoreHome === null ||
    matchIda.scoreAway === null ||
    matchVolta.scoreHome === null ||
    matchVolta.scoreAway === null
  ) {
    return {
      isCompleted: false,
      aggregateA: null,
      aggregateB: null,
      winnerId: null,
      needsPenalties: false,
    };
  }

  // Identify Player A and Player B
  // matchIda: Home = A, Away = B
  // matchVolta: Home = B, Away = A
  const playerA = matchIda.playerHome;
  const playerB = matchIda.playerAway;

  const goalsA = matchIda.scoreHome + matchVolta.scoreAway;
  const goalsB = matchIda.scoreAway + matchVolta.scoreHome;

  if (goalsA > goalsB) {
    return {
      isCompleted: true,
      aggregateA: goalsA,
      aggregateB: goalsB,
      winnerId: playerA.id,
      needsPenalties: false,
    };
  } else if (goalsB > goalsA) {
    return {
      isCompleted: true,
      aggregateA: goalsA,
      aggregateB: goalsB,
      winnerId: playerB.id,
      needsPenalties: false,
    };
  } else {
    // Tied aggregate -> penalties required!
    let winnerId = null;
    const penHome = matchVolta.penaltiesHome; // B's penalties
    const penAway = matchVolta.penaltiesAway; // A's penalties

    if (penHome !== null && penAway !== null) {
      if (penAway > penHome) {
        winnerId = playerA.id;
      } else if (penHome > penAway) {
        winnerId = playerB.id;
      }
    }

    return {
      isCompleted: winnerId !== null,
      aggregateA: goalsA,
      aggregateB: goalsB,
      winnerId,
      needsPenalties: true,
    };
  }
}
