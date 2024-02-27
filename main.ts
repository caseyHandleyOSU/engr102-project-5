namespace SpriteKind {
    export const PowerUp = SpriteKind.create()
    export const HealthBar = SpriteKind.create()
    export const Map = SpriteKind.create()
    export const Key = SpriteKind.create()
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
    /**
     * Returns a number >=0 if touching one of the types provided. -1 if touching nothing
     */
    touchingTileOfTypes(types: Image[])
    {
        for(let i = 0; i < types.length; i++)
        {
            if(this.sprite.tileKindAt(TileDirection.Center, types[i]))
            {
                return i
            }
        }
        return -1
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
        this.useDoor(this.touchingTileOfTypes([assets.tile`doorOpenNorth`, assets.tile`doorOpenEast`, assets.tile`doorOpenSouth`, assets.tile`doorOpenWest`]))

    }
    useDoor(direction: number)
    {
        if(direction > -1 && direction < 4)
        {
            changeMap(MAP_DATAS[currentMap].doors[direction])
        }
    }
}
class Enemy extends SpriteWithHealth
{
    constructor(img: Image, maxHealth: number, currentHealth: number) {
        super(img, SpriteKind.Enemy, maxHealth, currentHealth)
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
class Key
{
    x: number
    y: number
    doorID: number
    sprite: Sprite = null

    constructor(x: number, y: number, doorID: number)
    {
        this.x = x
        this.y = y
        this.doorID = doorID
        console.log("Created key!")
        this.createSprite()
    }

    createSprite()
    {
        console.log("Creating Sprite!")
        this.destroySprite()
        this.sprite = sprites.create(assets.image`keyImage`, SpriteKind.Key)
        this.sprite.setPosition(this.x, this.y)
    }
    destroySprite()
    {
        if (this.sprite != null) {
            this.sprite.destroy()
        }
    }
}
class MapData
{
    /**
     * Map Sprite Control
     */
    enemies: Enemy[] = []
    powerUps: PowerUp[] = []
    shadow: Sprite
    keys: Key[] = []

    /**
     * Map Data Values
     */
    spawnX: number
    spawnY: number
    doors: number[]
    shadowScale: number
    tilemap: tiles.TileMapData
    keyLocations: number[][]

    /** 
     * Setup
     */
    setup: boolean
    
    constructor(spawnX: number, spawnY: number, tilemap: tiles.TileMapData, doors: number[], usesShadow: number, keys: number[][])
    {
        this.spawnX = spawnX
        this.spawnY = spawnY
        this.tilemap = tilemap
        this.doors = doors
        this.shadowScale = usesShadow
        this.keyLocations = keys
    }
    addEnemy(enemy: Enemy)
    {
        this.enemies.push(enemy)
    }
    removeEnemyIndex(index: number)
    {
        this.enemies.removeAt(index)
    }
    removeEnemy(enemy: Enemy)
    {
        for(let i = 0; i < this.enemies.length; i++)
        {
            if(this.enemies[i] = enemy)
            {
                this.removeEnemyIndex(i)
                break
            }
        }
    }
    draw()
    {
        if(this.shadowScale > 0)
        {
            if(this.shadow == null)
                this.shadow = sprites.create(assets.image`shadow`, SpriteKind.Map)
            this.shadow.setPosition(player.sprite.x, player.sprite.y)
            this.shadow.z = -1
            this.shadow.setScale(this.shadowScale)
        }
    }
    mapChanged()
    {
        if (this.shadow != null)
        {
            this.shadow.destroy()
            this.shadow = null
        }
        // Destroy all key sprites
        for(let i = 0; i < this.keys.length; i++)
        {
            this.keys[i].destroySprite()
        }
    }
    setActiveMap()
    {
        if(!this.setup)
        {
            for (let i = 0; i < this.keyLocations.length; i++) {
                console.log(i + " " + this.keyLocations[i][0] + " " + this.keyLocations[i][1] + " " + this.keyLocations[i][2])
                let keyBuilder = new Key(this.keyLocations[i][0], this.keyLocations[i][1], this.keyLocations[i][2])
                keyBuilder.createSprite()
                this.keys.push(keyBuilder)
            }
        }
        else // Returning to board
        {
            // TODO: Rebuild keys, enemies, etc
        }
    }
}
/**
 * Constants
 */
let MAP_DATAS = [new MapData(129.5, 123.5, assets.tilemap`level`, [1, 2, 0, 0], 0, [[]]), 
    new MapData(129.5, 123.5, assets.tilemap`intersection`, [0, 0, 0, 0], 0, [[]]),
    new MapData(39, 119, assets.tilemap`mazeR`, [1, 0, 0, 0], 8.75, [[230, 24, 0]])
]

let LAVA_DAMAGE = 2 // Amount of damage lava does per-tick

let currentMap = 0
scene.setTileMapLevel(assets.tilemap`level`)
scene.setBackgroundColor(0)
let player = new PlayerSprite(assets.image`heroWalkFront1`, 100, 100)
player.sprite.setPosition(129.5,123.5)

controller.player1.onButtonEvent(ControllerButton.A, ControllerButtonEvent.Pressed, function() {
})


function changeMap(toMap: number)
{
    MAP_DATAS[currentMap].mapChanged()
    currentMap = toMap
    MAP_DATAS[currentMap].setActiveMap()
    scene.setTileMapLevel(MAP_DATAS[currentMap].tilemap)
    player.sprite.setPosition(MAP_DATAS[currentMap].spawnX, MAP_DATAS[currentMap].spawnY)
    // TODO: Hide/Show PowerUps and Enemies on map change
}

// Game loop. Needed to draw health bars
game.onUpdate(function () {
    MAP_DATAS[currentMap].draw()
    if(player != null)
        player.drawHealthBar()
        player.checkCollisions()    
    //console.log(player.sprite.x + " " + player.sprite.y)
})
