import { useState } from 'react';
import TotemCiudadano from './components/TotemCiudadano';
import LoginModal from './components/LoginModal';
import BandejaOIRS from './components/BandejaOIRS';
import DashboardJefatura from './components/DashboardJefatura';
import { ShieldCheck, LogOut, LayoutDashboard, Inbox, MonitorSmartphone } from 'lucide-react';

export default function App() {
  const [vista, setVista] = useState('totem');
  const [sesion, setSesion] = useState(null);
  const [mostrarLogin, setMostrarLogin] = useState(false);

  const manejarLogin = (datos) => {
    setSesion(datos);
    setMostrarLogin(false);
    setVista(datos.usuario.rol === 'JEFATURA' ? 'dashboard' : 'bandeja');
  };

  const cerrarSesion = () => {
    setSesion(null);
    setVista('totem');
  };

  return (
    <div className="min-h-screen flex flex-col">
      <header className="bg-institucional text-white shadow-lg">
        <div className="max-w-6xl mx-auto px-6 py-4 flex flex-wrap justify-between items-center gap-4">
          <div>
            <h1 className="text-xl font-extrabold tracking-tight">Red de Salud Municipal — Padre Las Casas</h1>
            <p className="text-xs text-blue-200">Sistema Integral de Gestión, Trazabilidad y Analítica OIRS</p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setVista('totem')}
              className={`px-4 py-2 rounded-xl font-bold text-sm inline-flex items-center gap-2 ${
                vista === 'totem' ? 'bg-white text-institucional' : 'bg-blue-900 hover:bg-blue-800'
              }`}
            >
              <MonitorSmartphone size={18} /> Modo Tótem
            </button>

            {!sesion ? (
              <button
                onClick={() => setMostrarLogin(true)}
                className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 font-bold text-sm inline-flex items-center gap-2"
              >
                <ShieldCheck size={18} /> Acceso Funcionario
              </button>
            ) : (
              <>
                <button
                  onClick={() => setVista('bandeja')}
                  className={`px-4 py-2 rounded-xl font-bold text-sm inline-flex items-center gap-2 ${
                    vista === 'bandeja' ? 'bg-white text-institucional' : 'bg-blue-900 hover:bg-blue-800'
                  }`}
                >
                  <Inbox size={18} /> Bandeja OIRS
                </button>
                <button
                  onClick={() => setVista('dashboard')}
                  className={`px-4 py-2 rounded-xl font-bold text-sm inline-flex items-center gap-2 ${
                    vista === 'dashboard' ? 'bg-white text-institucional' : 'bg-blue-900 hover:bg-blue-800'
                  }`}
                >
                  <LayoutDashboard size={18} /> Dashboard
                </button>
                <button
                  onClick={cerrarSesion}
                  className="px-3 py-2 rounded-xl bg-red-600 hover:bg-red-700 font-bold text-sm inline-flex items-center gap-1"
                  title="Cerrar sesión"
                >
                  <LogOut size={18} />
                </button>
              </>
            )}
          </div>
        </div>
      </header>

      <main className="flex-1 py-6">
        {vista === 'totem' && <TotemCiudadano />}
        {vista === 'bandeja' && sesion && <BandejaOIRS token={sesion.token} usuario={sesion.usuario} />}
        {vista === 'dashboard' && sesion && <DashboardJefatura token={sesion.token} />}
      </main>

      {mostrarLogin && (
        <LoginModal onLoginSuccess={manejarLogin} onClose={() => setMostrarLogin(false)} />
      )}
    </div>
  );
}
