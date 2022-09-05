const mongoose = require('mongoose');

const Message = require('../models/message.model');
const { User, Contact } = require('../models/user.model');

exports.summary = async (req, res, next) => {
  try {
    // BUG https://github.com/Automattic/mongoose/issues/1399
    const userObjectId = mongoose.Types.ObjectId(req.userId);

    const discussions = await Message.aggregate([
      {
        $match: { $or: [{ sender: userObjectId }, { receiver: userObjectId }] },
      },
      {
        // Treat messages sent by us as if they were sent by the other party, in order to group correctly
        $project: {
          sender: {
            $cond: [
              { $eq: ['$receiver', userObjectId] },
              '$sender',
              '$receiver',
            ],
          },
          text: 1,
          createdAt: 1,
        },
      },
      { $sort: { createdAt: -1 } },
      { $group: { _id: '$sender', lastMessage: { $first: '$text' } } },
      {
        $lookup: {
          from: User.collection.name,
          localField: '_id',
          foreignField: '_id',
          as: 'user',
        },
      },
      { $unwind: '$user' },
      {
        $lookup: {
          // add extra 'contact' field for frontend usage
          from: Contact.collection.name,
          let: { id: '$_id' },
          pipeline: [
            {
              $match: {
                $expr: {
                  $or: [
                    {
                      $and: [
                        {
                          $eq: ['$sender', userObjectId],
                        },
                        {
                          $eq: ['$receiver', '$$id'],
                        },
                      ],
                    },
                    {
                      $and: [
                        {
                          $eq: ['$sender', '$$id'],
                        },
                        {
                          $eq: ['$receiver', userObjectId],
                        },
                      ],
                    },
                  ],
                },
              },
            },
            { $project: { accepted: 1 } },
          ],
          as: 'contact',
        },
      },
      { $unwind: { path: '$contact', preserveNullAndEmptyArrays: true } },
      {
        $project: {
          name: '$user.name',
          img: '$user.img',
          lastMessage: 1,
          contact: 1,
        },
      },
    ]);

    res.status(200).json(discussions);
  } catch (err) {
    next(err);
  }
};

exports.sendMessage = async (req, res, next) => {
  try {
    if (req.params.userId === req.userId) {
      return res
        .status(400)
        .json({ error: 'Δεν μπορεί να γίνει συζήτηση με τον ίδιο το χρήστη' });
    }

    const isContact = await Contact.exists({
      $and: [
        { accepted: true },
        {
          $or: [
            { sender: req.userId, receiver: req.params.userId },
            { sender: req.params.userId, receiver: req.userId },
          ],
        },
      ],
    });

    if (!isContact) {
      return res
        .status(403)
        .json({ error: 'Δεν έχετε την άδεια συζήτησης με το χρήστη' });
    }

    const message = await Message.create({
      sender: req.userId,
      receiver: req.params.userId,
      text: req.body.text,
    });

    res.status(201).json(message);

    await User.updateOne(
      { _id: req.userId },
      { lastDiscussion: req.params.userId }
    );

    // For interaction
    req.partnerId = req.params.userId;
    next();
  } catch (err) {
    next(err);
  }
};

exports.get = async (req, res, next) => {
  try {
    // In general, GET all messages sent or received in this discussion
    let filter = {
      $or: [
        { sender: req.userId, receiver: req.params.userId },
        { sender: req.params.userId, receiver: req.userId },
      ],
    };

    // If a timestamp is specified, GET only the messages sent to us since then
    if (req.query.since) {
      filter = {
        sender: req.params.userId,
        receiver: req.userId,
        createdAt: { $gte: req.query.since },
      };
    }

    const messages = await Message.find(filter).sort({ createdAt: 'asc' });
    res.status(200).json(messages);
  } catch (err) {
    next(err);
  }
};
