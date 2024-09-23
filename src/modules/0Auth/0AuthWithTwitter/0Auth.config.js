import TwitterStrategy from "passport-twitter";
import passport from "passport";

export const OAuth = () => {
  passport.use(
    new TwitterStrategy(
      {
        consumerKey: process.env.API_KEY,
        consumerSecret: process.env.API_SECRET,
        callbackURL: "http://localhost:8000/auth/twitter/callback",
      },
      function (token, tokenSecret, profile, cb) {
        User.findOrCreate({ twitterId: profile.id }, function (err, user) {
          return cb(err, user);
        });
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
