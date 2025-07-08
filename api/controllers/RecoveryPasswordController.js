import UserServices from '../services/UserServices.js'
import RecoveryPasswordServices from '../services/RecoveryPasswordServices.js'

class RecoveryPasswordController {

    async CreateRecoveryPassword(req, res) {
        try {
            const { number } = req.body

            if (number.length < 10 || number.length > 11) return res.status(400).json({ success: false, message: 'Digite um número válido.' })

            const findNumber = await UserServices.findNumber(number)

            if (findNumber.success || findNumber.message == 'Você já se cadastrou com este número. Basta confirmar para finalizar.') return res.status(404).json({ sucess: false, message: 'Parece que este número ainda não está cadastrado ou a conta ainda não foi confirmada' })

            const verifyExist = await RecoveryPasswordServices.VerifyRecoveryExist(number)

            if (verifyExist.success) {

                const time = await RecoveryPasswordServices.VerifyRecoveryTime(number);
                if (!time.success) return res.status(400).json({ success: false, message: 'Você poderá solicitar um novo código de recuperação após 5 minutos.' })

                const remove = await RecoveryPasswordServices.RecoveryExistDelete(number);
                if (!remove.success) return res.status(400).json({ success: false, message: 'Erro ao gerar novo recovery.' })
            }

            const recovery = await RecoveryPasswordServices.CreateRecoveryPassword(number)

            if (!recovery.success) return res.status(400).json({ success: false, message: recovery.error })

            res.status(200).json({ success: true, message: 'Enviamos o código de redefinição de senha para você.' })
        }
        catch (err) {
            console.log(err)
            res.status(500).json({ success: false, message: 'Erro interno no servidor', error: err.message })
        }
    }

    async RecoveryPassword(req, res) {
        try {
            const { token, number, newPassword, newPasswordConfirm } = req.body

            if (token.length < 6 || token.length > 6) return res.status(400).json({ success: false, message: 'Digite um token válido' });

            const validate = await RecoveryPasswordServices.RecoveryValidate(token)

            if (!validate.success) return res.status(400).json({ success: false, message: validate.message })

            const validPassword = await UserServices.validPassword(newPassword);

            if (!validPassword) return res.status(400).json({ success: false, message: 'A senha deve ter no mínimo 8 caracteres e conter pelo menos: 1 letra maiúscula, 1 letra minúscula, 1 número e 1 caractere especial (como !@#$%&*).' })

            if (newPassword !== newPasswordConfirm) return res.status(400).json({ success: false, message: 'As senhas digitadas não coincidem. Verifique e tente novamente.' });

            const updatePassword = await UserServices.UpdatePassword(newPassword, number)

            if (!updatePassword.success) return res.status(400).json({ success: false, message: updatePassword.message });

            const findNumber = await UserServices.findNumber(number)

            if (findNumber.success || findNumber.message == 'Você já se cadastrou com este número. Basta confirmar para finalizar.') return res.status(404).json({ sucess: false, message: 'Parece que este número ainda não está cadastrado ou a conta ainda não foi confirmada' })

            const remove = await RecoveryPasswordServices.RecoveryExistDelete(number);
            if (!remove.success) return res.status(400).json({ success: false, message: 'Erro ao gerar novo recovery.' })

            res.status(200).json({ success: true, message: 'Senha alterada com sucesso!' })
        }
        catch (err) {
            console.log(err)
            res.status(500).json({ success: false, message: 'Erro interno no servidor', error: err.message })
        }
    }
}

export default new RecoveryPasswordController();