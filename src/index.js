// 引入样式
require('./styles/base.less');
require('./styles/header.less');
require('./styles/master.less');
require('./styles/router.less');
// 引入模块
require('./components/Map');
require('./components/Router');

$(function () {

    // 头部下拉框  PS：此处有坑，当使用箭头函数时，this指向发生变化，$(this)无法找到原目标
    $('.wrap , .wrap-more').mouseenter(function () {
        $(this).children('.list').stop().show();
    }).mouseleave(function () {
        $(this).children('.list').stop().delay(200).hide(0);
    });

    // 侧边栏箭头
    let current = 0;
    $('.pull').on('click', function () {
        if (current === 0) {
            current = 1;
            $(this).children('span').css('background-position-x', '-52px');
            $(this).parents('.sidebar').animate({marginLeft: '-381px'}, 150);
        } else {
            current = 0;
            $(this).children('span').css('background-position-x', '-46px');
            $(this).parents('.sidebar').animate({marginLeft: '0'}, 150);
        }
    });

    //路由系统
    $.sammy('.service', function () {
        this.get('#/', function () {
            this.partial('./views/search.html');
        });
        this.get('#/bus', function () {
            this.partial('./views/bus.html');
        });
        this.get('#/driving', function () {
            this.partial('./views/driving.html');
        });
        this.get('#/favorite', function () {
            this.partial('./views/favorite.html');
        });
    }).run('#/');

    // 默认点击
    // $("#base").click();
    $('#base').trigger("click");

    // 点击时的特效
    $('.route').click(function () {
        $(this).addClass('under').append($('<span></span>'));
        $(this).siblings().removeClass('under').children('span').remove();
    });

    // 渲染页面的动态高度
    $('.render').height($(window).height() - 55);
    $(window).resize(() => {
        $('.render').height($(window).height() - 55);
    });

});

