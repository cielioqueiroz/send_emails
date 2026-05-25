# MailSender

<p align="center">
  <img src="public/img/favicon.svg" width="80" alt="MailSender logo" />
</p>

<p align="center">
  <strong>Aplicação web para envio de e-mails via SMTP, com backend protegido e interface moderna.</strong>
</p>

<p align="center">
  <img alt="Node.js" src="https://img.shields.io/badge/Node.js-18%2B-339933?logo=node.js&logoColor=white" />
  <img alt="Express" src="https://img.shields.io/badge/Express-4.x-000000?logo=express&logoColor=white" />
  <img alt="Nodemailer" src="https://img.shields.io/badge/Nodemailer-8.x-22B573" />
  <img alt="License" src="https://img.shields.io/badge/license-ISC-blue" />
</p>

---

## Sumário

- [Recursos](#recursos)
- [Stack](#stack)
- [Pré-requisitos](#pré-requisitos)
- [Instalação](#instalação)
- [Configuração](#configuração)
- [Execução](#execução)
- [Endpoints da API](#endpoints-da-api)
- [Segurança](#segurança)
- [Estrutura do projeto](#estrutura-do-projeto)
- [Scripts disponíveis](#scripts-disponíveis)
- [Contribuindo](#contribuindo)
- [Licença](#licença)

---

## Recursos

- **Envio SMTP** configurável (Office365 por padrão, compatível com Gmail, Outlook, SendGrid etc.).
- **Validação no servidor** com `express-validator` — tipo, formato e limites de tamanho.
- **Sanitização anti-XSS** com `sanitize-html` — apenas tags básicas permitidas no corpo.
- **Rate limiting** — 5 envios a cada 15 minutos por IP.
- **Cabeçalhos de segurança** via `helmet` (CSP, HSTS, X-Content-Type-Options, etc.).
- **Remetente fixo no servidor** — o cliente não pode forjar o campo `From`.
- **UI moderna e responsiva** com modo escuro automático, contadores de caracteres e feedback em tempo real via SweetAlert2.

---

## Stack

| Camada     | Tecnologia                                                                         |
| ---------- | ---------------------------------------------------------------------------------- |
| Runtime    | Node.js 18+                                                                        |
| Servidor   | Express 4                                                                          |
| E-mail     | Nodemailer 8                                                                       |
| Segurança  | Helmet, express-rate-limit, express-validator, sanitize-html                       |
| Frontend   | HTML5, CSS3 (variáveis nativas), JavaScript ES2020, SweetAlert2, fonte Inter       |

---

## Pré-requisitos

- [Node.js](https://nodejs.org/) versão 18 ou superior
- Conta SMTP válida (Office365, Gmail com senha de app, SendGrid, Mailgun, etc.)

---

## Instalação

```bash
git clone https://github.com/<seu-usuario>/mailsender.git
cd mailsender
npm install
```

---

## Configuração

Copie o arquivo de exemplo e edite com suas credenciais:

```bash
cp .env.example .env
```

```env
# Credenciais SMTP
SMTP_USER=seu-email@empresa.com
SMTP_PASS=sua-senha-ou-app-password

# Servidor SMTP (opcional)
SMTP_HOST=smtp.office365.com
SMTP_PORT=587

# Porta da aplicação
PORT=3000
```

> **Gmail:** habilite verificação em 2 etapas e gere uma [Senha de App](https://myaccount.google.com/apppasswords). Use `SMTP_HOST=smtp.gmail.com` e `SMTP_PORT=587`.

> **Office365:** use sua senha ou um app password. Pode ser necessário habilitar SMTP AUTH na conta.

---

## Execução

```bash
# produção
npm start

# desenvolvimento (hot reload via nodemon)
npm run dev
```

Acesse [http://localhost:3000](http://localhost:3000).

---

## Endpoints da API

### `POST /send-email`

Envia um e-mail.

**Headers**

```
Content-Type: application/json
```

**Body**

```json
{
  "recipient": "destinatario@exemplo.com",
  "subject": "Assunto do e-mail",
  "message": "Conteúdo da mensagem"
}
```

**Respostas**

| Status | Corpo                                                | Descrição                              |
| ------ | ---------------------------------------------------- | -------------------------------------- |
| 200    | `{ "message": "E-mail enviado com sucesso!" }`       | Sucesso                                |
| 400    | `{ "error": "<motivo>" }`                            | Erro de validação                      |
| 429    | `{ "error": "Limite de envios atingido..." }`        | Rate limit atingido                    |
| 503    | `{ "error": "Serviço de e-mail não configurado..." }`| Credenciais SMTP ausentes              |
| 500    | `{ "error": "Não foi possível enviar o e-mail..." }` | Falha interna no envio                 |

---

## Segurança

- O campo **`from`** é fixado no servidor com `SMTP_USER`. Clientes não podem alterar o remetente.
- O corpo HTML é **sanitizado**: somente `b`, `i`, `em`, `strong`, `a`, `p`, `br`, `ul`, `ol`, `li`, `span` são permitidos. Links recebem `rel="noopener noreferrer"` e `target="_blank"` automaticamente.
- **Limites**: destinatário ≤ 254 caracteres (RFC 5321), assunto ≤ 200, mensagem ≤ 5000.
- **Rate limit**: 5 requisições por IP a cada 15 minutos.
- **Segredos** ficam no `.env`, que está no `.gitignore` — nunca comite credenciais.

---

## Estrutura do projeto

```
.
├── public/
│   ├── css/
│   │   └── style.css       # estilos com variáveis CSS e dark mode
│   ├── img/
│   │   └── favicon.svg     # favicon SVG com gradiente
│   ├── index.html          # formulário
│   └── script.js           # lógica do cliente
├── server.js               # servidor Express com middlewares de segurança
├── package.json
├── .env.example
├── .gitignore
└── README.md
```

---

## Scripts disponíveis

| Comando         | Ação                                              |
| --------------- | ------------------------------------------------- |
| `npm start`     | Inicia o servidor em modo produção                |
| `npm run dev`   | Inicia em modo desenvolvimento com hot reload     |

---

## Contribuindo

1. Faça um fork do repositório
2. Crie uma branch: `git checkout -b feature/minha-feature`
3. Commit suas alterações: `git commit -m "feat: adiciona X"`
4. Push: `git push origin feature/minha-feature`
5. Abra um Pull Request

---

## Licença

Distribuído sob a licença ISC. Veja o arquivo de licença para detalhes.

---

<p align="center">
  Feito por <a href="https://github.com/cielioqueiroz">Cielio Queiroz</a>
</p>
