let plugin = requirePlugin("myPlugin");
let app = getApp();

Page({
  data: {
    vinResult: {},
    modelInfo: {},
    showCamera: false,
    showResult: false,
    noResult: false,
  },

  onLoad: function() {
   
  },

  showCameraFn() {
    this.setData({
      showCamera: true,
    })
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