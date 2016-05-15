const goButton = document.querySelector('#go')

goButton.addEventListener('click', () => {
  document.body.classList.add('active')
  chrome.runtime.sendMessage({kind: 'locate'}, ({address}) => {
    const img = document.createElement('img')
    const width = window.innerWidth
    const height = window.innerHeight
    img.width = width
    img.height = height
    img.src = `https://maps.googleapis.com/maps/api/streetview?size=${width}x${height}&location=${encodeURIComponent(address)}&fov=90&heading=235&pitch=10&key=${GOOGLE_API_KEY}`
    img.id = "streetview"
    document.body.appendChild(img)

    setTimeout(() => {
      chrome.runtime.sendMessage({kind: 'begin'})
    }, 3000)
  })
})
