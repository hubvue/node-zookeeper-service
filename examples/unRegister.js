// #服务注销
const zk = require('./connect')

zk.on('connected', async () => {
  await zk.unRegister('/api.cn/getDataInfo', path => {
    console.log(path, 'unRegister')
  })
})
