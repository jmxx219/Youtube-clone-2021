import express from "express";
import { regitserView } from "../controllers/videoController";

const apiRouter = express.Router();

apiRouter.post("/videos/:id([0-9a-f]{24})/view", regitserView);

export default apiRouter;
