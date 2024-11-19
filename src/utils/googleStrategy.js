// const GoogleStrategy = require('passport-google-oauth20').Strategy
// const dotenv = require('dotenv')

// dotenv.config()

// module.exports = function (passport) {
//   passport.use(
//     new GoogleStrategy(
//       {
//         clientID: process.env.GOOGLE_CLIENT_ID,
//         clientSecret: process.env.GOOGLE_CLIENT_SECRET,
//         callbackURL: '/auth/google/callback',
//       },
//       async (accessToken, refreshToken, profile) => {
//         //get the user data from google
//         const newUser = {
//           googleId: profile.id,
//           fullname: profile.name.givenName + profile.name.familyName,
//           email: profile.emails[0].value
//         }
//         return newUser
//       }
//     )
//   )

//   // used to serialize the user for the session
//   passport.serializeUser((user, done) => {
//     done(null, user.id)
//   })

//   // used to deserialize the user
//   passport.deserializeUser((id, done) => {
//     User.findById(id, (err, user) => done(err, user))
//   })
// }
