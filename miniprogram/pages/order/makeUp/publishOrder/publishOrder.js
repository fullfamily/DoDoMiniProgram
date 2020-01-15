// miniprogram/pages/publishOrder/publishOrder.js
var app = getApp();
var util = require('../../../../utils/util.js');
Page({

  /**
   * 页面的初始数据
   */
  data: {
    totalNumber: 0,   // 需要用户输入
    joinedNumber: 1,  // 初始值为1 表示用户自己参与拼单
    platforms: [],
    indexOfPlatform: null,
    platform: '',
    orderClass: [],
    indexOfCategory: null,
    category: '',
    date: util.formatDate(new Date()),
    time: util.formatTimeNew(new Date()),
    deadline: '',
    publishDate: '',
    region: '',
    state: 'unfinished',
    likes: 0,

    openid: '',
    type: '',   // 订单的类型 目前支持'secondHand', 'makeUp' and 'shareCar'

    img_arr: [], // 保存选择的本地图片
    maxNumber: 3, // 可上传图片的最大数目
    images_fileID: [], // 图片上传成功后返回的fileID
    formData: {}, // wxml中的表单数据 （咋直接弄成多级json格式？）
    valid: false,
    orderID: '', // 提交表单数据上传至数据库后返回的订单_id
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
        deadline: formData.date + " " + formData.time,
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
    var type = that.data.type;    // 这里应该是 'makeUp'
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
    console.log("formData aaa");
    console.log(that.data.formData);
    var publishDate = util.formatTime(new Date());
    var contact = {
      "phone": that.data.formData.phone,
      "weChat": that.data.formData.weChat,
      "qq": that.data.formData.qq,
    }
    console.log("userInfo");
    console.log(app.globalData.userInfo);
    console.log("title");
    console.log(that.data.formData.title);
    console.log("price");
    console.log(that.data.formData.price);
    console.log("category");
    console.log(that.data.category);
    console.log("platform");
    console.log(that.data.platform);
    console.log("link");
    console.log(that.data.formData.link);
    console.log("description");
    console.log(that.data.formData.description);
    console.log("totalNumber");
    console.log(that.data.formData.totalNumber);
    console.log("joinedNumber");
    console.log(that.data.formData.joinedNumber);
    console.log("deadline");
    console.log(String(that.data.date) + " " + String(that.data.time));
    console.log("publishDate");
    console.log(publishDate);
    console.log("contact");
    console.log(contact);
    console.log("images_fileID");
    console.log(that.data.images_fileID);
    console.log("type");
    console.log(that.data.type);

    var formdata = {
      "userInfo": app.globalData.userInfo,
      "title": that.data.formData.title,
      "price": that.data.formData.price,
      "category": that.data.category,
      "platform": that.data.platform,
      "link": that.data.link,
      "description": that.data.formData.description,
      "totalNumber": that.data.totalNumber,
      "joinedNumber": that.data.joinedNumber,
      "deadline": String(that.data.date) + " " + String(that.data.time),
      "publishDate": publishDate,
      "region": '北京',
      "state": 'unfinished',
      "likes": that.data.likes,
      "contact": contact,
      "images_fileID": that.data.images_fileID,
      "type": that.data.type,
    }
    console.log("需要上传数据库的formdata");
    console.log(formdata);
    const db = wx.cloud.database()
    db.collection(table).add({
      data: {
        "userInfo": app.globalData.userInfo,
        "title": that.data.formData.title,
        "price": that.data.formData.price,
        "category": that.data.category,
        "platform": that.data.platform,
        "link": that.data.formData.link,
        "description": that.data.formData.description,
        "totalNumber": that.data.totalNumber,
        "joinedNumber": that.data.joinedNumber,
        "deadline": that.data.date + " " + that.data.time,
        "publishDate": publishDate,
        "region": '北京',
        "state": 'unfinished',
        "likes": that.data.likes,
        "contact": contact,
        "images_fileID": that.data.images_fileID,
        "type": that.data.type,
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
      type: options.type,
      platforms: app.globalData.platforms,
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

  },
  bindPlatformChange: function (e) {
    // console.log('picker发送选择改变，携带值为', e.detail.value)
    this.setData({
      indexOfPlatform: e.detail.value,
      platform: this.data.platforms[e.detail.value]
    })
  },
  bindCategoryChange: function (e) {
    // console.log('picker发送选择改变，携带值为', e.detail.value)
    this.setData({
      indexOfCategory: e.detail.value,
      category: this.data.orderClass[e.detail.value]
    })
  },
  bindDateChange: function (e) {
    // console.log('picker发送选择改变，携带值为', e.detail.value)
    this.setData({
      date: e.detail.value
    })
  },
  bindTimeChange: function (e) {
    // console.log('picker发送选择改变，携带值为', e.detail.value)
    this.setData({
      time: e.detail.value
    })
  },
})