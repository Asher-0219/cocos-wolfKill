/**
 * @author zct
 * 工具类方法
 */
function repalceImgUrl (url, size) {
  let imgUrl, imgSize
  if (size) {
    imgSize = '@0o_1l_' + size[0] + 'w_' + size[1] + 'h_90q.jpg'
  } else {
    imgSize = '@0o_1l_100w_100h_90q.jpg'
  }
  if (url.indexOf('file=') != -1) {
    let fileValue = url.split('=')[1]
    imgUrl = 'https://appfile.xys.ren/' + fileValue + imgSize
  } else {
    if (url.indexOf('@') != -1) {
      imgUrl = url.split('@')[0] + imgSize
    } else {
      imgUrl = url + imgSize
    }
  }
  if (GAME_NATIVE) {
    callNativeMethod({
      methodNameAndroid: 'appLog',
      methodNameIOS: 'appLog:',
      methodSignature: '(Ljava/lang/String;)V',
      parameters: ['图片地址:' + imgUrl]
    })
  }
    // console.log('图片地址:'+imgUrl);
  return imgUrl
}

function loadImage (url, node, cb, size) {
  let imgUrl = url
  if (size) {
    imgUrl = repalceImgUrl(url, size)
  }
  try {
    cc.loader.load({
      url: imgUrl
    }, (err, texture) => {
      if (err) {
        cc.error(err.message || err)
      } else {
        let sp = new cc.SpriteFrame(texture),
          sprite = node.getComponent(cc.Sprite),
          w = sprite.node.width,
          h = sprite.node.height
        if (sp) {
          sprite.spriteFrame = sp
          sprite.node.width = w
          sprite.node.height = h
          cb && cb(sp)
        }
      }
    })
  } catch (e) {

  }
}

function findProperty (array, property, value) {
  if (array.length <= 0) return -1
  for (let i = 0; i < array.length; i++) {
    if (array[i] && array[i][property] == value) {
      return i
    }
  }
  return -1
}

function quitGame (socket) {
  if (socket) {
    socket.close(function () {
      GAME_SOCKET = true
    })
  }

  if (GAME_INAPP) {
    COMMONOBJ.appExitRoom()
  }

  if (GAME_NATIVE) {
    callNativeMethod({
      methodNameAndroid: 'appExitRoom',
      methodNameIOS: 'appExitRoom',
      methodSignature: '()V',
      parameters: []
    })
  }

  if (cc.sys.OS_IOS == cc.sys.os) {
    cc.director.end()
  }
}

function ping (url, callback) {
  var xmlhttp
  var start = new Date().getTime()
  xmlhttp = new XMLHttpRequest()
  xmlhttp.open('GET', url, true)
  xmlhttp.send()
  xmlhttp.onreadystatechange = function () {
    if (xmlhttp.readyState == 4) { // 4 = "loaded"
      if (xmlhttp.status == 200) { // 200 = "OK"
        var pong = new Date().getTime() - start
        if (typeof callback === 'function') {
          callback(pong)
        }
      }
    }
  }
}

function netConnect (socket, cb) {
    // 检测socket
  let ws = socket.getWs()
  if (cc.sys.isObjectValid(ws) && ws) {
        // 检查对象有效
    let isConnect = socket.getConnect()
    if (ws.readyState && ws.readyState !== 1 && isConnect) {
      cb && cb(socket)
    }
  } else {
    cb && cb(socket)
  }
}

module.exports = {
  repalceImgUrl,
  findProperty,
  loadImage,
  quitGame,
  netConnect,
  ping
}
