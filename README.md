# PDV Mercado Profissional Online

Sistema PDV online para mercado com venda rapida, estoque, produtos com ou sem codigo de barras, pagamento misto, fiado, vendas minimizadas, recibo, auditoria e relatorios gerenciais.

## Stack

- Next.js 14 App Router
- React
- TypeScript
- Tailwind CSS
- PostgreSQL
- Prisma ORM
- Zod
- React Hook Form
- Zustand
- Recharts
- bcryptjs
- JWT em cookie HTTP-only

## Deploy na Vercel

Este projeto foi preparado para rodar com banco PostgreSQL conectado pela Vercel, como Neon ou Prisma Postgres.

No painel da Vercel, configure estas variaveis em Production:

```txt
DATABASE_URL=postgresql://usuario:senha@host.neon.tech/banco?sslmode=require
JWT_SECRET=uma-chave-grande-com-no-minimo-32-caracteres
JWT_EXPIRES_IN=7d
NEXT_PUBLIC_APP_NAME=Mercadinho Alameda das Arvores
NEXT_PUBLIC_APP_VERSION=1.0.0
```

O deploy da Vercel usa `npm run vercel-build`, que executa:

```bash
prisma generate
prisma db push
prisma db seed
next build
```

Assim, ao fazer redeploy com `DATABASE_URL` configurado, o schema do banco e os usuarios iniciais sao criados automaticamente.

## Usuarios iniciais

```txt
usuario: admin
senha: admin123
```

```txt
usuario: vendedor
senha: vendedor123
```

## Desenvolvimento opcional

Para rodar localmente, crie um `.env` com uma URL PostgreSQL real de um provedor externo.

```bash
npm install
npm run dev
```

## Rotas principais

```txt
/login
/app/dashboard
/app/vendas
/app/produtos
/app/estoque
/app/historico
/app/fiado
/app/relatorios
/app/auditoria
/app/usuarios
/app/configuracoes
```
