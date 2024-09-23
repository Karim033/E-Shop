import passport from "passport";
import FacebookStrategy from "passport-facebook";

export const OAuth = () => {
  passport.use(
    new FacebookStrategy(
      {
        clientID: process.env.APP_ID,
        clientSecret: process.env.APP_SECRET,
        callbackURL: "http://localhost:8000/auth/facebook/callback",
        profileFields: ["id", "displayName", "photos", "email"],
      },
      function (profile, done) {
        return done(null, profile);
      }
    )
  );
  // Serialize user to the session
  passport.serializeUser((user, done) => {
    done(null, user);
  });

  // Deserialize user from the session
  passport.deserializeUser((obj, done) => {
    done(null, obj);
  });
};
