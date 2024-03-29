namespace SpriteKind {
    export const PowerUp = SpriteKind.create()
    export const HealthBar = SpriteKind.create()
    export const Map = SpriteKind.create()
    export const Spawnable = SpriteKind.create()
    export const Init = SpriteKind.create()
}
const PowerUpKinds = {
    Health: 0,
    SmallScore: 1,
    MediumScore: 2
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
    resetHealth()
    {
        this.currentHealth = this.maxHealth
    }
    /***
     * Deals damage
     */
    dealDamage(amount: number)
    {
        this.changeHealth(-1 * amount)
    }
    /**
     * Handles collisions with Tiles, such as in the case of lava or doors
     */
    checkCollisions()
    {
        // To be implemented on child classes
    }
    /**
     * Returns a number >=0 if touching one of the types provided. -1 if touching nothing
     */
}
class PlayerSprite extends SpriteWithHealth
{
    cashedHP: number = 0

    constructor(img: Image, maxHealth: number, currentHealth: number)
    {
        super(img, SpriteKind.Player, maxHealth, currentHealth)
        controller.moveSprite(this.sprite, 70, 70)
        scene.cameraFollowSprite(this.sprite)
        this.sprite.z = 5
    }
    checkCollisions()
    {
        if(this.sprite.tileKindAt(TileDirection.Center, assets.tile`hazardLava1`))
        {
            console.log(this.changeHealth(-1 * LAVA_DAMAGE))
        }
        this.useDoor(touchingTileOfTypes(this.sprite, [assets.tile`doorOpenNorth`, assets.tile`doorOpenEast`, assets.tile`doorOpenSouth`, assets.tile`doorOpenWest`]))

    }
    useDoor(direction: number)
    {
        if(direction > -1 && direction < 4)
        {
            MAP_DATAS[currentMap].tryUseDoor([this.sprite.tilemapLocation().x / 16, this.sprite.tilemapLocation().y/16])
        }
    }
    casheHealth(amount: number)
    {
        this.cashedHP += amount
        if(this.cashedHP >= this.maxHealth)
        {
            this.cashedHP -= this.maxHealth
            info.changeLifeBy(1)
        }
    }
    applyPowerUp(kind: number)
    {
        switch(kind)
        {
            case 0:
                if(this.getHealth() >= 100)
                    this.casheHealth(HEART_AMOUNT)
                else
                    this.changeHealth(HEART_AMOUNT)
                break
            default:
                break
        }

    }
    changeHealth(amount: number) {
        let newHP = super.changeHealth(amount)
        if (newHP <= 0)
        {
            playerDied()
        }
        return newHP
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
        this.healthBar.setFlag(SpriteFlag.GhostThroughWalls, true)
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
class SpawnableObject
{
    x: number
    y: number
    SPRITE_KIND: number = SpriteKind.Spawnable
    img: Image
    sprite: Sprite = null
    myType: String
    scoreIncrement: number

    constructor(x: number, y: number, img: Image, myType: String, scoreIncrement: number) {
        this.setPos(x,y)
        this.img = img
        this.myType = myType
        this.scoreIncrement = scoreIncrement
    }
    setPos(x: number, y: number)
    {
        this.x = x
        this.y = y
    }

    createSprite() {
        console.log("Creating Sprite!")
        this.destroySprite()
        this.sprite = sprites.create(this.img, this.SPRITE_KIND)
        this.sprite.setPosition(this.x, this.y)
    }
    destroySprite() {
        if (this.sprite != null) {
            this.sprite.destroy()
        }
    }
    handleCollision(player: PlayerSprite): number[]
    {
        info.setScore(info.score() + this.scoreIncrement)
        return undefined
    }
}
class PowerUp extends SpawnableObject
{
    
    pType: number
    constructor(pType: number, score: number)
    {
        super(0,0,POWER_UP_KINDS[pType],"pUp", score)
        this.pType = pType
    }
    handleCollision(player: PlayerSprite): number[]
    {
        super.handleCollision(player)
        player.applyPowerUp(this.pType)
        this.sprite.destroy()
        return null
    }
    spawn()
    {
        this.createSprite()
        tiles.placeOnRandomTile(this.sprite, assets.tile`floorLight2`)
        this.x = this.sprite.x
        this.y = this.sprite.y
        console.log('spawned sprite @ ' + this.sprite.x + ',' + this.sprite.y)
    }
}
class Key extends SpawnableObject
{
    doorID: number[]

    constructor(x: number, y: number, doorID: number[]) {
        super(x, y, assets.image`keyImage`, "Key", 2)
        this.x = x
        this.y = y
        this.doorID = doorID
        console.log("Created key!")
        this.createSprite()
    }

    handleCollision(player: PlayerSprite): number[]
    {
        super.handleCollision(player)
        this.destroySprite()
        player.sprite.sayText("I found a key!", 5000.0)
        return this.doorID
    }
}
class DoorData
{
    /**
     * Constants
     */
    UNLOCKED_TILES = [assets.tile`doorOpenNorth`, assets.tile`doorOpenEast`, assets.tile`doorOpenSouth`, assets.tile`doorOpenWest`]
    LOCKED_TILES = [assets.tile`doorLockedNorth`, assets.tile`doorLockedEast`, assets.tile`doorLockedSouth`, assets.tile`doorLockedWest`]

    x: number // Tilemap X
    y: number // Tilemap Y
    id: number
    destination: number[] // Map, x, y
    myDirection: number
    isLocked: boolean

    constructor(x: number, y: number, destination: number[], locked: boolean, id: number)
    {
        this.x = x
        this.y = y
        this.id = id
        this.destination = destination
        this.isLocked = locked
    }
    useDoor()
    {
        MAP_DATAS[currentMap].mapChanged()
        currentMap = this.destination[0]
        MAP_DATAS[currentMap].setActiveMap()
        if (this.destination[1] > -1 && this.destination[2] > -1)
            player.sprite.setPosition(this.destination[1], this.destination[2])
        else
            player.sprite.setPosition(MAP_DATAS[currentMap].spawnX, MAP_DATAS[currentMap].spawnY)
        MAP_DATAS[currentMap].setupShadow()
    }
    /**
     * Finds the direction of this specific door
     */
    findDoorDirection()
    {
        console.log("Finding direction")
        let doorHelper = sprites.create(assets.tile`doorOpenEast`, SpriteKind.Init)
        doorHelper.setPosition(this.x * 16, this.y * 16)
        // Get the direction of this door
        if(touchingTileOfTypes(doorHelper, this.UNLOCKED_TILES) != -1)
            this.myDirection = touchingTileOfTypes(doorHelper, this.UNLOCKED_TILES)
        else if(touchingTileOfTypes(doorHelper, this.LOCKED_TILES) != -1)
            this.myDirection = touchingTileOfTypes(doorHelper, this.LOCKED_TILES)
        console.log("Found direction: " + this.myDirection)
        doorHelper.destroy()
        this.updateDoorTile()
    }
    updateDoorTile()
    {
        if(this.isLocked)
        {
            tiles.setTileAt(tiles.getTileLocation(this.x, this.y), this.LOCKED_TILES[this.myDirection])
            tiles.setWallAt(tiles.getTileLocation(this.x, this.y), true)
        }
        else
        {
            tiles.setTileAt(tiles.getTileLocation(this.x, this.y), this.UNLOCKED_TILES[this.myDirection])
            tiles.setWallAt(tiles.getTileLocation(this.x, this.y), false)
        }
    }
    unlockDoor()
    {
        this.isLocked = false
        this.updateDoorTile()
    }
}
class EnemySpawner
{
    /**
     * 
     */
    spawnLocations: number[][]
    spawnedEnemies: Sprite[] = []
    img: Image
    maxHP: number
    startingHP: number
    spawningEnabled: boolean
    spawnDelay: number
    lastSpawnTime: number = 0
    destroyOnCollision: boolean
    maxEnemies: number
    speeds: number[]

    constructor(img: Image, maxHP: number, startingHP: number, spawnDelay: number, locations: number[][], destroyOnCollision: boolean, max: number, speeds: number[])
    {
        this.img = img
        this.maxHP = maxHP
        this.startingHP = startingHP
        this.spawnDelay = spawnDelay
        this.spawnLocations = locations
        this.destroyOnCollision = destroyOnCollision
        this.maxEnemies = max
        this.speeds = speeds
    }
    startSpawning()
    {
        this.enableSpawning()
        this.trySpawn(true)
        this.loopSpawn()
    }
    enableSpawning()
    {
        this.spawningEnabled = true
    }
    /**
     * External call for spawning
     */
    callSpawn()
    {
        this.trySpawn(false)
    }
    loopSpawn()
    {
        game.onUpdateInterval(this.spawnDelay, function () {
            if(this.spawningEnabled)
                this.callSpawn()
                this.handleAI()
        })
    }
    trySpawn(firstSpawn: boolean)
    {
        if(this.spawningEnabled)
        {
            if (firstSpawn || this.lastSpawnTime + this.spawnDelay <= game.runtime())
            {
                if(this.spawnedEnemies.length < this.maxEnemies)
                {
                    let newEnemy = sprites.create(this.img, SpriteKind.Enemy)
                    //new Enemy(this.img, this.maxHP, this.startingHP, this.destroyOnCollision, 5.0)
                    this.applyAI(newEnemy)
                    let location = this.spawnLocations[Math.floor(Math.random() * this.spawnLocations.length)]
                    newEnemy.setPosition(location[0], location[1])
                    newEnemy.setStayInScreen(false)
                    this.spawnedEnemies.push(newEnemy)
                }  
            }
        }
    }
    stopSpawning()
    {
        this.spawningEnabled = false
    }
    clear()
    {
        sprites.destroyAllSpritesOfKind(SpriteKind.Enemy)
    }
    applyAI(enemy: Sprite)
    {

    }

    handleAI()
    {
        // ABSTRACT: Implemented in subclasses
    }
    notifyCollide(e1: Sprite, e2: Sprite): boolean
    {
        // ABSTRACT
        return false
    }
    destroyEnemy(enemy: Sprite)
    {
        console.log('Destroying!')
        enemy.destroy()
        this.spawnedEnemies.removeAt(this.spawnedEnemies.indexOf(enemy))
    }
}
class FollowerSpawner extends EnemySpawner
{
    constructor(locations: number[][], speeds: number[])
    {
        super(assets.image`skellyFront`, 1, 1, 1000, locations, true, 15, speeds)
    }
    applyAI(enemy: Sprite)
    {
        enemy.follow(player.sprite, this.speeds[Math.floor(Math.random() * this.speeds.length)], 300)
    }
    handleAI()
    {

    }
    trySpawn(firstSpawn: boolean) {
        if (this.spawningEnabled) {
            if (firstSpawn || this.lastSpawnTime + this.spawnDelay <= game.runtime()) {
                if (this.spawnedEnemies.length <= this.maxEnemies) {
                    let newEnemy = sprites.create(this.img, SpriteKind.Enemy)
                    this.applyAI(newEnemy)
                    let location = this.spawnLocations[Math.floor(Math.random() * this.spawnLocations.length)]
                    newEnemy.setPosition(location[0], location[1])
                    newEnemy.setStayInScreen(false)
                    
                }
            }
        }
    }
    notifyCollide(e1: Sprite, e2: Sprite): boolean
    {
        if (this.destroyOnCollision) {
            if(e1 != null)
                this.destroyEnemy(e1)
            if(e2 != null)
                this.destroyEnemy(e2)
            return true
        }
        return false
    }
}
class PatrolSpawner extends EnemySpawner{
    constructor(locations: number[][], speeds: number[]) {
        super(assets.image`skellyFront`, 1, 1, 1000, locations, true, 2, speeds)
    }
    applyAI(enemy: Sprite) {
        enemy.follow(player.sprite, this.speeds[Math.floor(Math.random() * this.speeds.length)], 300)
    }
    handleAI() {
        let allEnemies = sprites.allOfKind(SpriteKind.Enemy)
        for(let i = 0; i < allEnemies.length; i++)
        {
            let currentEnemy = allEnemies[i]
            let dir = sprites.readDataBoolean(currentEnemy, 'toDest')
            if (dir)
            {
                console.log('dir')
                let xDest = sprites.readDataNumber(currentEnemy, 'xDest')
                let yDest = sprites.readDataNumber(currentEnemy, 'yDest')
                if (approxEqual(xDest, currentEnemy.x, 1) && approxEqual(yDest, currentEnemy.y, 1)) {
                    sprites.setDataBoolean(currentEnemy, 'toDest', false)
                }
                else{
                    let speed = this.speeds[Math.floor(Math.random() * this.speeds.length)]
                    currentEnemy.setVelocity(Math.sign(xDest - currentEnemy.x) * speed, Math.sign(yDest - currentEnemy.y) * speed)
                }
            }
            else
            {
                let xDest = sprites.readDataNumber(currentEnemy, 'xSpawn')
                let yDest = sprites.readDataNumber(currentEnemy, 'ySpawn')
                if (approxEqual(xDest, currentEnemy.x, PATROL_DISTANCE_TOLERANCE) && approxEqual(yDest, currentEnemy.y, PATROL_DISTANCE_TOLERANCE)) {
                    sprites.setDataBoolean(currentEnemy, 'toDest', true)
                }
                else {
                    let speed = this.speeds[Math.floor(Math.random() * this.speeds.length)]
                    currentEnemy.setVelocity(Math.sign(xDest - currentEnemy.x) * speed, Math.sign(yDest - currentEnemy.y) * speed)
                    console.log('')
                }
            } 
        }
    }
    trySpawn(firstSpawn: boolean) {
        if (this.spawningEnabled) {
            if (firstSpawn || this.lastSpawnTime + this.spawnDelay <= game.runtime()) {
                if (this.spawnedEnemies.length <= this.maxEnemies) {
                    let newEnemy = sprites.create(this.img, SpriteKind.Enemy)
                    let location = this.spawnLocations[Math.floor(Math.random() * this.spawnLocations.length)]
                    sprites.setDataNumber(newEnemy, 'xDest', location[0])
                    sprites.setDataNumber(newEnemy, 'yDest', location[1])
                    tiles.placeOnRandomTile(newEnemy, assets.tile`floorLight2`)
                    sprites.setDataNumber(newEnemy, 'xSpawn', newEnemy.x)
                    sprites.setDataNumber(newEnemy, 'ySpawn', newEnemy.y)
                    sprites.setDataBoolean(newEnemy, 'toDest', false)
                    newEnemy.setStayInScreen(false)
                }
            }
        }
    }
    notifyCollide(e1: Sprite, e2: Sprite): boolean {
        if (this.destroyOnCollision) {
            if (e1 != null)
                this.destroyEnemy(e1)
            if (e2 != null)
                this.destroyEnemy(e2)
            return true
        }
        return false
    }
}
class MapData
{
    /**
     * Map Sprite Control
     */
    spawner: EnemySpawner
    powerUps: SpawnableObject[] = []
    shadow: Sprite
    keys: SpawnableObject[] = []

    /**
     * Map Data Values
     */
    spawnX: number
    spawnY: number
    doors: DoorData[]
    shadowScale: number
    tilemap: tiles.TileMapData
    keyLocations: Key[]

    /**
     * Runtime Values
     */
    usedObjects: SpawnableObject[] = []
    openDoors: number[] = []
    numConsumedPowerUps: number[]

    /** 
     * Setup
     */
    setup: boolean
    numPowerUps: number[]
    
    constructor(spawnX: number, spawnY: number, tilemap: tiles.TileMapData, doors: DoorData[], usesShadow: number, keys: Key[], spawner: EnemySpawner, numPowerUps: number[])
    {
        this.spawnX = spawnX
        this.spawnY = spawnY
        this.tilemap = tilemap
        this.doors = doors
        this.shadowScale = usesShadow
        this.keys = keys
        this.mapChanged()
        this.numPowerUps = numPowerUps
        if(spawner != null)
            this.spawner = spawner
        else
            this.spawner = new EnemySpawner(assets.image``,0,0,0,[[]],false,0, [])
    }
    draw()
    {
        
    }
    setupShadow()
    {
        if (this.shadowScale > 0) {
            if (this.shadow != null)
                this.shadow.destroy()
            this.shadow = sprites.create(assets.image`shadow`, SpriteKind.Map)
            this.shadow.z = 1
            this.shadow.setScale(this.shadowScale)
            this.shadow.setPosition(player.sprite.x, player.sprite.y)
            this.shadow.follow(player.sprite, 100)
            this.shadow.setStayInScreen(false)
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
        if(this.spawner != null)
        {
            this.spawner.stopSpawning()
            this.spawner.clear()
        }
        this.powerUps.forEach(function(pUp: PowerUp) {
            pUp.destroySprite()
        })
    }
    setActiveMap()
    {
        this.setupShadow()
        scene.setTileMapLevel(this.tilemap)
        this.doors.forEach(function (door: DoorData, index: number) {
            door.findDoorDirection()
        })
        if(!this.setup)
        {
            this.spawner.startSpawning()
            this.setup = true
            
            for(let i = 0; i < this.numPowerUps.length; i++)
            {
                console.log('Creating Power Ups!')
                for(let _ = 0; _ < this.numPowerUps[i]; _++)
                {
                    console.log('   New Powerup Created!')
                    let pUp = new PowerUp(i, POWER_UP_SCORES[i])
                    pUp.spawn()
                    this.powerUps.push(pUp)
                }
                    
            }
        }
        else // Returning to board
        {
            // Regenerate PowerUps
            for (let i = 0; i < this.powerUps.length; i++) {
                if (this.usedObjects.indexOf(this.powerUps[i]) == -1) // Prevent key from regenerating if it's been claimed already
                    this.powerUps[i].createSprite()
            }
            // Restart Spawners
            this.spawner.enableSpawning()
        }
        
        // Regenerate keys
        for (let i = 0; i < this.keys.length; i++) {
            if (this.usedObjects.indexOf(this.keys[i]) == -1) // Prevent key from regenerating if it's been claimed already
                this.keys[i].createSprite()
        }
    }
    findSpawnableFromSprite(sprite: Sprite): SpawnableObject
    {
        // Search Keys
        for(let i = 0; i < this.keys.length; i++)
        {
            let key = this.keys[i]
            if (key.sprite == sprite)
                return key
        }
        // TODO: Search powerups
        for(let i = 0; i < this.powerUps.length; i++)
        {
            let pUp = this.powerUps[i]
            if(pUp.sprite == sprite)
                return pUp
        }

        // Return null if it doesn't match anything
        return null
    }

    handleItemCollision(item: Sprite, player: PlayerSprite)
    {
        let spawnable: SpawnableObject = this.findSpawnableFromSprite(item)
        if (spawnable != null)
        {
            console.log(spawnable.myType)
            if(spawnable.myType.toUpperCase() == "KEY")
            {
                console.log("KEY HIT")
                let keyData = spawnable.handleCollision(player)
                MAP_DATAS[keyData[1]].unlockDoor(keyData[0])
            }
            else if(spawnable.myType.toUpperCase() == 'PUP')
            {
                console.log("POWER UP")
                spawnable.handleCollision(player)
            }

            this.usedObjects.push(spawnable)
        }
        else
            console.log("Unable to find SpawnableObject from handleItemCollision")
    }
    handleEnemyCollision(enemy1: Sprite, enemy2: Sprite)
    {
        console.log('Notifying collision..')
        this.spawner.notifyCollide(enemy1, enemy2)
    }
    handlePlrEnemyCollision(enemy: Sprite) {
        if (enemy != null)
        {
            player.dealDamage(5)
            this.spawner.destroyEnemy(enemy)
        }
    }
    tryUseDoor(door: number[])
    {
        this.doors.forEach(function (data: DoorData, index: number)
        {
            if(data.x == door[0] && data.y == door[1])
            {
                data.useDoor()
            }
        })
        //changeMap(MAP_DATAS[currentMap].doors[door])
    }
    unlockDoor(doorID: number)
    {
        console.log("Opening doorID " + doorID + " (" + this.tilemap + ")")
        this.openDoors.push(doorID)
        this.doors.forEach(function (door: DoorData, index: number) {
            if (door.id == doorID)
            {
                door.unlockDoor()
            }
        })
    }
}
class Backup{
    mapDatas: MapData[]
    currentMap: number
    lives: number
    score: number

    constructor()
    {
        this.mapDatas = MAP_DATAS
        this.currentMap = currentMap
        this.lives = info.life()
        this.score = info.score()
    }
    recover()
    {
        MAP_DATAS = this.mapDatas
        currentMap = this.currentMap
        info.setLife(this.lives)
        info.setScore(this.score)
    }
}
/**
 * Constants
 */
let MAP_DATAS = [new MapData(250, 190, assets.tilemap`CrossRoadsLarge`, [/** (North) */ new DoorData(16.5, 0.5, [4, 257, 486], true, 0), new DoorData(15.5, 0.5, [4, 257, 486], true, 0), /** (East) to MazeR */ new DoorData(31.5, 15.5, [2, 39, 119], false, 1), new DoorData(31.5, 16.5, [2, 39, 119], false, 1), /** (South) */new DoorData(16.5, 31.5, [], true, 2), new DoorData(15.5, 31.5, [], true, 2),/** (West) */new DoorData(0.5, 16.5, [], true, 3), new DoorData(0.5, 15.5, [], true, 3)], 0, [], new FollowerSpawner([[484, 27], [50, 50], [477, 390], [53, 403], [109, 23]], [50, 60]),[3]),
    new MapData(129.5, 123.5, assets.tilemap`intersection`, [], 0, [], null,[4]),
    new MapData(39, 119, assets.tilemap`mazeR`, [new DoorData(0.5, 7.5, [0, 490, 248], false, 4), new DoorData(7.5, 0.5, [3, 41,224], false, 6)], 8.75, [new Key(230, 24, [0, 0])], null,[1,3,1]),
    new MapData(0, 0, assets.tilemap`top_r`, [new DoorData(2.5, 15.5, [2, 119, 30], false, 5), new DoorData(0.5, 0.5, [4, 496, 136], false, 1)], 0, [new Key(128.5, 47, [2,0])], null, [1, 2, 3]),
    new MapData(0, 0, assets.tilemap`top_u`, [new DoorData(15.5, 31.5, [0, 257, 26], false, 0), new DoorData(16.5, 31.5, [0, 257, 26], false, 0), new DoorData(31.5, 9.5, [3, 18, 8], true, 1), new DoorData(31.5, 8.5, [3, 18, 8], true, 1)], 0, [new Key(17,333, [1, 4])] , new PatrolSpawner([[50,61],[385,141],[142, 250],[333,413]],[25,30,35]), [2, 10, 6])

]
let POWER_UP_KINDS = [assets.image`heartPowerUp`, assets.image`coin3`, assets.image`coin0`]
let POWER_UP_SCORES = [0, 1, 3]
let LAVA_DAMAGE = 4 // Amount of damage lava does per-tick
let HEART_AMOUNT = 20
let PATROL_DISTANCE_TOLERANCE = 1


let backup: Backup
let currentMap = 0
scene.setTileMapLevel(assets.tilemap`CrossRoadsLarge`)
scene.setBackgroundColor(0)
let player = new PlayerSprite(assets.image`heroWalkFront1`, 100, 100)
player.sprite.setPosition(129.5,123.5)
tiles.setTileAt(tiles.getTileLocation(0, 16), assets.tile`doorOpenWest`)
changeMap(0)
controller.player1.onButtonEvent(ControllerButton.A, ControllerButtonEvent.Pressed, function() {
})
info.setScore(0)
info.setLife(3)


function changeMap(toMap: number)
{
    MAP_DATAS[currentMap].mapChanged()
    currentMap = toMap
    player.sprite.setPosition(MAP_DATAS[currentMap].spawnX, MAP_DATAS[currentMap].spawnY)
    MAP_DATAS[currentMap].setActiveMap()
    scene.setTileMapLevel(MAP_DATAS[currentMap].tilemap)
    backup = new Backup()
}

function touchingTileOfTypes(sprite: Sprite, types: Image[]) {
    for (let i = 0; i < types.length; i++) {
        if (sprite.tileKindAt(TileDirection.Center, types[i])) {
            return i
        }
    }
    return -1
}

function playerDied()
{
    if(info.life() >= 0)
    {
        game.splash("You Died!", "Press A to respawn!")
        changeMap(0)
        player.resetHealth()
        info.changeLifeBy(-1)
    }
    else{
        game.gameOver(false)
    }
}

// Game loop. Needed to draw health bars
game.onUpdate(function () {
    MAP_DATAS[currentMap].draw()
    if(player != null)
        player.drawHealthBar()
        player.checkCollisions()    
    console.log(player.sprite.x + " " + player.sprite.y)
})

info.onLifeZero(function(){
    game.splash("You ran out of lives!","Press A to recover a backup!")
    if(backup != null && backup != undefined)
        backup.recover()
    else
        game.gameOver(false)
})

sprites.onOverlap(SpriteKind.Spawnable, SpriteKind.Player, function(spawnable: Sprite, plr: Sprite) {
    MAP_DATAS[currentMap].handleItemCollision(spawnable, player)
})
sprites.onOverlap(SpriteKind.Enemy, SpriteKind.Enemy, function (enemy1: Sprite, enemy2: Sprite) {
    MAP_DATAS[currentMap].handleEnemyCollision(enemy1, enemy2)
})
sprites.onOverlap(SpriteKind.Player, SpriteKind.Enemy, function (player: Sprite, enemy: Sprite) {
    MAP_DATAS[currentMap].handlePlrEnemyCollision(enemy)
})

function approxEqual(desired: number, actual: number, tolerance: number)
{
    return Math.abs(desired - actual) < tolerance
}