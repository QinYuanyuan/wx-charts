Page({

  data: {
  
  },

  onLoad: function (options) {
  
  },

  goBackFn(e) {
    this.setData({
      vinResult: e.detail.vinResult,
      modelInfo: e.detail.vinResult.result.models[0],
      showCamera: false,
      showResult: true,
      noResult: e.detail.vinResult.result.models.length === 0 ? true : false,
    })
  }
})