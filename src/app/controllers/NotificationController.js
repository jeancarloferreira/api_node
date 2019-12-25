import Notification from '../schemas/Notification';
import User from '../models/User';

class NotificationController {
  async index(req, res) {
    const userIsProvider = await User.findOne({
      id: req.userId,
      provider: true,
    });

    if (!userIsProvider) {
      res
        .status(401)
        .status({ erro: 'Somente o prestador pode carregar notificações' });
    }

    const notifications = await Notification.findOne({
      user: req.userId,
    })
      .sort({ creatAt: 'desc' })
      .limit(20);

    res.json(notifications);
  }
}

export default new NotificationController();
