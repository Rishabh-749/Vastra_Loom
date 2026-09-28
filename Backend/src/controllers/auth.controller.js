import jwt from "jsonwebtoken";
import userModel from "../models/user.model.js";
import {config} from "../config/config.js";

const cookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/"
};

const sendTokenResponse = async (user, res, message)=>{
    const token = jwt.sign({
        id: user._id
    },config.JWT_SECRET, {expiresIn: "7d"});

    res.cookie("token", token, {
        ...cookieOptions,
        maxAge: 7 * 24 * 60 * 60 * 1000
    });

    res.status(201).json({
        message,
        success: true,
        user
    })
}

const registerController = async (req, res)=> {
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

const loginController = async (req, res)=>{
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

const googleCallback = async (req, res) =>{
    const {id, displayName, emails, photos} = req.user;
    const email = emails[ 0 ].value;
    const profilePic = photos[ 0 ].value;

    let user = await userModel.findOne({
        email
    })

    if(!user){
        user = await userModel.create({
            email,
            googleId: id,
            fullname: displayName,
        })
    }

    const token = jwt.sign({
        id: user._id,
    }, config.JWT_SECRET, {
        expiresIn: "7d"
    });

    res.cookie("token", token, {
        ...cookieOptions,
        maxAge: 7 * 24 * 60 * 60 * 1000
    });

    const clientBase = (process.env.CLIENT_URL || "").replace(/\/$/, "");
    const redirectUrl = user.role === 'seller'
        ? (clientBase ? `${clientBase}/seller/dashboard` : "/seller/dashboard")
        : (clientBase ? `${clientBase}/` : "/");
    res.redirect(redirectUrl);
}

const githubCallback = async (req, res) => {
    const { id, displayName, username, emails } = req.user;
    
    // Passport GitHub strategy with 'user:email' scope typically provides emails
    const email = emails && emails.length > 0 ? emails[0].value : `${username}@github.com`;
    const nameToUse = displayName || username || "GitHub User";

    let user = await userModel.findOne({ email });

    if (!user) {
        user = await userModel.findOne({ githubId: id });
    }

    if (!user) {
        user = await userModel.create({
            email,
            githubId: id,
            fullname: nameToUse,
        });
    } else if (!user.githubId) {
        user.githubId = id;
        await user.save();
    }

    const token = jwt.sign({
        id: user._id,
    }, config.JWT_SECRET, {
        expiresIn: "7d"
    });

    res.cookie("token", token, {
        ...cookieOptions,
        maxAge: 7 * 24 * 60 * 60 * 1000
    });

    const clientBase = (process.env.CLIENT_URL || "").replace(/\/$/, "");
    const redirectUrl = user.role === 'seller'
        ? (clientBase ? `${clientBase}/seller/dashboard` : "/seller/dashboard")
        : (clientBase ? `${clientBase}/` : "/");
    res.redirect(redirectUrl);
}

const logoutController = async (req, res) => {
    try {
        res.clearCookie("token", cookieOptions);

        res.cookie("token", "", {
            ...cookieOptions,
            expires: new Date(0),
            maxAge: 0
        });

        return res.status(200).json({
            success: true,
            message: "Logged out successfully"
        });
    } catch (error) {
        console.error("Logout error in logoutController:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to log out"
        });
    }
};

export default {
    registerController,
    loginController,
    logoutController,
    googleCallback,
    githubCallback
}