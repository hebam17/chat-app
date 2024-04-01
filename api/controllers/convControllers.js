const User = require("../models/User");
const Conversation = require("../models/Conversation");
const Message = require("../models/Message");
const { ObjectId } = require("mongodb");

const getConvs = async (req, res) => {
  const { userId } = req.user;

  try {
    const userConv = await User.findById(userId).populate("conv");

    let convsList = userConv.conv.map((item) => item._id);

    // for each user => get every conversation's (messages number - unread messages number - last message text - last message creation date)

    const convsInfo = await Message.aggregate([
      {
        $match: {
          conv: {
            $in: convsList,
          },
        },
      },
      {
        $sort: {
          createdAt: 1,
        },
      },
      {
        $group: {
          _id: "$conv",
          lastMessage: {
            $last: "$text",
          },
          lastDate: {
            $last: "$createdAt",
          },
          messagesNum: {
            $sum: 1,
          },
          unReadMessagesNum: {
            $sum: {
              $cond: {
                if: {
                  $in: [userConv._id, "$read"],
                },
                then: 0,
                else: 1,
              },
            },
          },
        },
      },
    ]);

    let convsAndInfo = userConv.conv.map((item) => {
      let convInfo = convsInfo.find(
        (info) => String(info._id) === String(item._id)
      );

      return Object.assign(item._doc, { info: convInfo });
    });

    return res
      .status(200)
      .json({ convs: convsAndInfo || [], friends: userConv.friends });
  } catch (err) {
    return res
      .status(500)
      .send({ error: "Sorry an error occurred, please try again later!" });
  }
};

// create a new conversation
const addConv = async (req, res) => {
  const { userId } = req.user;
  const { isPrivate, name, users } = req.body;

  if (!name || users.length === 0) {
    return res.status(403).send({ error: "Please provide the required data!" });
  }

  const user = await User.findById(userId);
  try {
    if (isPrivate && user.friends.includes(users[0])) {
      return res
        .status(403)
        .send({ error: "This user is already in your contacts" });
    }

    let newConv;

    if (isPrivate) {
      newConv = await Conversation.create({
        isPrivate: isPrivate,
        name,
        users: [...users, userId],
        admin: null,
      });

      let otherUser = users[0];
      await User.updateOne(
        { _id: userId },
        { $addToSet: { friends: otherUser, conv: newConv._id } }
      );
      await User.updateOne(
        { _id: otherUser },
        { $addToSet: { friends: userId, conv: newConv._id } }
      );
    }

    if (!isPrivate) {
      newConv = await Conversation.create({
        isPrivate: isPrivate,
        name,
        users: [...users, userId],
        admin: userId,
      });
      [...users, userId].forEach(async (user) => {
        await User.updateOne(
          { _id: user },
          { $addToSet: { conv: newConv._id } }
        );
      });
    }

    return res.status(201).json(newConv);
  } catch (err) {
    console.log(err);
    return res
      .status(500)
      .send({ error: "Sorry, an error occurred, please try again later!" });
  }
};

// deleting existing conversation
const deleteConv = async (req, res) => {
  const { userId } = req.user;
  const { convId } = req.params;

  try {
    if (convId) {
      const conv = await Conversation.findById(convId);

      if (conv.isPrivate) {
        await Conversation.findByIdAndDelete(convId);
        let otherUser = conv.users.filter((user) => user !== userId)[0];
        await User.updateOne(
          { _id: userId },
          { $pull: { friends: otherUser, conv: convId } }
        );
        await User.updateOne(
          { _id: otherUser },
          { $pull: { friends: userId, conv: convId } }
        );
      }

      if (!conv.isPrivate) {
        if (conv.admin.toString() !== userId) {
          await User.updateOne({ _id: userId }, { $pull: { conv: convId } });

          return res
            .status(200)
            .send("You are successfully removed from the group");
        }

        await Conversation.findByIdAndDelete(convId);

        [...conv.users, userId].forEach(async (user) => {
          await User.updateOne({ _id: user }, { $pull: { conv: convId } });
        });
      }

      const data = await Message.deleteMany({ conv: convId });

      return res.status(200).json("The conversation was successfully deleted!");
    }
    return res
      .status(403)
      .send({ error: "You must provide a conversation id" });
  } catch (err) {
    console.log(err);
    return res
      .status(500)
      .send({ error: "Sorry, an error occurred, please try again later!" });
  }
};

exports.getConvs = getConvs;
exports.addConv = addConv;
exports.deleteConv = deleteConv;
