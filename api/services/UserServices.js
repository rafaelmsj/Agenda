import knex from '../database/db.js'
import bcrypt from 'bcrypt'

const salt = parseInt(process.env.SALT)

class UserServices {

    async FindNumber(number) {
        try {
            const userWaiting = await knex.select(['id', 'password']).where({ number: number }).table('users_waiting_confirm');

            if (userWaiting.length > 0) return { success: false, message: 'Você já se cadastrou com este número. Basta confirmar para finalizar.', user: userWaiting[0] }

            const user = await knex.select(['id', 'password']).where({ number: number }).table('users');

            if (user.length > 0) return { success: false, message: 'Este número já está cadastrado.', user: user[0] }

            return { success: true, message: 'Número não cadastrado.' }
        }
        catch (err) {
            console.log(err)
            return { success: false, message: `Erro interno no servidor: ${err.message}` }
        }
    }

    async FindUserId(user_id) {
        try {
            const user = await await knex.select(['id', 'number', 'name', 'created']).where({ id: user_id }).table('users');

            if (!user.length) return { success: false, message: 'Usuário não encontrado.' }

            return { success: true, message: 'Usúario encontrado', user: user }
        }
        catch (err) {
            console.log(err)
            return { success: false, message: `Erro interno no servidor: ${err.message}` }
        }
    }

    async ValidPassword(password) {
        try {
            const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/;
            return regex.test(password);
        }
        catch (err) {
            console.log(err)
            return { success: false, message: `Erro interno no servidor: ${err.message}` }
        }
    }

    async CreateUser(name, number, password, token) {
        try {
            const hash = await bcrypt.hash(password, salt);
            const now = new Date();
            const expire = new Date(now.getTime() + 30 * 60 * 1000);

            await knex.insert({ name, number, password: hash, token: token, token_expire: expire }).table('users_waiting_confirm')

            return { success: true }
        }
        catch (err) {
            console.log(err)
            return { success: false, message: `Erro interno no servidor: ${err.message}` }
        }
    }

    async GenerateCode() {
        try {
            const token = await Math.floor(100000 + Math.random() * 900000).toString();

            return { success: true, message: 'Token gerado!', token: token }
        }
        catch (err) {
            return { success: false, message: `Erro interno no servidor: ${err.message}` }
        }

    }

    async VerifyToken(number, token) {
        try {
            const userWaiting = await knex.select(['id', 'token', 'token_expire']).where({ number: number }).table('users_waiting_confirm');
            const now = new Date();
            const tokenExpire = new Date(userWaiting[0].token_expire);

            if (userWaiting[0].token != token || now > tokenExpire) return { success: false, message: 'Token inválido ou expirado.' }

            return { success: true, message: 'Token válidado!' }
        }
        catch (err) {
            console(err)
            return { success: false, message: `Erro interno no servidor: ${err.message}` }
        }
    }

    async VerifyTimeResendToken(number) {
        try {
            const userWaiting = await knex.select(['id', 'token', 'token_expire']).where({ number: number }).table('users_waiting_confirm');

            if (!userWaiting.length) return { success: false, message: 'Número não encontrado.' };

            const now = new Date();
            const tokenExpire = new Date(userWaiting[0].token_expire);
            const tokenAfter5 = new Date(tokenExpire.getTime() - 25 * 60 * 1000);

            if (tokenAfter5 > now) {
                const diffMs = tokenAfter5 - now;
                const diffMin = Math.ceil(diffMs / (60 * 1000));
                return { success: false, message: `Aguarde mais ${diffMin} minuto(s) para solicitar um novo código.` };
            }

            return { success: true, message: 'Você já pode solicitar um novo código!' };
        } catch (err) {
            console.error(err);
            return { success: false, message: `Erro interno no servidor: ${err.message}` };
        }
    }

    async UpdateTokenVerify(number, token) {
        try {
            const now = new Date();
            const expire = new Date(now.getTime() + 30 * 60 * 1000);

            await knex.update({ token: token, token_expire: expire }).where({ number: number }).table('users_waiting_confirm')

            return { success: true, message: 'Token atualizado!' }
        }
        catch (err) {
            console.log(err)
            return { success: false, message: `Erro interno no servidor: ${err.message}` }
        }
    }

    async UserConfirmFinish(number) {
        try {
            const userWaiting = await knex.select(['id', 'name', 'password', 'number']).where({ number: number }).table('users_waiting_confirm');

            await knex.insert({ name: userWaiting[0].name, number: userWaiting[0].number, password: userWaiting[0].password, created: new Date(), modified: new Date() }).table('users')

            await knex.delete().where({ number: number }).table('users_waiting_confirm')

            return { success: true, message: 'Usuário confirmado!' }
        }
        catch (err) {
            console.log(err)
            return { success: false, message: `Erro interno no servidor: ${err.message}` }
        }
    }

    async UpdatePassword(password, number) {
        try {
            const hash = await bcrypt.hash(password, salt)

            await knex.update({ password: hash, modified: new Date() }).where({ number: number }).table('users')

            return { success: true, message: 'Senha alterada com sucesso!' }

        }
        catch (err) {
            console.log(err)
            return { success: false, message: `Erro interno no servidor: ${err.message}` }
        }
    }

}

export default new UserServices();