import * as Yup from 'yup';
import { startOfHour, parseISO, isBefore, format, subHours } from 'date-fns';
import pt from 'date-fns/locale/pt';
import User from '../models/User';
import Appointment from '../models/Appointment';
import File from '../models/File';
import Notification from '../schemas/Notification';

class AppointmentController {
  async index(req, res) {
    const { page = 1 } = req.query;

    const appointments = await Appointment.findAll({
      where: { user_id: req.userId, canceled_at: null },
      order: ['date'],
      attributes: ['id', 'date'],
      limit: 20,
      offset: (page - 1) * 20,
      include: [
        {
          model: User,
          as: 'provider',
          attributes: ['id', 'name'],
          include: [
            {
              model: File,
              as: 'avatar',
              attributes: ['id', 'path', 'url'],
            },
          ],
        },
      ],
    });
    res.json(appointments);
  }

  async store(req, res) {
    const schema = Yup.object().shape({
      provider_id: Yup.number().required(),
      date: Yup.date().required(),
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ erro: 'Validação falhou' });
    }

    const { provider_id, date } = req.body;

    // eslint-disable-next-line eqeqeq
    if (provider_id == req.userId) {
      return res
        .status(401)
        .json({ erro: 'O prestador de serviço não agendar com ele mesmo' });
    }

    const providerExists = await User.findOne({
      where: { id: provider_id, provider: true },
    });

    if (!providerExists) {
      return res
        .status(401)
        .json({ erro: 'Você só pode criar compromissos com prestador' });
    }

    const hourStart = startOfHour(parseISO(date));

    if (isBefore(hourStart, new Date())) {
      return res
        .status(400)
        .json({ erro: 'Datas passadas não são permitidas' });
    }

    const checkAvailability = await Appointment.findOne({
      where: {
        provider_id,
        canceled_at: null,
        date: hourStart,
      },
    });

    if (checkAvailability) {
      return res.status(400).json({ erro: 'Está data não está disponível' });
    }

    const appointment = await Appointment.create({
      provider_id,
      user_id: req.userId,
      date,
    });

    /**
     * Notificar o agendamento para o prestador de serviço
     */
    const user = await User.findByPk(req.userId);
    const formattedDate = format(
      hourStart,
      "'dia' dd 'de' MMMM', às' H:mm'h'",
      { locale: pt }
    );

    await Notification.create({
      content: `Novo agendamento de ${user.name} para o ${formattedDate}`,
      user: provider_id,
    });

    return res.json(appointment);
  }

  async delete(req, res) {
    const appointment = await Appointment.findByPk(req.params.id);

    // eslint-disable-next-line eqeqeq
    if (appointment.user_id != req.userId) {
      return res
        .status(401)
        .json({ erro: 'Você não tem permissão de cancelar o agendamento ' });
    }

    const dateWithSub = subHours(appointment.date, 2);

    if (isBefore(dateWithSub, new Date())) {
      return res.status(401).json({
        erro:
          'Você pode apenas cancelar um agendamente com 2 horas de antecidencia',
      });
    }

    appointment.canceled_at = new Date();

    await appointment.save();

    return res.json(appointment);
  }
}

export default new AppointmentController();
