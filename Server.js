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
  user: "tarefas_user",
  password: "senha123",
  port: 3306
});

// LISTAR TAREFAS (AGORA POR ORDEM)
app.get("/tarefas", (req, res) => {
  const sql = "SELECT * FROM tarefas ORDER BY ordem ASC";
  db.query(sql, (err, results) => {
    if (err) throw err;
    res.json(results);
  });
});

// ADICIONAR TAREFA JÁ COM ORDEM
app.post("/tarefas", (req, res) => {
  const { descricao, concluida = false, ordem = 0 } = req.body;

  const sqlMaiorOrdem = "SELECT MAX(ordem) AS maxOrdem FROM tarefas";
  db.query(sqlMaiorOrdem, (err, rows) => {
    if (err) throw err;

    const novaOrdem = (rows[0].maxOrdem || 0) + 1;

    const sqlInsert = "INSERT INTO tarefas (descricao, concluida, ordem) VALUES (?, ?, ?)";
    db.query(sqlInsert, [descricao, concluida, novaOrdem], (err, result) => {
      if (err) throw err;

      res.json({
        id: result.insertId,
        descricao,
        concluida,
        ordem: novaOrdem
      });
    });
  });
});

// DELETAR TAREFA
app.delete("/tarefas/:id", (req, res) => {
  const { id } = req.params;

  db.query("DELETE FROM tarefas WHERE id=?", [id], (err) => {
    if (err) throw err;
    res.sendStatus(200);
  });
});

// MARCAR COMO CONCLUÍDA
app.put("/tarefas/:id", (req, res) => {
  const { id } = req.params;
  const { concluida } = req.body;

  db.query("UPDATE tarefas SET concluida=? WHERE id=?", [concluida, id], (err) => {
    if (err) throw err;
    res.sendStatus(200);
  });
});

// ATUALIZAR SOMENTE A ORDEM
app.patch("/tarefas/:id", (req, res) => {
  const { id } = req.params;
  const { ordem } = req.body;

  db.query("UPDATE tarefas SET ordem=? WHERE id=?", [ordem, id], (err) => {
    if (err) throw err;
    res.sendStatus(200);
  });
});

app.listen(3000, () => {
  console.log("Servidor rodando");
});
