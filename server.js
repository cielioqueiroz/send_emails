require('dotenv').config();
const express = require('express');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const { body, validationResult } = require('express-validator');
const nodemailer = require('nodemailer');
const sanitizeHtml = require('sanitize-html');

const PORT = Number(process.env.PORT) || 3000;
const SMTP_USER = process.env.SMTP_USER;
const SMTP_PASS = process.env.SMTP_PASS;
const SMTP_HOST = process.env.SMTP_HOST || 'smtp.office365.com';
const SMTP_PORT = Number(process.env.SMTP_PORT) || 587;

const smtpConfigured = Boolean(SMTP_USER && SMTP_PASS);
if (!smtpConfigured) {
  console.warn('[AVISO] SMTP_USER/SMTP_PASS não definidos no .env — envio de e-mails ficará desabilitado.');
}

const transporter = smtpConfigured
  ? nodemailer.createTransport({
      host: SMTP_HOST,
      port: SMTP_PORT,
      secure: SMTP_PORT === 465,
      auth: { user: SMTP_USER, pass: SMTP_PASS },
    })
  : null;

if (transporter) {
  transporter.verify((err) => {
    if (err) console.warn('[SMTP] Falha ao verificar transporte:', err.message);
    else console.log('[SMTP] Conexão verificada com sucesso');
  });
}

const app = express();
app.disable('x-powered-by');

app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", 'https://fonts.googleapis.com', 'https://cdn.jsdelivr.net', "'unsafe-inline'"],
        scriptSrc: ["'self'", 'https://cdn.jsdelivr.net', 'https://unpkg.com'],
        fontSrc: ["'self'", 'https://fonts.gstatic.com', 'data:'],
        imgSrc: ["'self'", 'data:'],
        connectSrc: ["'self'"],
      },
    },
  })
);

app.use(express.json({ limit: '50kb' }));
app.use(express.static('public', { maxAge: '1h' }));

const emailLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Limite de envios atingido. Tente novamente em 15 minutos.' },
});

const stripAllHtml = (input) =>
  sanitizeHtml(input, { allowedTags: [], allowedAttributes: {} });

const sanitizeMessage = (input) =>
  sanitizeHtml(input, {
    allowedTags: ['b', 'i', 'em', 'strong', 'a', 'p', 'br', 'ul', 'ol', 'li', 'span'],
    allowedAttributes: { a: ['href', 'title', 'target', 'rel'] },
    allowedSchemes: ['http', 'https', 'mailto'],
    transformTags: {
      a: sanitizeHtml.simpleTransform('a', { rel: 'noopener noreferrer', target: '_blank' }),
    },
  });

app.post(
  '/send-email',
  emailLimiter,
  [
    body('recipient')
      .isEmail()
      .withMessage('E-mail de destinatário inválido')
      .normalizeEmail()
      .isLength({ max: 254 }),
    body('subject')
      .isString()
      .trim()
      .isLength({ min: 1, max: 200 })
      .withMessage('Assunto deve ter entre 1 e 200 caracteres'),
    body('message')
      .isString()
      .trim()
      .isLength({ min: 1, max: 5000 })
      .withMessage('Mensagem deve ter entre 1 e 5000 caracteres'),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ error: errors.array()[0].msg });
    }

    if (!transporter) {
      return res.status(503).json({
        error: 'Serviço de e-mail não configurado. Defina SMTP_USER e SMTP_PASS no .env.',
      });
    }

    const { recipient, subject, message } = req.body;

    const safeSubject = stripAllHtml(subject);
    const safeHtml = sanitizeMessage(message).replace(/\n/g, '<br>');
    const safeText = stripAllHtml(message);

    try {
      const info = await transporter.sendMail({
        from: SMTP_USER,
        to: recipient,
        subject: safeSubject,
        html: safeHtml,
        text: safeText,
      });
      console.log(`[OK] Mensagem enviada: ${info.messageId} -> ${recipient}`);
      return res.json({ message: 'E-mail enviado com sucesso!' });
    } catch (error) {
      console.error('[ERRO] Falha ao enviar e-mail:', error.message);
      return res.status(500).json({ error: 'Não foi possível enviar o e-mail. Tente novamente.' });
    }
  }
);

app.use((req, res) => res.status(404).json({ error: 'Rota não encontrada' }));

app.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
});
