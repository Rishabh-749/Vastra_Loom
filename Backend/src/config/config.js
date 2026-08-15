import "dotenv/config";

if(!process.env.MONGO_URL){
    throw new Error("Mongo_URL is not defined in ENV.")
}

if(!process.env.JWT_SECRET){
    throw new Error("JWT_SECRET is not defined in ENV.")
}

export const config = {
    PORT:process.env.PORT,
    MONGO_URL: process.env.MONGO_URL,
    JWT_SECRET: process.env.JWT_SECRET,
}