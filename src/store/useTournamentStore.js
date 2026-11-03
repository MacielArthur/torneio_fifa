import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

const DEFAULT_PLAYERS = [
  { id: 'p1', name: 'Jogador 1', nickname: 'Craque', createdAt: Date.now() - 3000 },
  { id: 'p2', name: 'Jogador 2', nickname: 'Goleador', createdAt: Date.now() - 2000 },
  { id: 'p3', name: 'Jogador 3', nickname: 'Paredão', createdAt: Date.now() - 1000 },
  { id: 'p4', name: 'Jogador 4', nickname: 'Capitão', createdAt: Date.now() },
];

export const useTournamentStore = create(
  persist(
    (set, get) => ({
      // State
      players: DEFAULT_PLAYERS,
      selectedPlayerIds: ['p1', 'p2', 'p3'], // default to 3 selected
      currentTournament: null,
      history: [],
      hallOfFame: {},

      // Navigation / UI active tab
      activeTab: 'elenco', // 'elenco' | 'torneio' | 'hall' | 'config'
      setActiveTab: (tab) => set({ activeTab: tab }),

      // --- PLAYER (ELENCO) ACTIONS ---
      addPlayer: (name, nickname = '') => {
        const trimmedName = name.trim();
        if (!trimmedName) return false;
        
        const newPlayer = {
          id: 'player_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4),
          name: trimmedName,
          nickname: nickname.trim(),
          createdAt: Date.now(),
        };

        set((state) => {
          const updatedPlayers = [...state.players, newPlayer];
          // Auto-select if we have less than 4 selected
          const updatedSelected = state.selectedPlayerIds.length < 4
            ? [...state.selectedPlayerIds, newPlayer.id]
            : state.selectedPlayerIds;

          return {
            players: updatedPlayers,
            selectedPlayerIds: updatedSelected,
          };
        });

        return true;
      },

      updatePlayer: (id, name, nickname = '') => {
        const trimmedName = name.trim();
        if (!trimmedName) return false;

        set((state) => ({
          players: state.players.map((p) =>
            p.id === id ? { ...p, name: trimmedName, nickname: nickname.trim() } : p
          ),
        }));
        return true;
      },

      deletePlayer: (id) => {
        const { currentTournament } = get();
        // Prevent deletion if player is active in ongoing tournament
        if (
          currentTournament &&
          currentTournament.status === 'em_andamento' &&
          currentTournament.players.some((p) => p.id === id)
        ) {
          alert('Não é possível excluir um jogador enquanto um campeonato estiver em andamento com ele!');
          return false;
        }

        set((state) => ({
          players: state.players.filter((p) => p.id !== id),
          selectedPlayerIds: state.selectedPlayerIds.filter((pId) => pId !== id),
        }));
        return true;
      },

      togglePlayerSelection: (id) => {
        set((state) => {
          const isSelected = state.selectedPlayerIds.includes(id);
          if (isSelected) {
            return { selectedPlayerIds: state.selectedPlayerIds.filter((pId) => pId !== id) };
          } else {
            if (state.selectedPlayerIds.length >= 4) {
              alert('O torneio suporta no máximo 4 jogadores (Copa mata-mata). Desmarque alguém para selecionar outro.');
              return state;
            }
            return { selectedPlayerIds: [...state.selectedPlayerIds, id] };
          }
        });
      },

      clearPlayerSelection: () => set({ selectedPlayerIds: [] }),

      // --- BACKUP & PERSISTÊNCIA ACTIONS ---
      exportBackup: () => {
        const state = get();
        const exportData = {
          version: '1.0.0',
          exportedAt: new Date().toISOString(),
          players: state.players,
          currentTournament: state.currentTournament,
          history: state.history,
          hallOfFame: state.hallOfFame,
        };

        const jsonString = `data:text/json;charset=utf-8,${encodeURIComponent(
          JSON.stringify(exportData, null, 2)
        )}`;
        const downloadAnchor = document.createElement('a');
        downloadAnchor.setAttribute('href', jsonString);
        downloadAnchor.setAttribute(
          'download',
          `ea-fc-torneio-backup-${new Date().toISOString().split('T')[0]}.json`
        );
        document.body.appendChild(downloadAnchor);
        downloadAnchor.click();
        downloadAnchor.remove();
      },

      importBackup: (jsonContent) => {
        try {
          const parsed = typeof jsonContent === 'string' ? JSON.parse(jsonContent) : jsonContent;
          if (!parsed || !Array.isArray(parsed.players)) {
            throw new Error('Arquivo de backup inválido: lista de jogadores ausente.');
          }

          set({
            players: parsed.players || [],
            selectedPlayerIds: (parsed.players || []).slice(0, 3).map((p) => p.id),
            currentTournament: parsed.currentTournament || null,
            history: parsed.history || [],
            hallOfFame: parsed.hallOfFame || {},
            activeTab: parsed.currentTournament ? 'torneio' : 'elenco',
          });
          return { success: true };
        } catch (err) {
          console.error('Erro ao importar backup:', err);
          return { success: false, error: err.message };
        }
      },

      resetAllData: () => {
        set({
          players: DEFAULT_PLAYERS,
          selectedPlayerIds: ['p1', 'p2', 'p3'],
          currentTournament: null,
          history: [],
          hallOfFame: {},
          activeTab: 'elenco',
        });
      },

      // Placeholder for tournament engine (expanded in Phase 2)
      setCurrentTournament: (tournament) => set({ currentTournament: tournament }),
      cancelTournament: () => {
        if (confirm('Tem certeza que deseja cancelar o campeonato em andamento? Nenhum dado dele será gravado no Hall da Fama.')) {
          set({ currentTournament: null, activeTab: 'elenco' });
        }
      },
      updateHistoryAndHallOfFame: (completedTournament, updatedHallOfFame) => {
        set((state) => ({
          history: [completedTournament, ...state.history],
          hallOfFame: updatedHallOfFame,
          currentTournament: null,
          activeTab: 'hall',
        }));
      },
    }),
    {
      name: 'ea_fc_tournament_storage',
      storage: createJSONStorage(() => localStorage),
    }
  )
);

