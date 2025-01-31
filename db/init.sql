-- Crear la base de datos si no existe (opcional, porque ya la crea el contenedor)
-- CREATE DATABASE whatsapp_bot;

-- Seleccionar la base de datos
\c whatsapp_bot;

-- Crear tabla users
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    whatsapp_number VARCHAR(15) UNIQUE NOT NULL, -- Número de teléfono
    email VARCHAR(255), -- Correo electrónico
    name VARCHAR(100), -- Nombre
    company_name VARCHAR(100), -- Nombre de la empresa 
    created_at TIMESTAMP DEFAULT NOW() -- Fecha y hora de creación
);

-- Crear tabla interactions
CREATE TABLE interactions (
    id SERIAL PRIMARY KEY,
    whatsapp_number VARCHAR NOT NULL, -- Número de teléfono
    message_text TEXT NOT NULL,       -- Texto del mensaje
    direction VARCHAR NOT NULL,       -- Dirección del mensaje ('received' o 'sent')
    state VARCHAR(50) NOT NULL,     -- Estado de la conversación
    created_at TIMESTAMP DEFAULT NOW() -- Fecha y hora de la interacción
);