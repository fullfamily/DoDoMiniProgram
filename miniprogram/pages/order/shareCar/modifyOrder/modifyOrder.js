// pages/order/shareCar/modifyOrder/modifyOrder.js

var app = getApp();
var util = require('../../../../utils/util.js');
Page({

  /**
   * 页面的初始数据
   */
  data: {
    multiArray: util.multiArray,
    multiIndex: util.multiIndex,

    departure: '',
    destination: '',
    departureTime: '',
    totalNumber: '',
    joinedNumber: '',
    price: '',
    // departureCoordinates{ laititude, longitude }
    departureCoordinates: '',
    destinationCoordinates: '',
    description: '',
    likes: '',
    deadline: '',
    publishDate: '',
    region: '',
    state: 'unfinished',

    openid: '',
    type: 'shareCar', // 订单的类型 目前支持'secondHand', 'makeUp' and 'shareCar'

    img_arr: [], // 保存选择的本地图片
    maxNumber: 3, // 可上传图片的最大数目
    images_fileID: [], // 图片上传成功后返回的fileID
    formData: {}, // wxml中的表单数据 （咋直接弄成多级json格式？）
    valid: false,
    orderID: '', // 提交表单数据上传至数据库后返回的订单_id

    orderDetail: null,
    editImages: false,
    oldImagesNumber: 0,
    deletedImageNumber: 0,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    if (options.orderDetail) {
      var orderDetail = JSON.parse(options.orderDetail);
      this.setData({
        orderDetail: orderDetail,
        type: orderDetail.type,
        oldImagesNumber: orderDetail.images_fileID.length,
        departureTime: orderDetail.departureTime,
      })
      console.log("从visit页面传进来的orderDetail是");
      console.log(this.data.orderDetail);
      console.log("页面加载了 因此需要再请求一下详细的Images");
      this.getOrderDetailImages();
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
  onShow: function() {},

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
  warningUser: function(content) {
    wx.showModal({
      title: '提示',
      content: content,
      success: function(res) {
        if (res.confirm) {
          console.log('用户点击确定')
        } else {
          console.log('用户点击取消')
        }

      }
    })
  },
  checkFormData: function(formData) {
    var that = this;
    if (formData.departure == '') {
      warningUser('请输入出发地')
    } else if (formData.destination == '') {
      warningUser('请输入目的地');
    } else {
      that.setData({
        valid: true
      })
    }

  },
  formSubmit: function(e) {
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

      // 如果没有修改图片 或者图片数目为0
      if (that.data.editImages == false) {
        // img_arr 就等同于images_fileID   而且在加载image时并不需要获取它的临时ip地址
        that.toDatabase(that.data.type + "Order");
        wx.reLaunch({
          url: '/pages/homepage/homepage?type=' + that.data.type,
          success(res) {
            let page = getCurrentPages().pop();
            if (page == undefined || page == null) {
              return
            }
            page.onLoad();
          }
        })
      } else {
        // 如果修改了图片并且有图片
        // 快刀斩乱麻 先把云端的图片文件全部删除
        that.uploadImages(); // order中的iamges在该函数里每次成功上传图片后都去修改数据库
        wx.reLaunch({
          url: '/pages/homepage/homepage?type=' + that.data.type,
          success(res) {
            let page = getCurrentPages().pop();
            if (page == undefined || page == null) {
              return
            }
            page.onLoad();
          }
        })
        
      }
    }
  },

  uploadImages: function() {
    var that = this;
    var type = that.data.type;
    var openid = that.data.orderDetail._openid;
    console.log("orderDetail")
    console.log(that.data.orderDetail);

    console.log("准备提交表单数据 用户已经修改完了订单")
    console.log("images_fileID ");
    console.log(that.data.images_fileID);
    console.log("img_arr");
    console.log(that.data.img_arr);
    var startIndex = that.data.images_fileID.length;
    var imageNumber = that.data.img_arr.length;
    wx.cloud.init();
    const db = wx.cloud.database(); // 初始化数据库
    // for循环进行图片上传
    for (var i = startIndex; i < imageNumber; i++) {
      const filePath = that.data.img_arr[i];
      const cloudPath = '';
      var digest = null;
      var images_fileID = that.data.images_fileID;
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
                console.log("已经上传了用户新添加的图片");
                // console.log("image's number: " + imageNumber);
                console.log("images_fileID ");
                console.log(that.data.images_fileID);
                console.log("img_arr");
                console.log(that.data.img_arr);

                console.log("准备写入数据库")
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
    // 如果用户只是删除了之前的某张照片  这里之前忘了。。。
    if (that.data.oldImagesNumber - that.data.deletedImageNumber == imageNumber) {
      that.toDatabase(type + "Order"); // 表名
    }
    // TODO 用户如果没有删除干净old image 这时候添加了新的image后又删除了这个新的image 这种情况还没处理
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
    var formdata = {
      "userInfo": app.globalData.userInfo,
      "departure": that.data.formData.departure,
      "destination": that.data.formData.destination,
      "totalNumber": that.data.formData.totalNumber,
      "joinedNumber": that.data.formData.joinedNumber,
      "price": that.data.formData.price,
      "description": that.data.formData.description,
      "departureTime": that.data.departureTime,
      "deadline": that.data.deadline,
      "publishDate": publishDate,
      "state": "unfinished",
      "type": that.data.type,
      "images_fileID": that.data.images_fileID,
      "contact": contact,
      // departureCoordinates{ laititude, longitude }
      // departureCoordinates: '',
      // destinationCoordinates: '',
    }
    console.log("需要上传数据库的formdata");
    console.log(formdata);
    const db = wx.cloud.database()
    db.collection(table).doc(that.data.orderDetail._id).update({
      data: {
        "userInfo": app.globalData.userInfo,
        "departure": that.data.formData.departure,
        "destination": that.data.formData.destination,
        "totalNumber": that.data.formData.totalNumber,
        "joinedNumber": that.data.formatData.joinedNumber,
        "price": that.data.formData.price,
        "description": that.data.formData.description,
        "date": that.data.formatData.date,
        "time": that.data.formatData.time,
        "departureTime": that.data.departureTime,
        "deadline": that.data.deadline,
        "publishDate": publishDate,
        "state": "unfinished",
        "type": that.data.type,
        "images_fileID": that.data.images_fileID,
        "contact": contact,
        // departureCoordinates{ laititude, longitude }
        // departureCoordinates: '',
        // destinationCoordinates: '',
      },
      success: res => {
        wx.showToast({
          title: '更新记录成功',
        })
        console.log('[数据库] [更新记录] 成功，res: ', res)
      },
      fail: err => {
        wx.showToast({
          icon: 'none',
          title: '更新记录失败'
        })
        console.error('[数据库] [更新记录] 失败：', err)
      }
    })
  },
  
  chooseImage: function() {
    var that = this;
    if (this.data.img_arr.length < that.data.maxNumber) {
      wx.chooseImage({
        sizeType: ['original', 'compressed'],
        success: function(res) {
          that.setData({
            editImages: true,
            img_arr: that.data.img_arr.concat(res.tempFilePaths)
          })
          console.log("添加了图片后的img_arr:")
          console.log(that.data.img_arr);
          console.log("添加了图片后的images_fileID: ");
          console.log(that.data.images_fileID);
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
  previewImg: function(e) {
    let index = e.target.dataset.index;
    let that = this;
    //console.log(that.data.tempFilePaths[index]);
    //console.log(that.data.tempFilePaths);
    wx.previewImage({
      current: that.data.img_arr[index],
      urls: that.data.img_arr,
    })
  },
  // 长按后直接删除
  deleteImg: function(e) {
    var that = this;
    var img_arr = [];
    for (var i = 0; i < that.data.img_arr.length; ++i) {
      img_arr.push(that.data.img_arr[i]);
    }
    // that.data.img_arr;    // img_arr存储的是本地放到小程序的图片
    var images_fileID = [];
    for (var i = 0; i < that.data.images_fileID.length; ++i) {
      images_fileID.push(that.data.images_fileID[i]);
    }
    // var img_arr = that.data.img_arr;
    // var images_fileID = that.data.images_fileID;
    var index = e.currentTarget.dataset.index; //获取当前长按图片下标
    console.log("index is " + index);
    console.log('用户点击确定了');
    console.log("原有的img_arr是");
    console.log(img_arr);

    img_arr.splice(index, 1);
    that.setData({
      img_arr: img_arr,
      editImages: true,
    })
    console.log("现在的img_arr是");
    console.log(img_arr);
    // 还要看是否是删除的原有的oldImages
    console.log("现在的images_fileID是");
    console.log(images_fileID);
    console.log(that.data.images_fileID);
    console.log("ok ?")
    console.log(images_fileID.length == that.data.images_fileID.length);
    if (images_fileID.length == 0) {
      console.log("原有的照片已经删除完了。。")
    } else {
      console.log("原有的img_arr是");
      console.log(img_arr);
      console.log("原有照片数目是：" + images_fileID.length);
      var toDelImage = [];
      toDelImage.push(images_fileID[index]);

      images_fileID.splice(index, 1);
      that.setData({
        deletedImageNumber: that.data.deletedImageNumber + 1,
        images_fileID: images_fileID,
      })
      // console.log("删除一张后现在的images_fileID是: " + images_fileID);
      console.log("开始删除数据库上的这张图片...");
      // 服务器端删除图片文件
      wx.cloud.deleteFile({
        fileList: toDelImage,
        success: res => {
          console.log("delete image succeed")
          console.log("删除图片后的images_fileID: ")
          console.log(that.data.images_fileID); // 上传后云端返回的fileID
          console.log("删除图片后的img_arr: ")
          console.log(that.data.img_arr); // 本地的路径
        },
        fail: err => {
          // handle error
          console.log("删除失败")
          console.log(err);
        },
      })
    }
  },
  //长按弹框 然后用户点击确认后才删除图片
  deleteImg2: function(e) {
    var that = this;
    // var img_arr = [];
    // for (var i = 0; i < that.data.img_arr.length; ++i) {
    //   img_arr.push(that.data.img_arr[i]);
    // }
    // // that.data.img_arr;    // img_arr存储的是本地放到小程序的图片
    // var images_fileID = [];
    // for (var i = 0; i < that.data.images_fileID.length; ++i) {
    //   images_fileID.push(that.data.images_fileID[i]);
    // }
    // that.data.images_fileID; // images_fileID是云端返回的fileIDs
    // console.log("用户点击删除照片还没确认的话 此时images_fileID is ");
    // console.log(that.data.images_fileID);
    // console.log(img_arr);
    // console.log("ok? ");
    // console.log(img_arr.length == that.data.img_arr.length);
    var index = e.currentTarget.dataset.index; //获取当前长按图片下标
    console.log("index is " + index);
    wx.showModal({
      title: '提示',
      content: '确定要删除此图片吗？',
      success: function(res) {
        if (res.confirm) {
          var img_arr = [];
          for (var i = 0; i < that.data.img_arr.length; ++i) {
            img_arr.push(that.data.img_arr[i]);
          }
          // that.data.img_arr;    // img_arr存储的是本地放到小程序的图片
          var images_fileID = [];
          for (var i = 0; i < that.data.images_fileID.lengt; ++i) {
            images_fileID.push(that.data.images_fileID[i]);
          }
          // 弹框里不能直接赋值数组！！
          // var img_arr = that.data.img_arr;
          // var images_fileID = that.data.images_fileID;
          console.log('用户点击确定了');
          console.log("原有的img_arr是");
          console.log(img_arr);

          img_arr.splice(index, 1);
          that.setData({
            img_arr: img_arr,
            editImages: true,
          })
          console.log("现在的img_arr是");
          console.log(img_arr);
          // 还要看是否是删除的原有的oldImages
          console.log("现在的images_fileID是");
          console.log(images_fileID);
          console.log(that.data.images_fileID);
          console.log("ok ?")
          console.log(images_fileID.length == that.data.images_fileID.length);
          if (images_fileID.length == 0) {
            console.log("原有的照片已经删除完了。。")
          } else {
            console.log("原有的img_arr是");
            console.log(img_arr);
            console.log("原有照片数目是：" + images_fileID.length);
            var toDelImage = [];
            toDelImage.push(images_fileID[index]);

            images_fileID.splice(index, 1);
            that.setData({
              images_fileID: images_fileID,
            })
            // console.log("删除一张后现在的images_fileID是: " + images_fileID);
            console.log("开始删除数据库上的这张图片...");
            // 服务器端删除图片文件
            wx.cloud.deleteFile({
              fileList: toDelImage,
              success: res => {
                console.log("delete image succeed")
                console.log("删除图片后的images_fileID: ")
                console.log(that.data.images_fileID); // 上传后云端返回的fileID
                console.log("删除图片后的img_arr: ")
                console.log(that.data.img_arr); // 本地的路径
              },
              fail: err => {
                // handle error
                console.log("删除失败")
                console.log(err);
              },
            })
          }
        } else {
          console.log("用户点击了取消");
        }
      }
    })
  },
  getOrderDetailImages: function() {
    var that = this;
    var _img_arr = [];
    console.log("orderDetail ggggggg");
    console.log(that.data.orderDetail);
    var orderDetail = that.data.orderDetail;
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
          // _img_arr.push(res.fileList[i].tempFileURL);    // 这是临时网络连接
          _img_arr.push(res.fileList[i].fileID); // 其实就是最终变成了orderDetail的images_fileID
        }
        that.setData({
          img_arr: _img_arr,
          // img_arr: orderDetail.images_fileID,
          images_fileID: _img_arr,
        });
        console.log("_img_arr");
        console.log(_img_arr);
        console.log("after getOrderDetailImages(): img_arr");
        console.log(that.data.img_arr);
        console.log("after getOrderDetailImages(): images_fileID");
        console.log(that.data.images_fileID);
      },
      fail: console.error
    })
  },
  bindMultiPickerChange: function (e) {
    // console.log('picker发送选择改变，携带值为', e.detail.value)
    this.setData({
      multiIndex: e.detail.value
    })
    const index = this.data.multiIndex;
    const year = this.data.multiArray[0][index[0]];
    const month = this.data.multiArray[1][index[1]];
    const day = this.data.multiArray[2][index[2]];
    const hour = this.data.multiArray[3][index[3]];
    const minute = this.data.multiArray[4][index[4]];
    // console.log(`${year}-${month}-${day}-${hour}-${minute}`);
    var selectedTime = year.slice(0, -1) + '-' + month.slice(0, -1) + '-' + day.slice(0, -1) + ' ' + hour.slice(0, -1) + ':' + minute.slice(0, -1);
    var d = new Date(parseInt(year.slice(0, -1)), parseInt(month.slice(0, -1)), parseInt(day.slice(0, -1)), parseInt(hour.slice(0, -1)), parseInt(minute.slice(0, -1)))
    console.log(d);
    console.log(String(d));
    this.setData({
      departureTime: selectedTime,
      deadline: selectedTime,
      // time: String(d),
    })
    // console.log(this.data.time);
  },
  //监听时间picker的滚动事件
  bindMultiPickerColumnChange: function (e) {
    //获取年份
    if (e.detail.column == 0) {
      let choose_year = this.data.multiArray[e.detail.column][e.detail.value];
      console.log(choose_year);
      this.setData({
        choose_year
      })
    }
    //console.log('修改的列为', e.detail.column, '，值为', e.detail.value);
    if (e.detail.column == 1) {
      let num = parseInt(this.data.multiArray[e.detail.column][e.detail.value]);
      let temp = [];
      if (num == 1 || num == 3 || num == 5 || num == 7 || num == 8 || num == 10 || num == 12) { //判断31天的月份
        for (let i = 1; i <= 31; i++) {
          if (i < 10) {
            i = "0" + i;
          }
          temp.push("" + i + "日");
        }
        this.setData({
          ['multiArray[2]']: temp
        });
      } else if (num == 4 || num == 6 || num == 9 || num == 11) { //判断30天的月份
        for (let i = 1; i <= 30; i++) {
          if (i < 10) {
            i = "0" + i;
          }
          temp.push("" + i + "日");
        }
        this.setData({
          ['multiArray[2]']: temp
        });
      } else if (num == 2) { //判断2月份天数
        let year = parseInt(this.data.choose_year);
        console.log(year);
        if (((year % 400 == 0) || (year % 100 != 0)) && (year % 4 == 0)) {
          for (let i = 1; i <= 29; i++) {
            if (i < 10) {
              i = "0" + i;
            }
            temp.push("" + i + "日");
          }
          this.setData({
            ['multiArray[2]']: temp
          });
        } else {
          for (let i = 1; i <= 28; i++) {
            if (i < 10) {
              i = "0" + i;
            }
            temp.push("" + i + "日");
          }
          this.setData({
            ['multiArray[2]']: temp
          });
        }
      }
      console.log(this.data.multiArray[2]);
    }
    var data = {
      multiArray: this.data.multiArray,
      multiIndex: this.data.multiIndex
    };
    data.multiIndex[e.detail.column] = e.detail.value;
    this.setData(data);
  },
})