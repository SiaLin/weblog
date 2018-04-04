const Koa  = require('koa');
const Router = require('koa-router');
const koaBody = require('koa-body');
const staticServer = require('koa-static');  //托管静态文件
const mongoose = require('mongoose');  //连接mongodb的数据驱动包
mongoose.connect('mongodb://127.0.0.1:27017/weblog');

const app = new Koa();
const router = new Router();
const port = 8080;

// 引进定义好的model
const News = require('./models/news.model');


//router  中间键：作为请求和处理的一些插件
//为何能够轻松定义api，路由    因为引用了koa-router包
app.use(koaBody());
app.use(router.routes()).use(router.allowedMethods());
app.use(staticServer(__dirname +'/view'));  //__dirname文件的绝对路径

router.get('/',(ctx,next) => {
  console.log(ctx.query);
  ctx.body = 'The server already start.';
});

router.get('/api/getList',(ctx,next) =>{
  ctx.body = {
    code:10000,
    data:[
      {name:'mc',sex:1},
      {name:'密室',sex:1},
      {name:'周一',sex:2}
    ],
    msg:'请求成功！'
  }
});

router.post('/api/news/save',async (ctx,next) =>{   ///api/news/save    后端接口接收数据
  //async 声明是异步函数，里面存着异步的东西
  // 数据写入数据库的时候受网络网速的影响，磁盘读取的快慢的影响。
  //await告诉它等待写完后再把写入数据的结果返回给res
  const payload =ctx.request.body;  //
  const data = {
    title:payload.title,
    content: payload.content,
    createdTime: Date.now()   //保存时间戳
  }
  const res = await News.create(data);   //拼装成数据库要的格式，然后创建到数据库里面
  if(!res) {
    ctx.body={code:9999,msg:'保存失败！'};
    return;
  }
  //创建完后返回结果，返回后就把数据返回给前端
  ctx.body = {
    code:10000,
    data:res,
    msg:'保存成功！'
  }
});

app.listen(port, () => {
  console.log('the app start at port:',port);
})
