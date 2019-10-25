const Base = require('./zookeeper_base')

class ZooKeeperService extends Base {
  constructor(url = '127.0.0.1:2181') {
    super()
    this._zkClient = this.createClient(url)

    this._zkClient.on('connected', () => {
      this.emit('connected')
    })
    this._zkClient.on('disconnected', () => {
      this.emit('disconnected')
    })
    this._zkClient.on('error', err => {
      this.emit('error', err)
    })
    this._subscribeMap = new Map()
    this._registerMap = new Map()
  }

  // 服务注册
  async register(config, cb) {
    try {
      debugger
      const interfaceName = (config && config.interfaceName) || 'zookeeper'
      const url = (config && config.url) || '/rpc'
      const data = (config && config.data) || ''
      cb = cb || (() => {})
      let path
      if (url.length === 1) {
        path = `${url}${interfaceName}`
      } else {
        path = `${url}/${interfaceName}`
      }
      this._registerMap.set(path, config)

      if (await this._exists(path)) {
        await this._remove(path)
      }
      await this._mkdirp(`${url}`)
      await this._create(path, Buffer.from(data), this.CreateMode.PERSISTENT)
      cb(path)
    } catch (err) {
      if (err.name === 'NODE_EXISTS' && err.code === -110) {
        return
      }
      this.on('error', err)
    }
  }

  // 服务注销
  async unRegister(path, cb) {
    this._registerMap.delete(path)
    if (this._subscribeMap.has(path)) {
      this._subscribeMap.delete(path)
    }
    this._remove(path)
      .catch(err => {
        return this._removeAll(path).catch(err => err)
      })
      .then(err => {
        if (err) {
          this.emit('error', err)
          return
        }
        cb()
      })
  }
  //服务订阅
  async subscribe(config, listener) {
    const interfaceName = (config && config.interfaceName) || 'zookeeper'
    const url = (config && config.url) || '/test'
    if (!this._subscribeMap.has(url)) {
      await this._mkdirp(`${url}`)
      this._watchChildren(`${url}`, interfaceName, listener).catch(
        async err => {
          await this._mkdirp(`${url}`)
          await this._create(url, DATA, this.CreateMode.PERSISTENT)
        }
      )
      this._subscribeMap.set(url, config)
    } else {
      this.emit('error', 'No repeated monitoring！')
    }
  }
  // 服务去订阅
  async unSubscribe(path) {
    try {
      this._subscribeMap.delete(path)
    } catch (e) {
      this.emit('error', e)
    }
  }
}

module.exports = ZooKeeperService
