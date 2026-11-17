const FERIADOS_CHILE_2026 = [
  '2026-01-01', '2026-04-03', '2026-04-04', '2026-05-01',
  '2026-05-21', '2026-06-21', '2026-06-29', '2026-07-16',
  '2026-08-15', '2026-09-18', '2026-09-19', '2026-10-12',
  '2026-10-31', '2026-11-01', '2026-12-08', '2026-12-25'
];

function esDiaHabil(fecha) {
  const diaSemana = fecha.getDay();
  if (diaSemana === 0 || diaSemana === 6) return false;
  const iso = fecha.toISOString().split('T').at(0);
  return !FERIADOS_CHILE_2026.includes(iso);
}

function calcularFechaLimite(fechaInicio, diasHabiles = 15) {
  const actual = new Date(fechaInicio);
  let sumados = 0;
  while (sumados < diasHabiles) {
    actual.setDate(actual.getDate() + 1);
    if (esDiaHabil(actual)) {
      sumados++;
    }
  }
  return actual;
}

function calcularDiasRestantes(fechaLimite, fechaReferencia = new Date()) {
  const inicio = new Date(fechaReferencia);
  inicio.setHours(0, 0, 0, 0);
  const fin = new Date(fechaLimite);
  fin.setHours(0, 0, 0, 0);

  if (fin < inicio) return 0;

  let dias = 0;
  const cursor = new Date(inicio);
  while (cursor < fin) {
    cursor.setDate(cursor.getDate() + 1);
    if (esDiaHabil(cursor)) {
      dias++;
    }
  }
  return dias;
}

function obtenerSemaforo(diasRestantes, estado) {
  if (estado === 'Respondido') return 'VERDE';
  if (diasRestantes <= 3) return 'ROJO';
  if (estado === 'En Revision' || diasRestantes <= 8) return 'AMARILLO';
  return 'VERDE';
}

module.exports = { esDiaHabil, calcularFechaLimite, calcularDiasRestantes, obtenerSemaforo };
