const SupportTicket = require('../models/SupportTicket');

// POST /api/support — user submits a ticket
exports.createTicket = async (req, res) => {
  try {
    const { subject, category, message, booking } = req.body;
    if (!subject || !message) {
      return res.status(400).json({ success: false, message: 'Subject and message are required' });
    }

    const ticket = await SupportTicket.create({
      user: req.user._id,
      userModel: 'User',
      userRole: req.user.role,
      subject,
      category: category || 'Other',
      message,
      booking: booking || null
    });

    res.status(201).json({ success: true, data: ticket });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// GET /api/support/my — user views their own tickets
exports.getMyTickets = async (req, res) => {
  try {
    const tickets = await SupportTicket.find({ user: req.user._id })
      .populate('booking')
      .sort({ createdAt: -1 });
    res.json({ success: true, data: tickets });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// GET /api/admin/support — admin views all tickets
exports.getAllTickets = async (req, res) => {
  try {
    const { status, category } = req.query;
    const filter = {};
    if (status) filter.status = status;
    if (category) filter.category = category;

    const tickets = await SupportTicket.find(filter)
      .populate('user', 'firstName lastName email role city')
      .populate({
        path: 'booking',
        populate: [
          { path: 'devotee', select: 'firstName lastName email phone' },
          { path: 'pandit', select: 'firstName lastName email phone' }
        ]
      })
      .sort({ createdAt: -1 });
    res.json({ success: true, data: tickets });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// PATCH /api/admin/support/:id — admin updates status and/or replies
exports.updateTicket = async (req, res) => {
  try {
    const { status, adminReply } = req.body;
    const update = {};
    if (status) update.status = status;
    if (adminReply !== undefined) {
      update.adminReply = adminReply;
      update.repliedAt = new Date();
    }

    const ticket = await SupportTicket.findByIdAndUpdate(
      req.params.id,
      update,
      { new: true }
    ).populate('user', 'firstName lastName email role city')
     .populate({
        path: 'booking',
        populate: [
          { path: 'devotee', select: 'firstName lastName email phone' },
          { path: 'pandit', select: 'firstName lastName email phone' }
        ]
      });

    if (!ticket) return res.status(404).json({ success: false, message: 'Ticket not found' });

    // Emit real-time notification to the ticket owner
    if (adminReply && global.io && global.activeUsers) {
      const userId = ticket.user?._id?.toString();
      const socketId = global.activeUsers.get(userId);
      if (socketId) {
        global.io.to(socketId).emit('supportTicketReplied', {
          ticketId: ticket._id,
          subject: ticket.subject,
          adminReply: ticket.adminReply,
          status: ticket.status,
          repliedAt: ticket.repliedAt
        });
      }
    }

    res.json({ success: true, data: ticket });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// DELETE /api/admin/support/:id — admin deletes a ticket
exports.deleteTicket = async (req, res) => {
  try {
    const ticket = await SupportTicket.findByIdAndDelete(req.params.id);
    if (!ticket) return res.status(404).json({ success: false, message: 'Ticket not found' });
    res.json({ success: true, message: 'Ticket deleted' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};
