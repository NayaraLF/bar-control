# Sobrado's Bar Gestão — Regras de Negócio

Sistema de gestão para bar com dois módulos: Comandas e Estoque.
Interface em português do Brasil, valores em R$ (formato 1.234,56).

## Lógica de Doses

- Itens de estoque podem ser controlados em ml (destilados) ou unidade (cervejas, petiscos)
- Uma garrafa (item de estoque) pode gerar múltiplos produtos de venda
- Cada produto de venda define quanto consome do item de estoque por unidade vendida
- Exemplo: garrafa de 1000 ml → dose de 50 ml = 20 doses possíveis
- "Dose de Cachaça" (50 ml) e "Caipirinha" (50 ml) descontam da mesma garrafa de cachaça

## Fechamento de Conta

- A comanda SÓ fecha quando o valor total estiver 100% quitado
- Duas formas de dividir:
  - Partes iguais: total ÷ número de pessoas
  - Por itens: cada pessoa escolhe o que consumiu
- Formas de pagamento aceitas: Dinheiro, Pix, Cartão de Débito, Cartão de Crédito
- Pagamento misto é permitido (ex.: parte Pix + parte dinheiro)
- No pagamento em dinheiro, calcular troco = valor recebido − valor devido
- Guardar histórico das comandas fechadas com as formas de pagamento usadas

## Integração Comandas ↔ Estoque

- Ao adicionar item na comanda → descontar do estoque automaticamente
- Ao remover item da comanda → devolver ao estoque automaticamente
- Estoque ≤ mínimo → alerta visível em TODOS os aparelhos
- Estoque = 0 → avisar mas NÃO bloquear a venda

## Usuários e Papéis

- **Garçom:** abre/edita comandas, visualiza estoque
- **Caixa:** fecha contas, gerencia pagamentos, visualiza estoque
- **Admin:** acesso total, incluindo cadastro de produtos e gestão de estoque

## Interface

- Português do Brasil
- Valores em R$ com formato brasileiro (1.234,56)
- Responsiva: celular, tablet e computador
- Botões grandes, fluxo rápido para uso durante o movimento
- Modo claro e modo escuro (escolha do usuário, salva no aparelho)

## Técnico

- Sincronização em tempo real via Firestore
- Modo offline: dados salvos localmente e enviados quando a internet voltar
- Conflitos: usar transações do Firestore para operações atômicas
- PWA-ready: funciona pelo navegador sem instalar

## Fora do Escopo (v1)

Nota fiscal, integração com maquininha, delivery, taxa de serviço, descontos.
