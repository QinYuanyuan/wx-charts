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
  },

  onLoad: function() {
    
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
      url: '/pages/camera/camera',
    })
  },

})