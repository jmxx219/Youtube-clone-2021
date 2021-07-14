import express from "express";
import { 
    watch, 
    getEdit, 
    postEdit, 
    getUpload, 
    postUpload
} from "../controllers/videoController";

const videoRouter = express.Router();

videoRouter.get("/:id([0-9a-f]{24})", watch); // 정규식(\\d+) 숫자만 받음
videoRouter.route("/:id/edit").get(getEdit).post(postEdit)
// videoRouter.get("/:id(\\d+)/edit", getEdit);
// videoRouter.post("/:id(\\d+)/edit", postEdit);
videoRouter.route("/upload").get(getUpload).post(postUpload)

export default videoRouter;