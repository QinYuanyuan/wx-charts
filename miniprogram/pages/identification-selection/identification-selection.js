Page({
  data: {
    models: [],
  },
  onLoad() {
    this.getItemFromPrevPage();
  },
  getItemFromPrevPage() {
    const pages = getCurrentPages();
    const previousPage = pages[pages.length - 2];

    this.setData({ models: previousPage.data.model.models });
  },
  chooseModel(e) {
    const index = e.detail.index;
    const pages = getCurrentPages();
    const previousPage = pages[pages.length - 2];

    previousPage.setData({
      modelInfo: previousPage.data.model.models[index]
    });
    wx.navigateBack({ delta: 1 });
  },
})