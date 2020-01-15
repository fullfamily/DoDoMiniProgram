// miniprogram/pages/publishOrder/publishOrder.js
var app = getApp();
var util = require('../../../../utils/util.js');
Page({

  /**
   * 页面的初始数据
   */
  data: {
    like: false,
    oldLikeState: false,
    openid: '',
    type: '',   // 订单的类型 目前支持'secondHand', 'makeUp' and 'shareCar'
    orderType: [],
    orderTypeInChinese: [],
    typeIndex: -1,

    orderClass: [], // class数组
    index: null, // 选择class时的下标
    img_arr: [], // 保存选择的本地图片
    maxNumber: 3, // 可上传图片的最大数目
    images_fileID: [], // 图片上传成功后返回的fileID
    formData: {}, // wxml中的表单数据 （咋直接弄成多级json格式？）
    valid: false,
    orderID: '', // 提交表单数据上传至数据库后返回的订单_id
    publishDate: '',
    region: '',
    likes: 0,
    state: 'unfinished',
    
  },
  bindPickerChange: function (e) {
    console.log('picker发送选择改变，携带值为', e.detail.value)
    this.setData({
      index: e.detail.value
    })
  },
  checkFormData: function (formData) {
    var that = this;
    if (formData.title == '') {
      wx.showModal({
        title: '提示',
        content: '请输入标题',
        success: function (res) {
          if (res.confirm) {
            console.log('用户点击确定')
          } else {
            console.log('用户点击取消')
          }

        }
      })
    } else {
      that.setData({
        valid: true
      })
    }

  },
  formSubmit: function (e) {
    var that = this;
    console.log("formSubmit");
    console.log(e);
    var formData = e.detail.value;
    that.checkFormData(formData);
    if (that.data.valid) {
      that.setData({
        formData: formData,
      })
      console.log("formData");
      console.log(that.data.formData)

      // that.toDatabase();
      if (that.data.img_arr.length == 0) {
        wx.showModal({
          title: '提示',
          content: '请上传1-3张描述图片',
          success: function (res) {
            if (res.confirm) {
              console.log('用户点击确定')
            } else {
              console.log('用户点击取消')
            }

          }
        })
      } else {
        that.uploadImages(); // order中的iamges在该函数里每次成功上传图片后都去修改数据库
        wx.reLaunch({
          url: '/pages/homepage/homepage?type=' + that.data.type,
          // success(res) {
          //   let page = getCurrentPages().pop();
          //   if (page == undefined || page == null) {
          //     return
          //   }
          //   page.onLoad();
          // }
        })
      }
    }
  },

  uploadImages: function () {
    var that = this;
    var openid = app.globalData.userInfo.openid;
    var type = that.data.type;
    var imageNumber = that.data.img_arr.length;
    wx.cloud.init();
    const db = wx.cloud.database(); // 初始化数据库
    // for循环进行图片上传
    console.log("img_arr");
    console.log(that.data.img_arr);
    for (var i = 0; i < imageNumber; i++) {
      console.log("img_arr" + String(i));
      console.log(that.data.img_arr);
      var images_fileID = that.data.images_fileID; // 得到data中的images_fileID
      const filePath = that.data.img_arr[i];
      const cloudPath = '';
      var digest = null;
      wx.getFileInfo({
        filePath: filePath,
        digestAlgorithm: 'md5',
        success(res) {
          console.log(res.size)
          console.log('md5 is ' + res.digest);
          digest = res.digest;
          cloudPath = 'images/' + type + '/' + openid + '_' + digest + filePath.match(/\.[^.]+?$/);
          console.log("cloudPath" + cloudPath);
          wx.cloud.uploadFile({
            cloudPath,
            filePath,
            success: res => {
              console.log('[上传文件] 成功：', res)
              images_fileID.push(res.fileID);
              that.setData({
                images_fileID: images_fileID // 更新data中的images_fileID
              })
              if (images_fileID.length == imageNumber) {
                console.log("image's number: " + imageNumber);
                console.log("images_fileID");
                console.log(that.data.images_fileID);
                console.log("img_arr");
                console.log(that.data.img_arr);

                that.toDatabase(type + "Order"); // 表名
              }
            },
            fail: e => {
              console.error('[上传文件] 失败：', e)
              wx.showToast({
                icon: 'none',
                title: '上传失败',
              })
            },
          });
        },
        fail(err) {
          console.log("获取md5失败");
          var timestamp = Date.parse(new Date());
          timestamp = timestamp / 1000;
          console.log("当前时间戳为：" + timestamp);
          cloudPath = 'images/' + type + '/' + String(timestamp) + filePath.match(/\.[^.]+?$/);
        }
      })

    }
  },
  toDatabase: function (table) {
    // 上传数据库
    var that = this;
    console.log("formData");
    console.log(that.data.formData);

    var contact = {
      "phone": that.data.formData.phone,
      "weChat": that.data.formData.weChat,
      "qq": that.data.formData.qq,
    }
    var publishDate = util.formatTime(new Date());
    var jsonData = {
      "title": that.data.formData.title,
      "oldPrice": that.data.formData.oldPrice,
      "nowPrice": that.data.formData.nowPrice,
      "description": that.data.formData.description,
      "category": that.data.orderClass[that.data.index],
      "contact": contact,
      "images_fileID": that.data.images_fileID,
      "publishDate": publishDate,
    }
    console.log("jsonData");
    console.log(jsonData);
    const db = wx.cloud.database()
    db.collection(table).add({
      data: {
        "userInfo": app.globalData.userInfo,
        "title": that.data.formData.title,
        "oldPrice": that.data.formData.oldPrice,
        "nowPrice": that.data.formData.nowPrice,
        "description": that.data.formData.description,
        "category": that.data.orderClass[that.data.index],
        "contact": contact,
        "images_fileID": that.data.images_fileID,
        "likes": that.data.likes,
        "type": that.data.type,
        "state": "unfinished",
        "publishDate": publishDate,
      },
      success: res => {
        // that.setData({
        //   orderID: res._id,
        // })
        wx.showToast({
          title: '新增记录成功',
        })
        console.log('[数据库] [新增记录] 成功，记录 _id: ', res._id)
      },
      fail: err => {
        wx.showToast({
          icon: 'none',
          title: '新增记录失败'
        })
        console.error('[数据库] [新增记录] 失败：', err)
      }
    })
  },
  chooseImage: function () {
    var that = this;
    if (that.data.img_arr.length < that.data.maxNumber) {
      wx.chooseImage({
        sizeType: ['original', 'compressed'],
        success: function (res) {
          console.log("选择图片成功~");
          console.log(res.tempFilePaths);
          that.setData({
            img_arr: that.data.img_arr.concat(res.tempFilePaths)
          })

          // const filePath = res.tempFilePaths[0];
        }
      })
    } else {
      wx.showToast({
        title: '最多可上传三张图片',
        icon: 'loading',
        duration: 3000
      });
    }
  },
  //预览图片
  previewImg: function (e) {
    let index = e.target.dataset.index;
    let that = this;
    //console.log(that.data.tempFilePaths[index]);
    //console.log(that.data.tempFilePaths);
    wx.previewImage({
      current: that.data.img_arr[index],
      urls: that.data.img_arr,
    })
  },
  //长按删除图片
  deleteImg: function (e) {
    var that = this;
    var img_arr = that.data.img_arr;
    var index = e.currentTarget.dataset.index; //获取当前长按图片下标
    wx.showModal({
      title: '提示',
      content: '确定要删除此图片吗？',
      success: function (res) {
        if (res.confirm) {
          //console.log('点击确定了');
          img_arr.splice(index, 1);
        } else if (res.cancel) {
          //console.log('点击取消了');
          return false;
        }
        that.setData({
          img_arr: img_arr,
        });
      }
    })
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    // 加载静态全局数据
    var globalOrderClass = app.globalData.orderClass;
    console.log(globalOrderClass);
    var _orderClass = [];
    for (var i = 1; i < globalOrderClass.length; ++i) {
      _orderClass.push(globalOrderClass[i].category)
    }
    _orderClass.push("其他");
    console.log(_orderClass);
    this.setData({
      openid: app.globalData.openid,
      orderClass: _orderClass,
      orderType: app.globalData.orderType,
      orderTypeInChinese: app.globalData.orderTypeInChinese,
      type: options.type,
    })
    console.log("成功跳转进来publishOrder页面");
    console.log("type is " + this.data.type);
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