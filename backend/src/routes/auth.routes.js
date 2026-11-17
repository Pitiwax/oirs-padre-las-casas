const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const pool = require('../config/postgres');

const router = express.Router();

router.post('/seed-usuarios', async (req, res) => {
  try {
    const hash = await bcrypt.hash('Oirs2026!', 12);
    await pool.query(
      `INSERT INTO usuario (rut, nombre_completo, email, password_hash, rol, id_establecimiento)
       VALUES 
       ('15.432.111-2', 'Carolina Muñoz (Gestora OIRS)', 'funcionario@padre-las-casas.cl', $1, 'FUNCIONARIO', 1),
       ('12.876.543-K', 'Liset Crisostomo (Directora Salud)', 'jefatura@padre-las-casas.cl', $1, 'JEFATURA', NULL)
       ON CONFLICT (email) DO NOTHING`,
      [hash]
    );
    res.json({ mensaje: 'Usuarios institucionales listos (Clave: Oirs2026!)' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error creando usuarios iniciales' });
  }
});

router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const result = await pool.query('SELECT * FROM usuario WHERE email = $1', [email]);
    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }

    const user = result.rows.at(0);
    const validPassword = await bcrypt.compare(password, user.password_hash);
    if (!validPassword) {
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }

    const token = jwt.sign(
      { id: user.id_usuario, rol: user.rol, nombre: user.nombre_completo, centro: user.id_establecimiento },
      process.env.JWT_SECRET,
      { expiresIn: '8h' }
    );

    res.json({
      token,
      usuario: {
        id: user.id_usuario,
        nombre: user.nombre_completo,
        rol: user.rol,
        id_establecimiento: user.id_establecimiento
      }
    });
  } catch (error) {
    res.status(500).json({ error: 'Error interno en autenticación' });
  }
});

module.exports = router;
