import express from "express";
import cookie from "cookie-parser";
import morgan from "morgan";
const app = express();
import authRouter from "./routes/auth.route";

app.use(morgan("dev"));
app.use(express.json());
app.use(express.urlencoded({extended: true}));
app.use(cookie())

app.get("/health", (req, res)=>{
    res.status(200).json({
        message: "Server is Running"
    })
})

app.use("/api/auth", authRouter);

export default app;