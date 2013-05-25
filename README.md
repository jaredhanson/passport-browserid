# Passport-BrowserID

[Passport](https://github.com/jaredhanson/passport) strategy for authenticating
with [BrowserID](https://login.persona.org/).

This module lets you authenticate using BrowserID in your Node.js applications.
By plugging into Passport, BrowserID authentication can be easily and
unobtrusively integrated into any application or framework that supports
[Connect](http://www.senchalabs.org/connect/)-style middleware, including
[Express](http://expressjs.com/).

## Installation

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

(The MIT License)

Copyright (c) 2011 Jared Hanson

Permission is hereby granted, free of charge, to any person obtaining a copy of
this software and associated documentation files (the "Software"), to deal in
the Software without restriction, including without limitation the rights to
use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of
the Software, and to permit persons to whom the Software is furnished to do so,
subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS
FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR
COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER
IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN
CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
