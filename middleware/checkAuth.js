import jwt from "jsonwebtoken"
import Usuario from "../models/Usuario.js";

//controla que el usuario este auntenticado
const checkAuth = async (req, res, next) => {
    let token;
    // los headers son paramatros que se analizan primero que el body (se usa para configuraciones y validaciones). Estos headers se ponen en la peticion que se hace desde el Front. El mas comun de usar es el Bearer Token.
    if (
        // La autorizacion al ser del tipo BerrerToken le agrega al token el string "Bearer" por eso tambien validamos si el header empieza con "Bearer".
        req.headers.authorization &&
        req.headers.authorization.startsWith('Bearer')
    ) {
        try {
            token = req.headers.authorization.split(' ')[1];

            // Uso la misma variable de entorno process.env.JWT_SECRET que se uso como llave para cifrar el token, para decifrar tambien.
            const decoded = jwt.verify(token, process.env.JWT_SECRET)

            // Los campos que van en la funcion select() son las propiedades del objeto Usuario que no quiero que se muestren (por eso tienen un -).
            // Este req.usuario es el que queda de forma global para tener informacion del usuario logeado en este momento.
            req.usuario = await Usuario.findById(decoded.id).select("-password -confirmado -token -createdAt -updatedAt -__v")

            return next();
            
        } catch (error) {
            return res.status(404).json({ msg: 'Hubo un error' })
        }
    }

    if (!token) {
        const error = new Error("Token no valido");
        return res.status(401).json({ msg: error.message });
    }

    next();
};

export default checkAuth;