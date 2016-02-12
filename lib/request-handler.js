var request = require('request');
var crypto = require('crypto');
var bcrypt = require('bcrypt-nodejs');
var util = require('../lib/utility');

var db = require('../app/config');
var User = require('../app/models/user');
var Link = require('../app/models/link');

exports.renderIndex = function(req, res) {
  res.render('index');
};

exports.signupUserForm = function(req, res) {
  res.render('signup');
};

exports.loginUserForm = function(req, res) {
  res.render('login');
};

exports.logoutUser = function(req, res) {
  req.session.destroy(function() {
    res.redirect('/login');
  });
};

exports.fetchLinks = function(req, res) {

  Link.find({}, function(err, link) {
    console.log('gettin some data, dawg: ', link);
    res.send(200, link.models);
  });

  Link.reset().fetch().then(function(links) {
    res.send(200, links.models);
  });

};

exports.saveLink = function(req, res) {
  var uri = req.body.url;

  if (!util.isValidUrl(uri)) {
    console.log('Not a valid url: ', uri);
    return res.send(404);
  }

  util.getUrlTitle(uri, function(err, title) {
    if (err) {
      console.log('Error reading URL heading: ', err);
      return res.send(404);
    }

    Link.find({ url: uri }, function( err, links ) {
      if ( err ) {
        return err;
      }

      if ( links.length ) {
        res.send(200, links[0]);
        return;
      }

      var newLink = new Link({
          url: uri,
          baseUrl: req.headers.origin,
          title: title
      });

      newLink.save(function( err, newLink ) {
        if ( err ) {
          return err;
        }
        res.send(200, newLink);
      });
      
    });

  });

};

exports.loginUser = function(req, res) {
  var username = req.body.username;
  var password = req.body.password;

  new User({ username: username })
    .fetch()
    .then(function(user) {
      if (!user) {
        res.redirect('/login');
      } else {
        user.comparePassword(password, function(match) {
          if (match) {
            util.createSession(req, res, user);
          } else {
            res.redirect('/login');
          }
        });
      }
  });
};

exports.signupUser = function(req, res) {
  var username = req.body.username;
  var password = req.body.password;

  User.find({ username: username }, function( err, users ) {
    if ( err ) {
      return err;
    }

    if ( users.length ) {
      res.redirect('/signup');
      return;
    }

    var newUser = new User({
        username: username,
        password: password
    });

    newUser.save(function( err, newUser ) {
      if ( err ) {
        return err;
      }
      util.createSession(req, res, newUser);
      res.redirect('/');
    });
    
  });

  // new User({ username: username })
  //   .fetch()
  //   .then(function(user) {
  //     if (!user) {
  //       var newUser = new User({
  //         username: username,
  //         password: password
  //       });
  //       newUser.save()
  //         .then(function(newUser) {
  //           Users.add(newUser);
  //           util.createSession(req, res, newUser);
  //         });
  //     } else {
  //       console.log('Account already exists');
  //       res.redirect('/signup');
  //     }
  //   });
};

exports.navToLink = function(req, res) {
  Link.find( { code: req.params[0] }, function( err, links ) {
    var link = links[0];

    if ( err ) {
      return err;
    }

    if ( !link ) {
      res.redirect('/');
      return;
    }

    link.visits += 1;

    link.save( function() {
      return res.redirect( link.url );
    });

  });
};