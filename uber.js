const FUDGE_DELAY = 1000

const commands = {
  callUber({address, reallyOrder}) {
    // select UberX
    // TODO choose random Uber type
    waitForSelector('.vehicle-selector [data-id="8"] a').then(uberXBtn => {
      uberXBtn.click()
      return waitForSelector('#set-pickup-btn')
    }).then(pickupBtn => {
      pickupBtn.click()
      return wait(FUDGE_DELAY)
    }).then(() => {
      // surge YOLO
      const surgeAccept = document.querySelector('.rates-view .accept')
      if (surgeAccept) {
        surgeAccept.click()
        return wait(FUDGE_DELAY)
      }
    }).then(() => {
      document.querySelector('p.pickup a').click()
      return wait(FUDGE_DELAY)
    }).then(() => {
      const pickupEl = document.querySelector('#search-pickup')
      pickupEl.value = address

      // fake keyup event triggers search update
      var ev = document.createEvent('KeyboardEvent')
      ev.initEvent('keyup', true, true, window, false, false, false, false, 13, 13)
      pickupEl.dispatchEvent(ev)

      return waitForSelector('.search-results .location.backfill')
    }).then(() => {
      document.querySelector('.search-results a').click()
      if (reallyOrder) {
        return waitForSelector('.btn-black.accept')
      }
    }).then(acceptBtn => {
      if (acceptBtn) {
        acceptBtn.click()
      }
      chrome.runtime.sendMessage({kind: 'uber', pageKind: 'ordered'})
    })
  },
}

let pageKind
if (document.querySelector('#contents_list')) {
  pageKind = 'results'
}

chrome.runtime.sendMessage({kind: 'uber', pageKind}, response => {
  console.log('command', response)
  commands[response.cmd](response.args)
})
