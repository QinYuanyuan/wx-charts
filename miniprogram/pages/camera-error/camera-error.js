Page({

  data: {
    vin: '',
    imageSrc: ''
  },

  onLoad: function (options) {
    this.setData({
      vin: options.vin,
      imageSrc: options.imageSrc
    })
  },

  backToCamera() {
    wx.redirectTo({
      url: `/pages/camera/camera`,
    })
  },

  toIdentificationFn(e) {
    wx.redirectTo({
      url: `/pages/identification/identification?vin=${e.detail.vin}&model=${e.detail.model}`,
    })
  },

  
})