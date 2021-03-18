import { Document, Model, model, Schema } from "mongoose";
import bcrypt from "bcryptjs";

/**
 * @param email:string
 * @param password:string
 * @param faceId:string
 */
export interface IUser extends Document {
    email: string;
    password: string;
    faceId?: string;
}

const userSchema: Schema = new Schema({
    email: {
        type: String,
        required: true,
        unique: true,
    },
    password: {
        type: String,
        required: true,
    },
    faceId: {
        type: String,
    },
    date: {
        type: Date,
        default: Date.now,
    },
});

userSchema.pre("save", async function (next) {
    let user = this as IUser;

    if (!user.isModified("password")) {
        return next();
    }

    const salt = await bcrypt.genSalt(10);
    const hashed = await bcrypt.hash(user.password, salt);

    user.password = hashed;
    next();
});

const User: Model<IUser> = model("User", userSchema);

export default User;
