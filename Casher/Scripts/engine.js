/// <reference path="jquery.vsdoc.js" />

(function () {
    //#region 短时间内过滤相同请求
    //	var currentRequests = [];
    //	var removeRequests = function (jqXHR) {
    //		$.each(currentRequests, function (i) {
    //			if (this == jqXHR.data) currentRequests.remove(i);
    //		});
    //	};
    //	Array.prototype.remove = function (dx) {
    //		if (isNaN(dx) || dx > this.length) { return false; }
    //		for (var i = 0, n = 0; i < this.length; i++) {
    //			if (this[i] != this[dx]) {
    //				this[n++] = this[i];
    //			}
    //		}
    //		this.length--;
    //	}
    //	$.ajaxPrefilter(function (options, originalOptions, jqXHR) {
    //		var ditto = false;
    //		$.each(currentRequests, function () {
    //			if (this == options.data) ditto = true;
    //		});
    //		if (ditto) jqXHR.abort();
    //		else {
    //			currentRequests[currentRequests.length] = options.data;
    //			jqXHR.data = options.data;
    //		}

    //		var complete = options.complete;
    //		options.complete = function (jqXHR, textStatus) {
    //			removeRequests(jqXHR);
    //			if ($.isFunction(complete)) complete();
    //		};

    //		var error = options.error;
    //		options.error = function (jqXHR, textStatus) {
    //			removeRequests(jqXHR);
    //			if ($.isFunction(error)) error();
    //		};

    //	});
    //#endregion
    jQuery.extend({
        //同步ajax提交
        postJson: function (data, url, callback, timeout) {
            $.postData(url, false, "json", data, callback, timeout);
        },
        //异步ajax提交
        postAJson: function (data, url, callback, timeout) {
            $.postData(url, true, "json", data, callback, timeout);
        },
        //提交数据
        postData: function (url, async, dataType, data, callback, timeout) {
            url = "/ajax/" + url;
            $.ajax({
                type: "POST",
                url: url,
                async: async,
                cache: false,
                timeout: timeout != undefined ? timeout : 10000,
                data: data,
                dataType: dataType,
                success: callback,
                statusCode: {
                    301: function () {
                        window.location.href = '/default.aspx';
                    },
                    500: function () {
                        alert("系统运行错误请与管理员联系");
                    }
                }
            });
        },
        cookie: function (key, value, options) {
            if (arguments.length > 1 && (!/Object/.test(Object.prototype.toString.call(value)) || value === null || value === undefined)) {
                options = $.extend({}, options);

                if (value === null || value === undefined) {
                    options.expires = -1;
                }

                if (typeof options.expires === 'number') {
                    var days = options.expires, t = options.expires = new Date();
                    t.setDate(t.getDate() + days);
                }

                value = String(value);

                return (document.cookie = [
                    encodeURIComponent(key), '=', options.raw ? value : encodeURIComponent(value),
                    options.expires ? '; expires=' + options.expires.toGMTString() : '',
                    options.path ? '; path=' + options.path : '',
                    options.domain ? '; domain=' + options.domain : '',
                    options.secure ? '; secure' : ''
                ].join(''));
            }

            options = value || {};
            var decode = options.raw ? function (s) { return s; } : decodeURIComponent;

            var pairs = document.cookie.split('; ');
            for (var i = 0, pair; pair = pairs[i] && pairs[i].split('=') ; i++) {
                if (decode(pair[0]) === key) return decode(pair[1] || '');
            }
            return null;
        },
        toJSON: function (object) {
            var type = typeof object;
            if ('object' == type) {
                if (Array == object.constructor)
                    type = 'array';
                else if (RegExp == object.constructor)
                    type = 'regexp';
                else
                    type = 'object';
            }
            switch (type) {
                case 'undefined':
                case 'unknown':
                    return;
                    break;
                case 'function':
                case 'boolean':
                case 'regexp':
                    return object.toString();
                    break;
                case 'number':
                    return isFinite(object) ? object.toString() : 'null';
                    break;
                case 'string':
                    return '"' + object.replace(/(\\|\")/g, "\\$1").replace(/\n|\r|\t/g, function () {
                        var a = arguments[0];
                        return (a == '\n') ? '\\n' : (a == '\r') ? '\\r' : (a == '\t') ? '\\t' : ""
                    }) + '"';
                    break;
                case 'object':
                    if (object === null)
                        return 'null';
                    var results = [];
                    for (var property in object) {
                        var value = jQuery.toJSON(object[property]);
                        if (value !== undefined)
                            results.push(jQuery.toJSON(property) + ':' + value);
                    }
                    return '{' + results.join(',') + '}';
                    break;
                case 'array':
                    var results = [];
                    for (var i = 0; i < object.length; i++) {
                        var value = jQuery.toJSON(object[i]);
                        if (value !== undefined)
                            results.push(value);
                    }
                    return '[' + results.join(',') + ']';
                    break;
            }
        },
        isEmpty: function (value) {
            if (value === "" || value === null || value === undefined) return true;
            else return false;
        },
        confirm: function (options) {
            var defaultOptions = {
                message: "",
                title: "信息",
                btnConfirm: false,
                btnCancel: true,
                confirm: { text: "确定", callback: null },
                cancel: { text: "关闭", callback: function () { kendo.Confirm.close(); } },
                template: null
            };
            if ('string' == typeof options) defaultOptions.message = options;
            else defaultOptions = $.extend(defaultOptions, options);

            if (kendo.Confirm) kendo.Confirm.destroy();
            var html = $("<div></div>");
            var btns = $('<div class="fright"></div>');
            if (defaultOptions.template) html.append(template);
            else {
                html.append('<div style="height:60%;margin:8px;overflow:hidden;">' + defaultOptions.message + '</div>');
            }
            if (defaultOptions.btnConfirm) {
                var a = $('<a href="#" class="k-button k-button-icontext k-grid-update"><span class="k-icon k-update"></span>' + defaultOptions.confirm.text + '</a>');
                a.click(function () { if (defaultOptions.confirm.callback) defaultOptions.confirm.callback(); });
                btns.append(a);
                btns.append("<span>&nbsp;&nbsp;</span>");
                html.append(btns);
            }
            if (defaultOptions.btnCancel) {
                var b = $('<a href="#" class="k-button k-button-icontext k-grid-cancel"><span class="k-icon k-cancel"></span>' + defaultOptions.cancel.text + '</a>');
                b.click(function () { if (defaultOptions.cancel.callback) defaultOptions.cancel.callback(); });
                btns.append(b);
                html.append(btns);
            }

            kendo.Confirm = html.kendoWindow({
                modal: true,
                width: 400,
                visable: false,
                resizable: false,
                title: defaultOptions.title
            }).data("kendoWindow");
            kendo.Confirm.center().open();
        },
        confirmok: function (options) {
            var defaultOptions = {
                message: "",
                title: "信息",
                btnConfirm: true,
                btnCancel: true,
                confirm: { text: "确定", callback: null },
                cancel: { text: "关闭", callback: function () { kendo.Confirm.close(); } },
                template: null
            };
            if ('string' == typeof options) defaultOptions.message = options;
            else defaultOptions = $.extend(defaultOptions, options);

            if (kendo.Confirm) kendo.Confirm.destroy();
            var html = $("<div></div>");
            var btns = $('<div class="fright"></div>');
            if (defaultOptions.template) html.append(template);
            else {
                html.append('<div style="height:60%;margin:8px;overflow:hidden;">' + defaultOptions.message + '</div>');
            }
            if (defaultOptions.btnConfirm) {
                var a = $('<a href="#" class="k-button k-button-icontext k-grid-update"><span class="k-icon k-update"></span>' + defaultOptions.confirm.text + '</a>');
                a.click(function () { if (defaultOptions.confirm.callback) return true; });
                btns.append(a);
                btns.append("<span>&nbsp;&nbsp;</span>");
                html.append(btns);
            }
            if (defaultOptions.btnCancel) {
                var b = $('<a href="#" class="k-button k-button-icontext k-grid-cancel"><span class="k-icon k-cancel"></span>' + defaultOptions.cancel.text + '</a>');
                b.click(function () { if (defaultOptions.cancel.callback) defaultOptions.cancel.callback(); });
                btns.append(b);
                html.append(btns);
            }

            kendo.Confirm = html.kendoWindow({
                modal: true,
                width: 400,
                visable: false,
                resizable: false,
                title: defaultOptions.title
            }).data("kendoWindow");
            kendo.Confirm.center().open();
        },
        waiting: function (content) {
            var wait = '<div><img src="/Styles/Default/loading_2x.gif" style="vertical-align: middle" alt="Processing" />  ' + content + '</div>';
            if (kendo.Waiting) kendo.Waiting.destroy();
            kendo.Waiting = $(wait).kendoWindow({
                title: false,
                visible: false,
                modal: true,
                resizable: false,
                actions: []
            }).data("kendoWindow");
            kendo.Waiting.toFront().center().open();
        },
        ajax_download: function (url, data) {
            var $iframe, iframe_doc, iframe_html;

            if (($iframe = $('#download_iframe')).length === 0) {
                $iframe = $("<iframe id='download_iframe' style='display: none' src='about:blank'></iframe>").appendTo("body");
            }

            iframe_doc = $iframe[0].contentWindow || $iframe[0].contentDocument;
            if (iframe_doc.document) {
                iframe_doc = iframe_doc.document;
            }

            iframe_html = "<html><head></head><body><form method='POST' action='" + url + "'>";

            Object.keys(data).forEach(function (key) {
                iframe_html += "<input type='hidden' name='" + key + "' value='" + data[key] + "'>";
            });

            iframe_html += "</form></body></html>";

            iframe_doc.open();
            iframe_doc.write(iframe_html);
            $(iframe_doc).find('form').submit();
        }
    });
    jQuery.fn.extend({
        //#region 验证文本域文字长度
        checkTextLength: function () {
            /// <summary>
            /// 验证文本域文字长度
            /// </summary>
            $.each(this, function () {
                var maxlength = $(this).attr("maxlength");
                $(this).on("paste", function () {
                    var select = false;
                    if (document.selection) {
                        if (this.document.selection.createRange().text == "") select = false;
                        else select = true;
                    }
                    else if (this.selectionStart != undefined && this.selectionEnd != undefined) {
                        if ((this.selectionEnd - this.selectionStart) <= 0) select = false;
                        else select = true;
                    }
                    if (!select && $(this).val().length >= maxlength) return false;
                    var oTRText;
                    if (document.selection) {
                        oTRText = this.document.selection.createRange().text;
                        var pasteLength = maxlength - $(this).val().length + oTRText.length;
                        if (pasteLength <= 0) return false;
                        var sData = window.clipboardData.getData("Text").substr(0, pasteLength);
                        this.document.selection.createRange().text = sData;
                        return false;
                    }
                    else if (this.selectionStart != undefined && this.selectionEnd != undefined) {
                        var start = this.selectionStart;
                        var end = this.selectionEnd;
                        oTRText = this.value.substring(start, end);
                        return true;
                    }
                }).keydown(function (e) {
                    var select = false;
                    if (document.selection) {
                        if (this.document.selection.createRange().text == "") select = false;
                        else select = true;
                    }
                    else if (this.selectionStart != undefined && this.selectionEnd != undefined) {
                        if ((this.selectionEnd - this.selectionStart) <= 0) select = false;
                        else select = true;
                    }
                    if (!select && $(this).val().length >= maxlength) {
                        var k = e.keyCode;
                        if (e.ctrlKey && (k === 67 || k === 99 || k === 86 || k === 188)) return true;
                        else if ((k === 0x2E) || (k === 8) || (k === 9) || (k >= 0x25 && k <= 0x28)) return true;
                        else return false;
                    }
                });
            });
            return this;
        },
        //#endregion
        //#region 限制文本框只能输入数字
        onlyInputNumber: function () {
            /// <summary>
            /// 限制文本框只能输入数字
            /// </summary>
            $.each(this, function () {
                var maxlength = $(this).attr("maxlength");
                $(this).on("paste afterpaste", function () {
                    var select = false;
                    if (document.selection) {
                        if (this.document.selection.createRange().text == "") select = false;
                        else select = true;
                    }
                    else if (this.selectionStart != undefined && this.selectionEnd != undefined) {
                        if ((this.selectionEnd - this.selectionStart) <= 0) select = false;
                        else select = true;
                    }
                    if (!select && $(this).val().length >= maxlength) return false;
                    var oTRText;
                    if (document.selection) {
                        oTRText = this.document.selection.createRange().text;
                        var pasteLength = maxlength - $(this).val().length + oTRText.length;
                        if (pasteLength <= 0) return false;
                        var sData = window.clipboardData.getData("Text")
                        sData = sData.replace(/[^\d]/g, "").substr(0, pasteLength);
                        this.document.selection.createRange().text = sData;
                        return false;
                    }
                    else if (this.selectionStart != undefined && this.selectionEnd != undefined) {
                        var start = this.selectionStart;
                        var end = this.selectionEnd;
                        this.value = this.value.replace(/[^\d]/g, "").substring(start, end);
                        return true;
                    }
                }).keydown(function (e) {
                    var select = false;
                    if (document.selection) {
                        if (this.document.selection.createRange().text == "") select = false;
                        else select = true;
                    }
                    else if (this.selectionStart != undefined && this.selectionEnd != undefined) {
                        if ((this.selectionEnd - this.selectionStart) <= 0) select = false;
                        else select = true;
                    }
                    var k = e.keyCode;
                    if (e.ctrlKey && (k === 67 || k === 99 || k === 86 || k === 188)) return true;
                    if (e.shiftKey || e.ctrlKey || e.altKey) return false;
                    else if ((k === 0x2E) || (k === 8) || (k === 9) || (k >= 0x25 && k <= 0x28)) return true;
                    else if (!select && $(this).val().length >= maxlength) return false;
                    else if ((k >= 48 && k <= 57) || (k >= 96 && k <= 105)) return true;
                    else return false;
                }).css("ime-mode", "disabled");
            });
            return this;
        },
        onlyInputDecimal: function () {
            $.each(this, function () {
                var maxlength = $(this).attr("maxlength");
                $(this).keydown(function (e) {
                    var k = e.keyCode;
                    var oTRText;
                    if (document.selection) oTRText = this.document.selection.createRange().text;
                    else if (this.selectionStart != undefined && this.selectionEnd != undefined) {
                        var start = this.selectionStart;
                        var end = this.selectionEnd;
                        oTRText = this.value.substring(start, end);
                    }
                    if (k.shiftKey || k.ctrlKey || k.altKey) return false;
                    else if ((k === 0x2E) || (k === 8) || (k === 9) || (k >= 0x25 && k <= 0x28)) return true;
                    else if (oTRText.length > 0) {
                        if (oTRText.indexOf(".") > -1 && (k === 110 || k === 190)) return true;
                        else if ((k >= 48 && k <= 57) || (k >= 96 && k <= 105)) return true;
                        else return false;
                    }
                    else if ($(this).val().length >= maxlength) return false;
                    else if ($(this).val().indexOf(".") > -1) {
                        if (k === 110 || k === 190) return false;
                        if ((k >= 48 && k <= 57) || (k >= 96 && k <= 105)) {
                            $(this).val($(this).val().match(/\d+\.\d{0,1}/));
                            return true;
                        }
                        else return false;
                    }
                    else if ((k >= 48 && k <= 57) || (k >= 96 && k <= 105) || k === 110 || k === 190) return true;
                    else return false;
                }).css("ime-mode", "disabled");
            });
            return this;
        },
        checkEmpty: function (msg, type) {
            if (this.val() === "-1") {
                this.showMsg(msg, type);
                var input = this;
                input.on("change.checkempty", function () {
                    input.checkEmpty(msg, type);
                    return false;
                });
                return true;
            }
            else if (this.val() === "" || $.trim(this.val()) === "") {
                this.showMsg(msg, type);
                var input = this;
                /*当输入时触发*/
                input.on("propertychange.checkempty input.checkempty", function () {
                    input.checkEmpty(msg, type);
                    return false;
                });
                return true;
            }
            else { this.hideMsg().off("propertychange.checkempty input.checkempty change.checkempty"); return false; }
        },
        checkDecimal: function (e) {
            var re = /^\d+(?=\.{0,1}\d+$|$)/;
            if (e.val != "") {
                if (re.test(e.value)) {
                    return true;
                }
            }
            return false;
        },
        //验证电话号码
        checkmobile: function (num) {
            var myreg = /^1(?:[38]\d|4[57]|5[01256789])\d{8}/;
            if (num.length == 0) {
                this.showMsg("手机号码还没输入呢！");
                var input = this;
                input.on("change.checkmobile", function () {
                    input.checkmobile(num);
                    return false;
                });
                return true;
            }
                //            else if (num.length != 11) {
                //                this.showMsg("手机号码有误，请重新输入！");
                //                /*当输入时触发*/
                //                input.on("propertychange.checkmobile input.checkmobile", function () {
                //                    input.checkmobile(num);
                //                    return false;
                //                });
                //                return true;
                //            }
            else if (!myreg.test(num)) {
                this.showMsg("手机号码有误，请重新输入！");
                /*当输入时触发*/
                input.on("propertychange.checkmobile input.checkmobile", function () {
                    input.checkmobile(num);
                    return false;
                });
                return true;
            }
            else { this.hideMsg().off("propertychange.checkmobile input.checkmobile change.checkmobile"); return false; }
        },
        //验证邮箱
        checkemail: function (email) {
            if (email.length == 0) {
                this.showMsg('邮箱不能为空');
                var input = this;
                input.on("change.checkemail", function () {
                    input.checkemail(email);
                    return false;
                });
                return true;
            }
            var myreg = /^\w+([-+.]\w+)*@\w+([-.]\w+)*\.\w+([-.]\w+)*$/;
            if (!myreg.test(email)) {
                this.showMsg('邮箱错误');
                /*当输入时触发*/
                input.on("propertychange.checkemail input.checkemail", function () {
                    input.checkemail(email);
                    return false;
                });
                return true;
            }
            else { this.hideMsg().off("propertychange.checkemail input.checkemail change.checkemail"); return false; }
        }
        //#endregion
    });
})();
//提取url参数
String.prototype.getQuery = function (name) {
    var reg = new RegExp("(^|&|\\?)" + name + "=([^&]*)(&|$)");
    var m = this.match(reg);
    return m !== null ? decodeURI(m[2]) : null;
}