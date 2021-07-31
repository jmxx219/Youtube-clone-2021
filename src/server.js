import express from "express";
import morgan from "morgan";
import session from "express-session";
import MongoStore from "connect-mongo";
import rootRouter from "./routers/rootRouter";
import userRouter from "./routers/userRouter";
import videoRouter from "./routers/videoRouter";
import { localsMiddleware } from "./middlewares";
import apiRouter from "./routers/apiRouter";

const app = express(); // creates an express application
const logger = morgan("dev"); // GET, path, status code 정보를 담고 있음

app.set("view engine", "pug");
app.set("views", process.cwd() + "/src/views");
app.use(logger);

// HTML form 이해, 그 form을 우리가 사용할 수 있는 javascript object 형식으로 통역
app.use(express.urlencoded({ extended: true }));

app.use(
  // session 미들웨어로 express-session module로 주어짐
  session({
    secret: process.env.COOKIE_SECRET, // 비밀로 해야하는 string을 process.env.(환경변수)로 바꾸기
    resave: false,
    saveUninitialized: false, // 세션을 수정할 때만 세션을 DB에 저장하고 쿠키를 넘겨준다.
    // 세션: 서버의 메모리에 저장 -> MondoDB에 저장
    store: MongoStore.create({ mongoUrl: process.env.DB_URL }),
  })
);

app.use(localsMiddleware); // session 미들웨어 다음으로 와야 session object에 접근할 수 있음
app.use("/uploads", express.static("uploads"));
app.use("/static", express.static("assets"));
app.use("/", rootRouter);
app.use("/videos", videoRouter);
app.use("/users", userRouter);
app.use("/api", apiRouter);

export default app;
