const express = require('express');
const exphbs = require('express-handlebars');
const path = require('path');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const session = require('express-session');
const flash = require('connect-flash');
const Postagem = require('./models/Postagem');
const adminRoutes = require('./routes/admin');
const Categoria = require('./models/Categoria');

const app = express();

// Configurações do Handlebars
const hbs = exphbs.create({
  defaultLayout: 'main',
  partialsDir: path.join(__dirname, 'views/partials'),
  allowProtoMethodsByDefault: true,
  allowProtoPropertiesByDefault: true,
  runtimeOptions: {
    allowProtoPropertiesByDefault: true,
    allowProtoMethodsByDefault: true,
  }
});
app.engine('handlebars', hbs.engine);
app.set('view engine', 'handlebars');

// Sessão
app.use(session({
  secret: 'cursodenode',
  resave: true,
  saveUninitialized: true
}));

// Flash messages
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

// Mongoose
mongoose.Promise = global.Promise;
mongoose.connect('mongodb://127.0.0.1:27017/blogapp', {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => {
  console.log('Conectado ao MongoDB');
})
.catch((err) => {
  console.error('Erro ao se conectar ao MongoDB:', err.message);
});

// Public
app.use(express.static(path.join(__dirname, 'public')));

// Rota para o aplicativo principal
app.get('/', (req, res) => {
  Postagem.find().populate("categoria").sort({data: 'desc'}).lean().then((postagens) => {
      res.render("index", {postagens: postagens})
  }).catch((err) => {
      req.flash("error_msg", "Não foi possível carregar os posts")
      res.redirect("/404")
  })
})

app.get('/postagem/:slug', (req,res) => {
    const slug = req.params.slug
    Postagem.findOne({slug}).lean().then(postagem => {
        if(postagem){
            res.render('postagem/index', { postagem });
        }else{
            req.flash("error_msg", "Essa postagem nao existe")
            res.redirect("/")
        }
    }).catch(err => {
        req.flash("error_msg", "Houve um erro interno")
        res.redirect("/")
    })
})

// Rota para listar as postagens de uma categoria específica
app.get("/categorias/:slug", (req, res) => {
  Categoria.findOne({ slug: req.params.slug }).then((categoria) => {
    if (categoria) {
      Postagem.find({ categoria: categoria._id }).then((postagens) => {
        res.render("categorias/postagens", { postagens: postagens, categoria: categoria });
      }).catch((err) => {
        req.flash("error_msg", "Houve um erro ao listar os posts");
        res.redirect("/");
      });
    } else {
      req.flash("error_msg", "Essa categoria não existe");
      res.redirect("/");
    }
  }).catch((err) => {
    req.flash("error_msg", "Houve um erro interno ao carregar a página desta categoria");
    res.redirect("/");
  });
});

// Rota para listar todas as categorias
app.get("/categorias", (req, res) => { 
  Categoria.find().lean().then((categorias) => {
    res.render("categorias/index", {categorias: categorias})
  }).catch((err) => {
    req.flash("error_msg", "Houve um erro interno ao listar as categorias")
    res.redirect("/")
  })
})

app.get("/404", (req,res) => {
  res.send("Erro 404!")
})

app.get('/posts', (req, res) => {
  res.send('Página de posts');
});

// Rotas para a área de administração
app.use('/admin', adminRoutes);

// Servidor
const PORT = 8031;
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});












