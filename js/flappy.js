function newElement(tagName, className) {
  const elem = document.createElement(tagName)
  elem.className = className

  return elem
}

function Barrier(reverse = false) {
  this.element = newElement('div', 'barrier')

  const edge = newElement('div', 'edge')
  const barrierBody = newElement('div', 'barrier-body')
  this.element.appendChild(reverse ? barrierBody : edge)
  this.element.appendChild(reverse ? edge : barrierBody)

  this.setHeight = height => barrierBody.style.height = `${height}px`
}

function PairOfBarriers(height, opening, x) {
  this.element = newElement('div', 'pair-of-barriers')

  this.superior = new Barrier(true)
  this.inferior = new Barrier(false)

  this.element.appendChild(this.superior.element)
  this.element.appendChild(this.inferior.element)

  this.drawOpening = () => {
    const superiorHeight = Math.random() * (height - opening)
    const inferiorHeight = height - opening - superiorHeight
    this.superior.setHeight(superiorHeight)
    this.inferior.setHeight(inferiorHeight)  
  }

  this.getX = () => parseInt(this.element.style.left.split('px')[0])
  this.setX = x => this.element.style.left = `${x}px`
  this.getWidth = () => this.element.clientWidth 

  this.drawOpening()
  this.setX(x)
}

function Barriers(height, width, opening, space, addPoint) {
  this.pairs = [
    new PairOfBarriers(height, opening, width),
    new PairOfBarriers(height, opening, width + space),
    new PairOfBarriers(height, opening, width + space * 2),
    new PairOfBarriers(height, opening, width + space * 3),
  ];
  
  const displacement = 3;
  this.animate = () => {
    this.pairs.forEach(pair => {
      pair.setX(pair.getX() - displacement);

      if (pair.getX() < -pair.getWidth()) {
        pair.setX(pair.getX() + space * this.pairs.length);
        pair.drawOpening();
      } 

      const middle = width / 2;
      const passedTheMiddle = pair.getX() + displacement >= middle
        && pair.getX() < middle
      if (passedTheMiddle) {
          addPoint();
      } 
    });
  }
}

function Bird(scenarioHeight) {
  let flying = false

  this.element = newElement('img', 'bird')
  this.element.src = 'imgs/bird.png'

  this.getY = () => parseInt(this.element.style.bottom.split('px')[0])
  this.setY = y => this.element.style.bottom = `${y}px`

  window.onkeydown = e => {
    if (e.keyCode === 32) {
      flying = true
    }    
  }

  window.onkeyup = e => flying = false

  this.animate = () => {
    const newY = this.getY() + (flying ? 8 : -5)
    const maxHeight = scenarioHeight - this.element.clientHeight

    if (newY <= 0) {
      this.setY(0)
    } else if (newY >= maxHeight) {
      this.setY(maxHeight)
    } else {
      this.setY(newY)
    }
  }

  this.setY(scenarioHeight / 2)
}

function Progress() {
  this.element = newElement('span', 'progress')
  this.updatePoints = points => {
    this.element.innerHTML = points
  }
  this.updatePoints(0)
}

function overlappingElements(elementA, elementB) {
  const a = elementA.getBoundingClientRect()
  const b = elementB.getBoundingClientRect()

  const horizontal = a.left + a.width >= b.left
    && b.left + b.width >= a.left
  
  const vertical = a.top + a.height >= b.top
    && b.top + b.height >= a.top
  
  return horizontal && vertical
}

function colision(bird, barriers) {
  let colision = false
  barriers.pairs.forEach(pairOfBarriers => {
    if (!colision) {
      const superior = pairOfBarriers.superior.element
      const inferior = pairOfBarriers.inferior.element
      colision = overlappingElements(bird.element, superior)
        || overlappingElements(bird.element, inferior)
    }
  })
  return colision
}

function FlappyBird() {
  let points = 0

  const scenarioArea = document.querySelector('[wm-flappy]')
  const height = scenarioArea.clientHeight
  const width = scenarioArea.clientWidth

  const progress = new Progress()
  const barriers = new Barriers(height, width, 200, 400,
    () => progress.updatePoints(++points))
  const bird = new Bird(height)

  scenarioArea.appendChild(progress.element)
  scenarioArea.appendChild(bird.element)
  barriers.pairs.forEach(pair => scenarioArea.appendChild(pair.element))

  this.start = () => {
    const timer = setInterval(() => {
      barriers.animate()
      bird.animate()

      if (colision(bird, barriers)) {
        console.log('teste')
        clearInterval(timer)
      }
    }, 20)
  }
}

new FlappyBird().start()



