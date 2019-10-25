// #服务订阅
const zk = require('./connect')

zk.on('connected', async () => {
  await zk.subscribe(
    {
      url: '/api.cn',
      interfaceName: 'getData'
    },
    (path, children, data) => {
      console.log(path, children, data.toString())
    }
  )
  await zk.unSubscribe('/api.cn', path => {
    console.log(path, 'unSubscribe')
  })
})
