import mongoose from "mongoose";
// bcrypt es una dependencia que se usa para hashear los passwords
import bcrypt from "bcrypt";

const usuarioSchema = mongoose.Schema(
    {
        nombre: {
            type: String,
            require: true,
            //El trim saca los espacio de inico y final
            trim: true
        },
        password: {
            type: String,
            require: true,
            trim: true
        },
        email: {
            type: String,
            require: true,
            trim: true,
            unique: true,
        },
        token: {
            type: String,
        },
        confirmado: {
            type: Boolean,
            default: false,
        }
    },
    {
        // timestamps crea en el modelo dos columnas. Una de Creado y otra de Actualizado.
        timestamps: true,
    }
);

usuarioSchema.pre('save', async function(next) {
    // Controlo que sea la primera vez para no hashear mas de una vez el mismo pass. Osea, si esta hasheado no lo vuelve a hashear
    if (!this.isModified('password')) {
        next();
    }
    // Hasheo el password
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
})

// Con .methods puedo creer metodos.
// bcrypt.compare compara el string que ingresa el usuario contra la password hasheada en la bd.
usuarioSchema.methods.comprobarPassword = async function (passwordFormulario) {
    return await bcrypt.compare(passwordFormulario, this.password);
}

const Usuario = mongoose.model("Usuario", usuarioSchema);
export default Usuario; 