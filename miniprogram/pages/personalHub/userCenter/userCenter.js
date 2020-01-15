// pages/personalHub/userCenter/userCenter.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    currentTab: 0,
    userInfo: '',
    userOpenid: '',
    allLikeOrderList: [],

    allPublishedOrderList: [],
    secondHandOrderList: [],
    makeUpOrderList: [],
    shareCarOrderList: [],
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    var userInfo = JSON.parse(options.userInfo);
    this.setData({
      userInfo: userInfo,
      userOpenid: userInfo.openid,
    })
    this.queryLikeDatabase("likeInfo", this.data.userOpenid);

    this.queryOrderDatabase("secondHandOrder", this.data.userOpenid, "secondHand");
    this.queryOrderDatabase("makeUpOrder", this.data.userOpenid, "makeUp");
    this.queryOrderDatabase("shareCarOrder", this.data.userOpenid, "shareCar");
  },
  queryOrderDatabase: function(table, userOpenid, type) {
    const db = wx.cloud.database();
    db.collection(table).where({
      _openid: userOpenid,
    }).get({
      success: res => {
        console.log("type " + type);
        console.log(res.data);
        if (type == "secondHand") {
          var secondHandOrderList = [];
          for (var i = 0; i < res.data.length; ++i) {
            // secondHandOrderList.unshift(res.data[i].orderDetail); // res.data的每一项就是orderDetail啦
            secondHandOrderList.unshift(res.data[i]);
          }
          this.setData({
            secondHandOrderList: secondHandOrderList,
            allPublishedOrderList: this.data.allPublishedOrderList.concat(secondHandOrderList),
          })
        } else if (type == "makeUp") {
          var makeUpOrderList = [];
          for (var i = 0; i < res.data.length; ++i) {
            makeUpOrderList.unshift(res.data[i]);
          }
          this.setData({
            makeUpOrderList: makeUpOrderList,
            allPublishedOrderList: this.data.allPublishedOrderList.concat(makeUpOrderList),
          })
        }
        if (type == "shareCar") {
          var shareCarOrderList = [];
          for (var i = 0; i < res.data.length; ++i) {
            shareCarOrderList.unshift(res.data[i]);
          }
          this.setData({
            shareCarOrderList: shareCarOrderList,
            allPublishedOrderList: this.data.allPublishedOrderList.concat(shareCarOrderList),
          })
        }
      },
      fail: err => {
        // wx.showToast({
        //   icon: 'none',
        //   title: '查询记录失败'
        // })
        console.error('[数据库 likeInfo] [查询收藏的secondHand记录] 失败：', err)
      }
    });
  },
  queryLikeDatabase: function(table, userOpenid) {
    const db = wx.cloud.database();
    db.collection(table).where({
      userID: userOpenid,
    }).get({
      success: res => {
        console.log("allLikeOrderList");
        console.log(res.data);
        var allLikeOrderList = [];
        for (var i = 0; i < res.data.length; ++i) {
          allLikeOrderList.unshift(res.data[i].orderDetail);
        }
        this.setData({
          allLikeOrderList: allLikeOrderList,
        })
      },
      fail: err => {
        // wx.showToast({
        //   icon: 'none',
        //   title: '查询记录失败'
        // })
        console.error('[数据库 likeInfo] [查询收藏的记录] 失败：', err)
      }
    });
  },
  toOrderDetail: function(e) {
    console.log("e.currentTarget.dataset");
    console.log(e.currentTarget.dataset);
    let index = e.currentTarget.dataset.index;
    let puborlike = e.currentTarget.dataset.puborlike;
    var whichOrder = {};
    var orderDetail = null;
    if (puborlike == "publish") {
      whichOrder = this.data.allPublishedOrderList[index];
      orderDetail = JSON.stringify(whichOrder);
    } else if (puborlike == "like") {
      whichOrder = this.data.allLikeOrderList[index];
      orderDetail = JSON.stringify(whichOrder);
    }

    if (whichOrder.type == "secondHand") {
      wx.navigateTo({
        url: '/pages/order/secondHand/visitOrder/visitOrder?orderDetail=' + orderDetail,
      })
    } else if (whichOrder.type == "makeUp") {
      wx.navigateTo({
        url: '/pages/order/makeUp/visitOrder/visitOrder?orderDetail=' + orderDetail,
      })
    } else if (whichOrder.type == "shareCar") {
      wx.navigateTo({
        url: '/pages/order/shareCar/visitOrder/visitOrder?orderDetail=' + orderDetail,
      })
    }
  },
  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function() {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function() {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function() {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function() {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function() {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function() {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function() {

  },
  /**
   * 导航标签选择1）
   */
  swichNav: function(e) {
    console.log(e);
    var that = this;
    if (this.data.currentTab === e.target.dataset.current) {
      return false;
    } else {
      that.setData({
        currentTab: e.target.dataset.current,
      })
    }
  },
  /**
   * 导航页面显示2）
   */
  swiperChange: function(e) {
    console.log(e);
    this.setData({
      currentTab: e.detail.current,
    })
  }
})