import coinchat from './../../index.js'

var user = {};
var api_secret = '9cltjeoremroutzowcucjcl9y1j5tj4j';

console.log('coinchat',coinchat);
// console.log('coinchat_sign',coinchat.getSign({'data':'123'}));

coinchat.ready(function(){
    console.log('this is coinchat ready callback');
})

coinchat.ready(function(){
    console.log('this is coinchat ready callback2');
})




//开始config
function getConfig() {
    var timestamp = Math.floor(new Date().getTime() / 1000);

    var data = {
        partner_no  : '1528949462419631', // 必填，唯一标识
        timestamp: timestamp, // 必填，生成签名的时间戳
        nonce    : timestamp, // 必填，生成签名的随机串
    }
    var sign = coinchat.getSign(data,api_secret)

    data['sign'] = sign
    data['debug'] = true;

    coinchat.config(data);
}
coinchat.getConfig = getConfig


getConfig();

function getUserInfo() {
    coinchat.getLoginUserInfo({
        'success' : function(res) {
            console.log('获得用户成功',res)
            user = res['data'];
        },
        'fail'    : function(res) {
            console.log('获得用户失败',res);
        }
    })
}
coinchat.getUserInfo = getUserInfo

function getPayment() {
    
    if (!user.user_partner_id) {
        console.log('需要先调用getLoginUser获得用户ID才能下单',user);
        return;
    }

    var coin_amount = document.getElementById("amount").value 
    console.log('coin_amount',coin_amount)

    if (!coin_amount) {
        console.log('下单金额不能是0');
        return;
    }

    var form = new FormData();
    form.append('partner_no','1528949462419631');
    form.append('user_id',user.user_partner_id);
    form.append('eth_fee','0.001');
    form.append('coin','eth');
    form.append('coin_amount',coin_amount);
    form.append('remark','测试支付');
    form.append('debug_skip_partner_signture','1');
    form.append('callback_url','https://coinchat.im/test');

    var url = 'http://api.coinchat.com/v1/entrust_wallet/deposit/add.html'
    fetch(url,{
        credentials: 'same-origin',
        method: 'POST', 
        body: form 
    }).then(response => {
        // console.log('typeof',typeof response,response,);
        if (typeof response == 'object' && !response.json) {
            return response
        }else {
            return response.json()
        }
    })
    .then(json => {

        var timestamp = Math.floor(new Date().getTime() / 1000);
        var send_data = {
            'deposit_no':json.data.deposit.deposit_no,
            'timestamp':timestamp,
            'nonce':timestamp,
            'partner_no':'1528949462419631',
        }
        send_data['sign'] = coinchat.getSign(send_data,api_secret)
        send_data['success'] = function() {
            console.log('success');
        }
        send_data['fail'] = function() {
            console.log('fail');
        }
        coinchat.entrustPay(send_data)
    })
}


function getNormalPayment() {
    
    if (!user.user_partner_id) {
        console.log('需要先调用getLoginUser获得用户ID才能下单',user);
        return;
    }

    var coin_amount = document.getElementById("amount").value 
    console.log('coin_amount',coin_amount)

    if (!coin_amount) {
        console.log('下单金额不能是0');
        return;
    }

    var form = new FormData();
    form.append('partner_no','1528949462419631');
    form.append('user_id',user.user_partner_id);
    form.append('eth_fee','0.001');
    form.append('coin','eth');
    form.append('coin_amount',coin_amount);
    form.append('remark','测试支付');
    form.append('debug_skip_partner_signture','1');
    form.append('callback_url','https://coinchat.im/test');

    var url = 'http://api.coinchat.com/v1/entrust_wallet/deposit/add.html'
    fetch(url,{
        credentials: 'same-origin',
        method: 'POST', 
        body: form 
    }).then(response => {
        // console.log('typeof',typeof response,response,);
        if (typeof response == 'object' && !response.json) {
            return response
        }else {
            return response.json()
        }
    })
    .then(json => {

        var timestamp = Math.floor(new Date().getTime() / 1000);
        var send_data = {
            'deposit_no':json.data.deposit.deposit_no,
            'timestamp':timestamp,
            'nonce':timestamp,
            'partner_no':'1528949462419631',
        }
        send_data['sign'] = coinchat.getSign(send_data,api_secret)
        send_data['success'] = function() {
            console.log('success');
        }
        send_data['fail'] = function() {
            console.log('fail');
        }
        coinchat.entrustPay(send_data)
    })
}

coinchat.getPayment = getPayment


function getContractPayment() {
    
    // if (!user.user_partner_id) {
    //     alert('需要先获得LOGIN_USER_ID才可以下单');
    //     console.log('需要先调用getLoginUser获得用户ID才能下单',user);
    //     return;
    // }

    var coin = document.getElementById("contract-coin").value 
    var amount = document.getElementById("contract-amount").value 
    var address = document.getElementById("contract-address").value 
    var data = document.getElementById("contract-data").value 

    // console.log('coin_amount',coin_amount)
    if (!amount) {
        console.log('下单金额不能是0');
        return;
    }

    var timestamp = Math.floor(new Date().getTime() / 1000);
    var send_data = {
        'coin'      : coin,
        'amount'    : amount,
        'to_address': address,
        'data'      : data,
    }
    send_data['success'] = function(result) {
        console.log('contract_success',result);
    }
    send_data['fail'] = function(result) {
        console.log('contract_fail',result);
    }
    coinchat.contractPay(send_data)

}
coinchat.getContractPayment = getContractPayment



function sendFirebaseEvent() {
    
    // if (!user.user_partner_id) {
    //     alert('需要先获得LOGIN_USER_ID才可以下单');
    //     console.log('需要先调用getLoginUser获得用户ID才能下单',user);
    //     return;
    // }

    var key = document.getElementById("firebase_key").value 
    var value = document.getElementById("firebase_value").value 
    var key2 = document.getElementById("firebase_key2").value 
    var value2 = document.getElementById("firebase_value2").value 

    var send_data = {}

    if (key) {
        send_data[key] = value
    }

    if (key2) {
        send_data[key2] = value2
    }
    // console.log('coin_amount',coin_amount)
    if (!key && !key2) {
        console.log('不能为空');
        return;
    }

    send_data['success'] = function(result) {
        console.log('firebase_event_send_success',result);
    }
    send_data['fail'] = function(result) {
        console.log('firebase_event_send_fail',result);
    }
    coinchat.firebaseEvent(send_data)

}
coinchat.sendFirebaseEvent = sendFirebaseEvent

console.log('coinchat-in',coinchat);

export default coinchat;