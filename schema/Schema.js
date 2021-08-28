const mongoose = require('mongoose');
const Schema = mongoose.Schema;


const blogSchema = new mongoose.Schema({
  _id: mongoose.Schema.Types.ObjectId,
  name: String, 
  message: String,
  email: String,
  subject: String,
  image: [{type:String}],
  status: {type: String, default: 'active'},
  created: { type: Date, default: Date.now },
  modified: { type: Date, default: Date.now }

});
const postSchema = new mongoose.Schema({
  _id: mongoose.Schema.Types.ObjectId,
  title: String,
  slug:String,
  paragraph: String,
  category: [String],
  image: [String],
  status: {type: String, default: 'active'},
  seo_title: String,
  seo_keyword: String,
  seo_description: String,
  created: {type: Date, default: Date.now },
  modified: { type: Date, default: Date.now}

});
const categorySchema = new mongoose.Schema({
  _id: mongoose.Schema.Types.ObjectId,
  categoryTitle: String,
  description: String,
  created: {type: Date, default: Date.now },
  modified: { type: Date, default: Date.now}

});
const userSchema = new mongoose.Schema({
  _id: mongoose.Schema.Types.ObjectId,
  name: String,
  email: { type: String, required: true, index: { unique: true } },
  password: { type: String, required: true },
  status: { type: String, default:'deActive'},
  token: { type: String },
})
module.exports.UserModal = mongoose.model('User',userSchema)

module.exports.CategoryModal = mongoose.model('Category',categorySchema)

module.exports.PostModal = mongoose.model('Post',postSchema);

module.exports.BlogModal = mongoose.model('Blog',blogSchema); 