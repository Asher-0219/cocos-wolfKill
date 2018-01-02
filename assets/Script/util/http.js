/**
 * @author zct
 * ajax post方法
 */
// url, data, header, isPost, callback, errorcallback
function ajax (obj) {
  if (obj.url == null || obj.url == '') {
    console.warn('url不能为空')
    return
  }

  if (GAME_NATIVE) {
    if (obj.url.indexOf('http://120.27.194.197/') != -1) {
      if (cc.sys.OS_IOS == cc.sys.os) {
        obj.url = obj.url.replace('http://120.27.194.197/', 'https://wtf1.xys.ren/')
      }
    }
  }

  let xhr = new XMLHttpRequest()

  if (obj.isPost) {
    xhr.open('POST', obj.url)
  } else {
    xhr.open('GET', obj.url)
  }

  xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded')

  if (obj.header) {
    for (let header in obj.header) {
      xhr.setRequestHeader(header, obj.header[header])
    }
    obj.data = formatMsg(obj.data, obj.url)
  }

  xhr.onreadystatechange = function () {
    if (xhr.readyState == 4 && xhr.status == 200) {
      let response = xhr.responseText
      if (GAME_NATIVE) {
        callNativeMethod({
          methodNameAndroid: 'appLog',
          methodNameIOS: 'appLog:',
          methodSignature: '(Ljava/lang/String;)V',
          parameters: [response]
        })
      }
      obj.success && obj.success(response)
    } else if (xhr.readyState == 4 && xhr.status != 200) {
      let response = xhr.responseText
      obj.error && obj.error(response)
    }
  }

  if (obj.data == null || obj.data == '') {
    xhr.send()
  } else {
    xhr.send(json2Form(obj.data))
  }
}

function json2Form (json) {
  var str = []
  for (var p in json) {
    str.push(encodeURIComponent(p) + '=' + encodeURIComponent(json[p]))
  }
  return str.join('&')
}

function formatMsg (data, url) {
  let arr = [],
    obj = {},
    str = ''
  for (let key in data) {
    arr.push(key)
  }
  arr.sort()
  for (let i = 0; i < arr.length; i++) {
    let key = arr[i]
    obj[key] = data[key]
    str += key + '=' + data[key] + '&'
  }
  str += 'url=' + url + '&sign=' + GAME_SIGN
  let sign = MD5(str).toUpperCase()
  obj.sign = sign
  return obj
}

let http = {
  post (obj) {
    obj.isPost = true
    ajax(obj)
  },
  get (obj) {
    obj.isPost = false
    ajax(obj)
  }
}

// http.post({
//     url:'http://api.xys.ren/interface/html.php',
//     data:{
//         goodsId:"7216|3878|7247|7257|7255|7258",
//         action:'getGoodslist',
//         num:3
//     },
//     success:function(data){
//         console.log(data);
//     }
// });

module.exports = http
