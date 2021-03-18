import { Router, Response } from "express";
import HttpStatusCodes from "http-status-codes";
import jwt from "jsonwebtoken";

import Payload from "../../types/Payload";
import Request from "../../types/Request";
import User, { IUser } from "../../models/User";
import { detectFace } from "../../utility/azureDetection";
import { validationResult, check } from "express-validator/check";

const router: Router = Router();

// @route   POST api/user
// @desc    Register user and store faceId if picture is provided
// @access  Public
router.post(
    "/",
    [
        check("email", "Please include a valid email").isEmail(),
        check("password", "Please enter a password with 6 or more characters").isLength({ min: 6 }),
    ],
    async (req: Request, res: Response) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(HttpStatusCodes.BAD_REQUEST).json({ errors: errors.array() });
        }

        const { email, password, faceImage } = req.body;

        try {
            let user: IUser = await User.findOne({ email });

            if (user) {
                return res.status(HttpStatusCodes.BAD_REQUEST).json({
                    errors: [
                        {
                            msg: "User already exists",
                        },
                    ],
                });
            }

            const faceId = faceImage && (await detectFace(faceImage))[0].faceId;
            const userFields = {
                email,
                password,
                ...{ faceId },
            };

            user = new User(userFields);
            await user.save();

            const payload: Payload = {
                userId: user.id,
            };

            jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRATION }, (err, token) => {
                if (err) throw err;
                res.json({ token });
            });
        } catch (err) {
            console.error(err.message);
            res.status(HttpStatusCodes.INTERNAL_SERVER_ERROR).send("Server Error");
        }
    },
);

export default router;
