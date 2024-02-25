const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const Usuario = require('../models/Usuario');


router.get('/registro', (req, res) => {
    res.render('usuarios/registro');
});

router.post('/registro', (req, res) => {
    var erros = [];

    if (!req.body.nome || !req.body.email || !req.body.senha) {
        erros.push({ texto: 'Preencha todos os campos!' });
    }

    if (req.body.senha.length < 8) {
        erros.push({ texto: 'A senha deve conter no mínimo 8 caracteres!' });
    }

    if (req.body.senha !== req.body.senha2) {
        erros.push({ texto: 'As senhas não coincidem, tente novamente!' });
    }

    if (erros.length > 0) {
        res.render('usuarios/registro', { erros: erros });
    } else {
        Usuario.findOne({ email: req.body.email }).then((usuario) => {
            if (usuario) {
                req.flash('error_msg', 'Este e-mail já está cadastrado!');
                res.redirect('/usuarios/registro');
            } else {
                const novoUsuario = new Usuario({
                    nome: req.body.nome,
                    email: req.body.email,
                    senha: req.body.senha
                });

                bcrypt.genSalt(10, (erro, salt) => {
                    bcrypt.hash(novoUsuario.senha, salt, (erro, hash) => {
                        if (erro) {
                            req.flash('error_msg', 'Houve um erro durante o salvamento do usuário');
                            res.redirect('/');
                        }

                        novoUsuario.senha = hash;

                        novoUsuario.save().then(() => {
                            req.flash('success_msg', 'Usuário criado com sucesso!');
                            res.redirect('/');
                        }).catch((err) => {
                            req.flash('error_msg', 'Houve um erro ao criar o usuário, tente novamente!');
                            res.redirect('/usuarios/registro');
                        });
                    });
                });
            }
        }).catch((err) => {
            req.flash('error_msg', 'Houve um erro interno');
            res.redirect('/');
        });
    }
});

module.exports = router;
