# 🔑 Password Secure Generator

Aplicação web para **gerar e compartilhar senhas com segurança**, sem banco de dados, sem login e sem servidor de armazenamento. Toda a criptografia acontece no navegador do usuário usando a **Web Crypto API** nativa.

## Como funciona

1. Você gera uma senha localmente (usando `crypto.getRandomValues`, nunca `Math.random`).
2. Ao clicar em **"🔐 Criar Link Seguro"**, você define uma chave de proteção (ou deixa o app gerar uma automaticamente).
3. A senha é criptografada no navegador com **AES-256-GCM**, usando uma chave derivada da chave de proteção via **PBKDF2** (250.000 iterações, salt aleatório).
4. O resultado é convertido em Base64 (URL-safe) e vira um token colocado **no fragmento da URL** (`/view#TOKEN`), que nunca é enviado a nenhum servidor.
5. Você envia o link e a chave de proteção (por canais separados) para outra pessoa.
6. Essa pessoa abre o link, informa a chave, e a senha é **descriptografada somente no navegador dela**.

O servidor (Vercel) nunca recebe, processa ou armazena a senha, a chave de proteção ou o conteúdo decifrado — ele apenas serve os arquivos estáticos da aplicação.

## Garantias de segurança

- ❌ Sem banco de dados.
- ❌ Sem login / sistema de usuários.
- ❌ Sem API externa.
- ❌ Sem cookies com dados sensíveis.
- ❌ Sem `localStorage` para dados sensíveis.
- ✅ Todo o payload sensível trafega apenas no fragmento `#` da URL (nunca enviado ao servidor em requisições HTTP).
- ✅ Criptografia AES-256-GCM com chave derivada por PBKDF2 (salt e IV aleatórios por link).
- ✅ Geração de senhas e chaves usando exclusivamente `crypto.getRandomValues`.
- ✅ QR Code gerado localmente (biblioteca client-side, sem chamada a serviços externos).

## Tecnologias

- [Next.js](https://nextjs.org/) (App Router) + React + TypeScript
- [Tailwind CSS](https://tailwindcss.com/)
- Web Crypto API (nativa do navegador)
- [`qrcode`](https://www.npmjs.com/package/qrcode) para geração local de QR Code

## Estrutura de pastas

```
src/
  app/
    layout.tsx        # layout raiz (tema escuro)
    page.tsx           # página inicial (gerador)
    globals.css
    view/
      page.tsx         # página de visualização (/view)
  components/
    PasswordGenerator.tsx
    ShareModal.tsx
    PasswordViewer.tsx
    QRCode.tsx
    Toast.tsx
  lib/
    crypto.ts           # PBKDF2 + AES-256-GCM + geração de chave
    password.ts          # geração de senha e cálculo de força
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
4. A Vercel detecta automaticamente que é um projeto Next.js — não é necessário configurar nada (build command `next build`, output automático).
5. Clique em **Deploy**. Em poucos minutos você recebe uma URL pública (`https://seu-projeto.vercel.app`).

### Opção 2 — via CLI da Vercel

```bash
npm install -g vercel
vercel login
vercel
```

Siga as instruções no terminal. Para publicar em produção:

```bash
vercel --prod
```

Nenhuma variável de ambiente, banco de dados ou serviço adicional é necessário — o projeto é 100% estático/client-side.

## Funções principais (`lib/`)

| Função | Arquivo | Descrição |
|---|---|---|
| `generatePassword()` | `lib/password.ts` | Gera senha aleatória respeitando categorias e tamanho |
| `calculatePasswordStrength()` | `lib/password.ts` | Calcula a força da senha gerada |
| `createSecurePayload()` | `lib/crypto.ts` | Cria os metadados (empresa, data, hora) do compartilhamento |
| `encryptPayload()` | `lib/crypto.ts` | Deriva chave via PBKDF2 e criptografa a senha com AES-256-GCM |
| `decryptPayload()` | `lib/crypto.ts` | Descriptografa a senha a partir do token e da chave de proteção |
| `readShareMetadata()` | `lib/crypto.ts` | Lê empresa/data/hora do token sem precisar da chave |
| `generateKey()` | `lib/crypto.ts` | Gera uma chave de proteção aleatória (`XXXX-XXXX-XXXX-XXXX`) |
| `copyClipboard()` | `lib/crypto.ts` | Copia texto para a área de transferência |

## Aviso importante

Guarde a chave de proteção com cuidado: sem ela, **não há como recuperar a senha** a partir do link — nem mesmo o próprio aplicativo consegue, pois a chave nunca é armazenada em nenhum lugar.
# pass-gen
