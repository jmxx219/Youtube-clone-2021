import bcrypt from "bcrypt";
import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  avatarUrl: String,
  socialOnly: { type: Boolean, default: false },
  username: { type: String, required: true, unique: true },
  password: { type: String },
  name: { type: String, required: true },
  location: String,
  videos: [
    // 한 유저는 여러 개의 비디오를 가질 수 있기 때문에 배열로
    { type: mongoose.Schema.Types.ObjectId, required: true, ref: "Video" },
  ],
});

userSchema.pre("save", async function () {
  if (this.isModified("password")) {
    // 비밀번호가 변경되었을 때만 해싱한다.
    this.password = await bcrypt.hash(this.password, 5);
  }
});

const User = mongoose.model("User", userSchema);
export default User;
