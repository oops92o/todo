const STORAGE_KEY = 'todo-app-items';

const form = document.getElementById('todo-form');
const input = document.getElementById('todo-input');
const list = document.getElementById('todo-list');
const emptyState = document.getElementById('empty-state');
const itemsLeft = document.getElementById('items-left');
const clearCompletedBtn = document.getElementById('clear-completed');
const filterButtons = document.querySelectorAll('.filter-btn');
const todayEl = document.getElementById('today');

let todos = loadTodos();
let currentFilter = 'all';

function loadTodos() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveTodos() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(todos));
}

function uid() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}

function render() {
  list.innerHTML = '';

  const filtered = todos.filter((todo) => {
    if (currentFilter === 'active') return !todo.completed;
    if (currentFilter === 'completed') return todo.completed;
    return true;
  });

  emptyState.hidden = filtered.length !== 0;

  for (const todo of filtered) {
    list.appendChild(renderItem(todo));
  }

  const remaining = todos.filter((t) => !t.completed).length;
  itemsLeft.textContent = `${remaining}개 남음`;
}

function renderItem(todo) {
  const li = document.createElement('li');
  li.className = 'todo-item' + (todo.completed ? ' completed' : '');
  li.dataset.id = todo.id;

  const checkbox = document.createElement('input');
  checkbox.type = 'checkbox';
  checkbox.checked = todo.completed;
  checkbox.addEventListener('change', () => toggleTodo(todo.id));

  const text = document.createElement('span');
  text.className = 'text';
  text.textContent = todo.text;
  text.contentEditable = 'true';
  text.spellcheck = false;
  text.addEventListener('blur', () => finishEdit(todo.id, text));
  text.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      text.blur();
    }
  });

  const deleteBtn = document.createElement('button');
  deleteBtn.className = 'delete-btn';
  deleteBtn.textContent = '✕';
  deleteBtn.setAttribute('aria-label', '삭제');
  deleteBtn.addEventListener('click', () => deleteTodo(todo.id));

  li.append(checkbox, text, deleteBtn);
  return li;
}

function addTodo(text) {
  const trimmed = text.trim();
  if (!trimmed) return;
  todos.unshift({ id: uid(), text: trimmed, completed: false });
  saveTodos();
  render();
}

function toggleTodo(id) {
  const todo = todos.find((t) => t.id === id);
  if (todo) todo.completed = !todo.completed;
  saveTodos();
  render();
}

function deleteTodo(id) {
  todos = todos.filter((t) => t.id !== id);
  saveTodos();
  render();
}

function finishEdit(id, el) {
  const todo = todos.find((t) => t.id === id);
  if (!todo) return;
  const newText = el.textContent.trim();
  if (!newText) {
    deleteTodo(id);
    return;
  }
  todo.text = newText;
  saveTodos();
  render();
}

function clearCompleted() {
  todos = todos.filter((t) => !t.completed);
  saveTodos();
  render();
}

function setFilter(filter) {
  currentFilter = filter;
  filterButtons.forEach((btn) => {
    btn.classList.toggle('active', btn.dataset.filter === filter);
  });
  render();
}

form.addEventListener('submit', (e) => {
  e.preventDefault();
  addTodo(input.value);
  input.value = '';
  input.focus();
});

clearCompletedBtn.addEventListener('click', clearCompleted);

filterButtons.forEach((btn) => {
  btn.addEventListener('click', () => setFilter(btn.dataset.filter));
});

todayEl.textContent = new Date().toLocaleDateString('ko-KR', {
  year: 'numeric',
  month: 'long',
  day: 'numeric',
  weekday: 'long',
});

render();
