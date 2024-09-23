import Router from "express";
const router = Router();
import passport from "passport";
import session from "express-session";
import { OAuth } from "./0Auth.config.js";
OAuth();
router.use(
  session({
    secret: "your_secret_key",
    resave: false,
    saveUninitialized: true,
  })
);

// Initialize Passport and restore authentication state from the session
router.use(passport.session());
router.use(passport.initialize());

// Define routes

router.get("/auth/facebook", passport.authenticate("facebook"));

router.get(
  "/auth/google/callback",
  passport.authenticate("facebook", { failureRedirect: "/" }),
  (req, res) => {
    const user = req.user;
    res.json({ user });
  }
);

export default router;
