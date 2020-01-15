// pages/personalHub/myFavorites/myFavorites.js
var app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    slideButtons: [{
      text: '取消收藏',
      // src: '/page/weui/cell/icon_love.svg', // icon的路径
    }, ],
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
  bindTouchStart: function(e) {
    this.startTime = e.timeStamp;
  },
  bindTouchEnd: function(e) {
    this.endTime = e.timeStamp;
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

    wx.showModal({
      title: '提示',
      content: '确定取消收藏咩？',
      success: function(res) {
        if (res.confirm) {
          console.log('用户点击确定');
          orderList.splice(index, 1);
          if (type == "all") {
            that.setData({
              allOrderList: orderList,
            })
            // 其他栏的orderList也要相应的删除那一项
            var subOrderList = [];
            if (whichOrder.type == "secondHand") {
              for (var i = 0; i < that.data.secondHandOrderList.length; ++i) {
                var order = that.data.secondHandOrderList[i];
                if (order._id != whichOrder._id) {
                  subOrderList.push(order);
                }
              }
              that.setData({
                secondHandOrderList: subOrderList,
              })
            } else if (whichOrder.type == "secondHand") {
              for (var i = 0; i < that.data.secondHandOrderList.length; ++i) {
                var order = that.data.secondHandOrderList[i];
                if (order._id != whichOrder._id) {
                  subOrderList.push(order);
                }
              }
              that.setData({
                secondHandOrderList: subOrderList,
              })
            } else if (whichOrder.type == "makeUp") {
              for (var i = 0; i < that.data.makeUpOrderList.length; ++i) {
                var order = that.data.makeUpOrderList[i];
                if (order._id != whichOrder._id) {
                  subOrderList.push(order);
                }
              }
              that.setData({
                makeUpOrderList: subOrderList,
              })
            } else if (whichOrder.type == "shareCar") {
              for (var i = 0; i < that.data.shareCarOrderList.length; ++i) {
                var order = that.data.secondHandOrderList[i];
                if (order._id != whichOrder._id) {
                  subOrderList.push(order);
                }
              }
              that.setData({
                shareCarOrderList: subOrderList,
              })
            }
          } else {
            if (type == "secondHand") {
              that.setData({
                secondHandOrderList: orderList,
              })
            } else if (type == "makeUp") {
              that.setData({
                makeUpOrderList: orderList,
              })
            } else if (type == "shareCar") {
              that.setData({
                shareCarOrderList: orderList,
              })
            }
            var allOrderList = [];
            for (var i = 0; i < that.data.allOrderList.length; ++i) {
              var order = that.data.allOrderList[i];
              if (order._id != whichOrder._id) {
                allOrderList.push(order);
              }
            }
            that.setData({
              allOrderList: allOrderList,
            })
          }
          const db = wx.cloud.database();

          db.collection("likeInfo").where({
            "userID": that.data.userOpenid,
            "orderID": whichOrder._id,
          }).remove({
            success: res => {
              wx.showToast({
                title: '取消收藏成功',
              })
            },
            fail: err => {
              wx.showToast({
                icon: 'none',
                title: '取消收藏失败',
              })
              console.error('[数据库] [删除likeInfo中的记录] 失败：', err)
            }
          });
          var table = whichOrder.type + "Order";
          var likes = whichOrder.likes - 1;
          db.collection(table).doc(whichOrder._id).update({
            // data 传入需要局部更新的数据
            data: {
              // 表示将 likes 字段更新为likes
              likes: likes
            },
            success: res => {
              console.log("更新订单的likes成功");
              // this.setData({
              //   count: newCount
              // })
            },
            fail: err => {
              icon: 'none',
              console.error('[数据库] [更新订单的likes] 失败：', err)
            }
          });
        } else {
          console.log('用户点击取消')
        }

      }
    })
  },
  // 左滑出现“取消删除”的按钮 点击后触发下面这个事件
  slideButtonTap(e) {
    var that = this;
    console.log('slide button tap', e);
    var index = e.detail.index; // button 的index
    var itemindex = e.currentTarget.dataset.itemindex;
    var type = e.currentTarget.dataset.type;
    var whichOrder = {};
    var orderList = [];
    if (type == "all") {
      orderList = that.data.allOrderList;
      whichOrder = orderList[itemindex];
    } else if (type == "secondHand") {
      orderList = that.data.secondHandOrderList;
      whichOrder = orderList[itemindex];
    } else if (type == "makeUp") {
      orderList = that.data.makeUpOrderList;
      whichOrder = orderList[itemindex];
    } else if (type == "shareCar") {
      orderList = that.data.shareCarOrderList;
      whichOrder = orderList[itemindex];
    }

    wx.showModal({
      title: '提示',
      content: '确定取消收藏咩？',
      success: function(res) {
        if (res.confirm) {
          console.log('用户点击确定');
          orderList.splice(itemindex, 1);
          if (type == "all") {
            that.setData({
              allOrderList: orderList,
            })
            // 其他栏的orderList也要相应的删除那一项
            var subOrderList = [];
            if (whichOrder.type == "secondHand") {
              for (var i = 0; i < that.data.secondHandOrderList.length; ++i) {
                var order = that.data.secondHandOrderList[i];
                if (order._id != whichOrder._id) {
                  subOrderList.push(order);
                }
              }
              that.setData({
                secondHandOrderList: subOrderList,
              })
            } else if (whichOrder.type == "secondHand") {
              for (var i = 0; i < that.data.secondHandOrderList.length; ++i) {
                var order = that.data.secondHandOrderList[i];
                if (order._id != whichOrder._id) {
                  subOrderList.push(order);
                }
              }
              that.setData({
                secondHandOrderList: subOrderList,
              })
            } else if (whichOrder.type == "makeUp") {
              for (var i = 0; i < that.data.makeUpOrderList.length; ++i) {
                var order = that.data.makeUpOrderList[i];
                if (order._id != whichOrder._id) {
                  subOrderList.push(order);
                }
              }
              that.setData({
                makeUpOrderList: subOrderList,
              })
            } else if (whichOrder.type == "shareCar") {
              for (var i = 0; i < that.data.shareCarOrderList.length; ++i) {
                var order = that.data.secondHandOrderList[i];
                if (order._id != whichOrder._id) {
                  subOrderList.push(order);
                }
              }
              that.setData({
                shareCarOrderList: subOrderList,
              })
            }
          } else {
            if (type == "secondHand") {
              that.setData({
                secondHandOrderList: orderList,
              })
            } else if (type == "makeUp") {
              that.setData({
                makeUpOrderList: orderList,
              })
            } else if (type == "shareCar") {
              that.setData({
                shareCarOrderList: orderList,
              })
            }
            var allOrderList = [];
            for (var i = 0; i < that.data.allOrderList.length; ++i) {
              var order = that.data.allOrderList[i];
              if (order._id != whichOrder._id) {
                allOrderList.push(order);
              }
            }
            that.setData({
              allOrderList: allOrderList,
            })
          }
          const db = wx.cloud.database();

          db.collection("likeInfo").where({
            "userID": that.data.userOpenid,
            "orderID": whichOrder._id,
          }).remove({
            success: res => {
              wx.showToast({
                title: '取消收藏成功',
              })
            },
            fail: err => {
              wx.showToast({
                icon: 'none',
                title: '取消收藏失败',
              })
              console.error('[数据库] [删除likeInfo中的记录] 失败：', err)
            }
          });
          var table = whichOrder.type + "Order";
          var likes = whichOrder.likes - 1;
          db.collection(table).doc(whichOrder._id).update({
            // data 传入需要局部更新的数据
            data: {
              // 表示将 likes 字段更新为likes
              likes: likes
            },
            success: res => {
              console.log("更新订单的likes成功");
              // this.setData({
              //   count: newCount
              // })
            },
            fail: err => {
              icon: 'none',
              console.error('[数据库] [更新订单的likes] 失败：', err)
            }
          });
        } else {
          console.log('用户点击取消')
        }

      }
    })
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    this.setData({
      searchContent: '',
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
    this.queryDatabase("likeInfo", this.data.userOpenid);
  },
  queryDatabase: function(table, userOpenid) {
    const db = wx.cloud.database();
    db.collection(table).where({
      userID: userOpenid,
    }).get({
      success: res => {
        console.log("allOrderList");
        console.log(res.data);
        var allOrderList = [];
        for (var i = 0; i < res.data.length; ++i) {
          allOrderList.unshift(res.data[i].orderDetail);
        }
        this.setData({
          allOrderList: allOrderList,
        })
      },
      fail: err => {
        // wx.showToast({
        //   icon: 'none',
        //   title: '查询记录失败'
        // })
        console.error('[数据库 likeInfo] [查询收藏的secondHand记录] 失败：', err)
      }
    });
    db.collection(table).where({
      userID: userOpenid,
      "orderType": 'secondHand',
    }).get({
      success: res => {
        console.log("secondHandOrderList");
        console.log(res.data);
        var secondHandOrderList = [];
        for (var i = 0; i < res.data.length; ++i) {
          secondHandOrderList.unshift(res.data[i].orderDetail);
        }
        this.setData({
          secondHandOrderList: secondHandOrderList,
        })
        console.log(this.data.secondHandOrderList);
        console.log('[数据库 likeInfo] [查询收藏的secondHand记录] 成功: ', res)
      },
      fail: err => {
        // wx.showToast({
        //   icon: 'none',
        //   title: '查询记录失败'
        // })
        console.error('[数据库 likeInfo] [查询收藏的secondHand记录] 失败：', err)
      }
    });
    db.collection(table).where({
      userID: userOpenid,
      "orderType": 'makeUp',
    }).get({
      success: res => {
        console.log("makeUpOrderList");
        console.log(res.data);
        var makeUpOrderList = [];
        for (var i = 0; i < res.data.length; ++i) {
          makeUpOrderList.unshift(res.data[i].orderDetail);
        }
        this.setData({
          makeUpOrderList: makeUpOrderList,
        })
        console.log(this.data.makeUpOrderList);
        console.log('[数据库 likeInfo] [查询收藏的makeUp记录] 成功: ', res)
      },
      fail: err => {
        // wx.showToast({
        //   icon: 'none',
        //   title: '查询记录失败'
        // })
        console.error('[数据库 likeInfo] [查询收藏的makeUp记录] 失败：', err)
      }
    });
    db.collection(table).where({
      userID: userOpenid,
      "orderType": 'shareCar',
    }).get({
      success: res => {
        console.log("shareCarOrderList");
        console.log(res.data);
        var shareCarOrderList = [];
        for (var i = 0; i < res.data.length; ++i) {
          shareCarOrderList.unshift(res.data[i].orderDetail);
        }
        this.setData({
          shareCarOrderList: shareCarOrderList,
        })
        console.log(this.data.shareCarOrderList);
        console.log('[数据库 likeInfo] [查询收藏的shareCar记录] 成功: ', res)
      },
      fail: err => {
        // wx.showToast({
        //   icon: 'none',
        //   title: '查询记录失败'
        // })
        console.error('[数据库 likeInfo] [查询收藏的shareCar记录] 失败：', err)
      }
    })
  },
  toOrderDetail: function(e) {
    if (this.endTime - this.startTime < 350) {
      console.log("时间差太小 优先考虑进入点击事件 而不是长按事件")
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

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function() {
    this.setData({
      searchContent: '',
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
    this.queryDatabase("likeInfo", this.data.userOpenid);
    console.log("应该刷新了的啊")
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