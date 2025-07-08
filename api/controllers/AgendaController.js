import AgendaServices from "../services/AgendaServices.js"
import UserServices from '../services/UserServices.js'

class AgendaController {

    async Validate(req, res){
        res.json({success: true})
    }


    async FindAll(req, res) {
        try {
            const id_user = req.user.user_id

            const appointments = await AgendaServices.FindAll(id_user)

            res.status(200).json({ success: true, message: 'Listando eventos', appointments: appointments.appointments })
        }
        catch (err) {
            console.log(err)
            res.status(500).json({ success: false, message: 'Erro interno no servidor', error: err.message })
        }
    }

    async Create(req, res) {
        try {
            const { title, description, date_start, time_start, time_before_notification } = req.body
            console.log(req.body, req.user)
            const id_user = req.user.user_id

            if (!title || !description || !date_start || !time_start || !time_before_notification) return res.status(400).json({ success: false, message: 'Dados incompletos.' })

            if (title.length < 5) return res.status(400).json({ success: false, message: 'Preencha um título válido' })
            if (title.length > 30) return res.status(400).json({ success: false, message: 'O título pode ter no até 30 caracteres.' })

            const validateDateStart = await AgendaServices.ValidateDateStart(date_start, time_start)
            if (!validateDateStart.success) return res.status(400).json({ success: false, message: validateDateStart.message });

            if (time_before_notification != '15m' && time_before_notification != '30m' && time_before_notification != '1h') return res.status(400).json({ success: false, message: 'Tempo de noticação inválida.' })

            const findUser = await UserServices.FindUserId(id_user)
            if (!findUser.success) return res.status(404).json({ success: false, message: findUser.message })

            const createAppointment = await AgendaServices.CreateAppointment(title, description, validateDateStart.date_full, time_before_notification, id_user)
            if (!createAppointment.success) return res.status(400).json({ success: false, message: createAppointment.message });

            res.status(201).json({ success: true, message: 'Evento inserido na agenda!' })
        }
        catch (err) {
            console.log(err)
            res.status(500).json({ success: false, message: 'Erro interno no servidor', error: err.message })
        }
    }

    async Update(req, res) {
        try {
            const id = req.params.id
            const id_user = req.user.user_id
            const { date_start, time_start, time_before_notification } = req.body

            if (!date_start || !time_start || !time_before_notification) return res.status(400).json({ success: false, message: 'Dados incompletos.' })

            const validateDateStart = await AgendaServices.ValidateDateStart(date_start, time_start)
            if (!validateDateStart.success) return res.status(400).json({ success: false, message: validateDateStart.message });

            if (time_before_notification != '15m' && time_before_notification != '30m' && time_before_notification != '1h') return res.status(400).json({ success: false, message: 'Tempo de noticação inválida.' })

            const findAppointment = await AgendaServices.FindId(id)
            if (!findAppointment.success) return res.status(400).json({ success: false, message: 'Erro ao carregar o evento.' })

            if (id_user != findAppointment.appointment[0].id_user) return res.status(401).json({ success: false, message: 'Você não tem permissão para editar esse evento.' })

            const updateAppointment = await AgendaServices.UpdateAppointment(id, validateDateStart.date_full, time_before_notification)
            if (!updateAppointment.success) return res.status(400).json({ success: false, message: 'Erro ao atualizar a data do evento.' });

            res.status(200).json({ success: true, message: 'Evento alterado com sucesso!' })
        }
        catch (err) {
            console.log(err)
            res.status(500).json({ success: false, message: 'Erro interno no servidor', error: err.message })
        }
    }

    async Delete(req, res) {
        try {
            const { id } = req.body
            const id_user = req.user.user_id

            if (!id) return res.status(404).json({ success: false, message: 'Dados incompletos.' })

            const findAppointment = await AgendaServices.FindId(id)
            if (!findAppointment.success || !findAppointment) return res.status(404).json({ success: false, message: 'Não encontramos o evento solicitado.' })
            if (findAppointment.appointment[0].finish == 1) return res.status(401).json({ success: false, message: 'Não é possivel excluir um evento já finalizado.' })

            if (id_user != findAppointment.appointment[0].id_user) return res.status(401).json({ success: false, message: 'Você não tem permissão para excluir esse evento.' })

            const deleteAppointment = await AgendaServices.DeleteAppointment(id)
            if(!deleteAppointment.success) return res.status(400).json({ success: false, message: 'Não foi possível excluir o evento.'})

            res.status(200).json({ success: true, message: 'Evento excluido!'})
        }
        catch (err) {
            console.log(err)
            res.status(500).json({ success: false, message: 'Erro interno no servidor', error: err.message })
        }
    }

}

export default new AgendaController()