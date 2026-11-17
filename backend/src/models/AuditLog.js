const mongoose = require('mongoose');

const auditLogSchema = new mongoose.Schema({
  folio: { type: String, required: true, index: true },
  accion: { type: String, required: true },
  id_usuario: { type: Number, default: null },
  rol_usuario: { type: String, default: 'CIUDADANO' },
  detalle: { type: Object },
  fecha: { type: Date, default: Date.now }
});

module.exports = mongoose.model('AuditLog', auditLogSchema, 'audit_logs');
