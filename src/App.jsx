import React from 'react';
import { Header } from './components/Header';
import { ElencoView } from './components/ElencoView';
import { TournamentView } from './components/TournamentView';
import { HallOfFameView } from './components/HallOfFameView';
import { SettingsView } from './components/SettingsView';
import { useTournamentStore } from './store/useTournamentStore';
import { generateTournament } from './utils/tournamentEngine';
import { compileTournamentStats } from './utils/hallOfFameCompiler';

export function App() {
  const {
    activeTab,
    setActiveTab,
    players,
    selectedPlayerIds,
    currentTournament,
    setCurrentTournament,
    hallOfFame,
    updateHistoryAndHallOfFame,
  } = useTournamentStore();

  const handleStartTournament = () => {
    const selected = players.filter((p) => selectedPlayerIds.includes(p.id));
    if (selected.length !== 3 && selected.length !== 4) {
      alert('Selecione exatamente 3 ou 4 participantes para iniciar o torneio.');
      return;
    }

    try {
      const tournament = generateTournament(selected);
      setCurrentTournament(tournament);
      setActiveTab('torneio');
    } catch (err) {
      alert(err.message || 'Erro ao gerar torneio.');
    }
  };

  const handleFinishTournament = () => {
    if (!currentTournament) return;
    try {
      const { updatedHallOfFame, completedTournament } = compileTournamentStats(
        hallOfFame,
        currentTournament
      );
      updateHistoryAndHallOfFame(completedTournament, updatedHallOfFame);
    } catch (err) {
      console.error(err);
      alert('Erro ao finalizar campeonato: ' + err.message);
    }
  };

  return (
    <div className="min-h-screen bg-[#080c14] text-slate-100 flex flex-col font-sans">
      <Header />

      <main className="flex-1 pb-16">
        {activeTab === 'elenco' && (
          <ElencoView onStartTournamentTrigger={handleStartTournament} />
        )}
        {activeTab === 'torneio' && (
          <TournamentView onFinishTournament={handleFinishTournament} />
        )}
        {activeTab === 'hall' && <HallOfFameView />}
        {activeTab === 'config' && <SettingsView />}
      </main>

      <footer className="border-t border-[#162033] py-4 text-center text-xs text-slate-500 font-mono">
        EA FC TOURNAMENT MANAGER • REGRAS INEGOCIÁVEIS DE ESPELHAMENTO & JUSTIÇA
      </footer>
    </div>
  );
}

export default App;

