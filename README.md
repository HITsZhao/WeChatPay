# weChat Payment interface
微信支付 接口 for node.js

## Usage

统一下单
```js
var WeChatPay = require('nbpWeChatPay');

var wechatpay = WeChatPay({
	appid: 'xxxxxxxx',
	mch_id: '1234567890',
	partner_key: 'xxxxxxxxxxxxxxxxx', //微信商户平台API密钥
	pfx: fs.readFileSync('./weixin_cert.p12'), //微信商户平台证书
});

wechatpay.createUnifiedOrder({
	body: '支付测试',
	out_trade_no: '20140703'+Math.random().toString().substr(2, 10),
	total_fee: 1,
	spbill_create_ip: '192.168.2.210',
	notify_url: 'http://wechatpay_notify_url',
	trade_type: 'APP',
	product_id: '1234567890'
}, function(err, result){
	console.log(result);
});
```

查询订单
```js

// 通过微信订单号查
wechatpay.queryOrder({ transaction_id:"xxxxxx" }, function(err, order){
	console.log(order);
});

// 通过商户订单号查
wechatpay.queryOrder({ out_trade_no:"xxxxxx" }, function(err, order){
	console.log(order);
});
```

关闭订单
```js
wechatpay.closeOrder({ out_trade_no:"xxxxxx"}, function(err, result){
	console.log(result);
});
```

### 原生支付 (NATIVE)

#### 模式一

提供一个生成支付二维码链接的函数，把url生成二维码给用户扫。

```js
var url = wechatpay.createMerchantPrepayUrl({ product_id: '123456' });
```

商户后台收到微信的回调之后，调用 createUnifiedOrder() 生成预支付交易单，将结果的XML数据返回给微信。

[什么是模式一？](http://pay.weixin.qq.com/wiki/doc/api/native.php?chapter=6_4)

#### 模式二

直接调用 createUnifiedOrder() 函数生成预支付交易单，将结果中的 code_url 生成二维码给用户扫。

[什么是模式二？](http://pay.weixin.qq.com/wiki/doc/api/native.php?chapter=6_5)

### 公众号支付 (JS API)

生成JS API支付参数，发给页面
```js
wechatpay.getBrandWCPayRequestParams({
	openid: '微信用户 openid',
	body: '公众号支付测试',
    detail: '公众号支付测试',
	out_trade_no: '20150331'+Math.random().toString().substr(2, 10),
	total_fee: 1,
	spbill_create_ip: '192.168.2.210',
	notify_url: 'http://wxpay_notify_url'
}, function(err, result){
	// in express
    res.render('wxpay/jsapi', { payargs:result })
});
```

网页调用参数（以ejs为例）
```js
WeixinJSBridge.invoke(
	"getBrandWCPayRequest", <%-JSON.stringify(payargs)%>, function(res){
		if(res.err_msg == "get_brand_wcpay_request:ok" ) {
    		// success
    	}
});
```

### 中间件

商户服务端处理微信的回调（express为例）
```js
var router = express.Router();
var wxpay = require('nbpWeChatPay');

// 原生支付回调
router.use('/weixinpay/native/callback', wechatpay.useWXCallback(function(msg, req, res, next){
	// msg: 微信回调发送的数据
}));

// 支付结果异步通知
router.use('/weixinpay/notify', wechatpay.useWXCallback(function(msg, req, res, next){
	// 处理商户业务逻辑

    // res.success() 向微信返回处理成功信息，res.fail()返回失败信息。
    res.success();
}));
```