/** * omd 让你写的javascript代码兼容所有的运行环境，符合amd, cmd, commonjs规范，在原生环境中也能运行
 * 例如，你写了一堆代码，在没有模块化加载的时候可以使用，在模块化框架下也可以使用
 */
import hmacSHA256 from 'crypto-js/hmac-sha256';
import Base64 from 'crypto-js/enc-base64';

var dsBridge=require("dsbridge");
var clone = require('clone');

//签名方法
function getHashByData(data,api_secret = '9cltjeoremroutzowcucjcl9y1j5tj4j') {
    // var api_key = "v1ymtpfgaautzakupen4xocrnnvnxwjz";
    // var api_secret = '9cltjeoremroutzowcucjcl9y1j5tj4j';
    console.log('要签名的数据是',data);
    var myObj = data,
      keys = [],
      k, i, len;

    for (k in myObj) {
      if (myObj.hasOwnProperty(k)) {
        keys.push(k);
      }
    }

    keys.sort();
    len = keys.length;

    var str = '';
    for (i = 0; i < len; i++) {
      k = keys[i];
      str += k + '=' + myObj[k];
    }

    var sign =  hmacSHA256(str,api_secret).toString();
    console.log('签名字符串是',str);
    console.log('签名后是',sign);
    return sign;
}

function invoke(sdkName, args, handler) {

    console.log('invoke-start',sdkName,args,handler)
    var sign = getHashByData(args);
    args['sign'] = sign;

    //Call asynchronously
    dsBridge.call("invoke",{'sdkname':sdkName,'args':args}, function (res) {
        console.log('调用成功',res);
        // alert(res);
        execute(sdkName, res, handler)
    })

}

function on(sdkName, listener, handler) {
    global.CoinchatJSBridge ? CoinchatJSBridge.on(sdkName, function(res) {
        handler && handler.trigger && handler.trigger(res);
        execute(sdkName, res, listener);
    }) : (handler ? logEventInfo(sdkName, handler) : logEventInfo(sdkName, listener));
}


function execute(sdkName, res, handler) {

    // "openEnterpriseChat" == sdkName && (res.errCode = res.err_code);
    // delete res.err_code, delete res.err_desc, delete res.err_detail;
    // var errMsg = res.errMsg;
    // errMsg || (errMsg = res.err_msg, delete res.err_msg, errMsg = formatErrMsg(sdkName, errMsg), res.errMsg = errMsg);
    // handler = handler || {};
    // handler._complete && (handler._complete(res), delete handler._complete);
    // errMsg = res.errMsg || "";
    // settings.debug && !handler.isInnerInvoke && alert(JSON.stringify(res));
    // var separatorIndex = errMsg.indexOf(":"),
    //     status = errMsg.substring(separatorIndex + 1);
    var resObj = JSON.parse(res);
    var status = resObj.status;

    console.log('execute:res',res);
    console.log('execute:res',resObj);
    console.log('execute:status',status);

    switch (status) {
        case "success":
            handler.success && handler.success(resObj);
            break;
        case "cancel":
            handler.cancel && handler.cancel(resObj);
            break;
        default:
            handler.fail && handler.fail(resObj)
    }
    handler.complete && handler.complete(resObj)
}

// function addVerifyInfo(data) {
//     data = data || {};
//     data.appId = settings.appId;
//     data.verifyAppId = settings.appId;
//     data.verifySignType = "sha1";
//     data.verifyTimestamp = settings.timestamp + "";
//     data.verifyNonceStr = settings.nonceStr;
//     data.verifySignature = settings.signature;

//     return data;
// }


// function formatErrMsg(sdkName, errMsg) {
//     var name = sdkName,
//         event = sdkNameEventMap[sdkName];
//     event && (name = event);
//     var status = "ok";
//     if (errMsg) {
//         var separatorIndex = errMsg.indexOf(":");
//         status = errMsg.substring(separatorIndex + 1);
//         "confirm" == status && (status = "ok");
//         "failed" == status && (status = "fail"); - 1 != status.indexOf("failed_") && (status = status.substring(7)); - 1 != status.indexOf("fail_") && (status = status.substring(5));
//         status = status.replace(/_/g, " ");
//         status = status.toLowerCase();
//         ("access denied" == status || "no permission to execute" == status) && (status = "permission denied");
//         "config" == sdkName && "function not exist" == status && (status = "ok");
//         "" == status && (status = "fail");
//     }
//     return errMsg = name + ":" + status;
// }

