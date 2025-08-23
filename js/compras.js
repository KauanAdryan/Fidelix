// Simulação de banco local
let users = JSON.parse(localStorage.getItem("users")) || [];
let currentUser = localStorage.getItem("currentUser") || null;

// Login
function login() {
  const username = document.getElementById("username").value;
  const password = document.getElementById("password").value;

  const user = users.find(u => u.username === username && u.password === password);
  if (user) {
    currentUser = username;
    localStorage.setItem("currentUser", currentUser);
    showDashboard();
  } else {
    alert("Usuário ou senha incorretos");
  }
}

// Cadastro
function register() {
  const username = document.getElementById("newUser").value;
  const password = document.getElementById("newPass").value;

  if (users.some(u => u.username === username)) {
    alert("Usuário já existe!");
    return;
  }

  users.push({ username, password, compras: [], cupons: [] });
  localStorage.setItem("users", JSON.stringify(users));
  alert("Cadastro realizado!");
  showLogin();
}

// Navegação
function showRegister() {
  document.getElementById("loginScreen").classList.add("hidden");
  document.getElementById("registerScreen").classList.remove("hidden");
}

function showLogin() {
  document.getElementById("registerScreen").classList.add("hidden");
  document.getElementById("loginScreen").classList.remove("hidden");
}

function showDashboard() {
  document.getElementById("loginScreen").classList.add("hidden");
  document.getElementById("registerScreen").classList.add("hidden");
  document.getElementById("dashboard").classList.remove("hidden");
}

// Alternar seções
function showSection(section) {
  document.querySelectorAll(".content").forEach(s => s.classList.remove("active"));
  document.getElementById(section).classList.add("active");
}
