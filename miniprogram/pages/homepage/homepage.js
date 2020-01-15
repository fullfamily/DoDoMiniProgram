// miniprogram/pages/homepage/homepage.js
var app = getApp();
const db = wx.cloud.database();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    scrollTop: 0,
    isCard: true,
    orderType: [],
    orderTypeInChinese: [], // 顶部导航栏 支持滑动
    currentTab: 0,

    userInfo: {},
    hasUserInfo: false,
    canIUse: wx.canIUse('button.open-type.getUserInfo'),

    openid: '',
    orderClass: {
      pageone: app.globalData.orderCategory,
      // pagetwo: app.globalData.orderClass, // 分为多页 一页显示8个icon 方便日后扩展
    },

    num: 0, // 用于点击类别后 动态绑定事件设置num为参数中的index 这样wxml里就可以根据num==index来进行样式的修改
    searchContent: '',
    searchNumber: 0, // searchNumber达到 totalNumebr=6时 便开始跳转至搜索结果的页面
    totalNumber: 6,
    searchResult: [],

    list: [],   // 用来标示当前用户看的是哪一个order list

    secondHandOrderList: [], // secondHandOrderList为class为"all"的订单数组
    secondHandOrderIndex: 0,
    nomoreSecondHandOrder: false,
    specificSecondHandOrderList: [], // specificSecondHandOrderList为class为"特定类别"的订单数组 这个”特定类别“通过secondHandOrderIndex体现

    makeUpOrderList: [],
    makeUpOrderIndex: 0,
    nomoreMakeUpOrder: false,
    specificMakeUpOrderList: [],

    shareCarOrderList: [],
    nomoreShareOrder: false,

    nomore: false,
    limitNumber: 0,
  },
  //监测屏幕滚动
  onPageScroll: function(e) {
    this.setData({
      scrollTop: parseInt((e.scrollTop) * wx.getSystemInfoSync().pixelRatio)
    })
    console.log("屏幕滚动 scrollTop is" + this.data.scrollTop);
  },
  changeForm: function() {
    var that = this;
    that.setData({
      isCard: !this.data.isCard,
    })
    wx.setStorage({
      key: 'isCard',
      data: that.data.isCard,
    })
  },
  // 批量抓取数据
  loadmore: function () {
    let that = this;
    console.log("进入批量抓取环节");
    var sortForm = "asc";
    var sortDepend = "deadline";
    // 如果是二手的
    if (that.data.currentTab == 0) {
      sortForm = "desc";
      sortDepend = "publishDate";
    }
    var list = [];
    var table = '';
    var skipNumber = 0;
    // 首先判断当前处于哪个导航页面 如果是二手或者拼单还要判断处于哪一个类别
    if (that.data.currentTab == 0) { // 二手
      table = "secondHandOrder";
      // 判断当前处于二手的哪个类别页面
      if (that.data.secondHandOrderIndex == 0) {
        list = that.data.secondHandOrderList;
        skipNumber = list.length;
        console.log("开始批量抓取二手的全部订单的部分订单");
        db.collection(table).where({
          "state": "unfinished"
        }).orderBy(sortDepend, sortForm).skip(skipNumber).limit(that.data.limitNumber).get({
          success: res => {
            console.log("成功抓取部分二手订单");
            console.log("res is: ");
            console.log(res);
            list = list.concat(res.data);
            console.log("list is");
            console.log(list);
            that.setData({
              secondHandOrderList: list,
              list: list,
            })
            console.log("secondHandOrderList is ");
            console.log(that.data.secondHandOrderList);
            if (res.data.length == 0 || res.data.length < that.data.limitNumber) {
              that.setData({
                nomore: true
              })
              return false;
            }
            
          },
          fail: err => {
            wx.showToast({
              icon: 'none',
              title: '查询记录失败'
            })
            console.error('[数据库] [查询记录] 失败：', err)
          }
        });
      } else {
        list = that.data.specificSecondHandOrderList;
        skipNumber = list.length;
        db.collection(table).where({
          "state": "unfinished",
          "category": that.data.orderClass.pageone[that.data.secondHandOrderIndex],
        }).orderBy(sortDepend, sortForm).skip(skipNumber).limit(that.data.limitNumber).get({
          success: res => {
            if (res.data.length == 0 || res.data.length < that.data.limitNumber) {
              that.setData({
                nomore: true
              })
              return false;
            }
            list = list.concat(res.data);
            that.setData({
              specificSecondHandOrderList: list,
              list: list,
            })
          },
          fail: err => {
            wx.showToast({
              icon: 'none',
              title: '查询记录失败'
            })
            console.error('[数据库] [查询记录] 失败：', err)
          }
        });
      }
    } else if (that.data.currentTab == 1) { // 拼单
      table = "makeUpOrder";
      // 判断当前处于拼单的哪个类别页面
      if (that.data.makeUpOrderIndex == 0) {
        list = that.data.makeUpOrderList;
        skipNumber = list.length;
        db.collection(table).where({
          "state": "unfinished"
        }).orderBy(sortDepend, sortForm).skip(skipNumber).limit(that.data.limitNumber).get({
          success: res => {
            if (res.data.length == 0 || res.data.length < that.data.limitNumber) {
              that.setData({
                nomore: true
              })
              return false;
            }
            list = list.concat(res.data);
            that.setData({
              makeUpOrderList: list,
              list: list,
            })
          },
          fail: err => {
            wx.showToast({
              icon: 'none',
              title: '查询记录失败'
            })
            console.error('[数据库] [查询记录] 失败：', err)
          }
        });
      } else {
        list = that.data.specificMakeUpOrderList;
        skipNumber = list.length;
        db.collection(table).where({
          "state": "unfinished",
          "category": that.data.orderClass.pageone[that.data.makeUpOrderIndex],
        }).orderBy(sortDepend, sortForm).skip(skipNumber).limit(that.data.limitNumber).get({
          success: res => {
            if (res.data.length == 0 || res.data.length < that.data.limitNumber) {
              that.setData({
                nomore: true
              })
              return false;
            }
            list = list.concat(res.data);
            that.setData({
              specificMakeUpOrderList: list,
              list: list,
            })
          },
          fail: err => {
            wx.showToast({
              icon: 'none',
              title: '查询记录失败'
            })
            console.error('[数据库] [查询记录] 失败：', err)
          }
        });
      }
    } else if (that.data.currentTab == 2) { // 拼车 
      console.log("开始拼车批量抓取");
      table = "shareCarOrder";
      list = that.data.shareCarOrderList;
      skipNumber = list.length;
      db.collection(table).where({
        "state": "unfinished"
      }).orderBy(sortDepend, sortForm).skip(skipNumber).limit(that.data.limitNumber).get({
        success: res => {
          if (res.data.length == 0 || res.data.length < that.data.limitNumber) {
            that.setData({
              nomore: true
            })
            return false;
          }
          list = list.concat(res.data);
          that.setData({
            shareCarOrderList: list,
            list: list,
          })
        },
        fail: err => {
          wx.showToast({
            icon: 'none',
            title: '查询记录失败'
          })
          console.error('[数据库] [查询记录] 失败：', err)
        }
      });
    }
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    var that = this;
    that.getForm();
    this.setData({
      limitNumber: app.globalData.limitNumber,
      orderType: app.globalData.orderType,
      orderTypeInChinese: app.globalData.orderTypeInChinese,
    })
    if (options.type) {
      var type = options.type;
      var currentTab = 0;
      for (var i = 0; i < this.data.orderType.length; ++i) {
        if (this.data.orderType[i] == type) {
          currentTab = i;
          break;
        }
      }
      this.setData({
        currentTab: currentTab,
      })
    }
    this.lookIntoUserInfo();
    // this.loadmore(); 先第一次请求数据库的话 这块代码单独跟more分开吧
    this.getFirstList();
  },
  //获取上次布局记忆
  getForm() {
    let that = this;
    wx.getStorage({
      key: 'isCard',
      success: function (res) {
        that.setData({
          isCard: res.data
        })
      },
      fail() {
        that.setData({
          isCard: true,
        })
      }
    })
  },
  getFirstList: function() {
    this.setData({
      secondHandOrderList: [],
      makeUpOrderList: [],
      shareCarOrderList: [],
    })
    this.queryDatabase('secondHandOrder');
    this.queryDatabase('makeUpOrder');
    this.queryDatabase('shareCarOrder');
  },
  lookIntoUserInfo: function() {
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
  getUserInfo: function(e) {
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
        // showCancel: false,
        // confirmText: '返回授权',
        // success: function(res) {
        //   if (res.confirm) {
        //     console.log('用户点击了“返回授权”');
        //   }
        // }
      })
    }
    // console.log(e)
    // app.globalData.userInfo = e.detail.userInfo
    // this.setData({
    //   userInfo: e.detail.userInfo,
    //   hasUserInfo: true
    // })
    // console.log("userinfor")
    // console.log(this.data.userInfo);

    // // 获取openid
    // this.getOpenid();
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
    })
    this.getForm();
    this.lookIntoUserInfo();
    // this.refresh();
    // this.queryDatabase('secondHandOrder');
    // this.queryDatabase('makeUpOrder');
    // this.queryDatabase('shareCarOrder');
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
  refresh: function () {
    this.getFirstList();
  },
  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function() {
    this.getFirstList();
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function() {
    console.log("已经触底");

    this.loadmore();
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function() {

  },
  // 获取用户输入的搜索内容
  getUserSearchContent: function(e) {
    var that = this;
    that.setData({
      searchContent: e.detail.value,
    })
    // console.log("用户搜索了" + that.data.searchContent);
  },
  // 清除用户的搜索内容
  clean: function() {
    console.log("用户点击了清除的图标")
    var that = this;
    that.setData({
      searchContent: ''
    })
  },
  // 用户搜索特定类别的订单 
  filterCategory: function(e) {

  },
  searchOrder: function() {
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
      url: '../order/searchedOrderList/searchedOrderList?searchedOrderList=' + searchedOrderList,
    })
  },
  // 用户搜索特定订单 通过云端数据库 貌似不太行
  searchOrderByDB: function() {
    var that = this;
    that.searchDatabaseOrder("secondHandOrder", " ");
    that.searchDatabaseOrder("makeUpOrder", " ")

    // var tables = ["secondHandOrder", "makeUpOrder"];      // 需要搜索的表名
    // var fields = ["title", "description", "category"];   // 需要匹配的字段
    // var finalSearch = false;
    // for (var i = 0; i < tables.length; ++i) {
    // field传过去之后无法在 where中的字段处使用 !!!
    // for (var j = 0; j < fields.length; ++j) {
    //   if (i == tables.length - 1 && j == fields.length - 1) {
    //     finalSearch = true;
    //   }
    //   that.searchDatabaseOrder(tables[i], fields[j], finalSearch);  // false标识还没有搜索最后一类订单 finnalSearch不行是理解的
    // }
    // }
    // console.log("啥情况？？？")
    // finalSearch = 1;
    // that.searchDatabaseOrder(tables[tables.length - 1], fields[fields.length - 1], finalSearch);
  },
  searchDatabaseOrder: function(table, field) {
    console.log("开始搜索")
    console.log(field);
    var that = this;
    var queryContent = that.data.searchContent;
    var searchNumber = that.data.searchNumber;
    var searchResult = that.data.searchResult;
    db.collection(table).where({ // 去匹配title、description和class来搜索
      "title": db.RegExp({ // 官方文档
        regexp: '.*' + queryContent + '.*',
        options: 'i',
      })
    }).get({
      success: res => {
        searchNumber = that.data.searchNumber + 1;
        that.setData({
          searchNumber: searchNumber
        })
        console.log("目前搜索次数为" + that.data.searchNumber);
        console.log("所需要搜索次数为" + that.data.totalNumber);
        if (that.data.searchNumber == that.data.totalNumber) {
          consolelog("已经进行了最后一次搜索")
          var searchedOrders = JSON.stringify(that.data.searchResult);
          wx.navigateTo({
            url: 'pages/order/searchedOrderList/searchedOrderList?searchedOrders=' + searchedOrders
          })
        }
        console.log(table + " title res");
        console.log(res);
        that.appendSearchResult(res.data); // 单独写了个功能函数
      },
      fail: error => {
        wx.showToast({
          icon: 'none',
          title: '无相关记录'
        })
        console.error('[数据库] [查询记录] 失败：', err)
      }
    });
    db.collection(table).where({ // 去匹配title、description和class来搜索
      "category": db.RegExp({ // 官方文档
        regexp: '.*' + queryContent + '.*',
        options: 'i',
      })
    }).get({
      success: res => {
        searchNumber = that.data.searchNumber + 1;
        that.setData({
          searchNumber: searchNumber
        })
        console.log("目前搜索次数为" + that.data.searchNumber);
        console.log("所需要搜索次数为" + that.data.totalNumber);
        if (that.data.searchNumber == that.data.totalNumber) {
          consolelog("已经进行了最后一次搜索")
          var searchedOrders = JSON.stringify(that.data.searchResult);
          wx.navigateTo({
            url: '../order/searchedOrderList/searchedOrderList?searchedOrders=' + searchedOrders
          })
        }
        console.log(table + " category res");
        console.log(res);
        that.appendSearchResult(res.data); // 单独写了个功能函数
      },
      fail: error => {
        wx.showToast({
          icon: 'none',
          title: '无相关记录'
        })
        console.error('[数据库] [查询记录] 失败：', err)
      }
    });
    db.collection(table).where({ // 去匹配title、description和class来搜索
      "description": db.RegExp({ // 官方文档
        regexp: '.*' + queryContent + '.*',
        options: 'i',
      })
    }).get({
      success: res => {
        searchNumber = that.data.searchNumber + 1;
        that.setData({
          searchNumber: searchNumber
        })
        console.log("目前搜索次数为" + that.data.searchNumber);
        console.log("所需要搜索次数为" + that.data.totalNumber);
        if (that.data.searchNumber == that.data.totalNumber) {
          consolelog("已经进行了最后一次搜索");
          that.setData({
            searchNumber: 0,
          })
          var searchedOrders = JSON.stringify(that.data.searchResult);
          wx.navigateTo({
            url: '../order/searchedOrderList/searchedOrderList?searchedOrders=' + searchedOrders
          })
        }
        console.log(table + " " + " description res");
        console.log(res);
        that.appendSearchResult(res.data); // 单独写了个功能函数
      },
      fail: error => {
        wx.showToast({
          icon: 'none',
          title: '无相关记录'
        })
        console.error('[数据库] [查询记录] 失败：', err)
      }
    });
  },
  appendSearchResult: function(result) {
    // console.log("需要追加" + result);
    var that = this;
    var searchResult = that.data.searchResult;
    for (var i = 0; i < result.length; ++i) {
      var redundantFlag = false;
      for (var j = 0; j < searchResult.length; ++j) {
        if (searchResult[j]._id == result[i]._id) {
          redundantFlag = true;
          break;
        }
      }
      if (redundantFlag) {
        continue;
      }
      searchResult.push(result[i]);
    }
    that.setData({
      searchResult: searchResult,
    })
  },
  // 点击上方的类别图标 首页显示属于该类别的订单 通过specific***OrderList来展现
  // ps：同时该图标高亮 即样式的动态绑定
  showSpecificClassOrders: function(e) {
    var that = this;
    that.setData({
      nomore: false
    })
    let type = e.currentTarget.dataset.type;
    let category = e.currentTarget.dataset.category; // data-category 还是会被转成data-category！！！！
    let index = e.currentTarget.dataset.index;
    that.setData({
      num: index,
    })

    console.log(e.currentTarget.dataset);
    var specificClassOrder = [];
    var allOrder = (type == "secondHand") ? that.data.secondHandOrderList : that.data.makeUpOrderList;
    for (var i = 0; i < allOrder.length; ++i) {
      // console.log("第"+String(i)+"个order");
      // console.log(allOrder[i]["class"]);
      // console.log(category);
      // console.log(allOrder[i]["class"] == category);
      if (allOrder[i]["category"] == category) {
        specificClassOrder.push(allOrder[i]);
        // console.log(allOrder[i]);
      }
    }
    if (type == "secondHand") {
      that.setData({
        specificSecondHandOrderList: specificClassOrder,
        secondHandOrderIndex: index,
      })
      console.log("secondHandOrderIndex");
      console.log(that.data.secondHandOrderIndex);
      console.log(that.data.specificSecondHandOrderList);
    } else if (type == "makeUp") {
      that.setData({
        specificMakeUpOrderList: specificClassOrder,
        makeUpOrderIndex: index,
      })
      console.log("makeUpOrderIndex");
      console.log(that.data.makeUpOrderIndex);
      console.log(that.data.specificMakeUpOrderList);
    }

  },
  // 点击orderList列表的每一项进入其详情页
  toOrderDetail: function(e) {
    console.log("e.currentTarget.dataset");
    console.log(e.currentTarget.dataset);
    let index = e.currentTarget.dataset.index;
    let type = e.currentTarget.dataset.type;
    let category = e.currentTarget.dataset.category;
    var whichOrderList = [];
    var whichOrder = {};
    if (type == "secondHand") {
      if (category == 'all') {
        whichOrderList = this.data.secondHandOrderList;
      } else if (category == 'specific') {
        whichOrderList = this.data.specificSecondHandOrderList;
      }
      whichOrder = whichOrderList[index];
      let orderDetail = JSON.stringify(whichOrder);
      wx.navigateTo({
        url: '../order/secondHand/visitOrder/visitOrder?orderDetail=' + orderDetail,
      })
    } else if (type == "makeUp") {
      if (category == 'all') {
        whichOrderList = this.data.makeUpOrderList;
      } else if (category == 'specific') {
        whichOrderList = this.data.specificMakeUpOrderList;
      }
      whichOrder = whichOrderList[index];
      let orderDetail = JSON.stringify(whichOrder);
      wx.navigateTo({
        url: '../order/makeUp/visitOrder/visitOrder?orderDetail=' + orderDetail,
      })
    } else if (type == 'shareCar') {
      console.log("shareCarOrderList");
      console.log(this.data.shareCarOrderList);
      console.log("index");
      console.log(index);
      whichOrder = this.data.shareCarOrderList[index];
      console.log("whichOrder");
      console.log(whichOrder)

      let orderDetail = JSON.stringify(whichOrder);
      console.log("即将跳转至visit页面"),

        wx.navigateTo({
          url: '../order/shareCar/visitOrder/visitOrder?orderDetail=' + orderDetail,
        })
    }

  },
  // 查询数据库 table为表名，type为要查询的类型(暂时不会实现，所以全取出来然后遍历赋值)
  queryDatabase: function(table) {
    var sortForm = "asc";
    var sortDepend = "deadline";
    if (table == "secondHandOrder") {
      sortForm = "desc";
      sortDepend = "publishDate";
    }
    var that = this;
    db.collection(table).where({
      "state": "unfinished"
    }).orderBy(sortDepend, sortForm).skip(0).limit(that.data.limitNumber).get({
      success: res => {
        wx.stopPullDownRefresh(); //暂停刷新动作
        // var orderList = [];
        // // console.log("queryData")
        // for (var i = 0; i < res.data.length; ++i) {
        //   // console.log(res.data[i]);
        //   orderList.unshift(res.data[i]); // 按时间顺序 unshift()是往前插
        // }
        var orderList = res.data;
        if (table == 'secondHandOrder') {
          this.setData({
            secondHandOrderList: orderList,
          })
        } else if (table == 'makeUpOrder') {
          this.setData({
            makeUpOrderList: orderList,
          })
          console.log("makeUpOrderList:");
          console.log(this.data.makeUpOrderList);
        } else if (table == 'shareCarOrder') {
          console.log("shareCarList is ：");
          console.log(orderList);
          this.setData({
            shareCarOrderList: orderList,
          })
        }
        console.log('[数据库] [查询记录] 成功: ', res)
      },
      fail: err => {
        wx.showToast({
          icon: 'none',
          title: '查询记录失败'
        })
        console.error('[数据库] [查询记录] 失败：', err)
      }
    })
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
      nomore: false,
      currentTab: e.detail.current,
    })
  },
  gotop() {
    wx.pageScrollTo({
      scrollTop: 0
    })
  },
})