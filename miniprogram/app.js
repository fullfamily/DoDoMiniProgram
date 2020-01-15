//app.js
App({
  onLaunch: function() {

    if (!wx.cloud) {
      console.error('请使用 2.2.3 或以上的基础库以使用云能力')
    } else {
      wx.cloud.init({
        // env 参数说明：
        //   env 参数决定接下来小程序发起的云开发调用（wx.cloud.xxx）会默认请求到哪个云环境的资源
        //   此处请填入环境 ID, 环境 ID 可打开云控制台查看
        //   如不填则使用默认环境（第一个创建的环境）
        env: 'yuhai-nic4g',
        traceUser: true,
      })
    }
    // 登录
    wx.login({
      success: res => {
        console.log("what will happend?")
        console.log(res);
        // 发送 res.code 到后台换取 openId, sessionKey, unionId
      }
    })

    // 获取用户信息 // 我已经缓存带有openid的userInfo了 所以这一段获取用户信息不需要了 因为这里有段代码会将this.globalData.userInfo = res.userInfo 这里userinfo是不包含openid的
    wx.getSetting({
      success: res => {
        if (res.authSetting['scope.userInfo']) {
          // 已经授权，可以直接调用 getUserInfo 获取头像昵称，不会弹框
          wx.getUserInfo({
            success: res => {
              // var openid = '';
              // if (this.globalData.userInfo.openid) {
              //   openid = this.globalData.userInfo.openid;
              // }
              // 可以将 res 发送给后台解码出 unionId
              this.globalData.userInfo = res.userInfo;
              this.globalData.hasUserInfo = true
              // my additional code
              // if (openid) {
              //   this.globalData.userInfo.openid == openid;
              //   console.log("user infor: ");
              //   console.log(this.globalData.userInfo);
              // }

              // 由于 getUserInfo 是网络请求，可能会在 Page.onLoad 之后才返回
              // 所以此处加入 callback 以防止这种情况
              if (this.userInfoReadyCallback) {
                this.userInfoReadyCallback(res)
              }
            }
          })
        }
      }
    })
    this.globalData = {
      userInfo: null,
      hasUserInfo: false,
      // 将openid放入userInfo的json数据里
      // openid: 'oZPWQ4tGIPqFJ7TRA8lCAmTC-R2A', // 于海
      // openid:'oZPWQ4kvdhtKDOtpDu1r8UxVZDBo',  // 成扬
      "limitNumber": 10,
      "orderType": ['secondHand', 'makeUp', 'shareCar'],
      "orderTypeInChinese": ['闲置', '拼单', '拼车'],
      "orderClass": [{
        id: 0,
        category: "全部",
        src: "/images/orderClass/all.png"
      }, {
        id: 1,
        category: "体育用品",
        src: "/images/orderClass/physical.png"
      }, {
        id: 2,
        category: "生活用品",
        src: "/images/orderClass/life.png"
      }, {
        id: 3,
        category: "食物生鲜",
        src: "/images/orderClass/food.png"
      }, {
        id: 4,
        category: "电子产品",
        src: "/images/orderClass/electricalProduct.png"
      }, {
        id: 5,
        category: "美妆洗护",
        src: "/images/orderClass/makeups.png"
      }, {
        id: 6,
        category: "服装饰品",
        src: "/images/orderClass/clothes.png"
      }, {
        id: 7,
        category: "图书文具",
        src: "/images/orderClass/education.png"
      }],
      "orderCategory": [{
        id: 0,
        category: "全部",
        src: ["/images/orderCategory/default/all.png", "/images/orderCategory/selected/all.png"]
      }, {
        id: 1,
        category: "体育用品",
          src: ["/images/orderCategory/default/physical.png", "/images/orderCategory/selected/physical.png"]
      }, {
        id: 2,
        category: "生活用品",
          src: ["/images/orderCategory/default/life.png", "/images/orderCategory/selected/life.png"]
      }, {
        id: 3,
        category: "食物生鲜",
          src: ["/images/orderCategory/default/food.png", "/images/orderCategory/selected/food.png"]
      }, {
        id: 4,
        category: "电子产品",
          src: ["/images/orderCategory/default/electricalProduct.png", "/images/orderCategory/selected/electricalProduct.png"]
      }, {
        id: 5,
        category: "美妆洗护",
          src: ["/images/orderCategory/default/makeups.png", "/images/orderCategory/selected/makeups.png"]
      }, {
        id: 6,
        category: "服装饰品",
          src: ["/images/orderCategory/default/clothes.png", "/images/orderCategory/selected/clothes.png"]
      }, {
        id: 7,
        category: "图书文具",
          src: ["/images/orderCategory/default/education.png", "/images/orderCategory/selected/education.png"]
      }],
      platforms: ['淘宝', '京东', '天猫', '苏宁易购', '当当', '拼多多', '饿了么', '美团', '其它'],
    }
  }
})