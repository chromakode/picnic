var SPREAD = .075  // radius of lat/long randomization
var REALLY_ORDER = false

function randomRange(min, max) {
  return min + Math.random() * (max - min)
}

function getLocation() {
  return new Promise((resolve, reject) => {
    navigator.geolocation.getCurrentPosition(resolve, reject, {enableHighAccuracy: true})
  })
}

function randomAddress(latitude, longitude, spread) {
  return new Promise((resolve, reject) => {
    let tries = 5

    function tryToGenerate() {
      const latlng =  [
        latitude + randomRange(-spread, spread),
        longitude + randomRange(-spread, spread),
      ].join(',')
      fetch(`https://maps.googleapis.com/maps/api/geocode/json?key=${GOOGLE_API_KEY}&latlng=${latlng}`)
        .then(resp => resp.json())
        .then(data => {
          const target = data.results.find(r => r.types[0] == 'street_address')
          if (target) {
            resolve({address: target.formatted_address})
          } else if (tries > 0) {
            tries--
            tryToGenerate()
          } else {
            reject(new Error('Failed to generate a random address'))
          }
        })
    }

    tryToGenerate()
  })
}

let order = {}

function randomOrder() {
  chrome.tabs.create({url: 'http://eat24.com'}, tab => {
    order.eat24TabId = tab.id
  })
}

function requestUber() {
  chrome.tabs.create({url: 'https://m.uber.com'}, tab => {
    order.uberTabId = tab.id
  })
}

function chooseLocation() {
  return getLocation()
    .then(({coords: {latitude, longitude}}) => randomAddress(latitude, longitude, SPREAD))
    .then(({address, latlng}) => {
      order.address = address
      return {address}
    })
}

chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  console.log('received', msg, sender)
  if (sender.url == chrome.extension.getURL('popup.html')) {
    if (msg.kind == 'locate') {
      chooseLocation().then(sendResponse)
      return true  // indicate to Chrome that sendResponse will be called async
    } else if (msg.kind == 'begin') {
      randomOrder()
    }
  } else if (sender.tab) {
    if (sender.tab.id == order.eat24TabId && msg.kind == 'eat24') {
      if (msg.pageKind == 'front') {
        sendResponse({cmd: 'searchAddress', args: {
          address: order.address,
        }})
      } else if (msg.pageKind == 'results') {
        sendResponse({cmd: 'chooseRestaurant'})
      } else if (msg.pageKind == 'menu') {
        sendResponse({cmd: 'chooseItems', args: {
          targetPrice: randomRange(10, 30),
        }})
      } else if (msg.pageKind == 'address') {
        sendResponse({cmd: 'confirmAddress'})
      } else if (msg.pageKind == 'checkout') {
        sendResponse({cmd: 'checkout', args: {
          tipFrac: randomRange(.1, .35),
          reallyOrder: REALLY_ORDER,
        }})
      } else if (msg.pageKind == 'ordered') {
        requestUber(order.address)
      }
    } else if (sender.tab.id == order.uberTabId && msg.kind == 'uber') {
      sendResponse({cmd: 'callUber', args: {
        address: order.address,
        reallyOrder: REALLY_ORDER,
      }})
    }
  }
})
