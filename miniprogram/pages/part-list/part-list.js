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
  },

  onLoad: function() {
    
  },

  onShow() {
    this.setData({
      pageStatus: 'partList',
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