import count from './js/count'
import sum from './js/sum'
import { mul } from './js/math'
// webpack打包资源，必须引入该资源
import './css/index.css'
import './less/index.less'
import './sass/index.sass'
import './sass/index.scss'
import './stylus/index.styl'

console.log(count(1, 2))
console.log(sum(1, 3, 4, 2))
console.log(mul(2, 3))

if (module.hot) {
  // 判断是否支持热模块替换功能
  module.hot.accept('./js/count')
  module.hot.accept('./js/sum')
}
