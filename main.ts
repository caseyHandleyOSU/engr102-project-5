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
        this.healthBar.draw(this.sprite.x, this.sprite.y, this.sprite.image.height)
    }
    getHealth()
    {
        return this.currentHealth
    }
    changeHealth(amount: number)
    {
        this.currentHealth = Math.clamp(0, this.maxHealth, this.currentHealth - amount)
        return this.getHealth()
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
    draw(x: number, y: number, imgHeight: number)
    {
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
scene.setTileMapLevel(assets.tilemap`forestLevel`)
scene.setBackgroundColor(3)
let player = new PlayerSprite(assets.image`heroWalkFront1`, 100, 100)
tiles.tileAtLocationIsWall(tiles.getTileLocation(0, 0))
tiles.tileAtLocationEquals(tiles.getTileLocation(0, 0), assets.tile`tileGrass1`)

// Game loop. Needed to draw health bars
game.onUpdate(function () {
    player.drawHealthBar()
    console.log(player.sprite.tileKindAt(TileDirection.Left, assets.image`hazardLava1`))
})
