// pages/personalHub/myPublishRecords/myPublishRecords.js
var app = getApp();
const db = wx.cloud.database();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    slideButtons: [{
      text: '普通',
      src: '/images/pubish.png', // icon的路径
    }, {
      text: '普通',
      extClass: 'test',
      src: '/images/finish.png', // icon的路径
    }, {
      type: 'warn',
      text: '删除',
      extClass: 'test',
      src: '/images/delete.png', // icon的路径
    }],

    secondHandOrderList: [],
    makeUpOrderList: [],
    shareCarOrderList: [],
    allOrderList: [],
    userOpenid: '',

    orderType: ['all'],
    orderTypeInChinese: ['全部'], // 顶部导航栏 支持滑动
    currentTab: 0,

    searchContent: '',
    searchResult: [],
  },
  // 获取用户输入的搜索内容
  getUserSearchContent: function (e) {
    var that = this;
    that.setData({
      searchContent: e.detail.value,
    })
    // console.log("用户搜索了" + that.data.searchContent);
  },
  searchOrder: function () {
    var that = this;
    var searchContent = that.data.searchContent;
    var searchResult = [];
    for (var i = 0; i < that.data.secondHandOrderList.length; ++i) {
      var order = that.data.secondHandOrderList[i];
      if (order.title.indexOf(searchContent) >= 0 || order.category.indexOf(searchContent) >= 0 || order.description.indexOf(searchContent) >= 0) {
        var tmp = order;
        tmp.type = "secondHand";
        searchResult.push(tmp);
      }
    }
    for (var i = 0; i < that.data.makeUpOrderList.length; ++i) {
      var order = that.data.makeUpOrderList[i];
      if (order.title.indexOf(searchContent) >= 0 || order.category.indexOf(searchContent) >= 0 || order.description.indexOf(searchContent) >= 0) {
        var tmp = order;
        tmp.type = "makeUp";
        searchResult.push(tmp);
      }
    }
    for (var i = 0; i < that.data.shareCarOrderList.length; ++i) {
      var order = that.data.shareCarOrderList[i];
      if (order.departure.indexOf(searchContent) >= 0 || order.destination.indexOf(searchContent) >= 0 || order.description.indexOf(searchContent) >= 0) {
        var tmp = order;
        tmp.type = "shareCar";
        searchResult.push(tmp);
      }
    }
    that.setData({
      searchResult: searchResult
    })
    var searchedOrderList = JSON.stringify(searchResult);
    wx.navigateTo({
      url: '/pages/order/searchedOrderList/searchedOrderList?searchedOrderList=' + searchedOrderList,
    })
  },
  // 清除用户的搜索内容
  clean: function () {
    console.log("用户点击了清除的图标")
    var that = this;
    that.setData({
      searchContent: ''
    })
  },
  slideButtonTap(e) {
    console.log('slide button tap', e.detail);
    wx.showToast({
      title: 'slide button tap' + e.detail,
    })
  },
  bindTouchStart: function(e) {
    this.startTime = e.timeStamp;
  },
  bindTouchEnd: function(e) {
    this.endTime = e.timeStamp;
  },
  deleteLocalOrder: function(type, index) {
    var that = this;
    var orderList = [];
    var specificList = [];
    var specificIndex = -1;
    if (type == "all") {
      orderList = that.data.allOrderList;
      var whichOrder = orderList[index];
      orderList.splice(index, 1);
      that.setData({
        allOrderList: orderList,
      })
      if (whichOrder.type == "secondHand") {
        specificList = that.data.secondHandOrderList;
        for (var i = 0; i < specificList.length; ++i) {
          if (specificList[i]._id == whichOrder._id) {
            specificIndex = i;
            break;
          }
        }
        specificList.splice(specificIndex, 1);
        that.setData({
          secondHandOrderList: specificList,
        })
      } else if (whichOrder.type == "makeUp") {
        specificList = that.data.makeUpOrderList;
        for (var i = 0; i < specificList.length; ++i) {
          if (specificList[i]._id == whichOrder._id) {
            specificIndex = i;
            break;
          }
        }
        specificList.splice(specificIndex, 1);
        that.setData({
          makeUpOrderList: specificList,
        })
      } else if (whichOrder.type == "shareCar") {
        specificList = that.data.shareCarOrderList;
        for (var i = 0; i < specificList.length; ++i) {
          if (specificList[i]._id == whichOrder._id) {
            specificIndex = i;
            break;
          }
        }
        specificList.splice(specificIndex, 1);
        that.setData({
          shareCarOrderList: specificList,
        })
      }
    } else {
      let whichOrder = null;
      if (type == "secondHand") {
        specificList = that.data.secondHandOrderList;
        whichOrder = specificList[index];
        specificList.splice(index, 1);
        that.setData({
          secondHandOrderList: specificList,
        })
      } else if (type == "makeUp") {
        specificList = that.data.makeUpOrderList;
        whichOrder = specificList[index];
        specificList.splice(index, 1);
        that.setData({
          makeUpOrderList: specificList,
        })
      } else if (type == "shareCar") {
        specificList = that.data.shareCarOrderList;
        whichOrder = specificList[index];
        specificList.splice(index, 1);
        that.setData({
          shareCarOrderList: specificList,
        })
      }
      // delete allOrderList
      specificList = that.data.allOrderList;
      for (var i = 0; i < specificList.length; ++i) {
        if (specificList[i]._id == whichOrder._id) {
          specificIndex = i;
          break;
        }
      }
      specificList.splice(specificIndex, 1);
      that.setData({
        allOrderList: specificList,
      })
    }
    console.log("change local order's state successfully");
  },
  changeLocalOrderState: function (type, index) {
    var that = this;
    var orderList = [];
    var specificList = [];
    var specificIndex = -1;
    if (type == "all") {
      orderList = that.data.allOrderList;
      var whichOrder = orderList[index];
      // orderList.splice(index, 1);
      if (orderList[index].state == "unfinished") {
        orderList[index].state = "finished";
      } else {
        orderList[index].state = "unfinished";
      }
      that.setData({
        allOrderList: orderList,
      })
      if (whichOrder.type == "secondHand") {
        specificList = that.data.secondHandOrderList;
        for (var i = 0; i < specificList.length; ++i) {
          if (specificList[i]._id == whichOrder._id) {
            specificIndex = i;
            break;
          }
        }
        // specificList.splice(specificIndex, 1);
        if (specificList[specificIndex].state == "unfinished") {
          specificList[specificIndex].state = "finished";
        } else {
          specificList[specificIndex].state = "unfinished";
        }
        that.setData({
          secondHandOrderList: specificList,
        })
      } else if (whichOrder.type == "makeUp") {
        specificList = that.data.makeUpOrderList;
        for (var i = 0; i < specificList.length; ++i) {
          if (specificList[i]._id == whichOrder._id) {
            specificIndex = i;
            break;
          }
        }
        // specificList.splice(specificIndex, 1);
        if (specificList[specificIndex].state == "unfinished") {
          specificList[specificIndex].state = "finished";
        } else {
          specificList[specificIndex].state = "unfinished";
        }
        that.setData({
          makeUpOrderList: specificList,
        })
      } else if (whichOrder.type == "shareCar") {
        specificList = that.data.shareCarOrderList;
        for (var i = 0; i < specificList.length; ++i) {
          if (specificList[i]._id == whichOrder._id) {
            specificIndex = i;
            break;
          }
        }
        // specificList.splice(specificIndex, 1);
        if (specificList[specificIndex].state == "unfinished") {
          specificList[specificIndex].state = "finished";
        } else {
          specificList[specificIndex].state = "unfinished";
        }
        that.setData({
          shareCarOrderList: specificList,
        })
      }
    } else {
      let whichOrder = null;
      if (type == "secondHand") {
        specificList = that.data.secondHandOrderList;
        whichOrder = specificList[index];
        // specificList.splice(index, 1);
        if (specificList[index].state == "unfinished") {
          specificList[index].state = "finished";
        } else {
          specificList[index].state = "unfinished";
        }
        that.setData({
          secondHandOrderList: specificList,
        })
      } else if (type == "makeUp") {
        specificList = that.data.makeUpOrderList;
        whichOrder = specificList[index];
        // specificList.splice(index, 1);
        if (specificList[index].state == "unfinished") {
          specificList[index].state = "finished";
        } else {
          specificList[index].state = "unfinished";
        }
        that.setData({
          makeUpOrderList: specificList,
        })
      } else if (type == "shareCar") {
        specificList = that.data.shareCarOrderList;
        whichOrder = specificList[index];
        // specificList.splice(index, 1);
        if (specificList[index].state == "unfinished") {
          specificList[index].state = "finished";
        } else {
          specificList[index].state = "unfinished";
        }
        that.setData({
          shareCarOrderList: specificList,
        })
      }
      // delete allOrderList
      specificList = that.data.allOrderList;
      for (var i = 0; i < specificList.length; ++i) {
        if (specificList[i]._id == whichOrder._id) {
          specificIndex = i;
          break;
        }
      }
      // specificList.splice(specificIndex, 1);
      if (specificList[specificIndex].state == "unfinished") {
        specificList[specificIndex].state = "finished";
      } else {
        specificList[specificIndex].state = "unfinished";
      }
      that.setData({
        allOrderList: specificList,
      })
    }
    console.log("delete local order successfully");
  },
  toLongTap: function(e) {
    var that = this;
    var type = e.currentTarget.dataset.type;
    let index = e.currentTarget.dataset.index;
    var whichOrder = {};
    var orderList = [];

    if (type == "all") {
      orderList = that.data.allOrderList;
      whichOrder = orderList[index];
    } else if (type == "secondHand") {
      orderList = that.data.secondHandOrderList;
      whichOrder = orderList[index];
    } else if (type == "makeUp") {
      orderList = that.data.makeUpOrderList;
      whichOrder = orderList[index];
    } else if (type == "shareCar") {
      orderList = that.data.shareCarOrderList;
      whichOrder = orderList[index];
    }
    if (whichOrder.state == "unfinished") {
      wx.showActionSheet({
        itemList: ['编辑信息', '已经完成', '删除'],
        success(res) {
          console.log(res.tapIndex)
          if (res.tapIndex == 0) {
            var orderDetail = JSON.stringify(whichOrder);
            console.log(orderDetail);
            wx.redirectTo({
              url: '/pages/order/' + whichOrder.type + '/modifyOrder/modifyOrder?orderDetail=' + orderDetail,
            })
          } else if (res.tapIndex == 1) {
            that.changeLocalOrderState(type, index);
            var table = whichOrder.type + "Order";
            var state = "finished";
            db.collection(table).doc(whichOrder._id).update({
              // data 传入需要局部更新的数据
              data: {
                // 表示将 state 字段更新为 state
                state: state
              },
              success: res => {
                console.log("将订单的state更改为finished成功");
              },
              fail: err => {
                icon: 'none',
                console.error('[数据库] [更新订单的state] 失败：', err)
              }
            });
          } else if (res.tapIndex == 2) {
            that.deleteLocalOrder(type, index);
            // TODO 删除服务器端的图片文件
            wx.cloud.deleteFile({
              fileList: whichOrder.images_fileID,
              success: res => {
                // handle success
                console.log("delete image succeed")
              },
              fail: err => {
                console.log(err)
              },
              complete: res => {
                // ...
              }
            })
            db.collection(whichOrder.type + "Order").where({
              _id: whichOrder._id
            }).remove({
              success: function(res) {
                wx.showToast({
                  title: '删除成功',
                  icon: 'succes',
                  duration: 1000,
                  mask: true
                })
                // wx.reLaunch({
                //   url: '/pages/homepage/homepage?type=' + that.data.type,
                // })
              }
            })
          }
        },
        fail(res) {
          console.log(res.errMsg)
        }
      })
    } else if (whichOrder.state == "finished") {
      wx.showActionSheet({
        itemList: ['编辑信息', '重新发布', '删除'],
        success(res) {
          console.log(res.tapIndex)
          if (res.tapIndex == 0) {
            var orderDetail = JSON.stringify(whichOrder);
            console.log(orderDetail);
            wx.redirectTo({
              url: '/pages/order/' + whichOrder.type + '/modifyOrder/modifyOrder?orderDetail=' + orderDetail,
            })
          } else if (res.tapIndex == 1) {
            that.changeLocalOrderState(type, index);
            var table = whichOrder.type + "Order";
            var state = "unfinished";
            const db = wx.cloud.database();
            db.collection(table).doc(whichOrder._id).update({
              // data 传入需要局部更新的数据
              data: {
                // 表示将 state 字段更新为 state
                state: state
              },
              success: res => {
                console.log("将订单的state更改为finished成功");
              },
              fail: err => {
                icon: 'none',
                console.error('[数据库] [更新订单的state] 失败：', err)
              }
            });
          } else if (res.tapIndex == 2) {
            that.deleteLocalOrder(type, index);
            // 删除服务器端的图片文件
            wx.cloud.deleteFile({
              fileList: whichOrder.images_fileID,
              success: res => {
                // handle success
                console.log("delete image succeed")
              },
              fail: err => {
                console.log(err)
              },
              complete: res => {
                // ...
              }
            })
            db.collection(whichOrder.type + "Order").where({
              _id: whichOrder._id
            }).remove({
              success: function(res) {
                wx.showToast({
                  title: '删除成功',
                  icon: 'succes',
                  duration: 1000,
                  mask: true
                })
                // wx.reLaunch({
                //   url: '/pages/homepage/homepage?type=' + that.data.type,
                // })
              }
            })
          }
        },
        fail(res) {
          console.log(res.errMsg)
        }
      })
    }
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    this.setData({
      searchContent: '',
      allOrderList: [],
      secondHandOrderList: [],
      makeUpOrderList: [],
      shareCarOrderList: []
    })
    this.setData({
      orderType: this.data.orderType.concat(app.globalData.orderType),
      orderTypeInChinese: this.data.orderTypeInChinese.concat(app.globalData.orderTypeInChinese),
    })
    var userInfo = wx.getStorageSync('userInfo');
    if (userInfo) {
      console.log("myFavorite: userInfo")
      console.log(userInfo);
      this.setData({
        userOpenid: userInfo.openid,
      })
    }
    this.queryDatabase("secondHandOrder", this.data.userOpenid, "secondHand");
    this.queryDatabase("makeUpOrder", this.data.userOpenid, "makeUp");
    this.queryDatabase("shareCarOrder", this.data.userOpenid, "shareCar");
  },
  queryDatabase: function(table, userOpenid, type) {
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
            allOrderList: this.data.allOrderList.concat(secondHandOrderList),
          })
        } else if (type == "makeUp") {
          var makeUpOrderList = [];
          for (var i = 0; i < res.data.length; ++i) {
            makeUpOrderList.unshift(res.data[i]);
          }
          this.setData({
            makeUpOrderList: makeUpOrderList,
            allOrderList: this.data.allOrderList.concat(makeUpOrderList),
          })
        }
        if (type == "shareCar") {
          var shareCarOrderList = [];
          for (var i = 0; i < res.data.length; ++i) {
            shareCarOrderList.unshift(res.data[i]);
          }
          this.setData({
            shareCarOrderList: shareCarOrderList,
            allOrderList: this.data.allOrderList.concat(shareCarOrderList),
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
  toOrderDetail: function(e) {
    if (this.endTime - this.startTime < 350) {
      let index = e.currentTarget.dataset.index;
      let type = e.currentTarget.dataset.type;
      var whichOrder = {};
      var orderDetail = null;
      if (type == "all") {
        whichOrder = this.data.allOrderList[index];
        orderDetail = JSON.stringify(whichOrder);
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
      } else if (type == "secondHand") {
        whichOrder = this.data.secondHandOrderList[index];
        orderDetail = JSON.stringify(whichOrder);
        wx.navigateTo({
          url: '/pages/order/secondHand/visitOrder/visitOrder?orderDetail=' + orderDetail,
        })
      } else if (type == "makeUp") {
        whichOrder = this.data.makeUpOrderList[index];
        orderDetail = JSON.stringify(whichOrder);
        wx.navigateTo({
          url: '/pages/order/makeUp/visitOrder/visitOrder?orderDetail=' + orderDetail,
        })
      } else if (type == 'shareCar') {
        whichOrder = this.data.shareCarOrderList[index];
        orderDetail = JSON.stringify(whichOrder);
        wx.navigateTo({
          url: '/pages/order/shareCar/visitOrder/visitOrder?orderDetail=' + orderDetail,
        })
      }
    }
  },
  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function() {

  },
  lower(e) {
    console.log(e)
  },
  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function() {
    this.setData({
      searchContent: '',
    })
    // this.setData({
    //   orderType: this.data.orderType.concat(app.globalData.orderType),
    //   orderTypeInChinese: this.data.orderTypeInChinese.concat(app.globalData.orderTypeInChinese),
    // })
    // var userInfo = wx.getStorageSync('userInfo');
    // if (userInfo) {
    //   console.log("myFavorite: userInfo")
    //   console.log(userInfo);
    //   this.setData({
    //     userOpenid: userInfo.openid,
    //   })
    // }
    // this.setData({
    //   allOrderList: [],
    //   secondHandOrderList: [],
    //   makeUpOrderList: [],
    //   shareCarOrderList: []
    // })
    // this.queryDatabase("secondHandOrder", this.data.userOpenid, "secondHand");
    // this.queryDatabase("makeUpOrder", this.data.userOpenid, "makeUp");
    // this.queryDatabase("shareCarOrder", this.data.userOpenid, "shareCar");
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