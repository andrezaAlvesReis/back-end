const express = require('express');
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const app = express();
const PORT = 3000;

app.use(bodyParser.json());

const usuarios = [];
const recados = [];

// Criação de conta para o usuario
app.post('/signup', async (req, res) => {
  const { nome, email, senha } = req.body;

  // Verificar se o e-mail do usuario já está em uso
  if (usuarios.some(u => u.email === email)) {
    return res.status(400).json({ error: 'E-mail já cadastrado' });
  }

  const hashedSenha = await bcrypt.hash(senha, 10);
  const novoUsuario = { id: usuarios.length + 1, nome, email, senha: hashedSenha };
  usuarios.push(novoUsuario);

  res.status(201).json({ id: novoUsuario.id, nome: novoUsuario.nome, email: novoUsuario.email });
});

// Login
app.post('/login', async (req, res) => {
  const { email, senha } = req.body;

  // Verificar as credenciais do usuário
  const usuario = usuarios.find(u => u.email === email);
  if (!usuario || !(await bcrypt.compare(senha, usuario.senha))) {
    return res.status(401).json({ error: 'Credenciais inválidas' });
  }

  const token = jwt.sign({ userId: usuario.id }, 'secreto', { expiresIn: '1h' });
  res.json({ token });
});

// CRUD de Recados

// Criar recado
app.post('/recados', (req, res) => {
  const { titulo, descricao } = req.body;
  const usuarioId = req.user.userId; // Supondo que o usuário está autenticado

  const novoRecado = { id: recados.length + 1, titulo, descricao, usuarioId };
  recados.push(novoRecado);

  res.status(201).json({ id: novoRecado.id, titulo: novoRecado.titulo, descricao: novoRecado.descricao });
});

// Ler todos os recados
app.get('/recados', (req, res) => {
  const usuarioId = req.user.userId; // Supondo que o usuário está autenticado
  const recadosDoUsuario = recados.filter(r => r.usuarioId === usuarioId);
  res.json(recadosDoUsuario);
});

// Atualizar recado
app.put('/recados/:id', (req, res) => {
  const recadoId = parseInt(req.params.id);
  const { titulo, descricao } = req.body;

  // Encontrar e atualizar o recado
  const recado = recados.find(r => r.id === recadoId);
  if (!recado) {
    return res.status(404).json({ error: 'Recado não encontrado' });
  }

  recado.titulo = titulo || recado.titulo;
  recado.descricao = descricao || recado.descricao;

  res.json({ id: recado.id, titulo: recado.titulo, descricao: recado.descricao });
});

// Deletar recado
app.delete('/recados/:id', (req, res) => {
  const recadoId = parseInt(req.params.id);

  // Encontrar e excluir o recado
  const index = recados.findIndex(r => r.id === recadoId);
  if (index === -1) {
    return res.status(404).json({ error: 'Recado não encontrado' });
  }

  recados.splice(index, 1);

  res.json({ message: 'Recado deletado com sucesso' });
});

// Iniciar o servidor
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
