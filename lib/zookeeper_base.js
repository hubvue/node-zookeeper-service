const { EventEmitter } = require('events')
const ZooKeeper = require('node-zookeeper-client')
const CreateMode = ZooKeeper.CreateMode

class ZookeeperBase extends EventEmitter {
  constructor() {
    super()
    this.CreateMode = CreateMode

    this.on(
      'watchChildren',
      async (path, interfaceName, children, listener) => {
        try {
          let consumerUrl = `${path}/${interfaceName}`
          const pathArr = consumerUrl.split('/')
          if (children.includes(pathArr[pathArr.length - 1])) {
            const data = await this._getData(consumerUrl)
            listener(consumerUrl, children, data)
          }
        } catch (err) {
          this.emit('error', err)
        }
      }
    )
    this.on('deleteChild', path => {
      console.log('delete child', path)
    })
  }
  createClient(url) {
    this._zkClient = ZooKeeper.createClient(url)
    return this._zkClient
  }
  async connect(cb) {
    cb = cb || (() => {})
    await this._zkClient.connect()
    cb()
  }
  _getData(path) {
    return new Promise((resolve, reject) => {
      this._zkClient.getData(path, (error, data, stat) => {
        if (error) {
          reject(error)
          return
        }
        resolve(data)
      })
    })
  }
  _watchChildren(path, interfaceName, listener) {
    return new Promise((resolve, reject) => {
      this._zkClient.getChildren(
        path,
        () => {
          if (this._subscribeMap.has(path)) {
            this._watchChildren(path, interfaceName, listener).catch(e =>
              this.emit('deleteChild', path)
            )
          }
        },
        (err, children) => {
          if (err) {
            if (err.name === 'NO_NODE' && err.code === -101) {
              reject(err)
              return
            }
          }
          this.emit('watchChildren', path, interfaceName, children, listener)
          resolve()
        }
      )
    })
  }
  _mkdirp(path) {
    return new Promise((resolve, reject) => {
      this._zkClient.mkdirp(path, (err, path) => {
        if (err) {
          reject(err)
          return
        }
        resolve(path)
      })
    })
  }
  _remove(path, version) {
    version = version || -1
    return new Promise((resolve, reject) => {
      this._zkClient.remove(path, version, err => {
        if (err) {
          reject(err)
        }
        resolve()
      })
    })
  }
  _removeAll(path, version) {
    version = version || -1
    return new Promise((resolve, reject) => {
      this._zkClient.removeRecursive(path, version, err => {
        if (err) {
          reject(err)
        }
        resolve()
      })
    })
  }
  _exists(path) {
    return new Promise((resolve, reject) => {
      this._zkClient.exists(path, (error, stat) => {
        if (error) {
          reject(error, stat)
          return
        }
        resolve(stat)
      })
    })
  }
  _create(path, buffer, ...args) {
    return new Promise((resolve, reject) => {
      this._zkClient.create(path, buffer, ...args, (error, stat) => {
        if (error) {
          reject(error, stat)
          return
        }
        resolve(stat)
      })
    })
  }
}

module.exports = ZookeeperBase
