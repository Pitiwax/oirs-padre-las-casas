import { useState } from 'react';
import axios from 'axios';
import { Lock } from 'lucide-react';

export default function LoginModal({ onLoginSuccess, onClose }) {
  const [email, setEmail] = useState('funcionario@padre-las-casas.cl');
  const [password, setPassword] = useState('Oirs2026!');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const res = await axios.post('http://localhost:4000/api/auth/login', { email, password });
      onLoginSuccess(res.data);
    } catch (err) {
      setError(err.response?.data?.error || 'Error al iniciar sesión');
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl max-w-md w-full p-8 shadow-2xl">
        <div className="flex items-center gap-3 text-institucional mb-4">
          <Lock size={28} />
          <h2 className="text-2xl font-bold">Acceso Intranet Salud</h2>
        </div>
        <p className="text-sm text-gray-600 mb-5">
          Ingrese con credenciales institucionales (Funcionario OIRS o Jefatura):
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block font-semibold mb-1">Correo Institucional</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full border rounded-xl p-3"
              required
            />
          </div>
          <div>
            <label className="block font-semibold mb-1">Contraseña</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full border rounded-xl p-3"
              required
            />
          </div>

          <div className="text-xs bg-gray-100 p-3 rounded-lg text-gray-600">
            <p><strong>Funcionario:</strong> funcionario@padre-las-casas.cl</p>
            <p><strong>Jefatura:</strong> jefatura@padre-las-casas.cl</p>
            <p><strong>Clave ambos:</strong> Oirs2026!</p>
          </div>

          {error && <p className="text-red-600 text-sm font-bold">{error}</p>}

          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={onClose} className="px-5 py-2.5 rounded-xl bg-gray-200 font-semibold">
              Cancelar
            </button>
            <button type="submit" className="px-6 py-2.5 rounded-xl bg-institucional text-white font-bold">
              Ingresar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
