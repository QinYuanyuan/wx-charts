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


    imageSrc: '',//截取的vin码图片
    needCropParam: true,//是否需要传入截图参数
    pageType: '',
    modelInfo: null,//车型信息
    modelId: '',//车型id
    isModelId: true,//判断车型是否有model_id

    // 使用vin键盘组件需要的字段（从询价页复制）
    inputVin: '',//输入的vin码
    inputVinAry: [],//vin码拆分成的数组
    inputVinFocus: false,//vin码输入框获取焦点
    timer1: '',//vin码虚拟光标定时器
    showVinLine: false,//vin码模拟的光标线
    showKeyboardVin: false,//vin码键盘的显示
    vinImage: '',//上传的vin码图片地址
    // 使用vin键盘组件需要的字段（从询价页复制）
  },
  attached() {
    console.log('identification attached')
  },
  ready() {
    console.log('identification ready')

    this.setData({
      inputVin: this.data.vin ? this.data.vin : '',
      inputVinAry: this.data.vin ? this.data.vin.split('') : [],
    })
    console.log(this.data.model.models)
    if(this.data.model.models.length){
      this.getItemFromURL();
    }

    // this.setData({
    //   needCropParam: options.needCropParam ? options.needCropParam : '',
    //   imageSrc: options.imageSrc ? options.imageSrc : '',
    //   inputVin: options.vin ? options.vin : '',
    //   inputVinAry: options.vin ? options.vin.split('') : [],
    //   pageType: options.pageType ? options.pageType : '',
    //   prevPageType: options.prevPageType ? options.prevPageType : '',
    //   subPageType: options.subPageType ? options.subPageType : '',
    // })

    // if (this.data.pageType === 'cameraError') {//从camera-error页面识别成功进入
    //   console.log('从camera-error页面识别成功进入');
    //   wx.showToast({
    //     title: '获取信息成功',
    //     icon: 'success',
    //     duration: 1000
    //   })

    //   if (options.prevPageType === 'part') {
    //     this.setData({ pageType: 'part' });
    //     wx.setNavigationBarTitle({ title: '选择车型' });
    //   }
    //   this.getItemFromURL(options);

    // }else if (this.data.pageType === 'camera') { // 从公众号模板消息进来或者从分享卡片进来、从拍照页面进来
    //   if (options.prevPageType === 'part') {
    //     wx.setNavigationBarTitle({ title: '选择车型' });
    //     this.setData({
    //       pageType: 'part'
    //     });
    //   }
    //   this.getItemFromImage();

    // } else if (this.data.pageType === 'part') { // 从配件列表进入进行选车型操作
    //   if (this.data.subPageType === 'search') {
    //     this.getItemFromVIN();
    //   } else {
    //     wx.setNavigationBarTitle({ title: '选择车型' });
    //     const modelInfo = options.modelInfo === '{}' ? null : JSON.parse(options.modelInfo);
    //     // 1.如果选择车型时已有车型则直接展开选择车型侧边栏
    //     // 2.因为希望在选择车型时和查询车型表现一致，而只有model_id只能获取一条车型，所以要传递vin从而获得多条车型信息
    //     if (modelInfo) {
    //       const modelId = modelInfo.model_id ? modelInfo.model_id : '';
    //       return new Promise((resolve, reject) => {
    //         if (modelInfo.vin) {
    //           this.setData({
    //             inputVin: modelInfo.vin,
    //             inputVinAry: modelInfo.vin.split(''),
    //           });

    //           resolve(this.getItemFromVIN());
    //         } else {
    //           this.setData({
    //             modelInfo: modelInfo,
    //             inputVin: '',
    //             inputVinAry: [],
    //             isInit: false,
    //           });
    //           resolve();
    //         }
    //       })
    //         .then(() => {
    //           const models = this.data.models;
    //           // 识别出多条车型时默认展示返回的第一条车型，如果此时已选择车型有确定的model_id，需要将该车型作为当前车型
    //           if (models.length > 1 && modelId) {
    //             for (let i = 0; i < models.length; ++i) {
    //               if (models[i].model_id === modelId) {
    //                 this.setData({
    //                   modelInfo: models[i],
    //                 });
    //               }
    //             }
    //           }

    //           if (!this.data.modelInfo.model_id) {
    //             return this.getSeriesIdFn();
    //           }
    //         })
    //         .then(() => {
    //           this.selectModelFn();
    //         });

    //     } else { // 如果选择车型时没有有车型则不展开选择车型侧边栏
    //       this.setData({
    //         modelInfo: null,
    //         inputVin: '',
    //         inputVinAry: [],
    //       });
    //     }
    //   }
    // }
  },

  methods: {
    toSelectionPage() {
      this.triggerEvent('toSelectionPage');
    },
    recognizeUser() {
      // 此处需要获取user_auth来从而统计是哪用户进入
      if (app.globalData.userAuth) {
        return Promise.resolve();
      } else {
        return services.fetchCode()
          .then((code) => {
            return services._request('/token', {
              method: 'GET',
              data: { code: code },
            });
          }).then((r) => {
            if (r.success) {
              const result = r.result;
              app.globalData.token = result.token;
              app.globalData.userAuth = result.user_auth;
            } else {
              console.log(r.errors[0].error_msg);
              Promise.reject();
            }
          })
      }
    },
    statistic() {
      const date = new Date();
      let year = date.getFullYear();
      let month = date.getMonth() + 1;
      let day = date.getDate();
      let hour = date.getHours();
      let minute = date.getMinutes();

      month = month < 10 ? '0' + month : month;
      day = day < 10 ? '0' + day : day;
      hour = hour < 10 ? '0' + hour : hour;
      minute = minute < 10 ? '0' + minute : minute;


      const time = `${year}${month}${day}${hour}${minute}`
      const trans = encodeURIComponent('#')
      const query = `${this.data.inputVin}${trans}${app.globalData.userAuth}${trans}${time}`
      let url = `/metric/vintplaccess/${query}`

      return services._request(`${url}`, {
        method: 'GET',
      })
    }, // 统计公众号识别成功模版进入
    onShareAppMessage() {//分享
      return {
        path: `/pages/identification/identification?pageType=share&vin=${this.data.inputVin}`
      };
    },
    cameraExec() {
      const pageType = this.data.pageType;
      if (pageType === 'part') {
        wx.redirectTo({ url: `/pages/camera/camera?pageType=identification&prevPageType=part&subPageType=${this.data.subPageType}` });
      } else {
        wx.redirectTo({ url: `/pages/camera/camera?pageType=identification&subPageType=${this.data.subPageType}` });
      }
    },
    clearSearch() {
      this.setData({
        inputVin: '',
        inputVinAry: []
      });
    },
    bindCopyTap() {//复制
      let self = this;
      wx.setClipboardData({//wx:api设置系统剪贴板的内容
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
    getSeriesIdFn() {
      const modelInfo = this.data.modelInfo;
      if (modelInfo) {
        let subBrandName = modelInfo.manu_name ? modelInfo.manu_name : (modelInfo.sub_brand_name ? modelInfo.sub_brand_name : '');
        let seriesName = modelInfo.family_name ? modelInfo.family_name : (modelInfo.series_name ? modelInfo.series_name : '');
        if (subBrandName && seriesName) {
          return services.partRequest(`/car-series/get-series-id?sub_brand_name=${subBrandName}&series_name=${seriesName}`)
            .then((res) => {
              this.setData({
                'modelInfo.series_id': res.series_id
              })
            })
        }
      }
    },
    selectModelFn() {//选择车型
      this.hideKeyboardWithoutExec();
      const modelInfo = this.data.modelInfo ? this.data.modelInfo : {};
      console.log(modelInfo)

      if (modelInfo.model_id) {
        // 有model_id但没有displacement_id或year_id则用model_id去查
        if (!modelInfo.displacement_id || !modelInfo.year_id) {
          this.getModelById();
        } else {
          this.setData({
            showModal: 1,
            pageState: 'series',
            showSelectModel: true,
            // 'vehicle.brand_id': modelInfo.brand_id ? modelInfo.brand_id : '',
            // 'vehicle.brand_name': modelInfo.brand_name ? modelInfo.brand_name : '',
            // 'vehicle.sub_brand_name': modelInfo.sub_brand_name ? modelInfo.sub_brand_name : '',
            // 'vehicle.series_id': modelInfo.series_id ? modelInfo.series_id : this.data.seriesId ? this.data.seriesId : '',
            // 'vehicle.series_name': modelInfo.series_name ? modelInfo.series_name : '',
            // 'vehicle.year_id': modelInfo.model_year_id ? modelInfo.model_year_id : (modelInfo.year_id ? modelInfo.year_id : ''),
            // 'vehicle.year': modelInfo.year ? modelInfo.year : (modelInfo.year_pattern ? modelInfo.year_pattern : ''),
            // 'vehicle.displacement': modelInfo.displacement ? modelInfo.displacement : '',
            // 'vehicle.displacement_id': modelInfo.displacement_id ? modelInfo.displacement_id : '',
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
      const { modelId, seriesId, modelInfo } = event.detail;
      console.log(modelId)
      console.log(seriesId)

      this.setData({
        modelId,
        seriesId,
        modelInfo,
        // 选择车型后一定要清空vin码
        inputVin: '',
        inputVinAry: [],
      })

      console.log(modelInfo)
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
      // const pages = getCurrentPages();
      // let pageIndex;
      // pages.forEach((item, index) => {
      //   if (item.route.indexOf('part-purchase-list-with-parameter') >= 0) {
      //     pageIndex = index;
      //   }
      // })
      // const previousPage = pages[pageIndex];

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
        // previousPage.setData({
        //   modelId: modelInfo.model_id ? modelInfo.model_id : '',
        //   modelInfo,
        //   pageType: 'identification',
        // });
        this.setData({
          modelId: modelInfo.model_id ? modelInfo.model_id : '',
          modelInfo,
          pageType: 'identification',
        });
      } else {
        // previousPage.setData({
        //   modelId: '',
        //   modelInfo: null,
        //   pageType: 'identification',
        // });
        this.setData({
          modelId: '',
          modelInfo: null,
          pageType: 'identification',
        });
      }
      
      this.triggerEvent('confirmSelection',{
        model: this.data.modelId,
        modelInfo: this.data.modelInfo,
        pageType: 'identification'
      })
      // wx.navigateBack({ delta: pages.length - pageIndex - 1 });
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
    // 从首页的查车型进入，如果剪贴板有vin内容需要获取并解析
    getItemFromClipboard() {
      let _this = this;
      wx.getClipboardData({
        success(r) {
          const vin = r.data;
          if (reVin.test(vin)) {
            _this.setData({
              inputVin: vin,
              inputVinAry: vin.split('')
            });

            _this.getItemFromVIN();
          } else {
            _this.setData({ isInit: true });
          }
        }
      })
    },
    // 从camera-error页面进入，如果要识别信息，需要从url中获取车型数据
    getItemFromURL() {
      console.log('identification页面中接收camera-error页面的参数');

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
    
    // 通过VIN或者图片获取车型信息
    getVinAndModelFn() {
      let startTime = new Date().getTime();
      let formData;
      if (this.data.needCropParam === 'true') {
        let phoneInfo = app.globalData.systemInfo;
        formData = {
          crop_width: phoneInfo.windowWidth / 750 * 160,
          client_id: 'retNdnPKjkrJbYT',
          secret_key: 'vVBx2alN24q6U7xQGADWql0OFrYC+vDK',
          vin: this.data.inputVin,
        };
      } else {
        formData = {
          client_id: 'retNdnPKjkrJbYT',
          secret_key: 'vVBx2alN24q6U7xQGADWql0OFrYC+vDK',
          vin: this.data.inputVin,
        }
      }
      console.log('传入的截图的值', formData)
      if (this.data.imageSrc) {
        this.uploadFileFn(formData);
      } else {
        this.getModelInfoFn(formData);
      }
    },
    getItemFromImage() {
      wx.showToast({
        title: '正在识别',
        icon: 'loading',
        duration: 10000
      })
      let formData = {};
      if (this.data.needCropParam === 'true') {
        let phoneInfo = app.globalData.systemInfo;
        formData = {
          crop_width: phoneInfo.windowWidth / 750 * 160,
          client_id: 'retNdnPKjkrJbYT',
          secret_key: 'vVBx2alN24q6U7xQGADWql0OFrYC+vDK',
          vin: this.data.inputVin,
        };
      } else {
        formData = {
          client_id: 'retNdnPKjkrJbYT',
          secret_key: 'vVBx2alN24q6U7xQGADWql0OFrYC+vDK',
          vin: this.data.inputVin,
        }
      }
      console.log('传入的截图的值', formData)
      let startTime = new Date().getTime();
      wx.uploadFile({
        url: image.getVINhost + '/ocr/vin-pro',
        filePath: this.data.imageSrc,
        name: 'file_data',
        formData: formData,
        success: (res) => {
          wx.hideToast();
          let endTime = new Date().getTime();
          console.log('消耗时间', endTime - startTime);
          let result = JSON.parse(res.data);
          if (result.success) {
            wx.hideToast();
            if (result.result.models.length === 0) {
              if (result.result.meta.is_valid === 'true') {
                this.setData({
                  models: [],
                  modelInfo: null,
                  inputVin: result.result.meta.vin,
                  inputVinAry: result.result.meta.vin.split(''),
                  isValid: true,
                  isInit: false,
                })
                this.noticeNailing();
              } else {
                const pageType = this.data.pageType;
                if (pageType === 'part') {
                  wx.redirectTo({
                    url: '/pages/camera-error/camera-error?pageType=identification&prevPageType=part&vin=' + result.result.meta.vin + '&imageSrc=' + result.result.meta.path,
                  })
                } else {
                  wx.redirectTo({
                    url: '/pages/camera-error/camera-error?pageType=identification&vin=' + result.result.meta.vin + '&imageSrc=' + result.result.meta.path,
                  })
                }
              }
            } else {
              this.setData({
                models: result.result.models,
                modelInfo: result.result.models[0],
                inputVin: result.result.meta.vin,
                inputVinAry: result.result.meta.vin.split(''),
                isValid: true,
                isInit: false,
                isIdentification: true,
              })
            }
          } else {
            const pageType = this.data.pageType;
            if (pageType === 'part') {
              wx.redirectTo({
                url: '/pages/camera-error/camera-error?pageType=identification&prevPageType=part&imageSrc=' + this.data.imageSrc,
              })
            } else {
              wx.redirectTo({
                url: '/pages/camera-error/camera-error?pageType=identification&imageSrc=' + this.data.imageSrc,
              })
            }
          }
        },
        fail: (err) => {
          wx.hideToast();
          wx.redirectTo({
            url: '/pages/camera-error/camera-error?pageType=identification&vin=&imageSrc=' + this.data.imageSrc,
          })
          console.log(err);
          wx.redirectTo({
            url: '/pages/camera-error/camera-error?pageType=identification&vin=' + this.data.vin + '&imageSrc=' + this.data.imageSrc,
          })
        }
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
          url: image.getVINhost + '/ocr/vin-pro',
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
              this.noticeNailing();
              reject();
            }
          },
          fail: (err) => {
            wx.hideToast()
            console.log(err);
            this.noticeNailing();
            reject();
          }
        })
      })
    },


    getUnionid() {//获取unionid
      services.fetchCode().then(res => {
        return services.request('/public/unionid?code=' + res);
      }).then(res => {
        if (res.success) {
          this.uploadImage(res.result);
        }
      })
    },
    getToken() {//获取token
      if (app.globalData.token) {
        this.getUnionid();
      } else {
        services.fetchCode().then(res => {
          return services._request('/token?code=' + res)
        }).then(res => {
          let result = res.result;
          if (result.is_binding === 1) {
            app.globalData.token = result.token;
            wx.setStorageSync('token', result.token);
            this.getUnionid();
          }
        }).catch(err => {
          console.log(err)
        })
      }
    },
    noticeNailing() {//获取图片路径
      image._uploadImage('/images', this.data.imageSrc, 'key').then(res => {
        if (res.success) {
          this.setData({
            requestImagePath: res.result
          })
          this.getToken();
        }
      }).catch(err => {
        console.log(err)
      })
    },
    uploadImage(unionid) {//通知钉钉
      services._request('/vins/fail', { method: 'POST', data: { union_id: unionid, pic_url: this.data.requestImagePath } });
    },



    vinMove() {//vin光标动画
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

    onTouchVin(e) {//监听子组件的键盘事件执行该函数
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

    inputVinFn() {//点击输入vin码
      this.hideKeyboard();
      clearInterval(this.data.timer1);
      this.data.timer1 = setInterval(this.vinMove, 800);
      this.setData({
        inputVinFocus: true,
        showKeyboardVin: true,
      })
      // this.data.carModelInfo = this.data.carModelInfo.replace(/\s+/g, '');
      // if (this.data.carModelInfo && this.data.partsInfo.length) {
      //   wx.showModal({
      //     title: '提示',
      //     content: '更改车型后，已选配件可能无法适配。',
      //     confirmColor: '#d61323',
      //     success: (res) => {
      //       if (res.confirm) {
      //         clearInterval(this.data.timer1);
      //         this.data.timer1 = setInterval(this.vinMove, 800);
      //         this.setData({
      //           inputVinFocus: true,
      //           showKeyboardVin: true,
      //         })
      //       } else if (res.cancel) {
      //         console.log('用户点击了取消')
      //       }
      //     }
      //   })
      // } else {

      // }
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
    hideKeyboard() {//隐藏键盘
      if (this.data.showKeyboardVin) {//隐藏vin码键盘
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
