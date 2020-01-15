// pages/order/searchedOrderList/searchedOrderList.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    searchedOrderList: [],
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    console.log("成功跳转至searchedOrderList页面")
    console.log(options);
    var searchedOrderList = JSON.parse(options.searchedOrderList);
    console.log(searchedOrderList);
    this.setData({
      searchedOrderList: searchedOrderList
    })
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

  },
  // 点击orderList列表的每一项进入其详情页
  toOrderDetail: function (e) {
    let index = e.currentTarget.dataset.index;
    var whichOrder = this.data.searchedOrderList[index];
    // if (type == "secondHand") {
    //   whichOrder = this.data.secondHandOrderList[index];
    // } else if (type == "makeUp") {
    //   whichOrder = this.data.makeUpOrderList[index];
    // }
    let type = whichOrder.type;
    let orderDetail = JSON.stringify(whichOrder);
    if (type == 'secondHand') {
      wx.navigateTo({
        url: '../secondHand/visitOrder/visitOrder?orderDetail=' + orderDetail,
      })
    } else if (type == 'makeUp') {
      wx.navigateTo({
        url: '../makeUp/visitOrder/visitOrder?orderDetail=' + orderDetail,
      })
    } else if (type == 'shareCar') {
      wx.navigateTo({
        url: '../shareCar/visitOrder/visitOrder?orderDetail=' + orderDetail,
      })
    }
    
  }
})