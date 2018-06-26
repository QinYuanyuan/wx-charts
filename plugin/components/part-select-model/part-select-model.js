let api = require('../../api/api.js');
let s = require('../../api/services.js');
let services = s.default;

Component({
  properties: {
    modelId: {
      type: String,
    },
    selectModelState: {
      type: Number,
    },
    showModal: {
      type: Number,
    },
    pageState: {
      type: 'String',
      value: 'brand'
    },
    noModelInfo: {
      type: Boolean,
    },
    modelInfo: {
      type: Object,
    },
    noSeriesId: {
      type: Boolean,
    },
  },
  data: {
    // showModal: 0, // 选择车型弹窗的隐藏与显示
    // selectModelState: 0, // 是否存在当前选择的车型
    showSelectModel: true,
    // modelId: '',
    // modelInfo: {},
    // pageState: 'brand',
    selectModelSeries: {},
    noModelInfo: false,
    vehicle: {}, //选择的车型信息
    noSeriesId: false,
    // 品牌
    hot_list: [],
    alphabet_list: [],
    list: {},
    alpha: '',
    alphabet_ary: [],
    // 选择车系
    pageStatus: 0, // 0: 选择车系，1: 选择年款，2: 选择车型
    seriesList: [],
    yearList: [],
    displacementList: [],
    modelList: [],

    selectModel: false, //由车系选择车型
    showYearAndDispModal: false, //选择年款和排量
    titleState: '', //tab的状态

    selectYear: '选择年款', //选择的年款
    selectDisplacement: '选择排量', //选择的排量
    showYearModal: false,
    showDispModal: false,
    selectYearFlag: false,
    selectDispFlag: false,
    animationYearData: {},
    animationDispData: {},
    yearContainerHeight: '',
    // 顶部的搜索
    showSeriesResult: false, //车系搜索结果是否展示
    noSearchResult: false, //车系搜索结果为空
    noMoreResult: false,
    inputValue: '',
  },
  ready() {
    let modelInfo = this.data.modelInfo;
    if (modelInfo && JSON.stringify(modelInfo) !== '{}') {
      if (modelInfo.model_id) {
        this.setData({
          pageState: 'series',
          selectModel: true,
          selectYearFlag: true,
          selectDispFlag: true,
          selectYear: modelInfo.year_pattern ? modelInfo.year_pattern : (modelInfo.model_year ? modelInfo.model_year : '选择年款'),
          selectDisplacement: modelInfo.displacement ? modelInfo.displacement : '选择排量',
          'modelList[0]': modelInfo,
          'vehicle.brand_id': modelInfo.brand_id ? modelInfo.brand_id : '',
          'vehicle.brand_name': modelInfo.brand_name ? modelInfo.brand_name : '',
          'vehicle.sub_brand_name': modelInfo.sub_brand_name ? modelInfo.sub_brand_name : '',
          'vehicle.series_id': modelInfo.series_id ? modelInfo.series_id : '',
          'vehicle.series_name': modelInfo.series_name ? modelInfo.series_name : '',
          'vehicle.year_id': modelInfo.model_year_id ? modelInfo.model_year_id : '',
          'vehicle.year': modelInfo.model_year ? modelInfo.model_year : '',
          'vehicle.displacement_id': modelInfo.displacement_id ? modelInfo.displacement_id : '',
          'vehicle.displacement': modelInfo.displacement ? modelInfo.displacement : '',
        })
      } else if (modelInfo.series_id) {
        this.setData({
          pageState: 'series',
          selectModel: true,
          selectYearFlag: false,
          selectDispFlag: false,
          selectYear: '选择年款',
          selectDisplacement: '选择排量',
          'modelList[0]': modelInfo,
          'vehicle.brand_id': modelInfo.brand_id ? modelInfo.brand_id : '',
          'vehicle.brand_name': modelInfo.brand_name ? modelInfo.brand_name : '',
          'vehicle.sub_brand_name': modelInfo.sub_brand_name ? modelInfo.sub_brand_name : (modelInfo.manu_name ? modelInfo.manu_name : ''),
          'vehicle.series_id': modelInfo.series_id ? modelInfo.series_id : '',
          'vehicle.series_name': modelInfo.series_name ? modelInfo.series_name : (modelInfo.family_name ? modelInfo.family_name : ''),
          'vehicle.year_id': '',
          'vehicle.year': '',
          'vehicle.displacement_id': '',
          'vehicle.displacement': '',
        })
        this.getModelIdFn();
      } else {
        this.setData({
          pageState: 'brand',
          selectModel: true,
          selectYearFlag: false,
          selectDispFlag: false,
          selectYear: '选择年款',
          selectDisplacement: '选择排量',
          modelList: [],
          'vehicle.brand_id': '',
          'vehicle.brand_name': '',
          'vehicle.sub_brand_name': '',
          'vehicle.series_id': '',
          'vehicle.series_name': '',
          'vehicle.year_id': '',
          'vehicle.year': '',
          'vehicle.displacement_id': '',
          'vehicle.displacement': '',
        })
      }
    }
    this.getBrandsFn();

    this.animationYearData = wx.createAnimation({
      transformOrigin: "50% 50%",
      duration: 1000,
      timingFunction: "ease",
      delay: 0
    });
    this.animationDispData = wx.createAnimation({
      transformOrigin: "50% 50%",
      duration: 1000,
      timingFunction: "ease",
      delay: 0
    });
  },
  
  methods: {

    // 选择搜索出的车系
    selectSearchSeriesFn(e) {
      let {
        series_id,
        name
      } = e.currentTarget.dataset;
      let brand_name = name.slice(0, name.indexOf(' '));
      let series_name = name.slice(name.indexOf(' ') + 1);

      this.setData({
        showSeriesResult: false,
        pageState: 'series',
        'vehicle.brand_id': '',
        'vehicle.brand_name': brand_name,
        'vehicle.series_id': series_id,
        'vehicle.series_name': series_name,
        'vehicle.year_id': '',
        'vehicle.year': '',
        'vehicle.displacement_id': '',
        'vehicle.displacement': '',
        selectYear: '选择年款', //选择的年款
        selectDisplacement: '选择排量', //选择的排量
        selectYearFlag: false,
        selectDispFlag: false,
        selectModel: true,
      })
      this.getYearAndDisplacementFn();
      this.getModelIdFn();
    },

    // 获取品牌
    getBrandsFn() {
      services._request('/cars/brands').then((res) => {
        if (res.success) {
          let result = res.result;
          let alphabet_ary = [];
          let alphabetStr = result.alphabet_list.join('');
          alphabet_ary.push(alphabetStr.substr(0, 3));
          alphabet_ary.push(alphabetStr.substr(3, 2));
          alphabet_ary.push(alphabetStr.substr(5, 2));
          alphabet_ary.push(alphabetStr.substr(7, 2));
          alphabet_ary.push(alphabetStr.substr(9, 3));
          alphabet_ary.push(alphabetStr.substr(12, 2));
          alphabet_ary.push(alphabetStr.substr(14, 2));
          alphabet_ary.push(alphabetStr.substr(16, 2));
          alphabet_ary.push(alphabetStr.substr(18, 3));
          this.setData({
            alphabet_list: result.alphabet_list,
            list: result.list,
            hot_list: result.hotlist,
            alphabet_ary: alphabet_ary
          })
        } else {
          console.log('获取品牌信息失败！');
        }
      }).catch((err) => {
        console.log(err.message);
      })
    },

    // 选择品牌 获取车系
    getSeriesFn(e) {
      if (e) {
        this.setData({
          'vehicle.brand_id': e.currentTarget.dataset.brand_id,
          'vehicle.brand_name': e.currentTarget.dataset.brand_name,
          'vehicle.series_id': '',
        })
      }
      services.partRequest(`/car-series/get-sub-brand-series?brand_id=${this.data.vehicle.brand_id}`).then((res) => {
        this.setData({
          pageState: 'series',
          seriesList: res,
          selectModel: false
        });
      }).catch((err) => {
        console.log(err);
      })
    },

    // 选择车系 获取年款和排量 
    selectSeries(e) {
      let {
        sub_brand_name,
        series_id,
        series_name
      } = e.currentTarget.dataset;
      this.setData({
        'vehicle.sub_brand_name': sub_brand_name,
        'vehicle.series_id': series_id,
        'vehicle.series_name': series_name,
        'vehicle.year_id': '',
        'vehicle.year': '',
        'vehicle.displacement_id': '',
        'vehicle.displacement': '',
        selectYear: '选择年款', //选择的年款
        selectDisplacement: '选择排量', //选择的排量
        selectYearFlag: false,
        selectDispFlag: false,
        selectModel: true,
      });
      this.getYearAndDisplacementFn();
      this.getModelIdFn();
    },

    // 选择车系 获取车型id
    getYearAndDisplacementFn() {
      services.partRequest(`/car-series/get-year-and-displacement?series_id=${this.data.vehicle.series_id}`).then((res) => {
        this.setData({
          pageState: 'series',
          yearList: res.modelYears,
          displacementList: res.displacements,
        });
      })
    },

    // 获取车型id
    getModelIdFn() {
      let yearId = this.data.vehicle.year_id ? this.data.vehicle.year_id : '';
      let displacementId = this.data.vehicle.displacement_id ? this.data.vehicle.displacement_id : '';

      services.partRequest(`/car-model/get-model-list?series_id=${this.data.vehicle.series_id}&year_id=${yearId}&displacement_id=${displacementId}&car_type=3`).then((res) => {
        this.setData({
          pageState: 'series',
          modelList: res,
        })
      })
    },

    // 选择年款
    selectYearFn(e) {
      this.setData({
        showDispModal: false,
      })
      if (this.data.showYearModal) {
        this.animationYearData.rotate(0).step();
        this.setData({
          showYearModal: false,
          selectYearFlag: this.data.selectYear === '选择年款' ? false : true,
          // 选择年款时排量不再高亮
          selectDispFlag: false,
          titleState: 'year',
          animationYearData: this.animationYearData.export(),
        })
      } else {
        this.animationYearData.rotate(180).step();
        this.setData({
          selectYearFlag: this.data.selectYear === '选择年款' ? false : true,
          // 选择年款时排量不再高亮
          selectDispFlag: false,
          animationYearData: this.animationYearData.export(),
          showYearModal: true,
        })
        this.getYearAndDisplacementFn();
      }
    },

    // 选择排量
    selectDispFn() {
      this.setData({
        showYearModal: false,
      })
      if (this.data.showDispModal) {
        this.animationDispData.rotate(0).step();
        this.setData({
          showDispModal: false,
          selectDispFlag: this.data.selectDisp === '选择排量' ? false : true,
          // 选择排量时年款不再高亮
          selectYearFlag: false,
          titleState: 'displacement',
          animationDispData: this.animationDispData.export(),
        })
        return;
      } else {
        this.animationDispData.rotate(180).step();
        this.setData({
          selectDispFlag: this.data.selectDisp === '选择排量' ? false : true,
          // 选择排量时年款不再高亮
          selectYearFlag: false,
          showDispModal: true,
          animationDispData: this.animationDispData.export(),
        })
        this.getYearAndDisplacementFn();
      }
    },

    selectOneYear(e) {
      this.animationYearData.rotate(0).step();
      this.setData({
        'vehicle.year_id': e.currentTarget.dataset.year_id,
        'vehicle.year': e.currentTarget.dataset.year,
        selectYearFlag: true,
        showYearModal: false,
        selectYear: e.currentTarget.dataset.year,
        animationYearData: this.animationYearData.export()
      })
      this.getModelIdFn();
    },
    selectOneDisp(e) {
      this.animationDispData.rotate(0).step();
      this.setData({
        'vehicle.displacement_id': e.currentTarget.dataset.displacement_id,
        'vehicle.displacement': e.currentTarget.dataset.displacement,
        selectDispFlag: true,
        showDispModal: false,
        selectDisplacement: e.currentTarget.dataset.displacement,
        animationDispData: this.animationDispData.export()
      })
      this.getModelIdFn();
    },

    // 选择年款和排量 
    closeYearAndDispModelFn(e) {
      this.animationYearData.rotate(0).step();
      this.animationDispData.rotate(0).step();
      this.setData({
        showYearModal: false,
        showDispModal: false,
        animationYearData: this.animationYearData.export(),
        animationDispData: this.animationDispData.export(),
      })
    },

    // 删除品牌
    deleteBrand() {
      this.setData({
        // vehicle: {},
        pageState: 'brand',
        selectYear: '选择年款',
        selectDisplacement: '选择排量',
        showYearAndDispModal: false,
        selectYearFlag: false,
        selectDispFlag: false,
        titleState: ''
      })
      this.getBrandsFn();
    },

    // 删除车系
    deleteSeries() {
      this.setData({
        'vehicle.series_id': '',
        'vehicle.series_name': '',
        'vehicle.year_id': '',
        'vehicle.year': '',
        'vehicle.displacement_id': '',
        'vehicle.displacement': '',
        selectYear: '选择年款',
        selectDisplacement: '选择排量',
        pageState: 'series',
        selectModel: false,
        showYearAndDispModal: false,
        selectYearFlag: false,
        selectDispFlag: false,
        titleState: '',
        seriesList: [],
      })
      this.getSeriesFn();
    },

    // 选择一条精确车型
    selectOneModelFn(e) {
      let data = e.currentTarget.dataset;
      let modelId = data.model_id ? data.model_id : '';
      if (modelId) {
        this.setData({
          modelId: data.model_id,
          selectYear: data.model_year,
          selectDisplacement: data.displacement,
          selectYearFlag: true,
          selectDispFlag: true,
          modelList: [{
            'model_id': data.model_id,
            'model_year': data.model_year,
            'displacement': data.displacement,
            'aspirated_way': data.aspirated_way,
            'gears_num': data.gears_num,
            'trans_type': data.trans_type,
            'engine_code': data.engine_code,
            'structure': data.structure
          }],
        })

        let modelInfo = this.data.vehicle;
        modelInfo.model_id = modelId;

        this.triggerEvent('goBackFn',{
          modelId: modelId,
          selectModelState: 1,
          showModal: 0,
          pageState: 'series',
          noModelInfo: false,
          modelInfo,
          noSeriesId: false,
        })
      }
    },

    //  查看全部 通过车系筛选车型
    getPartBySeriesFn() {
      this.setData({
        modelId: '',
        pageState: 'series',
        selectYearFlag: false,
        selectDispFlag: false,
        selectYear: '选择年款', //选择的年款
        selectDisplacement: '选择排量', //选择的排量
        showModal: 0,
        searchText: '',
        'vehicle.year_id': '',
        'vehicle.year': '',
        'vehicle.displacement_id': '',
        'vehicle.displacement': '',
        noSeriesId: false,
      })

      let seriesId = this.data.vehicle.series_id;
      this.triggerEvent('goBackFn', {
        showSelectModel: false,
        modelId: '',
        seriesId: seriesId,
        selectModelState: 1,
        showModal: 0,
        pageState: 'series',
        noModelInfo: true,
        modelInfo: this.data.vehicle,
      })
    },
    handlerAlphaTap(e) {
      let { ap } = e.currentTarget.dataset;
      this.setData({
        alpha: ap.substr(0, 1)
      });
    },
    toCameraFn() {
      wx.redirectTo({
        url: `/pages/camera/camera?pageType=identification&prevPageType=part&subPageType=`
      });
    },

    searchInputFn(e) {
      if (e.detail.value) {
        this.setData({
          inputValue: e.detail.value,
        })
      } else {
        this.setData({
          showSeriesResult: false,
          noMoreResult: false,
        })
      }
    },

    searchConfirmFn() {
      if (/^[a-zA-Z0-9]{17}$/.test(this.data.inputValue)) {
        this.triggerEvent('toIdentification',{
          vin: this.data.inputValue
        })
      } else {
        this.setData({
          showSeriesResult: true,
          noMoreResult: false,
        })
        services._request(`/home/search?kw=${this.data.inputValue}`).then((res) => {
          let data = res.result;
          if (res.success) {
            let seriesResult = [];
            data.forEach((item, index) => {
              if (item.item_type === 'car_series') {
                seriesResult.push(item);
              }
            })
            if (seriesResult.length === 0) {
              this.setData({
                noSearchResult: true,
              })
            } else {
              this.setData({
                noSearchResult: false,
              })
            }
            this.setData({
              seriesResult
            })
            // let resultHeight = seriesResult.length * app.implementPx(95);
            // let scrollHeight = app.implementPx(1050);
            // if (resultHeight > scrollHeight) {
            //   this.setData({
            //     noMoreResult: true,
            //   })
            // }
          }
        }).catch((err) => {
          console.log(err);
        })
      }
    },
  },

})