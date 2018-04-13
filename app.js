const Koa  = require('koa');
const Router = require('koa-router');
const fs = require('fs');   //fs path node自带不用安装
const path = require('path');
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
app.use(koaBody({multipart:true}));     //koabody支持上传的话要设置一个参数
app.use(router.routes()).use(router.allowedMethods());

//托管静态文件
app.use(staticServer(__dirname +'/view'));  //__dirname文件的绝对路径

// router.get('/',(ctx,next) => {
//   console.log(ctx.query);
//   ctx.body = 'The server already start.';
// });

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


//1、后端接口
router.post('/api/news/save',async (ctx,next) =>{   ///api/news/save    后端接口接收数据
  //async 声明是异步函数，里面存着异步的东西
  // 数据写入数据库的时候受网络网速的影响，磁盘读取的快慢的影响。
  //await告诉它等待写完后再把写入数据的结果返回给res
  const payload =ctx.request.body;  //2、接收数据
  const data = {
    title:payload.title,
    content: payload.content,
    img: payload.img,
    author: payload.author,
    createdTime: Date.now()   //保存时间戳
  }//3、拼装成数据库要的格式
  const res = await News.create(data);   //4、然后创建到数据库里面  News是news.model.js定义好的数据库对象   res=>返回结果
  if(!res) {
    ctx.body={code:9999,msg:'保存失败！'};
    return;
  }
  //创建完后返回结果，返回后就把数据返回给前端
  ctx.body = {
    code:10000,
    data:res,    //5、将结果返回给前端
    msg:'保存成功！'
  }
});


//作为后端写了一个获取文章的接口
router.get('/api/article/list',async(cxt,next) =>{

  const payload = cxt.query;
  const keyword = payload.value;   //搜索   通过字段拿到前端传过来的关键字
  const cond = {};
  if(keyword){
    cond.title = new RegExp(keyword,'i');  //模糊查询   正则
    // cond.title = keyword;    完全匹配才搜到 （用于会计 身份证 记账 借据 编号） => 精准查找
  }
  //有人搜索时
  //把参数cond改成对象  根据情况去捕抓数据
  //  cond={
  //    title:keyword
  //  }
  // cond 为空的时候 === finde({})没人搜索的时候，把所有文章显示出来
  const list = await News.find(cond);  //等获取到数据后赋值给列表list
  cxt.body={  //返回回去
    code:10000,
    data:{
      list:list || []
    },
    msg:'请求成功！'
  }
})

//查询单条数据   例如 http://127.0.0.1:8080/api/article/get?id=5ac9778d83887918f405f720
router.get('/api/article/get',async(cxt,next) =>{
  const params = cxt.query;  //获取url传过来的数据   赋值给一个对象
  console.log(params);


  const doc = await News.findOne({
    _id:params.id    //对象id传给一个字段_id（对应数据库里面的表里的字段一一对应）
  });  //等获取到数据后赋值给列表list
  cxt.body={  //返回回去
    code:10000,
    data:doc,
    msg:'请求成功！'
  }
});


//删除
//npmjs官网    查询 koa-router  delete如何使用
router.del('/api/article/:id',async(cxt,next) =>{
  const params = cxt.params;  //获取url传过来的数据   赋值给一个对象
  console.log(params);


  const result = await News.deleteOne({   //查看mongo官方文档删除的方法
    _id:params.id    //对象id传给一个字段_id（对应数据库里面的表里的字段一一对应）
  });  //等获取到数据后赋值给列表list

  if (result && result.n ===1){
    cxt.body={  //返回回去
      code: 10000,
      data: result,
      msg: '删除成功！'
    }
  }else {
    cxt.body={  //返回回去
      code: 9999,
      data: null,
      msg: '删除失败！'
    }
  }

});



//定义修改文章的接口
router.post('/api/news/edit',async (ctx,next) =>{

  const payload =ctx.request.body;  //post 接收数据
  const id = payload.id;  //传id => 修改某条数据
  const result = await News.findOneAndUpdate({ _id:id },payload,{new:true});  //条件：{_id:id}  通过_id找到相应的文章  然后把修改后的内容填写进来
    //result =>修改后的内容
  if(!result) {
    ctx.body={code:9999,msg:'修改失败！'};
    return;
  }
  //创建完后返回结果，返回后就把数据返回给前端
  ctx.body = {
    code:10000,
    data:result,    //将结果返回给前端
    msg:'修改成功！'
  }
});

//上传文件的接口
router.post('/api/files/upload',async (ctx,next) =>{
  const payload = ctx.request.body;//   查看payload 结构
  // console.dir(payload);
  const img = payload.files.img;
  //引入fs path两个模块
  const readForm = fs.createReadStream(img.path);   //创建一个文件流，从img.path读取
  // const extname = path.extname(img.name);     //从文件名img.name拿到拓展名

  const savePath = path.join('/upload/',img.name);              //    /upload/xxxxx.jpg   join() => 规范路径
  const saveDir = path.join('./view/',savePath);

  const fileStream = fs.createWriteStream(saveDir);     //把文件流写入指点地方的路径
  readForm.pipe(fileStream);  //通过管道往指点的地方写文件流
  readForm.on('end',function(ret){     //当文件写完时，给前端一个响应（文件上传完成）
    console.log(ret);
  })


  ctx.body = {
    code:10000,
    data:{
        fileUrl:savePath
    },
    msg:'上传成功！'
  }
});


//监听服务端口
app.listen(port, () => {
  console.log('the app start at port:',port);
})
