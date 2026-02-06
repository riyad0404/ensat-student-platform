import { ConversationMember } from "../models/associations.js";
export const checkOwner = async (req, res, next) => {
  try {
    const idconversation = Number(req.params.id);
    const iduser = req.user.iduser;

    const owner = await ConversationMember.findOne({
      where: { idconversation, iduser, leftAt: null, role: 'OWNER' },
    });

    if (!owner) {
      return res.status(403).json({ message: 'Only owner can perform this action' });
    }

    req.owner = owner;
    next();
  } catch (err) {
    console.error('checkOwner error:', err);
    return res.status(500).json({ message: 'Server error' });
  }
};
