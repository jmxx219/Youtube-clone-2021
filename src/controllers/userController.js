import User from "../models/User";
import fetch from "node-fetch";
import bcrypt from "bcrypt";

export const getJoin = (req, res) => res.render("join", { pageTitle: "Join" });
export const postJoin = async (req, res) => {
    const { name, username, email, password, password2, location } = req.body;
    const pageTitle = "Join";
    if(password !== password2){
        return res.status(400).render("join", { 
            pageTitle,
            errorMessage: "Password confirmation does not match.",
        });
    }
    const exists = await User.exists({$or: [ { username }, { email } ]}); // $or : or
    if (exists){
        return res.status(400).render("join", { 
            pageTitle,
            errorMessage: "This username/email is already taken." 
        });
    }
    try{
        await User.create({
            name, 
            username, 
            email, 
            password, 
            location
        });
        return res.redirect("/login");
    }
    catch(error) {
        return res.status(400).render( "join", { 
            pageTitle: "Join", 
            errorMessage: error._message 
        });
    }  
};
export const getLogin = (req, res) => {
 res.render("login", { pageTitle: "Login" });
};
export const postLogin = async(req, res) => {
    const { username, password } = req.body;
    const pageTitle = "Login";
    // const exists = await User.exists({ username });
    const user = await User.findOne({ username, socialOnly: false });
    if(!user){
        return res.status(400).render("login", {
            pageTitle,
            errorMessage: "An account with this username does not exists.",
        });
    }
    const ok = await bcrypt.compare(password, user.password);
    if(!ok){
        return res.status(400).render("login", {
            pageTitle,
            errorMessage: "Wrong Password.",
        });
    }
    console.log("😊 LOG USER IN! COMING SOON! 😊");
    // 세션을 initialize(초기화)하는 부분
    req.session.loggedIn = true;
    req.session.user = user;
    return res.redirect("/");
};

export const startGithubLogin = (req, res) => { // 1. Request a user's GitHub identity
    const baseUrl = "https://github.com/login/oauth/authorize";
    const config = {
        client_id : process.env.GH_CLIENT,
        allow_signup : false,
        scope : "read:user user:email", // user정보와 user의 email 정보를 읽을 수 있는 토큰을 받을 수 있다.
    };
    const params = new URLSearchParams(config).toString();
    const finalUrl = `${baseUrl}?${params}`;

    return res.redirect(finalUrl);
};

export const finishGithubLogin = async (req, res) => { 
    // 2. Users are redirected back to your site by GitHub
    // 3. Use the access token to access the API
    const baseUrl = "https://github.com/login/oauth/access_token";
    const config = {
        client_id: process.env.GH_CLIENT,
        client_secret: process.env.GH_SECRET,
        code: req.query.code, // Github에서 받은 코드로, 이 코드를 access_token으로 바꾼다.
    };
    const params = new URLSearchParams(config).toString();
    const finalUrl = `${baseUrl}?${params}`;
    const tokenRequest = await (
        await fetch(finalUrl, {
            method: "POST",
            headers: {
                Accept: "application/json",
            },
        })
    ).json();

    if ("access_token" in tokenRequest) {
        const { access_token } = tokenRequest; // Github API URL를 fetch하는데 사용
        const apiUrl = "https://api.github.com";
        const userData = await ( // github의 user 정보
            await fetch(`${apiUrl}/user`, {
                headers: {
                    Authorization: `token ${access_token}`,
                },
            })
        ).json();
        console.log(userData);

        const emailData = await (
            await fetch(`${apiUrl}/user/emails`, {
              headers: {
                Authorization: `token ${access_token}`,
              },
            })
          ).json();
        console.log(emailData);

        const emailObj = emailData.find(
            (email) => email.primary === true && email.verified === true
        );
        console.log(emailObj)
        if(!emailObj){
            return res.redirect("/login");
        }
        let user = await User.findOne({ email: emailObj.email });
        if (!user) { // email로 user가 없으므로 계정을 생성해야 한다.
            // create an account
            user = await User.create({
                avatarUrl:  userData.avatar_url,
                name: userData.name, 
                username: userData.login, 
                email: emailObj.email, 
                password: "", 
                socialOnly: true,
                location: userData.location,
            });
        }
        req.session.loggedIn = true;
        req.session.user = user;
        return res.redirect("/");
    }
    else { // reponse안에 access_token 없다면 redirect
        return res.redirect("/login");
    }
};

export const logout = (req, res) => {
    req.session.destroy();
    return res.redirect("/");
}
export const edit = (req, res) => res.send("Edit User");
export  const see = (req, res) => res.send("See User");