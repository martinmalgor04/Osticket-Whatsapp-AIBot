# Usa Node 18 como base
FROM node:18

# Define el directorio de trabajo dentro del contenedor
WORKDIR /app

# Copia los archivos de dependencias primero
COPY package*.json ./

# Instala dependencias
RUN npm install

# Copia todo el código fuente
COPY . .

# Expone el puerto 3000
EXPOSE 3000

# Comando para ejecutar el bot
CMD ["node", "src/index.js"]