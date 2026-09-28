import app from "../src/app.js";
import connectTODB from "../src/config/db.js";

// Initialize and reuse database connection across serverless requests
connectTODB();

export default app;
