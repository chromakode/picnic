const FUDGE_DELAY = 1000

function randomChoice(array) {
   return array[Math.floor(Math.random() * array.length)]
}

const commands = {
  searchAddress({address}) {
    const s = document.querySelector('select#address_id')
    s.value = 'new_address'
    triggerOnChange(s)

    document.querySelector('input#address').value = address

    const d = document.querySelector('select#dtype')
    d.value = 'delivery'
    triggerOnChange(d)

    document.querySelector('#search_form').submit()
  },

  chooseRestaurant() {
    const openNow = document.querySelector('#feature_05')
    openNow.checked = true
    triggerOnChange(openNow)

    // scroll the page to make Eat24 load more options
    setTimeout(() => {
      let scrolls = 20
      function scroll() {
        window.scrollTo(0, window.scrollY + 500)
        if (scrolls-- > 0) {
          setTimeout(scroll, 100)
        } else {
          choose()
        }
      }

      function choose() {
        const menus = document.querySelectorAll('.content_list_viewmenu')
        randomChoice(menus).querySelector('a').click()
      }

      scroll()
    }, FUDGE_DELAY)
  },

  chooseItems({targetPrice}) {
    function chooseItem() {
      const total = Number(document.querySelector('#total span').textContent.substr(1))
      if (total > targetPrice) {
        document.querySelector('#checkout_btn').click()
        return
      }
      const items = document.querySelectorAll('.cpa')
      randomChoice(items).click()

      waitForSelector('.add_item_info').then(itemInfo => {
        // customize randomly
        Array.prototype.forEach.call(itemInfo.querySelectorAll('#add_item_customize select'), selectBox => {
          selectBox.value = randomChoice(selectBox.querySelectorAll('option')).value
        })
        Array.prototype.forEach.call(itemInfo.querySelectorAll('#add_item_customize input[type="checkbox"], .add_item_customize input[type="radio"]'), checkBox => {
          if (Math.random() > .8) {
            checkBox.checked = true
          }
        })
        return wait(FUDGE_DELAY)
      }).then(() => {
        const price = Number(document.querySelector('#add_item_price').textContent.substr(1))
        if (price + total > 1.5 * targetPrice) {
          // too rich for my blood!
          chooseItem()
          return
        }
        document.querySelector('.add_item_submit + button').click()
        setTimeout(() => {
          chooseItem()
        }, FUDGE_DELAY)
      })
    }

    // clear cart
    const itemCount = document.querySelectorAll('#cart .del_item').length
    for (let i = 0; i < itemCount; i++) {
      setTimeout(() => document.querySelector('#cart .del_item').click(), i * 1000)
    }
    setTimeout(chooseItem, 1000 * itemCount)
  },

  confirmAddress() {
    document.querySelector('.add_address_form').submit()
  },

  checkout({tipFrac, reallyOrder}) {
    const total = Number(document.querySelector('#chekout_amount').textContent.substr(1))
    document.querySelector('#tip_prc').value = ''
    document.querySelector('#tip').value = (tipFrac * total).toFixed(2)
    if (reallyOrder) {
      // "submit buttom"? really???
      document.querySelector('#submit_buttom').click()
      setTimeout(() => {
        chrome.runtime.sendMessage({kind: 'eat24', pageKind: 'ordered'})
      }, FUDGE_DELAY)
    } else {
      chrome.runtime.sendMessage({kind: 'eat24', pageKind: 'ordered'})
    }
  }
}

let pageKind
if (document.querySelector('#tip_prc')) {
  pageKind = 'checkout'
} else if (document.querySelector('.add_address_form')) {
  pageKind = 'address'
} else if (document.querySelector('#address_id')) {
  pageKind = 'front'
} else if (document.querySelector('#rest_menu')) {
  pageKind = 'menu'
} else if (document.querySelector('#contents_list')) {
  pageKind = 'results'
}

chrome.runtime.sendMessage({kind: 'eat24', pageKind}, response => {
  console.log('command', response)
  commands[response.cmd](response.args)
})
