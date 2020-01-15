// selectPublishOrderType/selectPublishOrderType.js
var app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    userInfo: {},
    hasUserInfo: false,
    canIUse: wx.canIUse('button.open-type.getUserInfo'),
    openid: '',
    
    orderType: [],
    orderTypeInChinese: [],
    
  },
  lookIntoUserInfo: function () {
    var userInfo = wx.getStorageSync('userInfo');
    // var openid = wx.getStorageSync("openid");
    if (userInfo) {
      // userInfo.openid = openid;
      app.globalData.userInfo = userInfo;
      console.log("取出缓存的userInfo");
      console.log(userInfo);
      console.log(app.globalData.userInfo);
      this.setData({
        userInfo: userInfo,
        hasUserInfo: true,
        // openid: openid,
      })
    } else {
      if (app.globalData.userInfo) {
        this.setData({
          userInfo: app.globalData.userInfo,
          hasUserInfo: true
        })
      } else if (this.data.canIUse) {
        // 由于 getUserInfo 是网络请求，可能会在 Page.onLoad 之后才返回
        // 所以此处加入 callback 以防止这种情况
        app.userInfoReadyCallback = res => {
          this.setData({
            userInfo: res.userInfo,
            hasUserInfo: true
          })
        }
      } else {
        // 在没有 open-type=getUserInfo 版本的兼容处理
        wx.getUserInfo({
          success: res => {
            app.globalData.userInfo = res.userInfo
            this.setData({
              userInfo: res.userInfo,
              hasUserInfo: true
            })
          }
        })
      }
      console.log("userinfor")
      console.log(this.data.userInfo);
      if (app.globalData.openid) {
        this.setData({
          openid: app.globalData.openid
        })
      }
    }
  },
  getUserInfo: function (e) {
    if (e.detail.userInfo) { // 如果用户点击了允许授权按钮
      var that = this;
      console.log("user info: ")
      console.log(e.detail.userInfo);

      app.globalData.userInfo = e.detail.userInfo
      that.setData({
        userInfo: e.detail.userInfo,
        hasUserInfo: true
      })
      // 获取openid
      that.getOpenid();
      console.log("now userinfo is ");
      console.log(that.data.userInfo);
    } else { // 用户点击了拒绝按钮
      wx.showModal({
        title: '警告',
        content: '请允许授权之后再进入',
      })
    }
  },
  getOpenid() {
    let that = this;
    wx.cloud.callFunction({
      name: 'getOpenid',
      complete: res => {
        console.log("云函数获取到的openid: " + res.result.openId);
        var openid = res.result.openId;
        var userInfo = that.data.userInfo;
        userInfo.openid = openid;
        that.setData({
          // openid: openid
          userInfo: userInfo,
        })
        app.globalData.userInfo = userInfo;
        wx.setStorage({
          key: 'userInfo',
          data: that.data.userInfo,
        })
      }
    })
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var orderType = app.globalData.orderType;
    var orderTypeInChinese = app.globalData.orderTypeInChinese;
    this.setData({
      orderType: orderType,
      orderTypeInChinese: orderTypeInChinese,
    })
    this.lookIntoUserInfo();
  },
  chooseType: function(e) {
    console.log("user has selected ");
    var type = e.currentTarget.dataset.type;
    console.log(type);
    if (type == 'cancel') {
      wx.switchTab({
        url: '../../homepage/homepage',
      })
    } else {
      // 关闭当前页面，跳转到应用内的某个页面。但是不允许跳转到 tabbar 页面。
      wx.redirectTo({
        url: '../order/publishOrder/publishOrder?type=' + type,
      })
    }
  },
  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})