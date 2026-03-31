// ================= SEÇÕES =================
function showSection(id) {
  document.querySelectorAll('.content').forEach(el => {
    el.style.display = "none";
  });

  document.getElementById(id).style.display = "block";
}

// ================= LOGIN =================
async function login() {
  const user = document.getElementById("user").value;
  const pass = document.getElementById("pass").value;

  const res = await fetch('/api/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ user, pass })
  });

  const data = await res.json();

  if (data.success) {
    alert("Logado!");
    await checkLogin();
  } else {
    alert("Erro!");
  }
}

async function logout() {
  await fetch('/api/logout', { method: 'POST' });
  alert("Saiu!");
  await checkLogin();
}

// ================= LOGIN CHECK =================
async function checkLogin() {
  const res = await fetch('/api/check');
  const data = await res.json();

  const isAdmin = data.admin;

  document.querySelectorAll(".admin-btn").forEach(btn => {
    btn.style.display = isAdmin ? "inline-block" : "none";
  });
}

// ================= LINKS =================
function createLink(item) {
  return `<a class="link" href="${item.url}" target="_blank">${item.name}</a>`;
}

// ================= CARREGAR =================
async function loadData() {
  const res = await fetch('/api/data');
  const data = await res.json();

  renderData(data);
  updateCategorySelect(data.cars);
}

// ================= RENDER =================
function renderData(data) {
  const tracks = document.getElementById("tracks");
  const cars = document.getElementById("cars");
  const graphics = document.getElementById("graphics");

  tracks.innerHTML = "<h2>🏁 Pistas</h2>";
  cars.innerHTML = "<h2>🚗 Carros</h2>";
  graphics.innerHTML = "<h2>🎮 Gráficos</h2>";

  // ================= PISTAS =================
  data.tracks.forEach((item, index) => {
    tracks.innerHTML += `
      <div>
        ${createLink(item)}
        <button class="admin-btn" onclick="deleteItem('tracks', ${index})">❌</button>
      </div>
    `;
  });

  // ================= CARROS =================
  for (let category in data.cars) {
    const container = document.createElement("div");

    container.innerHTML = `
      <h3 onclick="toggleCategory(this)">
        ${category}
        <button class="admin-btn" onclick="deleteCategory('${category}')">❌</button>
        <button class="admin-btn" onclick="renameCategory('${category}')">✏️</button>
      </h3>
      <div style="display:none"></div>
    `;

    const list = container.querySelector("div");

    data.cars[category].forEach((car, index) => {
      list.innerHTML += `
        <div>
          ${createLink(car)}
          <button class="admin-btn" onclick="moveCar('${category}', ${index})">📂</button>
        </div>
      `;
    });

    cars.appendChild(container);
  }

  // ================= GRÁFICOS =================
  data.graphics.forEach((item, index) => {
    graphics.innerHTML += `
      <div>
        ${createLink(item)}
        <button class="admin-btn" onclick="deleteItem('graphics', ${index})">❌</button>
      </div>
    `;
  });

  checkLogin();
}

// ================= DELETE ITEM =================
async function deleteItem(type, index) {
  await fetch('/api/delete-item', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ type, index })
  });

  loadData();
}

// ================= SELECT =================
function updateCategorySelect(cars) {
  const select = document.getElementById("category");

  select.innerHTML = "";

  for (let category in cars) {
    select.innerHTML += `<option value="${category}">${category}</option>`;
  }
}

// ================= AÇÕES =================
async function addLink() {
  const name = document.getElementById("name").value;
  const url = document.getElementById("url").value;
  const type = document.getElementById("type").value;
  const category = document.getElementById("category").value;

  const res = await fetch('/api/add', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, url, type, category })
  });

  if (!res.ok) {
    alert("Você precisa estar logado!");
    return;
  }

  loadData();
}

async function addCategory() {
  const category = document.getElementById("newCategory").value;

  await fetch('/api/add-category', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ category })
  });

  loadData();
}

function toggleCategory(el) {
  const content = el.nextElementSibling;
  content.style.display =
    content.style.display === "none" ? "block" : "none";
}

async function deleteCategory(category) {
  await fetch('/api/delete-category', {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify({ category })
  });

  loadData();
}

async function renameCategory(oldName) {
  const newName = prompt("Novo nome:");

  await fetch('/api/rename-category', {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify({ oldName, newName })
  });

  loadData();
}

async function moveCar(from, index) {
  const to = prompt("Mover para qual categoria?");

  await fetch('/api/move-car', {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify({ from, to, index })
  });

  loadData();
}

// ================= INICIAR =================
window.onload = async () => {
  showSection('tracks');
  await loadData();
  await checkLogin();
};