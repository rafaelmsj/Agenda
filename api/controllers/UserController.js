import jwt from 'jsonwebtoken'
import UserServices from '../services/UserServices.js'
import bcrypt from 'bcrypt'

const secret_JWT = process.env.JWT_SECRET

class Users {

    async Create(req, res) {
        try {
            const { name, number, password, confirmPassword } = req.body;

            if (!name || !number || !password) return res.status(400).json({ success: false, message: 'Todos os campos devem ser preenchidos.' });

            if (name.trim().length < 3) return res.status(400).json({ success: false, message: 'Digite um nome válido.' });

            if (number.trim().length < 10 || number.length > 11 || !/^\d{10,11}$/.test(number.trim())) return res.status(400).json({ success: false, message: 'Digite um número válido.' });

            const findNumber = await UserServices.FindNumber(number);
            if (!findNumber.success) return res.status(400).json({ success: false, message: findNumber.message });

            const validPassword = await UserServices.ValidPassword(password);
            if (!validPassword) return res.status(400).json({ success: false, message: 'A senha deve ter no mínimo 8 caracteres e conter pelo menos: 1 letra maiúscula, 1 letra minúscula, 1 número e 1 caractere especial (como !@#$%&*).' })
            if (password !== confirmPassword) return res.status(400).json({ success: false, message: 'As senhas digitadas não coincidem. Verifique e tente novamente.' });

            const token = await UserServices.GenerateCode()
            if (!token.success) return res.status(400).json({ success: false, message: token.message });

            const result = await UserServices.CreateUser(name, number, password, token.token);
            if (!result.success) return res.status(400).json({ success: false, message: result.message });

            console.log(`Enviado token: ${token.token}. para o numero ${number}`)

            res.status(201).json({ success: true, message: 'Usuário cadastrado com sucesso!' })
        }
        catch (err) {
            console.log(err)
            res.status(500).json({ success: false, message: 'Erro interno no servidor.', error: err })
        }
    };

    async ConfirmUser(req, res) {
        try {
            const { number, token } = req.body

            const findNumber = await UserServices.FindNumber(number)
            if (findNumber.success || findNumber.message !== 'Você já se cadastrou com este número. Basta confirmar para finalizar.') return res.status(404).json({ sucess: false, message: 'Este número já foi confirmado ou ainda não possui um cadastro em andamento.' })

            const tokenValidate = await UserServices.VerifyToken(number, token)
            if (!tokenValidate.success) return res.status(401).json({ success: false, message: tokenValidate.message })

            const insert = await UserServices.UserConfirmFinish(number)
            if (!insert.success) return res.status(400).json({ success: false, message: insert.message })

            res.status(201).json({ success: true, message: 'Seu cadastro foi verificado com sucesso. Você já pode acessar sua conta.' })
        }
        catch (err) {
            console.log(err)
            res.status(500).json({ success: false, message: 'Erro interno no servidor.', error: err })
        }
    }

    async ResendConfirmUser(req, res) {
        try {
            const { number } = req.body;

            if (!number) return res.status(400).json({ success: false, message: 'Envie o número.' });
            if (number.trim().length < 10 || number.length > 11 || !/^\d{10,11}$/.test(number.trim())) return res.status(400).json({ success: false, message: 'Digite um número válido.' });

            const findNumber = await UserServices.FindNumber(number)
            if (findNumber.success || findNumber.message !== 'Você já se cadastrou com este número. Basta confirmar para finalizar.') return res.status(404).json({ sucess: false, message: 'Este número já foi confirmado ou ainda não possui um cadastro em andamento.' })

            const verifyTimeResendToken = await UserServices.VerifyTimeResendToken(number)
            if (!verifyTimeResendToken.success) return res.status(400).json({ success: false, message: verifyTimeResendToken.message });

            const token = await UserServices.GenerateCode()
            if (!token.success) return res.status(400).json({ success: false, message: token.message });

            const updateTokenVerify = await UserServices.UpdateTokenVerify(number, token.token)
            if (!updateTokenVerify.success) return res.status(400).json({ success: false, message: updateTokenVerify.message });

            console.log(`Reenviado token: ${token.token}. para o numero ${number}`)

            res.status(201).json({ success: true, message: 'Reenviamos um código de confirmação!' })
        }
        catch (err) {
            console.log(err)
            res.status(500).json({ success: false, message: 'Erro interno no servidor.', error: err })
        }
    }

    async Login(req, res) {
        try {
            const { number, password } = req.body

            if (!number || !password) return res.status(400).json({ success: false, message: 'Preencha todos os campos.' })

            if (number.length < 10 || number.length > 11) return res.status(400).json({ success: false, message: 'Número inválido.' })

            const findNumber = await UserServices.FindNumber(number)
            if (findNumber.success) return res.status(400).json({ success: false, message: 'Número não encontrado ou dados inválidos' })
            if (!findNumber.success && findNumber.message === 'Você já se cadastrou com este número. Basta confirmar para finalizar.') {

                const passwordCompar = await bcrypt.compare(password, findNumber.user.password)
                if (!passwordCompar) return res.status(400).json({ success: false, message: 'Senha incorreta' })

                return res.status(401).json({ success: false, message: 'Voce precisa fazer a confirmação de cadastro.' })
            }

            const passwordCompar = await bcrypt.compare(password, findNumber.user.password)
            if (!passwordCompar) return res.status(400).json({ success: false, message: 'Senha incorreta.' })

            const tokenJWT = await jwt.sign({ user_id: findNumber.user.id, number: number }, secret_JWT, { expiresIn: '3h' })

            res.status(200).json({ success: true, message: 'Autenticação realizada com sucesso.', token: tokenJWT })
        }
        catch (err) {
            console.log(err.message)
            res.status(500).json({ success: false, message: 'Erro interno no servidor.', error: err.message })
        }
    }
};

export default new Users();