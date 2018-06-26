let api = require('../../api/api.js');
let s = require('../../api/services.js');
let services = s.default;

Component({
  properties: {
    vin: {
      type: String,
    },
    model: {
      type: Object,
    }
  },
  data: {
    isInit: true,
    isValid: true, // vin格式是否合适（通过后台请求校验）
    models: [], // 所有识别出来的车型信息
    isIdentification: false, // 是输入vin或拍照识别的车型还是手动选择的车型
    vehicle: {},

    imageSrc: '', //截取的vin码图片
    needCropParam: true, //是否需要传入截图参数
    pageType: '',
    modelInfo: null, //车型信息
    modelId: '', //车型id
    isModelId: true, //判断车型是否有model_id

    // 使用vin键盘组件需要的字段（从询价页复制）
    inputVin: '', //输入的vin码
    inputVinAry: [], //vin码拆分成的数组
    inputVinFocus: false, //vin码输入框获取焦点
    timer1: '', //vin码虚拟光标定时器
    showVinLine: false, //vin码模拟的光标线
    showKeyboardVin: false, //vin码键盘的显示
    vinImage: '', //上传的vin码图片地址
    // 使用vin键盘组件需要的字段（从询价页复制）
  },

  ready() {
    this.setData({
      inputVin: this.data.vin ? this.data.vin : '',
      inputVinAry: this.data.vin ? this.data.vin.split('') : [],
    })

    if (JSON.stringify(this.data.model) !== '{}') {
      this.getItemFromURL();
    }

    if (this.data.vin && JSON.stringify(this.data.model) === '{}') {
      this.getItemFromVIN();
    }
  },

  methods: {
    toSelectionPage() {
      this.triggerEvent('toSelectionPage');
    },
    cameraExec() {
      this.triggerEvent('toCameraFn');
    },
    clearSearch() {
      this.setData({
        inputVin: '',
        inputVinAry: []
      });
    },
    bindCopyTap() { //复制
      let self = this;
      wx.setClipboardData({ //wx:api设置系统剪贴板的内容
        data: self.data.inputVin,
        success: () => {
          wx.showToast({
            title: '已复制到剪贴板',
            icon: 'success',
            duration: 2000
          })
        }
      })
    },
    selectModelFn() { //选择车型
      this.hideKeyboardWithoutExec();
      const modelInfo = this.data.modelInfo ? this.data.modelInfo : {};

      if (modelInfo.model_id) {
        // 有model_id但没有displacement_id或year_id则用model_id去查
        if (!modelInfo.displacement_id || !modelInfo.year_id) {
          this.getModelById();
        } else {
          this.setData({
            showModal: 1,
            pageState: 'series',
            showSelectModel: true,
          })
        }
      } else if (modelInfo.series_id) {
        this.setData({
          showModal: 1,
          pageState: 'series',
          showSelectModel: true,
          searchFocus: false,
          searchText: '',
        })
      } else {
        this.setData({
          showModal: 1,
          pageState: 'brand',
          showSelectModel: true,
          searchFocus: false,
          searchText: '',
        })
      }
    },
    selectModelInit(event) {
      if (event.detail.scrollFlag) {
        this.setData({
          scrollFlag: true,
          showSelectModel: false,
        })
        return;
      }
      this.setData({
        noModelInfo: event.detail.noModelInfo,
        selectModelState: 1,
        sortIndex: '1',
        noSeriesId: false,
        showSelectModel: false,
      })
    },
    getPartList(event) {
      const {
        modelId,
        seriesId,
        modelInfo
      } = event.detail;

      this.setData({
        modelId,
        seriesId,
        modelInfo,
        // 选择车型后一定要清空vin码
        inputVin: '',
        inputVinAry: [],
      })

      if (modelId) {
        // 选择具体车型时获取的车型信息不全，所以需要根据model_id查取更多的内容
        this.getModelById()
          .then(() => {
            // 查车型页面手动选择车型
            if (this.data.pageType !== 'part') {
              this.setData({
                selectModelState: event.detail.selectModelState,
                sortIndex: event.detail.selectModelState === 1 ? '1' : '0',
                showModal: event.detail.showModal,
                pageState: event.detail.pageState,
                vehicle: event.detail.vehicle ? event.detail.vehicle : '',
                showSelectModel: false,
                isIdentification: false,
                models: [],
              })
            } else {
              this.confirmSelection();
            }
          })
      } else if (seriesId) {
        this.confirmSelection();
      }
    },
    // 选择车型或识别车型确认后返回配件列表页
    confirmSelection() {
      let modelInfo = this.data.modelInfo;
      if (modelInfo) {
        if (modelInfo.sub_brand_name && !modelInfo.manu_name) {
          modelInfo.manu_name = modelInfo.sub_brand_name;
        } else if (!modelInfo.sub_brand_name && modelInfo.manu_name) {
          modelInfo.sub_brand_name = modelInfo.manu_name;
        }

        if (modelInfo.series_name && !modelInfo.family_name) {
          modelInfo.family_name = modelInfo.series_name;
        } else if (!modelInfo.series_name && modelInfo.family_name) {
          modelInfo.series_name = modelInfo.family_name;
        }

        modelInfo.vin = this.data.inputVin;
        this.setData({
          modelId: modelInfo.model_id ? modelInfo.model_id : '',
          modelInfo,
          pageType: 'identification',
        });
      } else {
        this.setData({
          modelId: '',
          modelInfo: null,
          pageType: 'identification',
        });
      }

      this.triggerEvent('confirmSelection', {
        model: this.data.modelId,
        modelInfo: this.data.modelInfo,
        pageType: 'identification'
      })
    },
    getModelById() {
      return services.partRequest(`/car-model/get-model?model_id=${this.data.modelInfo.model_id}`)
        .then(res => {
          // 与vin-pro返回的字段统一
          res.year_id = res.model_year_id;
          res.model_id = res.id;
          res.family_name = res.series_name;
          res.year_pattern = res.model_year;
          res.engine_model = res.engine_code;
          res.gearbox_type = res.trans_type;

          let models = this.data.models;
          if (models.length > 1) {
            for (let i = 0; i < models.length; ++i) {
              if (models[i].model_id === res.id) {
                models[i] = res;
              }
            }
          } else {
            models[0] = res;
          }

          this.setData({
            modelInfo: res,
            models,
            selectModelState: 1,
            sortIndex: '1',
            noModelInfo: false,
            isInit: false,
            showModal: 1,
            pageState: 'series',
            showSelectModel: true,
          })
        }).catch(err => {
          console.log(err)
        })
    },
    
    // 从camera-error页面进入，如果要识别信息，需要从url中获取车型数据
    getItemFromURL() {
      let model = this.data.model;
      this.setData({
        inputVin: model.meta.vin,
        inputVinAry: model.meta.vin.split(''),
        modelInfo: model.models[0],
        models: model.models,
        isValid: model.meta.is_valid === 'true' ? true : false,
        isInit: false,
        isIdentification: true,
      })
    },

    getItemFromVIN() {
      wx.showToast({
        title: '正在识别',
        icon: 'loading',
        duration: 10000
      })
      let formData = {
        client_id: 'retNdnPKjkrJbYT',
        secret_key: 'vVBx2alN24q6U7xQGADWql0OFrYC+vDK',
        vin: this.data.inputVin,
      };

      return new Promise((resolve, reject) => {
        wx.request({
          url: services.epcHost + '/ocr/vin-pro',
          method: 'POST',
          data: formData,
          dataType: 'json',
          success: (res) => {
            wx.hideToast();
            let result = res.data;
            if (result.success) {
              if (result.result.meta.is_valid === 'true' || (result.result.meta.is_valid === 'false' && result.result.models.length > 0)) {
                this.setData({
                  modelInfo: result.result.models[0],
                  models: result.result.models,
                  isValid: true,
                  isInit: false,
                  isIdentification: true,
                })
              } else {
                this.setData({
                  modelInfo: null,
                  models: [],
                  isValid: false,
                  isInit: false,
                })
              }
              resolve();
            } else {
              wx.showToast({
                title: '获取信息失败',
                icon: '/images/error.png',
                duration: 1000
              })
              // this.noticeNailing();
              reject();
            }
          },
          fail: (err) => {
            wx.hideToast()
            console.log(err);
            // this.noticeNailing();
            reject();
          }
        })
      })
    },

    vinMove() { //vin光标动画
      if (this.data.showVinLine) {
        this.setData({
          showVinLine: false
        })
      } else {
        this.setData({
          showVinLine: true
        })
      }
    },

    onTouchVin(e) { //监听子组件的键盘事件执行该函数
      this.setData({
        inputVin: e.detail.inputVin,
        inputVinAry: e.detail.inputVinAry
      })
      // guanlin: 当粘贴进的17位字符串含有空格符，（在vin键盘组件内）提示vin码格式错误,在此停止往下执行
      if (e.detail.inputVin.search(/\s/g) != -1) {
        return;
      }

      if (e.detail.type === 'copy') {
        if (this.data.inputVinAry.length === 17) {
          clearInterval(this.data.timer1);
          this.setData({
            showVinLine: false,
            showKeyboardVin: false
          })
          this.getItemFromVIN();
        }
      }
    },

    inputVinFn() { //点击输入vin码
      let self = this;
      this.hideKeyboard();
      clearInterval(this.data.timer1);
      this.data.timer1 = setInterval(function(){
        self.setData({
          showVinLine: !self.data.showVinLine
        })
      }, 800);
      this.setData({
        inputVinFocus: true,
        showKeyboardVin: true,
      })
    },
    // 简单完毕键盘不进行
    hideKeyboardWithoutExec() {
      if (this.data.showKeyboardVin) {
        clearInterval(this.data.timer1);
        this.setData({
          inputVinFocus: false,
          showKeyboardVin: false,
          showVinLine: false,
        })
      }
    },
    hideKeyboard() { //隐藏键盘
      if (this.data.showKeyboardVin) { //隐藏vin码键盘
        if (this.data.inputVinAry.length > 0) {
          if (this.data.inputVinAry.length < 17) {
            wx.showModal({
              title: '提示',
              // content: '输入的vin不合法',
              content: 'vin码格式错误',
              showCancel: false,
              confirmColor: '#d7000f',
              success: res => {
                if (res.confirm) {
                  clearInterval(this.data.timer1);
                  this.setData({
                    inputVinFocus: false,
                    showKeyboardVin: false,
                    showVinLine: false,
                  })
                  // guanlin: 当已有VIN码和车型时，将原有可识别出车型的VIN码删去一位 ， 提示 vin码格式错误 ，原有车型被清空
                  // this.clearVinAndCarModelInfo();
                }
              }
            })
            return;
          } else {
            this.getItemFromVIN();
          }
        }

        clearInterval(this.data.timer1);
        this.setData({
          inputVinFocus: false,
          showKeyboardVin: false,
          showVinLine: false,
        })
      }
    },
  }
})