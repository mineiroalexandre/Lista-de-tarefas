const express = require("express");
const mysql = require("mysql2");
const bodyParser = require("body-parser");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(bodyParser.json());

// Conexão com MySQL
const db = mysql.createConnection({
  host: "127.0.0.1",
  database: "lista_tarefas",
  user: "root",          // <- usuário padrão do phpMyAdmin/XAMPP
  password: "",          // <- senha 
  port: 3306
});

// Listar tarefas
app.get("/tarefas", (req, res) => {
  db.query("SELECT * FROM tarefas ORDER BY id DESC", (err, results) => {
    if (err) throw err;
    res.json(results);
  });
});

// Adicionar tarefa
app.post("/tarefas", (req, res) => {
  const { descricao } = req.body;
  db.query("INSERT INTO tarefas (descricao) VALUES (?)", [descricao], (err, result) => {
    if (err) throw err;
    res.json({ id: result.insertId, descricao, concluida: false });
  });
});

app.listen(3000, () => {
  console.log("Servidor rodando em http://localhost:3000");
});
