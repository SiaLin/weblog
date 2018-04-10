
$(document).ready(function(e){
  $('.search-case').click(function(e){
    $('.site-search').toggleClass('search-show')
    $(this).toggleClass('icon-search').toggleClass('icon-close');
  });

  var oSj = 5000;
  var i = 0;
  var bar = $(".banner-box .bar");
  var oImg = $(".banner-box .img"); //获取图片盒子
  var oImgfirst = $('.banner-box .img li:first').clone(); //复制第一张图片
  oImg.append(oImgfirst); //将复制的第一张图片放到最后
  var imgNum = $(".banner-box .img li").size(); //获取图片数量

  //根据图片个数添加圆点按钮
  for (var j = 1; j <= imgNum - 1; j++) {
      $('.banner-box .li').append('<li></li>');
  }

  //给第一个按钮添加选中样式
  $('.banner-box .li li:first').addClass('index');


  //点击向右轮播
  $(".but-right").click(function() {
      int();
  });

  //点击向左轮播
  $(".but-left").click(function() {
      bar.stop().css('width', 0);
      i--;
      if (i == -1) {
          $('.banner-box .img').css('left', -(imgNum - 1) * 820); //用CSS进行图片位置变换，达到无缝拼接效果
          i = imgNum - 2;
      }
      oImg.stop().animate({
          left: -i * 820
      }, 500); //动画效果
      clearInterval(oTime);
      oTime = setInterval(function() {
          int();
      }, oSj);
      barAniMate(); //进度条函数动画效果
      $(".banner-box .li li").eq(i).addClass('index').siblings().removeClass('index'); //给相应的按钮添加样式
  });

  //鼠标移动到圆点后轮播
  $(".banner-box .li li").hover(function() {
      clearInterval(oTime); //清除定时器
      bar.stop().css('width', 0);
      var index = $(this).index();
      i = index;
      oImg.stop().animate({
          left: -index * 820
      }, 500); //动画效果
      bar.stop().css('width', 0);
      $(this).addClass('index').siblings().removeClass('index'); //给相应的按钮添加样式
  }, function() {
      barAniMate(); //进度条函数动画效果
      oTime = setInterval(function() {
          int();
      }, oSj);
  });

  //自动轮播
  var oTime = setInterval(function() {
      int();
  }, oSj);

  barAniMate(); //进度条函数动画效果

  //进度条函数动画效果
  function barAniMate() {
      bar.animate({
          width: '100%'
      }, oSj, function() {
          $(this).css('width', 0);
      });
  }

  //自动轮播函数
  function int() {
      bar.stop().css('width', 0);
      i++;
      if (i == imgNum) {
          oImg.css('left', 0); //用CSS进行图片位置变换，达到无缝拼接效果
          i = 1;
      }
      oImg.stop().animate({
          left: -i * 820
      }, 500); //动画效果
      barAniMate(); //进度条函数动画效果
      clearInterval(oTime);
      oTime = setInterval(function() {
          int();
      }, oSj);
      if (i == imgNum - 1) {
          $(".banner-box .li li").eq(0).addClass('index').siblings().removeClass('index'); //给相应的按钮添加样式

      } else {
          $(".banner-box .li li").eq(i).addClass('index').siblings().removeClass('index'); //给相应的按钮添加样式
      }
  }

  // 请求首页文章列表
  function getList(){
    $.ajax({
      url:'/api/article/list',   //后端获取文章的接口
      type:'get',                //类型get请求
      success: function(res){     //请求成功执行
        if(res && res.code === 10000){
          var list = res.data.list || [];   //如果list没有那拿就把空数组【】赋给list   异常考虑
        // console.log(list);
        //把列表渲染到页面中     es6模板字符串语法（拼接字符串）
        renderList(list);
        }
      },
      error:function(err){        //请求出错执行
        console.log(err)
      }
    })
  }

  getList();


  //把列表渲染到页面中的方法独立出来 => renderList方法    es6模板字符串语法（拼接字符串）
    function renderList(list){
      var liHTML = '';   //定义空标签
      for (let i = 0; i < list.length; i++) {  //for循环
        var item = list[i];  //每一个具体的文章

        //原始拼接字符串的方法
        // liHTML +=`<li>`+
        //   `<img class="article-thumbnail flt" src="images/timg-220x150.jpg" alt="">`+
        //   `<div class="article-info">`+
        //     `<h2 class="title mb-15">`+
        //       `<a href="" class="cat">`+(item.author || '未知')+
        //         `<i class="icon-arrow"></i>`+
        //       `</a>`+
        //       `<a href="" class="title-link">`+item.title+`</a>`+
        //     `</h2>`+
        //     `<div class="meta">`+
        //       `<i class="icon-time">`+item.createdTime+`</i>`+   // 时间戳   时间戳转时间（百度）
        //       `<i class="icon-user">`+(item.author || '未知')+`</i>`+
        //     `</div>`+
        //     `<div class="desc">`+item.content+`</div>`+
        //   `</div>`+
        // `</li>`
        // es6拼接字符方法
        liHTML += `<li>
                        <img class="article-thumbnail flt" src="images/timg-220x150.jpg" alt="">
                        <div class="article-info">
                          <h2 class="title mb-15">
                            <a href="" class="cat">${item.author || '未知'}<i class="icon-arrow"></i>
                            </a>
                            <a href="/detail.html?id=${item._id}" class="title-link">${item.title}</a>
                          </h2>
                          <div class="meta">
                            <i class="icon-time">${item.createdTime}</i>
                            <i class="icon-user">${item.author || '未知'}</i>
                          </div>
                          <div class="desc">${item.content}</div>
                        </div>
                    </li>`
      }
      // console.log(liHTML);
      $("#listBox").empty().append(liHTML);//先清空再将相关的文章添加到列表中   添加到页面中
    }


//搜索关键字
  function onSearch(){
    $("#btnSearch").on('click',function(ev){
          getSearch();
    });
    $(document).on('keyup',function(ev){    //keyup 按下键盘   13=> enter
      ev.preventDefault();
          if(ev.keyCode === 13){     //按enter进行搜索
            getSearch();
          }
          return;
          //enter  form标签  按enter/提交 会发生跳转事件（无论有没有action）
          //现阶段把form改为div   (还没解决form默认跳转事件的)
    });
    //搜索关键词后   清空搜索框后显示数据库中所有文章
    $('#searchBox').on('input',function(ev){  //  jquery 的input事件  内容区域发生变化时运行回调函数
      var val = $(this).val();
      if(val === ''){
        getList();
      }
    });
  }


//获取关键字并搜索相关的文章标题    getSearch()方法
    function getSearch(){
      var keyword = $('#searchBox').val();
      $.ajax({
        url:'/api/article/list',
        type:'get',
        data:{
          value:keyword   //value 是后端人员定的    把关键字keyword传给字段value
        },
        success:function(res){
          if(res && res.code === 10000){
            var list = res.data.list || [];   //如果list没有那拿就把空数组【】赋给list   异常考虑
          // console.log(list);   文章列表
          //把列表渲染到页面中     es6模板字符串语法（拼接字符串）
          renderList(list);
          }
        },
        error:function(err){
          console.log(err);
        }
      })
    }


    onSearch();

});
