import Video from "../models/Video";

export const home = async (req, res) => {
    const videos = await Video.find({});
    return res.render("home", { pageTitle: "Home", videos }); // base.pug rendering
} 
export const watch = async (req, res) => {
    // const id = req.params.id
    const { id } = req.params; // ES6
    const video = await Video.findById(id);
    if(!video){ // 에러 체크
        return res.render("404", { pageTitle: "Video not found." });
    }
    return res.render("watch", { pageTitle: video.title, video });
}
export const getEdit = async (req, res) => {
    const { id } = req.params;
    const video = await Video.findById(id);
    if(!video){
        return res.render("404", { pageTitle: "Video not found." });
    }
    return res.render("edit", { pageTitle: `Edit: ${video.title}`, video });
}
export const postEdit = async (req, res) => {
    const { id } = req.params;
    const { title, description, hashtags } = req.body;
    const video = await Video.findById(id);
    if(!video){
        return res.render("404", { pageTitle: "Video not found." });
    }
    video.title = title;
    video.description = description;
    video.hashtags = hashtags
        .split(",")
        .map((word) => word.startsWith('#') ? word : `#${word}`);
    await video.save();
    return res.redirect(`/videos/${id}`) // 브라우저가 자동으로 이동하도록
}
export const getUpload = (req, res) => {
    return res.render("upload", { pageTitle: "Upload Video" });
}
export const postUpload = async (req, res) => {
    // here we will add a video to the videos array.
    const { title, description, hashtags } = req.body
    try {
        await Video.create({ // database에 파일이 저장되는 것을 기다림
            title,
            description,
            createdAt: Date.now(),
            hashtags: hashtags
            .split(",")
            .map((word) => word.startsWith('#') ? word : `#${word}`),          
        });
        return res.redirect("/");
    } 
    catch(error) {
        return res.render( "upload", { 
            pageTitle: "Upload Video", 
            errorMessage: error._message 
        });
    }  
};