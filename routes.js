var FacebookStrategy = require('passport-facebook').Strategy;
var configAuth = require('./auth')

module.exports = function(app, passport){
	// Redirect the user to Facebook for authentication.  When complete,
	// Facebook will redirect the user back to the application at
	//     /auth/facebook/callback
	app.get('/auth/facebook', passport.authenticate('facebook'));

	// Facebook will redirect the user to this URL after approval.  Finish the
	// authentication process by attempting to obtain an access token.  If
	// access was granted, the user will be logged in.  Otherwise,
	// authentication has failed.
	app.get('/auth/facebook',
		passport.authenticate('facebook', { successRedirect: '/', failureRedirect: '/505' }));
		
	passport.use(new FacebookStrategy({
		clientSecret: '485f3f3eddef688fb526da6ea90415a1',
		clientID: '1825318221083118',
		callbackURL: 'http://blackjack-di3.azurewebsites.net'
	  },
	  function(accessToken, refreshToken, profile, done) {
		User.findOrCreate({'facebook.id': profile.id}, function(err, user) {
		  if (err) { return done(err); }
		  done(null, user);
		});
	  }
	));
};