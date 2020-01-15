// pages/order/makeUp/visitOrder/visitOrder.js
var app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    localLikes: 0,
    orderDetail: {},
    orderOwnerOpenid: '',
    userOpenid: '',
    img_arr: [],
    // indicatorDots: true,
    // vertical: false,
    // autoplay: false,
    // circular: false,
    // interval: 2000,
    // duration: 500,
    // previousMargin: 0,
    // nextMargin: 0
  },
  toUserCenter: function() {
    var userInfo = JSON.stringify(this.data.orderDetail.userInfo)
    wx.navigateTo({
      url: '/pages/personalHub/userCenter/userCenter?userInfo=' + userInfo,
    })
  },
  /**
   * 长按复制
   */
  copy: function(e) {
    var that = this;
    console.log(e);
    wx.setClipboardData({
      data: e.currentTarget.dataset.content,
      success: function(res) {
        wx.showToast({
          title: '已复制到剪切板',
        });
      }
    });
  },
  copyContact: function(e) {
    var that = this;
    console.log(e);
    wx.setClipboardData({
      data: e.currentTarget.dataset.content,
      success: function(res) {
        wx.showToast({
          title: '已复制到剪切板',
        });
      }
    });
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    wx.showShareMenu({
      withShareTicket: true
    })
    // console.log("options")
    // console.log(options);
    // console.log("将接收到的字符串转换成json对象")
    // if (app.globalData.userInfo) {
    //   console.log("user infooooo")
    //   console.log(app.globalData.userInfo);
    //   this.setData({
    //     userOpenid: app.globalData.userInfo.openid,
    //   })
    // }
    var userInfo = wx.getStorageSync('userInfo');
    if (userInfo) {
      console.log("user infooooo")
      console.log(userInfo);
      this.setData({
        userOpenid: userInfo.openid,
      })
    }
    var orderDetail = JSON.parse(options.orderDetail);
    this.setData({
      orderDetail: orderDetail,
      localLikes: orderDetail.likes,
    })
    this.lookLikeInfo(this.data.userOpenid, orderDetail._id);

    this.setData({
      orderOwnerOpenid: orderDetail._openid,
      type: orderDetail.type,
    })
    var _img_arr = [];
    console.log("orderDetail");
    console.log(orderDetail);
    // 获取图片的fileID对应的临时网络链接 这样前端才可以显示图片
    wx.cloud.getTempFileURL({
      fileList: orderDetail.images_fileID,
      success: res => {
        // fileList 是一个有如下结构的对象数组
        // [{
        //    fileID: 'cloud://xxx.png', // 文件 ID
        //    tempFileURL: '', // 临时文件网络链接
        //    maxAge: 120 * 60 * 1000, // 有效期
        // }]
        console.log("res.fileList")
        console.log(res.fileList);
        for (var i = 0; i < res.fileList.length; ++i) {
          _img_arr.push(res.fileList[i].fileID);
        }
        this.setData({
          orderDetail: orderDetail,
          img_arr: _img_arr,
        });
        console.log("_img_arr")
        console.log(_img_arr);
        console.log("this.data.img_arr");
        console.log(this.data.img_arr);
      },
      fail: console.error
    })
    console.log("orderOwnerOpenid " + this.data.orderOwnerOpenid);
    console.log("userOpenid " + this.data.userOpenid);
  },
  lookLikeInfo: function(userOpenid, orderID) {
    const db = wx.cloud.database()
    db.collection('likeInfo').where({
      userID: userOpenid,
      orderID: orderID,
    }).get({
      success: res => {
        // this.setData({
        //   queryResult: JSON.stringify(res.data, null, 2)
        // })
        var like = (res.data.length == 0) ? false : true;
        this.setData({
          like: like,
          oldLikeState: like,
        })
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
  deleteOrder: function() {
    var that = this;
    var orderDetail = this.data.orderDetail;
    var table = orderDetail.type + "Order";
    var _id = orderDetail._id;
    console.log("orderDetail");
    console.log(orderDetail);
    console.log("table: " + table);
    console.log("_id: " + _id);
    wx.showModal({
      title: '提示',
      content: '确定删除此订单？',
      success: function(res) {
        if (res.confirm) {
          console.log('用户点击确定')
          const db = wx.cloud.database();
          db.collection(table).where({
            _id: _id
          }).remove({
            success: function(res) {
              wx.showToast({
                title: '删除成功',
                icon: 'succes',
                duration: 1000,
                mask: true
              })
              wx.reLaunch({
                url: '/pages/homepage/homepage?type=' + that.data.type,
              })
            }
          })
          wx.cloud.deleteFile({
            fileList: orderDetail.images_fileID,
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
        } else {
          console.log('用户点击取消')
        }

      }
    })
    const db = wx.cloud.database();
    // db.collection('todos').doc('todo-identifiant-aleatoire').remove({
    //   success: function (res) {
    //     console.log(res.data)
    //   }
    // })
  },
  editOrder: function() {
    console.log("用户点击了编辑按钮");
    var orderDetail = JSON.stringify(this.data.orderDetail);
    console.log(orderDetail);
    wx.redirectTo({
      url: '../modifyOrder/modifyOrder?orderDetail=' + orderDetail,
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

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function() {
    if (this.data.oldLikeState != this.data.like) {
      this.changeDatabase();
      this.setData({
        like: this.data.oldLikeState,
      })
    }
  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function() {
    if (this.data.oldLikeState != this.data.like) {
      this.changeDatabase();
      this.setData({
        like: this.data.oldLikeState,
      })
    }
  },
  changeLikeState: function() {
    var localLikes = this.data.localLikes;
    if (this.data.like == false) {
      localLikes += 1;
    } else {
      localLikes -= 1;
    }
    this.setData({
      localLikes: localLikes,
      like: !this.data.like,
    })
    console.log("用户的like从 " + !this.data.like + "变成了 " + this.data.like);
  },
  changeDatabase: function() {
    var that = this;
    const db = wx.cloud.database();
    // 需要修改如下：
    // 1. 首先是likeInfo表 增加或者删除一条记录
    // 2. 其次是orderDetail.type + "Order" 表，需要将orderDetail.likes做修改
    if (that.data.oldLikeState == false) {
      // 以前没收藏 现在收藏了
      db.collection("likeInfo").add({
        data: {
          "userID": that.data.userOpenid,
          "orderID": that.data.orderDetail._id,
          "orderType": that.data.orderDetail.type,
          "orderDetail": that.data.orderDetail,
        },
        success: res => {
          wx.showToast({
            title: '收藏成功',
          })
          console.log('[数据库] [新增收藏记录] 成功，记录 _id: ', res._id)
        },
        fail: err => {
          wx.showToast({
            icon: 'none',
            title: '收藏失败'
          })
          console.error('[数据库] [新增收藏记录] 失败：', err)
        }
      })
      var type = that.data.orderDetail.type;
      var likes = that.data.orderDetail.likes + 1;
      db.collection(type + "Order").doc(that.data.orderDetail._id).update({
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
      db.collection("likeInfo").where({
        "userID": that.data.userOpenid,
        "orderID": that.data.orderDetail._id,
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
      var type = that.data.orderDetail.type;
      var likes = that.data.orderDetail.likes - 1;
      db.collection(type + "Order").doc(that.data.orderDetail._id).update({
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
    }
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
  onShareAppMessage: function (res) {
    if (res.from === 'button') {
      console.log(res.target, res);
    }
    var orderDetail = JSON.stringify(this.data.orderDetail);
    return {
      title: 'DoDo好物',
      path: "/pages/order/makeUp/visitOrder/visitOrder?orderDetail=" + orderDetail
    }
  }
})