Page({

  data: {
    vin: '',
    imageSrc: ''
  },

  onLoad: function (options) {
    console.log('camera-error onload',options)
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
    console.log(e);
    wx.redirectTo({
      url: `/pages/identification/identification?vin=${e.detail.vin}&model=${e.detail.model}`,
    })
  },

  
})