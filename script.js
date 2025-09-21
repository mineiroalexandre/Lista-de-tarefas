const tasklist = document.getElementById("taskList");
const taskInput = document.getElementById("taskInput");
const API_URL = "http://localhost:3000/tarefas";

// Carregar todas as tarefas do banco ao abrir a página
async function carregarTarefas() {
    tasklist.innerHTML = ""; // limpa a lista
    const res = await fetch(API_URL);
    const tarefas = await res.json();

    tarefas.forEach(t => {
        const li = document.createElement("li");
        li.innerHTML = `
            <span style="text-decoration: ${t.concluida ? "line-through" : "none"}">
                ${t.descricao}
            </span>
            <button onclick="concluirTarefa(${t.id}, ${!t.concluida})">
                ${t.concluida ? "Desfazer" : "Concluir"}
            </button>
            <button onclick="deletarTarefa(${t.id})">Excluir</button>
        `;
        tasklist.appendChild(li);
    });
}

// Adicionar nova tarefa
async function addTask() {
    const taskText = taskInput.value.trim();
    if (taskText !== "") {
        await fetch(API_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ descricao: taskText })
        });
        taskInput.value = "";
        carregarTarefas();
    }
}

// Carregar ao abrir
carregarTarefas();