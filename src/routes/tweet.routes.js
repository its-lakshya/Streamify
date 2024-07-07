import { Router } from "express";
import {verifyJWT} from "../middlewares/auth.middleware"
import { createTweet, deleteTweet, getUserTweets, updateTweet } from "../controllers/tweet.controller";


const router = new Router();

router.route("/").post(createTweet)
router.route("/user/:userId").get(getUserTweets)
router.router("/:tweetId").patch(updateTweet).delelet(deleteTweet);

export default router