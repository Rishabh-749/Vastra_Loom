import jwt from "jsonwebtoken";
import userModel from "../models/user.model.js";
import config from "../config/config.js";

const sendTokenResponse = async (user, res, message)=>{
    const token = jwt.sign({
        id: user._id
    },config.JWT_SECRET, {expiresIn: "7d"});

    res.cookie("token", token);

    res.status(201).json({
        message,
        success: true,
        user
    })
}

const registerController = async ()=> {
    const {fullname, email, password, contact, isSeller} = req.body;

    try{
        const existingUser = await userModel.findOne({
            $or: [
                { email },
                { contact }
            ]
        })

        if (existingUser) {
            return res.status(400).json({ message: "User with this email or contact already exists" });
        }

        const user = await userModel.create({
            email,
            contact,
            password,
            fullname,
            role: isSeller ? "seller" : "buyer"
        })

        await sendTokenResponse(user, res, "User registered successfully")

    }catch (error) {
        console.log(error)
        return res.status(500).json({ message: "Server error" });
    }
}

const loginController = async ()=>{
     const { email, password } = req.body;

    const user = await userModel.findOne({ email });

    if (!user) {
        return res.status(400).json({ message: "Invalid email or password" });
    }

    const isMatch = await user.comparePassword(password);

    if (!isMatch) {
        return res.status(400).json({ message: "Invalid email or password" });
    }

    await sendTokenResponse(user, res, "User logged in successfully")
}

export default {
    registerController,
    loginController
}