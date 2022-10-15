import utils from './utils'
import gsap from 'gsap'
const canvas = document.querySelector('canvas')
const scoreId = document.getElementById('score')
const startGameBtn = document.getElementById('start-game')
const modelEl = document.getElementById('model-el')
const finalScore = document.getElementById('final-score')

const c = canvas.getContext('2d')

let score = 0

canvas.width = innerWidth
canvas.height = innerHeight

const mouse = {
  x: innerWidth / 2,
  y: innerHeight / 2
}

const center = {
  x: canvas.width / 2,
  y: canvas.height / 2
}


let objects
let animationId
let enemies = []
let projectiles = []
let particles = []

const gravity = 0.1
const friction = 0.99

const colors = ['#2185C5', '#7ECEFD', '#FFF6E5', '#FF7F66']

// Event Listeners
addEventListener('mousemove', (event) => {
  mouse.x = event.clientX
  mouse.y = event.clientY
})

addEventListener('resize', () => {
  canvas.width = innerWidth
  canvas.height = innerHeight

  init()
})

// Objects
class Object {
  constructor(x, y, radius, color) {
    this.x = x
    this.y = y
    this.radius = radius
    this.color = color
  }

  draw() {
    c.beginPath()
    c.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false)
    c.fillStyle = this.color
    c.fill()
    c.closePath()
  }

  update() {
    this.draw()
  }
}

class Player extends Object {
  constructor(x, y, radius, color) {
    super(x, y, radius, color)
  }
  draw() {
    super.draw()
  }
  update() {
    this.draw()
  }
}

class Projectile extends Object {
  constructor(x, y, radius, color, velocity) {
    super(x, y, radius, color)
    this.velocity = velocity
    this.angle = Math.atan2(mouse.y - center.y, mouse.x - center.x)
  }
  draw() {
    super.draw()
  }
  update() {
    this.x += Math.cos(this.angle) * this.velocity
    this.y += Math.sin(this.angle) * this.velocity
    this.draw()
  }
}

class Enemy extends Object {
  constructor(x, y, radius, color, velocity) {
    super(x, y, radius, color)
    this.velocity = velocity
    this.angle = Math.atan2(center.y - this.y, center.x - this.x)
  }
  draw() {
    super.draw()
  }
  update() {
    this.x += Math.cos(this.angle) * this.velocity
    this.y += Math.sin(this.angle) * this.velocity
    this.draw()
  }
}

class Particle extends Object {
  constructor(x, y, radius, color, velocity) {
    super(x, y, radius, color)
    this.ttl = 100
    this.velocity = velocity
    this.alpha = 1
  }
  draw() {
    c.save()
    c.globalAlpha = this.alpha
    c.beginPath()
    c.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false)
    c.fillStyle = this.color
    c.fill()
    c.restore()
  }
  update() {

    this.draw()
    this.ttl -= 1
    this.alpha -= 0.01
    this.velocity.x *= friction
    this.velocity.y *= friction
    this.x += this.velocity.x 
    this.y += this.velocity.y
  }
}


function spawnEnemies() {
  setTimeout(spawnEnemies, 1000)
  const x = Math.random() < 0.5 ? canvas.width : 0
  const y = Math.random() * canvas.height
  const radius = Math.random() * (30 - 4) + 4
  const color = `hsl(${Math.random() * 360}, 100%, 50%)`
  const velocity = Math.random() * 1 + 1
  enemies.push(new Enemy(x, y, radius, color, velocity))
}

let player = new Player(center.x, center.y, 10, '#FFF')
player.draw()


window.addEventListener('click', (event) => {
  
  projectiles.push(new Projectile(player.x, player.y, 10, '#FFF', 5))
})


// Implementation

function init() {
  player = new Player(center.x, center.y, 10, '#FFF')
  player.draw()
  objects = []
  animationId
  enemies = []
  projectiles = []
  particles = []
  score = 0
  scoreId.innerHTML = score
  finalScore.innerHTML = score
}

// Animation Loop
function animate() {
  scoreId.innerHTML = score
  animationId = requestAnimationFrame(animate)
  c.fillStyle = 'rgba(0, 0, 0, 0.1)'
  c.fillRect(0, 0, canvas.width, canvas.height)
  player.update()
  particles.forEach((particle, index) => {
    if (particle.ttl > 0 && particle.alpha > 0) {
      particle.update()
    } else {
      particles.splice(index, 1)
    }
  })
  projectiles.forEach((projectile) => {
    projectile.update()
    if (projectile.x < 0 || projectile.x > canvas.width || projectile.y < 0 || projectile.y > canvas.height) {
      projectiles.splice(projectiles.indexOf(projectile), 1)
    }
  })
  enemies.forEach((enemy) => {
    enemy.update()
    const distFromPlayer = Math.hypot(enemy.x - player.x, enemy.y - player.y)
    if (distFromPlayer < enemy.radius + player.radius) {
      cancelAnimationFrame(animationId)
      modelEl.style.display = 'flex'
      finalScore.innerHTML = score
    }
    projectiles.forEach((projectile) => {
      const distance = Math.hypot(enemy.x - projectile.x, enemy.y - projectile.y)
      if (distance < enemy.radius + projectile.radius) {
        score += 100
        for (let i = 0; i < enemy.radius*2; i++) {
          particles.push(new Particle(enemy.x, enemy.y, Math.random()*2, enemy.color, {
            x: Math.random() * 4 - 1,
            y: Math.random() * 4 - 1
          }))
        }
        if (enemy.radius <= 10) {
          enemies.splice(enemies.indexOf(enemy), 1)
          
        }
        else {
          gsap.to(enemy, {
            radius: enemy.radius - 10,
            duration: 0.5,
            ease: 'power2.inOut'
          })
        }
        // enemies.splice(enemies.indexOf(enemy), 1)

        projectiles.splice(projectiles.indexOf(projectile), 1)
      }

    })
  })
  // c.fillText('HTML CANVAS BOILERPLATE', mouse.x, mouse.y)
  // objects.forEach(object => {
  //  object.update()
  // })
}

startGameBtn.addEventListener('click', () => {
  init()
  modelEl.style.display = 'none'
  animate()
  spawnEnemies()
})