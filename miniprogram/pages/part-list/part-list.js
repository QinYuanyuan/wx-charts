let plugin = requirePlugin("myPlugin");

Page({

  data: {
    pageStatus: '',
    modelId: '',
    selectModelState: 0,
    showModal: 0,
    pageState: 'brand',
    noModelInfo: false,
    modelInfo: {},
    noSeriesId: false,
    search: {
      status: false, // 搜索栏搜索状态，未搜索 => false, 正在搜索 => true
      query: '',
      inputQuery: '',
      list: {
        result: [],
        status: false,
      },
      actualQuery: '',
    },
    categoryId: '',
    categoryName: '',
  },

  onLoad: function(options) {
    if (JSON.stringify(options) !== '{}') {
      let mdoelInfo = JSON.parse(options.modelInfo);
      this.setData({
        modelId: options.modelId ? options.modelId : '',
        modelInfo: mdoelInfo,
      })
    }
  },

  onShow() {
    this.setData({
      pageStatus: 'partList',
    })
  },

  onHide() {
    this.setData({
      pageStatus: '',
    })
  },

  toSelectModelFn(e) {
    this.setData({
      pageStatus: '',
    })
    wx.navigateTo({
      url: `/pages/part-select-model/part-select-model?pageType=part&modelInfo=${e.detail.modelInfo}`
    });
  },

  toDetailFn(e) {
    this.setData({
      'search.status': false
    })
    wx.navigateTo({
      url: `/pages/part-detail/part-detail?psn=${e.detail.psn}&category_id=${e.detail.category_id}`
    });
  },

  toCameraFn() {
    wx.navigateTo({
      url: `/pages/camera/camera`,
    })
  },

  toIdentificationFn(e) {
    wx.redirectTo({
      url: `/pages/identification/identification?pageType=part-search&vin=${e.detail.vin}`
    });
  },

  setCategoryFn(e) {
    this.setData({
      categoryId: e.detail.categoryId,
      categoryName: e.detail.categoryName,
    })
  }

})