import {
  startOfDay,
  endOfDay,
  setHours,
  setMinutes,
  setSeconds,
  format,
  isAfter,
} from 'date-fns';
import { Op } from 'sequelize';
import Appointment from '../models/Appointment';

class AvailableController {
  async index(req, res) {
    const { date } = req.query;

    if (!date) {
      return res.status(400).json({ erro: 'Data Inválida' });
    }

    const searchDate = Number(date);

    const appointments = await Appointment.finddAll({
      where: {
        provider_id: req.params.providerId,
        canceled_at: null,
        date: {
          [Op.between]: [startOfDay(searchDate), endOfDay(searchDate)],
        },
      },
    });

    const schedule = [
      '08:00', // 2020-01-03 08:00:00
      '09:00', // 2020-01-03 09:00:00
      '10:00', // 2020-01-03 10:00:00
      '11:00', // 2020-01-03 11:00:00
      '12:00', // 2020-01-03 12:00:00
      '13:00', // 2020-01-03 13:00:00
      '14:00', // 2020-01-03 14:00:00
      '15:00', // 2020-01-03 15:00:00
      '16:00', // 2020-01-03 16:00:00
      '17:00', // 2020-01-03 17:00:00
      '18:00', // 2020-01-03 18:00:00
      '19:00', // 2020-01-03 19:00:00
      '20:00', // 2020-01-03 20:00:00
      '21:00', // 2020-01-03 21:00:00
      '22:00', // 2020-01-03 21:00:00
      '23:00', // 2020-01-03 21:00:00
      '24:00',
    ];

    const avaiable = schedule.map(time => {
      const [hour, minute] = time.split(':');
      const value = setSeconds(
        setMinutes(setHours(searchDate, hour), minute),
        0
      );

      return {
        time,
        value: format(value, "yyyy-MM-dd'T'HH:mm:ssxxx"),
        available:
          isAfter(value, new Date()) &&
          // eslint-disable-next-line eqeqeq
          !appointments.find(a => format(a.date, 'HH:mm') == time),
      };
    });

    return res.json(avaiable);
  }
}

export default new AvailableController();
