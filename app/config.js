var mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/shortly');

var Schema = mongoose.Schema;
var ObjectId = Schema.ObjectId;

var db = mongoose.connection;

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
module.exports.mongoose = mongoose;
