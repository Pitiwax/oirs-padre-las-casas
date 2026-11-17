import { useState, useEffect } from 'react';
import axios from 'axios';
import { Clock, Send } from 'lucide-react';

export default function BandejaOIRS({ token, usuario }) {
  const [solicitudes, setSolicitudes] = useState([]);
  const [seleccionada, setSeleccionada] = useState(null);
  const [respuesta, setRespuesta] = useState('');
  const [nuevoEstado, setNuevoEstado] = useState('Respondido');

  const cargarSolicitudes = async () => {
    const res = await axios.get('http://localhost:4000/api/solicitudes', {
      headers: { Authorization: `Bearer ${token}` }
    });
    setSolicitudes(res.data);
  };

  useEffect(() => {
    cargarSolicitudes();
  }, []);

  const guardarGestion = async (e) => {
    e.preventDefault();
    await axios.put(
      `http://localhost:4000/api/solicitudes/${seleccionada.id_solicitud}/responder`,
      { estado_actual: nuevoEstado, respuesta_oficial: respuesta },
      { headers: { Authorization: `Bearer ${token}` } }
    );
    setSeleccionada(null);
    setRespuesta('');
    cargarSolicitudes();
  };

  const colorSemaforo = (color) => {
    if (color === 'ROJO') return 'bg-red-100 text-red-800 border-red-400';
    if (color === 'AMARILLO') return 'bg-amber-100 text-amber-800 border-amber-400';
    return 'bg-emerald-100 text-emerald-800 border-emerald-400';
  };
  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="bg-white rounded-2xl shadow-md p-6 border border-gray-200">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-2xl font-bold text-institucional">Bandeja de Trazabilidad OIRS</h2>
            <p className="text-gray-600">Control de plazos legales (Ley N° 20.584 - 15 días hábiles)</p>
          </div>
          <span className="bg-blue-100 text-institucional px-4 py-2 rounded-xl font-bold">
            Total solicitudes: {solicitudes.length}
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-institucional text-white">
                <th className="p-3 rounded-tl-xl">Semáforo Plazo</th>
                <th className="p-3">Folio</th>
                <th className="p-3">Tipo</th>
                <th className="p-3">Centro de Salud</th>
                <th className="p-3">Causa Raíz</th>
                <th className="p-3">Estado</th>
                <th className="p-3 rounded-tr-xl">Acción</th>
              </tr>
            </thead>
            <tbody>
              {solicitudes.map((sol) => (
                <tr key={sol.id_solicitud} className="border-b hover:bg-gray-50">
                  <td className="p-3">
                    <span className={`px-3 py-1 rounded-full text-xs font-extrabold border inline-flex items-center gap-1 ${colorSemaforo(sol.semaforo)}`}>
                      <Clock size={14} /> {sol.semaforo} ({sol.dias_restantes}d)
                    </span>
                  </td>
                  <td className="p-3 font-bold text-institucional">{sol.folio}</td>
                  <td className="p-3">{sol.tipo_solicitud}</td>
                  <td className="p-3">{sol.centro_nombre}</td>
                  <td className="p-3 font-semibold">{sol.categoria_nombre}</td>
                  <td className="p-3">{sol.estado_actual}</td>
                  <td className="p-3">
                    <button
                      onClick={() => { setSeleccionada(sol); setRespuesta(sol.respuesta_oficial || ''); }}
                      className="bg-institucional text-white px-4 py-1.5 rounded-lg text-sm font-bold hover:bg-institucionalHover"
                    >
                      Gestionar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {seleccionada && (
          <div className="mt-6 p-6 bg-blue-50 rounded-2xl border-2 border-institucional">
            <h3 className="text-xl font-bold text-institucional mb-2">
              Gestionando Folio {seleccionada.folio} ({seleccionada.centro_nombre})
            </h3>
            <p className="bg-white p-4 rounded-xl border mb-4 text-gray-800">
              <strong>Detalle ciudadano:</strong> {seleccionada.descripcion}
            </p>
            {!seleccionada.es_anonima && (
              <p className="text-sm text-gray-700 mb-4">
                <strong>Solicitante:</strong> {seleccionada.nombres} {seleccionada.apellido_paterno} | RUT: {seleccionada.rut} | Contacto: {seleccionada.email || seleccionada.telefono || 'No solicita'}
              </p>
            )}

            {usuario.rol !== 'JEFATURA' ? (
              <form onSubmit={guardarGestion} className="space-y-4">
                <div>
                  <label className="block font-bold mb-1">Actualizar Estado:</label>
                  <select
                    value={nuevoEstado}
                    onChange={(e) => setNuevoEstado(e.target.value)}
                    className="border rounded-xl p-2.5 bg-white font-semibold"
                  >
                    <option value="En Revision">En Revisión</option>
                    <option value="Respondido">Respondido</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold mb-1">Respuesta Oficial al Usuario:</label>
                  <textarea
                    rows="3"
                    required
                    value={respuesta}
                    onChange={(e) => setRespuesta(e.target.value)}
                    placeholder="Redacte la respuesta formal de la OIRS..."
                    className="w-full border rounded-xl p-3 bg-white"
                  />
                </div>
                <div className="flex gap-3">
                  <button type="submit" className="bg-emerald-600 text-white px-6 py-2.5 rounded-xl font-bold inline-flex items-center gap-2">
                    <Send size={18} /> Guardar y Auditar
                  </button>
                  <button type="button" onClick={() => setSeleccionada(null)} className="bg-gray-300 px-5 py-2.5 rounded-xl font-bold">
                    Cerrar
                  </button>
                </div>
              </form>
            ) : (
              <p className="text-amber-700 font-bold">Modo Jefatura: Vista de solo lectura.</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
