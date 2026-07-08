# PDV Mercado Profissional Online

Sistema PDV online para mercado com venda rápida, estoque, produtos com ou sem código de barras, pagamento misto, fiado, vendas minimizadas, recibo, auditoria e relatórios gerenciais.

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

## Instalação

```bash
npm install
cp .env.example .env
```

Configure `DATABASE_URL` no `.env`.

## Banco

```bash
npx prisma generate
npx prisma migrate dev --name init
npm run db:seed
```

Usuário inicial:

```txt
usuário: admin
senha: admin123
```

Também é criado um vendedor:

```txt
usuário: vendedor
senha: vendedor123
```

## Executar

```bash
npm run dev
```

Acesse:

```txt
http://localhost:3000/login
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

## Observação técnica

Este pacote não inclui `node_modules`. Instale as dependências antes de executar. A validação feita no zip é estrutural: presença de módulos, schema, rotas, páginas, serviços, configurações e scripts. O build completo depende de instalar dependências e conectar um PostgreSQL real.
