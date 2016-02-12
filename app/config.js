var mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/shortly');
var db = mongoose.connection;
var Promise = require('bluebird');

var Schema = mongoose.Schema;
var ObjectId = Schema.ObjectId;

var crypto = require('crypto');
var bcrypt = require('bcrypt-nodejs');


db.on('error', console.error.bind(console, 'connection error:'));

var linkSchema = new Schema({
  id: ObjectId,
  url: String,
  baseUrl: String,
  code: String,
  title: String,
  visits: {type: Number, default: 0},
  timestamps: Date
});

linkSchema.pre('save', function(next) {
  var shasum = crypto.createHash('sha1');
  var copiedUri = this.url;
  shasum.update(copiedUri);
  this.code = shasum.digest('hex').slice(0, 5);
  next();
});


var userSchema = new Schema({
  id: ObjectId,
  username: String,
  password: String,
  timestamps: Date
});

userSchema.methods.initialize = function() {
  this.on('creating', this.hashPassword);
};

userSchema.pre('save', function(next) {
  this.hashPassword();
  next();
});

userSchema.methods.comparePassword = function(attemptedPassword, callback) {
  bcrypt.compare(attemptedPassword, this.get('password'), function(err, isMatch) {
    callback(isMatch);
  });
};

userSchema.methods.hashPassword = function() {
  var cipher = Promise.promisify(bcrypt.hash);
  return cipher(this.password, null, null).bind(this)
    .then(function(hash) {
      this.password = hash;
    });
};

var Link = mongoose.model('Link', linkSchema);
var User = mongoose.model('User', userSchema);

module.exports.Link = Link;
module.exports.User = User;
module.exports.mongoose = mongoose;
