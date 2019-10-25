// # 连接zookeeper
const ZooKeeper = require('../index')

// 这里连接的zookeeper默认是 127.0.0.1:2181
const zk = new ZooKeeper()
// const zk = new ZooKeeper("127.0.0.1:2182")

zk.on('error', err => {
  console.log(err)
})

zk.connect(() => {
  console.log('zookeeper client is connectd')
})

module.exports = zk
