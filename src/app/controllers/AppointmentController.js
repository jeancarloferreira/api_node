import * as Yup from 'yup';
import User from '../models/User';
import Appointment from '../models/Appointment';

class AppointmentController {
  async store(req, res) {
    const schema = Yup.object().shape({
      provider_id: Yup.number().required(),
      date: Yup.date().required(),
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ erro: 'Validação falhou' });
    }

    const { provider_id, date } = req.body;

    const providerExists = await User.findOne({
      where: { id: provider_id, provider: true },
    });

    if (!providerExists) {
      return res
        .status(401)
        .json({ erro: 'Você só pode criar compromissos com prestador' });
    }

    const appointment = await Appointment.create({
      provider_id,
      user_id: req.userId,
      date,
    });

    return res.json(appointment);
  }
}

export default new AppointmentController();
