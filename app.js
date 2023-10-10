const express = require('express');
const exphbs = require('express-handlebars');
const bodyParser = require('body-parser');
const path = require('path');
const mongoose = require('mongoose');
const session = require('express-session');
const flash = require('connect-flash');

const app = express();

// Configurações

// Sessão
app.use(session({
  secret: 'cursodenode',
  resave: true,
  saveUninitialized: true
}));

app.use(flash());

// Middleware
app.use((req, res, next) => {
  res.locals.success_msg = req.flash('success_msg');
  res.locals.error_msg = req.flash('error_msg');
  next();
});

// Body Parser
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Handlebars
const hbs = exphbs.create({
  defaultLayout: 'main',
  partialsDir: path.join(__dirname, 'views/partials'),
  allowProtoMethodsByDefault: true,
  allowProtoPropertiesByDefault: true,
});
app.engine('handlebars', hbs.engine);
app.set('view engine', 'handlebars');

// Mongoose
mongoose.Promise = global.Promise;
mongoose.connect('mongodb://127.0.0.1:27017/blogapp', { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {
    console.log('Conectado ao MongoDB');
  })
  .catch((err) => {
    console.error('Erro ao se conectar ao MongoDB:', err.message);
  });

// Public
app.use(express.static(path.join(__dirname, 'public')));

// Rotas
const adminRoutes = require('./routes/admin');
app.use('/admin', adminRoutes);

// Servidor
const PORT = 8031;
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});




