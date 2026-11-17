import { useState, useEffect } from 'react';
import axios from 'axios';
import { MessageSquareWarning, Lightbulb, HeartHandshake, Search, CheckCircle2, UserX, UserCheck, Delete } from 'lucide-react';

const API = 'http://localhost:4000/api/solicitudes';

export default function TotemCiudadano() {
  const [paso, setPaso] = useState(1);
  const [catalogos, setCatalogos] = useState({ centros: [], categorias: [] });
  const [form, setForm] = useState({
    tipo_solicitud: '',
    id_establecimiento: '',
    id_categoria: '',
    otro_motivo: '',
    descripcion: '',
    es_anonima: true,
    rut: '',
    nombres: '',
    apellido_paterno: '',
    programa_prais: false,
    desea_contacto: false,
    email: '',
    telefono: ''
  });
  const [folioGenerado, setFolioGenerado] = useState(null);
  const [error, setError] = useState('');
  const [consultaFolio, setConsultaFolio] = useState('');
  const [resultadoFolio, setResultadoFolio] = useState(null);

  useEffect(() => {
    axios.get(`${API}/catalogos`).then(res => setCatalogos(res.data)).catch(() => {});
  }, []);

  const actualizar = (campo, valor) => {
    setForm(prev => Object.assign({}, prev, { [campo]: valor }));
  };

  const agregarDigitoRut = (digito) => {
    if (form.rut.length < 10) {
      actualizar('rut', form.rut + digito);
    }
  };

  const borrarDigitoRut = () => {
    actualizar('rut', form.rut.slice(0, -1));
  };

  const enviarSolicitud = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const payload = Object.assign({}, form, {
        id_establecimiento: Number(form.id_establecimiento),
        id_categoria: Number(form.id_categoria)
      });
      const res = await axios.post(API, payload);
      setFolioGenerado(res.data);
      setPaso(4);
    } catch (err) {
      setError(err.response?.data?.error || 'Error al registrar solicitud');
    }
  };

  const buscarFolio = async (e) => {
    e.preventDefault();
    setResultadoFolio(null);
    try {
      const res = await axios.get(`${API}/seguimiento/${consultaFolio.trim()}`);
      setResultadoFolio(res.data);
    } catch {
      setResultadoFolio({ noEncontrado: true });
    }
  };

  const reiniciar = () => {
    setPaso(1);
    setFolioGenerado(null);
    setForm({
      tipo_solicitud: '', id_establecimiento: '', id_categoria: '', otro_motivo: '',
      descripcion: '', es_anonima: true, rut: '', nombres: '', apellido_paterno: '',
      programa_prais: false, desea_contacto: false, email: '', telefono: ''
    });
  };
  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white rounded-2xl shadow-md p-8 border border-gray-200">
        {paso === 1 && (
          <div>
            <h2 className="text-3xl font-extrabold text-institucional text-center mb-2">
              Bienvenido a la OIRS Digital
            </h2>
            <p className="text-lg text-gray-600 text-center mb-8">
              Seleccione el tipo de solicitud que desea ingresar en nuestra Red de Salud:
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <button
                onClick={() => { actualizar('tipo_solicitud', 'Reclamo'); setPaso(2); }}
                className="h-[140px] bg-red-600 hover:bg-red-700 text-white rounded-2xl p-6 flex flex-col items-center justify-center gap-3 shadow-lg transition transform active:scale-95"
              >
                <MessageSquareWarning size={44} />
                <span className="text-2xl font-bold">RECLAMO</span>
              </button>

              <button
                onClick={() => { actualizar('tipo_solicitud', 'Sugerencia'); setPaso(2); }}
                className="h-[140px] bg-amber-500 hover:bg-amber-600 text-white rounded-2xl p-6 flex flex-col items-center justify-center gap-3 shadow-lg transition transform active:scale-95"
              >
                <Lightbulb size={44} />
                <span className="text-2xl font-bold">SUGERENCIA</span>
              </button>

              <button
                onClick={() => { actualizar('tipo_solicitud', 'Felicitacion'); setPaso(2); }}
                className="h-[140px] bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl p-6 flex flex-col items-center justify-center gap-3 shadow-lg transition transform active:scale-95"
              >
                <HeartHandshake size={44} />
                <span className="text-2xl font-bold">FELICITACIÓN</span>
              </button>
            </div>

            <div className="mt-10 pt-8 border-t border-gray-200">
              <h3 className="text-xl font-bold text-institucional mb-3 flex items-center gap-2">
                <Search size={22} /> Consultar estado de mi solicitud
              </h3>
              <form onSubmit={buscarFolio} className="flex flex-col sm:flex-row gap-3">
                <input
                  type="text"
                  placeholder="Ej: OIRS-2026-4521"
                  value={consultaFolio}
                  onChange={(e) => setConsultaFolio(e.target.value)}
                  className="flex-1 border-2 border-gray-300 rounded-xl px-4 py-3 text-lg uppercase focus:border-institucional outline-none"
                />
                <button type="submit" className="bg-institucional text-white px-8 py-3 rounded-xl font-bold text-lg hover:bg-institucionalHover">
                  Buscar Folio
                </button>
              </form>

              {resultadoFolio && (
                <div className="mt-4 p-4 rounded-xl bg-blue-50 border border-blue-200">
                  {resultadoFolio.noEncontrado ? (
                    <p className="text-red-600 font-semibold">No se encontró ninguna solicitud con ese folio.</p>
                  ) : (
                    <div className="space-y-1">
                      <p className="font-bold text-institucional text-lg">Folio: {resultadoFolio.folio} — Estado: <span className="underline">{resultadoFolio.estado_actual}</span></p>
                      <p><strong>Centro:</strong> {resultadoFolio.centro} | <strong>Motivo:</strong> {resultadoFolio.categoria}</p>
                      <p><strong>Plazo legal máximo:</strong> {new Date(resultadoFolio.fecha_limite_legal).toLocaleDateString('es-CL')}</p>
                      {resultadoFolio.respuesta_oficial && (
                        <p className="mt-2 p-3 bg-white rounded-lg border border-blue-300"><strong>Respuesta Oficial:</strong> {resultadoFolio.respuesta_oficial}</p>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {paso === 2 && (
          <div>
            <h2 className="text-2xl font-bold text-institucional mb-6">
              Paso 2: Seleccione Centro de Salud y Motivo ({form.tipo_solicitud})
            </h2>

            <div className="space-y-6">
              <div>
                <label className="block text-lg font-bold text-gray-800 mb-2">1. Centro de Salud de Padre Las Casas *</label>
                <select
                  value={form.id_establecimiento}
                  onChange={(e) => actualizar('id_establecimiento', e.target.value)}
                  className="w-full border-2 border-gray-300 rounded-xl p-4 text-lg bg-white"
                >
                  <option value="">-- Toque aquí para elegir el centro --</option>
                  {catalogos.centros.map(c => (
                    <option key={c.id_establecimiento} value={c.id_establecimiento}>
                      {c.nombre} ({c.tipo_sector})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-lg font-bold text-gray-800 mb-2">2. Área o Motivo Principal *</label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {catalogos.categorias.map(cat => (
                    <button
                      type="button"
                      key={cat.id_categoria}
                      onClick={() => actualizar('id_categoria', cat.id_categoria)}
                      className={`p-4 rounded-xl border-2 text-lg font-bold transition ${
                        Number(form.id_categoria) === cat.id_categoria
                          ? 'bg-institucional text-white border-institucional'
                          : 'bg-gray-50 text-gray-800 border-gray-300 hover:bg-gray-100'
                      }`}
                    >
                      {cat.nombre}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-lg font-bold text-gray-800 mb-2">3. Cuéntenos qué ocurrió (Detalle) *</label>
                <textarea
                  rows="4"
                  placeholder="Escriba aquí los detalles de su solicitud..."
                  value={form.descripcion}
                  onChange={(e) => actualizar('descripcion', e.target.value)}
                  className="w-full border-2 border-gray-300 rounded-xl p-4 text-lg"
                />
              </div>

              <div className="flex justify-between pt-4">
                <button onClick={() => setPaso(1)} className="px-8 py-4 rounded-xl bg-gray-200 font-bold text-lg">
                  ← Volver
                </button>
                <button
                  disabled={!form.id_establecimiento || !form.id_categoria || form.descripcion.length < 5}
                  onClick={() => setPaso(3)}
                  className="px-10 py-4 rounded-xl bg-institucional text-white font-bold text-lg disabled:opacity-40"
                >
                  Siguiente →
                </button>
              </div>
            </div>
          </div>
        )}
        {paso === 3 && (
          <form onSubmit={enviarSolicitud}>
            <h2 className="text-2xl font-bold text-institucional mb-4">
              Paso 3: Identificación (Opcional)
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
              <button
                type="button"
                onClick={() => { actualizar('es_anonima', true); actualizar('desea_contacto', false); }}
                className={`h-[120px] rounded-2xl border-2 p-4 flex items-center justify-center gap-3 text-xl font-bold ${
                  form.es_anonima ? 'bg-institucional text-white border-institucional' : 'bg-white text-gray-700 border-gray-300'
                }`}
              >
                <UserX size={34} /> Ingresar de forma Anónima
              </button>

              <button
                type="button"
                onClick={() => actualizar('es_anonima', false)}
                className={`h-[120px] rounded-2xl border-2 p-4 flex items-center justify-center gap-3 text-xl font-bold ${
                  !form.es_anonima ? 'bg-institucional text-white border-institucional' : 'bg-white text-gray-700 border-gray-300'
                }`}
              >
                <UserCheck size={34} /> Ingresar con mis Datos
              </button>
            </div>

            {!form.es_anonima && (
              <div className="bg-gray-50 p-6 rounded-2xl border border-gray-200 space-y-5 mb-6">
                <div>
                  <label className="block font-bold text-lg mb-2">RUT (Use el teclado táctil o escriba):</label>
                  <input
                    type="text"
                    value={form.rut}
                    onChange={(e) => actualizar('rut', e.target.value)}
                    placeholder="Ej: 12345678-9"
                    className="w-full border-2 border-gray-300 rounded-xl p-3 text-2xl font-bold tracking-wider mb-3 bg-white"
                  />
                  <div className="grid grid-cols-4 gap-2 max-w-md">
                    {['1','2','3','4','5','6','7','8','9','0','-','K'].map(tecla => (
                      <button
                        type="button"
                        key={tecla}
                        onClick={() => agregarDigitoRut(tecla)}
                        className="h-14 bg-white border-2 border-gray-300 rounded-xl text-2xl font-bold hover:bg-blue-50 active:bg-institucional active:text-white"
                      >
                        {tecla}
                      </button>
                    ))}
                    <button
                      type="button"
                      onClick={borrarDigitoRut}
                      className="col-span-4 h-12 bg-red-100 text-red-700 rounded-xl font-bold flex items-center justify-center gap-2"
                    >
                      <Delete size={22} /> Borrar último dígito
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <input
                    type="text"
                    placeholder="Nombres"
                    value={form.nombres}
                    onChange={(e) => actualizar('nombres', e.target.value)}
                    className="border-2 border-gray-300 rounded-xl p-3 text-lg bg-white"
                  />
                  <input
                    type="text"
                    placeholder="Apellido Paterno"
                    value={form.apellido_paterno}
                    onChange={(e) => actualizar('apellido_paterno', e.target.value)}
                    className="border-2 border-gray-300 rounded-xl p-3 text-lg bg-white"
                  />
                </div>

                <label className="flex items-center gap-3 text-lg font-semibold">
                  <input
                    type="checkbox"
                    checked={form.programa_prais}
                    onChange={(e) => actualizar('programa_prais', e.target.checked)}
                    className="w-6 h-6"
                  />
                  Pertenezco al Programa PRAIS
                </label>

                <label className="flex items-center gap-3 text-lg font-semibold text-institucional">
                  <input
                    type="checkbox"
                    checked={form.desea_contacto}
                    onChange={(e) => actualizar('desea_contacto', e.target.checked)}
                    className="w-6 h-6"
                  />
                  ¿Desea ser contactado con la respuesta oficial?
                </label>

                {form.desea_contacto && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                    <input
                      type="email"
                      placeholder="Correo electrónico"
                      value={form.email}
                      onChange={(e) => actualizar('email', e.target.value)}
                      className="border-2 border-blue-400 rounded-xl p-3 text-lg bg-white"
                    />
                    <input
                      type="tel"
                      placeholder="Teléfono (+569...)"
                      value={form.telefono}
                      onChange={(e) => actualizar('telefono', e.target.value)}
                      className="border-2 border-blue-400 rounded-xl p-3 text-lg bg-white"
                    />
                  </div>
                )}
              </div>
            )}

            {error && <p className="text-red-600 font-bold mb-4 text-lg">{error}</p>}

            <div className="flex justify-between">
              <button type="button" onClick={() => setPaso(2)} className="px-8 py-4 rounded-xl bg-gray-200 font-bold text-lg">
                ← Volver
              </button>
              <button type="submit" className="px-10 py-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xl shadow-lg">
                Enviar Solicitud OIRS
              </button>
            </div>
          </form>
        )}

        {paso === 4 && folioGenerado && (
          <div className="text-center py-8 space-y-5">
            <CheckCircle2 size={72} className="text-emerald-600 mx-auto" />
            <h2 className="text-3xl font-extrabold text-institucional">¡Solicitud Registrada con Éxito!</h2>
            <p className="text-lg text-gray-700">Guarde su código único de seguimiento:</p>
            <div className="bg-blue-50 border-2 border-institucional rounded-2xl py-5 px-8 inline-block">
              <span className="text-4xl font-black text-institucional tracking-widest">{folioGenerado.folio}</span>
            </div>
            <p className="text-gray-600 text-lg">
              Plazo legal máximo de respuesta (15 días hábiles - Ley N° 20.584):{' '}
              <strong>{new Date(folioGenerado.fecha_limite_legal).toLocaleDateString('es-CL')}</strong>
            </p>
            <div className="pt-4">
              <button onClick={reiniciar} className="bg-institucional text-white px-10 py-4 rounded-xl font-bold text-xl">
                Finalizar y Volver al Inicio
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
