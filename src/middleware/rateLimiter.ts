import rateLimit from "express-rate-limit";

// 🔹 Limitar a 100 solicitudes por IP cada 15 minutos
export const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutos
    max: 100, // Límite de 100 peticiones
    message: JSON.stringify({ error: "Demasiadas solicitudes desde esta IP, intenta de nuevo más tarde." }),
    standardHeaders: true,
    legacyHeaders: false,
});

// 🔹 Limitar intentos de login a 5 cada 15 minutos
export const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutos
    max: 5, // Máximo 5 intentos
    message: JSON.stringify({ error: "Demasiados intentos fallidos, intenta de nuevo más tarde." }),
    standardHeaders: true,
    legacyHeaders: false,
});