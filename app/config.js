var mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/shortly');

var Schema = mongoose.Schema;
var ObjectId = Schema.ObjectId;

var db = mongoose.connection;

db.on('error', console.error.bind(console, 'connection error:'));
// db.once('open', function() {
  console.log('running!');

  var linkSchema = new Schema({
    id: ObjectId,
    url: String,
    baseUrl: String,
    code: String,
    title: String,
    visits: {type: Number, default: 0},
    timestamps: Date
  });

  linkSchema.methods.initialize = function() {
    this.on('creating', function(model, attrs, options) {
      var shasum = crypto.createHash('sha1');
      shasum.update(model.get('url'));
      model.set('code', shasum.digest('hex').slice(0, 5));
    });
  };


  var userSchema = new Schema({
    id: ObjectId,
    username: String,
    password: String,
    timestamps: Date
  });
  
  userSchema.methods.initialize = function() {
    this.on('creating', this.hashPassword);
  };

  userSchema.methods.comparePassword = function(attemptedPassword, callback) {
    bcrypt.compare(attemptedPassword, this.get('password'), function(err, isMatch) {
      callback(isMatch);
    });
  };

  userSchema.methods.hashPassword = function() {
    var cipher = Promise.promisify(bcrypt.hash);
    return cipher(this.get('password'), null, null).bind(this)
      .then(function(hash) {
        this.set('password', hash);
      });
  };

  var Link = mongoose.model('Link', linkSchema);
  var User = mongoose.model('User', userSchema);

  module.exports.Link = Link;
  module.exports.User = User;

// });




module.exports.mongoose = mongoose;


// var path = require('path');
// var knex = require('knex')({
//   client: 'sqlite3',
//   connection: {
//     filename: path.join(__dirname, '../db/shortly.sqlite')
//   }
// });
// var db = require('bookshelf')(knex);

// db.knex.schema.hasTable('urls').then(function(exists) {
//   if (!exists) {
//     db.knex.schema.createTable('urls', function (link) {
//       link.increments('id').primary();
//       link.string('url', 255);
//       link.string('baseUrl', 255);
//       link.string('code', 100);
//       link.string('title', 255);
//       link.integer('visits');
//       link.timestamps();
//     }).then(function (table) {
//       console.log('Created Table', table);
//     });
//   }
// });

// db.knex.schema.hasTable('users').then(function(exists) {
//   if (!exists) {
//     db.knex.schema.createTable('users', function (user) {
//       user.increments('id').primary();
//       user.string('username', 100).unique();
//       user.string('password', 100);
//       user.timestamps();
//     }).then(function (table) {
//       console.log('Created Table', table);
//     });
//   }
// });

// module.exports = db;
