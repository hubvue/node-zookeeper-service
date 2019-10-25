// #服务去订阅
// 注：去订阅需要在订阅的地方解除
const zk = require('./connect')

zk.on('connected', async () => {
  await zk.unSubscribe('/api.cn/getData', path => {
    console.log(path, 'unSubscribe')
  })
})
