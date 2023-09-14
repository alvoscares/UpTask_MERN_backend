import Usuario from "../models/Usuario.js";
import generarId from "../helpers/generarId.js";
import generarJWT from "../helpers/generarJWT.js";
import { emailOlvidePassword, emailRegistro } from "../helpers/email.js";

const registrar = async (req, res) => {
    // Evitar registros duplicados
    const { email } = req.body;
    const existeUsuario = await Usuario.findOne({ email });

    if (existeUsuario) {
        const error = new Error('Usuario ya registrado');
        return res.status(404).json({ msg: error.message });
    }

    try {
        // new Usuario(req.body) crea un nuevo objeto Usuario pero no lo almacena en la base. Para que se guarda en la base se teine que usar el .save()
        const usuario = new Usuario(req.body)
        usuario.token = generarId();
        await usuario.save()

        // Enviar el emal de confirmacion
        emailRegistro({
            email: usuario.email,
            nombre: usuario.nombre,
            token: usuario.token
        });

        res.json({ msg: "Usuario Creado Correctamente, Revisa tu Email para confirmar tu cuenta"});

    } catch (error) {
        console.log(error)
    }
};

const autenticar = async (req, res) => {
    const { email, password } = req.body;

    // Comprobar si el usuario exist
    const usuario = await Usuario.findOne({ email });
    if (!usuario) {
        const error = new Error('El usuario no existe');
        return res.status(404).json({ msg: error.message });
    } 

    // Comprobar si el usuario esta confirmado
    if (!usuario.confirmado) {
        const error = new Error('Tu cuenta no ha sido confirmada');
        return res.status(403).json({ msg: error.message });
    }
    // Comprobar su password
    if (await usuario.comprobarPassword(password)) {
        res.json({
            _id: usuario._id,
            nombre: usuario.nombre,
            email: usuario.email,
            //Cada vez que el usuario se autentica se genera un token, el cual se usa para comprobar el perfil del usuario (Ej: Al mostrar los datos del perfil de usuaro, el usuario que este solicitando esta funcionalidad sea efectivamente ese mismo usuario. Esto se valida con el token creado al momento de iniciar sesion).
            token: generarJWT(usuario._id),
        })
    } else {
        const error = new Error('El Password es Incorrecto');
        return res.status(403).json({ msg: error.message });
    }
};

const confirmar = async (req, res) => {
    //req.params son las variables dinamicas que estan el las url
    const { token } = req.params
    const usuarioConfirmar = await Usuario.findOne({token})
    if (!usuarioConfirmar) {
        const error = new Error('Token no valido');
        return res.status(403).json({ msg: error.message });
    }

    try {
        usuarioConfirmar.confirmado = true;
        usuarioConfirmar.token = "";
        await usuarioConfirmar.save();
        res.json({ msg: 'Usuario Confirmado Correctamente' })
    } catch (error) {
        console.log(error)
    }
};

const olvidePassword = async (req, res) => {
    const { email } = req.body;    
    const usuario = await Usuario.findOne({ email });
    if (!usuario) {
        const error = new Error('El usuario no existe');
        return res.status(404).json({ msg: error.message });
    }
    try {
        usuario.token = generarId();
        await usuario.save();

        // Enviamos el Email para poder recuperar el password
        emailOlvidePassword({
            email: usuario.email,
            nombre: usuario.nombre,
            token: usuario.token
        })

        res.json({ msg: "Hemos enviado un email con las instrucciones"});
    } catch (error) {
        console.log(error)
    }
};

const comprobarToken = async (req, res) => {
    const { token } = req.params;
    const tokenValido = await Usuario.findOne({ token });
    if (tokenValido) {
        res.json({ msg: "Token valido y el Usuario existe"})
    } else {
        const error = new Error('Token no valido');
        return res.status(404).json({ msg: error.message });
    }
    
};

const nuevoPassword = async (req, res) => {
    const { token } = req.params;
    const { password } = req.body;

    const usuario = await Usuario.findOne({ token });
    if (!usuario) {        
        const error = new Error('Token no valido');
        return res.status(404).json({ msg: error.message });
    }
    try {
        usuario.password = password;
        usuario.token = "";
        await usuario.save();
        res.json({ msg: "Password Modificado Correctamente"});
    } catch (error) {
        console.log(error);
    }
};

const perfil = async (req, res) => {
    // Este Usuario (req.usuario) viene del middleware comprobarToken el cual se debe cumplir para poder hacer usu de la funcion perfil();
    const { usuario } = req;

    res.json(usuario);
};

export { registrar, autenticar, confirmar, olvidePassword, comprobarToken, nuevoPassword, perfil, };