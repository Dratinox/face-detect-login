import { ConnectionOptions, connect } from "mongoose";

const connectDB = async () => {
    try {
        const mongoURI: string = process.env.MONGO_URI;
        const options: ConnectionOptions = {
            useNewUrlParser: true,
            useCreateIndex: true,
            useFindAndModify: false,
            useUnifiedTopology: true,
        };
        await connect(mongoURI, options);
        console.log("MongoDB connection successfull");
    } catch (err) {
        console.error(err.message);
        process.exit(1);
    }
};

export default connectDB;
