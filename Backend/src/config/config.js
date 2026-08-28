import "dotenv/config";

if(!process.env.MONGO_URL){
    throw new Error("Mongo_URL is not defined in ENV.")
}

if(!process.env.JWT_SECRET){
    throw new Error("JWT_SECRET is not defined in ENV.")
}

if(!process.env.GOOGLE_CLIENT_ID){
    throw new Error("GOOGLE_CLIENT_ID is not defined in ENV.")
}

if(!process.env.GOOGLE_CLIENT_SECRET){
    throw new Error("GOOGLE_CLIENT_SECRET is not defined in ENV.")
}

if(!process.env.GITHUB_CLIENT_ID){
    throw new Error("GITHUB_CLIENT_ID is not defined in ENV.")
}
if(!process.env.GITHUB_CLIENT_SECRET){
    throw new Error("GITHUB_CLIENT_SECRET is not defined in ENV.")
}

export const config = {
    PORT:process.env.PORT,
    MONGO_URL: process.env.MONGO_URL,
    JWT_SECRET: process.env.JWT_SECRET, 
    GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID,
    GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET,
    GITHUB_CLIENT_ID: process.env.GITHUB_CLIENT_ID,
    GITHUB_CLIENT_SECRET: process.env.GITHUB_CLIENT_SECRET,
    NODE_ENV: process.env.NODE_ENV
}