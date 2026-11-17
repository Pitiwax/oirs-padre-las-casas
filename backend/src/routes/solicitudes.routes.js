const express = require('express');
const { body, validationResult } = require('express-validator');
const pool = require('../config/postgres');
const AuditLog = require('../models/AuditLog');
const { calcularFechaLimite, calcularDiasRestantes, obtenerSemaforo } = require('../utils/plazosHabiles');
const { verificarToken, permitirRoles } = require('../middlewares/auth');

const router = express.Router();

router.get('/catalogos', async (req, res) => {
  try {
    const centros = await pool.query('SELECT * FROM establecimiento WHERE activo = TRUE ORDER BY id_establecimiento');
    const categorias = await pool.query('SELECT * FROM categoria ORDER BY id_categoria');
    res.json({ centros: centros.rows, categorias: categorias.rows });
  } catch (error) {
    res.status(500).json({ error: 'Error al cargar catálogos' });
  }
});

router.post(
  '/',
  [
    body('tipo_solicitud').isIn(['Reclamo', 'Sugerencia', 'Felicitacion']).withMessage('Tipo inválido'),
    body('id_establecimiento').isInt().withMessage('Centro de salud inválido'),
    body('id_categoria').isInt().withMessage('Categoría inválida'),
    body('descripcion').trim().escape().isLength({ min: 5, max: 3000 }).withMessage('Descripción requerida (5 a 3000 caracteres)'),
    body('es_anonima').isBoolean()
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ error: 'Datos inválidos o sospechosos bloqueados', detalles: errors.array() });
    }

    const {
      tipo_solicitud, id_establecimiento, id_categoria, otro_motivo,
      descripcion, es_anonima, rut, nombres, apellido_paterno,
      apellido_materno, fecha_nacimiento, programa_prais,
      desea_contacto, email, telefono
    } = req.body;

    if (!es_anonima && desea_contacto && !email && !telefono) {
      return res.status(400).json({ error: 'Debe ingresar correo o teléfono si desea ser contactado.' });
    }

    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      const folio = `OIRS-2026-${Math.floor(1000 + Math.random() * 9000)}`;
      const fechaLimite = calcularFechaLimite(new Date(), 15);

      const insertSol = await client.query(
        `INSERT INTO solicitud (folio, tipo_solicitud, id_establecimiento, id_categoria, otro_motivo, descripcion, es_anonima, fecha_limite_legal)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING id_solicitud, folio, fecha_ingreso, fecha_limite_legal`,
        [folio, tipo_solicitud, id_establecimiento, id_categoria, otro_motivo || null, descripcion, es_anonima, fechaLimite]
      );

      const nuevaSol = insertSol.rows.at(0);

      if (!es_anonima) {
        await client.query(
          `INSERT INTO solicitante_contacto (id_solicitud, rut, nombres, apellido_paterno, apellido_materno, fecha_nacimiento, programa_prais, desea_contacto, email, telefono)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
          [nuevaSol.id_solicitud, rut || null, nombres || null, apellido_paterno || null, apellido_materno || null, fecha_nacimiento || null, Boolean(programa_prais), Boolean(desea_contacto), email || null, telefono || null]
        );
      }

      await client.query('COMMIT');

      await AuditLog.create({
        folio: nuevaSol.folio,
        accion: 'CREACION_SOLICITUD',
        rol_usuario: 'CIUDADANO_TOTEM',
        detalle: { tipo_solicitud, id_establecimiento, id_categoria, es_anonima }
      });

      res.status(201).json({
        mensaje: 'Solicitud registrada exitosamente',
        folio: nuevaSol.folio,
        fecha_limite_legal: nuevaSol.fecha_limite_legal
      });
    } catch (error) {
      await client.query('ROLLBACK');
      console.error(error);
      res.status(500).json({ error: 'Error interno controlado al guardar solicitud' });
    } finally {
      client.release();
    }
  }
);

router.get('/seguimiento/:folio', async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT s.folio, s.tipo_solicitud, s.estado_actual, s.fecha_ingreso, s.fecha_limite_legal, s.respuesta_oficial, e.nombre AS centro, c.nombre AS categoria
       FROM solicitud s
       JOIN establecimiento e ON s.id_establecimiento = e.id_establecimiento
       JOIN categoria c ON s.id_categoria = c.id_categoria
       WHERE s.folio = $1`,
      [req.params.folio.toUpperCase()]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Folio no encontrado' });
    }
    res.json(result.rows.at(0));
  } catch (error) {
    res.status(500).json({ error: 'Error consultando folio' });
  }
});

