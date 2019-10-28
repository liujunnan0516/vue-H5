import Vue from "vue";

let _body = document.body;
let ele = null;
const win = window;
const winWidth = win.innerWidth;
const winHeight = win.innerHeight;
function layerball(param){
  let vm = null;
  let result = new Promise((resolve, reject)=>{
    let _components = {
      data() {
        return {
          option:{
            edge: true,// 是否自动贴边
            imgUrl:'/static/images/ball.png',
            linkUrl:'https://www.baidu.com',
            distanceX: 0,
            distanceY: 0,
            inertiaing:false,// 开始惯性缓动
          },
          ballStyle:{
            position: 'fixed',
            textAlign: 'center',
            borderRadius:'50%',
            color:'#fff',
            fontSize:'14px',
            zIndex:'1001',
            backgroundClip:'padding-box',
            top:'60%',
            right:'0',
            textDecoration: 'none',
            overflow: 'hidden'
          }
        }
      },
      template:`<div><a :href="option.linkUrl" 
      @touchstart.stop.prevent='touchstartEvent'
      @touchmove.stop.prevent='touchmoveEvent'
      @touchend='touchendEvent'
      ref="layer_ball" :style='ballStyle'>
      <img :src="option.imgUrl" width="100%"/>
      </a></div>`,
      created() {
        let option = {...this.option,...param};
        this.option = option;
        // 计算悬浮窗大小
        this.initBallSize();
      },
      mounted() {
        let self = this;
        console.log(this);
        self.$nextTick(()=>{
          ele = this.$refs.layer_ball;
          console.log(this.$refs.layer_ball);
        })
      },
      methods: {
        initBallSize(){
          let ballStyle = {...this.ballStyle};
          ballStyle.lineHeight = (0.8 / 16 * winWidth) + 'px';
          ballStyle.width = (1.6 / 8 * winWidth) + 'px';
          ballStyle.height = (1.6 / 8 * winWidth) + 'px';
          ballStyle.visibility = 'visible';
          this.ballStyle = ballStyle;
        },
        touchstartEvent(event){
          let self = this;
          let data = {...self.option};
          if(data.inertiaing){
            return;
          }
          let events = event.touches[0] || event;

          data.posX = events.pageX;
          data.posY = events.pageY;
    
          data.touching = true;
    
          if (ele.distanceX != undefined && ele.distanceX != null) {
            data.distanceX = ele.distanceX;
          }
          if (ele.distanceY) {
            data.distanceY = ele.distanceY;
          }
          // 元素的位置数据
          data.bound = ele.getBoundingClientRect();

          data.timerready = true;
          self.option = data;
        },
        touchmoveEvent(event){
          let self = this;
          let data = {...self.option};
          if (data.touching !== true) {
            return;
          }
          // 当移动开始的时候开始记录时间
          if (data.timerready == true) {
            data.timerstart = +new Date();
            data.timerready = false;
          }
          let events = event.touches[0] || event;

          data.nowX = events.pageX;
          data.nowY = events.pageY;
          // 移动距离
          let distanceX = data.nowX - data.posX;
          let distanceY = data.nowY - data.posY;
          // 当前位置
          let absLeft = data.bound.left + distanceX;
          let  absTop = data.bound.top + distanceY;
          let  absRight = absLeft + data.bound.width;
          let  absBottom = absTop + data.bound.height;
          let distance = calcDistance(absLeft, absTop, winWidth, winHeight);
          // 边缘检测
          if (absLeft < 0) {
            distanceX = distanceX - absLeft;
          }
          if (absTop < 0) {
            distanceY = distanceY - absTop;
          }
          if (absRight > winWidth) {
            distanceX = distanceX - (absRight - winWidth);
          }
          if (absBottom > winHeight) {
            distanceY = distanceY - (absBottom - winHeight);
          }
          // 元素位置跟随
          let x = data.distanceX + distanceX;
          let y = data.distanceY + distanceY;
          fnTranslate(x,y);
          // 缓存移动位置
          ele.distanceX = x;
          ele.distanceY = y;
          self.option = data;
        },
        touchendEvent(){
          let self = this;
          let data = {...self.option};
          if (data.touching !== true) {
            return;
          }
          data.touching = false;
          // 计算速度
          data.timerend = +new Date();
          if (!data.nowX || !data.nowY) {
            return;
          }
          // 移动的水平和垂直距离
          let distanceX = data.nowX - data.posX;
          let distanceY = data.nowY - data.posY;
          if (Math.abs(distanceX) < 5 && Math.abs(distanceY) < 5) {
            return;
          }
          // 开始惯性缓动
          data.inertiaing = true;
          if (data.edge) {
            self.edging();
          }
          self.option = data;
        },
        /**
         * 边缘跳动动画
         */
        edging () {
          let self = this;
          let data = {...self.option};
          // 时间
          let start = 0, during = 25;
          // 初始值和变化量
          let init = ele.distanceX, y = ele.distanceY, change = 0;
          // 判断元素现在在哪个半区
          let bound = ele.getBoundingClientRect();
          if (bound.left + bound.width / 2 < winWidth / 2) {
            change = -1 * bound.left;
          } else {
            change = winWidth - bound.right;
          }
          let run = function () {
            // 如果用户触摸元素，停止继续动画
            if (data.touching == true) {
              data.inertiaing = false;
              return;
            }
            start++;
            let x = easeOutBounce(start, init, change, during);
            console.log(x);
            fnTranslate(x, y);
            if (start < during) {
              requestAnimationFrame(run);
            } else {
              ele.distanceX = x;
              ele.distanceY = y;
              data.inertiaing = false;
              if (win.localStorage) {
                localStorage['WxLayerBall_' + ele.id] = [x, y].join();
              }
            }
          };
          run();
          self.option = data;
        }
      },
    }
    let creator = Vue.extend(_components);
    vm = new creator().$mount()
		_body.appendChild(vm.$el)
  });
  return {vm,result};
}
/**
 * easeOutBounce算法
 * t: current time（当前时间)
 * b: beginning value（初始值）
 * c: change in value（变化量）
 * d: duration（持续时间）
 */
const easeOutBounce = function(t, b, c, d){
    if ((t /= d) < (1 / 2.75)) {
      return c * (7.5625 * t * t) + b;
    } else if (t < (2 / 2.75)) {
      return c * (7.5625 * (t -= (1.5 / 2.75)) * t + 0.75) + b;
    } else if (t < (2.5 / 2.75)) {
      return c * (7.5625 * (t -= (2.25 / 2.75)) * t + 0.9375) + b;
    } else {
      return c * (7.5625 * (t -= (2.625 / 2.75)) * t + 0.984375) + b;
    }
};
/** 
 * 设置拖动坐标
 */
const fnTranslate = function(x,y){
  x = Math.round(1000 * x) / 1000;
  y = Math.round(1000 * y) / 1000;
  ele.style.webkitTransform = 'translate(' + [x + 'px', y + 'px'].join(',') + ')';
  ele.style.transform = 'translate3d(' + [x + 'px', y + 'px', 0].join(',') + ')';
}
const calcDistance = function(x1, y1, x2, y2) {
  return Math.sqrt((x1 - x2) * (x1 - x2) + (y1 - y2) * (y1 - y2))
}
export default layerball;