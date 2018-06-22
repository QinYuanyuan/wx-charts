Page({

  data: {
    vin: '',
    model: {},
  },

  onLoad: function(options) {
    console.log('identification onload',options)
    this.setData({
      vin: options.vin,
      model: JSON.parse(options.model),
    })
  },

  toSelectionPage() {
    wx.navigateTo({
      url: `/pages/identification-selection/identification-selection`,
    })
  },

  confirmSelection(options) {
    console.log(options);

    const pages = getCurrentPages();
    let pageIndex;
    pages.forEach((item, index) => {
      if (item.route.indexOf('part-list') >= 0) {
        pageIndex = index;
      }
    })
    const previousPage = pages[pageIndex];

    let modelInfo = options.detail.modelInfo;
    if (modelInfo) {
      previousPage.setData({
        modelId: modelInfo.model_id ? modelInfo.model_id : '',
        modelInfo,
        pageType: 'identification',
      });
    } else {
      previousPage.setData({
        modelId: '',
        modelInfo: null,
        pageType: 'identification',
      });
    }
    wx.navigateBack({
      delta: pages.length - pageIndex - 1
    });
  },

})