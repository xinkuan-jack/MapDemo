// 坐标转换
const coordtransform = require('coordtransform');

$(() => {
    //创建地图服务器
    const server = new GMapServer();
    server.type = GMapViews.MAPSERVER;
    server.name = "server";
    server.address = "http://10.0.0.196:8888/QuadServer/maprequest?services=B_vector";
    server.file = "/i.png";
    //创建地图配置
    const point = coordtransform.gcj02towgs84(116.407394, 39.904211);
    const option = new GMapOptions();
    option.center = new GPoint(point[0], point[1]);
    option.zoomLevel = 12;
    option.maxLevel = 17;
    option.minLevel = 5;
    option.miniMap = false;
    option.mapServer = server;
    option.mapProj = " proj=longlat";
    option.mapExtent = "-256, 256, -256, 256";
    // 创建地图对象
    const mapObj = new GMap("myMap", option);
    // 地图功能
    mapObj.showFullScreenBt(false);
    mapObj.showNavigater(false);

    // 地图切换
    const isMap = (event) => {
        const server = new GMapServer();
        server.type = GMapViews.MAPSERVER;
        server.name = event ? "serverImg" : "server";
        server.address = event ? "http://10.0.0.196:8888/QuadServer/maprequest?services=B_raster" : "http://10.0.0.196:8888/QuadServer/maprequest?services=B_vector";
        server.file = "/i.png";
        mapObj.setCustomServer(server);
        mapObj.setMapType([server.name]);
    };

    // 定位标注
    const marker = (event, name, id) => {
        const style = new GStyle();
        style.iconSrc = "images/point.png";
        style.infoWinHtml = "<b>" + name + "</b><br /><img src='http://www.geobeans.cn/images/top_02.gif' width='170' height='100' />";
        style.infoWinType = GMap.HTMLINFOWIN;
        const marker = new GMarker(event, "", style, id);
        return marker;
    };

    // 图片标注
    const newMar = (event, name, img, id) => {
        const style = new GStyle();
        style.iconSrc = img ? "images/marker.png" : "images/newMar.png";
        style.infoWinHtml = "<b>" + name + "</b><br /><img src='http://www.geobeans.cn/images/top_02.gif' width='170' height='100' />";
        style.infoWinType = GMap.HTMLINFOWIN;
        const marker = new GMarker(event, "", style, id);
        return marker;
    };

    // 线性标注
    const polyLine = (event, is, id) => {
        const style = new GStyle();

        style.lineSize = '4';
        if(is){
            style.dashed=true;
            style.lineColor = "7x08090";
            style.maxShownLevel=9;//最大显示级别
        }else {
            style.lineColor = "0x000ff";
        }
        const poly = new GPolylineOverlay(event, style, id);
        mapObj.addOverlay(poly);
    };

    //圆形标注
    const addCircle = (event) => {
        const style = new GStyle();
        style.fillColor = "0x0000ff";
        style.fillOpacity = "30";
        const oCircle = new GCircleOverlay(event, 0.05, style);
        mapObj.addOverlay(oCircle);
    };

    // 获得所有标注的id
    const getOverlayIDs = () => {
        const arr = mapObj.getOverlayIDs();
        return arr;
    };

    // 标记
    const startDrawMarker = () => {
        const markerStyle = new GStyle();
        markerStyle.iconSrc = "images/location.png";
        markerStyle.infoWinHtml = "<b>名称:</b><br /><img src='http://www.geobeans.cn/images/top_02.gif' width='170' height='100' />";
        markerStyle.infoWinType = GMap.HTMLINFOWIN;
        mapObj.startDrawMarker(true, markerStyle);
    };

    //动态地图高度
    $('#myMap').height($(window).height() - 55);
    $(window).resize(() => {
        $('#myMap').height($(window).height() - 55);
    });

    //缩放按键
    $('.max').click(() => {
        let level = mapObj.getZoomLevel();
        if (level < 17) {
            level++;
            mapObj.setZoomLevel(level);
        }
    });
    $('.min').click(() => {
        let level = mapObj.getZoomLevel();
        if (level > 5) {
            level--;
            mapObj.setZoomLevel(level);
        }
    });

    //定位
    const position = (lev) => {
        const pointC = coordtransform.gcj02towgs84(116.377757, 39.993287);
        mapObj.setZoomAndCenter(new GPoint(pointC[0], pointC[1]), lev);
        mapObj.addOverlay(marker(new GPoint(pointC[0], pointC[1]), '北京创业大厦', 'location'));
    };

    //定位按钮
    $('.location').click(() => {
        mapObj.removeAllOverlay();
        position(17);
    });

    // 地图切换
    $('.default').click(function () {
        isMap(false);
        $('.moon').removeClass('weight');
        $(this).addClass('weight')
    });
    $('.moon').click(function () {
        isMap(true);
        $('.default').removeClass('weight');
        $(this).addClass('weight')
    });

    //路况
    $('.road').click(function () {
        $(this).children().toggle();
        if ($(this).children().is(':visible')) {

        }
    });

    //清除标记
    $('.clear').click(() => {
        mapObj.removeAllOverlay();
    });

    // 测距
    $('.ranging').click(() => {
        mapObj.startMeasuringDistance();
    });

    // 标记
    $('.peg').click(() => {
        startDrawMarker();
    });

    // 城市选择
    var cityPicker = new IIInsomniaCityPicker({
        data: cityData,
        target: '#cityChoice',
        valType: 'k-v',
        hideCityInput: '#city',
        callback: function () {
            const myCity = $('#city').val().split('-')[1];
            $.ajax({
                type: "GET",
                url: '/api/config/district',
                data: {
                    keywords: myCity,
                    key: '07e79ad67626d345252023581ba55f30'
                },
                success: function (msg) {
                    const msgPoint = msg.districts[0].center.split(',');
                    const newPoint = coordtransform.gcj02towgs84(msgPoint[0], msgPoint[1]);
                    mapObj.setZoomAndCenter(new GPoint(newPoint[0], newPoint[1]), 12);
                }
            });
        }
    });
    cityPicker.init();

    // 输入提示
    $(document).on('input', '#query', function () {
        const myCity = $('#city').val().split('-')[1] || '北京市';
        if ($(this).val()) {
            $.ajax({
                type: "GET",
                url: '/api/assistant/inputtips',
                data: {
                    keywords: $(this).val(),
                    city: myCity,
                    key: '07e79ad67626d345252023581ba55f30'
                },
                success: function (msg) {
                    $('.prompt').html('').css('display', 'block');
                    $.each(msg.tips, function (i, val) {
                        $('.prompt').append('<div>' + val.name + '</div>')
                    });
                }
            })
        } else {
            $('.prompt').css('display', 'none');
        }
    });
    $(document).on('click', '.prompt > div', function () {
        $('#query').val($(this).html());
        $(this).parent().css('display', 'none');
    });

    //公交路线规划
    const busLine = (ori, des, is) => {
        const myCity = $('#city').val().split('-')[1] || '北京市';
        if (is) {
            $('.undetail').css('display', 'none');
        } else {
            $('.columns').css('display', 'none');
        }
        $('.infor').html('<div class="loading">' +
            '<span></span>正在加载数据，请稍后。。。</div>');
        $.ajax({
            type: "GET",
            url: '/api/direction/transit/integrated',
            data: {
                origin: ori,
                destination: des,
                city: myCity,
                key: '07e79ad67626d345252023581ba55f30'
            },
            success: function (msg) {
                let wakeLine = {};
                let busLine = {};
                let action = {};
                let stop = {};
                if (msg.status == 1) {
                    $('.infor').html('');
                    //生成数据路线
                    $.each(msg.route.transits, function (i, val) {
                        const j = val.segments.length - 1 - 1;
                        //获取出发点名称
                        const departureName = val.segments[0].bus.buslines[0].departure_stop.name;
                        //获取终点名称
                        const arrivalName = val.segments[j].bus.buslines[0].arrival_stop.name;
                        const $cont = '<div class="transits">' +
                            '<div class="cost">票价' + val.cost + '元</div>' +
                            '<div class="duration">' + parseInt(val.duration / 60) + '分钟</div>' +
                            '<div class="walking_distance">步行' + val.walking_distance + '米</div>' +
                            '<div class="busline">' + departureName + '<span>→</span>' + arrivalName + '</div>' +
                            '</div>';
                        $('.infor').append($cont);
                        wakeLine[i] = [];
                        busLine[i] = [];
                        action[i] = [];
                        stop[i] = [];
                        //将方案路线坐标放入数组
                        $.each(val.segments, function (k, item) {
                            $.each(item.walking.steps, function (v, t) {
                                const $data = {
                                    polyline: t.polyline
                                };
                                wakeLine[i].push($data);
                                action[i].push(t.instruction);
                            });
                            if (item.bus.buslines.length != 0) {
                                const prefix = item.bus.buslines[0];
                                const $msg = {
                                    polyline: prefix.polyline
                                };
                                busLine[i].push($msg);
                                action[i].push('由&nbsp;' + prefix.departure_stop.name);
                                action[i].push('乘坐&nbsp;' + prefix.name);
                                action[i].push('到&nbsp;' + prefix.arrival_stop.name + '&nbsp;下车');
                                const $data = {
                                    ori: prefix.departure_stop.location,
                                    oriName: prefix.departure_stop.name,
                                    des: prefix.arrival_stop.location,
                                    desName: prefix.arrival_stop.name
                                };
                                stop[i].push($data);
                            }
                        });
                    });
                    //返回按键
                    // is ? $('.infor').append('<div class="back">返回</div>') : '';
                    //点击方案时按方案路线绘制标注
                    $('.transits').click(function () {
                        // 清除标注
                        var idArr = getOverlayIDs();
                        idArr = $.grep(idArr,function(v){
                           return (v != 'target' && v != 'location');
                        });
                        $.each(idArr,function(i,val){
                            mapObj.removeOverlay(val);
                        });
                        //添加路线标注
                        const item = $(this).index();
                        const wakeArr = wakeLine[item];
                        const busArr = busLine[item];
                        const actionArr = action[item];
                        const stopArr = stop[item];
                        //路线标注
                        $.each(wakeArr, function (i, val) {
                            const ptArr = [];
                            const newLineArr = val.polyline.split(';');
                            $.each(newLineArr, function (k, t) {
                                const point = t.split(',');
                                const newPoint = coordtransform.gcj02towgs84(point[0], point[1]);
                                const pt = new GPoint(newPoint[0], newPoint[1]);
                                ptArr.push(pt);
                            });
                            polyLine(ptArr, true);
                        });
                        $.each(busArr, function (i, val) {
                            const ptArr = [];
                            const newLineArr = val.polyline.split(';');
                            $.each(newLineArr, function (k, t) {
                                const point = t.split(',');
                                const newPoint = coordtransform.gcj02towgs84(point[0], point[1]);
                                const pt = new GPoint(newPoint[0], newPoint[1]);
                                ptArr.push(pt);
                            });
                            polyLine(ptArr);
                        });
                        // polyLine(ptArr, 'polyline');
                        //乘车站标注
                        $.each(stopArr, function (i, val) {
                            const oriPoint = val.ori.split(',');

                            const newOri = coordtransform.gcj02towgs84(oriPoint[0], oriPoint[1]);
                            const desPoint = val.des.split(',');
                            const newDes = coordtransform.gcj02towgs84(desPoint[0], desPoint[1]);
                            const oriPt = new GPoint(newOri[0], newOri[1]);
                            const desPt = new GPoint(newDes[0], newDes[1]);
                            mapObj.addOverlay(newMar(oriPt, val.oriName, false, 'ori'+i));
                            mapObj.addOverlay(newMar(desPt, val.desName, false, 'des'+i));
                        });

                        //添加导航
                        const $action = ('<div class="channel"></div>');
                        $('.transits').children('.channel').remove();
                        $(this).append($action);
                        $.each(actionArr, function (i, val) {
                            $('.channel').append('<div class="way">' + val + '</div>');
                        });
                        $('.channel').append('<div class="way">到达终点</div>');

                        //置顶
                        const $top = $(this).index() * 80;
                        $('.infor').scrollTop($top);
                    });
                }
            }
        })
    };

    // 搜索
    const search = (event) => {
        const myCity = $('#city').val().split('-')[1] || '北京市';
        $('.prompt').css('display', 'none');
        if ($('#query').val()) {
            $('.columns').css('display', 'none');
            $('.infor').html('<div class="loading">' +
                '<span></span>正在加载数据，请稍后。。。</div>');
            $.ajax({
                type: "GET",
                url: '/api/place/text',
                data: {
                    keywords: event ? event : $('#query').val(),
                    city: myCity,
                    key: '07e79ad67626d345252023581ba55f30'
                },
                success: function (msg) {
                    if (msg.status == 1) {
                        $('.infor').html('');
                        // 清除其他标注
                        mapObj.removeAllOverlay();
                        let arr = [];
                        let newArr = [];
                        // 首数据定位
                        const pointOne = msg.pois[0].location.split(',');
                        const newPointOne = coordtransform.gcj02towgs84(pointOne[0], pointOne[1]);
                        mapObj.setZoomAndCenter(new GPoint(newPointOne[0], newPointOne[1]), 12);
                        $.each(msg.pois, function (i, val) {
                            const $und = '<div class="undetail">' +
                                '<div class="detail">' +
                                '<h5>' + val.name + '</h5>' +
                                '<div>' + val.address + '</div>' +
                                '</div>' +
                                '<div class="indetail">' +
                                '<div class="present">' +
                                '<div>' + val.name + '</div>' +
                                '<div>' + val.tel + '</div>' +
                                '<div>' + val.address + '</div>' +
                                '</div>' +
                                '<div class="out">搜周边</div>' +
                                '<div class="come">到这去</div>' +
                                '</div>' +
                                '</div>';
                            // 创建标注
                            const msgPoint = val.location.split(',');
                            const newPoint = coordtransform.gcj02towgs84(msgPoint[0], msgPoint[1]);
                            const gPoint = new GPoint(newPoint[0], newPoint[1]);
                            $('.infor').append($und);
                            arr.push(gPoint);
                            newArr.push(val.location);
                            mapObj.addOverlay(newMar(gPoint, val.name));
                        });
                        // 详情
                        $('.undetail > .detail').click(function () {
                            const id = 'polyMarker';
                            const item = $(this).parent().index();
                            const mapName = $(this).find('h5').html();
                            $('.detail').css('display', 'block');
                            $(this).css('display', 'none');
                            $('.indetail').css('display', 'none');
                            $(this).parent().find('.indetail').css('display', 'block');
                            mapObj.removeOverlay('polyMarker');
                            mapObj.setZoomAndCenter(arr[item], 15);
                            mapObj.addOverlay(newMar(arr[item], mapName, true, id));
                            mapObj.showInfoWindow(id);

                            //置顶
                            const $top = item * 80;
                            $('.infor').scrollTop($top);
                        });
                        //搜周边
                        $('.out').click(function () {
                            // 清除其他标注
                            mapObj.removeAllOverlay();
                            const item = $(this).parent().parent().index();
                            const mapName = $(this).parent().parent().find('h5').html();
                            mapObj.setZoomAndCenter(arr[item], 14);
                            mapObj.addOverlay(newMar(arr[item], mapName, true));
                            $.ajax({
                                type: "GET",
                                url: '/api/place/around',
                                data: {
                                    location: newArr[item],
                                    key: '07e79ad67626d345252023581ba55f30'
                                },
                                success: function (msg) {
                                    addCircle(arr[item]);
                                    $.each(msg.pois, function (i, val) {
                                        const mapName = val.name + '<br>' + val.address;
                                        const point = val.location.split(',');
                                        const newPoint = coordtransform.gcj02towgs84(point[0], point[1]);
                                        mapObj.addOverlay(newMar(new GPoint(newPoint[0], newPoint[1]), mapName));
                                    });
                                }
                            });
                        });
                        //到这去
                        $('.come').click(function () {
                            // 清除其他标注
                            mapObj.removeAllOverlay();
                            const item = $(this).parent().parent().index();
                            const mapName = $(this).parent().parent().find('h5').html();
                            const point = '116.377757,39.993287';
                            mapObj.setZoomAndCenter(arr[item], 12);
                            mapObj.addOverlay(newMar(arr[item], mapName, true, 'target'));
                            position(12);
                            busLine(point, newArr[item], true);
                        });
                    }
                }
            })
        }
    };

    // //返回按键
    // $(document).on('click', '.back', function () {
    //     search()
    // });

    //回首页
    $(document).on('click', '.home > .ico', function () {
        $('.infor').html('');
        $('.columns').css('display', 'block');
        mapObj.removeAllOverlay();
    });

    //手动搜索
    $(document).on('click', '.search .put', function () {
        search();
    });

    //友情链接搜索
    $(document).on('click', '.part-on', function () {
        $('.default > a').trigger("click");
        const that = $(this);
        setTimeout(function () {
            const cont = that.text();
            $('#query').val(that.text());
            $('.cue').css('display', 'none');
            search(cont);
        }, 100);
    });
    $(document).on('click', '.friendlink a', function () {
        $('.default > a').trigger("click");
        const $normal = $(this).parent().hasClass('normal');
        const that = $(this);
        var cont;
        setTimeout(function () {
            if($normal){
                cont = that.text();
            }else{
                cont = that.html() + that.parent().siblings().text();
            }
            $('#query').val(that.html());
            $('.cue').css('display', 'none');
            search(cont);
        }, 100);
    });

    //获取位置
    const loaction = (event, is, id) => {
        const myCity = $('#city').val().split('-')[1] || '北京市';
        let arr = [];
        $.ajax({
            type: "GET",
            url: '/api/geocode/geo',
            data: {
                address: event,
                city: myCity,
                key: '07e79ad67626d345252023581ba55f30'
            },
            success: function (msg) {
                arr.push(msg.geocodes[0].location);
                const point = msg.geocodes[0].location.split(',');
                const act = coordtransform.gcj02towgs84(point[0], point[1]);
                if (is) {
                    mapObj.addOverlay(newMar(new GPoint(act[0], act[1]), event, true, id));
                    mapObj.setZoomAndCenter(new GPoint(act[0], act[1]), 14);
                } else {
                    mapObj.addOverlay(newMar(new GPoint(act[0], act[1]), event, false, id));
                }
            }
        });
        return arr;
    };

    // 公交
    $(document).on('click', '.bus-input', function () {
        // 清除其他标注
        mapObj.removeAllOverlay();
        //获取起点位置
        const from = loaction($('#from').val(), true, 'location');
        //获取终点位置
        const to = loaction($('#to').val(), false, 'target');
        // 调用服务
        setTimeout(function () {
            busLine(from[0], to[0]);
        }, 1000)
    });

    // 自驾
    $(document).on('click', '.driving-input', function () {
        // 清除其他标注
        mapObj.removeAllOverlay();
        $('.infor').html('<div class="loading">' +
            '<span></span>正在加载数据，请稍后。。。</div>');
        $('.columns').css('display', 'none');
        //获取起点坐标
        const from = loaction($('#from').val(), true);
        // 获取终点坐标
        const to = loaction($('#to').val());
        //获取途经点坐标
        const mid = loaction($('#mid').val());
        // 调用服务
        setTimeout(function () {
            const data = {
                origin: from[0],
                destination: to[0],
                key: '07e79ad67626d345252023581ba55f30'
            };
            if(mid){
                data.waypoints = mid[0];
            }
            $.ajax({
                type: "GET",
                url: '/api/direction/driving',
                data: data,
                success: function (msg) {
                    if (msg.status == 1) {
                        $('.infor').html('');
                        // 创建导航路线
                        const $cont = '<div class="paths">' +
                            '<div class="ico">推荐</div>' +
                            '<div class="distance">' + msg.route.paths[0].distance / 1000 + '公里</div>' +
                            '<div class="duration">' + parseInt(msg.route.paths[0].duration / 60) + '分钟</div>' +
                            '<div class="taxi_cost">打车约' + parseInt(msg.route.taxi_cost) + '元</div>' +
                            '</div>';
                        $('.infor').html($cont);
                        let arr = [];
                        // 将路径点放入数组
                        $.each(msg.route.paths[0].steps, function (i, val) {
                            $('.infor').append('<div class="action">' + val.instruction + '</div>');
                            const pointLine = val.polyline.split(';');
                            $.each(pointLine, function (k, item) {
                                const point = item.split(',');
                                const newPoint = coordtransform.gcj02towgs84(point[0], point[1]);
                                const pt = new GPoint(newPoint[0], newPoint[1]);
                                arr.push(pt);
                            });
                        });
                        // 调用路径点绘制标注
                        polyLine(arr);
                    }
                }
            })
        }, 1000)
    });
})
;

