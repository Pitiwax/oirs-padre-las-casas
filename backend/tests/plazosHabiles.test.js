const { calcularFechaLimite, obtenerSemaforo } = require('../src/utils/plazosHabiles');

describe('Pruebas Unitarias - Módulo Normativo Ley N° 20.584', () => {
  test('Debe sumar exactamente 15 días hábiles saltando fines de semana y feriados', () => {
    const inicio = new Date('2026-09-11T10:00:00Z');
    const limite = calcularFechaLimite(inicio, 15);
    expect(limite.toISOString().split('T').at(0)).toBe('2026-10-05');
  });

  test('Debe activar semáforo ROJO cuando quedan 3 o menos días hábiles', () => {
    expect(obtenerSemaforo(2, 'Ingresado')).toBe('ROJO');
  });

  test('Debe mantener semáforo VERDE cuando la solicitud ya fue respondida', () => {
    expect(obtenerSemaforo(1, 'Respondido')).toBe('VERDE');
  });
});
