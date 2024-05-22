const express = require('express');
const jwt = require('jsonwebtoken');
const bodyParser = require('body-parser');
const path = require('path');

const app = express();
const PORT = 3000;
const SECRET_KEY = 'your_secret_key';

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Array de ejemplo con las credenciales de los agentes
const agents = [
  { email: 'agent1@fbi.gov', password: 'password1' },
  { email: 'agent2@fbi.gov', password: 'password2' }
];

// Ruta para servir el archivo HTML
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// Ruta para autenticar al agente y generar un token
app.post('/signin', (req, res) => {
  const { email, password } = req.body;
  const agent = agents.find(a => a.email === email && a.password === password);

  if (agent) {
    const token = jwt.sign({ email: agent.email }, SECRET_KEY, { expiresIn: '2m' });
    res.send(`
      <html>
        <body>
          <p>Agente autorizado: ${agent.email}</p>
          <script>
            sessionStorage.setItem('token', '${token}');
            setTimeout(() => {
              sessionStorage.removeItem('token');
              alert('La sesión ha expirado');
              window.location.href = '/';
            }, 120000);
          </script>
          <a href="/restricted">Ir a ruta restringida</a>
        </body>
      </html>
    `);
  } else {
    res.status(401).send('Credenciales incorrectas');
  }
});

// Ruta restringida
app.get('/restricted', (req, res) => {
  res.sendFile(path.join(__dirname, 'restricted.html'));
});

app.post('/restricted', (req, res) => {
  const { token } = req.body;

  if (token) {
    jwt.verify(token, SECRET_KEY, (err, decoded) => {
      if (err) {
        return res.status(401).send('Usuario no autorizado');
      } else {
        res.send(`Bienvenido, agente ${decoded.email}`);
      }
    });
  } else {
    res.status(401).send('Token no proporcionado');
  }
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
