const { generateResponse } = require("./openai"); // Ruta al archivo openai.js

// Prueba la función con un prompt
generateResponse("Explica brevemente cómo funciona un motor de búsqueda.")
    .then((response) => console.log("Respuesta de la IA:", response))
    .catch((error) => console.error("Error:", error));