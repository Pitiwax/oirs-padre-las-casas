const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
require('dotenv').config();

const connectMongo = require('./config/mongo');
const authRoutes = require('./routes/auth.routes');
const solicitudesRoutes = require('./routes/solicitudes.routes');

const app = express();

app.use(helmet());
app.use(cors());
app.use(express.json());

connectMongo();

app.use('/api/auth', authRoutes);
app.use('/api/solicitudes', solicitudesRoutes);

app.get('/', (req, res) => {
  res.json({ sistema: 'API OIRS Red de Salud Municipal Padre Las Casas', estado: 'Operativo' });
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`🚀 Servidor Backend corriendo en http://localhost:${PORT}`);
});
