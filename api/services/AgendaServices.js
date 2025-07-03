import knex from '../database/db.js'
import AppointmentFactory from '../factories/AppointmentFactory.js'

class AgendaServices {

    async GetAll(id_user, showFinished) {
        try {
            const result = await knex.select(['*']).where({ id_user: id_user }).table('appointments');

            if (showFinished) return {appointments: result}

            const appos = await knex.select(['*']).where({ id_user: id_user }).andWhere('finished', 0).table('appointments');


            const appointments = result.map(appo => AppointmentFactory.Build(appo));

            return {appointments} 
        }
        catch (err) {
            console.log(err)
            return { success: false, message: `Erro interno no servidor: ${err.message}` }
        }
    }

    async FindAll(id_user) {
        try {
            const result = await knex.select(['*']).where({ id_user: id_user }).table('appointments');

            return { success: true, message: 'Eventos listados', appointments: result }
        }
        catch (err) {
            console.log(err)
            return { success: false, message: `Erro interno no servidor: ${err.message}` }
        }
    }

    async FindId(id) {
        try {
            const result = await knex.select(['*']).where({ id: id }).table('appointments');

            if (!result.length) return { success: false, message: 'Nenhum evento encontrado', appointment: result }

            return { success: true, message: 'Evento listado', appointment: result }
        }
        catch (err) {
            console.log(err)
            return { success: false, message: `Erro interno no servidor: ${err.message}` }
        }
    }

    async ValidateDateStart(date_start, time_start) {
        try {
            const startDateTime = new Date(`${date_start}T${time_start}:00`);

            const now = new Date();

            if (startDateTime < now) return { success: false, message: 'Não é possível cadastrar um evento de data passada.' }

            return { success: true, message: 'Data válida.', date_full: startDateTime }
        }
        catch (err) {
            console.log(err)
            return { success: false, message: `Erro interno no servidor: ${err.message}` }
        }
    }

    async CreateAppointment(title, description, data_full, time_before_notification, id_user) {
        try {
            await knex.insert({ title, description, date_start: data_full, date_end: '0000-00-00 00:00:00', finish: 0, notified: 0, time_before_notification, id_user, created: new Date(), modified: new Date() }).table('appointments')

            return { success: true, message: 'Evento registrado com sucesso!' }
        }
        catch (err) {
            console.log(err)
            return { success: false, message: `Erro interno no servidor: ${err.message}` }
        }
    }

    async UpdateAppointment(id, date_full, time_before_notification) {
        try {
            await knex.update({ date_start: date_full, time_before_notification, modified: new Date() }).where({ id: id }).table('appointments')

            return { success: true, message: 'Data alterada com sucesso!' }
        }
        catch (err) {
            console.log(err)
            return { success: false, message: `Erro interno no servidor: ${err.message}` }
        }
    }

    async DeleteAppointment(id) {
        try {
            await knex.delete().where({ id: id }).table('appointments')

            return { success: true, message: 'Evento deletado com sucesso!' }
        }
        catch (err) {
            console.log(err)
            return { success: false, message: `Erro interno no servidor: ${err.message}` }
        }
    }


}
export default new AgendaServices()