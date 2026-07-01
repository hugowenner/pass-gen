# 🔑 Password Secure Generator

Aplicação web simples para **gerar uma senha e compartilhar por link**, sem banco de dados, sem login e sem painel administrativo. A criptografia acontece no navegador com a **Web Crypto API** nativa.

## Como funciona

1. Você preenche empresa/tamanho/opções e clica em **"Gerar senha"**.
2. Clica em **"Criar Link"** — a senha (empresa, senha e data de criação) é criptografada no navegador com **AES-256-GCM** e vira um token na URL: `/view/TOKEN`.
3. Você copia e envia o link para outra pessoa.
4. Essa pessoa abre o link, vê a empresa e a senha oculta, e clica em **"👁 Mostrar senha"** para revelar (sem precisar de senha ou chave extra).
5. O link **expira sozinho em 24 horas** — depois disso a página mostra "Este link expirou." e a senha nunca é exibida.

Não há backend, banco de dados, login ou API: a senha só existe dentro do próprio token do link.

## O que foi removido na simplificação

Este projeto já teve uma versão com chave de proteção manual (PBKDF2 + senha de confirmação) e QR Code. Essa camada extra foi removida a pedido para deixar o fluxo direto: **gerar senha → criar link → abrir → mostrar senha**, sem etapas de configuração de chave.

## Tecnologias

- [Next.js](https://nextjs.org/) (App Router) + React + TypeScript
- [Tailwind CSS](https://tailwindcss.com/)
- Web Crypto API (nativa do navegador) — AES-256-GCM

## Estrutura de pastas

```
src/
  app/
    layout.tsx        # layout raiz (tema escuro)
    page.tsx           # página inicial (gerador)
    globals.css
    view/
      [token]/
        page.tsx       # página de visualização (/view/TOKEN)
  components/
    PasswordGenerator.tsx
    PasswordViewer.tsx
    Toast.tsx
  lib/
    crypto.ts           # AES-256-GCM + expiração de 24h
    password.ts          # geração de senha
```

## Rodando localmente

Pré-requisitos: [Node.js](https://nodejs.org/) 18.18+ instalado.

```bash
npm install
npm run dev
```

Acesse [http://localhost:3000](http://localhost:3000).

Para gerar o build de produção localmente:

```bash
npm run build
npm run start
```

## Publicando gratuitamente na Vercel

### Opção 1 — via site da Vercel (mais simples)

1. Suba este projeto para um repositório no GitHub, GitLab ou Bitbucket.
2. Acesse [vercel.com](https://vercel.com/) e crie uma conta gratuita (pode usar login com GitHub).
3. Clique em **"Add New… → Project"** e selecione o repositório.
4. A Vercel detecta automaticamente que é um projeto Next.js — não é necessário configurar nada.
5. Clique em **Deploy**. Em poucos minutos você recebe uma URL pública (`https://seu-projeto.vercel.app`).

### Opção 2 — via CLI da Vercel

```bash
npm install -g vercel
vercel login
vercel --prod
```

Nenhuma variável de ambiente, banco de dados ou serviço adicional é necessário.

## Funções principais (`lib/`)

| Função | Arquivo | Descrição |
|---|---|---|
| `generatePassword()` | `lib/password.ts` | Gera senha aleatória respeitando categorias e tamanho |
| `createShareLink()` | `lib/crypto.ts` | Criptografa empresa + senha + data com AES-256-GCM e retorna o token do link |
| `revealSharedPassword()` | `lib/crypto.ts` | Descriptografa o token e verifica se passou de 24 horas |
| `copyClipboard()` | `lib/crypto.ts` | Copia texto para a área de transferência |

## Aviso importante

Qualquer pessoa com o link consegue ver a senha (não há chave extra) — trate o link como se fosse a própria senha. Ele deixa de funcionar automaticamente depois de 24 horas.
