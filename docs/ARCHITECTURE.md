# Arquitetura

## Decisão principal

A V1 é online, multiusuário, com banco PostgreSQL central. A versão local/offline pode ser criada depois usando PWA com IndexedDB e fila de sincronização ou Electron conectado ao mesmo backend.

## Camadas

```txt
UI Next.js App Router
API Routes
Services
Prisma ORM
PostgreSQL
```

## Segurança

- Senha com hash bcryptjs.
- JWT em cookie HTTP-only.
- Middleware básico de sessão para `/app`.
- Autorização por perfil e permissões nos services/API routes.
- Soft delete para vendas e produtos.
- Auditoria em alterações críticas.

## Operação de caixa

A tela de venda é client-side para velocidade. Ela usa:

- Zustand para carrinho local.
- Captura global de teclado para leitor de código de barras.
- API para busca de produtos.
- API para finalizar venda.
- Drafts persistidos no banco para vendas minimizadas.

## Regra de estoque

O sistema permite estoque negativo. Se o produto estiver zerado ou negativo, a UI alerta: `Por favor, revisar estoque desse produto.`

## Pagamento

Formas fixas: dinheiro, débito, crédito, pix, outros e fiado. Pagamento misto é permitido. Venda só finaliza com pagamento completo, exceto fiado.
