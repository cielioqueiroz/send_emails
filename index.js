const nodemailer = require('nodemailer');
const transporter = nodemailer.createTransport({
  host: 'smtp.office365.com',
  port: 587,
  secure: false, // true for 465, false for other ports
  auth: {
    user: 'cielioqueiroz@hotmail.com',
    pass: '21_a1219200@'
  }
});

transporter.sendMail({
  from: 'Ciélio Queiroz <cielioqueiroz@hotmail.com>',
  to: 'cielioqueirozz@gmail.com',
  subject: 'Enviando email com Nodemailer',
  html: '<h1>Olá, Mundo!</h1> <p>Esse email foi enviado usando o Nodemailer.</p>',
  text: 'Olá, Mundo! Esse email foi enviado usando o Nodemailer.',
})

.then(() => console.log('Email enviado com sucesso'))
.catch((error) => console.log('Erro ao enviar o email: ', error));

