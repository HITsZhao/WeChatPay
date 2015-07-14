/*
 * Copyright (C) zhao
 */

var WeCtPay = require('./lib/weChatPay');

WeCtPay.mix('Util', require('./lib/util'));

module.exports = WeCtPay;