router.get('/', verificarToken, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT s.*, e.nombre AS centro_nombre, e.tipo_sector, c.nombre AS categoria_nombre,
              sc.rut, sc.nombres, sc.apellido_paterno, sc.desea_contacto, sc.email, sc.telefono, sc.programa_prais
       FROM solicitud s
       JOIN establecimiento e ON s.id_establecimiento = e.id_establecimiento
       JOIN categoria c ON s.id_categoria = c.id_categoria
       LEFT JOIN solicitante_contacto sc ON s.id_solicitud = sc.id_solicitud
       ORDER BY s.fecha_limite_legal ASC`
    );

    const enriquecidas = result.rows.map(row => {
      const diasRestantes = calcularDiasRestantes(row.fecha_limite_legal);
      return {
        ...row,
        dias_restantes: diasRestantes,
        semaforo: obtenerSemaforo(diasRestantes, row.estado_actual)
      };
    });

    res.json(enriquecidas);
  } catch (error) {
    res.status(500).json({ error: 'Error obteniendo solicitudes' });
  }
});

router.put('/:id/responder', verificarToken, permitirRoles('FUNCIONARIO', 'ADMIN'), async (req, res) => {
  const { estado_actual, respuesta_oficial } = req.body;
  try {
    const update = await pool.query(
      `UPDATE solicitud 
       SET estado_actual = $1, respuesta_oficial = $2, fecha_respuesta = CURRENT_TIMESTAMP, id_funcionario_asignado = $3
       WHERE id_solicitud = $4 RETURNING folio, estado_actual`,
      [estado_actual, respuesta_oficial, req.usuario.id, req.params.id]
    );

    if (update.rows.length === 0) {
      return res.status(404).json({ error: 'Solicitud no encontrada' });
    }

    const actualizada = update.rows.at(0);

    await AuditLog.create({
      folio: actualizada.folio,
      accion: 'RESPUESTA_FUNCIONARIO',
      id_usuario: req.usuario.id,
      rol_usuario: req.usuario.rol,
      detalle: { estado_actual }
    });

    res.json({ mensaje: 'Solicitud actualizada', solicitud: actualizada });
  } catch (error) {
    res.status(500).json({ error: 'Error al actualizar solicitud' });
  }
});

router.get('/analitica/resumen', verificarToken, async (req, res) => {
  try {
    const porCategoria = await pool.query(
      `SELECT c.nombre AS motivo, COUNT(s.id_solicitud)::int AS total
       FROM categoria c
       LEFT JOIN solicitud s ON c.id_categoria = s.id_categoria
       GROUP BY c.nombre ORDER BY total DESC`
    );

    const porTipo = await pool.query(
      `SELECT tipo_solicitud, COUNT(*)::int AS total FROM solicitud GROUP BY tipo_solicitud`
    );

    const porCentro = await pool.query(
      `SELECT e.nombre AS centro, e.tipo_sector,
              COUNT(s.id_solicitud)::int AS total,
              COUNT(CASE WHEN s.estado_actual = 'Respondido' THEN 1 END)::int AS resueltas
       FROM establecimiento e
       LEFT JOIN solicitud s ON e.id_establecimiento = s.id_establecimiento
       GROUP BY e.nombre, e.tipo_sector ORDER BY total DESC`
    );

    res.json({
      porCategoria: porCategoria.rows,
      porTipo: porTipo.rows,
      porCentro: porCentro.rows
    });
  } catch (error) {
    res.status(500).json({ error: 'Error generando analítica' });
  }
});

module.exports = router;
