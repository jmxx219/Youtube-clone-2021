import Video from "../models/Video";

export const home = async (req, res) => {
    const videos = await Video.find({});
    return res.render("home", { pageTitle: "Home", videos }); // base.pug rendering
} 
export const watch = (req, res) => {
    // const id = req.params.id
    const { id } = req.params; // ES6
    return res.render("watch", { pageTitle: `Watching` });
}
export const getEdit = (req, res) => {
    const { id } = req.params;
    return res.render("edit", { pageTitle: `Editing` });
}
export const postEdit = (req, res) => {
    const { id } = req.params;
    const { title } = req.body
    return res.redirect(`/videos/${id}`) // 브라우저가 자동으로 이동하도록
}
export const getUpload = (req, res) => {
    return res.render("upload", { pageTitle: "Upload Video" });
}
export const postUpload = (req, res) => {
    // here we will add a video to the videos array.
    const { title } = req.body
    return res.redirect("/");
}