import React, { useState } from 'react';
import { UserPlus, Check, Trash2, Edit2, ShieldAlert, Sparkles, Trophy, Users2, ArrowRight } from 'lucide-react';
import { useTournamentStore } from '../store/useTournamentStore';

export const ElencoView = ({ onStartTournamentTrigger }) => {
  const {
    players,
    selectedPlayerIds,
    addPlayer,
    updatePlayer,
    deletePlayer,
    togglePlayerSelection,
    clearPlayerSelection,
    currentTournament,
    setActiveTab,
  } = useTournamentStore();

  const [newName, setNewName] = useState('');
  const [newNickname, setNewNickname] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [editName, setEditName] = useState('');
  const [editNickname, setEditNickname] = useState('');

  const selectedCount = selectedPlayerIds.length;
  const isValidFormat = selectedCount === 3 || selectedCount === 4;

  const handleAdd = (e) => {
    e.preventDefault();
    if (!newName.trim()) return;
    addPlayer(newName, newNickname);
    setNewName('');
    setNewNickname('');
  };

  const startEdit = (player) => {
    setEditingId(player.id);
    setEditName(player.name);
    setEditNickname(player.nickname || '');
  };

  const saveEdit = (id) => {
    if (!editName.trim()) return;
    updatePlayer(id, editName, editNickname);
    setEditingId(null);
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto py-6 px-4">
      {/* Active Tournament Alert Banner if one already exists */}
      {currentTournament && (
        <div className="bg-gradient-to-r from-emerald-950/90 to-slate-900 border border-eafc-neon/50 rounded-2xl p-5 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-neon">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-eafc-neon/20 border border-eafc-neon flex items-center justify-center text-eafc-neon">
              <Trophy className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <h3 className="text-white font-bold text-lg">Existe um torneio em andamento!</h3>
              <p className="text-slate-300 text-sm">
                Formato: <span className="text-eafc-neon font-semibold">{currentTournament.format === 'liga' ? 'Liga (3 Jogadores)' : 'Copa Mata-Mata (4 Jogadores)'}</span> • 6 partidas no total.
              </p>
            </div>
          </div>
          <button
            onClick={() => setActiveTab('torneio')}
            className="w-full sm:w-auto px-5 py-2.5 bg-eafc-neon text-black font-bold rounded-xl text-sm hover:bg-emerald-400 transition-all flex items-center justify-center gap-2 shadow-neon"
          >
            Ir para os Jogos
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Top Section: Overview & Format Selector Banner */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="md:col-span-2 bg-[#101726] border border-[#1e2a42] rounded-2xl p-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-eafc-neon/5 rounded-full blur-3xl -z-0 pointer-events-none" />

          <div className="flex items-center justify-between mb-4">
            <div>
              <span className="text-xs uppercase font-mono tracking-wider text-eafc-neon font-bold">
                GERENCIAMENTO DE PARTICIPANTES
              </span>
              <h2 className="text-2xl font-bold font-display text-white mt-1">Elenco Oficial</h2>
            </div>
            <span className="bg-[#19243b] text-slate-300 text-xs px-3 py-1.5 rounded-full font-semibold border border-[#2b3c63]">
              {players.length} Cadastrado{players.length !== 1 ? 's' : ''}
            </span>
          </div>

          <p className="text-slate-400 text-sm leading-relaxed mb-6">
            Cadastre os jogadores e selecione quem participará da resenha. O sistema detectará
            automaticamente o formato ideal: <strong className="text-slate-200">3 jogadores (Liga Pontos Corridos)</strong> ou{' '}
            <strong className="text-slate-200">4 jogadores (Copa Mata-Mata)</strong>.
          </p>

          {/* Quick Selection Status Box */}
          <div className="bg-[#0b101a] border border-[#1f2b45] rounded-xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3 w-full sm:w-auto">
              <div
                className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-lg ${
                  isValidFormat
                    ? 'bg-eafc-neon text-black shadow-neon'
                    : 'bg-slate-800 text-slate-400'
                }`}
              >
                {selectedCount}
              </div>
              <div>
                <p className="text-xs text-slate-400">Status da Seleção</p>
                <p className="text-sm font-semibold text-white">
                  {selectedCount === 3 && (
                    <span className="text-eafc-neon">Modo Liga: 3 Jogadores (Todos contra Todos)</span>
                  )}
                  {selectedCount === 4 && (
                    <span className="text-cyan-400">Modo Copa: 4 Jogadores (Mata-Mata)</span>
                  )}
                  {selectedCount < 3 && (
                    <span className="text-amber-400">Selecione pelo menos 3 jogadores</span>
                  )}
                  {selectedCount > 4 && (
                    <span className="text-red-400">Máximo permitido: 4 jogadores</span>
                  )}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
              {selectedCount > 0 && (
                <button
                  onClick={clearPlayerSelection}
                  className="text-xs text-slate-400 hover:text-white px-3 py-1.5 rounded-lg hover:bg-slate-800 transition-colors"
                >
                  Limpar
                </button>
              )}
              <button
                disabled={!isValidFormat || !!currentTournament}
                onClick={onStartTournamentTrigger}
                className={`px-5 py-2.5 rounded-xl font-bold text-sm flex items-center gap-2 transition-all ${
                  isValidFormat && !currentTournament
                    ? 'bg-gradient-to-r from-eafc-neon to-emerald-400 text-black shadow-neon hover:opacity-95'
                    : 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
                }`}
              >
                <Sparkles className="w-4 h-4" />
                Sortear & Iniciar
              </button>
            </div>
          </div>
        </div>

        {/* Cadastro Card */}
        <div className="bg-[#101726] border border-[#1e2a42] rounded-2xl p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 text-eafc-neon font-bold text-sm uppercase font-mono mb-2">
              <UserPlus className="w-4 h-4" />
              Novo Jogador
            </div>
            <p className="text-xs text-slate-400 mb-4">
              Adicione um amigo para competir e acumular estatísticas no Hall da Fama.
            </p>

            <form onSubmit={handleAdd} className="space-y-3">
              <div>
                <label className="text-[11px] font-semibold text-slate-300 uppercase tracking-wider block mb-1">
                  Nome Completo / Principal *
                </label>
                <input
                  type="text"
                  placeholder="Ex: Carlos"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="w-full bg-[#0a0f1d] border border-[#1e2d4a] rounded-xl px-3.5 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-eafc-neon focus:ring-1 focus:ring-eafc-neon transition-all"
                />
              </div>

              <div>
                <label className="text-[11px] font-semibold text-slate-300 uppercase tracking-wider block mb-1">
                  Apelido de Guerra (Opcional)
                </label>
                <input
                  type="text"
                  placeholder="Ex: O Bruxo"
                  value={newNickname}
                  onChange={(e) => setNewNickname(e.target.value)}
                  className="w-full bg-[#0a0f1d] border border-[#1e2d4a] rounded-xl px-3.5 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-eafc-neon focus:ring-1 focus:ring-eafc-neon transition-all"
                />
              </div>

              <button
                type="submit"
                disabled={!newName.trim()}
                className="w-full mt-2 py-2.5 bg-[#1b263d] hover:bg-eafc-neon hover:text-black text-white font-semibold rounded-xl text-sm border border-[#2b3c63] hover:border-transparent transition-all flex items-center justify-center gap-2 disabled:opacity-40 disabled:hover:bg-[#1b263d] disabled:hover:text-white"
              >
                <UserPlus className="w-4 h-4" />
                Cadastrar no Elenco
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Players List Grid */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <Users2 className="w-5 h-5 text-eafc-neon" />
            Jogadores Disponíveis ({players.length})
          </h3>
          <p className="text-xs text-slate-400">Clique no card para marcar/desmarcar quem jogará este torneio</p>
        </div>

        {players.length === 0 ? (
          <div className="text-center py-12 bg-[#0e1422] border border-dashed border-[#1e2a42] rounded-2xl">
            <Users2 className="w-12 h-12 text-slate-600 mx-auto mb-3" />
            <h4 className="text-slate-300 font-semibold mb-1">Nenhum jogador cadastrado</h4>
            <p className="text-slate-500 text-xs">Cadastre os jogadores acima para começar.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {players.map((player) => {
              const isSelected = selectedPlayerIds.includes(player.id);
              const isEditing = editingId === player.id;

              return (
                <div
                  key={player.id}
                  onClick={() => {
                    if (!isEditing) togglePlayerSelection(player.id);
                  }}
                  className={`relative cursor-pointer transition-all duration-200 rounded-2xl p-5 border ${
                    isSelected
                      ? 'bg-gradient-to-br from-[#121c2e] to-[#0c1322] border-eafc-neon/70 shadow-neon'
                      : 'bg-[#0f1624] border-[#1d293d] hover:border-slate-600'
                  }`}
                >
                  {/* Selected check badge */}
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-11 h-11 rounded-xl flex items-center justify-center font-display font-bold text-lg ${
                          isSelected
                            ? 'bg-eafc-neon text-black font-black'
                            : 'bg-slate-800 text-slate-300'
                        }`}
                      >
                        {player.name.substring(0, 2).toUpperCase()}
                      </div>
                      <div>
                        {isEditing ? (
                          <div className="space-y-1.5" onClick={(e) => e.stopPropagation()}>
                            <input
                              type="text"
                              value={editName}
                              onChange={(e) => setEditName(e.target.value)}
                              className="bg-black/60 border border-eafc-neon/60 rounded px-2 py-0.5 text-xs text-white"
                            />
                            <input
                              type="text"
                              placeholder="Apelido"
                              value={editNickname}
                              onChange={(e) => setEditNickname(e.target.value)}
                              className="bg-black/60 border border-slate-700 rounded px-2 py-0.5 text-xs text-slate-300"
                            />
                            <div className="flex gap-1.5 mt-1">
                              <button
                                onClick={() => saveEdit(player.id)}
                                className="px-2 py-0.5 bg-eafc-neon text-black text-[10px] font-bold rounded"
                              >
                                Salvar
                              </button>
                              <button
                                onClick={() => setEditingId(null)}
                                className="px-2 py-0.5 bg-slate-700 text-white text-[10px] rounded"
                              >
                                Cancelar
                              </button>
                            </div>
                          </div>
                        ) : (
                          <>
                            <h4 className="font-bold text-white text-base leading-tight">
                              {player.name}
                            </h4>
                            {player.nickname ? (
                              <p className="text-xs text-eafc-neon font-medium mt-0.5">
                                "{player.nickname}"
                              </p>
                            ) : (
                              <p className="text-[11px] text-slate-500 mt-0.5">Sem apelido</p>
                            )}
                          </>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
                      {!isEditing && (
                        <>
                          <button
                            onClick={() => startEdit(player)}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-slate-300 hover:bg-slate-800 transition-colors"
                            title="Editar jogador"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => deletePlayer(player.id)}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-red-400 hover:bg-red-950/40 transition-colors"
                            title="Excluir jogador"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </>
                      )}

                      <div
                        className={`w-6 h-6 rounded-lg flex items-center justify-center border transition-all ${
                          isSelected
                            ? 'bg-eafc-neon border-eafc-neon text-black'
                            : 'border-slate-700 bg-slate-900/50 text-transparent'
                        }`}
                      >
                        <Check className="w-3.5 h-3.5 stroke-[3]" />
                      </div>
                    </div>
                  </div>

                  {/* Card Footer */}
                  <div className="pt-2 border-t border-[#1a2538] flex items-center justify-between text-[11px] text-slate-400">
                    <span>
                      {isSelected ? (
                        <span className="text-eafc-neon font-semibold flex items-center gap-1">
                          ● Convocado para jogar
                        </span>
                      ) : (
                        <span>No banco de reservas</span>
                      )}
                    </span>
                    <span className="font-mono text-slate-500">
                      ID: {player.id.substring(player.id.length - 4)}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

