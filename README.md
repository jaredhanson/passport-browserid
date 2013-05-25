# Passport-BrowserID

[Passport](https://github.com/jaredhanson/passport) strategy for authenticating
with [BrowserID](https://login.persona.org/).

This module lets you authenticate using BrowserID in your Node.js applications.
By plugging into Passport, BrowserID authentication can be easily and
unobtrusively integrated into any application or framework that supports
[Connect](http://www.senchalabs.org/connect/)-style middleware, including
[Express](http://expressjs.com/).

## Install

    $ npm install passport-browserid

## Usage

#### Configure Strategy

The BrowserID authentication strategy authenticates users using an assertion of
email address ownership, obtained via the BrowserID JavaScript API.  The
strategy requires a `validate` callback, which accepts an email address and calls
`done` providing a user.

    passport.use(new BrowserIDStrategy({
        audience: 'http://www.example.com'
      },
      function(email, done) {
        User.findByEmail({ email: email }, function (err, user) {
          return done(err, user);
        });
      }
    ));

#### Authenticate Requests

Use `passport.authenticate()`, specifying the `'browserid'` strategy, to
authenticate requests.

For example, as route middleware in an [Express](http://expressjs.com/)
application:

    app.post('/auth/browserid', 
      passport.authenticate('browserid', { failureRedirect: '/login' }),
      function(req, res) {
        // Successful authentication, redirect home.
        res.redirect('/');
      });

## Implementation

This module is implemented based on the specifications being developed by [Mozilla Identity](https://wiki.mozilla.org/Identity),
which remain a work-in-progress and are *not* final.  Implementers are
encouraged to track the progress of these specifications and update update their
implementations as necessary.  Furthermore, the implications of relying on
non-final specifications should be understood prior to deployment.

## Examples

For a complete, working example, refer to the [signin example](https://github.com/jaredhanson/passport-browserid/tree/master/examples/signin).

## Tests

    $ npm install --dev
    $ make test

[![Build Status](https://secure.travis-ci.org/jaredhanson/passport-browserid.png)](http://travis-ci.org/jaredhanson/passport-browserid)

## Credits

  - [Jared Hanson](http://github.com/jaredhanson)
  - [Leo McArdle](https://github.com/LeoMcA)

## License

[The MIT License](http://opensource.org/licenses/MIT)

Copyright (c) 2011-2013 Jared Hanson <[http://jaredhanson.net/](http://jaredhanson.net/)>
