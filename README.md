# 🎮 EA FC Tournament Manager (FIFA)

Aplicativo web completo para gerenciamento de torneios presenciais de EA FC (FIFA) entre amigos e familiares, com foco em justiça esportiva, sorteio matemático espelhado e estatísticas perpétuas (Hall da Fama).

---

## ⚡ Funcionalidades Implementadas

### 1. Elenco & Convocação Inteligente
- Cadastro, edição e remoção de jogadores (com nome e apelido de guerra).
- Detecção automática de formato:
  - **3 Jogadores Selecionados:** Modo Liga (Todos contra Todos - 6 partidas).
  - **4 Jogadores Selecionados:** Modo Copa (Mata-Mata: Semifinais e Grande Final - 6 partidas).
- Trava lógica de proteção: impede iniciar campeonatos com números incorretos ou excluir jogadores em torneio ativo.

### 2. Regra Inegociável de Ida e Volta com Inversão de Times
- Pool hardcoded com os 9 maiores clubes da Europa (4 Tier S e 5 Tier A) com escudos oficiais de alta resolução.
- Cada confronto direto tem **jogo de Ida e Volta**: quem jogou com o Time 1 na ida, joga com o Time 2 na volta. Fim da desculpa de time desequilibrado!

### 3. Painel de Jogos em Tempo Real & Proteção "Dedo Gordo"
- Inputs de placar com atualização dinâmica imediata da tabela de classificação.
- Recálculo retroativo seguro: alterar o placar de uma partida anterior atualiza instantaneamente pontos, saldo e posições.
- Decisão por pênaltis diretos na Copa se houver empate no placar agregado (ida + volta).
- Detecção automática de **Empate Absoluto** na Liga (Pontos, SG, GP e Confronto Direto) liberando a partida extra de desempate.

### 4. Hall da Fama & Memória Perpétua
- Trava de encerramento: o botão "Finalizar Campeonato" só é liberado com todos os jogos (e eventuais pênaltis) concluídos.
- Compilação histórica de:
  - 🏆 Rei dos Títulos
  - 🎯 Gols da Resenha (Artilharia Histórica)
  - 🔥 Maior Goleada Registrada
  - Tabela geral com vitórias, empates, derrotas, gols sofridos e aproveitamento.
  - Histórico detalhado de todos os torneios já realizados.

### 5. Persistência 100% Local & Backup JSON
- Armazenamento automático via `localStorage` (sem necessidade de backend ou login).
- Botões de **Exportar Dados (JSON)** e **Importar Dados** para migrar estatísticas entre dispositivos.

---

## 🚀 Como Executar Localmente

### 1. Iniciar servidor de desenvolvimento:
```bash
npm run dev
```

### 2. Rodar bateria de testes unitários:
```bash
npm test
```

### 3. Gerar build de produção:
```bash
npm run build
```

