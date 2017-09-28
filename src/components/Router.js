$(function () {
    // 搜索框
    $(document).on('focus', '#query', function () {
        $('.cue').css('display', 'none');
    }).on('blur', '#query', function () {
        if (!$(this).val()) {
            $('.cue').css('display', 'block');
        }
    });

    // 公家自驾
    $(document).on('focus', '.from', function () {
        $(this).children('label').css('display', 'none');
    }).on('blur', '.from', function () {
        if (!$('#from').val()) {
            $(this).children('label').css('display', 'block');
        }
    });
    $(document).on('focus', '.to', function () {
        $(this).children('label').css('display', 'none');
    }).on('blur', '.to', function () {
        if (!$('#to').val()) {
            $(this).children('label').css('display', 'block');
        }
    });
    $(document).on('focus', '.mid', function () {
        $(this).children('label').css('display', 'none');
    }).on('blur', '.mid', function () {
        if (!$('#mid').val()) {
            $(this).children('label').css('display', 'block');
        }
    });

    // 交换数据
    $(document).on('click', '.exchange', function () {
        let newNum = $('#from').val();
        $('#from').val($('#to').val());
        $('#to').val(newNum);
    });
    $(document).on('click', '.query-tool', function () {
        $('.default > a').click();
    });

    // 自驾途经
    var Count = function () {
        this.isShow = false;
    };
    Count.prototype = {
        add: function (event) {
            this.isShow = true;
            let $dv = $('<div class="mid">' +
                '<span>经</span>' +
                '<label for="mid">请输入途经点</label>' +
                '<input type="text" id="mid" autocomplete="off">' +
                '<div class="addsub"></div>' +
                '</div>');
            event.parent().after($dv);
        },
        del: function (event) {
            this.isShow = false;
            event.parent().remove();
        },
        isCount: function (event) {
            if (this.isShow) {
                event.css('display', 'none');
            } else {
                event.css('display', 'block');
            }
        }
    };
    var addsub = new Count();
    $(document).on('click', '.add', function () {
        addsub.add($(this));
        addsub.isCount($(this));
    });
    $(document).on('click', '.addsub', function () {
        addsub.del($(this));
        addsub.isCount($('.add'));
    });
});