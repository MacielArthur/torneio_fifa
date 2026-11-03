import { calculateLeagueStandings, calculateCupAggregate } from './tournamentEngine.js';

/**
 * Compiles tournament results into the global Hall of Fame statistics
 */
export function compileTournamentStats(currentHallOfFame, tournament) {
  const updatedHall = { ...currentHallOfFame };
  const isLiga = tournament.format === 'liga';

  // 1. Determine Champion & Runner-up
  let champion = null;
  let runnerUp = null;

  if (isLiga) {
    if (tournament.tieBreakerMatch && tournament.tieBreakerMatch.scoreHome !== null) {
      if (tournament.tieBreakerMatch.scoreHome > tournament.tieBreakerMatch.scoreAway) {
        champion = tournament.tieBreakerMatch.playerHome;
        runnerUp = tournament.tieBreakerMatch.playerAway;
      } else {
        champion = tournament.tieBreakerMatch.playerAway;
        runnerUp = tournament.tieBreakerMatch.playerHome;
      }
    } else {
      const { standings } = calculateLeagueStandings(tournament.players, tournament.matches);
      champion = standings[0]?.player || null;
      runnerUp = standings[1]?.player || null;
    }
  } else {
    // Copa
    const finalIda = tournament.matches.find((m) => m.id === 'final_ida');
    const finalVolta = tournament.matches.find((m) => m.id === 'final_volta');
    const finalAgg = calculateCupAggregate(finalIda, finalVolta);

    if (finalAgg.winnerId) {
      champion = tournament.players.find((p) => p.id === finalAgg.winnerId) || null;
      runnerUp = tournament.players.find((p) => p.id !== finalAgg.winnerId && (p.id === finalIda.playerHome.id || p.id === finalIda.playerAway.id)) || null;
    }
  }

  // 2. Aggregate stats for each player who participated in this tournament
  tournament.players.forEach((player) => {
    if (!updatedHall[player.id]) {
      updatedHall[player.id] = {
        playerId: player.id,
        name: player.name,
        nickname: player.nickname || '',
        tournamentsPlayed: 0,
        titles: 0,
        runnersUp: 0,
        matchesPlayed: 0,
        wins: 0,
        draws: 0,
        losses: 0,
        goalsFor: 0,
        goalsAgainst: 0,
        goalDifference: 0,
        points: 0,
        biggestWin: null, // { goalsFor, goalsAgainst, margin, opponentName, teamUsed }
      };
    }

    const stat = updatedHall[player.id];
    stat.name = player.name; // Keep name fresh
    stat.nickname = player.nickname || stat.nickname;
    stat.tournamentsPlayed += 1;

    if (champion && champion.id === player.id) {
      stat.titles += 1;
    }
    if (runnerUp && runnerUp.id === player.id) {
      stat.runnersUp += 1;
    }
  });

  // 3. Process matches played
  const matchesToProcess = [...tournament.matches];
  if (tournament.tieBreakerMatch && tournament.tieBreakerMatch.scoreHome !== null) {
    matchesToProcess.push(tournament.tieBreakerMatch);
  }

  matchesToProcess.forEach((m) => {
    if (m.scoreHome !== null && m.scoreAway !== null && m.playerHome && m.playerAway) {
      const homeStat = updatedHall[m.playerHome.id];
      const awayStat = updatedHall[m.playerAway.id];

      if (homeStat && awayStat) {
        homeStat.matchesPlayed += 1;
        awayStat.matchesPlayed += 1;

        homeStat.goalsFor += m.scoreHome;
        homeStat.goalsAgainst += m.scoreAway;
        awayStat.goalsFor += m.scoreAway;
        awayStat.goalsAgainst += m.scoreHome;

        const marginHome = m.scoreHome - m.scoreAway;
        const marginAway = m.scoreAway - m.scoreHome;

        if (m.scoreHome > m.scoreAway) {
          homeStat.wins += 1;
          homeStat.points += 3;
          awayStat.losses += 1;

          // Check biggest win for Home
          if (
            !homeStat.biggestWin ||
            marginHome > homeStat.biggestWin.margin ||
            (marginHome === homeStat.biggestWin.margin && m.scoreHome > homeStat.biggestWin.goalsFor)
          ) {
            homeStat.biggestWin = {
              goalsFor: m.scoreHome,
              goalsAgainst: m.scoreAway,
              margin: marginHome,
              opponentName: m.playerAway.name,
              teamUsed: m.teamHome.name,
            };
          }
        } else if (m.scoreAway > m.scoreHome) {
          awayStat.wins += 1;
          awayStat.points += 3;
          homeStat.losses += 1;

          // Check biggest win for Away
          if (
            !awayStat.biggestWin ||
            marginAway > awayStat.biggestWin.margin ||
            (marginAway === awayStat.biggestWin.margin && m.scoreAway > awayStat.biggestWin.goalsFor)
          ) {
            awayStat.biggestWin = {
              goalsFor: m.scoreAway,
              goalsAgainst: m.scoreHome,
              margin: marginAway,
              opponentName: m.playerHome.name,
              teamUsed: m.teamAway.name,
            };
          }
        } else {
          homeStat.draws += 1;
          awayStat.draws += 1;
          homeStat.points += 1;
          awayStat.points += 1;
        }

        homeStat.goalDifference = homeStat.goalsFor - homeStat.goalsAgainst;
        awayStat.goalDifference = awayStat.goalsFor - awayStat.goalsAgainst;
      }
    }
  });

  return {
    updatedHallOfFame: updatedHall,
    completedTournament: {
      ...tournament,
      status: 'concluido',
      finishedAt: new Date().toISOString(),
      champion,
      runnerUp,
    },
  };
}
