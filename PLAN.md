# BarControl — Plano do Projeto

## Tecnologias

- **Frontend:** React + TypeScript + Vite
- **UI:** Material UI (MUI)
- **Backend/Banco:** Firebase (Firestore, Auth, Hosting)
- **Custo estimado:** R$ 0/mês (plano gratuito do Firebase)

## Fases

### Fase 1 — Estrutura, banco de dados e login

- Criar projeto React + TypeScript com Vite
- Configurar Firebase (Auth + Firestore)
- Tela de login (usuário + senha)
- Cadastro de novos usuários (depois será restrito a admins)
- Modo claro / escuro (escolha salva no aparelho)
- Roteamento com proteção de páginas
- Dashboard básico

### Fase 2 — Cadastro e entrada de estoque

- CRUD de categorias
- CRUD de itens de estoque (com unidade de controle: un, ml, g)
- CRUD de produtos de venda (vinculado ao item de estoque)
- Configuração de doses (garrafa → dose em ml)
- Entrada de mercadoria (reposição)

### Fase 3 — Comandas com baixa automática de estoque

- Criar/abrir comanda (mesa, número ou nome do cliente)
- Buscar e adicionar produtos por nome ou categoria
- Alterar quantidade / remover itens
- Subtotal atualizado em tempo real
- Baixa automática do estoque ao adicionar item
- Devolução ao estoque ao remover item
- Listar todas as comandas abertas

### Fase 4 — Fechamento de conta

- Resumo da comanda com total
- Divisão em partes iguais entre X pessoas
- Divisão por itens (cada pessoa escolhe o que consumiu)
- Pagamento: dinheiro, Pix, débito, crédito
- Pagamento misto (combinar formas)
- Cálculo de troco (dinheiro)
- Comanda só fecha quando 100% quitada
- Histórico de comandas fechadas com formas de pagamento

### Fase 5 — Alertas de reposição e ajustes finais

- Alerta em tempo real quando estoque ≤ mínimo (em todos os aparelhos)
- Aviso (sem bloqueio) quando estoque = 0
- Lista "Precisa repor"
- Gestão de usuários (restringir cadastro a admins)
- Testes finais e deploy para produção
- Passo a passo para acesso pelos aparelhos do bar
