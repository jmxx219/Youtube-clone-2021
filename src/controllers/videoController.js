import Video from "../models/Video";

export const home = async (req, res) => {
    const videos = await Video.find({}).sort({ createdAt: "desc" }); // 최신 순으로 비디오 정렬
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
    const video = await Video.exists({ _id: id });
    if(!video){
        return res.render("404", { pageTitle: "Video not found." });
    }
    await Video.findByIdAndUpdate(id, {
        title, 
        description, 
        hashtags: Video.formatHashtags(hashtags),
    })
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
            hashtags: Video.formatHashtags(hashtags),       
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

export const deleteVideo = async(req, res) => {
    const { id } = req.params;
    await Video.findByIdAndDelete(id);
    return res.redirect("/");
};

export const search = async(req, res) => {
    const { keyword } = req.query;
    let videos = [];
    if (keyword) {
        videos = await Video.find({
            title: { 
                // i: 글자의 대,소문자 구분 x, ^${keyword}: keyword 시작하는 단어만
                $regex: new RegExp(`${keyword}$`, "i"),
            },
        });
    }
    return res.render("search", { pageTitle: "Search", videos });
};