// function eventArrToSdkNameArr(jsApiList) {
//     if (jsApiList) {
//         for (var i = 0, length = jsApiList.length; length > i; ++i) {
//             var event = jsApiList[i],
//                 sdkName = eventSdkNameMap[event];
//             sdkName && (jsApiList[i] = sdkName);
//         }
//         return jsApiList;
//     }
// }

function logEventInfo(name, data) {
    console.log('"' + name + '",', data || "")
    return ;
    if (!(!settings.debug || data && data.isInnerInvoke)) {
        var event = sdkNameEventMap[name];
        event && (name = event);
        data && data._complete && delete data._complete;
        console.log('"' + name + '",', data || "")
    }
}

// function report(data) {
//     if (!(isNormalPC || isCoinchatDeBugger || settings.debug || "6.0.2" > coinchatVersion || info.systemType < 0)) {
//         var img = new Image;
//         info.appId = settings.appId;
//         info.initTime = loadTimeInfo.initEndTime - loadTimeInfo.initStartTime;
//         info.preVerifyTime = loadTimeInfo.preVerifyEndTime - loadTimeInfo.preVerifyStartTime;
//         jCoinchat.getNetworkType({
//             isInnerInvoke: true,
//             success: function(res) {
//                 info.networkType = res.networkType;
//                 var reportUrl = "https://open.coinchat.qq.com/sdk/report?v=" + info.version + "&o=" + info.isPreVerifyOk + "&s=" + info.systemType + "&c=" + info.clientVersion + "&a=" + info.appId + "&n=" + info.networkType + "&i=" + info.initTime + "&p=" + info.preVerifyTime + "&u=" + info.url;
//                 img.src = reportUrl;
//             }
//         });
//     }
// }

function getTime() {
    return new Date().getTime();
}

function startup(callback) {
    isCoinchat && (global.CoinchatJSBridge ? callback() : document.addEventListener && document.addEventListener("CoinchatJSBridgeReady", callback, false))
}

// function enableBetaApi() {
//     jCoinchat.invoke || (jCoinchat.invoke = function(sdkName, args, handler) {
//         global.CoinchatJSBridge && CoinchatJSBridge.invoke(sdkName, addVerifyInfo(args), handler)
//     }, jCoinchat.on = function(sdkName, args) {
//         global.CoinchatJSBridge && CoinchatJSBridge.on(sdkName, args)
//     });
// }

