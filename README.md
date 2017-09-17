# passport-browserid

[![Build](https://img.shields.io/travis/jaredhanson/passport-browserid.svg)](https://travis-ci.org/jaredhanson/passport-browserid)
[![Coverage](https://img.shields.io/coveralls/jaredhanson/passport-browserid.svg)](https://coveralls.io/r/jaredhanson/passport-browserid)
[![Quality](https://img.shields.io/codeclimate/github/jaredhanson/passport-browserid.svg?label=quality)](https://codeclimate.com/github/jaredhanson/passport-browserid)
[![Dependencies](https://img.shields.io/david/jaredhanson/passport-browserid.svg)](https://david-dm.org/jaredhanson/passport-browserid)


[Passport](https://github.com/jaredhanson/passport) strategy for authenticating
with [BrowserID](https://developer.mozilla.org/en-US/docs/Mozilla/Persona).

This module lets you authenticate using BrowserID in your Node.js applications.
By plugging into Passport, BrowserID authentication can be easily and
unobtrusively integrated into any application or framework that supports
[Connect](http://www.senchalabs.org/connect/)-style middleware, including
[Express](http://expressjs.com/).

[BrowserID](https://developer.mozilla.org/en-US/docs/Mozilla/Persona) is an
open, decentralized protocol for authenticating users based on email addresses,
developed by [Mozilla](http://www.mozilla.org/).  It is commonly associated with
[Persona](https://login.persona.org/), the brand used for Mozilla's
implementation of BrowserID.  This strategy performs local verification of
assertions, delivering on BrowserID's promise of ensuring user privacy.

## Install

    $ npm install passport-browserid

## Usage

#### Configure Strategy

The BrowserID authentication strategy authenticates users using an assertion of
email address ownership, obtained via the BrowserID JavaScript API.  The
strategy requires a `verify` callback, which accepts an email address and calls
`cb` providing a user.

    passport.use(new BrowserIDStrategy({
        audience: 'http://www.example.com'
      },
      function(email, cb) {
        User.findByEmail({ email: email }, function (err, user) {
          return cb(err, user);
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

## Considerations

#### Specification

This module is implemented based on the specifications being developed by [Mozilla Identity](https://wiki.mozilla.org/Identity),
which remain a work-in-progress and are *not* final.  Implementers are
encouraged to track the progress of these specifications and update update their
implementations as necessary.  Furthermore, the implications of relying on
non-final specifications should be understood prior to deployment.

While the specifications remain under development, it is recommended to use
Mozilla's [Remote Verification API](https://developer.mozilla.org/en-US/docs/Mozilla/Persona/Remote_Verification_API).
This functionality is implemented by [passport-persona](https://github.com/jaredhanson/passport-persona).

## Examples

For a complete, working example, refer to the [signin example](https://github.com/jaredhanson/passport-browserid/tree/master/examples/signin).

## Contributing

#### Tests

The test suite is located in the `test/` directory.  All new features are
expected to have corresponding test cases.  Ensure that the complete test suite
passes by executing:

```bash
$ make test
```

#### Coverage

All new feature development is expected to have test coverage.  Patches that
increse test coverage are happily accepted.  Coverage reports can be viewed by
executing:

```bash
$ make test-cov
$ make view-cov
```

## Support

#### Funding

This software is provided to you as open source, free of charge.  The time and
effort to develop and maintain this project is volunteered by [@jaredhanson](https://github.com/jaredhanson).
If you (or your employer) benefit from this project, please consider a financial
contribution.  Your contribution helps continue the efforts that produce this
and other open source software.

Funds are accepted via [PayPal](https://paypal.me/jaredhanson), [Venmo](https://venmo.com/jaredhanson),
and [other](http://jaredhanson.net/pay) methods.  Any amount is appreciated.

## Credits

  - [Jared Hanson](http://github.com/jaredhanson)
  - [Leo McArdle](https://github.com/LeoMcA)

## License

[The MIT License](http://opensource.org/licenses/MIT)

Copyright (c) 2011-2017 Jared Hanson <[http://jaredhanson.net/](http://jaredhanson.net/)>

<a target='_blank' rel='nofollow' href='https://app.codesponsor.io/link/vK9dyjRnnWsMzzJTQ57fRJpH/jaredhanson/passport-browserid'>  <img alt='Sponsor' width='888' height='68' src='https://app.codesponsor.io/embed/vK9dyjRnnWsMzzJTQ57fRJpH/jaredhanson/passport-browserid.svg' /></a>
