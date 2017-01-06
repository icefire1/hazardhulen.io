
module.exports = function(app, passport){
	// Redirect the user to Facebook for authentication.  When complete,
	// Facebook will redirect the user back to the application at
	//     /auth/facebook/callback
	app.get('/', passport.authenticate('facebook'));

	// Facebook will redirect the user to this URL after approval.  Finish the
	// authentication process by attempting to obtain an access token.  If
	// access was granted, the user will be logged in.  Otherwise,
	// authentication has failed.
	app.get('/',
		passport.authenticate('facebook', { successRedirect: '/', failureRedirect: '/505' }));
		
	passport.use(new FacebookStrategy({
		clientID: configAuth.clientID,
		clientSecret: configAuth.clientSecret,
		callbackURL: configAuth.callbackURL
	  },
	  function(accessToken, refreshToken, profile, done) {
		User.findOrCreate({'facebook.id': profile.id}, function(err, user) {
		  if (err) { return done(err); }
		  done(null, user);
		});
	  }
	));
};