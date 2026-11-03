import React, { useRef, useState } from 'react';
import { Download, Upload, RefreshCw, Database, Shield, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { useTournamentStore } from '../store/useTournamentStore';
import { TEAMS } from '../data/teams';

export const SettingsView = () => {
  const { exportBackup, importBackup, resetAllData } = useTournamentStore();
  const fileInputRef = useRef(null);
  const [feedback, setFeedback] = useState(null);

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const content = event.target?.result;
        const res = importBackup(content);
        if (res.success) {
          setFeedback({ type: 'success', message: 'Backup importado com sucesso!' });
        } else {
          setFeedback({ type: 'error', message: res.error || 'Erro ao importar backup.' });
        }
      } catch (err) {
        setFeedback({ type: 'error', message: 'Arquivo JSON inválido ou corrompido.' });
      }
    };
    reader.readAsText(file);
    // Reset file input value
    e.target.value = '';
  };

  const handleReset = () => {
    if (confirm('ATENÇÃO: Isso apagará todos os jogadores, campeonatos e histórico do Hall da Fama! Deseja continuar?')) {
      resetAllData();
      setFeedback({ type: 'success', message: 'Dados restaurados para o padrão inicial.' });
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-6 px-4 space-y-8">
      <div>
        <span className="text-xs uppercase font-mono tracking-wider text-eafc-neon font-bold">
          SISTEMA & MEMÓRIA LOCAL
        </span>
        <h2 className="text-2xl font-bold font-display text-white mt-1">Configurações & Backup</h2>
        <p className="text-slate-400 text-sm mt-1">
          Todos os dados ficam salvos automaticamente no navegador (localStorage). Use a exportação para levar seu Hall da Fama para outro PC ou celular.
        </p>
      </div>

      {feedback && (
        <div
          className={`p-4 rounded-xl border flex items-center justify-between ${
            feedback.type === 'success'
              ? 'bg-emerald-950/60 border-emerald-500/50 text-emerald-200'
              : 'bg-red-950/60 border-red-500/50 text-red-200'
          }`}
        >
          <div className="flex items-center gap-3">
            {feedback.type === 'success' ? (
              <CheckCircle2 className="w-5 h-5 text-eafc-neon" />
            ) : (
              <AlertTriangle className="w-5 h-5 text-red-400" />
            )}
            <span className="text-sm font-medium">{feedback.message}</span>
          </div>
          <button
            onClick={() => setFeedback(null)}
            className="text-xs underline hover:text-white"
          >
            Fechar
          </button>
        </div>
      )}

      {/* Backup and Restore Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Export */}
        <div className="bg-[#101726] border border-[#1e2a42] rounded-2xl p-6 flex flex-col justify-between">
          <div>
            <div className="w-12 h-12 rounded-xl bg-eafc-neon/10 border border-eafc-neon/40 text-eafc-neon flex items-center justify-center mb-4">
              <Download className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white mb-1">Exportar Dados (Backup)</h3>
            <p className="text-xs text-slate-400 leading-relaxed mb-6">
              Baixe um arquivo JSON contendo todo o Elenco, o campeonato ativo e o Hall da Fama acumulado.
            </p>
          </div>
          <button
            onClick={exportBackup}
            className="w-full py-3 bg-[#19263e] hover:bg-eafc-neon hover:text-black text-white font-bold rounded-xl text-sm transition-all flex items-center justify-center gap-2 border border-[#2b3c63] hover:border-transparent"
          >
            <Download className="w-4 h-4" />
            Baixar Arquivo JSON
          </button>
        </div>

        {/* Import */}
        <div className="bg-[#101726] border border-[#1e2a42] rounded-2xl p-6 flex flex-col justify-between">
          <div>
            <div className="w-12 h-12 rounded-xl bg-cyan-500/10 border border-cyan-500/40 text-cyan-400 flex items-center justify-center mb-4">
              <Upload className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white mb-1">Importar Dados</h3>
            <p className="text-xs text-slate-400 leading-relaxed mb-6">
              Restaure um arquivo JSON salvo anteriormente para continuar campeonatos ou atualizar o Hall da Fama.
            </p>
          </div>
          <div>
            <input
              type="file"
              accept=".json"
              ref={fileInputRef}
              onChange={handleFileUpload}
              className="hidden"
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              className="w-full py-3 bg-gradient-to-r from-cyan-500/20 to-blue-600/20 hover:from-cyan-500/30 hover:to-blue-600/30 text-cyan-300 font-bold rounded-xl text-sm transition-all flex items-center justify-center gap-2 border border-cyan-500/40"
            >
              <Upload className="w-4 h-4" />
              Selecionar Arquivo JSON
            </button>
          </div>
        </div>
      </div>

      {/* Pool de Times Hardcoded Visual Inspection */}
      <div className="bg-[#101726] border border-[#1e2a42] rounded-2xl p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <span className="text-xs uppercase font-mono tracking-wider text-eafc-neon font-bold">
              CATÁLOGO OFICIAL DE CLUBES
            </span>
            <h3 className="text-lg font-bold text-white mt-0.5">Pool de Times Hardcoded (9 Clubes)</h3>
          </div>
          <span className="text-xs text-slate-400 font-mono">
            4 Tier S • 5 Tier A
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
          {TEAMS.map((team) => (
            <div
              key={team.id}
              className="bg-[#0b101a] border border-[#1d293d] rounded-xl p-3 flex items-center gap-3"
            >
              <div className="w-10 h-10 rounded-lg bg-black/40 flex items-center justify-center p-1.5 border border-slate-800 shrink-0">
                <img
                  src={team.logo}
                  alt={team.name}
                  className={`w-full h-full object-contain ${
                    team.invertInDark ? 'filter brightness-0 invert' : ''
                  }`}
                  loading="lazy"
                />
              </div>
              <div className="overflow-hidden">
                <div className="flex items-center gap-2">
                  <h4 className="font-semibold text-white text-xs truncate">{team.name}</h4>
                  <span
                    className={`text-[10px] px-1.5 py-0.2 rounded font-bold ${
                      team.tier === 'S'
                        ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                        : 'bg-blue-500/20 text-blue-300 border border-blue-500/40'
                    }`}
                  >
                    Tier {team.tier}
                  </span>
                </div>
                <p className="text-[10px] font-mono text-slate-400 mt-0.5">{team.shortName}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Danger Zone */}
      <div className="bg-red-950/20 border border-red-900/40 rounded-2xl p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h4 className="text-red-400 font-bold text-sm flex items-center gap-2">
              <AlertTriangle className="w-4 h-4" />
              Zona de Perigo
            </h4>
            <p className="text-xs text-slate-400 mt-1">
              Deseja zerar tudo e restaurar a lista inicial de teste? Essa ação é irreversível.
            </p>
          </div>
          <button
            onClick={handleReset}
            className="px-4 py-2 bg-red-900/40 hover:bg-red-700 text-red-200 text-xs font-bold rounded-xl border border-red-700/60 transition-all"
          >
            Restaurar Padrões de Fábrica
          </button>
        </div>
      </div>
    </div>
  );
};

