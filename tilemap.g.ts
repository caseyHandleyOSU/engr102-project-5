// Auto-generated code. Do not edit.
namespace myTiles {
    //% fixedInstance jres blockIdentity=images._tile
    export const transparency16 = image.ofBuffer(hex``);

    helpers._registerFactory("tilemap", function(name: string) {
        switch(helpers.stringTrim(name)) {
            case "forestLevel":
            case "level1":return tiles.createTilemap(hex`1000100003010304030303010303030403030303030404030404030303030304010303030303020b0b0b0b0b0b0b050e0d0d03010401090c0c0c100c0c0c100d0d0d03030303090c0c0c0c0c0c0c0a0d0e0f03040303090c0c0c0c0c0c0c0a0d0f0e03010103090c100c0c0c0c0c0a0d0e0d04030304090c0c0c0c0c0c0c0a0e0e0d03030303090c0c0c0c0c0c0c0a0f0d0d01040403090c0c0c0c0c0c0c0a0e0d0d03030303090c0c0c0c0c0c100a0d0e0d04030304100c0c0c0c0c0c0c0a0d0e0d030104030608080808080808070d0e0f030301030d0e0e0d0d0d0f0d0d0d0d0d03010303030304030103030303030303040301010303040303030303030301030303`, img`
. . . . . . . . . . . . . . . . 
. . . . . . . . . . . . . . . . 
. . . . . . . . . . . . . . . . 
. . . . . . 2 . . . 2 . . . . . 
. . . . . . . . . . . . . . . . 
. . . . . . . . . . . . . . . . 
. . . . 2 . . . . . . . . . . . 
. . . . . . . . . . . . . . . . 
. . . . . . . . . . . . . . . . 
. . . . . . . . . . . . . . . . 
. . . . . . . . . 2 . . . . . . 
. . 2 . . . . . . . . . . . . . 
. . . . . . . . . . . . . . . . 
. . . . . . . . . . . . . . . . 
. . . . . . . . . . . . . . . . 
. . . . . . . . . . . . . . . . 
`, [myTiles.transparency16,sprites.castle.tileGrass2,sprites.castle.tilePath1,sprites.castle.tileGrass1,sprites.castle.tileGrass3,sprites.castle.tilePath3,sprites.castle.tilePath7,sprites.castle.tilePath9,sprites.castle.tilePath8,sprites.castle.tilePath4,sprites.castle.tilePath6,sprites.castle.tilePath2,sprites.castle.tilePath5,sprites.castle.tileDarkGrass1,sprites.castle.tileDarkGrass3,sprites.castle.tileDarkGrass2,sprites.builtin.forestTiles0], TileScale.Sixteen);
        }
        return null;
    })

    helpers._registerFactory("tile", function(name: string) {
        switch(helpers.stringTrim(name)) {
            case "transparency16":return transparency16;
        }
        return null;
    })

}
// Auto-generated code. Do not edit.
