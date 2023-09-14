// Genero un token para los datos que quiero retornar y que no se visualicen en la url. Los datos viajan encriptados.
// no poner contrasenas en jwt
import jwt from 'jsonwebtoken'

const generarJWT = (id) => {
    // el .sign permite crear el payload del token
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: "30d",
    });
};
export default generarJWT;