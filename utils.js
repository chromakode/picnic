var GOOGLE_API_KEY = 'AIzaSyBnYMM8yAZ3GaleBI5CtbsTS_4UshcX4xY'

function waitForSelector(selector) {
  return new Promise((resolve, reject) => {
    function tryDelayed() {
      setTimeout(() => {
        const el = document.querySelector(selector)
        if (el) {
          resolve(el)
        } else {
          tryDelayed()
        }
      }, 250)
    }
    tryDelayed()
  })
}

function wait(delay) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      resolve()
    }, delay)
  })
}

function triggerOnChange(el) {
  var ev = document.createEvent("HTMLEvents")
  ev.initEvent("change", false, true)
  el.dispatchEvent(ev)
}

