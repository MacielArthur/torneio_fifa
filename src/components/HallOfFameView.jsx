import React, { useState } from 'react';
import { 
  Trophy, Flame, Award, Calendar, ChevronDown, ChevronUp, 
  Crown, Target, ShieldCheck, History 
} from 'lucide-react';
import { useTournamentStore } from '../store/useTournamentStore';

export const HallOfFameView = () => {
  const { hallOfFame, history, setActiveTab } = useTournamentStore();
  const [expandedTournamentId, setExpandedTournamentId] = useState(null);

  const statsList = Object.values(hallOfFame || {});

  // Sort: 1º Titles, 2º Points, 3º Goal Difference, 4º Goals For
  const rankedPlayers = [...statsList].sort((a, b) => {
    if (b.titles !== a.titles) return b.titles - a.titles;
    if (b.points !== a.points) return b.points - a.points;
    if (b.goalDifference !== a.goalDifference) return b.goalDifference - a.goalDifference;
    return b.goalsFor - a.goalsFor;
  });

  // Highlight figures
  const topChampion = rankedPlayers[0]?.titles > 0 ? rankedPlayers[0] : null;

  const topScorer = [...statsList].sort((a, b) => b.goalsFor - a.goalsFor)[0]?.goalsFor > 0
    ? [...statsList].sort((a, b) => b.goalsFor - a.goalsFor)[0]
    : null;

  // Biggest blowout across all players
  let historicBlowout = null;
  statsList.forEach((p) => {
    if (p.biggestWin) {
      if (!historicBlowout || p.biggestWin.margin > historicBlowout.margin) {
        historicBlowout = {
          ...p.biggestWin,
          winnerName: p.name,
        };
      }
    }
  });

  return (
    <div className="max-w-6xl mx-auto py-6 px-4 space-y-8">
      {/* Title Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs uppercase font-mono tracking-wider text-eafc-neon font-bold">
            LEGADO & HISTÓRICO
          </span>
          <h2 className="text-2xl font-bold font-display text-white mt-1">Hall da Fama</h2>
          <p className="text-slate-400 text-xs mt-1">
            Estatísticas perpétuas de todos os torneios concluídos entre amigos.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs font-mono bg-[#111827] border border-[#1e2a42] px-3 py-1.5 rounded-xl text-slate-300">
          <History className="w-4 h-4 text-eafc-neon" />
          <span>{history.length} Torneio{history.length !== 1 ? 's' : ''} Concluído{history.length !== 1 ? 's' : ''}</span>
        </div>
      </div>

      {statsList.length === 0 ? (
        <div className="bg-[#101726] border border-dashed border-[#1e2a42] rounded-2xl p-12 text-center">
          <Trophy className="w-12 h-12 text-slate-600 mx-auto mb-3" />
          <h3 className="text-lg font-bold text-slate-300 mb-1">Hall da Fama vazio</h3>
          <p className="text-slate-500 text-xs max-w-md mx-auto mb-6">
            Nenhum campeonato foi finalizado ainda. Conclua uma Liga ou Copa para registrar títulos,
            gols da resenha e as maiores goleadas!
          </p>
          <button
            onClick={() => setActiveTab('elenco')}
            className="px-5 py-2.5 bg-eafc-neon text-black font-bold rounded-xl text-xs shadow-neon"
          >
            Começar Primeiro Torneio
          </button>
        </div>
      ) : (
        <>
          {/* Highlight Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Rei dos Títulos */}
            <div className="bg-gradient-to-br from-[#121c2e] to-[#0d1424] border border-amber-500/40 rounded-2xl p-5 shadow-lg relative overflow-hidden">
              <div className="flex items-center justify-between mb-3">
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-amber-400">
                  REI DOS TÍTULOS
                </span>
                <Crown className="w-5 h-5 text-amber-400" />
              </div>
              <h4 className="text-xl font-bold text-white font-display truncate">
                {topChampion ? topChampion.name : 'Ainda indefinido'}
              </h4>
              <p className="text-amber-300 text-sm font-semibold mt-1">
                {topChampion ? `${topChampion.titles} Troféu${topChampion.titles > 1 ? 's' : ''}` : 'Nenhum campeão'}
              </p>
            </div>

            {/* Artilheiro da Resenha */}
            <div className="bg-gradient-to-br from-[#121c2e] to-[#0d1424] border border-eafc-neon/40 rounded-2xl p-5 shadow-neon relative overflow-hidden">
              <div className="flex items-center justify-between mb-3">
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-eafc-neon">
                  GOLS DA RESENHA
                </span>
                <Target className="w-5 h-5 text-eafc-neon" />
              </div>
              <h4 className="text-xl font-bold text-white font-display truncate">
                {topScorer ? topScorer.name : 'Ainda indefinido'}
              </h4>
              <p className="text-eafc-neon text-sm font-semibold mt-1">
                {topScorer ? `${topScorer.goalsFor} Gols Marcados` : '0 gols'}
              </p>
            </div>

            {/* Maior Goleada */}
            <div className="bg-gradient-to-br from-[#121c2e] to-[#0d1424] border border-cyan-500/40 rounded-2xl p-5 shadow-lg relative overflow-hidden">
              <div className="flex items-center justify-between mb-3">
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-cyan-400">
                  MAIOR GOLEADA
                </span>
                <Flame className="w-5 h-5 text-cyan-400" />
              </div>
              {historicBlowout ? (
                <>
                  <h4 className="text-xl font-bold text-white font-display truncate">
                    {historicBlowout.winnerName} {historicBlowout.goalsFor} x {historicBlowout.goalsAgainst} {historicBlowout.opponentName}
                  </h4>
                  <p className="text-cyan-300 text-xs font-semibold mt-1">
                    Goleada com {historicBlowout.teamUsed}
                  </p>
                </>
              ) : (
                <p className="text-slate-400 text-xs mt-3">Aguardando goleadas...</p>
              )}
            </div>
          </div>

          {/* Leaderboard Table */}
          <div className="bg-[#101726] border border-[#1e2a42] rounded-2xl p-6 overflow-x-auto">
            <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              <Trophy className="w-5 h-5 text-eafc-neon" />
              Tabela Histórica Geral
            </h3>

            <table className="w-full text-left text-xs">
              <thead>
                <tr className="text-slate-400 border-b border-[#1c273d] uppercase font-mono text-[10px]">
                  <th className="pb-3">#</th>
                  <th className="pb-3">Jogador</th>
                  <th className="pb-3 text-center">Títulos 🏆</th>
                  <th className="pb-3 text-center">Torneios</th>
                  <th className="pb-3 text-center">Partidas</th>
                  <th className="pb-3 text-center">V</th>
                  <th className="pb-3 text-center">E</th>
                  <th className="pb-3 text-center">D</th>
                  <th className="pb-3 text-center">Gols Feitos</th>
                  <th className="pb-3 text-center">Gols Sofridos</th>
                  <th className="pb-3 text-center">Saldo</th>
                  <th className="pb-3 text-center">Pontos Totais</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#182338]">
                {rankedPlayers.map((player, idx) => (
                  <tr
                    key={player.playerId}
                    className={idx === 0 ? 'bg-amber-950/20' : 'hover:bg-slate-800/20'}
                  >
                    <td className="py-3.5 font-bold">
                      <span
                        className={`w-6 h-6 rounded-md flex items-center justify-center text-xs ${
                          idx === 0
                            ? 'bg-amber-400 text-black font-black'
                            : idx === 1
                            ? 'bg-slate-300 text-black font-bold'
                            : idx === 2
                            ? 'bg-amber-700 text-white font-bold'
                            : 'text-slate-400'
                        }`}
                      >
                        {idx + 1}
                      </span>
                    </td>
                    <td className="py-3.5 font-semibold text-white">
                      <div className="flex items-center gap-2">
                        <span>{player.name}</span>
                        {player.nickname && (
                          <span className="text-[10px] text-eafc-neon">"{player.nickname}"</span>
                        )}
                      </div>
                    </td>
                    <td className="py-3.5 text-center font-black text-amber-400 text-sm">
                      {player.titles}
                    </td>
                    <td className="py-3.5 text-center text-slate-300">{player.tournamentsPlayed}</td>
                    <td className="py-3.5 text-center text-slate-300">{player.matchesPlayed}</td>
                    <td className="py-3.5 text-center text-emerald-400 font-semibold">{player.wins}</td>
                    <td className="py-3.5 text-center text-slate-400">{player.draws}</td>
                    <td className="py-3.5 text-center text-red-400">{player.losses}</td>
                    <td className="py-3.5 text-center font-bold text-white">{player.goalsFor}</td>
                    <td className="py-3.5 text-center text-slate-400">{player.goalsAgainst}</td>
                    <td
                      className={`py-3.5 text-center font-bold ${
                        player.goalDifference > 0
                          ? 'text-emerald-400'
                          : player.goalDifference < 0
                          ? 'text-red-400'
                          : 'text-slate-400'
                      }`}
                    >
                      {player.goalDifference > 0 ? `+${player.goalDifference}` : player.goalDifference}
                    </td>
                    <td className="py-3.5 text-center font-black text-eafc-neon text-sm">
                      {player.points}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Tournaments History Log */}
          {history.length > 0 && (
            <div className="bg-[#101726] border border-[#1e2a42] rounded-2xl p-6">
              <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                <Calendar className="w-5 h-5 text-cyan-400" />
                Histórico de Torneios Realizados
              </h3>

              <div className="space-y-3">
                {history.map((h, i) => {
                  const isExpanded = expandedTournamentId === h.id;
                  const dateFormatted = new Date(h.finishedAt || h.createdAt).toLocaleDateString(
                    'pt-BR',
                    { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }
                  );

                  return (
                    <div
                      key={h.id}
                      className="bg-[#0b101a] border border-[#1d293d] rounded-xl overflow-hidden"
                    >
                      <div
                        onClick={() =>
                          setExpandedTournamentId(isExpanded ? null : h.id)
                        }
                        className="p-4 flex items-center justify-between cursor-pointer hover:bg-slate-800/30 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
                            <Trophy className="w-5 h-5" />
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-white text-sm">
                                Campeão: {h.champion?.name || 'Indefinido'}
                              </span>
                              <span className="text-[10px] px-2 py-0.5 rounded bg-[#16233a] text-cyan-300 font-mono">
                                {h.format === 'liga' ? 'Modo Liga' : 'Modo Copa'}
                              </span>
                            </div>
                            <p className="text-[11px] text-slate-400">{dateFormatted}</p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 text-slate-400 text-xs">
                          <span>{h.matches.length} partidas</span>
                          {isExpanded ? (
                            <ChevronUp className="w-4 h-4" />
                          ) : (
                            <ChevronDown className="w-4 h-4" />
                          )}
                        </div>
                      </div>

                      {/* Expandable Match Results */}
                      {isExpanded && (
                        <div className="p-4 bg-[#090d16] border-t border-[#182438] space-y-2">
                          <p className="text-xs font-semibold text-slate-300 mb-2">Partidas do Torneio:</p>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            {h.matches.map((m, mIdx) => (
                              <div
                                key={m.id || mIdx}
                                className="bg-[#101726] p-2.5 rounded-lg border border-[#1b263b] flex items-center justify-between text-xs"
                              >
                                <span className="font-semibold text-slate-300">
                                  {m.playerHome?.name} ({m.teamHome?.shortName})
                                </span>
                                <span className="font-black text-eafc-neon font-mono px-2">
                                  {m.scoreHome} x {m.scoreAway}
                                  {m.penaltiesHome !== null && m.penaltiesAway !== null && (
                                    <span className="text-[10px] text-cyan-300 font-normal ml-1">
                                      ({m.penaltiesHome}x{m.penaltiesAway} pên)
                                    </span>
                                  )}
                                </span>
                                <span className="font-semibold text-slate-300 text-right">
                                  ({m.teamAway?.shortName}) {m.playerAway?.name}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

