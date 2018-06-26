let api = require('../../api/api.js');
let s = require('../../api/services.js');
let services = s.default;
let height = api.getSystemInfo().windowHeight;
let width = api.getSystemInfo().windowWidth;

Component({
  properties: {
    modelId: {
      type: String,
    },
    selectModelState: {
      type: Number,
    },
    showModal: {
      type: Number,
    },
    pageState: {
      type: 'String',
    },
    noModelInfo: {
      type: Boolean,
    },
    modelInfo: {
      type: Object,
    },
    noSeriesId: {
      type: Boolean,
    },
    search: {
      type: Object,
    },
    categoryId: {
      type: String,
    },
    categoryName: {
      type: String,
    }
  },

  data: {
    screenHeight: height / ( width / 750) , //设置height
    sBottom: height / (width / 750),

    tabState: '', //搜索结果中的tab状态
    showResultList: [], //各个tab下的结果展示列表

    // 配件
    part: {
      list: [],
      status: {
        hasMore: true,
        isVoid: false,
      },
      page: 1,
    },

    source: '',

    motorInfo: {},
    showSelectModel: false, //引导用户选择车型标志

    index: -1,
    categoryParentId: '',
    // categoryName: '',
    sortIndex: '0',
    importAttr: [], //显示的重要参数
    commonAttr: [], //筛选的参数
    isShowBg: false,
    showScreening: true, //控制品类下更多按钮的显示
    showScreeningBox: false, //控制筛选的列表
    selectProperty: [], // 保存的是选中的两个重要属性
    selectAry: [], //保存的是选中的品类和品牌
    firstPropIndex: 0, //第一个重要属性的索引
    secondPropIndex: 0, //第二个重要属性的索引
    propertyList: [], //点击属性获取的属性列表
    screeningProperty: [], //筛选的属性集合
    firstImportProperty: {}, //选择的第一个重要属性
    secondImportProperty: {}, //选择的第二个重要属性
    backStatus: 0,
    screeningIndex: 0, // 筛选中的属性的索引值
    isFetching: false,

    selectModelState: 0, // 车型选择标志 0:当前无车型选择 1:有车型
    showModal: 0, //车型选择的模态框
    searchFocus: false, //搜索框是否聚焦
    searchText: '', //搜索框中的文本
    seriesId: '', //车系id

    vehicle: {},
    popType: '', // 展示弹框类型
    alphaPos: '', // 品牌滚动位置
    brandId: '', // 已选品牌Id
    letterList: [], // 品牌字母数组
    brandsList: {}, // 品牌数据对象
    categoryList: [], // 品类数组
    propertyData: [], //某一品类下所有的属性的值
    allCommonAttr: [], //某一品类下的所有的侧边栏下的属性
    allImportAttr: [], //某一品类下的重要属性
    // propertyList: [],
    conditions: [{ // 筛选栏 item
      text: '配件品类',
      popType: 'cats'
    }, {
      text: '配件品牌',
      popType: 'brand'
    }, {
      text: '筛选',
      popType: 'property'
    }],
    noSeriesId: false, //公众号进入无modelId且通过车型子品牌名称获取不到车系Id则置为true
    pageType: '', // 从什么页面进入, identification: 查车型
    isOpenInfo: false, //车型信息是否展开
    importAttrIndex: 0, //重要属性中的索引
    showImportAttr: false, //是否显示重要参数
    selectImportProperty: {}, //选择的重要属性中的类型
    activeIcon: '', //重要参数下的箭头
    moreStyle: false, // 重要参数下的更多按钮是否高亮
    allFilterId: '', //所有滤清器的id
    allBrakeId: '', //所有制动系统的id
    allFilterSelected: false, //滤清器下的全部是否选中
    allBrakeSelected: false, //制动系统下的全部是否选中
    focus: true,
    showTip: false,
    searchFlag: false,
  },

  attached() {
    this.setData({
      allFilterSelected: this.data.categoryId && this.data.categoryId === '25,26,27,28' ? true : false,
      allBrakeSelected: this.data.categoryId && this.data.categoryId === '18,19,3718,3719' ? true : false,
    })

    // 当车型信息中没有model_id时，要通过车型信息的子品牌名称和车系名称获取该series_id，然后通过series_id来进行配件的筛选
    if (JSON.stringify(this.data.modelInfo) !== '{}' && !this.data.modelInfo.model_id) {
      this.getSeriesIdFn();
    }

    this.getPartListFromEpc();
    this.getModelByIdFn();
    if (this.data.categoryId){
      this.getPartAttrFromEpc();
    }
  },
  ready() {
  },

  methods: {
    scrollFn(){
      this.getMorePartListFromEpc()
    },
    toCameraFn(){
      this.triggerEvent('toCameraFn')
    },
    toDetailFn(e) {
      this.triggerEvent('toDetailFn',{
        psn: e.detail.psn,
        category_id: e.detail.category_id
      })
    },
    toIdentificationFn(e){
      this.triggerEvent('toIdentificationFn',{
        vin: e.detail.vin
      })
    },
    // getToken() {//获取token
    //   if (app.globalData.token) {
    //     return this.getUnionid();
    //   } else {
    //     return services.fetchCode().then(res => {
    //       return services._request(`/token?code=${res}`)
    //     }).then(res => {
    //       if (res.success) {
    //         let result = res.result;
    //         if (result.is_binding === 1) {
    //           app.globalData.token = result.token;
    //           app.globalData.userAuth = result.user_auth;
    //           return this.getUnionid();
    //         } else {
    //           this.setData({
    //             step: 1
    //           })
    //           wx.hideToast();
    //         }
    //       } else {
    //         wx.showToast({
    //           title: res.errors[0].error_msg,
    //           icon: 'none',
    //           duration: 1000
    //         })
    //       }

    //     }).catch(err => {
    //       wx.hideToast();
    //       wx.showToast({
    //         title: '网络错误',
    //         icon: 'none',
    //         duration: 1000
    //       })
    //       console.log(err)
    //     })
    //   }
    // },

    getSearchPartList(e) {
      let data = e.detail;
      this.data.categoryList.forEach((property) => {
        if (property.children) {
          property.children.forEach((item) => {
            item.selected = false;
          })
        }
      })
      if (this.data.categoryId) {
        let haveBrandFlag = false;
        for (let key in this.data.brandList) {
          this.data.brandList[key].forEach((item, index) => {
            if (item.brand_id === data.brand_id) {
              haveBrandFlag = true;
              return;
            }
          })
        }
        if (!haveBrandFlag) {
          this.setData({
            categoryName: '',
            categoryId: '',
          })
        }
      }

      if (data.series_id) {
        this.setData({
          seriesId: data.series_id ? data.series_id : this.data.seriesId,
          seriesName: data.series_name ? data.series_name : this.data.seriesName,
          categoryList: this.data.categoryList,
        });
      } else {
        this.setData({
          categoryName: data.category_name ? data.category_name : this.data.categoryName,
          categoryId: data.category_id ? data.category_id : this.data.categoryId,
          brandName: data.brand_name ? data.brand_name : '',
          brandId: data.brand_id ? data.brand_id : '',
          seriesId: data.series_id ? data.series_id : this.data.seriesId,
          seriesName: data.series_name ? data.series_name : this.data.seriesName,
          categoryList: this.data.categoryList,
        });
      }

      // 没有品类不支持筛选
      if (!data.category_id) {
        this.setData({
          showScreening: false
        });
      }

      // 通过车系获取车型信息
      if (!this.data.model_id && data.series_id) {
        this.getModelBySeriesId().then(() => {
          this.setModelInfo();
        });
      }

      // 如果筛选条件有品类信息，则可以进行进一步的筛选
      if (this.data.categoryId) {
        this.setData({
          selectAry: [{
            category_id: this.data.categoryId,
            name: this.data.categoryName
          }],
        });

        if (this.data.brandId) {
          this.setData({
            selectAry: [...this.data.selectAry, {
              brand_id: this.data.brandId,
              name: this.data.brandName
            }],
          });
        }

        this.getBrands();
        this.getPartAttrFromEpc();
      } else {
        if (this.data.brandId) {
          this.setData({
            selectAry: [...this.data.selectAry, {
              brand_id: this.data.brandId,
              name: this.data.brandName
            }],
          });
        }
      }
      this.pageShowFn();
    },

    pageShowFn() {
      return new Promise((resolve, reject) => {

        const _data = this.data;
        const pageType = _data.pageType;
        // 从公众号进入获取会话信息
        // if ((app.globalData.scene === 1035 && app.globalData.pageType === '1') || (app.globalData.scanCodeFlag && app.globalData.pageType === '1')) {
        if (pageType === 'public') {
          console.log('扫码进入该页面', app.globalData.scene)
          // app.globalData.pageType = '2';
          resolve(this.getToken());
        } else {

          if (pageType === 'identification') { // 从查询车型页面进行适配查询
            // 查车型页面进入有两种进入方式
            // 1.首页查车型按钮-查车型页面查适配进入
            // 2.首页品牌件按钮-选择车型按钮-查车型页面选择车型或识别后确认按钮进入
            // 
            // 有四种车型情况
            // 1.有model_id，则直接展示url中传入的modelinfo信息，并利用modelinfo里的model_id筛选配件列表
            // 2.没有model_id有series_id，则直接展示url中传入的modelinfo信息，并利用modelinfo里的series_id筛选配件列表
            // 3.没有series_id但有子品牌名称sub_brand_name和车系名称series_name，用sub_brand_name和series_name查series_id在进行2
            // 4.都没有，不做任何处理
            // 2和3在getSeriesIdFn函数中已做出处理

            const modelInfo = _data.modelInfo ? _data.modelInfo : {};
            if (modelInfo.model_id) {
              this.setData({
                modelId: modelInfo.model_id,
                seriesId: '',
              })
              this.setModelInfo();
              resolve();
            } else if (modelInfo.series_id) {
              this.setData({
                modelId: '',
                seriesId: modelInfo.series_id,
              })
              this.setModelInfo();
              resolve();
            } else {
              resolve(this.getSeriesIdFn());
            }
          } else if (pageType === 'car-info-selection') { // carmera-identify-fail手动选择车型适配会从url中传入model_id字段
            // 手动选择车型一定有model_id
            resolve(this.getModelByIdFn());
          }
          resolve();
        }
      }).then(() => {
        return this.getPartListFromEpc()
      })
    },

    initSearch(e) {
      this.setData({
        search: e.detail.search,
        showTip: false,
        searchFlag: false,
      })
    },

    // getUnionid() {//获取unionid
    //   return services.fetchCode().then(res => {
    //     return services.request(`/public/unionid?code=${res}`)
    //   }).then((res) => {
    //     if (res.success) {
    //       return this.getData(res.result);
    //     } else {
    //       wx.showToast({
    //         title: res.errors[0].error_msg,
    //         icon: 'none',
    //         duration: 1000
    //       })
    //       return Promise.reject();
    //     }
    //   })
    // },
    // getData(unionid) {//获取草稿和公众号信息
    //   let url;
    //   if (unionid) {
    //     url = `/ticketdraft?union_id=${unionid}`;
    //   } else {
    //     url = `/ticketdraft`;
    //   }
    //   if (!app.globalData.token) {
    //     this.setData({
    //       step: 1
    //     })
    //     return;
    //   }
    //   return services.request(url).then(res => {
    //     if (res.success) {
    //       const public_record = res.result.public_record;
    //       let modelInfo = public_record ? public_record.vehicle : null;

    //       if (modelInfo) {
    //         // 选择车型时展示已选车型信息时差字段，所以需要获取vin重新识别获取信息
    //         modelInfo.vin = public_record.vin;
    //         this.setData({ modelInfo });
    //         if (modelInfo.model_id) {
    //           return this.getModelByIdFn();
    //         } else {
    //           return this.getSeriesIdFn();
    //         }
    //       }
    //     } else {
    //       wx.showToast({
    //         title: res.errors[0].error_msg,
    //         icon: 'none',
    //         duration: 1000
    //       })
    //     }
    //   }).catch(err => {
    //     wx.showToast({
    //       title: '网络错误',
    //       icon: 'none',
    //       duration: 1000
    //     })
    //     console.log(err)
    //   })
    // },
    getSeriesIdFn() {
      const modelInfo = this.data.modelInfo;
      if (modelInfo) {
        let subBrandName = modelInfo.manu_name ? modelInfo.manu_name : (modelInfo.sub_brand_name ? modelInfo.sub_brand_name : '');
        let seriesName = modelInfo.family_name ? modelInfo.family_name : (modelInfo.series_name ? modelInfo.series_name : '');
        if (subBrandName && seriesName) {
          return services.partRequest(`/car-series/get-series-id?sub_brand_name=${subBrandName}&series_name=${seriesName}`)
            .then((res) => {
              const seriesId = res.series_id;
              if (!seriesId) {
                this.setData({
                  selectModelState: 0,
                  noSeriesId: true,
                })
              } else {
                this.setData({
                  seriesId,
                  'modelInfo.series_id': seriesId,
                  noSeriesId: false,
                });
                this.setModelInfo();
              }

            }).catch((err) => {
              console.log(err);
            });
        } else {
          this.setData({
            selectModelState: 0,
            noSeriesId: true,
          })
        }
      } else {
        this.setData({
          selectModelState: 0,
          noSeriesId: true,
        })
      }
    },
    setModelInfo() {
      const modelInfo = this.data.modelInfo;
      if (modelInfo.model_id) {
        this.setData({
          noModelInfo: false
        });
      } else {
        this.setData({
          noModelInfo: true
        });
      }

      this.setData({
        selectModelState: 1,
        sortIndex: '1',
      });
    },
    selectModelFn() { //选择车型
      let modelInfo = this.data.modelInfo ? this.data.modelInfo : {};
      modelInfo = JSON.stringify(modelInfo);
      this.triggerEvent('toSelectModelFn',{
        modelInfo: modelInfo
      })
    },
    selectModelInit(event) {
      this.setData({
        noModelInfo: event.detail.noModelInfo,
        selectModelState: 1,
        sortIndex: '1',
        noSeriesId: false,
        showSelectModel: false,
      })
    },
    getModelByIdFn() { // 通过modelId获取车型信息
      const modelInfo = this.data.modelInfo;
      const vin = modelInfo.vin;
      return services.partRequest(`/car-model/get-model?model_id=${modelInfo.model_id}`)
        .then(res => {
          if (res) {
            res.vin = vin;
            res.model_id = res.id;
            this.setData({
              modelId: res.id,
              modelInfo: res,
              selectModelState: 1,
              sortIndex: '1',
              noModelInfo: false,
            })
          } else {
            return Promise.reject();
          }
        })
    },
    getModelBySeriesId() {
      return services._request(`/cars/series/${this.data.seriesId}`)
        .then(r => {
          if (r.success) {
            if (r.result) {
              let result = r.result;
              result.manu_name = result.sub_brand_name; // 统一子品牌字段
              result.family_name = result.series_name; // 统一车系字段
              this.setData({
                modelInfo: result
              });
            } else {
              // series_id为查处上级车型，则在选择车型展开具体信息时只展开到品牌级别，所以不应传入serise_id
              let modelInfo = {};
              modelInfo.series_name = this.data.seriesName;
              modelInfo.family_name = this.data.seriesName;
              this.setData({
                modelInfo
              });
            }
          }
        })
    },

    searchFocus() { // 触发搜索栏正在搜索状态
      this.setData({
        'search.status': false
      });
      this.setMask();
    },

    // isUnionId(url) {
    //   wx.showToast({
    //     title: '正在加载',
    //     icon: 'loading',
    //     duration: 10000,
    //     mask: true,
    //   })
    //   return services.fetchCode()
    //     .then(code => {
    //       return services._request('/unionids', {
    //         data: {
    //           code: code
    //         },
    //       });
    //     })
    //     .then(res => {
    //       wx.hideToast();
    //       if (res.success) {
    //         let result = res.result;
    //         if (result.code === 4007 || result.code === '4007') {
    //           wx.showModal({
    //             title: '提示',
    //             content: '请先关注公众号“阿乐汽配”，再来操作哦',
    //             showCancel: false,
    //             confirmColor: '#d7000f',
    //           })
    //         } else {
    //           wx.navigateTo({ url: `${url}` });
    //         }
    //       } else {
    //         wx.showToast({
    //           title: '网络错误',
    //           image: '/images/error.png',
    //           duration: 2000,
    //           mask: true,
    //         })
    //       }
    //     })
    //     .catch((err) => {
    //       wx.hideToast();
    //       wx.showToast({
    //         title: '网络错误',
    //         image: '/images/error.png',
    //         duration: 2000,
    //         mask: true,
    //       })
    //     })
    // },

    setMask() {
      this.setData({
        'search.isInputing': true
      });
    },
    putMask() {
      this.setData({
        'search.isInputing': false
      });
    },

    initPartList() { // 每次重新请求配件列表时需要将配件列表状态回置
      this.setData({
        'part.list': [],
        'part.status.hasMore': true,
        'part.status.isVoid': false,
        'part.page': 1,
      });
    },
    getPartListFromEpc(event) {
      if (!this.data.isFetching) {
        this.setData({
          isFetching: true
        });
        this.initPartList();
        let property = this.data.selectProperty.filter((item, index) => {
          return item != null;
        })

        let categoryId, paramData;
        if (this.data.categoryId.indexOf(',') > 0) {
          let ary = this.data.categoryId.split(',');
          categoryId = ary[0];
          paramData = {
            page: 1,
            brand_id: this.data.brandId,
            model_id: this.data.modelId,
            property: JSON.stringify(property),
            model_id: this.data.modelId ? this.data.modelId : '',
            series_id: this.data.seriesId ? this.data.seriesId : '',
            with_categories: this.data.categoryId ? this.data.categoryId : '',
          }
        } else {
          categoryId = this.data.categoryId;
          paramData = {
            page: 1,
            brand_id: this.data.brandId,
            model_id: this.data.modelId,
            property: JSON.stringify(property),
            model_id: this.data.modelId ? this.data.modelId : '',
            series_id: this.data.seriesId ? this.data.seriesId : '',
          }
        }

        return services._request(`/groups/4/category-virtual/${categoryId ? categoryId : '1'}/parts`, {
            data: paramData,
            config: {
              isRefresh: true,
              isEpc: true,
            }
          })
          .then((r) => {
            if (r.success) {
              const result = r.result.items;
              if (result.length === 0) {
                this.setData({
                  'part.status.isVoid': true,
                  'part.status.hasMore': false,
                  'part.list': [],
                  isFetching: false,
                })
              } else {
                // 统一从batman和epc请求的数据格式
                result.forEach(item => {
                  item.brand_name = item.brand_manu_name;
                  item.part_detail = {};
                  item.part_detail.psn = item.psn;
                  item.part_detail.pn = item.pn;
                  item.part_detail.name = item.part_name;
                  item.part_detail.category_id = item.category_id;
                  item.part_detail.pmanu_code = item.pmanu_code;
                  item.part_detail.part_model = item.part_model;
                  item.part_detail.brand_id = item.brand_id;
                  item.part_detail.brand_name = item.brand_manu_name;
                  item.part_detail.pmanu_addr = item.pmanu_addr;
                });

                this.setData({
                  'part.list': result,
                  isFetching: false,
                })
              }
            } else {
              this.setData({
                isFetching: false,
              })
              console.log(r.errors[0].error_msg)
            }
          })
      } else {
        return Promise.resolve();
      }
    },


    getMorePartListFromEpc() {
      if (!this.data.isFetching && this.data.part.status.hasMore) {
        this.setData({
          isFetching: true
        });
        let property = this.data.selectProperty.filter((item, index) => {
          return item != null;
        })
        let categoryId, paramData;
        if (this.data.categoryId.indexOf(',') > 0) {
          let ary = this.data.categoryId.split(',');
          categoryId = ary[0];
          paramData = {
            page: this.data.part.page + 1,
            brand_id: this.data.brandId,
            model_id: this.data.modelId,
            property: JSON.stringify(property),
            key_words: this.data.search.actualQuery,
            model_id: this.data.modelId ? this.data.modelId : '',
            series_id: this.data.seriesId ? this.data.seriesId : '',
            order_by: this.data.sortIndex === '0' ? 2 : 1,
            with_categories: this.data.categoryId ? this.data.categoryId : '',
          }
        } else {
          categoryId = this.data.categoryId;
          paramData = {
            page: this.data.part.page + 1,
            brand_id: this.data.brandId,
            model_id: this.data.modelId,
            property: JSON.stringify(property),
            key_words: this.data.search.actualQuery,
            model_id: this.data.modelId ? this.data.modelId : '',
            series_id: this.data.seriesId ? this.data.seriesId : '',
            order_by: this.data.sortIndex === '0' ? 2 : 1,
          }
        }

        return services._request(`/groups/4/category-virtual/${categoryId ? categoryId : '1'}/parts`, {
            data: paramData,
            config: {
              isEpc: true,
            }
          })
          .then((r) => {
            if (r.success) {
              const result = r.result.items;
              if (result.length === 0) {
                this.setData({
                  'part.status.hasMore': false,
                  isFetching: false,
                })
              } else {
                // 统一从batman和epc请求的数据格式
                result.forEach(item => {
                  item.brand_name = item.brand_manu_name;
                  item.part_detail = {};
                  item.part_detail.psn = item.psn;
                  item.part_detail.pn = item.pn;
                  item.part_detail.name = item.part_name;
                  item.part_detail.category_id = item.category_id;
                  item.part_detail.pmanu_code = item.pmanu_code;
                  item.part_detail.part_model = item.part_model;
                  item.part_detail.brand_id = item.brand_id;
                  item.part_detail.brand_name = item.brand_manu_name;
                  item.part_detail.pmanu_addr = item.pmanu_addr;
                });

                this.setData({
                  'part.list': [...this.data.part.list, ...result],
                  'part.page': this.data.part.page + 1,
                  isFetching: false,
                })
              }
            } else {
              this.setData({
                isFetching: false,
              })
              console.log(r.errors[0].error_msg)
            }
          })
          .catch((e) => {
            this.setData({
              isFetching: false,
            })
          })
      } else {
        return Promise.resolve();
      }
    },



    // recognizeUser() {
    //   // 此处需要获取user_auth来获取相关用户自定义价格表和该价格表下的配件详情价格
    //   console.log(app.globalData)
    //   if (app.globalData.token && app.globalData.userAuth) {
    //     return Promise.resolve();
    //   } else {
    //     return services.fetchCode({ config: { isRefresh: true } }).then((code) => {
    //       return services._request('/token', {
    //         method: 'GET',
    //         data: { code: code },
    //         config: {
    //           isRefresh: true,
    //         }
    //       });
    //     }).then((r) => {
    //       if (r.success) {
    //         let result = r.result;
    //         app.globalData.token = result.token;
    //         app.globalData.userAuth = result.user_auth;
    //       } else {
    //         console.log(r.errors[0].error_msg)
    //       }
    //     }).catch((e) => {
    //       console.log(e)
    //     })
    //   }
    // },

    checkDetail(e) {
      let categoryId = Number(e.currentTarget.dataset.psn.substr(1, 4)); //psn中的第1到第5位是categoryId
      this.triggerEvent('toDetailFn',{
        psn: e.currentTarget.dataset.psn,
        category_id: categoryId
      })
    },

    getBrands() { //通过配件id获取品牌
      return services._request(`/categorys/${this.data.categoryId}/brands`)
        .then((r) => {
          this.setData({
            brandsList: r.result
          })
        }).catch((err) => {
          console.log(err)
        })
    },
    getPartAttr() { //进入页面获取该配件的所有属性
      let result = [];
      let selectProperty = [];
      this.data.selectProperty.forEach(function(item) {
        selectProperty.push(item.property_value_id)
        if (item.property_value_id) {
          result.push({
            property_id: item.property_id,
            property_value_id: item.property_value_id
          })
        }
      })
      return services._request(`/parts/ext`, {
        data: {
          category_id: this.data.categoryId || '',
          brand_id: this.data.brandId || '',
          model_id: this.data.modelId || '',
          pv_ids: JSON.stringify(result)
        },
      }).then((r) => {
        if (r.success) {
          this.formatPartAttr(r.result);
          if (r.result.length === 0) {
            this.formatPartAttr(this.data.propertyData);
            this.setData({
              // propertyData: JSON.parse(JSON.stringify(r.result)),
              allCommonAttr: JSON.parse(JSON.stringify(this.data.commonAttr)),
              allImportAttr: JSON.parse(JSON.stringify(this.data.importAttr)),
            })
            // this.setData({ selectProperty: []})
          }
          if (this.data.selectProperty.length === 0) {
            this.setData({
              propertyData: JSON.parse(JSON.stringify(r.result)),
              allCommonAttr: JSON.parse(JSON.stringify(this.data.commonAttr)),
              allImportAttr: JSON.parse(JSON.stringify(this.data.importAttr)),
            })
          }
          let arr = r.result;
          this.data.importAttr.forEach(function(property) {
            property.values.forEach(function(item) {
              if (selectProperty.indexOf(item.property_value_id) > -1) {
                item.selected = true;
                property.selected = true;
              }
            })
          })
          this.data.commonAttr.forEach(function(property) {
            property.values.forEach(function(item) {
              if (selectProperty.indexOf(item.property_value_id) > -1) {
                item.selected = true;
              }
            })
          })

          this.setData({
            propertyList: arr,
            commonAttr: this.data.commonAttr,
            importAttr: this.data.importAttr,
          })
        } else {}
      }).catch(err => {
        console.log(err)
      })
    },
    getPartAttrFromEpc() { //进入页面获取该配件的所有属性
      let result = [];
      // this.data.selectProperty.filter((item, index) => {
      //   return item != null;
      // })

      let selectProperty = [];
      this.data.selectProperty.forEach(function(item) {
        selectProperty.push(item.property_value_id)
        if (item.property_value_id) {
          result.push({
            property_id: item.property_id,
            property_value_id: item.property_value_id
          })
        }
      })
      return services._request(`/groups/4/category-virtual/${this.data.categoryId ? this.data.categoryId : ''}/part-exts`, {
        data: {
          brand_id: this.data.brandId || '',
          model_id: this.data.modelId || '',
          pv_ids: JSON.stringify(result)
        },
        config: {
          isEpc: true,
        },
      }).then((r) => {
        if (r.success) {
          this.formatPartAttr(r.result);
          if (r.result.length === 0) {
            this.formatPartAttr(this.data.propertyData);
            this.setData({
              // propertyData: JSON.parse(JSON.stringify(r.result)),
              allCommonAttr: JSON.parse(JSON.stringify(this.data.commonAttr)),
              allImportAttr: JSON.parse(JSON.stringify(this.data.importAttr)),
            })
            // this.setData({ selectProperty: []})
          }
          if (this.data.selectProperty.length === 0) {
            this.setData({
              propertyData: JSON.parse(JSON.stringify(r.result)),
              allCommonAttr: JSON.parse(JSON.stringify(this.data.commonAttr)),
              allImportAttr: JSON.parse(JSON.stringify(this.data.importAttr)),
            })
          }
          let arr = r.result;
          this.data.importAttr.forEach(function(property) {
            property.values.forEach(function(item) {
              if (selectProperty.indexOf(item.property_value_id) > -1) {
                item.selected = true;
                property.selected = true;
              }
            })
          })
          this.data.commonAttr.forEach(function(property) {
            property.values.forEach(function(item) {
              if (selectProperty.indexOf(item.property_value_id) > -1) {
                item.selected = true;
              }
            })
          })

          this.setData({
            propertyList: arr,
            commonAttr: this.data.commonAttr,
            importAttr: this.data.importAttr,
          })
        } else {}
      }).catch(err => {
        console.log(err)
      })
    },

    formatPartAttr(attrs) { //对获取到的属性进行分组
      let importAttr = []; //重要的属性
      let commonAttr = []; //普通属性
      if (attrs.length > 3) {
        attrs.forEach(item => {
          if (item.is_important == 1) {
            importAttr.push({
              property_id: item.property_id,
              pty_type: item.pty_type,
              property_name: item.property_name,
              // value: format.formatAttr(item.property_id, item.property_name, item.values)
              values: item.values,
            });
          } else {
            commonAttr.push({
              property_id: item.property_id,
              property_name: item.property_name,
              pty_type: item.pty_type,
              // value: format.formatAttr(item.property_id, item.property_name, item.values)
              values: item.values,
            });
          }
        })
        let newAry = importAttr.splice(3)
        commonAttr = newAry.concat(commonAttr)
      } else {
        attrs.forEach(item => {
          importAttr.push({
            property_id: item.property_id,
            property_name: item.property_name,
            pty_type: item.pty_type,
            // value: format.formatAttr(item.property_id, item.property_name, item.values)
            values: item.values,
          });
        })
      }
      if (!commonAttr.length) {
        this.setData({
          showScreening: false
        });
      } else {
        this.setData({
          showScreening: true
        });
      }
      importAttr.forEach((item, index) => {
        item.values.forEach((childItem, childIndex) => {
          if (childItem.selected) {
            item.selected = true;
          }
        })
      })
      this.setData({
        importAttr,
        commonAttr,
      })
    },
    initSort() {
      const _data = this.data;
      if (!_data.firstImportProperty.child_id && !_data.secondImportProperty.child_id && _data.screeningProperty.length === 0) {
        this.setData({
          sortIndex: '0'
        });
      } else {
        this.setData({
          sortIndex: '1'
        });
      }
    },
    selectParaFn(event) { //选择属性条件
      let index = event.currentTarget.dataset.index;
      if (index == this.data.index) {
        this.setData({
          index: -1,
          isShowBg: false
        })
      } else {
        this.setData({
          index: event.currentTarget.dataset.index,
          screeningIndex: 0,
          isShowBg: true
        })
        this.getPartAttrFromEpc();
      }
    },
    selectSort(e) {
      const sortIndex = e.currentTarget.dataset.sort_index;
      this.setData({
        sortIndex,
        isShowBg: false,
        index: -1
      });
      this.getPartListFromEpc()
    },
    selectBrand(e) { //选择品牌
      const id = (e.currentTarget.dataset.id === this.data.brandId) ? '' : e.currentTarget.dataset.id;
      const brandName = (e.currentTarget.dataset.id === this.data.brandId) ? '' : e.currentTarget.dataset.name;
      let self = this;
      setTimeout(function() {
        self.setData({
          popType: ''
        })
      }, 300)
      this.setData({
        brandId: id,
        brandName: brandName,
        page: 1,
        partLists: [],
        selectProperty: [],
        letterList: [],
        moreStyle: false,
        // firstPropIndex: 0,
        // secondPropIndex:0,
        // showNoneResult: false,
        // isFirst: true,
        // selectAry: this.data.selectAry,
        // firstImportProperty: {},
        // secondImportProperty: {},
        // screeningProperty: [],
      })
      this.getPartAttrFromEpc();
      this.getPartListFromEpc()
    },
    selectAllBrand() {
      let self = this;
      this.setData({
        brandId: '',
        brandName: '',
        page: 1,
        partLists: [],
      })
      this.getPartListFromEpc()
      setTimeout(function() {
        self.setData({
          popType: ''
        })
      }, 300)
    },
    clearSelect(event) { //清除选中的条件
      let data = event.currentTarget.dataset;
      if (data.cateid) {
        let seriesId = this.data.seriesId ? this.data.seriesId : '';
        wx.redirectTo({
          url: `/pages/part-purchase-list/part-purchase-list-in-tab/part-purchase-list-in-tab?series_id=${seriesId}&pageState=2`
        })
      } else if (data.brandid) {
        if (this.data.selectAry.length === 2) {
          let newSelectAry = this.data.selectAry.filter(item => {
            return item.brand_id != data.brandid
          })
          this.setData({
            brandId: '',
            index: -1,
            page: 1,
            isFirst: true,
            partLists: [],
            isShowBg: false,
            showScreeningBox: false,
            showNoneResult: false,
            selectAry: newSelectAry,
            selectProperty: [],
            firstImportProperty: {},
            secondImportProperty: {},
            screeningProperty: []
          })
          this.getPartAttrFromEpc();
          this.getPartListFromEpc()
        } else {
          let seriesId = this.data.seriesId ? this.data.seriesId : '';
          wx.redirectTo({
            url: `/pages/part-purchase-list/part-purchase-list-in-tab/part-purchase-list-in-tab?series_id=${seriesId}&pageState=2`
          })
        }
      }
    },
    hideSelectBox(event) { //隐藏选择区域
      this.data.search.status = 1;
      if (this.data.type === 'property') {
        this.setData({
          selectProperty: [],
          // propertyList: Object.assign([], ...this.data.propertyList),
          popType: '',
          search: this.data.search
        })
      }
      this.setData({
        popType: ''
      })
    },
    selectImportGroup(event) { //选择左侧分组
      if (this.data.index == 0) {
        this.setData({
          firstPropIndex: event.currentTarget.dataset.index
        })
      } else if (this.data.index == 1) {
        this.setData({
          secondPropIndex: event.currentTarget.dataset.index
        })
      }

    },
    deleteImportProperty(event) {
      let valueId = event.currentTarget.dataset.valueId;
      let property = this.data.selectProperty;
      for (let i = 0; i < property.length; i++) {
        if (property[i].property_value_id === valueId) {
          property.splice(i, 1)
          break
        }
      }
      this.setData({
        selectProperty: property,
      })
      this.getPartAttrFromEpc();
    },
    selectImportProperty(event) { //选择属性
      let propertyIndex = event.currentTarget.dataset.pIndex;
      let index = event.currentTarget.dataset.index;

      let propertyId = this.data.commonAttr[propertyIndex].property_id;
      let valueId = this.data.commonAttr[propertyIndex].values[index].property_value_id

      let bool = this.data.commonAttr[propertyIndex].values[index].selected;
      let property = this.data.selectProperty;
      if (!bool) {
        this.data.commonAttr[propertyIndex].values.forEach(function(item) {
          item.selected = false;
        })
        this.data.commonAttr[propertyIndex].values[index].selected = true;
        property.push({
          property_name: this.data.commonAttr[propertyIndex].property_name,
          property_id: propertyId,
          property_value_id: valueId,
          property_value: this.data.commonAttr[propertyIndex].values[index].property_value
        })
      } else {
        this.data.commonAttr[propertyIndex].values[index].selected = false;
        for (let i = 0; i < property.length; i++) {
          if (property[i].property_value_id === valueId && property[i].property_id === propertyId) {
            property.splice(i, 1);
            break
          }
        }
      }
      this.setData({
        commonAttr: this.data.commonAttr,
        selectProperty: property,
      })
      this.getPartAttrFromEpc();
    },
    screeningLeft(event) { //筛选左侧
      let id = event.currentTarget.dataset.id;
      let name = event.currentTarget.dataset.name;
      let screeningIndex = event.currentTarget.dataset.index;
      this.setData({
        screeningIndex: screeningIndex
      })
    },
    screeningRight(event) { //筛选右侧选择属性值
      let id = event.currentTarget.dataset.id;
      let name = event.currentTarget.dataset.name;
      let parentId = this.data.commonAttr[this.data.screeningIndex].property_id;

      this.data.screeningProperty[this.data.screeningIndex] = {};
      this.data.screeningProperty[this.data.screeningIndex].property_id = parentId;
      this.data.screeningProperty[this.data.screeningIndex].property_value_id = id;

      // this.data.screeningProperty.splice(this.data.screeningIndex, 1, {
      //   property_id: parentId,
      //   property_value_id: id
      // })
      this.setData({
        screeningProperty: this.data.screeningProperty,
        isFirst: true,
      })
    },
    sureFn() {
      this.setData({
        page: 1,
        partsList: [],
        popType: '',
      })
      this.moreBtnStyleFn();
      this.getPartListFromEpc()
    },
    resetFn() {
      this.setData({
        selectProperty: [],
        // propertyList: JSON.parse(JSON.stringify(this.data.propertyData)),
        commonAttr: JSON.parse(JSON.stringify(this.data.allCommonAttr)),
        importAttr: JSON.parse(JSON.stringify(this.data.allImportAttr)),
        page: 1,
        partsList: [],
        moreStyle: false,
      })

      this.getPartListFromEpc()
    },
    goBackFn() {
      wx.pageScrollTo({ //将页面滚动到目标位置,单位px
        scrollTop: 0,
      })
    },
    showParamPop(event) {
      let self = this;
      let type = (event.currentTarget.dataset.type === this.data.popType) ? "" : event.currentTarget.dataset.type;
      this.setData({
        popType: type
      })
      if (type === 'cats' && !this.data.categoryList.length) { //选择配件品类
        services._request(`/parts/cats`).then((r) => {
          if (r.success) {
            if (r.result.length && this.data.categoryId) {
              r.result.forEach(function(parent) {
                parent.children.forEach(function(item) {
                  if (item.mapped_id == self.data.categoryId) {
                    self.setData({
                      categoryParentId: parent.id
                    })
                  }
                })
              })
            }
            if (r.result.length && !this.data.categoryId) {
              r.result[0].selected = true;
            }
            this.setData({
              categoryList: r.result
            })
            // 滤清器和制动系统下的全部按钮的处理
            r.result.forEach((parent, parentIndex) => {
              if (parent.id === '7487') {
                let allFilterAry = [];
                parent.children.forEach((child, childIndex) => {
                  allFilterAry.push(child.mapped_id);
                })
                this.setData({
                  allFilterId: allFilterAry.join(',')
                })
              }

              if (parent.id === '7492') {
                let allBrakeAry = [];
                parent.children.forEach((child, childIndex) => {
                  allBrakeAry.push(child.mapped_id);
                })
                this.setData({
                  allBrakeId: allBrakeAry.join(',')
                })
              }
            })
          } else {}
        }).catch(err => {
          console.log(err)
        })
      } else if (type === 'brand') { //选择配件品牌
        this.getBrandListFn();
      } else if (type === 'property') { //筛选条件
        this.closeImportFn();
        this.getPartAttrFromEpc();
      }
    },
    getBrandListFn() { //获取配件品牌
      services._request(`/parts/brands?category_id=${this.data.categoryId}`).then((r) => {
        if (r.success) {
          this.setData({
            brandList: r.result.data,
            letterList: r.result.letters
          })
        } else {}
      }).catch(err => {
        console.log(err)
      })
    },
    selectAllFn() {
      this.data.categoryList.forEach((property) => {
        if (property.children) {
          property.children.forEach((item) => {
            item.selected = false;
          })
        }
      })
      this.setData({
        categoryId: '',
        categoryName: '',
        // categoryParentId: this.data.categoryList[index].id,
        categoryList: this.data.categoryList,
        allFilterSelected: false,
        allBrakeSelected: false,
      })
      setTimeout(() => {
        this.setData({
          popType: ''
        })
      }, 200)

      this.getPartListFromEpc();
    },
    setCategoryChild(event) { //选择品类
      let self = this;
      let data = event.currentTarget.dataset;
      let index = data.index;
      let categoryIdx = data.categoryIdx;
      let categoryId, categoryName;

      if (data.type) {
        categoryId = categoryIdx;
        if (data.type === 'filter') { //滤清器下的全部
          this.setData({
            allFilterSelected: true,
            allBrakeSelected: false,
          })
          categoryName = '滤清器';
        } else if (data.type === 'brake') { //制动系统下的全部
          this.setData({
            allFilterSelected: false,
            allBrakeSelected: true,
          })
          categoryName = '制动系统';
        }
        this.data.categoryList.forEach(function(property) {
          if (property.children) {
            property.children.forEach(function(item) {
              item.selected = false
            })
          }
        })
      } else {
        var bool = !this.data.categoryList[categoryIdx].children[index].selected;
        this.data.categoryList.forEach(function(property) {
          if (property.children) {
            property.children.forEach(function(item) {
              item.selected = false
            })
          }
        })
        this.setData({
          allFilterSelected: false,
          allBrakeSelected: false,
        })
        // this.data.categoryList[categoryIdx].children.forEach(function (item) {
        //   item.selected = false
        // })
        this.data.categoryList[categoryIdx].children[index].selected = bool

        categoryId = bool ? this.data.categoryList[categoryIdx].children[index].mapped_id : ''
        categoryName = bool ? this.data.categoryList[categoryIdx].children[index].name : ''
      }

      this.setData({
        categoryList: this.data.categoryList,
        categoryId: categoryId,
        categoryName: categoryName,
        page: 1,
        partLists: [],
        brandId: '',
        brandName: '',
        brandList: [],
        selectProperty: [],
        letterList: [],
        propertyList: [],
        commonAttr: [],
      })

      this.triggerEvent('setCategoryFn',{
        categoryId: categoryId,
        categoryName: categoryName
      })

      setTimeout(function() {
        self.setData({
          popType: ''
        })
      }, 200)
      if (this.data.categoryId && !data.type) {
        this.getPartAttrFromEpc();
      }

      this.getPartListFromEpc()
    },
    handlerAlphaTap(e) {
      let {
        ap
      } = e.currentTarget.dataset;
      this.setData({
        alphaPos: ap
      });
    },
    toggleProperty(event) { //品类属性下的 更多 按钮事件
      let index = event.currentTarget.dataset.pIndex;
      // this.data.propertyList[index].showMore = !this.data.propertyList[index].showMore;
      // this.setData({ propertyList: this.data.propertyList})
      this.data.commonAttr[index].showMore = !this.data.commonAttr[index].showMore;
      this.setData({
        commonAttr: this.data.commonAttr
      })
    },
    openInfoFn() { //是否显示车型的全部信息
      this.setData({
        isOpenInfo: !this.data.isOpenInfo
      })
    },
    selectImportPropertyType(e) { //选择重要的属性类型
      if (this.data.showImportAttr && this.data.importAttrIndex === e.currentTarget.dataset.index) {
        this.setData({
          showImportAttr: false,
          activeIcon: '',
        });
        return;
      }
      this.setData({
        importAttrIndex: e.currentTarget.dataset.index,
        showImportAttr: true,
        activeIcon: e.currentTarget.dataset.index,
        'selectImportProperty.property_name': e.currentTarget.dataset.property_name,
        'selectImportProperty.property_id': e.currentTarget.dataset.property_id,
        'selectImportProperty.property_value_id': '',
        'selectImportProperty.property_value': '',
      })
    },
    selectImportParams(e) { //选择某一重要属性下的属性值
      this.setData({
        showImportAttr: false,
        activeIcon: '',
      })

      let property = this.data.selectProperty;
      let importAttrIndex = this.data.importAttrIndex;
      let bool = e.currentTarget.dataset.selected;
      let propertyBool = this.data.importAttr[importAttrIndex].selected;
      let propertyIndex = e.currentTarget.dataset.index;
      let valueId = e.currentTarget.dataset.property_value_id;
      let value = e.currentTarget.dataset.property_value;

      if (!bool) { //当前点击的属性值不是选中的状态
        this.data.importAttr[importAttrIndex].values.forEach((item, index) => {
          if (item.property_value_id === e.currentTarget.dataset.property_value_id) {
            item.selected = true;
            this.data.importAttr[importAttrIndex].selected = true;
          } else {
            item.selected = false;
          }
        })
        if (propertyBool) { //该属性下已经有选中的属性值
          property.forEach((item, index) => {
            if (item.property_name === this.data.importAttr[importAttrIndex].property_name) {
              item.property_value = this.data.importAttr[importAttrIndex].values[propertyIndex].property_value;
              item.property_value_id = valueId;
            }
          })
        } else {
          property.push({
            property_name: this.data.importAttr[importAttrIndex].property_name,
            property_id: this.data.importAttr[importAttrIndex].property_id,
            property_value_id: valueId,
            property_value: this.data.importAttr[importAttrIndex].values[propertyIndex].property_value
          })
        }
      } else { //当前点击的属性值是选中的状态
        this.data.importAttr[importAttrIndex].selected = false;
        this.data.importAttr[importAttrIndex].values[propertyIndex].selected = false;
        for (let i = 0; i < property.length; i++) {
          if (property[i].property_value_id === valueId && property[i].property_value === value) {
            property.splice(i, 1);
            break;
          }
        }
      }
      this.setData({
        selectProperty: property,
        importAttr: this.data.importAttr
      });
      this.getPartAttrFromEpc();
      this.sureFn();
    },
    closeImportFn() {
      this.setData({
        showImportAttr: false,
        activeIcon: '',
      })
    },
    moreBtnStyleFn() {
      this.setData({
        moreStyle: false,
      })
      this.data.commonAttr.forEach((item, index) => {
        item.values.forEach((childItem, childIndex) => {
          if (childItem.selected) {
            this.setData({
              moreStyle: true,
            })
            return;
          }
        })
      })
    },
  }
})