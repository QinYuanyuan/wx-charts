Page({

  data: {
    vin: '',
    model: {},
  },

  onLoad: function(options) {
    console.log('identification onload',options)
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
    console.log(options);

    // const pages = getCurrentPages();
    // console.log('identification',pages);
    // let pageIndex;
    // pages.forEach((item, index) => {
    //   if (item.route.indexOf('part-list') >= 0) {
    //     pageIndex = index;
    //   }
    // })
    // const previousPage = pages[pageIndex];

    // let modelInfo = options.detail.modelInfo;
    // let modelId = modelInfo.model_id ? modelInfo.model_id : '';
    // if (modelInfo) {
    //   previousPage.setData({
    //     modelId: modelInfo.model_id ? modelInfo.model_id : '',
    //     modelInfo,
    //     pageType: 'identification',
    //   });
    // } else {
    //   previousPage.setData({
    //     modelId: '',
    //     modelInfo: null,
    //     pageType: 'identification',
    //   });
    // }
    // wx.navigateBack({
    //   delta: pages.length - pageIndex - 1
    // });

    let modelInfo = options.detail.modelInfo;
    let modelId = modelInfo.model_id ? modelInfo.model_id : '';

    wx.redirectTo({
      url: `/pages/part-list/part-list?modelId=${modelId}&modelInfo=${JSON.stringify(modelInfo)}&pageType=identification`,
    })
  },

})