import express from "express";
import {
  watch,
  getEdit,
  postEdit,
  getUpload,
  postUpload,
  deleteVideo,
} from "../controllers/videoController";
import {
  protectorMiddleware,
  videoUpload,
  sharedbufferMiddleware,
} from "../middlewares";

const videoRouter = express.Router();

videoRouter.get("/:id([0-9a-f]{24})", watch); // 정규식(\\d+) 숫자만 받음
videoRouter
  .route("/:id([0-9a-f]{24})/edit")
  .all(protectorMiddleware)
  .get(getEdit)
  .post(postEdit);
// videoRouter.get("/:id(\\d+)/edit", getEdit);
// videoRouter.post("/:id(\\d+)/edit", postEdit);
videoRouter
  .route("/:id([0-9a-f]{24})/delete")
  .all(protectorMiddleware)
  .get(deleteVideo);
videoRouter
  .route("/upload")
  .all(protectorMiddleware, sharedbufferMiddleware)
  .get(getUpload)
  .post(videoUpload.fields([{ name: "video" }, { name: "thumb" }]), postUpload);

export default videoRouter;
