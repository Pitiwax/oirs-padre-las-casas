# Sistema Web de Gestión, Trazabilidad y Analítica OIRS
**Red de Salud Municipal — CESFAM Padre Las Casas**  
**Asignatura:** Proyecto Integrado (Sección IEI-4) — INACAP Temuco  
**Integrantes:** Francisco Reyes (Arquitectura, BD y Backend) · Matías Núñez (UX/UI, Frontend y QA)  
**Docente:** Manuel Sánchez Cárcamo  

---

## 1. Descripción de la Solución
Plataforma web integral con interfaz táctil tipo tótem (norma WCAG 2.1 AA para adultos mayores) y panel de gestión interna para centralizar las solicitudes ciudadanas (Reclamos, Sugerencias y Felicitaciones) de los **10 establecimientos de salud de Padre Las Casas** (4 centros urbanos y 6 postas rurales), automatizando el control del plazo legal de **15 días hábiles** (Ley N.º 20.584) y protegiendo datos sensibles (Ley N.º 19.628).

## 2. Stack Tecnológico y Arquitectura
* **Frontend:** React.js + Vite + Tailwind CSS + Lucide Icons.
* **Backend:** Node.js (LTS) + Express + JWT + bcrypt + express-validator + Helmet.
* **Base de Datos Relacional:** PostgreSQL (Modelo normalizado en 3FN + índices).
* **Base de Datos NoSQL:** MongoDB (Auditoría de eventos `audit_logs` enlazados por folio).
* **Pruebas Automatizadas:** Jest.

---

## 3. Requisitos Previos del Entorno
Para ejecutar el proyecto en cualquier equipo Windows/Linux se requiere tener instalado:
1. **Node.js (v20+ LTS)**
2. **PostgreSQL (v16+)** corriendo en puerto `5432`
3. **MongoDB Community Server** corriendo en puerto `27017`

---

## 4. Guía de Instalación y Despliegue Paso a Paso

### Paso 1: Configurar la Base de Datos PostgreSQL
1. Abrir **pgAdmin 4** o `psql` y crear una base de datos llamada **`oirs_plc`**.
2. Ejecutar el script ubicado en **`database/init.sql`** para crear las 5 tablas en 3FN, los índices de optimización y poblar los 10 establecimientos reales de Padre Las Casas.

### Paso 2: Configurar y Levantar el Backend
```bash
cd backend
npm install
```
Crear un archivo `.env` basado en `.env.example`:
```env
PORT=4000
PG_HOST=localhost
PG_PORT=5432
PG_USER=postgres
PG_PASSWORD=admin1234
PG_DATABASE=oirs_plc
MONGO_URI=mongodb://127.0.0.1:27017/oirs_logs
JWT_SECRET=OIRS_PadreLasCasas_2026_SuperSecretKey!
```
Encender el servidor API:
```bash
npm run dev
```

### Paso 3: Poblar Usuarios Institucionales de Prueba
Con el backend corriendo, ejecutar en otra terminal (PowerShell) para crear los usuarios con contraseñas cifradas con `bcrypt`:
```powershell
Invoke-RestMethod -Uri "http://localhost:4000/api/auth/seed-usuarios" -Method POST
```

### Paso 4: Configurar y Levantar el Frontend
```bash
cd frontend
npm install
npm run dev
```
Abrir en el navegador: **`http://localhost:5173`**

---

## 5. Credenciales de Acceso para Pruebas (RBAC)
* **Modo Ciudadano / Tótem:** Acceso público directo sin login (permite ingreso anónimo o identificado).
* **Funcionario OIRS (Gestión y Respuesta):** `funcionario@padre-las-casas.cl` / Clave: `Oirs2026!`
* **Jefatura Red de Salud (Solo Lectura y Dashboard):** `jefatura@padre-las-casas.cl` / Clave: `Oirs2026!`

---

## 6. Ejecución de Pruebas Unitarias (Jest)
Para validar el cálculo matemático de los 15 días hábiles (descontando fines de semana y feriados chilenos) y la lógica del semáforo legal:
```bash
cd backend
npm test
```
