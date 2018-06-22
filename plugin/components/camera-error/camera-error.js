let api = require('../../api/api.js');
let s = require('../../api/services.js');
let services = s.default;

Component({

  properties: {
    vin: {
      type: String
    },
    imageSrc: {
      type: String
    }
  },

  data: {
    message: '对照您拍摄的照片进行修正后进行识别', //提示信息
    inputValue: '', //vin
    enable: false, //确定按钮是否可用
    showLoading: false, //加载图标
    imageSrc: '', //图片连接
    tag: '', //从询价单进入拍照页面标志
    pageType: '',
    inquireVinRecord: [], //本页面中查询vin的纪录
    initVin: '', //页面中首次接收到的vin
  },

  ready() {
    this.setData({
      inputValue: this.data.vin,
      initVin: this.data.vin,
    })
  },

  methods: {
    backToCamera() { //重新拍照
      this.triggerEvent('backToCamera')
    },

    sureEvent() { //开始识别按钮
      this.setData({
        showLoading: true
      });
      this.getModelInfoFn();
    },

    // 通过vin获取车型信息
    getModelInfoFn() {
      let formData = {
        client_id: 'retNdnPKjkrJbYT',
        secret_key: 'vVBx2alN24q6U7xQGADWql0OFrYC+vDK',
        vin: this.data.inputValue,
      }
      wx.request({
        url: services.epcHost + '/ocr/vin-pro',
        method: 'POST',
        data: formData,
        dataType: 'json',
        success: (res) => {
          wx.hideToast();
          let result = res.data;
          if (result.success) {
            let model;
            if (result.result.models.length > 0) { //存在车型信息
              model = JSON.stringify(result.result);
              this.triggerEvent('toIdentificationFn',{
                vin: this.data.inputValue,
                model: model,
              })
            }else{
              if (result.result.meta.is_valid === 'false') {
                this.setData({
                  enable: true,
                  showLoading: false,
                  message: '车架号有误，请您修正后再次识别',
                })
                model = JSON.stringify({
                  meta: {
                    vin: this.data.inputValue,
                    is_valid: "true",
                  },
                  models: []
                });
              } else {
                model = JSON.stringify(result.result);
              }
              this.triggerEvent('toIdentificationFn', {
                vin: this.data.inputValue,
                model: model,
              })
            }
          }
        },
        fail: (err) => {
          wx.hideToast();
          wx.showToast({
            title: '网络错误',
            image: '/images/error.png',
            duration: 1000,
            mask: true,
          })
          this.setData({
            showLoading: false
          });
          console.log(err);
        }
      })
    },

    inputEvent(event) { //input输入时触发的事件
      let value = event.detail.value.replace(/\s+/g, "").toUpperCase();
      let cursor = event.detail.cursor;

      let returnFlag = false; //解决安卓手机上删除导致闪动的问题
      if (value.length >= this.data.inputValue.length) {
        returnFlag = true;
      }
      this.data.inputValue = value;
      if (value.length >= 17) {
        this.setData({
          enable: true
        });
      } else {
        this.setData({
          enable: false
        });
      }
      if (returnFlag) {
        return {
          value,
          cursor
        }
      }
    },
    blurEvent(event) { //input失去焦点事件
      let value = event.detail.value.replace(/\s+/g, "").toUpperCase();
      this.setData({
        inputValue: value
      })
    },
  }
})