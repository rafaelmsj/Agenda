import UserServices from './UserServices.js'
import knex from '../database/db.js'
import jwt from 'jsonwebtoken'

const secret_JWT = process.env.JWT_SECRET

class RecoveryPasswordServices {

    async CreateRecoveryPassword(number) {
        try {
            const token = await UserServices.GenerateCode();
            const now = new Date();
            const expire = new Date(now.getTime() + 30 * 60 * 1000);

            await knex.insert({ number, token: token, token_expire: expire, used: false, number_attempts: 0 }).table('password_recovery')

            return { success: true, message: 'Enviamos o código de redefinição de senha para você.', token: token }
        }
        catch (err) {
            console.log(err)
            return {success: false, message: `Erro interno no servidor: ${err.message}`}
        }
    }

    async VerifyRecoveryExist(number) {
        try {
            const result = await knex.select(['token', 'created']).where({ number: number }).table('password_recovery')

            if (result.length) return { success: true, message: 'Existe registro de recovery.' }

            return { success: false, message: 'Ainda não foi solicitado' }
        }
        catch (err) {
            console.log(err)
            return {success: false, message: `Erro interno no servidor: ${err.message}`}
        }
    }

    async VerifyRecoveryTime(number) {
        try {
            const result = await knex.select(['token', 'created']).where({ number: number }).table('password_recovery')

            const created = new Date(result[0].created);
            const agora = new Date();
            const time = (agora - created) > 5 * 60 * 1000;

            return { success: time, message: '' }
        }
        catch (err) {
            console.log(err)
            return {success: false, message: `Erro interno no servidor: ${err.message}`}
        }
    }

    async RecoveryExistDelete(number) {
        try {
            await knex.delete().where({ number: number }).table('password_recovery')

            return { success: true, message: '' }
        }
        catch (err) {
            console.log(err)
            return {success: false, message: `Erro interno no servidor: ${err.message}`}
        }
    }

    async RecoveryValidate(token) {
        try {
            const result = await knex.select(['token', 'token_expire']).where({ token: token }).table('password_recovery')

            if (!result.length) return { success: false, message: 'Token inválido.' }

            const now = new Date();
            const tokenExpire = new Date(result[0].token_expire);
            console.log(tokenExpire)
            if (result[0].token != token || now > tokenExpire) return { success: false, message: 'Token inválido ou expirado.' }

            return { success: true, message: 'Token válidado!' }
        }
        catch (err) {
            console.log(err);
            return {success: false, message: `Erro interno no servidor: ${err.message}`}
        }
    }

    async InviteRecovery(token, number) {
       
    }
}

export default new RecoveryPasswordServices();