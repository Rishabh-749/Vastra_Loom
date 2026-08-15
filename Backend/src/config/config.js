import "dotenv/config";

if(!process.env.MONGO_URL){
    throw new Error("Mongo_URL is not defined in ENV.")
}

export const config = {
    PORT:process.env.PORT,
    MONGO_URL: process.env.MONGO_URL,
}