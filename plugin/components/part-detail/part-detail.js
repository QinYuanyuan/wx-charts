let api = require('../../api/api.js');
let s = require('../../api/services.js');
let hepcSdk = require("../../api/hepc-sdk.js").default;
let services = s.default;
let image = {
  getVINhost: 'https://api.epc.heqiauto.com'
}

Component({
  properties: {
    psn: {
      type: String
    },
    category_id: {
      type: String
    }
  },

  data: {
    src: '', // h5配件详情页url
    id: '', // 配件id
    token: '',
    userAuth: '',
    goodsName: '', //商品名称
    goodsPrice: '', //商品价格
    goodsImage: [], //商品图片
    baseInfo: [], //商品基本信息字段
    partDetail: {},
    showPartDetail: false, //商品详情页面
    startPageY: 0,
    movePageY: 0,
    tabState: 'baseInfo', //tab状态
    tabNavFixed: false, //tab是否固定定位
    adaptSeriesList: [], //适配车系列表
    adaptModelList: [], //适配车型列表
    adaptModelTitle: {}, //弹窗中的头部信息
    windowHeight: 0, //可用窗口的高度
    showAdaptModel: false, //适配车型的详细信息
    showSeriesTipText: false, //无适配车型时的提示信息
    animationData: {},
  

    replaceTabState: 'brand', //替换件下的tab
    replacePartAry: [], //获取的全部品牌替换件
    oneBrandReplaceAry: [], //一个品牌下的品牌替换件
    currentBrand: '全部',
    brandAry: [], //品牌数组
    brandMenuState: false, //
    noBrandReplace: false, //无对应的品牌替换件
    noOEReplace: false, //无对应的品牌替换件

  },
  ready() {
    this.init();
    let windowHeight = wx.getSystemInfoSync().windowHeight;

    this.setData({
      id: this.data.id,
      windowHeight: Number(windowHeight) - 130,
    });

    this.getPartInfoFromEpc();

    this.animationData = wx.createAnimation({
      transformOrigin: "50% 50%",
      duration: 300,
      timingFunction: "linear",
      delay: 0
    })

  },
  methods: {

    init() {
      const host = 'https://api.parts.heqiauto.com/mp/index.html#/mp-products';

      // const token = app.globalData.token ? app.globalData.token : '';
      // const userAuth = app.globalData.userAuth ? app.globalData.userAuth : '';
      // // 当token为空时在h5的配件详情页完善信息后回退到当前页面，需要一个随机值触发h5页面路由的更新，从而获取最新的数据
      const timestamp = new Date().getTime();
      // this.setData({
      //   src: `${host}/${this.data.id}?token=${token}&timestamp=${timestamp}&user_auth=${userAuth}`,
      //   token: token,
      //   userAuth: userAuth,
      // })
    },

    onPageScroll(e) {
      if (systemInfo.system.indexOf('Android') !== -1 && !this.data.showAdaptModel) {
        this.pageScrollFn(e.scrollTop);
      }
    },

    // tab固定定位事件
    pageScrollFn(scrollTop) {
      let top;
      if (this.data.goodsImage.length > 0) {
        top = 302;
      } else {
        top = 75;
      }
      if (scrollTop >= top) {
        this.setData({
          tabNavFixed: true,
        })
      } else {
        this.setData({
          tabNavFixed: false,
        })
      }
    },
    getPartInfoFromEpc() {
      wx.showLoading({
        title: '正在加载',
      })

      return services._request(`/categories/${this.data.category_id}/parts/${this.data.psn}`, {
        config: {
          isRefresh: true,
          isEpc: true,
        }
      }).then((res) => {
        if (res.success) {
          wx.hideLoading();
          let result = res.result;

          this.setData({
            baseInfo: result.base,
          })
          this.init();
        } else {
          wx.hideLoading();
          console.log(res.errors[0].error_msg);
        }
      }).catch((err) => {
        wx.hideLoading();
        console.log(err);
      })
    },
    // 获取配件信息
    getPartInfoFn() {
      wx.showLoading({
        title: '正在加载',
      })
      let url = '';
      if (this.data.id) {
        url = `/batman/goods/${this.data.id}?user_auth=${this.data.userAuth}`
      } else if (this.data.psn) {
        url = `/batman/goodspsn/${this.data.psn}?user_auth=${this.data.userAuth}`
      }

      services.request(`${url}`, {
        config: {
          isRefresh: true,
        }
      }).then((res) => {
        if (res.success) {
          wx.hideLoading();
          let result = res.result;
          let goods_image = JSON.parse(result.goods_image).map((url) => {
            return {
              url: 'javascript:;',
              img: url
            };
          });
          let partDetail = result.part_detail;
          let base = result.product_attribute ? JSON.parse(result.product_attribute) : [];

          this.setData({
            baseInfo: base.base,
            partDetail: partDetail,
            goodsName: result.goods_name,
            goodsPrice: result.goods_price,
            goodsImage: goods_image,
            id: result.goods_id,
          })
          this.init();
        } else {
          wx.hideLoading();
          console.log(res.errors[0].error_msg);
        }
      }).catch((err) => {
        wx.hideLoading();
        console.log(err);
      })
    },

    // tab切换
    tabChangeFn(e) {
      if (e.currentTarget.dataset.tab === 'baseInfo') {
        this.animationData.right(-630).step();
        this.setData({
          animationData: this.animationData.export(),
          showAdaptModel: false,
          tabNavFixed: false,
          tabState: 'baseInfo'
        })
      } else if (e.currentTarget.dataset.tab === 'replacePart') {
        this.setData({
          tabState: 'replacePart',
          replaceTabState: 'brand',
          brandMenuState: false,
          currentBrand: '全部',
        })
        this.getBrandReplaceFn();

      } else {
        this.setData({
          tabState: 'adaptModel'
        })
        this.getAdaptSeriesFn();
      }
    },

    // 获取适配车系
    getAdaptSeriesFn() {
      wx.showLoading({
        title: '正在加载',
      })
      let psn = this.data.psn;
      services.partRequest(`/part/adapt-car-series-list?type=2&psn=${psn}`).then((res) => {
        wx.hideLoading();
        this.setData({
          adaptSeriesList: res,
          showSeriesTipText: res.length === 0 ? true : false
        })
      }).catch((err) => {
        console.log(err);
        wx.hideLoading();
        wx.showModal({
          title: '提示',
          content: '网络出错，请尝试重新获取',
          showCancel: false,
          success: (res) => {
            if (res.confirm) {
              this.getAdaptSeriesFn();
            }
          }
        })
      })
    },


    // 点击车系 查看适配车型
    adaptModelFn(e) {
      if (e.currentTarget.dataset.type === 'arrow' || e.currentTarget.dataset.type === 'mask') {
        this.animationData.right('-630rpx').step();
        this.setData({
          animationData: this.animationData.export(),
          showAdaptModel: false,
          tabNavFixed: false
        })
      } else {
        this.animationData.right(0).step();
        this.setData({
          animationData: this.animationData.export(),
          showAdaptModel: true,
          tabNavFixed: true
        })
        this.getAdaptModel(e);
      }
    },

    // 获取适配车型
    getAdaptModel(e) {
      this.setData({
        adaptModelTitle: e.currentTarget.dataset,
      })
      let psn = this.data.psn;
      services.partRequest(`/part/get-model-by-psn?type=2&psn=${psn}&series_id=${this.data.adaptModelTitle.seriesid}`).then((res) => {
        this.setData({
          adaptModelList: res
        })
      }).catch((err) => {
        console.log(err);
      })
    },

    touchMoveFn(e) {
      if (this.data.startPageY - e.touches[0].pageY > 100) {
        this.setData({
          showPartDetail: true,
        });
        wx.setNavigationBarTitle({
          title: '商品信息',
        })
      }
    },

    // 获取品牌替换件
    getBrandReplaceFn() {
      let params = {
        clientId: 'retNdnPKjkrJbYT',
        secretKey: 'vVBx2alN24q6U7xQGADWql0OFrYC+vDK',
        categoryId: this.data.category_id,
        psn: this.data.psn,
        replaceType: 'brand',
        host: image.getVINhost
      }
      wx.request({
        url: hepcSdk.getParams(params),
        method: 'GET',
        dataType: 'json',
        success: (res) => {
          let data = res.data.result;
          if (data.items.length > 0) {
            let ary = [];
            data.items.forEach((item, index) => {
              ary.push(item.brand_manu_name);
            })
            this.setData({
              replacePartAry: data.items,
              oneBrandReplaceAry: data.items,
              brandAry: Array.from(new Set(ary))
            })

          } else {
            this.setData({
              noBrandReplace: true,
            })
          }
        },
        fail: (err) => {
          console.log(err);
        }
      })
    },

    // 获取原厂替换件
    getOEReplaceFn() {
      let params = {
        clientId: 'retNdnPKjkrJbYT',
        secretKey: 'vVBx2alN24q6U7xQGADWql0OFrYC+vDK',
        categoryId: this.data.category_id,
        psn: this.data.psn,
        replaceType: 'oe',
        host: image.getVINhost
      }
      wx.request({
        url: hepcSdk.getParams(params),
        method: 'GET',
        dataType: 'json',
        success: (res) => {
          let data = res.data.result;
          if (data.items.length > 0) {
            this.setData({
              replacePartAry: data.items,
              oneBrandReplaceAry: data.items,
            })
          } else {
            this.setData({
              noOEReplace: true,
            })
          }
        },
        fail: (err) => {
          console.log(err);
        }
      })
    },
    // 替换件下的tab切换
    replaceTabChangeFn(e) {
      this.setData({
        replaceTabState: e.currentTarget.dataset.type
      })
      if (e.currentTarget.dataset.type === 'brand') {
        this.setData({
          oneBrandReplaceAry: this.data.replacePartAry,
          currentBrand: '全部',
          brandMenuState: false,
        })
        this.getBrandReplaceFn();
      } else {
        this.getOEReplaceFn();
      }
    },

    // 选择品牌查看替换件
    selectBrandFn(e) {
      this.setData({
        currentBrand: e.currentTarget.dataset.brand,
      })
      if (e.currentTarget.dataset.brand === '全部') {
        this.setData({
          oneBrandReplaceAry: this.data.replacePartAry,
        })
      } else {
        let ary = [];
        this.data.replacePartAry.forEach((item, index) => {
          if (item.brand_manu_name === e.currentTarget.dataset.brand) {
            ary.push(item);
          }
        })
        this.setData({
          oneBrandReplaceAry: ary,
        })
      }
    },

    // 打开品牌选择菜单
    openBrandMenu() {
      this.setData({
        brandMenuState: !this.data.brandMenuState,
      })
    },
  },

})