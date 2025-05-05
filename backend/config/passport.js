const JwtStrategy = require("passport-jwt").Strategy;
const ExtractJwt = require("passport-jwt").ExtractJwt;
const User = require("../models/User");

module.exports = (passport) => {
  const opts = {
    jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    secretOrKey: process.env.JWT_SECRET,
  };

  passport.use(
    new JwtStrategy(opts, async (jwt_payload, done) => {
      try {
        // Find user by ID from JWT payload
        const user = await User.findById(jwt_payload.id).select("-password");

        if (user) {
          return done(null, user);
        }

        return done(null, false);
      } catch (error) {
        console.error(error);
        return done(error, false);
      }
    })
  );
};
