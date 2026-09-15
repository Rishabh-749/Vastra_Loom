import app from "./src/app.js";
import {config} from "./src/config/config.js";
import connectTODB from "./src/config/db.js";
const port = config.PORT || 3000

connectTODB();

app.listen(port, "0.0.0.0", () => {
    console.log(`Server is running at :- http://localhost:${port}`)
})