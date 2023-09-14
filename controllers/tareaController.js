import Proyecto from "../models/Proyecto.js"
import Tarea from "../models/Tarea.js";

const agregarTarea = async (req, res) => {
    const { proyecto } = req.body;

    const existeProyecto = await Proyecto.findById(proyecto);

    // Comprluebo si el proyecto al que se quiere agregar la tarea existe
    if (!existeProyecto) {
        const error = new Error('El Proyecto no existe');
        return res.status(404).json({ msg: error.message });
    }
    // Valido que el usuario que este agregando tareas a un proyecto sea el creador del Proyecto.
    if (existeProyecto.creador.toString() !== req.usuario._id.toString()) {
        const error = new Error("No tienes los permisos para agregar tareas");
        return res.status(401).json({ msg: error.message });
    }

    try {
        const tareaAlmacenada = await Tarea.create(req.body);
        // Almacenat el ID en el proyecto
        existeProyecto.tareas.push(tareaAlmacenada._id);
        await existeProyecto.save();
        res.json(tareaAlmacenada);
    } catch (error) {
        console.log(error);
    }
};

const obtenerTarea = async (req, res) => {
    const { id } = req.params;

    // Con el populate se cruza la tabla de tareas con la de proyectos, entonces en el campo de poroyecto dentro del onjeto Tarea viene toda la informacion de ese proyecto.
    try {
        const tarea = await Tarea.findById(id).populate("proyecto");

        // Solo el crador del Proyecto puede agregar tareas.
        if (tarea.proyecto.creador.toString() !== req.usuario._id.toString()) {
            const error = new Error('Accion no Valida');
            return res.status(403).json({ msg: error.message });
        };

        res.json(tarea);

    } catch (error) {
        error = new Error('Tarea no encontrada');
        return res.status(403).json({ msg: error.message });
    }

};

const actualizarTarea = async (req, res) => { 
    const { id } = req.params;

    // Con el populate se cruza la tabla de tareas con la de proyectos, entonces en el campo de poroyecto dentro del onjeto Tarea viene toda la informacion de ese proyecto.
    try {
        const tarea = await Tarea.findById(id).populate("proyecto");

        // Solo el crador del Proyecto puede agregar tareas.
        if (tarea.proyecto.creador.toString() !== req.usuario._id.toString()) {
            const error = new Error('Accion no Valida');
            return res.status(403).json({ msg: error.message });
        };

        tarea.nombre = req.body.nombre || tarea.nombre;
        tarea.descripcion = req.body.descripcion || tarea.descripcion;
        tarea.fechaEntrega = req.body.fechaEntrega || tarea.fechaEntrega;
        tarea.prioridad = req.body.prioridad || tarea.prioridad;

        const tareaAlmacenada = await tarea.save();
        res.json(tareaAlmacenada);

    } catch (error) {
        error = new Error('Tarea no encontrada');
        return res.status(403).json({ msg: error.message });
    }
};

const eliminarTarea = async (req, res) => { 
    const { id } = req.params;

    // Con el populate se cruza la tabla de tareas con la de proyectos, entonces en el campo de poroyecto dentro del onjeto Tarea viene toda la informacion de ese proyecto.
    try {
        const tarea = await Tarea.findById(id).populate("proyecto");

        // Solo el crador del Proyecto puede agregar tareas.
        if (tarea.proyecto.creador.toString() !== req.usuario._id.toString()) {
            const error = new Error('Accion no Valida');
            return res.status(403).json({ msg: error.message });
        };

        const proyecto = await Proyecto.findById(tarea.proyecto)
        proyecto.tareas.pull(tarea._id)
        await Promise.allSettled([await proyecto.save(), await tarea.deleteOne()])

        res.json({ msg: 'La Tarea se elimino'});
        

    } catch (error) {
        error = new Error('Tarea no encontrada');
        return res.status(403).json({ msg: error.message });
    }
};

const cambiarEstado = async (req, res) => { 
    const { id } = req.params;

    const tarea = await Tarea.findById(id).populate('proyecto');

    if(!tarea) {
        const error = new Error('Tarea no encontrada');
        return res.status(404).json({ msg: error.message})
    }

    if (tarea.proyecto.creador.toString() !== req.usuario._id.toString() && !tarea.proyecto.colaboradores.some(colaborador => colaborador._id.toString() === req.usuario._id.toString())) {
        const error = new Error('Accion no Valida');
        return res.status(403).json({ msg: error.message });
    };

    tarea.estado = !tarea.estado;
    tarea.completado = req.usuario._id
    await tarea.save();

    const tareaAlmacenada = await Tarea.findById(id).populate('proyecto').populate('completado');

    res.json(tareaAlmacenada)

};

export {
    agregarTarea,
    obtenerTarea,
    actualizarTarea,
    eliminarTarea,
    cambiarEstado
}
