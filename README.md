# BarControl

Sistema de gestão para bares e restaurantes com controle de comandas, estoque e pagamentos em tempo real.

## Funcionalidades

### Comandas
- Abertura de comandas por mesa ou nome do cliente
- Adição e remoção de produtos com busca por nome e filtro por categoria
- Controle de quantidade por item com atualização automática do total
- Desconto automático do estoque ao adicionar produto (transação atômica no Firestore)
- Devolução automática ao estoque ao remover produto

### Fechamento de Conta (Checkout)
- Resumo completo do consumo com valores individuais e total
- Divisão da conta em partes iguais (cálculo por pessoa)
- Pagamento misto: combina múltiplas formas na mesma comanda
- Formas de pagamento: Dinheiro, Pix, Cartão de Débito, Cartão de Crédito
- Cálculo automático de troco para pagamentos em dinheiro
- Comanda só fecha quando 100% do valor está quitado
- Botão "Restante" preenche o saldo devedor automaticamente

### Estoque
- Cadastro de categorias de produtos
- Cadastro de itens de estoque com unidade (un, ml, g) e estoque mínimo
- Cadastro de produtos de venda vinculados a itens de estoque
- Definição de consumo por unidade vendida (ex.: dose de 50 ml de uma garrafa de 1000 ml)
- Entrada de estoque com registro de movimentações
- Histórico completo de movimentações (entrada, venda, devolução, ajuste)

### Alertas de Estoque
- Banner global visível em todas as telas
- Alerta vermelho para itens com estoque zerado
- Alerta amarelo para itens abaixo do mínimo
- Clicável: navega direto para a página de estoque
- Dispensável por sessão

### Histórico
- Listagem de todas as comandas fechadas
- Detalhes de cada comanda: itens consumidos e formas de pagamento utilizadas

### Gestão de Usuários
- Cadastro de novos usuários (somente admin)
- Três papéis com permissões distintas:
  - **Garçom:** abre e edita comandas, visualiza estoque
  - **Caixa:** fecha contas, gerencia pagamentos, visualiza estoque
  - **Admin:** acesso total — cadastro de produtos, gestão de estoque e usuários

### Interface
- Tema claro e escuro com alternância manual (preferência salva no dispositivo)
- Layout responsivo para celular, tablet e computador
- Navegação inferior com 3 abas: Comandas, Estoque, Histórico
- Menu de usuário com acesso a configurações e logout
- Toda a interface em português do Brasil
- Valores monetários no formato brasileiro (R$ 1.234,56)

### Segurança e Estabilidade
- Regras de segurança no Firestore com controle por papel do usuário
- Operações de estoque usando transações atômicas (leituras antes de escritas)
- Error Boundary para prevenção de tela branca em caso de erro
- Tratamento de erros em listeners do Firestore
- Registro público de usuários desabilitado (somente admin cria contas)

## Tecnologias

| Camada | Tecnologia | Versão |
|---|---|---|
| Frontend | React | 19 |
| Linguagem | TypeScript | 5.8 |
| Build | Vite | 6 |
| UI | Material UI (MUI) | 7 |
| Roteamento | React Router | 7 |
| Backend/DB | Firebase Firestore | 11 |
| Autenticação | Firebase Auth | 11 |
| Estilização | Emotion | 11 |

## Estrutura do Projeto

```
src/
├── components/
│   ├── ErrorBoundary.tsx       # Prevenção de tela branca
│   ├── Layout.tsx              # Shell da aplicação (navbar, menu, abas)
│   ├── ProtectedRoute.tsx      # Proteção de rotas autenticadas
│   ├── StockAlerts.tsx         # Banner global de alertas de estoque
│   └── stock/
│       ├── CategoryTab.tsx     # CRUD de categorias
│       ├── ProductTab.tsx      # CRUD de produtos de venda
│       ├── StockEntryTab.tsx   # Entrada de estoque
│       └── StockItemTab.tsx    # CRUD de itens de estoque
├── contexts/
│   ├── AuthContext.tsx          # Autenticação e perfil do usuário
│   └── ThemeContext.tsx         # Tema claro/escuro
├── hooks/
│   └── useFirestore.ts         # Hooks de leitura em tempo real
├── pages/
│   ├── Checkout.tsx            # Fechamento de conta com pagamentos
│   ├── ComandaDetail.tsx       # Detalhe da comanda (adicionar/remover itens)
│   ├── Comandas.tsx            # Listagem de comandas abertas
│   ├── Historico.tsx           # Histórico de comandas fechadas
│   ├── Login.tsx               # Tela de login
│   ├── Stock.tsx               # Gestão de estoque (abas)
│   └── Usuarios.tsx            # Gestão de usuários (admin)
├── services/
│   └── firebase.ts             # Configuração do Firebase
├── types/
│   └── index.ts                # Tipos TypeScript do sistema
├── utils/
│   └── format.ts               # Formatação de moeda (R$)
├── theme.ts                    # Tema MUI customizado
├── App.tsx                     # Rotas da aplicação
└── main.tsx                    # Ponto de entrada
```

## Configuração

### Pré-requisitos
- Node.js 18+
- Projeto no Firebase com Firestore e Authentication habilitados

### Instalação

```bash
git clone https://github.com/NayaraLF/bar-control.git
cd bar-control
npm install
```

### Variáveis de Ambiente

Crie um arquivo `.env` na raiz do projeto com as credenciais do seu projeto Firebase. Consulte a [documentação do Firebase](https://firebase.google.com/docs/web/setup) para obter as chaves de configuração.

### Executar

```bash
npm run dev
```

### Build para Produção

```bash
npm run build
```

### Primeiro Acesso

O sistema não possui tela de registro público. Para criar o primeiro usuário admin:

1. No Firebase Console, vá em **Authentication** > **Add user** e crie um usuário com email e senha
2. Copie o **UID** gerado
3. No **Firestore**, crie um documento na coleção `users` com o UID como ID do documento:
   - `uid`: o UID copiado
   - `name`: nome do administrador
   - `email`: email cadastrado
   - `role`: `admin`

Após isso, faça login no sistema e crie os demais usuários pela tela de Usuários.

## Regras de Negócio

- Um item de estoque pode ser controlado em ml (destilados), g (alimentos) ou unidade (cervejas, petiscos)
- Cada produto de venda define quanto consome do item de estoque por unidade vendida
- Estoque zerado gera alerta mas **não bloqueia** a venda
- Movimentações de estoque são imutáveis (não podem ser editadas ou excluídas)
- Transações atômicas garantem consistência entre comanda e estoque

## Licença

Projeto privado.
