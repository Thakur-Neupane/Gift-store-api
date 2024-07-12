import { Strategy as GoogleStrategy } from "passport-google-oauth20";



passport.use(
  new GoogleStrategy({
    clientID: process.env.Clientid,
    clientSecret: process.env.Clientsecret,
    callbackURL: "/auth/google/callback",
    scope: ["profile", "email"],
  })
);