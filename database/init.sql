-- =========================================================================
-- SISTEMA WEB DE GESTIÓN, TRAZABILIDAD Y ANALÍTICA OIRS - PADRE LAS CASAS
-- Modelo Relacional en 3ra Forma Normal (3FN) + Índices de Optimización
-- =========================================================================

-- 1. Tabla Maestra de Establecimientos (Anexo A - Informe 2)
CREATE TABLE establecimiento (
    id_establecimiento SERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL UNIQUE,
    tipo_sector VARCHAR(20) NOT NULL CHECK (tipo_sector IN ('Urbano', 'Rural')),
    activo BOOLEAN DEFAULT TRUE
);

-- 2. Tabla Maestra de Categorías / Causas Raíz (Enfoque Cualitativo)
CREATE TABLE categoria (
    id_categoria SERIAL PRIMARY KEY,
    nombre VARCHAR(80) NOT NULL UNIQUE,
    descripcion VARCHAR(255)
);

-- 3. Tabla de Usuarios Internos (RBAC: Funcionario OIRS, Jefatura, Admin)
CREATE TABLE usuario (
    id_usuario SERIAL PRIMARY KEY,
    rut VARCHAR(12) NOT NULL UNIQUE,
    nombre_completo VARCHAR(120) NOT NULL,
    email VARCHAR(120) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    rol VARCHAR(20) NOT NULL CHECK (rol IN ('FUNCIONARIO', 'JEFATURA', 'ADMIN')),
    id_establecimiento INT REFERENCES establecimiento(id_establecimiento) ON DELETE SET NULL,
    creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 4. Tabla Principal de Solicitudes OIRS
CREATE TABLE solicitud (
    id_solicitud SERIAL PRIMARY KEY,
    folio VARCHAR(20) NOT NULL UNIQUE,
    tipo_solicitud VARCHAR(15) NOT NULL CHECK (tipo_solicitud IN ('Reclamo', 'Sugerencia', 'Felicitacion')),
    id_establecimiento INT NOT NULL REFERENCES establecimiento(id_establecimiento),
    id_categoria INT NOT NULL REFERENCES categoria(id_categoria),
    otro_motivo VARCHAR(150),
    descripcion TEXT NOT NULL CHECK (char_length(descripcion) <= 3000),
    es_anonima BOOLEAN NOT NULL DEFAULT FALSE,
    estado_actual VARCHAR(20) NOT NULL DEFAULT 'Ingresado' CHECK (estado_actual IN ('Ingresado', 'En Revision', 'Respondido')),
    respuesta_oficial TEXT,
    fecha_ingreso TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    fecha_limite_legal DATE NOT NULL,
    fecha_respuesta TIMESTAMP,
    id_funcionario_asignado INT REFERENCES usuario(id_usuario)
);

-- 5. Tabla Separada de Datos Sensibles del Solicitante (3FN + Ley N° 19.628)
-- Solo se puebla si es_anonima = FALSE o si desea ser contactado
CREATE TABLE solicitante_contacto (
    id_contacto SERIAL PRIMARY KEY,
    id_solicitud INT NOT NULL UNIQUE REFERENCES solicitud(id_solicitud) ON DELETE CASCADE,
    rut VARCHAR(12),
    nombres VARCHAR(80),
    apellido_paterno VARCHAR(60),
    apellido_materno VARCHAR(60),
    fecha_nacimiento DATE,
    programa_prais BOOLEAN DEFAULT FALSE,
    desea_contacto BOOLEAN NOT NULL DEFAULT FALSE,
    email VARCHAR(120),
    telefono VARCHAR(20)
);

-- =========================================================================
-- ÍNDICES DE OPTIMIZACIÓN (Criterio 3.1.2.4)
-- Acelera búsquedas por folio, filtros del Dashboard y orden por vencimiento
-- =========================================================================
CREATE INDEX idx_solicitud_folio ON solicitud(folio);
CREATE INDEX idx_solicitud_establecimiento ON solicitud(id_establecimiento);
CREATE INDEX idx_solicitud_categoria ON solicitud(id_categoria);
CREATE INDEX idx_solicitud_fecha_limite ON solicitud(fecha_limite_legal);
CREATE INDEX idx_solicitud_estado ON solicitud(estado_actual);

-- =========================================================================
-- POBLADO DE DATOS MAESTROS (Los 10 Centros Reales de Padre Las Casas)
-- =========================================================================
INSERT INTO establecimiento (nombre, tipo_sector) VALUES
('CESFAM Padre Las Casas', 'Urbano'),
('CESFAM Pulmahue', 'Urbano'),
('CECOSF Los Caciques', 'Urbano'),
('CECOSF Conunhueno', 'Urbano'),
('Posta Rural San Ramón', 'Rural'),
('Posta Rural Codinhue', 'Rural'),
('Posta Rural Truf Truf', 'Rural'),
('Posta Rural Niágara', 'Rural'),
('Posta Rural Metrenco', 'Rural'),
('Posta Rural Huichahue', 'Rural');

INSERT INTO categoria (nombre, descripcion) VALUES
('SOME', 'Atención en mesón, agendamiento de horas médicas y entrega de números'),
('Farmacia', 'Entrega de medicamentos, stock disponible y tiempos de despacho'),
('Tiempos de Espera', 'Demora en atención médica, dental, urgencias o procedimientos'),
('Trato al Usuario', 'Calidad de atención, empatía y comunicación del personal'),
('Infraestructura', 'Estado de salas de espera, baños, accesibilidad y limpieza'),
('Otro', 'Otros motivos especificados libremente por el ciudadano');
