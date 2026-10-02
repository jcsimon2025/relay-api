const express = require("express");

const app = express();

app.use(express.json());

const PORT = process.env.PORT || 3000;
const API_TOKEN = process.env.API_TOKEN;

// comando pendente
let command = null;

// contador de IDs
let lastCommandId = 0;


// =====================================================
// AUTENTICAÇÃO
// =====================================================

function auth(req, res, next) {

  const header = req.headers.authorization;

  if (!header) {
    return res.status(401).json({
      success: false,
      error: "Authorization ausente"
    });
  }

  const token = header.replace("Bearer ", "");

  if (token !== API_TOKEN) {
    return res.status(403).json({
      success: false,
      error: "Token invalido"
    });
  }

  next();
}


// =====================================================
// TESTE
// =====================================================

app.get("/", (req, res) => {

  res.json({
    service: "ESP Relay API",
    status: "online"
  });

});


// =====================================================
// CRIAR COMANDO PULSE
// =====================================================

app.post("/api/relay/pulse", auth, (req, res) => {

  lastCommandId++;

  command = {
    id: lastCommandId,
    action: "pulse",
    duration: 2500,
    createdAt: new Date().toISOString()
  };

  return res.json({
    success: true,
    message: "Comando criado",
    command
  });

});


// =====================================================
// ESP CONSULTA COMANDO
// =====================================================

app.get("/api/device/command", auth, (req, res) => {

  return res.json({
    command
  });

});


// =====================================================
// ESP CONFIRMA EXECUÇÃO
// =====================================================

app.post("/api/device/ack", auth, (req, res) => {

  const id = Number(req.body.id);

  if (!command) {
    return res.json({
      success: true,
      message: "Nenhum comando pendente"
    });
  }

  if (command.id !== id) {
    return res.status(400).json({
      success: false,
      error: "ID invalido"
    });
  }

  command = null;

  return res.json({
    success: true
  });

});


// =====================================================
// STATUS
// =====================================================

app.get("/api/status", auth, (req, res) => {

  res.json({
    online: true,
    pendingCommand: command
  });

});


// =====================================================
// START
// =====================================================

app.listen(PORT, "0.0.0.0", () => {

  console.log(
    `Relay API rodando na porta ${PORT}`
  );

});