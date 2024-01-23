const User = require("../models/User");
const Conversation = require("../models/Conversation");

const getConv = async (req, res) => {
  const { userId } = req.user;

  try {
    const userConv = await User.findById(userId).populate("conv");
    // console.log("userConv:", userConv.conv);
    return res
      .status(200)
      .json({ convs: userConv.conv, friends: userConv.friends });
  } catch (err) {
    return res
      .status(500)
      .send({ error: "Sorry an error occurred, please try again later!" });
  }
};

const addConv = async (req, res) => {
  const { userId } = req.user;
  const { isPrivate, name, users } = req.body;
  try {
    const newConv = await Conversation.create({
      isPrivate: isPrivate,
      name,
      users,
      creator: userId,
    });

    // update all users in the users list
    // const userConv = await User.updateMany(
    //   { _id: { $in: users } },
    //   { $addToSet: { conv: newConv._id } }
    // );

    if (isPrivate) {
      let otherUser = users.filter((user) => user !== userId)[0];
      await User.updateOne(
        { _id: userId },
        { $addToSet: { friends: otherUser, conv: newConv._id } }
      );
      await User.updateOne(
        { _id: otherUser },
        { $addToSet: { friends: userId, conv: newConv._id } }
      );
    }

    return res.status(201).json(newConv);
  } catch (err) {
    console.log(err);
    return res
      .status(500)
      .send({ error: "Sorry, an error occurred, please try again later!" });
  }
};

exports.getConv = getConv;
exports.addConv = addConv;
