import express from "express";
import {
    obtenerProyecto,
    obtenerProyectos,
    nuevoProyecto,
    editarProyecto,
    eliminarProyecto,
    buscarColaborador,
    agregarColaborador,
    eliminarColaborador,
} from "../controllers/proyectoController.js";
import checkAuth from "../middleware/checkAuth.js";

const router = express.Router();

router
    .route('/')
    .post(checkAuth, nuevoProyecto)
    .get(checkAuth, obtenerProyectos);

router
    .route('/:id')
    .get(checkAuth, obtenerProyecto)
    .put(checkAuth, editarProyecto)
    .delete(checkAuth, eliminarProyecto);

router.post('/colaboradores', checkAuth, buscarColaborador)
router.post('/colaboradores/:id', checkAuth, agregarColaborador);
// Cuando es un delete no se puede enviar un body, por eso uso post
router.post('/eliminar-colaborador/:id', checkAuth, eliminarColaborador);


export default router;
