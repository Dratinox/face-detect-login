import bcrypt from "bcryptjs";
import { Router, Response } from "express";
import { check, validationResult } from "express-validator/check";
import HttpStatusCodes from "http-status-codes";
import jwt from "jsonwebtoken";

import auth from "../../middleware/auth";
import Payload from "../../types/Payload";
import Request from "../../types/Request";
import User, { IUser } from "../../models/User";
import { detectFace, verifyFace } from "../../utility/azureDetection";

const router: Router = Router();

const InvalidCredentialsErrorObject = {
    errors: [
        {
            msg: "Invalid Credentials",
        },
    ],
};

// @route   GET api/auth
// @desc    Get authenticated user given the token
// @access  Private
router.get("/", auth, async (req: Request, res: Response) => {
    try {
        const user: IUser = await User.findById(req.userId).select("-password");
        res.json(user);
    } catch (err) {
        console.error(err.message);
        res.status(HttpStatusCodes.INTERNAL_SERVER_ERROR).send("Server Error");
    }
});

// @route   POST api/auth
// @desc    Login user and get token
// @access  Public
router.post("/", [check("email", "Please include a valid email").isEmail()], async (req: Request, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(HttpStatusCodes.BAD_REQUEST).json({ errors: errors.array() });
    }

    const { email, password, faceImage } = req.body;
    if (!password && !faceImage) {
        return res.status(HttpStatusCodes.BAD_REQUEST).json(InvalidCredentialsErrorObject);
    }

    try {
        let user: IUser = await User.findOne({ email });

        if (!user) {
            return res.status(HttpStatusCodes.BAD_REQUEST).json(InvalidCredentialsErrorObject);
        }

        if (password) {
            const isMatch = await bcrypt.compare(password, user.password);

            if (!isMatch) {
                return res.status(HttpStatusCodes.BAD_REQUEST).json(InvalidCredentialsErrorObject);
            }
        } else {
            const faceId = faceImage && (await detectFace(faceImage))[0]?.faceId;
            if (!faceId || !(await verifyFace(faceId, user.faceId))) {
                return res.status(HttpStatusCodes.BAD_REQUEST).json({
                    errors: [
                        {
                            msg: "Face doesn't match",
                        },
                    ],
                });
            }
        }

        const payload: Payload = {
            userId: user.id,
        };

        jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRATION }, (err, token) => {
            if (err) {
                throw err;
            }
            res.json({ token });
        });
    } catch (err) {
        console.error(err.message);
        res.status(HttpStatusCodes.INTERNAL_SERVER_ERROR).send("Server Error");
    }
});

export default router;
