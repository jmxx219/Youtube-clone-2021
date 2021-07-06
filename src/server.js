import express from "express";
import morgan from "morgan";
import globalRouter from "./routers/globalRouter";
import userRouter from "./routers/userRouter";
import videoRouter from "./routers/videoRouter";

const PORT = 4000;

const app = express(); // creates an express application
const logger = morgan("dev"); // GET, path, status code 정보를 담고 있음
app.use(logger);

app.use("/", globalRouter)
app.use("/videos", videoRouter);
app.use("/users", userRouter);

const handleListening = () => 
    console.log(`Server listening on port http://localhost:${PORT}`);
app.listen(PORT, handleListening); // callback
// app.listen(4000, () => console.log("Server listening on port 4000")); // callback
