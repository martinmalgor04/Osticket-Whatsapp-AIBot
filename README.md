# Osticket-Whatsapp-AIBot

Este proyecto integra WhatsApp con OsTicket para automatizar la creación de tickets a partir de mensajes de clientes.

## 📌 *Descripción*
Osticket-Whatsapp-AIBot es un bot que recibe mensajes de WhatsApp, los procesa y los registra automáticamente en OsTicket. Utiliza inteligencia artificial para generar títulos de tickets relevantes y almacena interacciones en Supabase para mejorar el seguimiento de las conversaciones.

## 🎯 *Objetivos*
- Automatizar la creación de tickets en OsTicket a partir de mensajes de WhatsApp.
- Mejorar la experiencia del usuario con respuestas automáticas y categorización inteligente.
- Integrar múltiples tecnologías para una solución eficiente y escalable.

## 🛠 *Tecnologías utilizadas*
- *Node.js*: Plataforma de ejecución del bot.
- *WhatsApp*: Librería para interactuar con WhatsApp API.
- *OsTicket API*: Gestión de tickets.
- *OpenAI API*: Generación automática de títulos de tickets.
- *Supabase*: Base de datos y almacenamiento de interacciones.
- *Docker*: Para la contenedorización del proyecto.

## 📂 *Estructura del proyecto*

/Osticket-Whatsapp-AIBot
│── /src
│   ├── /config        # Configuraciones generales (base de datos, API keys, etc.)
│   │   ├── .env       #variables de entorno
│   ├── /services      # Integraciones con APIs externas
│   │   ├── supabase.js
│   │   ├── whatsapp.js
│   │   ├── osticket.js
│   │   ├── openai.js
│   ├── index.js       # Punto de entrada principal
│── Dockerfile         # Configuración para contenedorización
│── docker-compose.yml # Configuración de servicios adicionales
│── package.json       # Dependencias y scripts de npm
│── README.md          # Documentación del proyecto


## 🚀 *Instalación y configuración*
### 🔹 *1. Clonar el repositorio*
bash
git clone https://github.com/martinmalgor04/Osticket-Whatsapp-AIBot.git
cd Osticket-Whatsapp-AIBot


### 🔹 *2. Instalar dependencias*
bash
npm install


### 🔹 *3. Configurar variables de entorno*
Crea un archivo .env en la raíz con las siguientes variables:
env
WHATSAPP_PHONE_ID=XXXXX
WHATSAPP_API_KEY=XXXXX
SUPABASE_URL=XXXXX
SUPABASE_API_KEY=XXXXX
OSTICKET_API_KEY=XXXXX
OSTICKET_URL=XXXXX
PORT=3000
VERIFY_TOKEN=mi-token-seguro


### 🔹 *4. Ejecutar el bot*
bash
npm start


## 🐳 *Uso con Docker*
### 🔹 *1. Construir la imagen*
bash
docker build -t osticket-whatsapp-bot .

### 🔹 *2. Levantar el contenedor*
bash
docker run -d --env-file .env --name osticket-bot osticket-whatsapp-bot

### 🔹 *3. Ver logs*
bash
docker logs -f osticket-bot


## ✅ *Flujo de trabajo del bot*
1. El bot recibe un mensaje de WhatsApp.
2. Verifica si el usuario está registrado en Supabase.
3. Si es nuevo, solicita su información de contacto.
4. Le pide al usuario que seleccione una categoría de soporte.
5. El usuario describe su problema.
6. OpenAI genera un título de ticket.
7. Se envía el ticket a OsTicket.
8. El usuario recibe una confirmación con el ID del ticket.

## 📝 *Contribución*
Si deseas contribuir a este proyecto:
1. Haz un fork del repositorio.
2. Crea una rama con tu mejora (git checkout -b feature/nueva-funcionalidad).
3. Realiza tus cambios y sube la rama (git push origin feature/nueva-funcionalidad).
4. Abre un Pull Request.

## 📩 *Contacto*
Si tienes dudas o sugerencias, puedes contactarme en: [martin@serviciosysistemas.com.ar](mailto:martin@serviciosysistemas.com.ar)