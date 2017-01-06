var FacebookStrategy = require('passport-facebook').Strategy;
var url = 'http://blackjack-di3.azurewebsites.net';
//var url = 'http://localhost:3000';

module.exports = function(app, passport){
	// Redirect the user to Facebook for authentication.  When complete,
	// Facebook will redirect the user back to the application at
	//     /auth/facebook/callback
	app.get('/auth/facebook', passport.authenticate('facebook', {scope: ['email']}));

	// Facebook will redirect the user to this URL after approval.  Finish the
	// authentication process by attempting to obtain an access token.  If
	// access was granted, the user will be logged in.  Otherwise,
	// authentication has failed.
	app.get('/auth/facebook/callback',
		passport.authenticate('facebook', { successRedirect: '/client.html', failureRedirect: '/505.html' }));
		
	passport.use(new FacebookStrategy({
		clientSecret: '485f3f3eddef688fb526da6ea90415a1',
		clientID: '1825318221083118',
		callbackURL: url
	  },
	  function(accessToken, refreshToken, profile, done) {
            console.log("user logged in: " + profile.id);
		User.findOrCreate({'facebook.id': profile.id}, function(err, user) {
		  if (err) { return done(err); }
		  //leaveTable();
		  //joinTableName(profile.name.givenName);
		  done(null, user);
		});
	  }
	));
};