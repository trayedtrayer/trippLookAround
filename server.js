// Простой backend только для отправки писем через реальную почту.
// Фронтенд (index.html) можно оставить как есть — вместо функции sendMail(),
// которая пишет "письма" в localStorage, в реальном продукте нужно делать
// fetch('/api/send-mail', {...}) на этот сервер.

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const nodemailer = require('nodemailer');

const app = express();
app.use(cors());
app.use(express.json());

// Транспорт создаётся один раз при старте сервера на основе .env
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,       // например smtp.gmail.com
  port: Number(process.env.SMTP_PORT || 465),
  secure: true,                      // true для порта 465, false для 587
  auth: {
    user: process.env.SMTP_USER,     // адрес, с которого шлём письма
    pass: process.env.SMTP_PASS      // пароль приложения (см. инструкцию)
  }
});

// Проверка соединения при старте — сразу видно, если данные неверные
transporter.verify((err) => {
  if (err) console.error('SMTP ошибка:', err.message);
  else console.log('SMTP подключен, можно слать письма');
});

app.post('/api/send-mail', async (req, res) => {
  const { to, subject, body } = req.body;
  if (!to || !subject || !body) {
    return res.status(400).json({ ok: false, error: 'to, subject и body обязательны' });
  }
  try {
    await transporter.sendMail({
      from: `"Тропа — авторские экскурсии" <${process.env.SMTP_USER}>`,
      to,
      subject,
      text: body
    });
    res.json({ ok: true });
  } catch (e) {
    console.error(e);
    res.status(500).json({ ok: false, error: e.message });
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`Mail-сервер запущен на http://localhost:${PORT}`));
