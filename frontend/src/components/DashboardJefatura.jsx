import { useState, useEffect } from 'react';
import axios from 'axios';
import { BarChart3, Building2 } from 'lucide-react';

export default function DashboardJefatura({ token }) {
  const [data, setData] = useState(null);

  useEffect(() => {
    axios.get('http://localhost:4000/api/solicitudes/analitica/resumen', {
      headers: { Authorization: `Bearer ${token}` }
    }).then(res => setData(res.data));
  }, [token]);

  if (!data) return <div className="p-8 text-center font-bold">Cargando analítica cualitativa...</div>;

  const maxCat = Math.max(...data.porCategoria.map(c => c.total), 1);

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <div className="bg-white rounded-2xl shadow-md p-6 border border-gray-200">
        <h2 className="text-2xl font-bold text-institucional flex items-center gap-2 mb-1">
          <BarChart3 size={28} /> Dashboard de Analítica Cualitativa — Red de Salud Padre Las Casas
        </h2>
        <p className="text-gray-600 mb-6">
          Identificación de causas raíz en los 4 centros urbanos y 6 postas rurales (Datos anonimizados Ley N° 19.628)
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          {['Reclamo', 'Sugerencia', 'Felicitacion'].map(tipo => {
            const item = data.porTipo.find(t => t.tipo_solicitud === tipo);
            return (
              <div key={tipo} className="bg-blue-50 border border-blue-200 rounded-2xl p-5">
                <p className="text-sm font-bold text-gray-600 uppercase">{tipo}s</p>
                <p className="text-4xl font-black text-institucional mt-1">{item ? item.total : 0}</p>
              </div>
            );
          })}
        </div>

        <h3 className="text-xl font-bold text-institucional mb-4">Motivos de Disconformidad / Causa Raíz</h3>
        <div className="space-y-4 mb-8">
          {data.porCategoria.map(cat => (
            <div key={cat.motivo}>
              <div className="flex justify-between font-bold text-gray-700 mb-1">
                <span>{cat.motivo}</span>
                <span>{cat.total} solicitudes</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-5 overflow-hidden">
                <div
                  className="bg-institucional h-5 rounded-full transition-all duration-500"
                  style={{ width: `${(cat.total / maxCat) * 100}%` }}
                />
              </div>
            </div>
          ))}
        </div>

        <h3 className="text-xl font-bold text-institucional mb-3 flex items-center gap-2">
          <Building2 size={22} /> Consolidado por Establecimiento (10 Centros de la Red)
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-100 text-institucional border-b-2 border-institucional">
                <th className="p-3">Establecimiento</th>
                <th className="p-3">Sector</th>
                <th className="p-3">Total Recibidas</th>
                <th className="p-3">Respondidas</th>
              </tr>
            </thead>
            <tbody>
              {data.porCentro.map(c => (
                <tr key={c.centro} className="border-b">
                  <td className="p-3 font-semibold">{c.centro}</td>
                  <td className="p-3">{c.tipo_sector}</td>
                  <td className="p-3 font-bold">{c.total}</td>
                  <td className="p-3 text-emerald-700 font-bold">{c.resueltas}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
