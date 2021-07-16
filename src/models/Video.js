import mongoose from "mongoose";

const videoSchema = new mongoose.Schema({
    title: { type: String, required: true, trim: true, maxLength: 80 },
    description: { type: String, required: true, trim: true, minLength: 20 },
    createdAt: { type: Date, required: true, defalut: Date.now },
    hashtags: [{ type: String, trim: true  }],
    meta: {
        views: { type: Number, default: 0, required: 0 },
        rating: { type: Number, default: 0, required: 0 },
    },
});

videoSchema.static("formatHashtags", function (hashtags) {
    return hashtags
      .split(",")
      .map((word) => (word.startsWith("#") ? word : `#${word}`));
  });
 
// videoSchema.pre("save", async function () { // Mongoose - Middelware
//     this.hashtags = this.hashtags[0]
//       .split(",")
//       .map((word) => (word.startsWith("#") ? word : `#${word}`));
//   });

const Video = mongoose.model("Video", videoSchema);
export default Video;