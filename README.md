# Alexia Câmara — Prontuário eletrônico (backend)

Backend do prontuário: Next.js (App Router) + Prisma + PostgreSQL via Docker + NextAuth,
com três papéis de acesso (ADMIN, PROFISSIONAL, FAMILIAR).

## 1. Subir o banco de dados (Docker)

```bash
docker compose up -d
```

Isso sobe o Postgres na porta `5432` e o Adminer (interface visual do banco,
opcional) em `http://localhost:8081`.

## 2. Configurar variáveis de ambiente

```bash
cp .env.example .env
```

Gere um segredo real para `NEXTAUTH_SECRET`:

```bash
openssl rand -base64 32
```

## 3. Instalar dependências

```bash
npm install
```

## 4. Rodar as migrations

```bash
npx prisma migrate dev --name init
```

Isso cria todas as tabelas descritas em `prisma/schema.prisma`.

> Se você já tinha rodado a migration antes e está atualizando o projeto: o `schema.prisma`
> ganhou um campo novo (`AccessLink.reportId`, para os links de compartilhamento de relatório).
> Rode `npx prisma migrate dev --name access-link-report` para aplicar só essa mudança.

## 5. Popular o banco com dados de exemplo

```bash
npm run db:seed
```

Cria três contas para você testar cada papel:

| Papel        | E-mail                          | Senha        |
|--------------|----------------------------------|--------------|
| Admin        | admin@alexiacamara.com.br        | admin123     |
| Profissional | alexia@alexiacamara.com.br       | alexia123    |
| Familiar     | carla.souza@email.com            | familia123   |

E cria a paciente Marina Souza Lima com as mesmas fases e evoluções da prévia visual.

## 6. Rodar o projeto

```bash
npm run dev
```

Acesse `http://localhost:3000`.

## Estrutura já pronta

- `docker-compose.yml` — Postgres + Adminer
- `prisma/schema.prisma` — modelo de dados completo (usuários, profissional,
  paciente, fases da trilha, evoluções, anexos, familiares, links de acesso, relatórios)
- `prisma/seed.ts` — dados de exemplo
- `lib/prisma.ts` — client Prisma (singleton)
- `lib/auth.ts` — configuração do NextAuth (Credentials + JWT com papel embutido)
- `app/api/auth/[...nextauth]/route.ts` — endpoint de autenticação
- `middleware.ts` — protege `/admin`, `/dashboard` e `/portal` por papel
- `types/next-auth.d.ts` — tipagem da sessão (role, professionalId, patientIds)
- `app/api/patients/route.ts` — exemplo de rota já filtrando dados por papel
- `tailwind.config.ts` — os mesmos tokens de cor/tipografia da prévia visual

## O que já está pronto e 100% ligado ao banco (nada fictício)

**Autenticação**
- `/login` — login real via NextAuth
- Redirecionamento automático por papel a partir de `/`

**Área do profissional/admin (`/dashboard`)**
- Painel com estatísticas reais (pacientes, sessões da semana, adesão média) e **busca dinâmica + filtros** (nome, "em dia" / "atenção necessária"), filtrando em tempo real sobre os dados já carregados
- Cadastro de paciente com fases da trilha (`/dashboard/pacientes/novo`)
- Prontuário do paciente com evoluções e fases reais (`/dashboard/pacientes/[id]`)
- Novo registro de evolução com prévia ao vivo, gravando no banco (`/dashboard/pacientes/[id]/nova-evolucao`) — **incluindo upload real de anexos já na criação** (fotos, PDF, Word)
- **Anexos** — upload, listagem e exclusão reais tanto por sessão de evolução quanto no nível geral do paciente (laudos, avaliações que não pertencem a uma sessão específica). Arquivos ficam salvos fora de `/public`, em `uploads/`, e só são servidos via `/api/files/[attachmentId]`, que confere a sessão antes de entregar o arquivo — familiares e outros profissionais nunca acessam anexos de pacientes que não são seus
- Gestão de acessos — convite por e-mail e link somente-leitura, ambos reais (`/dashboard/pacientes/[id]/acessos`)
- **Relatórios** — geração real a partir dos dados do período escolhido (fases, dor, amplitude, marcos, parecer), com snapshot persistido no banco (`Report.snapshot`), histórico de relatórios já gerados, visualização no layout de marca e exportação em PDF via impressão do navegador (`/dashboard/pacientes/[id]/relatorios`). **Cada relatório pode ser compartilhado por um link próprio**, com duração escolhida pelo profissional (3, 7, 14, 30 dias ou um valor customizado) — o familiar acessa pelo link sem precisar de cadastro, o link expira sozinho e pode ser revogado a qualquer momento
- Perfil do profissional — dados, marca dos relatórios e troca de senha (`/dashboard/perfil`)

**Portal da família (`/portal`)**
- Lista os pacientes realmente vinculados à conta logada
- Visão detalhada somente-leitura por paciente (`/portal/[id]`)

**Acesso público por link (`/acesso/[token]`)**
- Não exige login — valida o token, a expiração e se foi revogado direto no banco

**Convite de familiar (`/convite/[token]`)**
- Familiar define a própria senha, vira um `User` com role `FAMILIAR` de verdade e já é logado

**Administração (`/admin`)**
- Visão geral de usuários, profissionais e pacientes cadastrados

## O que ainda falta

1. PDF do relatório hoje é gerado via impressão do navegador (`window.print()`, com CSS `print:hidden` nos botões); um PDF gerado no servidor (ex: Puppeteer) ficaria mais consistente entre navegadores, mas não é obrigatório para funcionar. ✅
2. Envio de e-mail real no convite de familiar (hoje o link aparece na tela para copiar manualmente)
3. Tela de cadastro de profissionais pelo admin (hoje só existe a Alexia, criada via seed)
4. Em produção, trocar o storage local de anexos (`uploads/` em disco) por um provedor externo (S3, Cloudflare R2 etc.) — funciona bem para um servidor único, mas não escala para múltiplas instâncias

## Observações de segurança para produção

- Trocar `NEXTAUTH_SECRET` e as senhas do `.env` antes de qualquer deploy
- O Postgres do `docker-compose.yml` é para desenvolvimento local — em produção,
  usar um banco gerenciado com senha forte e backups
- Os links de acesso (`AccessLink`) devem ter expiração curta e sempre poder ser
  revogados — isso já está no schema, falta só a tela de revogação chamar a API
