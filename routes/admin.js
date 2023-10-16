const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Categoria = require('../models/Categoria');
const Postagem = require('../models/Postagem');
const path = require('path');
const exphbs = require('express-handlebars');

const hbs = exphbs.create({
    defaultLayout: 'main',
    partialsDir: path.join(__dirname, '../views/partials'),
    allowProtoMethodsByDefault: true,
    allowProtoPropertiesByDefault: true
});

router.get('/', (req, res) => {
    res.render('admin/index');
});

router.get('/posts', (req, res) => {
    res.send('Página de posts');
});

// Rota para listar categorias
router.get('/categorias', (req, res) => {
    Categoria.find().sort({ date: 'desc' }).lean()
        .then((categorias) => {
            res.render('admin/categorias', { categorias: categorias });
        })
        .catch((err) => {
            req.flash('error_msg', 'Erro ao listar categorias');
            res.redirect('/admin');
        });
});

// Rota para adicionar categoria
router.get('/categorias/add', (req, res) => {
    res.render('admin/addcategorias');
});

router.post('/categorias/nova', (req, res) => {
    const novaCategoria = {
        nome: req.body.nome,
        slug: req.body.slug
    };

    new Categoria(novaCategoria).save()
        .then(() => {
            req.flash('success_msg', 'Categoria criada com sucesso!');
            res.redirect('/admin/categorias');
        })
        .catch((err) => {
            req.flash('error_msg', 'Houve um erro ao salvar a categoria, tente novamente!');
            res.redirect('/admin/categorias/add');
        });
});

router.get('/categorias/edit/:id', (req, res) => {
    const id = req.params.id;

    Categoria.findById(id)
        .then(categoria => {
            if (!categoria) {
                req.flash('error_msg', 'Categoria não encontrada');
                res.redirect('/admin/categorias');
            } else {
                const categoriaData = {
                    _id: categoria._id,
                    nome: categoria.nome,
                    slug: categoria.slug
                };
                res.render('admin/editcategoria', { erros: [], categoria: categoriaData });
            }
        })
        .catch(err => {
            console.error('Erro ao buscar categoria:', err);
            req.flash('error_msg', "Esta categoria não existe!");
            res.redirect('/admin/categorias');
        });
});

router.post("/categorias/edit", (req, res) => {
    const id = req.body.id;
    const updatedCategoria = {
        nome: req.body.nome,
        slug: req.body.slug
    };

    Categoria.findByIdAndUpdate(id, updatedCategoria)
        .then(() => {
            req.flash("success_msg", "Categoria editada com sucesso!");
            res.redirect("/admin/categorias");
        })
        .catch((err) => {
            req.flash("error_msg", "Houve um erro ao editar a categoria!");
            res.redirect("/admin/categorias");
        });
});

router.post("/categorias/deletar", (req, res) => {
    Categoria.deleteOne({ _id: req.body.id }).then(() => {
        req.flash("success_msg", "Categoria deletada com sucesso!")
        res.redirect("/admin/categorias")
    }).catch((err) => {
        req.flash("error_msg", "Não foi possível deletar a categoria!")
        res.redirect("/admin/categorias")
    })
});

router.get("/postagens", (req, res) => {
    Postagem.find().lean().populate("categoria").sort({ data: "desc" }).then((postagens) => {
        res.render("admin/postagens", { postagens: postagens });
    }).catch((err) => {
        req.flash("error_msg", "Houve um erro ao listar as postagens!");
        res.redirect("/admin");
    });
});

router.get("/postagens/add", (req, res) => {
    Categoria.find().lean().then((categorias) => {
        res.render("admin/addpostagem", { categorias: categorias })
    }).catch((err) => {
        req.flash("error_msg", "Houve um erro ao carregar o formulário")
        res.redirect("/admin")
    })
});

router.post("/postagens/nova", (req, res) => {
    var erros = [];

    if (req.body.categoria == 0) {
        erros.push({ texto: "Categoria inválida, registre uma categoria" });
    }

    if (erros.length > 0) {
        res.render("admin/addpostagem", { erros: erros });
    } else {
        const novaPostagem = {
            titulo: req.body.titulo,
            descricao: req.body.descricao,
            conteudo: req.body.conteudo,
            categoria: req.body.categoria,
            slug: req.body.slug
        };

        new Postagem(novaPostagem)
            .save()
            .then(() => {
                req.flash("success_msg", "Postagem criada com sucesso!");
                res.redirect("/admin/postagens");
            })
            .catch((err) => {
                req.flash("error_msg", "Houve um erro durante o salvamento da postagem");
                res.redirect("/admin/postagens");
            });
    }
});

router.get("/postagens/edit/:id", (req, res) => {
    const postId = req.params.id;

    Postagem.findOne({ _id: postId }).lean().then((postagem) => {
        Categoria.find().lean().then((categorias) => {
            res.render("admin/editpostagens", { categorias, postagem });
        }).catch((err) => {
            req.flash("error_msg", "Houve um erro ao listar as categorias");
            res.redirect("/admin/postagens");
        });
    }).catch((err) => {
        req.flash("error_msg", "Houve um erro ao carregar o formulário de edição");
        res.redirect("/admin/postagens");
    });
});

router.post("/postagens/edit", (req,res) => {
    Postagem.findOne({_id: req.body.id}).then((postagem) =>{
        postagem.titulo = req.body.titulo
        postagem.slug = req.body.slug
        postagem.descricao = req.body.descricao
        postagem.conteudo = req.body.conteudo
        postagem.categoria = req.body.categoria
        postagem.data = new Date
        postagem.save().then(() => {
            req.flash("success_msg", "Postagem editada com sucesso")
            res.redirect("/admin/postagens")
        }).catch((err) => {
            req.flash("error_msg", "Erro interno")
            res.redirect("/admin/postagens")
        })
    }).catch((err) => {
        req.flash("error_msg", "Houve um erro ao salvar a edição")
        res.redirect("/admin/postagens")
    })
})

module.exports = router;




