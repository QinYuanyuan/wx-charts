// import re from '../../../utils/re.js';

Component({
  properties: {
    showKeyboardVin: {
      type: Boolean,
      value: false,
      observer(newVal, oldVal) {
        console.log(newVal, oldVal)
        if (newVal) {
          this._showVinKeyboard();
        } else {
          this._hideVinKeyboard();
        }
      }
    },
    inputVin: {
      type: String,
      value: ''
    },
    inputVinAry: {
      type: Array,
      value: []
    }
  },
  data: {
    keyboardNumber: '1234567890',
    oneLetter: ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P'],
    twoLetter: ['清空', 'A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L'],
    threeLetter: ['粘贴', 'Z', 'X', 'C', 'V', 'B', 'N', 'M'],
    animationData: {}//vin键盘动画
  },
  ready() {
    this.animationData = wx.createAnimation({//实例化一个vin键盘动画
      transformOrigin: "50% 50%",
      duration: 300,
      timingFunction: "ease",
      delay: 0
    });
  },
  methods: {
    _hideVinKeyboard() {//隐藏vin键盘
      this.animationData.height(0).step();
      this.setData({
        animationData: this.animationData.export()
      })
    },
    _showVinKeyboard() {//显示vin键盘
      this.animationData.height(296).step();
      this.setData({
        animationData: this.animationData.export(),
      })
    },
    _tapKeyboard(e) {//vin键盘事件
      let val = e.currentTarget.dataset.val;
      let vinEventDetail = null;
      if (val === '完成') {
        this.triggerEvent('vinComplate');
        this._hideVinKeyboard();
      } else if (val === '清空') {
        vinEventDetail = {
          inputVin: '',
          inputVinAry: []
        }
        this.triggerEvent('touchVin', vinEventDetail);
      } else if (val === '粘贴') {
        wx.getClipboardData({
          success: (res) => {
            let data = res.data ? res.data.substr(0,17) : '';
            
            vinEventDetail = {
              inputVin: data,
              inputVinAry: data.split(''),
              type: 'copy',
            }
            this.triggerEvent('touchVin', vinEventDetail);
            // console.log(data.search(/\s/g))
            // guanlin: 如果粘贴进的字符串有空白符，提示vin码错误，并触发vin码格式错误事件
            if (data.search(/\s/g) != -1) {
              wx.showToast({
                title: 'vin码格式错误',
                image: '/images/error.png',
                duration: 1000
              })
              this.triggerEvent('catchVinError');
              return;
            }
            if (vinEventDetail.inputVinAry.length == 17) {
              wx.showToast({
                title: '正在识别',
                icon: 'loading',
                duration: 10000,
                mask: true
              })
              this._hideVinKeyboard();
            } else if (!re.reVIN.test(vinEventDetail.inputVin)) {
              // wx.showModal({
              //   title: '提示',
              //   // content: '您输入的vin不合法',
              //   content: 'vin码格式错误',
              //   confirmColor: '#d61323',
              // })
              wx.showToast({
                title: 'vin码格式错误',
                image: '/images/error.png',
                duration: 1000
              });
              // guanlin： 如果粘贴进的字符串不符合vin码，提示vin码错误，并触发vin码格式错误事件
              this.triggerEvent('catchVinError');
            }
          }
        })
      } else {
        if (this.data.inputVinAry.length < 17) {
          this.data.inputVinAry.push(val);
          vinEventDetail = {
            inputVin: this.data.inputVinAry.join(''),
            inputVinAry: this.data.inputVinAry,
            type: 'keydown'
          }
          this.triggerEvent('touchVin', vinEventDetail);
          // if (this.data.inputVinAry.length == 17) {
          //   wx.showToast({
          //     title: '正在识别',
          //     icon: 'loading',
          //     duration: 10000,
          //     mask: true
          //   })
          //   this._hideVinKeyboard();
          // }
        }
      }
    },
    delValue() {//删除vin
      if (this.data.inputVinAry.length > 0) {
        this.data.inputVinAry.pop();
        let vinEventDetail = {
          inputVin: this.data.inputVinAry.join(''),
          inputVinAry: this.data.inputVinAry
        }
        this.triggerEvent('touchVin', vinEventDetail);
      }
    },
  }
})