const axios = require('axios');

const URL = 'http://localhost:4000/api/solicitudes';
const TOTAL_PETICIONES = 50;

async function ejecutarPruebaEstres() {
  console.log(`🚀 Iniciando prueba de estrés: ${TOTAL_PETICIONES} peticiones simultáneas desde los 10 centros...`);

  const peticiones = Array.from({ length: TOTAL_PETICIONES }, (_, i) => {
    const centroId = (i % 10) + 1; // Distribuye entre los 10 centros de Padre Las Casas
    const categoriaId = (i % 5) + 1;

    return axios.post(URL, {
      tipo_solicitud: i % 3 === 0 ? 'Reclamo' : i % 3 === 1 ? 'Sugerencia' : 'Felicitacion',
      id_establecimiento: centroId,
      id_categoria: categoriaId,
      descripcion: `Prueba de carga concurrente N° ${i + 1} - Simulación red rural Padre Las Casas`,
      es_anonima: true
    });
  });

  const inicio = performance.now();

  try {
    const resultados = await Promise.all(peticiones);
    const fin = performance.now();

    const tiempoTotalSeg = ((fin - inicio) / 1000).toFixed(3);
    const tiempoPromedioSeg = (tiempoTotalSeg / TOTAL_PETICIONES).toFixed(4);
    const exitosas = resultados.filter(r => r.status === 201).length;

    console.log('\n======================================================');
    console.log('📊 RESULTADOS PRUEBA DE RENDIMIENTO (CONCURRENCIA)');
    console.log('======================================================');
    console.log(`✅ Peticiones enviadas simultáneamente : ${TOTAL_PETICIONES}`);
    console.log(`✅ Solicitudes guardadas (HTTP 201)   : ${exitosas} / ${TOTAL_PETICIONES}`);
    console.log(`⏱️  Tiempo total de procesamiento     : ${tiempoTotalSeg} segundos`);
    console.log(`⚡ Tiempo promedio por petición       : ${tiempoPromedioSeg} segundos`);
    console.log(`🎯 Meta exigida en Informe 2          : < 1.800 segundos`);
    console.log(`🏆 Estado de la prueba                : ${Number(tiempoTotalSeg) < 1.8 ? 'APROBADA' : 'OBSERVADA'}`);
    console.log('======================================================\n');
  } catch (error) {
    console.error('❌ Error durante la prueba de estrés:', error.message);
  }
}

ejecutarPruebaEstres();
