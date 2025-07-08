import jwt from 'jsonwebtoken'
const secret_JWT = process.env.JWT_SECRET

class AuthenticateMiddleware {

    async authVerify(req, res, next) {
        try {
            const authToken = req.headers['authorization']

            if (!authToken) return res.status(401).redirect('/login')

            const bearer = authToken.split(' ');
            const token = bearer[1]

            const jwtValido = await jwt.verify(token, secret_JWT)

            if (!jwtValido) return res.status(401).json({ success: false, message: 'Token expirado ou invalido' });

            req.user = jwtValido
            next();
        }
        catch (err) {
            return res.status(401).json({ success: false, message: 'Token expirado ou invalido' });
        }
    }
}

export default new AuthenticateMiddleware();