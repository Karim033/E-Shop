import passport from "passport";
import GoogleStrategy from "passport-google-oauth20";

export const OAuth = () => {
  passport.use(
    new GoogleStrategy(
      {
        clientID: process.env.CLIENT_ID,
        clientSecret: process.env.CLIENT_SECRET,
        callbackURL: "http://localhost:8000/auth/google/callback",
      },
      (accessToken, refreshToken, profile, done) => {
        // Here you would find or create a user in your database
        // For now, we'll just pass the profile on
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