if (!global.jCoinchat) {


    console.log('init_coinchat',global.document,global);

    var eventSdkNameMap = {

    },
    sdkNameEventMap = (function() {
        var map = {};
        for (var i in eventSdkNameMap)
            map[eventSdkNameMap[i]] = i;
        return map;
    })(),
    
    document = global.document,
    title = document.title,
    uaLowerCase = navigator.userAgent.toLowerCase(),
    platLowerCase = navigator.platform.toLowerCase(),
    isNormalPC = !(!uaLowerCase.match('mac') && !uaLowerCase.match('win')),
    isCoinchatDeBugger = uaLowerCase.indexOf('coinchatdebugger') != -1,
    isCoinchat = uaLowerCase.indexOf('coinchat') != -1,
    isAndroid = uaLowerCase.indexOf('android') != -1,
    isIOs = uaLowerCase.indexOf('iphone') != -1 || uaLowerCase.indexOf('ipad') != -1,
    coinchatVersion = (function() {
        var version = uaLowerCase.match(/coinchat\/(\d+\.\d+\.\d+)/) || uaLowerCase.match(/coinchat\/(\d+\.\d+)/);
        return version ? version[1] : ''
    })(),
    loadTimeInfo = {
        initStartTime: getTime(),
        initEndTime: 0,
        preVerifyStartTime: 0,
        preVerifyEndTime: 0
    },
    info = {
        version: 1,
        appId: "",
        initTime: 0,
        preVerifyTime: 0,
        networkType: "",
        isPreVerifyOk: 1,
        systemType: isIOs ? 1 : isAndroid ? 2 : -1,
        clientVersion: coinchatVersion,
        url: encodeURIComponent(location.href)
    },
    settings = {},
    handler = {
        _completes: []
    },
    resource = {
        state: 0,
        data: {}
    };

    var jCoinchat = {
            config: function(data) {
                settings = clone(data);
                logEventInfo("config", data);

                var callback = {};
                settings['debug'] = (data['debug'] == true) ? true : false;
                delete data['debug'];

                console.log('settings',settings)

                invoke('config', data, function() {
                    handler._complete = function(data) {
                        console.log('config_1');
                        loadTimeInfo.preVerifyEndTime = getTime();
                        resource.state = 1;
                        resource.data = data;
                    };
                    handler.success = function(data) {
                        console.log('config_success');
                        info.isPreVerifyOk = 0;
                    };
                    handler.fail = function(data) {
                        console.log('config_fail');
                        handler._fail ? handler._fail(data) : resource.state = -1;
                    };
                   
                    var _completes = handler._completes;
                    // _completes.push(function() {
                    //     report();
                    // });
                   
                    handler.complete = function(data) {
                        for (var i = 0, length = _completes.length; length > i; ++i) {
                            _completes[i]();
                        }
                    };
                    handler._completes = [];
                    return handler;
                }());
            },

            ready: function(callback) {
                if (resource.state != 0) {
                    callback();
                }else {
                    handler._completes.push(callback);
                    console.log('添加到等待执行的列表',handler);
                }
            },

            error: function(callback) {
                if (resource.state == -1) {
                    callback(resource.data);
                }else {
                    handler._fail = callback
                }
            },

            getSign: function(args,api_secret) {
                var sign = getHashByData(args,api_secret);
                args['sign'] = sign;
                return args;
            },

            getLoginUserInfo : function(data) {
                invoke('getLoginUserInfo', {
                    'partner_no' : data.partner_no,
                    'timestamp'  : data.timestamp,
                    'nonce'      : data.nonce
                }, function() {
                    data._complete = function(res) {
                        // delete res.type
                        console.log('调用完成');
                        if (data.complete) {
                            data.complete(res);
                        }
                    };
                    data._success = function(res) {
                        // delete res.type
                        console.log('调用成功');
                        if (data.success) {
                            data.success(res);
                        }
                    };
                    data._cancel = function(res) {
                        // delete res.type
                        console.log('调用取消');
                    };
                    data._fail = function(res) {
                        // delete res.type
                        console.log('调用失败');
                        if (data.fail) {
                            data.fail(res);
                        }
                    };
                    return data;
                }());
            },
            showToast: function(data) {
                data = data || {};
                console.log('invoke_show_toast');
                invoke('showToast', data, function() {
                    data._complete = function(res) {
                        // delete res.type
                        console.log('调用完成');
                    };
                    data._success = function(res) {
                        // delete res.type
                        console.log('调用成功');
                    };
                    data._cancel = function(res) {
                        // delete res.type
                        console.log('调用取消');
                    };
                    data._fail = function(res) {
                        // delete res.type
                        console.log('调用失败');
                    };
                    return data;
                }());
            },
            getVersion : function() {
                console.log('coinchatVersion',coinchatVersion)
                return coinchatVersion;
            },

            isCoinchat : function() {
                console.log('isCoinchat',isCoinchat)
                return isCoinchat;
            },

            entrustPay :function(res) {
                var data = {};
                invoke('entrustPay', res, function() {
                    data._complete = function(res) {
                        // delete res.type
                        console.log('调用完成');
                        if (data.complete) {
                            data.complete(res);
                        }
                    };
                    data._success = function(res) {
                        // delete res.type
                        console.log('调用成功');
                        if (data.success) {
                            data.success(res);
                        }
                    };
                    data._cancel = function(res) {
                        // delete res.type
                        console.log('调用取消');
                    };
                    data._fail = function(res) {
                        // delete res.type
                        console.log('调用失败');
                        if (data.fail) {
                            data.fail(res);
                        }
                    };
                    return data;
                }());
            },

            // onMenuShareTimeline: function(data) {
            //     on(eventSdkNameMap.onMenuShareTimeline, {
            //         complete: function() {
            //             invoke("shareTimeline", {
            //                 title: data.title || title,
            //                 desc: data.title || title,
            //                 img_url: data.imgUrl || "",
            //                 link: data.link || location.href,
            //                 type: data.type || "link",
            //                 data_url: data.dataUrl || ""
            //             }, data);
            //         }
            //     }, data);
            // },
            // onMenuShareAppMessage: function(data) {
            //     on(eventSdkNameMap.onMenuShareAppMessage, {
            //         complete: function() {
            //             invoke("sendAppMessage", {
            //                 title: data.title || title,
            //                 desc: data.desc || "",
            //                 link: data.link || location.href,
            //                 img_url: data.imgUrl || "",
            //                 type: data.type || "link",
            //                 data_url: data.dataUrl || ""
            //             }, data);
            //         }
            //     }, data);
            // },
            // onMenuShareQQ: function(data) {
            //     on(eventSdkNameMap.onMenuShareQQ, {
            //         complete: function() {
            //             invoke("shareQQ", {
            //                 title: data.title || title,
            //                 desc: data.desc || "",
            //                 img_url: data.imgUrl || "",
            //                 link: data.link || location.href
            //             }, data);
            //         }
            //     }, data);
            // },
            // onMenuShareWeibo: function(data) {
            //     on(eventSdkNameMap.onMenuShareWeibo, {
            //         complete: function() {
            //             invoke("shareWeiboApp", {
            //                 title: data.title || title,
            //                 desc: data.desc || "",
            //                 img_url: data.imgUrl || "",
            //                 link: data.link || location.href
            //             }, data);
            //         }
            //     }, data);
            // },
            // onMenuShareQZone: function(data) {
            //     on(eventSdkNameMap.onMenuShareQZone, {
            //         complete: function() {
            //             invoke("shareQZone", {
            //                 title: data.title || title,
            //                 desc: data.desc || "",
            //                 img_url: data.imgUrl || "",
            //                 link: data.link || location.href
            //             }, data);
            //         }
            //     }, data);
            // },
            // getNetworkType: function(data) {
            //     var formatErrMsg = function(res) {
            //         var errMsg = res.errMsg;
            //         res.errMsg = "getNetworkType:ok";
            //         var subtype = res.subtype;
            //         delete res.subtype
            //         if (subtype)
            //             res.networkType = subtype;
            //         else {
            //             var separatorIndex = errMsg.indexOf(":"),
            //                 status = errMsg.substring(separatorIndex + 1);
            //             switch (status) {
            //                 case "wifi":
            //                 case "edge":
            //                 case "wwan":
            //                     res.networkType = status;
            //                     break;
            //                 default:
            //                     res.errMsg = "getNetworkType:fail"
            //             }
            //         }
            //         return res;
            //     };
            //     invoke("getNetworkType", {}, function() {
            //         data._complete = function(res) {
            //             res = formatErrMsg(res);
            //         };
            //         return data;
            //     }());
            // },
            // getLocation: function(data) {
            //     data = data || {};
            //     invoke(eventSdkNameMap.getLocation, {
            //         type: data.type || "wgs84"
            //     }, function() {
            //         data._complete = function(res) {
            //             delete res.type
            //         };
            //         return data;
            //     }());
            // },
            // hideOptionMenu: function(data) {
            //     invoke("hideOptionMenu", {}, data);
            // },
            // showOptionMenu: function(data) {
            //     invoke("showOptionMenu", {}, data);
            // },
            // closeWindow: function(data) {
            //     data = data || {};
            //     invoke("closeWindow", {}, data);
            // },
            // hideMenuItems: function(data) {
            //     invoke("hideMenuItems", {
            //         menuList: data.menuList
            //     }, data);
            // },
            // showMenuItems: function(data) {
            //     invoke("showMenuItems", {
            //         menuList: data.menuList
            //     }, data);
            // },
            // hideAllNonBaseMenuItem: function(data) {
            //     invoke("hideAllNonBaseMenuItem", {}, data);
            // },
            // showAllNonBaseMenuItem: function(data) {
            //     invoke("showAllNonBaseMenuItem", {}, data);
            // },
            // scanQRCode: function(data) {
            //     data = data || {};
            //     invoke("scanQRCode", {
            //         needResult: data.needResult || 0,
            //         scanType: data.scanType || ["qrCode", "barCode"]
            //     }, function() {
            //         data._complete = function(res) {
            //             if (isIOs) {
            //                 var resultStr = res.resultStr;
            //                 if (resultStr) {
            //                     var result = JSON.parse(resultStr);
            //                     res.resultStr = result && result.scan_code && result.scan_code.scan_result
            //                 }
            //             }
            //         };
            //         return data;
            //     }());
            // }
        },
        next_iOSLocalImgId = 1,
        iOS_LocalImgMap = {};
    }

 
    console.log('set_ready')
    export default jCoinchat;
