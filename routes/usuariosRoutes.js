import express from "express";
import { 
    registrar,
    autenticar,
    confirmar,
    olvidePassword,
    comprobarToken,
    nuevoPassword,
    perfil
} from "../controllers/usuarioController.js";
import checkAuth from "../middleware/checkAuth.js";

const router = express.Router();

// Autenticacion, Registro y Confirmacion de Usuarios
router.post('/', registrar); // Crea un nuevo Usuario
router.post('/login', autenticar); // Log in del Usuario
router.get('/confirmar/:token', confirmar) // Confirmacion del mail
router.post('/olvide-password', olvidePassword)
/* 
get -> Conprueva el token cuando ya se cambio el password. 
post -> el usuario define su nuevo pass y se guarda en la bd 
*/
router.route('/olvide-password/:token').get(comprobarToken).post(nuevoPassword) 
// el middleware checkAuth proteje el endpoint /perfil. Comprueba que el jwt sea valido, que este enviado via heaters, que el usuario sea correcto, que no este expirado, y si todo esta ok puede acceder al middleware perfil
router.get("/perfil", checkAuth, perfil);

export default router;