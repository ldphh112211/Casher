/// <reference path="/Scripts/jquery-vsdoc.js" />
/// <reference path="/Scripts/kendo.all-vsdoc.js" />
/// <reference path="/Scripts/engine.js" />

(function () {
    var init = function () {
        //商品购物清单
        var arr = new Array("ITEM000001", "ITEM000001", "ITEM000001", "ITEM000001", "ITEM000001", "ITEM000003-2", "ITEM000005", "ITEM000005", "ITEM000005");
        $(".getpay").click(function () {
            //初始化购物清单
            $(".productlist,.result").empty();
            $(".activitysales").remove();
            $.postAJson({ sales: $("#salesact").prop("checked"), send: $("#sendact").prop("checked"), data: $.toJSON(arr) }, "Calculate", function (rs) {
              
                //bind data
                if (rs.status === 0) {
                    //请求成功
                    $.each(rs.data.casherlist, function () {
                        var div = $('<div class="row"><div class="col-30 ptitle"></div><div class="col-15 pcount"></div><div class="col-15 pprice"></div><div class="col-25 ptotal"></div><div class="col-15 pdiscount">&nbsp;</div></div>');
                        div.find(".ptitle").text(this.name);
                        div.find(".pcount").text(this.count + this.type);
                        div.find(".pprice").text(this.price.toFixed(2));
                        div.find(".ptotal").text(this.total.toFixed(2));
                        if (this.discount != "") {
                            div.find(".pdiscount").text(this.discount.toFixed(2));
                        }
                        $(".productlist").append(div);
                    });
                    if (rs.data.title != "" && rs.data.aclist.length > 0) {
                        //绑定赠送活动优惠信息
                        var ndiv = $('<div class="activitysales"><div class="row">-------------------------------</div><div class="row"><div class="col-100"><span>' + rs.data.title + '活动：</span></div></div><div class="sendlist"></div></div>');
                        $(".result").before(ndiv);
                        $.each(rs.data.aclist, function () {
                            var childrow = $('<div class="row"><div class="col-50 ptitle"></div><div class="col-20 pcount"></div></div>');
                            childrow.find(".ptitle").text(this.name);
                            childrow.find(".pcount").text(this.count + this.type);
                            $(".sendlist").append(childrow);
                        });

                    }
                    var res = '<div class="row">-------------------------------</div>';
                    res += '<div class="row"><div class="col-100">总计：' + rs.data.totalprice.toFixed(2) + '(元)</div></div>';
                    if (rs.data.discountprice != "") {
                        res += '<div class="row"><div class="col-100">节省：' + rs.data.discountprice.toFixed(2) + '(元)</div></div>';
                    }
                    res += '<div class="row">***********************************</div>';
                    $(".result").append(res);
                }
                else {
                   alert(rs.message);
                }
            });
            return false;
        });


    };
    $(function () {
        init();
    });
})();