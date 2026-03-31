const express = require('express');
const fs = require('fs');
const session = require('express-session');

const app = express();

// ================= CONFIG =================
app.use(express.json());
app.use(express.static('public'));

app.use(session({
  secret: 'segredo123',
  resave: false,
  saveUninitialized: true
}));

// ================= FUNÇÕES =================

// ler dados
function readData() {
  const json = fs.readFileSync('data.json');
  return JSON.parse(json);
}

// salvar dados
function saveData(data) {
  fs.writeFileSync('data.json', JSON.stringify(data, null, 2));
}

// middleware de proteção
function checkAdmin(req, res, next) {
  if (!req.session.admin) {
    return res.status(403).json({ error: "Não autorizado" });
  }
  next();
}

// ================= ROTAS =================

// rota principal
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/public/inner.html');
});

// ================= LOGIN =================

// login
app.post('/api/login', (req, res) => {
  const { user, pass } = req.body;

  if (user === "admin" && pass === "123") {
    req.session.admin = true;
    return res.json({ success: true });
  }

  res.json({ success: false });
});

// logout
app.post('/api/logout', (req, res) => {
  req.session.destroy();
  res.json({ success: true });
});

// verificar login
app.get('/api/check', (req, res) => {
  res.json({ admin: !!req.session.admin });
});

// ================= DADOS =================

// pegar dados (livre)
app.get('/api/data', (req, res) => {
  const data = readData();
  res.json(data);
});

// ================= ROTAS PROTEGIDAS =================

// adicionar link
app.post('/api/add', checkAdmin, (req, res) => {
  const { name, url, type, category } = req.body;

  const data = readData();

  if (type === "cars") {
    if (!data.cars[category]) {
      data.cars[category] = [];
    }
    data.cars[category].push({ name, url });

  } else {
    data[type].push({ name, url });
  }

  saveData(data);
  res.json({ success: true });
});

// criar categoria
app.post('/api/add-category', checkAdmin, (req, res) => {
  const { category } = req.body;

  const data = readData();

  if (!data.cars[category]) {
    data.cars[category] = [];
  }

  saveData(data);
  res.json({ success: true });
});

// deletar categoria
app.post('/api/delete-category', checkAdmin, (req, res) => {
  const { category } = req.body;

  const data = readData();
  delete data.cars[category];

  saveData(data);
  res.json({ success: true });
});

// renomear categoria
app.post('/api/rename-category', checkAdmin, (req, res) => {
  const { oldName, newName } = req.body;

  const data = readData();

  if (data.cars[oldName]) {
    data.cars[newName] = data.cars[oldName];

    delete data.cars[oldName];
  }

  saveData(data);
  res.json({ success: true });
});

// mover carro
app.post('/api/move-car', checkAdmin, (req, res) => {
  const { from, to, index } = req.body;

  const data = readData();

  const car = data.cars[from][index];
  data.cars[from].splice(index, 1);

  if (!data.cars[to]) data.cars[to] = [];
  data.cars[to].push(car);

  saveData(data);
  res.json({ success: true });
});

app.post('/api/delete-item', checkAdmin, (req, res) => {
  const { type, index } = req.body;

  const data = readData();

  if (!data[type]) {
    return res.status(400).json({ error: "Tipo inválido" });
  }

  data[type].splice(index, 1);

  saveData(data);

  res.json({ success: true });
});

// ================= SERVER =================
app.listen(3000, () => {
  console.log('Servidor rodando em http://localhost:3000');
});