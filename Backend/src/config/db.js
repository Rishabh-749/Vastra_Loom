import mongoose from "mongoose";
import {config} from "./config.js"
const connectTODB = async ()=>{
    mongoose.connect(config.MONGO_URL).then(()=>{
        console.log("Connected to DB")
    }).catch(()=>{
        console.log("Connection Failed")
    })
}

export default connectTODB;