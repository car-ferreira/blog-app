const express = require('express');
const handlebars = require('express-handlebars');
const bodyParser = require('body-parser');
const path = require('path');
const mongoose = require("mongoose");

const app = express();

// Configurações
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Handlebars
app.engine('handlebars', handlebars.create({ defaultLayout: 'main' }).engine);
app.set('view engine', 'handlebars');

// Mongoose
mongoose.Promise = global.Promise;
mongoose.connect("mongodb://127.0.0.1:27017/blogapp", { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {
    console.log("Conectado ao MongoDB");
  })
  .catch((err) => {
    console.error("Erro ao se conectar ao MongoDB:", err.message);
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
