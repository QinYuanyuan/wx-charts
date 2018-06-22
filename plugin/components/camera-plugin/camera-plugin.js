let api = require('../../api/api.js');

Component({
  properties: {
    vinResult: {//识别出来的结果
      type: Object,
    },
  },

  data: {
    windowWidth: '',//可使用窗口的宽度
    windowHeight: '',//可使用窗口的高度
    iphoneWidth: '',//不能截图时相框的宽度
    iphoneHeight: '',
    topVal: '',//不能截图时相框的top
    leftVal: '',
    model: '',//手机型号
    enableCropper: true,//能否使用截图功能
    vin: '',//识别出的vin
    enableTakePhoto: true,//拍照按钮时候可以使用
  },

  attached: function () {
    // 可以在这里发起网络请求获取插件的数据
  },

  methods: {
    getPhoneInfo() {//获取手机信息
      this.setData({
        model: api.getSystemInfo().model,
        windowWidth: api.getSystemInfo().windowWidth,
        windowHeight: api.getSystemInfo().windowHeight,
      });
      if (this.data.model.indexOf('iPhone') >= 0) {
        //微信版本号的处理  6.5.23以上的版本可以使用截图
        let versionAry = api.getSystemInfo().version.split('.');
        // let versionAry = ['6', '5', '23'];
        if (versionAry[0] > 6) {
          this.setData({ enableCropper: true });
        } else if (versionAry[0] = 6) {
          if (versionAry[1] > 5) {
            this.setData({ enableCropper: true });
          } else if (versionAry[1] = 5) {
            this.setData({
              enableCropper: versionAry[2] >= 23 ? true : false
            });
          } else {
            this.setData({ enableCropper: false });
          }
        } else {
          this.setData({ enableCropper: false });
        }
      }
    },
    takePhotoes() {//拍照按钮
      this.getPhoneInfo();
      if (this.data.enableTakePhoto) {
        this.setData({
          enableTakePhoto: false
        });
        wx.createCameraContext().takePhoto({
          quality: 'high',
          success: res => {
            if (this.data.model.indexOf('iPhone') >= 0) {//若为iphone手机则由小程序截图
              this.cropperEvent(res.tempImagePath);
            } else {//安卓由后台截图
              let formData = {
                crop_width: api.getSystemInfo().windowWidth / 750 * 160,
                client_id: 'retNdnPKjkrJbYT',
                secret_key: 'vVBx2alN24q6U7xQGADWql0OFrYC+vDK',
              }
              this.getVin(res.tempImagePath, formData);
            }
          }
        });
      }
    },
    cropperEvent(path) { // 截图
      let self = this;
      let myCanvas = wx.createCanvasContext('myCanvas', self);
      let canvasWidth = this.data.windowWidth;
      let canvasHeight = this.data.windowHeight * 0.8;
      myCanvas.drawImage(path, 0, 0, canvasWidth, canvasHeight);
      myCanvas.draw(false, () => {
        wx.canvasToTempFilePath({
          canvasId: 'myCanvas',
          x: canvasWidth * 0.4,
          y: canvasHeight * 0.1,
          width: 80,
          height: canvasHeight * 0.8,
          destWidth: 80,
          destHeight: canvasHeight * 0.8,
          success: res => {
            let formData = {
              client_id: 'retNdnPKjkrJbYT',
              secret_key: 'vVBx2alN24q6U7xQGADWql0OFrYC+vDK',
            }
            this.getVin(res.tempFilePath, formData);
          },
          fail: err => {
            console.log(err);
          }
        }, self)
      });
    },
    getVin(path, formData) {//识别图片获取vin
      wx.uploadFile({
        url: 'https://api.epc.heqiauto.com/ocr/vin-pro',
        filePath: path,
        name: 'file_data',
        formData: formData,
        success: (res) => {
          console.log('通过vin-pro接口识别图片返回的结果', res);
          let result = JSON.parse(res.data);
          if (result.success) {
            let data = result.result;
            console.log(1234,data)
            if (data.models.length > 0) {
              let result = JSON.stringify(data);
              this.triggerEvent('toIdentificationFn', {
                result: data,
              })
            } else {
              console.log('没有车型信息，进一步查看is_valid字段')
              if (data.meta.is_valid === 'false') {
                console.log('is_valid为false')
                this.triggerEvent('toCameraErrorFn',{
                  result: data,
                })
              } else {
                console.log('is_valid为true');
                this.triggerEvent('toIdentificationFn', {
                  result: data
                })
              }
            }
          }
        },
        fail: (err) => {
          console.log(err);
        }
      })
    },
    openAlbum() {//打开相册
      this.getPhoneInfo();
      wx.chooseImage({
        count: 1,
        sizeType: ['original', 'compressed'],
        sourceType: ['album'],
        success: res => {
          this.setData({ enableTakePhoto: false })
          let formData = {
            client_id: 'retNdnPKjkrJbYT',
            secret_key: 'vVBx2alN24q6U7xQGADWql0OFrYC+vDK',
          }
          this.getVin(res.tempFilePaths[0], formData);
        }
      })
    },
  }
})
