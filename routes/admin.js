const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Categoria = require('../models/Categoria');

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
    Categoria.deleteOne({ _id: req.body.id}).then(() => {
        req.flash("success_msg", "Categoria deletada com sucesso!")
        res.redirect("/admin/categorias")
    }).catch((err) => {
        req.flash("error_msg", "Não foi possivel deletar a categoria!")
        res.redirect("/admin/categorias")
    })
})

router.get("/postagens", (req, res) => {
    res.render("admin/postagens")
})

router.get("/postagens/add", (req, res) => {
    Categoria.find( ).lean( ).then((categorias) => {
    res.render("admin/addpostagem", {categorias: categorias})
    }).catch((err) => {
        req.flash("error_msg", "Houve um erro ao carregar o formulario")
        res.redirect("/admin")
    })
})

module.exports = router;    



