import React, { useState, useMemo } from 'react';
import { 
  Trophy, AlertCircle, ArrowLeftRight, CheckCircle2, XCircle, 
  Flame, Award, Shield, Swords, Sparkles 
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { useTournamentStore } from '../store/useTournamentStore';
import { calculateLeagueStandings, calculateCupAggregate } from '../utils/tournamentEngine';

export const TournamentView = ({ onFinishTournament }) => {
  const { currentTournament, cancelTournament, setCurrentTournament, setActiveTab } = useTournamentStore();

  if (!currentTournament) {
    return (
      <div className="max-w-xl mx-auto py-16 px-4 text-center">
        <div className="w-16 h-16 rounded-2xl bg-slate-800/80 border border-slate-700 flex items-center justify-center text-slate-500 mx-auto mb-4">
          <Trophy className="w-8 h-8" />
        </div>
        <h3 className="text-xl font-bold text-white mb-2">Nenhum campeonato em andamento</h3>
        <p className="text-slate-400 text-sm mb-6">
          Vá até a aba Elenco, selecione 3 ou 4 jogadores e clique em "Sortear & Iniciar" para começar.
        </p>
        <button
          onClick={() => setActiveTab('elenco')}
          className="px-6 py-2.5 bg-eafc-neon text-black font-bold rounded-xl text-sm shadow-neon hover:bg-emerald-400 transition-all"
        >
          Ir para o Elenco
        </button>
      </div>
    );
  }

  const isLiga = currentTournament.format === 'liga';

  // League Standings calculation
  const leagueData = useMemo(() => {
    if (!isLiga) return null;
    return calculateLeagueStandings(currentTournament.players, currentTournament.matches);
  }, [currentTournament, isLiga]);

  // Update match score handler
  const handleScoreChange = (matchId, field, value) => {
    const numericValue = value === '' ? null : Math.max(0, parseInt(value, 10) || 0);

    const updatedMatches = currentTournament.matches.map((m) => {
      if (m.id === matchId) {
        return { ...m, [field]: numericValue };
      }
      return m;
    });

    let updatedTournament = {
      ...currentTournament,
      matches: updatedMatches,
    };

    // If Cup mode, check if Semifinals are completed to unlock and set up the Final!
    if (!isLiga) {
      const semi1Ida = updatedMatches.find((m) => m.id === 'semi1_ida');
      const semi1Volta = updatedMatches.find((m) => m.id === 'semi1_volta');
      const semi2Ida = updatedMatches.find((m) => m.id === 'semi2_ida');
      const semi2Volta = updatedMatches.find((m) => m.id === 'semi2_volta');

      const agg1 = calculateCupAggregate(semi1Ida, semi1Volta);
      const agg2 = calculateCupAggregate(semi2Ida, semi2Volta);

      const finalist1 = agg1.winnerId
        ? currentTournament.players.find((p) => p.id === agg1.winnerId)
        : null;
      const finalist2 = agg2.winnerId
        ? currentTournament.players.find((p) => p.id === agg2.winnerId)
        : null;

      updatedTournament.matches = updatedTournament.matches.map((m) => {
        if (m.id === 'final_ida') {
          return {
            ...m,
            playerHome: finalist1,
            playerAway: finalist2,
            status: finalist1 && finalist2 ? 'pendente' : 'bloqueado',
          };
        }
        if (m.id === 'final_volta') {
          return {
            ...m,
            playerHome: finalist2,
            playerAway: finalist1,
            status: finalist1 && finalist2 ? 'pendente' : 'bloqueado',
          };
        }
        return m;
      });
    }

    setCurrentTournament(updatedTournament);
  };

  // Check completion to enable Finish button
  const canFinish = useMemo(() => {
    if (isLiga) {
      const allRegularDone = currentTournament.matches.every(
        (m) => m.scoreHome !== null && m.scoreAway !== null
      );
      if (!allRegularDone) return false;
      // If absolute tie, tiebreaker match must also be completed
      if (leagueData?.absoluteTie) {
        return (
          currentTournament.tieBreakerMatch &&
          currentTournament.tieBreakerMatch.scoreHome !== null &&
          currentTournament.tieBreakerMatch.scoreAway !== null &&
          currentTournament.tieBreakerMatch.scoreHome !== currentTournament.tieBreakerMatch.scoreAway
        );
      }
      return true;
    } else {
      // Cup mode: all 6 matches done
      const allDone = currentTournament.matches.every(
        (m) => m.scoreHome !== null && m.scoreAway !== null
      );
      if (!allDone) return false;

      // Also check penalties if aggregates tied
      const semi1 = calculateCupAggregate(
        currentTournament.matches[0],
        currentTournament.matches[1]
      );
      const semi2 = calculateCupAggregate(
        currentTournament.matches[2],
        currentTournament.matches[3]
      );
      const finalMatch = calculateCupAggregate(
        currentTournament.matches[4],
        currentTournament.matches[5]
      );

      return semi1.isCompleted && semi2.isCompleted && finalMatch.isCompleted;
    }
  }, [currentTournament, isLiga, leagueData]);

  const handleFinish = () => {
    confetti({
      particleCount: 150,
      spread: 80,
      origin: { y: 0.6 },
      colors: ['#00ff87', '#60efff', '#ffffff', '#ffd700'],
    });
    onFinishTournament();
  };

  return (
    <div className="max-w-6xl mx-auto py-6 px-4 space-y-8">
      {/* Tournament Header */}
      <div className="bg-[#101726] border border-[#1e2a42] rounded-2xl p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[11px] font-mono uppercase tracking-widest text-eafc-neon font-bold">
              {isLiga ? 'MODO LIGA (PONTOS CORRIDOS)' : 'MODO COPA (MATA-MATA)'}
            </span>
            <span className="text-[10px] bg-emerald-950 text-eafc-neon px-2 py-0.5 rounded font-bold border border-emerald-800">
              EM ANDAMENTO
            </span>
          </div>
          <h2 className="text-2xl font-bold font-display text-white">
            {isLiga ? 'Disputa Todos Contra Todos' : 'Mata-Mata: Semifinais & Grande Final'}
          </h2>
          <p className="text-slate-400 text-xs mt-1">
            Total de 6 partidas com espelhamento inegociável de times na volta.
          </p>
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <button
            onClick={cancelTournament}
            className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-red-400 hover:bg-red-950/30 rounded-xl border border-transparent hover:border-red-900/40 transition-all"
          >
            Cancelar Campeonato
          </button>
          <button
            onClick={handleFinish}
            disabled={!canFinish}
            className={`px-6 py-2.5 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all ${
              canFinish
                ? 'bg-gradient-to-r from-eafc-neon to-emerald-400 text-black shadow-neon hover:opacity-95'
                : 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
            }`}
          >
            <Trophy className="w-4 h-4" />
            Finalizar Campeonato
          </button>
        </div>
      </div>

      {/* Main Content Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Matches Section */}
        <div className={isLiga ? 'lg:col-span-7 space-y-6' : 'lg:col-span-12 space-y-6'}>
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Swords className="w-5 h-5 text-eafc-neon" />
              Tabela de Jogos
            </h3>
            <span className="text-xs text-slate-400">
              Digite os placares em tempo real
            </span>
          </div>

          <div className="space-y-4">
            {currentTournament.matches.map((match, idx) => {
              const isLocked = match.status === 'bloqueado';
              const isVolta = match.isLeg === 'volta';

              return (
                <div
                  key={match.id}
                  className={`bg-[#0d1422] border rounded-2xl p-4 sm:p-5 transition-all ${
                    isLocked
                      ? 'border-[#1a2335] opacity-50'
                      : 'border-[#1e2a40] hover:border-slate-600'
                  }`}
                >
                  {/* Match Header Badge */}
                  <div className="flex items-center justify-between text-xs text-slate-400 pb-3 mb-3 border-b border-[#182236]">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-eafc-neon font-bold">
                        JOGO #{idx + 1}
                      </span>
                      <span>•</span>
                      <span className="font-semibold text-slate-300">
                        {match.matchupName || match.stageName}
                      </span>
                    </div>
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                        isVolta
                          ? 'bg-cyan-950 text-cyan-300 border border-cyan-800'
                          : 'bg-slate-800 text-slate-300'
                      }`}
                    >
                      {isVolta ? 'Jogo de Volta (Inversão)' : 'Jogo de Ida'}
                    </span>
                  </div>

                  {/* Match Body */}
                  {isLocked ? (
                    <div className="py-6 text-center text-slate-500 text-xs">
                      Aguardando definição dos finalistas das semifinais...
                    </div>
                  ) : (
                    <div className="grid grid-cols-11 items-center gap-2 sm:gap-4">
                      {/* Mandante */}
                      <div className="col-span-4 flex items-center gap-2 sm:gap-3">
                        <div className="w-10 h-10 rounded-xl bg-black/40 p-1.5 border border-slate-800 shrink-0 flex items-center justify-center">
                          <img
                            src={match.teamHome.logo}
                            alt={match.teamHome.name}
                            className={`w-full h-full object-contain ${
                              match.teamHome.invertInDark ? 'filter brightness-0 invert' : ''
                            }`}
                          />
                        </div>
                        <div className="overflow-hidden">
                          <h4 className="font-bold text-white text-xs sm:text-sm truncate">
                            {match.playerHome?.name || 'A definir'}
                          </h4>
                          <p className="text-[10px] sm:text-xs text-slate-400 truncate">
                            {match.teamHome.name}
                          </p>
                        </div>
                      </div>

                      {/* Placar Inputs */}
                      <div className="col-span-3 flex items-center justify-center gap-2">
                        <input
                          type="number"
                          min="0"
                          value={match.scoreHome === null ? '' : match.scoreHome}
                          onChange={(e) =>
                            handleScoreChange(match.id, 'scoreHome', e.target.value)
                          }
                          placeholder="-"
                          className="w-11 h-12 text-center text-lg font-bold bg-[#080d17] border border-[#223049] rounded-xl text-white focus:outline-none focus:border-eafc-neon focus:ring-1 focus:ring-eafc-neon"
                        />
                        <span className="text-slate-500 font-bold text-sm">x</span>
                        <input
                          type="number"
                          min="0"
                          value={match.scoreAway === null ? '' : match.scoreAway}
                          onChange={(e) =>
                            handleScoreChange(match.id, 'scoreAway', e.target.value)
                          }
                          placeholder="-"
                          className="w-11 h-12 text-center text-lg font-bold bg-[#080d17] border border-[#223049] rounded-xl text-white focus:outline-none focus:border-eafc-neon focus:ring-1 focus:ring-eafc-neon"
                        />
                      </div>

                      {/* Visitante */}
                      <div className="col-span-4 flex items-center justify-end gap-2 sm:gap-3 text-right">
                        <div className="overflow-hidden">
                          <h4 className="font-bold text-white text-xs sm:text-sm truncate">
                            {match.playerAway?.name || 'A definir'}
                          </h4>
                          <p className="text-[10px] sm:text-xs text-slate-400 truncate">
                            {match.teamAway.name}
                          </p>
                        </div>
                        <div className="w-10 h-10 rounded-xl bg-black/40 p-1.5 border border-slate-800 shrink-0 flex items-center justify-center">
                          <img
                            src={match.teamAway.logo}
                            alt={match.teamAway.name}
                            className={`w-full h-full object-contain ${
                              match.teamAway.invertInDark ? 'filter brightness-0 invert' : ''
                            }`}
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Copa Penalties inputs if Volta has aggregate tie */}
                  {!isLiga && isVolta && !isLocked && (
                    <PenaltiesInput
                      match={match}
                      allMatches={currentTournament.matches}
                      onChange={handleScoreChange}
                    />
                  )}
                </div>
              );
            })}
          </div>

          {/* Absolute Tie Extra Match Card (Fase 5) */}
          {isLiga && leagueData?.absoluteTie && (
            <div className="bg-amber-950/30 border border-amber-500/50 rounded-2xl p-5 shadow-lg">
              <div className="flex items-center gap-3 mb-3">
                <AlertCircle className="w-6 h-6 text-amber-400" />
                <div>
                  <h4 className="font-bold text-amber-200 text-base">
                    Empate Absoluto no Topo da Liga!
                  </h4>
                  <p className="text-xs text-amber-300/80">
                    Houve empate total em Pontos, Saldo, Gols Pró e Confronto Direto entre os líderes:
                    {' '}{leagueData.tiedLeaders.map((p) => p.name).join(' e ')}.
                  </p>
                </div>
              </div>

              {!currentTournament.tieBreakerMatch ? (
                <button
                  onClick={() => {
                    const extraMatch = {
                      id: 'extra_tiebreaker',
                      matchupName: 'Jogo Extra de Desempate (Mata-Mata)',
                      playerHome: leagueData.tiedLeaders[0],
                      playerAway: leagueData.tiedLeaders[1],
                      teamHome: currentTournament.drawnTeams[0],
                      teamAway: currentTournament.drawnTeams[1],
                      scoreHome: null,
                      scoreAway: null,
                    };
                    setCurrentTournament({
                      ...currentTournament,
                      tieBreakerMatch: extraMatch,
                    });
                  }}
                  className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs rounded-xl"
                >
                  Habilitar Partida Extra de Desempate
                </button>
              ) : (
                <div className="bg-[#0b101a] border border-amber-500/30 rounded-xl p-4 mt-2">
                  <p className="text-xs text-amber-400 font-semibold mb-2">Partida Decisiva:</p>
                  <div className="flex items-center justify-between gap-4">
                    <span className="text-sm font-bold text-white">
                      {currentTournament.tieBreakerMatch.playerHome.name}
                    </span>
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        min="0"
                        value={
                          currentTournament.tieBreakerMatch.scoreHome === null
                            ? ''
                            : currentTournament.tieBreakerMatch.scoreHome
                        }
                        onChange={(e) => {
                          const val = e.target.value === '' ? null : parseInt(e.target.value, 10);
                          setCurrentTournament({
                            ...currentTournament,
                            tieBreakerMatch: {
                              ...currentTournament.tieBreakerMatch,
                              scoreHome: val,
                            },
                          });
                        }}
                        className="w-10 h-10 text-center bg-black border border-slate-700 rounded-lg text-white font-bold"
                      />
                      <span>x</span>
                      <input
                        type="number"
                        min="0"
                        value={
                          currentTournament.tieBreakerMatch.scoreAway === null
                            ? ''
                            : currentTournament.tieBreakerMatch.scoreAway
                        }
                        onChange={(e) => {
                          const val = e.target.value === '' ? null : parseInt(e.target.value, 10);
                          setCurrentTournament({
                            ...currentTournament,
                            tieBreakerMatch: {
                              ...currentTournament.tieBreakerMatch,
                              scoreAway: val,
                            },
                          });
                        }}
                        className="w-10 h-10 text-center bg-black border border-slate-700 rounded-lg text-white font-bold"
                      />
                    </div>
                    <span className="text-sm font-bold text-white">
                      {currentTournament.tieBreakerMatch.playerAway.name}
                    </span>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Live League Standings Sidebar (Mode Liga) */}
        {isLiga && leagueData && (
          <div className="lg:col-span-5 space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Trophy className="w-5 h-5 text-amber-400" />
                Classificação em Tempo Real
              </h3>
            </div>

            <div className="bg-[#101726] border border-[#1e2a42] rounded-2xl p-5 overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="text-slate-400 border-b border-[#1c273d] uppercase font-mono text-[10px]">
                    <th className="pb-2.5">Pos</th>
                    <th className="pb-2.5">Jogador</th>
                    <th className="pb-2.5 text-center">PTS</th>
                    <th className="pb-2.5 text-center">J</th>
                    <th className="pb-2.5 text-center">V</th>
                    <th className="pb-2.5 text-center">E</th>
                    <th className="pb-2.5 text-center">D</th>
                    <th className="pb-2.5 text-center">GP</th>
                    <th className="pb-2.5 text-center">SG</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#182338]">
                  {leagueData.standings.map((row, pos) => (
                    <tr
                      key={row.player.id}
                      className={pos === 0 ? 'bg-emerald-950/30' : ''}
                    >
                      <td className="py-3 font-bold">
                        <span
                          className={`w-5 h-5 rounded-md flex items-center justify-center text-[10px] ${
                            pos === 0
                              ? 'bg-amber-400 text-black font-black'
                              : 'bg-slate-800 text-slate-300'
                          }`}
                        >
                          {pos + 1}
                        </span>
                      </td>
                      <td className="py-3 font-semibold text-white">
                        <div>
                          <span>{row.player.name}</span>
                          {row.player.nickname && (
                            <span className="block text-[10px] text-slate-400 font-normal">
                              {row.player.nickname}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="py-3 text-center font-black text-eafc-neon text-sm">
                        {row.points}
                      </td>
                      <td className="py-3 text-center text-slate-300">{row.matchesPlayed}</td>
                      <td className="py-3 text-center text-slate-300">{row.wins}</td>
                      <td className="py-3 text-center text-slate-300">{row.draws}</td>
                      <td className="py-3 text-center text-slate-300">{row.losses}</td>
                      <td className="py-3 text-center text-slate-400">{row.goalsFor}</td>
                      <td
                        className={`py-3 text-center font-bold ${
                          row.goalDifference > 0
                            ? 'text-emerald-400'
                            : row.goalDifference < 0
                            ? 'text-red-400'
                            : 'text-slate-400'
                        }`}
                      >
                        {row.goalDifference > 0 ? `+${row.goalDifference}` : row.goalDifference}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <div className="mt-4 pt-4 border-t border-[#182338] text-[11px] text-slate-400 space-y-1">
                <p className="font-semibold text-slate-300">Critérios de Desempate:</p>
                <p>1º Pontos • 2º Saldo • 3º Gols Pró • 4º Confronto Direto • 5º Jogo Extra</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

/**
 * Penalties UI helper for Cup Volta matches
 */
const PenaltiesInput = ({ match, allMatches, onChange }) => {
  const matchIda = allMatches.find(
    (m) =>
      (m.stage === match.stage && m.isLeg === 'ida') ||
      (match.id === 'final_volta' && m.id === 'final_ida')
  );

  if (!matchIda) return null;

  const agg = calculateCupAggregate(matchIda, match);

  if (!agg.needsPenalties) {
    if (agg.isCompleted) {
      return (
        <div className="mt-3 pt-3 border-t border-[#182338] flex items-center justify-between text-xs">
          <span className="text-slate-400">
            Placar Agregado: <strong className="text-white">{agg.aggregateB} x {agg.aggregateA}</strong>
          </span>
          <span className="text-eafc-neon font-bold flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5" />
            Classificado no tempo normal
          </span>
        </div>
      );
    }
    return null;
  }

  return (
    <div className="mt-3 pt-3 border-t border-[#182338] bg-cyan-950/20 p-3 rounded-xl border border-cyan-800/40">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-bold text-cyan-300">
          Empate no Agregado ({agg.aggregateB} x {agg.aggregateA}) → Decisão por Pênaltis Diretos:
        </span>
        {agg.winnerId && (
          <span className="text-xs text-eafc-neon font-bold">
            Vencedor definido!
          </span>
        )}
      </div>

      <div className="flex items-center justify-center gap-4">
        <div className="flex items-center gap-2">
          <span className="text-xs text-white">{match.playerHome?.name}:</span>
          <input
            type="number"
            min="0"
            placeholder="Pên"
            value={match.penaltiesHome === null ? '' : match.penaltiesHome}
            onChange={(e) => onChange(match.id, 'penaltiesHome', e.target.value)}
            className="w-12 h-9 text-center bg-black border border-cyan-500/50 rounded-lg text-white font-bold text-sm"
          />
        </div>
        <span className="text-slate-400 text-xs">x</span>
        <div className="flex items-center gap-2">
          <input
            type="number"
            min="0"
            placeholder="Pên"
            value={match.penaltiesAway === null ? '' : match.penaltiesAway}
            onChange={(e) => onChange(match.id, 'penaltiesAway', e.target.value)}
            className="w-12 h-9 text-center bg-black border border-cyan-500/50 rounded-lg text-white font-bold text-sm"
          />
          <span className="text-xs text-white">{match.playerAway?.name}:</span>
        </div>
      </div>
    </div>
  );
};

