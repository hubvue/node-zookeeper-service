// # 服务注册
const zk = require('./connect')

zk.on('connected', async () => {
  await zk.register({
    url: '/api.cn',
    interfaceName: 'getData',
    data: 'Hello zookeeper'
  })
  await zk.register({
    url: '/api.cn',
    interfaceName: 'getDataInfo',
    data: 'Hello zookeeper'
  })
})
