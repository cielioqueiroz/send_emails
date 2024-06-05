require('dotenv').config();
const express = require('express');
const nodemailer = require('nodemailer');
const bodyParser = require('body-parser');

const app = express();
const port = 3000;

app.use(bodyParser.json());
app.use(express.static('public'));  // Servindo arquivos estáticos da pasta 'public'

app.post('/send-email', (req, res) => {
  const { sender, recipient, subject, message } = req.body;

  const variablesUser = process.env.USER;
  const variablesPass = process.env.PASS;

  const transporter = nodemailer.createTransport({
    host: "smtp.office365.com",
    port: 587,
    secure: false,
    auth: {
      user: variablesUser,
      pass: variablesPass,
    },
  });

  const mailOptions = {
    from: sender,
    to: recipient,
    subject: subject,
    html: message,
    text: message,
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.error("Erro ao enviar o email: ", error);
      res.status(500).json({ error: 'Erro ao enviar o email' });
    } else {
      console.log("Email enviado com sucesso: ", info.response);
      res.status(200).json({ message: 'Email enviado com sucesso' });
    }
  });
});

app.listen(port, () => {
  console.log(`Servidor rodando em http://localhost:${port}`);
});
