namespace SpriteKind {
    export const PowerUp = SpriteKind.create()
    export const HealthBar = SpriteKind.create()
}
class SpriteWithHealth
{
    sprite: Sprite
    healthBar: HealthBar
    currentHealth: number
    maxHealth: number
    constructor(img: Image, kind: number, maxHealth: number, currentHealth: number)
    {
        this.sprite = sprites.create(img, kind)
        this.healthBar = new HealthBar(maxHealth, currentHealth)
        this.maxHealth = maxHealth
        this.currentHealth = currentHealth
        this.sprite.setStayInScreen(true)
    }
    drawHealthBar()
    {
        this.healthBar.draw(this.sprite.x, this.sprite.y, this.sprite.image.height, this.currentHealth)
    }
    getHealth()
    {
        return this.currentHealth
    }
    /**
     * Changes health by specified amount
     */
    changeHealth(amount: number)
    {
        this.currentHealth = Math.clamp(0, this.maxHealth, this.currentHealth + amount)
        return this.getHealth()
    }
    checkCollisions()
    {
        // To be implemented on child classes
    }
}
class PlayerSprite extends SpriteWithHealth
{
    constructor(img: Image, maxHealth: number, currentHealth: number)
    {
        super(img, SpriteKind.Player, maxHealth, currentHealth)
        controller.moveSprite(this.sprite, 70, 70)
        scene.cameraFollowSprite(this.sprite)
    }
    checkCollisions()
    {
        if(this.sprite.tileKindAt(TileDirection.Center, assets.tile`hazardLava1`))
        {
            console.log(this.changeHealth(-1 * LAVA_DAMAGE))
        }
    }
}
class HealthBar
{
    max: number
    current: number
    healthBar: Sprite
    constructor(maxHealth: number, currentHealth: number)
    {
        this.healthBar = sprites.create(image.create(20, 4), SpriteKind.HealthBar)
        this.max = maxHealth
        this.current = currentHealth
    }
    draw(x: number, y: number, imgHeight: number, hp:number)
    {
        this.current = hp
        let barImg = this.healthBar.image
        this.healthBar.setPosition(x, y + (imgHeight / 1.25))
        barImg.drawRect(1, 1, this.healthBar.width - 2, 2, 2)
        barImg.drawRect(1, 1, (this.healthBar.width - 2) * (this.current / this.max), 2, 7)
        barImg.drawRect(0, 0, this.healthBar.width, this.healthBar.height, 12)
    }
    updateHealth(newHealth: number)
    {
        this.current = newHealth
    }
}
class PowerUp
{
    powerUpKinds = [assets.image``]
    sprite: Sprite
    kind: number
    constructor(kind: number)
    {
        this.kind = kind
        this.sprite = sprites.create(this.powerUpKinds[kind], SpriteKind.PowerUp)
    }
    handleOverlapped(player: SpriteWithHealth)
    {
        // TODO: Implement powerup
    }
}
/**
 * Constants
 */
let LAVA_DAMAGE = 2 // Amount of damage lava does per-tick

scene.setTileMapLevel(assets.tilemap`level`)
scene.setBackgroundColor(3)
let player = new PlayerSprite(assets.image`heroWalkFront1`, 100, 100)
player.sprite.setPosition(129.5,123.5)
tiles.tileAtLocationIsWall(tiles.getTileLocation(0, 0))
tiles.tileAtLocationEquals(tiles.getTileLocation(0, 0), assets.tile`tileGrass1`)

controller.player1.onButtonEvent(ControllerButton.A, ControllerButtonEvent.Pressed, function() {
})

// Game loop. Needed to draw health bars
game.onUpdate(function () {
    player.drawHealthBar()
    if(player != null)
        player.checkCollisions()    
    console.log(player.sprite.x + " " + player.sprite.y)
})
