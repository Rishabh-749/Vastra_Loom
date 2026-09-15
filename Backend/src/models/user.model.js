import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema({
    email: {type:String, required: true, unique: true},
    fullname: {type:String, required: true},
    password: {
        type: String,
        required: function () {
            return !this.googleId && !this.githubId;
        }
    },
    contact: {type:String, required: false},
    role: {
        type: String,
        enum: ["buyer", "seller"],
        default: "buyer"
    },
    googleId: {
        type: String,
    },
    githubId: {
        type: String,
    }
});

userSchema.pre("save", async function() {
    if(!this.isModified("password")) return;
    const hash = await bcrypt.hash(this.password, 10);
    this.password = hash;
})

userSchema.methods.comparePassword = async function (password) {
    return await bcrypt.compare(password, this.password);
}

const userModel = mongoose.models.User || mongoose.model("User", userSchema);
if (!mongoose.models.user) {
    mongoose.model("user", userSchema);
}

export default userModel;