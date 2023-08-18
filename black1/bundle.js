(function () {
'use strict';

let map1 = [1,1,1,0,1,1,1,1,1,1,
            1,2,1,0,1,2,1,2,2,1,
            1,2,1,0,1,2,1,2,2,1,
            1,2,1,1,1,2,1,2,2,1,
            1,2,2,2,2,2,2,2,2,1,
            1,2,2,2,1,1,1,2,2,1,
            1,2,2,2,1,0,1,2,2,1,
            1,2,2,1,1,0,1,1,2,1,
            1,2,2,1,0,0,0,1,1,1,
            1,1,1,1,0,0,0,0,1,1
          ];

let map2 = [1,1,1,1,0,0,1,1,1,1,
            1,2,2,1,0,0,1,2,2,1,
            1,2,2,1,0,0,1,2,2,1,
            1,2,2,1,0,0,1,2,2,1,
            1,2,2,1,1,1,1,2,2,1,
            1,1,2,2,2,2,2,2,2,1,
            1,1,1,2,2,1,1,1,1,1,
            0,0,1,2,2,1,1,1,1,1,
            0,0,1,2,2,2,2,2,2,1,
            0,0,1,1,1,1,1,1,1,1
          ];
let map3 = [1,1,1,1,1,1,1,1,1,1,
                  1,2,1,2,2,2,2,2,2,1,
                  1,2,1,1,2,1,1,2,2,1,
                  1,2,2,1,2,1,2,2,2,1,
                  1,1,2,1,1,1,2,2,2,1,
                  0,1,2,2,2,2,2,1,2,1,
                  1,1,1,1,2,2,1,1,1,1,
                  1,2,2,2,2,2,1,0,0,0,
                  1,1,1,2,2,2,1,0,0,0,
                  0,0,1,1,1,1,1,0,0,0
                ];

let map4 =  [1,1,1,1,0,1,1,1,1,1,
                    1,2,2,1,0,1,2,2,2,1,
                    1,2,2,1,1,1,2,2,2,1,
                    1,2,2,2,2,2,2,2,2,1,
                    1,1,1,1,1,1,1,2,1,1,
                    1,2,2,1,0,0,1,2,1,0,
                    1,2,2,1,1,1,1,2,1,0,
                    1,2,2,2,2,2,2,2,1,0,
                    1,2,2,2,1,1,1,1,1,0,
                    1,1,1,1,1,0,0,0,0,0
                  ];
let map5 =  [1,1,1,1,1,1,1,1,1,1,
                    1,2,2,2,1,2,2,2,2,1,
                    1,2,2,2,1,2,1,2,2,1,
                    1,1,1,2,1,2,1,2,2,1,
                    1,2,2,2,1,2,1,2,2,1,
                    1,2,1,1,1,2,1,1,2,1,
                    1,2,1,2,2,2,2,1,2,1,
                    1,2,1,1,1,1,2,1,1,1,
                    1,2,2,2,2,2,2,2,2,1,
                    1,1,1,1,1,1,1,1,1,1
                  ];

const tileDictionary = {
  0: {passible: true, type: "nothing"},
  1: {passible: false, type: "wall"},
  2: {passible: true, type: "floor"},
  3: {passible: true, type: "stairsUp", subtype: null},
  4: {passible: true, type: "stairsDown", subtype: null},
  5: {passible: false, type: "player", subtype: null},
  6: {passible: false, type: "monster", subtype: "giant rat"},
  7: {passible: false, type: "monster", subtype: "orc"},
  8: {passible: false, type: "monster", subtype: "goblin"},
  9: {passible: false, type: "monster", subtype: "skeleton"},
  10: {passible: false, type: "monster", subtype: "black dragon"},
  11: {passible: true, type: "item", subtype: "dagger"},
  12: {passible: true, type: "item", subtype: "sword"},
  13: {passible: true, type: "item", subtype: "leather armor"},
  14: {passible: true, type: "item", subtype: "chain armor"},
  15: {passible: true, type: "item", subtype: "health potion"},
};

// subtype should be moved to here and the dictionary should just work of the key
// subtype can be used for "slaying" weapons that would target whole groups of monsters (orcs, dragons, undead etc.)
const monsterDictionary = {
  6: {name:"giant rat", hp: [1,6], weapon: {damage: [1,4], verb: "bites"}, xpVal: 50, damageModifier: 0, armor: {protection: 0} },
  7: {name:"orc", hp: [1,10],weapon: { damage: [1,6], verb: "smacks"}, xpVal: 150, damageModifier: 1, armor: {protection: 0}},
  8: {name:"goblin", hp: [1,6], weapon: {damage: [1,6], verb: "shanks"}, xpVal: 100, damageModifier: 0, armor: {protection: 0}},
  9: {name:"skeleton", hp: [1,8], weapon: {damage: [1,6], verb: "slashes"}, xpVal: 150, damageModifier: 1, armor: {protection: 1}},
  10: {name:"black dragon", hp: [3,6], weapon: {damage: [1,10], verb: "bashes"}, xpVal: 450, damageModifier: 2, armor: {protection: 2}}
};

const itemDictionary = {
  11: {name: "dagger", type:"weapon", subtype: "weapon", damage: [1,6], verb: "stab"},
  12: {name: "sword", type:"weapon", subtype: "weapon", damage: [1,8], verb: "slash"},
  13: {name: "leather armor", subtype: "armor", protection: 1},
  14: {name: "chain armor", subtype: "armor", protection: 2},
  15: {name: "health potion", subtype: "health", heals: 10}
};

//consider grouping some of these together in objects so importing will be less verbose
const tileSize = 64;
const sheetSize = 64;
const sheetCols = 5;
const mapCols = 10;
const mapRows = 10;
const CANVAS_HEIGHT = 700;
const CANVAS_WIDTH = 640;

// not comfortable doing DOM manipulation here so exporting the canvas and do it from main file

const canvas = document.createElement('canvas');
canvas.height = CANVAS_HEIGHT;
canvas.width = CANVAS_WIDTH;
canvas.style = "border: 1px solid black";


const ctx = canvas.getContext('2d');

let spritesheet = new Image();


//takes a call back so run can be excuted from main
const loadSpritesheet = (source, callback) => {
  spritesheet.src = source;
  spritesheet.onload = () => {
    //run();
    callback();
  };
};

// due to build error "Error: Illegal reassignment to import"
// I had to moved the messages array to be inside an object
let messageLog = {
  messages: ["The evil Black Dragon killed your family, now it's time for revenge.",
                    "Go through the dungeon and destroy the Black Dragon and all it's minions!"]
};

const draw = (state) => {
  ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
  drawScene(state.currentScene);
};

const drawScene = (scene) => {
  // draw non-map entities
  for(let i = 0, len = scene.entities.length; i < len; i++ ){
    let entity = scene.entities[i];
    if(entity.type === "text"){
      ctx.fillStyle = entity.color;
      ctx.font = entity.font;
      ctx.fillText(entity.text, entity.x, entity.y);
    }
  }
  // draw map
  if(scene.level){
    drawMap(scene.level.backgroundMap, true);
    drawMap(scene.level.entitiesMap);
    drawMessages();
  }
};

const drawMap = (map, isBG) => {
  for(let i = 0, len = map.length;  i < len; i++){
    let tile = map[i];
    if(tile !== 0 || isBG){
      let x = (i % mapCols) * tileSize; // index / width of drawing area in tiles * tile size
      let y = Math.floor(i / mapCols) * tileSize;
      let sx = (tile % sheetCols) * sheetSize; // tile value against width of tilesheet in tiles * tile size on sheet
      let sy = Math.floor(tile / sheetCols) * sheetSize;
      ctx.drawImage(spritesheet, sx, sy, sheetSize, sheetSize, x, y, tileSize, tileSize);
    }
  }
};

const drawMessages = () => {
  let messages = messageLog.messages.slice(-2);
  for(let i = 0; i < messages.length; i++){
    ctx.fillStyle = "#000";
    ctx.font = "15px Arial";
    ctx.fillText(messages[i], 20, 660 + (i * 20));
  }
};

const rollDice = (diceToRoll, numOfSides) => {
  let total = 0;
  for(let i = 0; i<diceToRoll; i++){
    total += Math.ceil(Math.random()*numOfSides);
  }
  return total;
};

const fullDice = (diceToRoll, numOfSides) => {
  return diceToRoll * numOfSides;
};

const Entity = {
  x: 0,
  y: 0,
  type: null
};

let idCounter = 1;

const buildEntity = (level, key, index) => {
  let backgroundVal = level.backgroundMap[index];
  let entityVal = level.entitiesMap[index];
  if(tileDictionary[backgroundVal].passible &&
  tileDictionary[entityVal].passible) { //consider handling this by checking for used indecies rather that looking at the map
    let entity = Object.assign({}, Entity, {key, index});
    entity.id = idCounter;
    entity.type = tileDictionary[entity.key].type;
    //entity.subtype = tileDictionary[entity.key].subtype;

    idCounter++;
    level.entitiesMap[index] = entity.key;
    level.entities.push(entity);
    // if(tileDictionary[entity.key].type === "player") {
    //   model.state.player = entity;
    // }

    return entity;
  }else{
    console.log(`index ${index} on ${level.name} is not valid`);
    return false;
  }

};

const createTextEntity = (text, font, color, x, y) => {
  let entity = Object.assign({}, Entity, {text, font, color, x, y});
  entity.type = "text";

  return entity;
};

const buildStairs = (level, key, index, targetLevel, targetIndex) => {
  let stairs = buildEntity(level, key, index);
  stairs.target = targetLevel; // not a great name
  stairs.targetIndex = targetIndex;
  return stairs;
};

const buildMonster = (level, key, index) => {
  let entity = buildEntity(level, key, index);
  let monsterRef = monsterDictionary[entity.key];
  let monster = Object.assign(entity, monsterRef); //cannot reassign to new object because of linking, maybe should do linking here or with another function
  monster.hp = fullDice(...monsterRef.hp);
  monster.maxHp = monster.hp;
  //monster.damageModifier = 0; //this should come from monster table;
  //monster.xpVal = monsterRef.xpVal;
  //monster.damage = monsterRef.damage;

  //add damageModifier to monster table
  return monster;
};

const buildPlayer = (level, key, index) => {
  let player = buildEntity(level, key, index);
  player.hp = 10;
  player.maxHp = 10;
  player.xp = 0;
  player.level = 1;
  player.damageModifier = 1;
  player.weapon = {name: "hand", damage: [1,4], verb: "punch", subtype: "weapon"};
  player.armor = {name: "cloth", protection: 0};
  return player;
};

const buildItem = (level, key, index) => {
  let item = buildEntity(level, key, index);
  item.itemProps = itemDictionary[item.key];
  //add damageModifier to monster table
  return item;
};

const removeEntityFromLevel = (level, entity) => {
  level.entitiesMap[entity.index] = 0;
  let index;
  for(let i = 0; i < level.entities.length; i++){
    let e = level.entities[i];
    if(e.id === entity.id){
      index = i;
      break;
    }
  }
  level.entities.splice(index,1);
};

const getEntityAtIndex = (level, index) => {
  for(let i = 0; i < level.entities.length; i++){
    let entity = level.entities[i];
    if(entity.index === index){
      return entity;
    }
  }
};

const buildEntityMap = (level) => {
  level.entitiesMap = Array(mapCols * mapRows).fill(0);
  for(let i = 0; i < level.entities.length; i++) {
    let entity = level.entities[i];
    level.entitiesMap[entity.index] = entity.key;
  }
};

document.body.appendChild(canvas);

// create generic sprite loader
loadSpritesheet("blackdragon-sprites-00.png", ()=>{
  run();
});

const run = () => {
  draw(model.state);
  requestAnimationFrame(run);
};

const playerXpTable = {
  1: 200,
  2: 400,
  3: 800,
  4: 1600,
  5: 3200
};

const checkPlayerLevel = (player) => { //in a more robust version monsters could also level but I'll keep this simple
    if(player.xp >= playerXpTable[player.level]){
      player.level++;
      player.maxHp += 10;
      player.hp += 10; //we'll assume the player got a full roll, if too hard player.hp = player.maxHp
      player.xp = 0;
      player.damageModifier++;
      messageLog.messages.push(`Nice work! You leveled up! You are level ${player.level}`);
      messageLog.messages.push("You gained 10 hit points and 1 point of damage!");
    }
};

//// functions that know about the model
//// and need to be refactored before the can be modularized

//this could support certain monsters being able to go up the stairs
//but it's probably a bad idea

/*****///remove references to model
const useStairs = (entity, stairs, targetIndex) => {
 let currentLevel = model.state.currentScene.level;
 let nextLevel = model.levels[stairs.target];
 entity.index = targetIndex;
 nextLevel.entities.push(entity);

 let message = "You go ";
 if(stairs.type === "stairsUp"){ //there are only two types of stairs
   message += "up the stairs"; //to level?
 } else {
   message += "down the stairs";
 }
 messageLog.messages.push(message);
 goToLevel(stairs.target);
 removeEntityFromLevel(currentLevel, entity);
};

/*****///remove references to model
const attackEntity = (attacker, defender, level) => {
  let damage, verb, aIdentity, dIdentiy, posAdj; //maybe simplify this by giving all monsters a weapon?

  //if(attacker.weapon){
  damage = rollDice(...attacker.weapon.damage);
  damage += attacker.damageModifier;
  verb = attacker.weapon.verb;
  // } else {
  //   damage = rollDice(...attacker.damage);
  //   damage += attacker.damageModifier;
  //   verb = "hits";
  // }
  if(damage > defender.armor.protection){
    defender.hp -= damage - defender.armor.protection;
  } else {
    damage = 0;
  }


  if(attacker.type === "player"){
    aIdentity = "You";
    dIdentiy = "the " + defender.name;
    posAdj = "their";
  }else{
    aIdentity = "The " + attacker.name;
    dIdentiy = "you";
    posAdj = "your";
  }

  let message = `${aIdentity} ${verb} ${dIdentiy} for ${damage} bringing ${posAdj} hp to ${defender.hp}`;
  messageLog.messages.push(message);
  if(defender.hp <= 0){
    if(defender.type === "player" || defender.name === "black dragon") {
      // end the game
      changeScene(model.scenes.gameOver);
    }else {
      removeEntityFromLevel(level, defender);
      if(attacker.type === "player"){
        attacker.xp += defender.xpVal;
        //check if player leveled
        checkPlayerLevel(attacker);
      }
    }
  }
};

const getItem = (entity, item, level) => {
  let message;
  let itemProps = item.itemProps;
  if(itemProps.subtype === "weapon"){
    entity.weapon = itemProps;
    message = `You found a ${itemProps.name}!`;
  }
  if(itemProps.subtype === "armor"){
    entity.armor = itemProps;
    message = `You found ${itemProps.name}!`;
  }
  if(itemProps.subtype === "health"){
    entity.hp += itemProps.heals;
    message = `You drink a ${itemProps.name}, you heal ${itemProps.heals} points!`; //should probably have a verb too
  }
  messageLog.messages.push(message);
  removeEntityFromLevel(level, item);
};

// there will be a problem movable actors overwriting the stairs so the
// entitiesMap array needs to be rebuild every turn and possbily stairs need to be
// drawn first so they wont be obscured by enemies
/*****///remove references to model
//split this into multiple functions
const checkIndex = (level, entity, newIndex) => {
  let newTarget = tileDictionary[level.entitiesMap[newIndex]]; //if entities have passible tthis can be simplified
  if(tileDictionary[level.backgroundMap[newIndex]].passible){
    if(newTarget.passible){
      if((newTarget.type === "stairsDown" || newTarget.type === "stairsUp") && entity.type === "player"){
        //get the level
        let stairs = getEntityAtIndex(level, newIndex);
        console.log(newTarget, stairs);
        useStairs(entity, stairs, stairs.targetIndex); //if passing stairs alreay don't need to pass target
        //goToLevel(stairs.target);
        //put player on stairsup, assume for now there is always only one stairsUp
        //to create more would require building the stairs like other entities
      }else if(newTarget.type === "item" && entity.type === "player"){
        let item = getEntityAtIndex(level, newIndex);
        getItem(entity, item, level);
        //DRY this up
        level.entitiesMap[entity.index] = 0;
        entity.index = newIndex;
        level.entitiesMap[newIndex] = entity.key;
      }else{
        level.entitiesMap[entity.index] = 0;
        entity.index = newIndex;
        level.entitiesMap[newIndex] = entity.key;
        //while static monsters will hit back, once monsters are moving they will hit the
        // player by attempting to him into the players position
      }

      // handle stairs
    }else{
      // it's a monster, fight!
      // need to put logic in here so monsters wont fight each other

      let enemy = getEntityAtIndex(level, newIndex);
      // temp for now just kill on monsters on contact
      attackEntity(entity, enemy, level);
      if(enemy.hp > 0) {
        attackEntity(enemy, entity, level);
      }
      //removeEntityFromLevel(level, enemy);
    }
  }
};

const changeScene = (scene) => { //
  model.state.currentScene = scene;
  scene.onEnter();
};

addEventListener("keydown", (event) => {
    // console.log(event.key);
    let request;
    if(typeof model.state.currentScene.controlMap[event.key] === "function"){
      request = model.state.currentScene.controlMap[event.key]();
    // console.log(request, request.args);
    }
    if(request){
        request.action(...request.args);
    }
});
//this can take model as para
const moveEntity = (direction, entity) => { //make generic for all movers
  //entity.index;
  //console.log(direction);
  let level = model.state.currentScene.level;
  if(direction === "up"){
    let newIndex = entity.index - 10;
    checkIndex(level, entity, newIndex);
  } else if(direction === "down"){
    let newIndex = entity.index + 10;
    checkIndex(level, entity, newIndex);
  } else if(direction === "left"){
    let newIndex = entity.index - 1;
    checkIndex(level, entity, newIndex);
  } else if(direction === "right"){
    let newIndex = entity.index + 1;
    checkIndex(level, entity, newIndex);
  }

  buildEntityMap(level);
};

const goToLevel = (level) => {
  console.log(level);
  model.scenes.play.level = model.levels[level];
  buildEntityMap(model.scenes.play.level);
  //model.scenes.play.level.entitiesMap = model.entitiesMaps[level];
};

const Level = {
  name: "",
  backgroundMap: null,
  entitiesMap: null,
  entities: null //initializing to an empty array links all maps...
};
const levelMaps = [["level1", map1, [{type: "monster", lookup: 6, mapIndex: 45},
                                    {type: "monster", lookup: 6, mapIndex: 61},
                                    {type: "monster", lookup: 8, mapIndex: 78},
                                    {type: "item", lookup: 11, mapIndex: 15}]],
                   ["level2", map2, [{type: "monster", lookup: 7, mapIndex: 38},
                                    {type: "monster", lookup: 8, mapIndex: 42},
                                    {type: "monster", lookup: 7, mapIndex: 86},
                                    {type: "item", lookup: 15, mapIndex: 22}]],
                   ["level3", map3, [{type: "monster", lookup: 6, mapIndex: 31},
                                    {type: "monster", lookup: 8, mapIndex: 83},
                                    {type: "monster", lookup: 7, mapIndex: 56},
                                    {type: "monster", lookup: 8, mapIndex: 15},
                                    {type: "monster", lookup: 9, mapIndex: 24},
                                    {type: "item", lookup: 13, mapIndex: 11}]],
                   ["level4", map4, [{type: "monster", lookup: 9, mapIndex: 47},
                                    {type: "monster", lookup: 8, mapIndex: 36},
                                    {type: "monster", lookup: 7, mapIndex: 22},
                                    {type: "monster", lookup: 9, mapIndex: 75},
                                    {type: "monster", lookup: 7, mapIndex: 77},
                                    {type: "item", lookup: 12, mapIndex: 38},
                                    {type: "item", lookup: 15, mapIndex: 12}]],
                   ["level5", map5, [{type: "monster", lookup: 7, mapIndex: 23},
                                    {type: "monster", lookup: 9, mapIndex: 43},
                                    {type: "monster", lookup: 9, mapIndex: 71},
                                    {type: "monster", lookup: 8, mapIndex: 76},
                                    {type: "monster", lookup: 9, mapIndex: 45},
                                    {type: "monster", lookup: 7, mapIndex: 18},
                                    {type: "monster", lookup: 10, mapIndex: 68},
                                    {type: "item", lookup: 14, mapIndex: 41}]]
];

const buildLevel = (model, name, map, entities) => {
  let level = Object.assign({}, Level, {name});
  model.levels[name] = level;
  level.backgroundMap = map;
  level.entities = [];
  buildEntityMap(level);
  for(let i = 0; i < entities.length; i++){
    let entity = entities[i];
    if(entity.type === "monster"){
      buildMonster(level, entity.lookup, entity.mapIndex);
    }else if(entity.type === "item"){
      buildItem(level, entity.lookup, entity.mapIndex);
    }else if(entity.type === "stairs"){
    }
  }
  //Entity.buildEntityMap(model.levels[name]);
};

const buildGameWorld = () => {
  model.scenes.start.entities = [];
  model.scenes.play.entities = [];
  model.scenes.gameOver.entities = [];
  for(let i = 0; i < levelMaps.length; i++){
    buildLevel(model, levelMaps[i][0], levelMaps[i][1], levelMaps[i][2]);
  }

  model.scenes.play.level = null;
  messageLog.messages = ["The evil Black Dragon killed your family, now it's time for revenge.",
                      "Go through the dungeon and destroy the Black Dragon and all it's minions!"];

  const titleText = createTextEntity("Black Dragon", "50px Arial", "#000", 170, 100);
  const startText = createTextEntity("Press Enter to start", "30px Arial", "#333", 190, 400);
  model.scenes.start.entities.push(titleText);
  model.scenes.start.entities.push(startText);

  const gameOverText = createTextEntity("Game Over", "50px Arial", "#000", 170, 100);
  model.scenes.gameOver.entities.push(gameOverText);

  model.state.player = buildPlayer(model.levels.level1, 5, 11);
  // Entity.buildMonster(model.levels.level1, 6, 45);
  // Entity.buildMonster(model.levels.level1, 6, 61);
  // Entity.buildMonster(model.levels.level1, 8, 78);
  // Entity.buildItem(model.levels.level1, 11, 15);

  // Entity.buildMonster(model.levels.level2, 7, 38);
  // Entity.buildMonster(model.levels.level2, 8, 42);
  // Entity.buildMonster(model.levels.level2, 7, 86);
  // Entity.buildItem(model.levels.level2, 15, 22);

  // Entity.buildMonster(model.levels.level3, 6, 31);
  // Entity.buildMonster(model.levels.level3, 8, 83);
  // Entity.buildMonster(model.levels.level3, 7, 56);
  // Entity.buildMonster(model.levels.level3, 8, 15);
  // Entity.buildMonster(model.levels.level3, 9, 24);
  // Entity.buildItem(model.levels.level3, 13, 11);

  // Entity.buildMonster(model.levels.level4, 9, 47);
  // Entity.buildMonster(model.levels.level4, 8, 36);
  // Entity.buildMonster(model.levels.level4, 7, 22);
  // Entity.buildMonster(model.levels.level4, 9, 75);
  // Entity.buildMonster(model.levels.level4, 7, 77);
  // Entity.buildItem(model.levels.level4, 12, 38);
  // Entity.buildItem(model.levels.level4, 15, 12);
  //
  // Entity.buildMonster(model.levels.level5, 7, 23);
  // Entity.buildMonster(model.levels.level5, 9, 43);
  // Entity.buildMonster(model.levels.level5, 9, 71);
  // Entity.buildMonster(model.levels.level5, 8, 76);
  // Entity.buildMonster(model.levels.level5, 9, 45);
  // Entity.buildMonster(model.levels.level5, 7, 18);
  // Entity.buildMonster(model.levels.level5, 10, 68);
  // Entity.buildItem(model.levels.level5, 14, 41);
  //stairs are almost always made it pairs so it might make sense to build a pair of stairs in one shot.
  buildStairs(model.levels.level1, 4, 58, "level2", 28);
  buildStairs(model.levels.level2, 3, 28, "level1", 58);
  buildStairs(model.levels.level2, 4, 88, "level3", 74);
  buildStairs(model.levels.level3, 3, 74, "level2", 88);
  buildStairs(model.levels.level3, 4, 13, "level4", 28);
  buildStairs(model.levels.level4, 3, 28, "level3", 13);
  buildStairs(model.levels.level4, 4, 61, "level5", 12);
  buildStairs(model.levels.level5, 3, 12, "level4", 61);

  buildEntityMap(model.levels.level1);
  buildEntityMap(model.levels.level2);
  buildEntityMap(model.levels.level3);
  buildEntityMap(model.levels.level4);
  buildEntityMap(model.levels.level5);
  //since I'm building the maps anyways might be better to only build the level
  //the player is on, I'll do this refactor after implementing items
  //just have to change buildEntity from inserting the entity to the map to only
  //putting the entity in the entities array for the level
};

//create a buildScene function
//clean up self references
const model = {
  state: {
    currentScene: null,
    player: null
  },
  scenes: {
    start: {
      onEnter() {
        //should run setup game
        //clearing the log, destroying all entities, rebuilding maps etc
        buildGameWorld();
      },
      entities: [],
      controlMap: {
        "Enter": () => { return {action: changeScene, args: [model.scenes.play]}; }
      }
    },
    play: {
      onEnter() {
        if(!model.scenes.play.level){
          model.scenes.play.level = model.levels.level1;
          //model.scenes.play.level.entitiesMap = model.entitiesMaps[0];
        }
      },
      entities: [],
      controlMap: {
        "Enter": () => { return {action: goToLevel, args: ["level2"]}; },
        "ArrowUp": () => { return {action: moveEntity, args: ["up", model.state.player]}; },
        "ArrowDown": () => { return {action: moveEntity, args: ["down", model.state.player]}; },
        "ArrowLeft": () => { return {action: moveEntity, args: ["left", model.state.player]}; },
        "ArrowRight": () => { return {action: moveEntity, args: ["right", model.state.player]}; },

      },
      level: null
    },
    gameOver: {
      onEnter() {
        // to handle this simply, just check if the player is dead when we get here
        let message;
        if(model.state.player.hp > 0) {
          message = "You have killed the black dragon the brining peace to the land.";
        } else {
          message = "You have died and brought shame to your ancestors";
        }
        const endMessageText = createTextEntity(message, "20px Arial", "#333", 20, 400);
        const playAgainText = createTextEntity("press enter to try again", "20px Arial", "#333", 20, 440);
        model.scenes.gameOver.entities.push(endMessageText);
        model.scenes.gameOver.entities.push(playAgainText);

        return;
      },
      entities: [],
      controlMap: {
        "Enter": () => { return {action: changeScene, args: [model.scenes.start]}; }
      }
    },
  },
  levels: {}
};

changeScene(model.scenes.start);

}());
