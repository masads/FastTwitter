const { Tweet, User, Like, Comment, Retweet } = require("../../sequelize");
const { addTweetValidation } = require("../../utils/validation");
const upload = require("../upload");

module.exports = {
  addTweet: async (req, res) => {
    console.log(req.body)
    // Joi validation checks
    const validation = addTweetValidation(req.body);
    if (validation.error)
      return res.status(400).json({ errors: validation.error.details });

    upload(req.file, req.body.resource_type).then(async (media) => {
      console.log(media)
      
      try {
        // const getuser =await User.findOne({
        //   attributes: [
        //     "foodtweetcount",
        //     "clothestweetcount",
        //     "gamestweetcount",
        //     "laptoptweetcount",
        //     "watchtweetcount",
        //     "totaltweets",
        //   ],
        //   where: {
        //     id:req.body.userId
        //   }
        // })
        // let {foodtweetcount,clothestweetcount,gamestweetcount,laptoptweetcount,watchtweetcount,totaltweets} = getuser.dataValues
        if(req.body.type=='food')
        {
          await User.increment("foodtweetcount", {
            by: 1,
            where: { id: req.body.userId },
          });
        }else if(req.body.type=='clothes')
        {
          await User.increment("clothestweetcount", {
            by: 1,
            where: { id: req.body.userId },
          });
        }else if(req.body.type=='games')
        {
          await User.increment("gamestweetcount", {
            by: 1,
            where: { id: req.body.userId },
          });
        }else if(req.body.type=='laptop')
        {
          await User.increment("laptoptweetcount", {
            by: 1,
            where: { id: req.body.userId },
          });
        }else if(req.body.type=='watch')
        {
          await User.increment("watchtweetcount", {
            by: 1,
            where: { id: req.body.userId },
          });
        }
        await User.increment("totaltweets", {
          by: 1,
          where: { id: req.body.userId },
        });
        const tweet = await Tweet.create({
          userId: req.body.userId,
          text: req.body.text,
          media: media.secure_url,
        });
        return res.status(200).json({ tweet });
      } catch (err) {
        return res.status(400).json({ errors: err });
      }
    });
  },
  getTweet: async (req, res) => {
    // body -> {tweetId, username, myId}
    Promise.all([
      module.exports.getUserTweet(req.query.tweetId, req.query.username),
      module.exports.isLikedByMe(req.query.tweetId, req.query.myId),
      module.exports.isRetweetedByMe(req.query.tweetId, req.query.myId),
    ]).then((values) => {
      let tweet = { ...values[0] };
      tweet = { ...tweet, selfLiked: values[1] ? true : false };
      tweet = { ...tweet, selfRetweeted: values[2] ? true : false };
      return res.status(200).json({ tweet });
    });
  },
  removeTweet: async (req, res) => {
    res.status(200).json({});
  },
  getUserTweet: async (tweetId, username) => {
    const tweet = await User.findOne({
      attributes: ["firstname", "lastname", "username", "avatar"],
      where: {
        username: username,
      },
      include: {
        model: Tweet,
        where: {
          id: tweetId,
        },
        required: true,
      },
      raw: true,
    });
    return tweet;
  },
  getAdData: async (req,res) => {
    const adsData = await User.findOne({
      attributes: [
            "foodtweetcount",
            "clothestweetcount",
            "gamestweetcount",
            "laptoptweetcount",
            "watchtweetcount",
            "totaltweets",
      ],
      where: {
        id: req.query.userId,
      },
    });
    // console.log("----->",req.query.userId)
    res.status(200).json({ adsData });
  },
  removeTweet: async (req, res) => {
    console.log("removing", req.body);
    const { tweetId } = req.body;
    // body -> {tweetId}
    Promise.all([
      await Tweet.destroy({ where: { id: tweetId } }),
      await Like.destroy({ where: { tweetId } }),
      await Comment.destroy({ where: { tweetId } }),
      await Retweet.destroy({ where: { tweetId } }),
    ]).then((values) => {
      return res.status(200).json({ tweet: values[0] });
    });
  },
  isLikedByMe: async (tweetId, id) => {
    const like = await Like.findOne({
      where: {
        tweetId,
        userId: id,
      },
    });
    return like;
  },
  isRetweetedByMe: async (tweetId, id) => {
    const retweet = await Retweet.findOne({
      where: {
        tweetId,
        userId: id,
      },
    });
    return retweet;
  },
};
