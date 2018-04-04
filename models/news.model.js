const mongoose = require('mongoose');

const Schema = mongoose.Schema;


//定义数据库的数据结构
const News = new Schema({
  title:String,
  content:String,
  createdTime:Number
});

var NewsModel = mongoose.model('blog_news',News);//News定义好的数据模型放进去

module.exports = NewsModel;  //将定义好的NewsModel数据模型导出去
