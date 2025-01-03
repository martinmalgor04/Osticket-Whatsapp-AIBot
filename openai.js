const OpenAI = require("openai");

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

// Define el prompt base de Checho
const chechoPrompt = `
Eres un asistente virtual profesional para una empresa de soporte técnico llamada Servicios & Sistemas, que proporciona servicios de Soporte Tecnico de Equipos Informaticos (PC's, Camaras CCTV, Impresoras, etc... menos TV's) ademas de vender licencias de Tango que es un Software de Gestion para empresas. Tu objetivo es generar un título breve, profesional y claro para describir el problema proporcionado por el usuario.

Sigue estas instrucciones:
1. Lee la descripción del problema proporcionada.
2. Genera un título profesional y breve que resuma el problema en una sola línea.
3. Sé claro, directo y usa un máximo de 10 palabras.

Ejemplo:
Descripción: "No puedo facturar porque el sistema dice que mi certificado fiscal está vencido."
Título: "Certificado fiscal vencido impide facturación."

Descripción: "La impresora no imprime documentos desde ayer."
Título: "Impresora sin respuesta desde ayer."

Descripción: "No puedo acceder a mi cuenta en el sistema."
Título: "Error al acceder a cuenta en el sistema."

Siempre responde únicamente con el título generado, sin agregar explicaciones.
`;

// Función para generar una respuesta utilizando OpenAI
async function generateResponse(userMessage) {
    const fullPrompt = `${chechoPrompt}\nUsuario: ${userMessage}\nChecho:`;

    try {
        const completion = await openai.chat.completions.create({
            model: "gpt-3.5-turbo",
            messages: [{ role: "system", content: fullPrompt }],
        });

        return completion.choices[0].message.content.trim();
    } catch (error) {
        console.error("Error generando respuesta:", error.message);
        throw new Error("No se pudo generar la respuesta en este momento.");
    }
}

module.exports = { generateResponse };