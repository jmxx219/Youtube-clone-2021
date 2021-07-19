import "./db"; // 파일 자체를 import -> 서버가 mongo에 연결
import "./models/Video";
import "./models/User";
import app from "./server";


const PORT = 4000;

const handleListening = () => 
    console.log(`✅ Server listening on port http://localhost:${PORT} 🚀`);
app.listen(PORT, handleListening); // callback
// app.listen(4000, () => console.log("Server listening on port 4000")); // callback
