const taskList = document.getElementById("taskList");
const completedList = document.getElementById("completedList");
const taskInput = document.getElementById("taskInput");
const API_URL = "http://localhost:3000/tarefas";

// ENTER adiciona tarefa
taskInput.addEventListener("keypress", (e) => {
    if (e.key === "Enter") addTask();
});

// CARREGAR TAREFAS
async function carregarTarefas() {
    taskList.innerHTML = "";
    completedList.innerHTML = "";

    const res = await fetch(API_URL);
    const tarefas = await res.json();

    // Ordena pela ordem definida
    tarefas.sort((a, b) => a.ordem - b.ordem);

    tarefas.forEach(t => criarItemNaTela(t));
}

function criarItemNaTela(tarefa) {
    const li = document.createElement("li");
    li.classList.add("taskCard");
    li.draggable = true;
    li.dataset.id = tarefa.id;

    li.innerHTML = `
        <span class="${tarefa.concluida ? "taskDone" : ""}">
            ${tarefa.descricao}
        </span>
        <div class="btns">
            <button onclick="concluirTarefa(${tarefa.id}, ${!tarefa.concluida})"
                    class="${tarefa.concluida ? "undo" : "done"}">
                <i class="fa-solid ${tarefa.concluida ? "fa-rotate-left" : "fa-check"}"></i>
            </button>

            <button onclick="deletarTarefa(${tarefa.id})" class="delete">
                <i class="fa-solid fa-trash"></i>
            </button>
        </div>
    `;

    // Arrastar
    li.addEventListener("dragstart", dragStart);
    li.addEventListener("dragover", dragOver);
    li.addEventListener("drop", drop);
    li.addEventListener("dragend", dragEnd);

    if (tarefa.concluida) {
        completedList.appendChild(li);
    } else {
        taskList.appendChild(li);
    }
}


// ADICIONAR
async function addTask() {
    const taskText = taskInput.value.trim();
    if (!taskText) return;

    const res = await fetch(API_URL);
    const tarefas = await res.json();
    const maiorOrdem = tarefas.length > 0 ? Math.max(...tarefas.map(t => t.ordem ?? 0)) : 0;

    await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ descricao: taskText, concluida: false, ordem: maiorOrdem + 1 })
    });

    taskInput.value = "";
    carregarTarefas();
}

// EXCLUIR UMA TAREFA
async function deletarTarefa(id) {
    await fetch(`${API_URL}/${id}`, { method: "DELETE" });
    carregarTarefas();
}

// EXCLUIR TODAS AS CONCLUÍDAS
async function excluirConcluidas() {
    const res = await fetch(API_URL);
    const tarefas = await res.json();

    const concluidas = tarefas.filter(t => t.concluida);

    for (let t of concluidas) {
        await fetch(`${API_URL}/${t.id}`, { method: "DELETE" });
    }
    carregarTarefas();
}

// CONCLUIR / DESMARCAR
async function concluirTarefa(id, concluida) {
    await fetch(`${API_URL}/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ concluida })
    });
    carregarTarefas();
}

// REORDENAR (DRAG & DROP)
let dragged;

function dragStart(e) {
    dragged = this;
    this.style.opacity = "0.5";
}

function dragOver(e) {
    e.preventDefault();
    const hovering = this;
    const list = hovering.parentNode;
    if (hovering !== dragged) {
        const rect = hovering.getBoundingClientRect();
        const isAfter = e.clientY > rect.top + rect.height / 2;
        list.insertBefore(dragged, isAfter ? hovering.nextSibling : hovering);
    }
}

async function drop() {
    const items = [...this.parentNode.children];
    for (let i = 0; i < items.length; i++) {
        const id = items[i].dataset.id;
        await fetch(`${API_URL}/${id}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ ordem: i })
        });
    }
}

function dragEnd() {
    this.style.opacity = "1";
}
 
carregarTarefas();
