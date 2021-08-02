import multer from "multer";

export const localsMiddleware = (req, res, next) => {
  // res.locals에 값을 준다면 pug에서 읽을 수 있다.
  res.locals.loggedIn = Boolean(req.session.loggedIn);
  res.locals.siteName = "Wetube";
  res.locals.loggedInUser = req.session.user || {};
  next();
};

export const protectorMiddleware = (req, res, next) => {
  if (req.session.loggedIn) {
    // 로그인 되어있으면 계속 요청
    next();
  } else {
    req.flash("error", "Log in first.");
    return res.redirect("/login");
  }
};
export const publicOnlyMiddleware = (req, res, next) => {
  if (!req.session.loggedIn) {
    // // 로그인 되어있지 않으면 계속 요청
    return next();
  } else {
    req.flash("error", "Not authorized");
    return res.redirect("/");
  }
};

export const avatarFiles = multer({
  dest: "uploads/avatars/",
  limits: {
    fileSize: 3000000,
  },
});

export const videoUpload = multer({
  dest: "uploads/videos/",
  limits: {
    fileSize: 300000000, // 300MB
  },
});

export const sharedbufferMiddleware = (req, res, next) => {
  res.header("Cross-Origin-Embedder-Policy", "require-corp");
  res.header("Cross-Origin-Opener-Policy", "same-origin");
  next();
};
