class AppointmentFactory {

    Build(simpleAppointment){
        let startDate = new Date(date_start,0,0)

        let Appointment = {
            id: simpleAppointment._id,
            title: simpleAppointment.name + ' - ' + simpleAppointment.description,
            start: startDate,
            end: startDate,
            notified: simpleAppointment.notified,
            number: simpleAppointment.number
        }

        return Appointment
    }

}

export default new AppointmentFactory();