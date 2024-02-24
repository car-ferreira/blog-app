const mongoose = require('mongoose')
const Schema = mongoose.Schema

const Usuario = newSchema({
    nome:{
        type: String,
        required: true
    },
    email:{
        type: String,
        required: true
    },
    senha:{
        type: String,
        required: true
    }
})

mongoose.model("usuarios", Usuario)