// middleware/conversationMiddleware.js
import { ConversationMember } from '../models/associations.js';

export const checkMember = async (req, res, next) => {
  try {
    const idconversation = Number(req.params.id);
    const iduser = req.user.iduser;

    const membership = await ConversationMember.findOne({
      where: { idconversation, iduser, leftAt: null },
    });

    if (!membership) {
      return res.status(403).json({ message: 'Not a member of this conversation' });
    }

    // on stocke la membership dans req pour réutilisation
    req.membership = membership;
    next();
  } catch (err) {
    console.error('checkMember error:', err);
    return res.status(500).json({ message: 'Server error' });
  }
};
