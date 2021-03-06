import User from "../models/User";
import fetch from "node-fetch";
import bcrypt from "bcrypt";

export const getJoin = (req, res) => res.render("join", { pageTitle: "Join" });

export const postJoin = async (req, res) => {
  const { name, username, email, password, password2, location } = req.body;
  const pageTitle = "Join";
  if (password !== password2) {
    return res.status(400).render("join", {
      pageTitle,
      errorMessage: "Password confirmation does not match.",
    });
  }
  const exists = await User.exists({ $or: [{ username }, { email }] }); // $or : or
  if (exists) {
    return res.status(400).render("join", {
      pageTitle,
      errorMessage: "This username/email is already taken.",
    });
  }
  try {
    await User.create({
      name,
      username,
      email,
      password,
      location,
    });
    return res.redirect("/login");
  } catch (error) {
    return res.status(400).render("join", {
      pageTitle: "Join",
      errorMessage: error._message,
    });
  }
};

export const getLogin = (req, res) => {
  res.render("login", { pageTitle: "Login" });
};

export const postLogin = async (req, res) => {
  const { username, password } = req.body;
  const pageTitle = "Login";
  // const exists = await User.exists({ username });
  const user = await User.findOne({ username, socialOnly: false });
  if (!user) {
    return res.status(400).render("login", {
      pageTitle,
      errorMessage: "An account with this username does not exists.",
    });
  }
  const ok = await bcrypt.compare(password, user.password);
  if (!ok) {
    return res.status(400).render("login", {
      pageTitle,
      errorMessage: "Wrong Password.",
    });
  }
  console.log("π LOG USER IN! COMING SOON! π");
  // μΈμμ initialize(μ΄κΈ°ν)νλ λΆλΆ
  req.session.loggedIn = true;
  req.session.user = user;
  return res.redirect("/");
};

export const startGithubLogin = (req, res) => {
  // 1. Request a user's GitHub identity
  const baseUrl = "https://github.com/login/oauth/authorize";
  const config = {
    client_id: process.env.GH_CLIENT,
    allow_signup: false,
    scope: "read:user user:email", // userμ λ³΄μ userμ email μ λ³΄λ₯Ό μ½μ μ μλ ν ν°μ λ°μ μ μλ€.
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
    code: req.query.code, // Githubμμ λ°μ μ½λλ‘, μ΄ μ½λλ₯Ό access_tokenμΌλ‘ λ°κΎΌλ€.
  };
  const params = new URLSearchParams(config).toString();
  const finalUrl = `${baseUrl}?${params}`;
  const tokenRequest = await (
    await fetch(finalUrl, {
      // finalUrlλ‘ POST requestλ₯Ό λ³΄λΈλ€.
      method: "POST",
      headers: {
        Accept: "application/json",
      },
    })
  ).json();

  if ("access_token" in tokenRequest) {
    const { access_token } = tokenRequest; // Github APIμ μνΈμμ©νκΈ° μν΄μ URLλ₯Ό fetchνλλ° μ¬μ©
    const apiUrl = "https://api.github.com";
    const userData = await // githubμ user μ λ³΄
    (
      await fetch(`${apiUrl}/user`, {
        headers: {
          Authorization: `token ${access_token}`,
        },
      })
    ).json();
    // console.log(userData);

    const emailData = await // email API
    (
      await fetch(`${apiUrl}/user/emails`, {
        headers: {
          Authorization: `token ${access_token}`,
        },
      })
    ).json();
    // console.log(emailData);

    const emailObj = emailData.find(
      (email) => email.primary === true && email.verified === true
    );
    console.log(emailObj);
    if (!emailObj) {
      // set notification
      return res.redirect("/login");
    }
    let user = await User.findOne({ email: emailObj.email });
    if (!user) {
      // emailλ‘ userκ° μμΌλ―λ‘ κ³μ μ μμ±ν΄μΌ νλ€.
      // create an account
      user = await User.create({
        avatarUrl: userData.avatar_url,
        name: userData.name,
        username: userData.login,
        email: emailObj.email,
        password: "",
        socialOnly: true, // Github λ‘κ·ΈμΈμ ν΅ν΄ λ§λ€μ΄μ§ κ³μ 
        location: userData.location,
      });
    }
    req.session.loggedIn = true;
    req.session.user = user;
    return res.redirect("/");
  } else {
    // reponseμμ access_token μλ€λ©΄ redirect
    return res.redirect("/login");
  }
};

export const logout = (req, res) => {
  req.session.destroy();
  // req.flash("info", "Bye Bye");
  return res.redirect("/");
};

export const getEdit = (req, res) => {
  return res.render("edit-profile", { pageTitle: "Edit Profile" });
};

export const postEdit = async (req, res) => {
  const {
    session: {
      user: { _id, avatarUrl },
    },
    body: { name, email, username, location },
    file,
  } = req;

  // usernameκ³Ό emailμ΄ κ°μ Userκ° μ‘΄μ¬νλ€λ©΄ edit x
  const findUsername = await User.findOne({ username });
  const findEmail = await User.findOne({ email });
  if (findUsername._id != _id || findEmail._id != _id) {
    return res.status(400).render("edit-Profile", {
      pageTitle: "Edit Profile",
      errorMessage: "This username/email is already taken.",
    });
  }

  const updatedUser = await User.findByIdAndUpdate(
    _id,
    {
      avatarUrl: file ? file.path : avatarUrl,
      name,
      email,
      username,
      location,
    },
    { new: true } // μλ‘ μλ°μ΄νΈλ λ°μ΄ν°λ₯Ό return ν΄μ€
  );
  req.session.user = updatedUser; // sessionμλ μλ°μ΄νΈ

  return res.redirect("/users/edit");
};

export const getChangePassword = (req, res) => {
  if (req.session.user.socialOnly === true) {
    req.flash("error", "Can't change password.");
    return res.redirect("/");
  }
  return res.render("users/change-password", { pageTitle: "Change Password" });
};

export const postChangePassword = async (req, res) => {
  const {
    session: {
      user: { _id },
    },
    body: { oldPassword, newPassword, newPasswordConfirmation },
  } = req;

  const user = await User.findById(_id);
  const ok = await bcrypt.compare(oldPassword, user.password);
  if (!ok) {
    return res.status(400).render("users/change-password", {
      pageTitle: "Change Password",
      errorMessage: "The current password is incorrect.",
    });
  }
  if (newPassword !== newPasswordConfirmation) {
    return res.status(400).render("users/change-password", {
      pageTitle: "Change Password",
      errorMessage: "The password does not match the confirmaion.",
    });
  }

  user.password = newPassword;
  await user.save(); // -> pre save(models/User) μλ - μλ‘μ΄ λΉλ°λ²νΈ ν΄μ±
  req.session.user.password = user.password; // sessionλ μλ°μ΄νΈ
  req.flash("info", "Password updated");
  return res.redirect("/users/logout");
};

export const see = async (req, res) => {
  const { id } = req.params;
  const user = await User.findById(id).populate({
    path: "videos",
    populate: {
      path: "owner",
      model: "User",
    },
  });
  if (!user) {
    return res.status(404).render("404", { pageTitle: "User not found." });
  }

  return res.render("users/profile", {
    pageTitle: user.name,
    user,
  });
};
