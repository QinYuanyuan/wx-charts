Page({

  data: {
    vin: '',
    model: {},
  },

  onLoad: function(options) {
    this.setData({
      vin: options.vin,
      model: options.model ? JSON.parse(options.model) : {},
    })
  },

  toSelectionPage() {
    wx.navigateTo({
      url: `/pages/identification-selection/identification-selection`,
    })
  },

  toCameraFn() {
    wx.redirectTo({
      url: `/pages/camera/camera`,
    })
  },

  confirmSelection(options) {
    let modelInfo = options.detail.modelInfo;
    let modelId = modelInfo.model_id ? modelInfo.model_id : '';

    wx.redirectTo({
      url: `/pages/part-list/part-list?modelId=${modelId}&modelInfo=${JSON.stringify(modelInfo)}&pageType=identification`,
    })
  },

})