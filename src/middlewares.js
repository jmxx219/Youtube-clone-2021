export const localsMiddleware = (req, res, next) => {
    // res.locals에 값을 준다면 pug에서 읽을 수 있다.
    res.locals.loggedIn = Boolean(req.session.loggedIn);
    res.locals.siteName = "Wetube";
    res.locals.loggedInUser = req.session.user;
    next();
} 