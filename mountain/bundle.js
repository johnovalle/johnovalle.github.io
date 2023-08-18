'use strict';

//Want to pass actions through a dispatcher rather than to the model directly

const dispatcher = {
  listeners: [],
  actions: {},
  addListener(listener){
    this.listeners.push(listener);
    console.log(dispatcher);
  },
  addAction(listener, action){
    //console.log(action.trigger);
    listener.actions = listener.actions || {};
    listener.actions[action.name] = action.trigger;
    console.log(listener);
  },
  sendMessage(message){
    //sconsole.log("received message:", message);
    for(let i = 0; i < this.listeners.length; i++){
      let listener = this.listeners[i];
      //for(let action in listener.actions){
        if(listener.actions.hasOwnProperty(message.action)){
          //console.log(action);
          listener.actions[message.action](...message.payload);
        }
      //}
    }
  }
};

// Not entirely sure if I'm happy with this implementation but I wanted to see
// what I could do without looking up any patterns. Seems to be working at the
// moment so let's see how it goes.

const config = {
  canvasHeight: 776,
  canvasWidth: 576,
  moveAniSpeed: 8,
  tileSize: 64,
  currentMap: null,
  mapCols: 0,
  mapRows: 0,
  rowsToShow: 4, //There should probably also be a colsToShow in cause I want to display a non-square play area
  maxOffsetX: 0,
  maxOffsetY: 0,
  minimumMonsters: 3,
  maximumMonsters: 12,
  generateMonsterTick: 20,
  setMaxOffsetX(){
    this.maxOffsetX = this.mapCols - 1 - this.rowsToShow;
  },
  setMaxOffsetY(){
    this.maxOffsetY = this.mapRows - 1 - this.rowsToShow;
  },
  changeMap(newMap){
    this.currentMap = newMap;
    this.mapCols = newMap.mapCols;
    this.setMaxOffsetX();
    this.mapRows = newMap.mapRows;
    this.setMaxOffsetY();
  }
};
dispatcher.addListener(config);
dispatcher.addAction(config, {name: "Change Map", trigger: config.changeMap.bind(config)});

const canvas = document.createElement('canvas');
const ctx = canvas.getContext('2d');
canvas.height = config.canvasHeight;
canvas.width = config.canvasWidth;
canvas.style = "border: 1px solid black";

// ctx.webkitImageSmoothingEnabled = false;
// ctx.mozImageSmoothingEnabled = false;
// ctx.imageSmoothingEnabled = false;

const attachCanvas = (element) => {
  element.appendChild(canvas);
};

const tileDictionary = {
  0: {passible: true, type: "floor"},
  1: {passible: true, type: "floor"},
  2: {passible: true, type: "floor"},
  3: {passible: false, type: "wall"},
  4: {passible: false, type: "wall"},
  5: {passible: false, type: "player"},
  6: {passible: true, type: "stairs", subtype: "stairs up"},
  7: {passible: true, type: "stairs", subtype: "stairs down"},
  8: {passible: false, type: "monster"},
  9: {passible: false, type: "monster"},
  10: {passible: false, type: "monster"},
  11: {passible: false, type: "monster"},
  12: {passible: false, type: "monster"},
  13: {passible: false, type: "monster"},
  14: {passible: false, type: "monster"},
  15: {passible: false, type: "monster"},
  16: {passible: true, type: "item"},
  17: {passible: true, type: "item"},
  18: {passible: true, type: "item"},
  19: {passible: true, type: "item"},
  20: {passible: true, type: "item"},
  21: {passible: true, type: "item"},
  22: {passible: true, type: "item"},
  23: {passible: true, type: "item"},
  24: {passible: true, type: "item"},
  25: {passible: true, type: "item"},
  26: {passible: true, type: "item"},
  27: {passible: true, type: "item"},
  28: {passible: true, type: "item"},
  29: {passible: true, type: "item"},
};

const monsterDictionary = {
  8: { name:"giant rat", subtype:"animal", hp: [1,3], weapon: { damage: [1,2], verb: "bites" }, xpVal: 50, damageModifier: 0, armor: { protection: 0 }, threat: 1 },
  9: { name:"green slime", subtype:"ooze", hp: [1,4], weapon: { damage: [1,3], verb: "splashes" }, xpVal: 75, damageModifier: 0, armor: { protection: 0 }, threat: 1 },
  10: { name:"wild dog", subtype:"animal", hp: [1,6], weapon: { damage: [1,6], verb: "bites" }, xpVal: 80, damageModifier: 0, armor: { protection: 0 }, threat: 2 },
  11: { name:"goblin", subtype:"goblin", hp: [1,6], weapon: { damage: [1,6], verb: "claws" }, xpVal: 120, damageModifier: 0, armor: { protection: 1 }, threat: 3 },
  12: { name:"kobld", subtype:"goblin", hp: [2,4], weapon: { damage: [1,6], verb: "stabs" }, xpVal: 150, damageModifier: 1, armor: { protection: 0 }, threat: 4 },
  13: { name:"orc", subtype:"goblin", hp: [2,6], weapon: { damage: [1,6], verb: "smacks" }, xpVal: 175, damageModifier: 1, armor: { protection: 1 }, threat: 5 },
  14: { name:"skeleton", subtype:"undead", hp: [2,8], weapon: { damage: [1,8], verb: "slashes" }, xpVal: 250, damageModifier: 2, armor: { protection: 1 }, threat: 6 },
  15: { name:"black dragon", subtype:"dragon", hp: [3,10], weapon: { damage: [1,10], verb: "bashes" }, xpVal: 450, damageModifier: 4, armor: { protection: 4 }, threat: Infinity }
};

const itemDictionary = {// threat should be threshold
  16: {name: "dagger", type:"weapon", subtype: "weapon", damage: [1,6], verb: "stab", threat: 1},
  17: {name: "short sword", type:"weapon", subtype: "weapon", damage: [1,8], verb: "slash", threat: 3},
  18: {name: "dark sword", type:"weapon", subtype: "weapon", damage: [1,10], verb: "slash", threat: 5},
  19: {name: "emerald mace", type:"weapon", subtype: "weapon", damage: [2,6], verb: "bash", threat: 6},
  20: {name: "ruby axe", type:"weapon", subtype: "weapon", damage: [2,8], verb: "hack", threat: 8},
  24: {name: "leather armor", subtype: "armor", protection: 1, threat: 1},
  25: {name: "chain armor", subtype: "armor", protection: 2, threat: 3},
  26: {name: "scale armor", subtype: "armor", protection: 3, threat: 5},
  27: {name: "plate armor", subtype: "armor", protection: 4, threat: 7},
  28: {name: "star armor", subtype: "armor", protection: 5, threat: 9},
  21: {name: "fresh apple", subtype: "health", verb: "eat", heals: 1, threat: 1},
  22: {name: "bread roll", subtype: "health", verb: "eat", heals: 2, threat: 2},
  23: {name: "holiday ham", subtype: "health", verb: "eat", heals: 4, threat: 5},
  29: {name: "health potion", subtype: "health", verb: "drink", heals: 10, threat: 9},
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

const firstDieFull = (diceToRoll, numOfSides) => {
  return fullDice(1, numOfSides) + rollDice(diceToRoll-1, numOfSides);
};

// break this into two files dice and true ultities
const getRandomArrayIndex = (array) => { //formerly: getRandomInArray
  return Math.floor(Math.random() * array.length);
};
const getRandomInArray = (array) => {
  return array[getRandomArrayIndex(array)];
};

const getNumInRange = (low, high) => { //inclusive //formerly: getPointBetween
  return Math.floor(Math.random() * (high - low + 1) + low);
};

let generatedRooms = [];
let nodeList = {};



function buildMap(cols, rows, tiles) {
  generatedRooms = [];
  nodeList = {};
  let mapBase = Array(cols * rows).fill(1);
  populateMap(mapBase, cols, rows);
  replaceTiles(mapBase, tiles);
  return {mapCols: cols, mapRows: rows, isBG: true, grid: mapBase }; //refactor here and in other places now that map is being generated;
}


function populateMap(array, cols, rows) {
  let roomsGenerated = 0;
  let tries = 0;
  while ((roomsGenerated < 7 && tries < 300) || tries > 300) {
    tries++;
    let room = generateRoom(array, cols, rows);
    if (room) {
      room.id = roomsGenerated;
      generatedRooms[roomsGenerated] = room;
      nodeList[room.id] = [room];
      room.node = room.id;
      roomsGenerated++;
    }
  }
  connectRooms(array, cols, rows, generatedRooms);
}

function replaceTiles(baseMap, tiles) {
    for (let i = 0; i < baseMap.length; i++) {
      let random = getRandomInArray$1(tiles[baseMap[i]]);
      baseMap[i] = tiles[baseMap[i]][random];
    }
}

function getRandomInArray$1(array){
  return Math.floor(Math.random() * array.length);
}

function getEmptyIndex(map){
  let empties = [];
  for (let i = 0; i < map.length; i++) {
    let tile = map[i];
    if(tileDictionary[tile].type === "floor") {
      empties.push(i);
    } //or passible?
  }
  return empties;
}
 //should take an array of entities and filter against their indices
function getRandomAvailable(map, entities, viewport){
  let empties = getEmptyIndex(map.grid);
  if (viewport) {
    empties = empties.filter(val => !viewport.includes(val));

  }
  if (entities) {
    empties = empties.filter(val => {
      for (let i = 0; i < entities.length; i++) {
        if(entities[i].index === val){
         return false;
        }
      }
      return true;
    });
  }
  let index = empties[getRandomInArray$1(empties)];
  let xy = indexToXY$1(index, map.mapCols);
  return Object.assign({index}, xy);
}

function generateRoom(array, cols, rows){
  let minWidth = 3;
  let minHeight = 3;
  let maxWidth = Math.ceil(cols / 6);
  let maxHeight = Math.ceil(rows / 6);
  let roomWidth = Math.ceil(Math.random() * maxWidth) + minWidth;
  let roomHeight = Math.ceil(Math.random() * maxHeight) + minHeight;
  let minDistAppart = 2;

  let roomStart = getRoomStart(array, cols, rows, roomWidth, roomHeight);
  let success = true;
  let validIndicies = [];
  let lastIndex;
  for(let i = 0; i < roomWidth; i++){
    for(let j = 0; j < roomHeight; j++){
      let index = roomStart + i + (j * cols);
      if(array[index] === 1) {
        if(i === 0 && array[index-minDistAppart] !== 1) { //left row down touching
          success = false;
          break;
        } else if (i === roomWidth - 1 && array[index+minDistAppart] !== 1) { //right row down touching
          success = false;
          break;
        }  else if (j === 0 && array[(index - (cols * minDistAppart))] !== 1) { //top row touching
          success = false;
          break;
        }  else if (j === roomHeight - 1 && array[(index + (cols * minDistAppart))] !== 1) { //bottom row touching
          success = false;
          break;
        }
        validIndicies.push(index);
        lastIndex = index;
      } else {
        success = false;
        break;
      }
    }
  }

  if (success) {
    for(let i = 0; i < validIndicies.length; i++){
      array[validIndicies[i]] = 0;
    }
    return {topLeft: indexToXY$1(roomStart, cols), bottomRight: indexToXY$1(lastIndex, cols)};
  }else{
    return false;
  }
}

const indexToXY$1 = (index, cols) => {
  let x = index % cols;
  let y = Math.floor(index / cols);
  return { x, y };
};

function getRoomStart(array, cols, rows, roomWidth, roomHeight) {
  let start = null;
  let foundStart = false;
  let tries = 0;
  while (!foundStart) {
    let index = Math.floor(Math.random() * array.length);
    let coords = indexToXY$1(index, cols);

    // makes sure room doesn't start or end on map edge
    if ( coords.x + roomWidth < cols - 1 && coords.y + roomHeight < rows - 1
      && coords.x > 0 && coords.y > 0) {
      foundStart = true;
      start = index;
    }
    tries++;
    if (tries > 20) {
      foundStart = true; // or break?
    }
  }
  return start;
}

const xyToIndex$1 = (coords, cols) => {
  return coords.y * cols + coords.x;
};

function connectRooms(array, cols, rows, rooms) {
  for (let i = 0; i < rooms.length; i++) {
    let room = rooms[i];
    let validIndicies = [];
    let path;

    if(nodeList[room.node].length < generatedRooms.length){
      path = connectRoomToRoom(room, rooms.filter((x) => x.node !== room.node));
    }else{
      path = connectRoomToRoom(room, rooms.filter((x) => x.id !== room.id));
    }
    validIndicies = getPathBetweenRooms(array, cols, rows, path);

    for (let i = 0; i < validIndicies.length; i++) {
      array[validIndicies[i]] = 0;
    }
  }
}

function connectRoomToRoom(room, rooms){
  let randomRoom = rooms[Math.floor(Math.random() * rooms.length)];

  let direction = {x: 0, y: 0};
  let point = {};
  let parallel = true;
  let initialDirection;
  let endAxis;
  if (randomRoom.topLeft.x > room.bottomRight.x) { //"right";
    direction.x = 1;
    point.x = room.bottomRight.x;
  } else if (randomRoom.bottomRight.x < room.topLeft.x) { // "left";
    direction.x = -1;
    point.x = room.topLeft.x;
  }

  if (randomRoom.topLeft.y > room.bottomRight.y) { // below
    direction.y = 1;
    point.y = room.bottomRight.y;
  } else if (randomRoom.bottomRight.y < room.topLeft.y) { // above
    direction.y = -1;
    point.y = room.topLeft.y;
  }

  //parallel on x axis
  let parallelAxes = [];

   //need to make sure the starting point is not already used or adjecent to another corridor.
  if((direction.x === -1 || direction.x === 1) && direction.y === 0) {
    parallelAxes = range(Math.max(room.topLeft.y, randomRoom.topLeft.y),
                            Math.min(room.bottomRight.y, randomRoom.bottomRight.y));
    point.y = parallelAxes[Math.floor(Math.random()*parallelAxes.length)];
    initialDirection = "x";
  } //parallel on y axis
  else if((direction.y === -1 || direction.y === 1) && direction.x === 0) {
    parallelAxes = range(Math.max(room.topLeft.x, randomRoom.topLeft.x),
                            Math.min(room.bottomRight.x, randomRoom.bottomRight.x));
    point.x = parallelAxes[Math.floor(Math.random()*parallelAxes.length)];
    initialDirection = "y";
  } else { // not parallel
    let startPoints = [];
    let endPoints = [];
    parallel = false;
    initialDirection = Math.random() < 0.5 ? "x" : "y";

    if(initialDirection === "x"){
      startPoints = range(room.topLeft.y, room.bottomRight.y);
      point.y = startPoints[Math.floor(Math.random() * startPoints.length)];
      endPoints = range(randomRoom.topLeft.x, randomRoom.bottomRight.x);
      endAxis = endPoints[Math.floor(Math.random() * endPoints.length)];

    } else {
      startPoints = range(room.topLeft.x, room.bottomRight.x);
      point.x = startPoints[Math.floor(Math.random() * startPoints.length)];
      endPoints = range(randomRoom.topLeft.y, randomRoom.bottomRight.y);
      endAxis = endPoints[Math.floor(Math.random() * endPoints.length)];
    }
  }
  mergeNodes(room, randomRoom); //This shouldn't be here, it should happen after the rooms are connected;

  return { point, direction, parallel,
    initialDirection, endAxis,
    destination: randomRoom};
}

function mergeNodes(room1, room2){
  if(room1.node !== room2.node){
    let oldNode = room2.node;
    for(let i = 0; i < nodeList[oldNode].length; i++){
      nodeList[oldNode][i].node = room1.node;
    }

    nodeList[room1.node] = nodeList[room1.node].concat(nodeList[oldNode]);
    delete nodeList[oldNode];
  }
}

function range(start, end) {
  return Array(end - start + 1).fill().map((_, idx) => start + idx)
}

function getPathBetweenRooms(array, cols, rows, path){
  let validIndicies = [];
  let unconnected = true;
  let turned = false;
  while(unconnected){
    path.point[path.initialDirection] += path.direction[path.initialDirection];

    if(!path.parallel && path.point[path.initialDirection] === path.endAxis && !turned){
      path.initialDirection = path.initialDirection === "x" ? "y" : "x"; //flip from "x" to "y";
      turned = true;
    }

    let currentIndex = xyToIndex$1(path.point, cols);
    if(path.point.x > 0 && path.point.y > 0
    && path.point.x < cols && path.point.y < rows){
      validIndicies.push(currentIndex);
      // array[currentIndex] = 5;
      if(isPointInRoom(path.point, path.destination)){
        unconnected = false;
      }

    } else {
    	validIndicies = [];
      break;
    }
  }
  return validIndicies;
}

function isPointInRoom(point, room){
  if (point.x >= room.topLeft.x && point.x <= room.bottomRight.x
    && point.y >= room.topLeft.y && point.y <= room.bottomRight.y) {
    return true;
  }

  return false;
}

const Entity = {
  x: 0,
  y: 0,
  type: null
};

let idCounter = 1;

let generatedItems = []; // This probably should be on the game object

const reset = () => {
  generatedItems = [];
}; 

const buildEntityMap = (level) => {
  level.entitiesMap = {};
  level.entitiesMap.grid = Array(config.mapCols * config.mapRows).fill(0);
  level.entitiesMap.mapCols = config.mapCols;
  level.entitiesMap.mapRows = config.mapRows;
  for(let i = 0; i < level.entities.length; i++) {

    let entity = level.entities[i];
    //console.log(entity);
    level.entitiesMap.grid[entity.index] = entity.key;
  }
};

const buildEntity = (level, key, location) => { //lets assume the index is clear and not check here
  let entity = Object.assign({}, Entity, { key, index: location.index, x: location.x * config.tileSize, y: location.y * config.tileSize });
  entity.nextX = entity.x;
  entity.nextY = entity.y;
  entity.id = idCounter;
  entity.type = tileDictionary[entity.key].type;
  entity.subtype = tileDictionary[entity.key].subtype;

  idCounter++;
  level.entitiesMap[entity.index] = entity.key;
  level.entities.push(entity);

  return entity;
};

const buildStairs = (level, key, location, targetLevel = null, targetIndex = null) => {
  let stairs = buildEntity(level, key, location);
  stairs.targetLevel = targetLevel;
  stairs.targetIndex = targetIndex;
  return stairs;
};

const buildPlayer = (level, key, location) => {
  let player = buildEntity(level, key, location);
  player.name = "player";
  player.hp = 10;
  player.maxHp = 10;
  player.xp = 0;
  player.level = 1;
  player.damageModifier = 1;
  player.weapon = {name: "hand", damage: [1,4], verb: "punch", subtype: "weapon", threat: 0};
  player.armor = {name: "cloth", protection: 0, threat: 0};
  return player;
};

const buildMonster = (level, key, index) => {
  let entity = buildEntity(level, key, index);
  let monsterRef = monsterDictionary[entity.key];
  let monster = Object.assign(entity, monsterRef);
  monster.hp = firstDieFull(...monsterRef.hp);
  monster.maxHp = monster.hp;
  return monster;
};

const buildItem = (level, key, index) => {
  let item = buildEntity(level, key, index);
  item.itemProps = itemDictionary[item.key];
  //add damageModifier to monster table
  console.log(item);
  return item;
};

const populateLevel = (level) => {
  // level gets a random number of monsters between the min and maxHp
  // should be more for higher levels
  // the monsters on high levels shold be higher level
  // some monsters such as the dragon do not generate
  let numMonsters = getNumInRange(config.minimumMonsters, config.maximumMonsters) + Math.floor(level.baseDifficulty / 2);
  let possibleMonsters = getPossibleMonsters(level);
  for(let i = 0; i < numMonsters; i++){

    buildMonster(
      level,
      getRandomInArray(possibleMonsters),
      getRandomAvailable(level.map, level.entities)
    );
  }
  let numItems = Math.floor(numMonsters / 3);
  let possibleItems = getPossibleItems(level);
  for(let i = 0; i < numItems; i++){
    let key = getRandomInArray(possibleItems);
    let item = itemDictionary[key];
    console.log(`generated: ${item.name}`);
    if(item.subtype === "weapon" || item.subtype === "armor") {
      generatedItems.push(key);
      let itemKey = possibleItems.indexOf(key);
      possibleItems.splice(itemKey,1);
    }
    buildItem(
      level,
      key,
      getRandomAvailable(level.map, level.entities)
    );
  }
  // items generated should be numMonsters / 3 (monsters will also drop food sometimes later);
  // no more than one weapon or armor should generate on a level,
  // weapons and armor worse than those that have been generated should not generate.
  // maybe should always generate weapons and armor in order or close to it?
};

const generateMonster = (level, viewport) => {
  let possibleMonsters = getPossibleMonsters(level);
  let mon = buildMonster(
    level,
    getRandomInArray(possibleMonsters),
    getRandomAvailable(level.map, level.entities, viewport)
  );
  console.log("generated: ", mon);
};

const getPossibleMonsters = (level) => {
  return Object.keys(monsterDictionary).filter((monKey) => {
    let monster = monsterDictionary[monKey];
    return monster.threat <= level.baseDifficulty && monster.threat >= Math.floor(level.baseDifficulty / 2);
  });
};

const getPossibleItems = (level) => {
  return Object.keys(itemDictionary).filter((iKey) => {
    let item = itemDictionary[iKey];
    return item.threat <= level.baseDifficulty 
      && item.threat >= Math.floor(level.baseDifficulty / 2) 
      && generatedItems.indexOf(iKey) === -1;
  });
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

const getEntitiesAtIndex = (level, index) => {
  let entities = [];
  for(let i = 0; i < level.entities.length; i++){
    let entity = level.entities[i];
    if(entity.index === index){
      entities.push(entity);
    }
  }
  return entities;
};

const indexToXY = (index) => {
  let x = index % config.mapCols;
  let y = Math.floor(index / config.mapCols);
  return {x, y, index};
};

const indexTrueToXY = (index) => {
  let x = (index % config.mapCols) * config.tileSize;
  let y = Math.floor(index / config.mapCols) * config.tileSize;
  return {x, y, index};
};

const xyToIndex = (coords) => {
  return (coords.y*config.mapCols) + coords.x;
};

const getTranslation = (coords) => {
  let offsetCoords = {x:0, y:0};
  let extra = 0;
  if(coords.x > config.maxOffsetX){
    extra = coords.x - config.maxOffsetX;
  }

  if(coords.x >= config.rowsToShow ){
    offsetCoords.x = coords.x - (config.rowsToShow + extra);
  }else{
    offsetCoords.x = 0;
  }
  extra = 0;
  if(coords.y > config.maxOffsetY){
    extra = coords.y - config.maxOffsetY;
  }
  if(coords.y >= config.rowsToShow){
    offsetCoords.y = coords.y - (config.rowsToShow + extra);
  }else{
    offsetCoords.y = 0;
  }
  return offsetCoords;
};
// just to get this to work, this all needs to be completely rewritten
const constrainCameraTranslation = (player) => {
  let coords = {x: 0, y: 0};
  if(player.x < config.rowsToShow * config.tileSize){
    coords.x = 0;
  }else if (player.x > config.maxOffsetX * config.tileSize) {
    coords.x = -(config.maxOffsetX - config.rowsToShow) * config.tileSize;//-576; //-(22 - 4) * 32;
  } else {
    coords.x = -(player.x - (config.rowsToShow * config.tileSize));
  }

  if(player.y < config.rowsToShow * config.tileSize){
    coords.y = 0;
  }else if(player.y > config.maxOffsetY * config.tileSize) {
    coords.y = -(config.maxOffsetY - config.rowsToShow) * config.tileSize;//-576; //-(22 - 4) * 32;
  } else {
    coords.y = -(player.y - (config.rowsToShow * config.tileSize));
  }
  return coords;
};
// This needs to be moved to entities
const moveEntity = (entity, key) => {
  let currentCoords = indexToXY(entity.index);
  // console.log("before move entity", key, currentCoords);
  //send an action to dispatcher telling the draw to refresh
  entity.nextY = entity.y;
  entity.nextX = entity.x;
  if(key === "up" && currentCoords.y > 0){
    entity.index -= config.mapCols;
    entity.nextY -= config.tileSize;
  }
  if(key === "down" && currentCoords.y < config.mapRows - 1){
    entity.index += config.mapCols;
    entity.nextY += config.tileSize;
  }
  if(key === "left" && currentCoords.x > 0){
    entity.index -= 1;
    entity.nextX -= config.tileSize;
  }
  if(key === "right" && currentCoords.x < config.mapCols - 1){
    entity.index += 1;
    entity.nextX += config.tileSize;
  }
  if(key === "up-left" && currentCoords.y > 0 && currentCoords.x > 0){
    entity.index -= config.mapCols + 1;
    entity.nextY -= config.tileSize;
    entity.nextX -= config.tileSize;
  }
  if(key === "up-right" && currentCoords.y > 0 && currentCoords.x < config.mapCols - 1){
    entity.index -= config.mapCols - 1;
    entity.nextY -= config.tileSize;
    entity.nextX += config.tileSize;
  }
  if(key === "down-left" && currentCoords.y < config.mapRows - 1 && currentCoords.x > 0){
    entity.index += config.mapCols - 1;
    entity.nextY += config.tileSize;
    entity.nextX -= config.tileSize;
  }
  if(key === "down-right" && currentCoords.y < config.mapRows - 1 && currentCoords.x < config.mapCols - 1){
    entity.index += config.mapCols + 1;
    entity.nextY += config.tileSize;
    entity.nextX += config.tileSize;
  }
  
  // console.log(entity);
};

const checkIndex = (entity, key) => { //Think about drying this up
  let currentCoords = indexToXY(entity.index);
  let newIndex;
  if(key === "up" && currentCoords.y > 0){
    newIndex = entity.index - config.mapCols;
  }
  if(key === "down" && currentCoords.y < config.mapRows - 1){
    newIndex = entity.index + config.mapCols;
  }
  if(key === "left" && currentCoords.x > 0){
    newIndex = entity.index - 1;
  }
  if(key === "right" && currentCoords.x < config.mapCols - 1){
    newIndex = entity.index + 1;
  }
  if(key === "up-left" && currentCoords.y > 0 && currentCoords.x > 0 ){
    newIndex = entity.index - config.mapCols - 1;
  }
  if(key === "up-right" && currentCoords.y > 0 && currentCoords.x < config.mapCols - 1){
    newIndex = entity.index - config.mapCols + 1;
  }
  if(key === "down-left" && currentCoords.y < config.mapRows - 1 && currentCoords.x > 0){
    newIndex = entity.index + config.mapCols - 1;
  }
  if(key === "down-right"&& currentCoords.y < config.mapRows - 1 && currentCoords.x < config.mapCols - 1){
    newIndex = entity.index + config.mapCols + 1;
  }
  if(key === "wait" && currentCoords.x < config.mapCols - 1){
    newIndex = entity.index;
  }
   //This wont handle entities at the moment, should I check against two maps or fuse them?
  return { target: tileDictionary[config.currentMap.grid[newIndex]], index: newIndex };
};

const getIndicesInViewport = (padding = 0) => { //takes a var to grab extra map cells around the the viewport
  let viewport = Object.assign({}, config.translateOffset);
  //X and Y meaing both the pixel position and the coordinate position is confusing and source of bugs fix
  viewport.x = (Math.abs(viewport.x) / config.tileSize) - padding;
  viewport.y = (Math.abs(viewport.y) / config.tileSize) - padding;
  //console.log(viewport.x , viewport.y);
  //console.log(viewport.x , viewport.y);
  let indices = []; // this should have a length of 81;
  //console.log(viewport.x + (Config.rowsToShow * 2), viewport.y + (Config.rowsToShow * 2));
  //console.log(viewport.x + (Config.rowsToShow * 2) + padding, viewport.y + (Config.rowsToShow * 2) + padding);
  if(padding > 0){
    padding += 1; //not sure why this is necessary but without it, it's not extending far enough...
  }
  for(let i = 0; i < config.currentMap.grid.length; i++) {
    let tileCords = indexToXY(i);
    if(tileCords.x >= viewport.x && tileCords.x <= viewport.x + (config.rowsToShow * 2) + padding
       && tileCords.y >= viewport.y && tileCords.y <= viewport.y + (config.rowsToShow * 2) + padding) {
      indices.push(i);
    }
  }

  return indices;
};

const getValidDirection = (level, entity) => { //maybe this should be in entities
  let currentCoords = indexToXY(entity.index);
  let directionsMap = {};
  directionsMap[entity.index - config.mapCols] = { key: "up" };
  directionsMap[entity.index + config.mapCols] = { key:"down" };
  directionsMap[entity.index - 1] = { key: "left" };
  directionsMap[entity.index + 1] = { key: "right" };
  directionsMap[entity.index - config.mapCols - 1] = { key: "up-left" };
  directionsMap[entity.index - config.mapCols + 1] = { key:"up-right" };
  directionsMap[entity.index + config.mapCols - 1] = { key: "down-left" };
  directionsMap[entity.index + config.mapCols + 1] = { key: "down-right" };

  let directions = checkForValidPoints(level, directionsMap);
  return directionsMap[getRandomInArray(directions)];
};

const checkForValidPoints = (level, pointMap) => {
  return Object.keys(pointMap).filter((index) => {
    let valid = true;
    index = parseInt(index);
    if (tileDictionary[config.currentMap.grid[index]].passible) {
      pointMap[index].entities = getEntitiesAtIndex(level, index); //this should not happen unless tile.passbile on map
      for (let i = 0; i < pointMap[index].entities.length; i++) {
        if(pointMap[index].entities[i].type === 'monster') {
          valid = false;
        }
      }
      return valid;
    }
    return false;
  });
};

function getPoints(a,b,multiplier){
  var dist = Math.abs(a.x - b.x);
  var points = [];
  for(var i = 1; i < dist; i++){
    points.push({x: a.x+i*multiplier.x, y: a.y+i*multiplier.y, dist: dist});
  }
  return points;
}

function getAllPointsAtRange(originPoint, dist){
  let a = {x: originPoint.x, y: originPoint.y - dist, dist: dist};
  let b = {x: originPoint.x + dist, y: originPoint.y, dist: dist};
  let c = {x: originPoint.x, y: originPoint.y + dist, dist: dist};
  let d = {x: originPoint.x - dist, y: originPoint.y, dist: dist};

  let points = [a,b,c,d]
                .concat(getPoints(a,b, {x: 1, y: 1}))
                .concat(getPoints(b,c, {x: -1, y: 1}))
                .concat(getPoints(c,d, {x: -1, y: -1}))
                .concat(getPoints(d,a, {x: 1, y: -1}));
  return points;
}

function getAllPoints(originPoint, dist){
  let points = [];
  for(var i = 1; i < dist; i++){
    let x = getAllPointsAtRange(originPoint, i);
    points = points.concat(x);
  }
  return points;
}

const getDirectionTowardsPoint = (level, origin, dest) => {
  let direction = { x: 0, y: 0 };
  let xDif, yDif;
  xDif = dest.x - origin.x;
  if (xDif > 0) {
    direction.x = 1;
  } else if(xDif < 0) {
    direction.x = -1;
  }

  yDif = dest.y - origin.y;
  if (yDif > 0) {
    direction.y = 1;
  } else if(yDif < 0) {
    direction.y = -1;
  }
  let directionsMap = getDirectionIndices(origin, direction);
  let directions = checkForValidPoints(level, directionsMap);
  return directionsMap[getRandomInArray(directions)];
};

const getDirectionIndices = (origin, direction) => { //min 1, max 3 possiblities
  let possibleIndices = {};
  //some diagonals should get sent even if they are parallel but should prefer the parallel route...
  //similarly it should prefer diagonal routes when available
  //pass pack two arrays, primary and secondary routes, if there are no valid primary routes evaluate secondary routes
  if (direction.x !== 0 && direction.y !== 0){
    //diagonal, skip for now
    // { x: origin.x + direction.x,
    //  y: origin.y + direction.y }
    if(direction.y === -1 && direction.x === -1) {
      possibleIndices[origin.index - config.mapCols - 1] = { key: "up-left" };
    }
    if(direction.y === -1 && direction.x === 1) {
      possibleIndices[origin.index - config.mapCols + 1] = { key: "up-right" };
    }
    if(direction.y === 1 && direction.x === -1) {
      possibleIndices[origin.index + config.mapCols - 1] = { key: "down-left" };
    }
    if(direction.y === 1 && direction.x === 1) {
      possibleIndices[origin.index + config.mapCols + 1] = { key: "down-right" };
    }
  }
  if (direction.y === -1) {
    //possibleCoords.push({x: origin.x + direction.x, y: origin.y});
    possibleIndices[origin.index - config.mapCols] = { key: "up" };
  }
  if (direction.y === 1) {
    //possibleCoords.push({x: origin.x, y: origin.y + direction.y});
    possibleIndices[origin.index + config.mapCols] = { key:"down" };
  }
  if (direction.x === -1) {
    //possibleCoords.push({x: origin.x + direction.x, y: origin.y});
    possibleIndices[origin.index - 1] = { key: "left" };
  }
  if (direction.x === 1) {
    //possibleCoords.push({x: origin.x, y: origin.y + direction.y});
    possibleIndices[origin.index + 1] = { key: "right" };
  }
  //return possibleCoords;
  return possibleIndices;
};

//need to make  dictionary with the 9 possible direction to clean up some of this duplication

const model = {
  state: {
    currentScene: null,
    lastMoveFinished: true,
    playerMoved: false
  },
  scenes: {},
  levels: {}, //This might not even need to be here
  levelCounter: 1,
  restart() {
    this.levelCounter = 1;
    this.levels = {};
  },
  addScene(name, onEnter, controlMap) {
    //console.log(this);
    if(!this.scenes[name]){
      this.scenes[name] = Object.assign({}, Scene, {
        name,
        id: SceneId,
        entities: [],
        onEnter,
        controlMap
      });
      SceneId++;
    }else{
      console.error(`Scene with the name ${name} already exists`);
    }
  },
  changeScene(scene){
    // this should send an event to dispatcher to redraw the screen
    //console.log("this", this);
    // sconsole.log("change scene");
    this.state.currentScene = this.scenes[scene];
    this.state.currentScene.onEnter();
    dispatcher.sendMessage({action: "Change Scene", payload: [this.state.currentScene]});
  },
  createLevel(previousLevel, connectingStairs) {
    let level = {
      name: "level" + this.levelCounter,
      map: buildMap(27, 27, {0: [0,1,2], 1: [3,4]}), //map1
      entities: [],
      baseDifficulty: this.levelCounter,
      tick: 0
    };
    this.levels[level.name] = level;

    buildEntityMap(level);
    if (previousLevel) {
      let stairUpIndex = getRandomAvailable(level.map, level.entities);
      buildStairs(level, 6, stairUpIndex, previousLevel.name, connectingStairs.index);
      connectingStairs.targetLevel = level.name;
      connectingStairs.targetIndex = stairUpIndex.index;
    }

    if (this.levelCounter < 10) {
      let stairDownIndex = getRandomAvailable(level.map, level.entities);
      buildStairs(level, 7, stairDownIndex); //{index: 29, x: 2, y:1}
    }
    if(this.levelCounter === 10) {
      let dragonIndex = getRandomAvailable(level.map, level.entities);
      buildMonster(level, 15, dragonIndex);
    }

    populateLevel(level);

    this.levels[level.name] = level;
    this.levelCounter++;
    return level;
  },
  handleKeyPress(key) {
    //console.log(key)
    // console.log("this", this, this.state);
    let request;
    if(typeof this.state.currentScene.controlMap[key] === "function"){
      request = this.state.currentScene.controlMap[key]();
    }
    if(request){
        request.action(...request.args);
    }
  },
};

const Scene = {
  id: null,
  entities: null,
  onEnter: null,
  controllerMap: null
};
let SceneId = 0;

dispatcher.addListener(model);
dispatcher.addAction(model, {name: "Key Press", trigger: model.handleKeyPress.bind(model)});

const controllerMaps = {
  start: {
    "Enter": () => { return {action: model.changeScene.bind(model), args: ["play"]}; },
    "m": () => { return {action: Game.toggleMusic.bind(Game), args: []}; }
  },
  play: {
    //"Enter": () => { return {action: Model.changeScene.bind(Model), args: ["gameOver"]}; },
    "ArrowUp": () => { return {action: Game.movePlayer.bind(Game), args: ["up"]}; },
    "ArrowDown": () => { return {action: Game.movePlayer.bind(Game), args: ["down"]}; },
    "ArrowLeft": () => { return {action: Game.movePlayer.bind(Game), args: ["left"]}; },
    "ArrowRight": () => { return {action: Game.movePlayer.bind(Game), args: ["right"]}; },
    "8": () => { return {action: Game.movePlayer.bind(Game), args: ["up"]}; },
    "2": () => { return {action: Game.movePlayer.bind(Game), args: ["down"]}; },
    "4": () => { return {action: Game.movePlayer.bind(Game), args: ["left"]}; },
    "6": () => { return {action: Game.movePlayer.bind(Game), args: ["right"]}; },
    "7": () => { return {action: Game.movePlayer.bind(Game), args: ["up-left"]}; },
    "9": () => { return {action: Game.movePlayer.bind(Game), args: ["up-right"]}; },
    "1": () => { return {action: Game.movePlayer.bind(Game), args: ["down-left"]}; },
    "3": () => { return {action: Game.movePlayer.bind(Game), args: ["down-right"]}; },
    "5": () => { return {action: Game.movePlayer.bind(Game), args: ["wait"]}; },
    "w": () => { return {action: Game.movePlayer.bind(Game), args: ["up"]}; },
    "x": () => { return {action: Game.movePlayer.bind(Game), args: ["down"]}; },
    "a": () => { return {action: Game.movePlayer.bind(Game), args: ["left"]}; },
    "d": () => { return {action: Game.movePlayer.bind(Game), args: ["right"]}; },
    "q": () => { return {action: Game.movePlayer.bind(Game), args: ["up-left"]}; },
    "e": () => { return {action: Game.movePlayer.bind(Game), args: ["up-right"]}; },
    "z": () => { return {action: Game.movePlayer.bind(Game), args: ["down-left"]}; },
    "c": () => { return {action: Game.movePlayer.bind(Game), args: ["down-right"]}; },
    "s": () => { return {action: Game.movePlayer.bind(Game), args: ["wait"]}; },
    "m": () => { return {action: Game.toggleMusic.bind(Game), args: []}; }
  },
  gameOver: {
    "Enter": () => { return {action: model.changeScene.bind(model), args: ["start"]}; }
  }
};

// I'd like to create this dynamically, not entirely convinced that it makes sense
// The binding `Model.changeScene.bind(Model)` seems really quirky, gotta look into why the context is getting obliterated when it's not so late.

let spritesheet = {
  sheet: new Image(),
  start: new Image(),
  end: new Image(),
  itemsToLoad: 0,
  itemsLoaded: 0,
  finishedLoading() {
    console.log("finishedLoading called");
    if(this.itemsToLoad === this.itemsLoaded) {
      console.log("loadeding done", this.callbacks);
      for(let i = 0; i < this.callbacks.length; i++){
        this.callbacks[i]();
      }
    }
  },
  callbacks: [],
  reset() {
    this.itemsToLoad = 0;
    this.itemsLoaded = 0;
    this.callbacks = [];
    this.sheet = new Image(), this.start = new Image(), this.end = new Image();
  }
};


const loadSpritesheet = (source, tileSize, sheetSize, callback) => {
  spritesheet.sheet.src = source;
  spritesheet.tileSize = tileSize;
  spritesheet.sheetSize = sheetSize;
  spritesheet.sheetCols = sheetSize / tileSize;
  spritesheet.itemsToLoad++;
  if(callback){
    spritesheet.callbacks.push(callback);
  }
  spritesheet.sheet.onload = () => {
    //callback();
    spritesheet.itemsLoaded++;
    spritesheet.finishedLoading();
  };
};

const loadImage = (source, target, callback) => { //merge these two
  spritesheet[target].src = source;
  spritesheet.itemsToLoad++;
  if(callback){
    spritesheet.callbacks.push(callback);
  }
  spritesheet[target].onload = () => {
    //callback();
    spritesheet.itemsLoaded++;
    spritesheet.finishedLoading();
  };
};

let messageLog = {
  messages: [],
  currentStats: {},
  endGame: {},
  startGame: {},
  reset(){
    this.messages = ["The egg of the black dragon who killed your father's family has hatched",
    "Deep at the bottom of a mountain fortress the hatchling gathers power",
    "Venture forth and kill the black dragon welp before it's too late!"];
    this.currentStats = {};
    this.endGame = {messages: [
      {text: "Game Over", size: 40, x:200, y:150},
      {text: "Hit Enter", size: 24, x:250, y:600}
    ]};
    this.startGame = {messages: [
      {text: "Welcome to Black Dragon 2: Dragon Spawn", size: 24, x:120, y:680},
      {text: "Hit Enter to start", size: 24, x:220, y:710},
      {text: "Control using the number pad or key Q-C, M to toggle music", size: 24, x: 55, y: 740}
    ]};
  }
};

messageLog.reset();

let currentCoords = null;
let translateOffset = {x: 0, y: 0};
let topOffest = 100;

let fadeOut = false;
let fadeIn = false;
let animationCounter$1 = 0;

const draw = (state) => {
  ctx.clearRect(0, 0, config.canvasWidth, config.canvasHeight);

  if(state.currentScene.name === "start") {
   drawCover("start");
   drawInstructions("startGame");
  }

  if(state.currentScene.name === "gameOver") {
   //drawCover("gaveOver");
   ctx.fillStyle = "#000";
   ctx.fillRect(0, 0, config.canvasWidth, config.canvasHeight);
   drawInstructions("endGame");
  }

  if(state.currentScene.currentLevel && state.currentScene.currentLevel.map) { //Temporary
    ctx.save();
    let currentCoords = indexToXY(model.state.player.index);
    let sightPoints = getAllPoints(currentCoords, 4);
    let sightIndices = sightPoints.map((p) => {
      return xyToIndex(p);
    });
    sightIndices.push(model.state.player.index);
    let viewport = getIndicesInViewport(1);
    //console.log(viewport.length);
    //console.log(translateOffset);
    //ctx.translate(translateOffset.x * -spritesheet.tileSize, translateOffset.y * -spritesheet.tileSize);
    ctx.translate(translateOffset.x, translateOffset.y + topOffest);
    drawMap(state.currentScene.currentLevel.map, viewport);
    drawEntities(state.currentScene.currentLevel, sightIndices, viewport);
    drawFog(state.currentScene.currentLevel.map, sightIndices, viewport);
    ctx.restore();
    ctx.fillStyle = "#000000";
    ctx.fillRect(0, 0, config.canvasWidth, topOffest);
    ctx.fillRect(0, config.canvasHeight - topOffest, config.canvasWidth, config.canvasHeight);

    if(fadeOut){
      drawFade();
    }
    drawStats(messageLog.currentStats);
    drawLog(messageLog.messages);
  }

};

const drawFade = () => {
  animationCounter$1++;
  let curAlpha;
  if (fadeIn){
    if (animationCounter$1 <= 16) {
      curAlpha = animationCounter$1 / 16;
    }
    if (animationCounter$1 > 16) {
      curAlpha = Math.floor(animationCounter$1 / 2) % 16;
    }
    if (animationCounter$1 === 32) {
      curAlpha = 0;
    }
  } else {
    curAlpha = animationCounter$1 / 32;
  }
  ctx.fillStyle = `rgba(0,0,0,${curAlpha})`;
  ctx.fillRect(0, 0, config.canvasWidth, config.canvasHeight);
  if (animationCounter$1 === 32) {
    animationCounter$1 = 0;
    fadeIn = false;
    fadeOut = false;
  }
};

const drawInstructions = (scene) => {
  let messages = messageLog[scene].messages;
  ctx.fillStyle = "#fff";
  for(let i = 0; i < messages.length; i++){
    ctx.font = `${messages[i].size}px Orange Kid`;
    ctx.fillText(messages[i].text, messages[i].x, messages[i].y);
  }
};
const setCameraOffset = () => {
  //console.log("this got called");
  currentCoords = indexToXY(model.state.player.index); //only get this on scene/level change
  translateOffset = getTranslation(currentCoords); // ''
  translateOffset.x *= -config.tileSize;
  translateOffset.y *= -config.tileSize;
  // I don't know if I really want to put this here but just for the sake of simplicity
  config.translateOffset = translateOffset;
};

//TODO DRY up these two methods
const drawEntities = (level, sightIndices, viewport) => { //Temporary
  //buildEntityMap(level);
  //console.log("entitiesMap", level.entitiesMap);
  // drawMap(level.entitiesMap);
  // need to draw entities by X and Y values so that I can animate them,
  // probably also need to store the offset as X and Y so the screen shift will also be smooth
  for(let i = 0; i <  level.entities.length; i++){
    let entity = level.entities[i];
    //console.log(entity);
    if (viewport.indexOf(entity.index) !== -1 && (sightIndices.indexOf(entity.index) !== -1 || entity.type !== "monster")) {
    //console.log(entity.x, entity.y);
    // these properties can be stored on the entity itself rather than be calculated everytime
      let sx = (entity.key % spritesheet.sheetCols) * spritesheet.tileSize;
      let sy = Math.floor(entity.key / spritesheet.sheetCols) * spritesheet.tileSize;
      ctx.drawImage(spritesheet.sheet, sx, sy, spritesheet.tileSize, spritesheet.tileSize,
                                      entity.x, entity.y, config.tileSize, config.tileSize);
    }
  }
};

const drawMap = (map, viewport) => { //check viewport here and only draw what's in the viewport
  for(let i = 0, len = map.grid.length;  i < len; i++){
    let tile = map.grid[i];
    if(viewport.indexOf(i) !== -1 && (tile !== 0 || map.isBG)){
      let x = (i % map.mapCols) * config.tileSize; // index / width of drawing area in tiles * tile size
      let y = Math.floor(i / map.mapCols) * config.tileSize;
      let sx = (tile % spritesheet.sheetCols) * spritesheet.tileSize; // tile value against width of tilesheet in tiles * tile size on sheet
      let sy = Math.floor(tile / spritesheet.sheetCols) * spritesheet.tileSize;
      ctx.drawImage(spritesheet.sheet, sx, sy, spritesheet.tileSize, spritesheet.tileSize,
                                      x, y, config.tileSize + 1, config.tileSize + 1);
    }
  }
};
const drawFog = (map, sightIndices, viewport) => {
  for(let i = 0, len = map.grid.length;  i < len; i++){
    if (viewport.indexOf(i) !== -1 && sightIndices.indexOf(i) === -1) {
      let x = (i % map.mapCols) * config.tileSize; // index / width of drawing area in tiles * tile size
      let y = Math.floor(i / map.mapCols) * config.tileSize;
      ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
      ctx.fillRect(x, y, config.tileSize, config.tileSize);
    }
  }
};
const drawStats = (stats) => {
  ctx.fillStyle = "#fff";
  ctx.font = "25px Orange Kid";
  ctx.fillText(`HP: ${stats.hp} / ${stats.maxHp}`, 20, 25);
  ctx.fillText(`Weapon: ${stats.weapon.name}`, 20, 55);
  ctx.fillText(`Armor: ${stats.armor.name}`, 20, 85);
  ctx.fillText(`Player Level: ${stats.playerLevel}`, 420, 25);
  ctx.fillText(`XP: ${stats.xp} / ${stats.nextXp}`, 420, 55);
  ctx.fillText(`Dungeon Level: ${stats.dungeonLevel}`, 420, 85);
};

const drawLog = (log) => {
  let messages = log.slice(-3);
  for(let i = 0; i < messages.length; i++){
    ctx.fillStyle = "#fff";
    ctx.font = "20px Orange Kid";
    ctx.fillText(messages[i], 20, config.canvasHeight - topOffest + (i * 30) + 25);
  }
};

const drawCover = (name) => {
  ctx.drawImage(spritesheet[name], 0, 0, config.canvasWidth, config.canvasHeight);
};

// Let's see where this goes...
const drawer = {
  redraw(){
    if(model.state.currentScene.currentLevel){
      setCameraOffset();
    }

    draw(model.state);
  },
  updateCamera(xA, yA){
    translateOffset.x += xA;
    translateOffset.y += yA;
    translateOffset = constrainCameraTranslation(model.state.player);
    config.translateOffset = translateOffset;
  },
  setFadeout(shouldFadeIn){
    fadeOut = true;
    fadeIn = shouldFadeIn;
  }
};
dispatcher.addListener(drawer);
dispatcher.addAction(drawer, {name: "Change Scene", trigger: drawer.redraw});
dispatcher.addAction(drawer, {name: "Update Camera", trigger: drawer.updateCamera});
dispatcher.addAction(drawer, {name: "Fade-out-in", trigger: drawer.setFadeout});

const addSong = (source, loop) => {
  let song = new Audio(source);
  if (loop) {
    if (typeof song.loop == 'boolean') {
        song.loop = true;
    } else {
        song.addEventListener('ended', () => {
            song.currentTime = 0;
            song.play();
        }, false);
    }
  }

  return song;
};

var animationCounter = 0;

const animateEntityMovement = (state) => {
  if(state.playerMoved){
      state.playerMoved = false;
  }

  for(let i = 0; i < state.currentScene.currentLevel.entities.length; i++){
      let entity = state.currentScene.currentLevel.entities[i];
      let moveX, moveY;
      if(entity.x != entity.nextX){
          if(entity.x < entity.nextX) {
            entity.x += config.moveAniSpeed;
            moveX = config.moveAniSpeed;
          } else {
            entity.x -= config.moveAniSpeed;
            moveX = -config.moveAniSpeed;
          }
      }

      if(entity.y != entity.nextY){
        if(entity.y < entity.nextY) {
          entity.y += config.moveAniSpeed;
          moveY = config.moveAniSpeed;
        } else {
          entity.y -= config.moveAniSpeed;
          moveY = -config.moveAniSpeed;
        }
      }
      if(entity.name === 'player') {
        dispatcher.sendMessage({action: "Update Camera", payload: [moveX, moveY]});
      }
  }
  animationCounter += config.moveAniSpeed;
  if(animationCounter === config.tileSize){
      animationCounter = 0;
      state.lastMoveFinished = true;
  }
};

const playerXpTable = { //this should be computed using a config value
  1: 200,
  2: 400,
  3: 800,
  4: 1600,
  5: 3200,
  6: 6400,
  7: 12800,
  8: 25600,
  9: 51200,
  10: 102400
};
let titleTheme = addSong('title.mp3');
let dungeonTheme = addSong('crawl.mp3', true);

const Game = {
  state: model.state,
  loadGame(){
    loadImage("blackdragonCover1.png", "start");
    loadSpritesheet("mountain-fortress.png", 32, 256, () => {
      this.run();
    });
    //These need to be bundled in an asset loader

  },
  gameTick: 0, //total elapsed turns
  lastTick: 0,
  musicEnabled: true, //this should be in model
  currentTrack: null,
  toggleMusic(){
    this.musicEnabled = !this.musicEnabled;
    if(this.musicEnabled) {
      this.currentTrack.play();
    }else {
      this.currentTrack.pause();
    }
  },
  start(){
    attachCanvas(document.body); //should only do this the first time
    this.lastTick = 0;
    this.gameTick = 0;


    model.addScene("start", ()=> { console.log("enter start scene");
      this.currentTrack = titleTheme;
      if (this.musicEnabled) {
        this.currentTrack.play();
      }
    }, controllerMaps.start );
    model.addScene("gameOver", ()=> { console.log("enter game over scene");
      model.state.playerMoved = false;
      model.state.lastMoveFinished = true;
      model.restart();
      reset();
      this.currentTrack.pause();
      this.currentTrack.currenTime = 0;
    }, controllerMaps.gameOver );
    model.addScene("play", () => { console.log("enter play scene");
      this.currentTrack.pause();
      this.currentTrack.currenTime = 0;
      this.currentTrack = dungeonTheme;
      if (this.musicEnabled) {
        this.currentTrack.play();
      }
      let level1 = model.createLevel();
      model.scenes.play.currentLevel = level1;
      dispatcher.sendMessage({action: "Change Map", payload: [model.scenes.play.currentLevel.map]});
      let playerStart = getRandomAvailable(model.scenes.play.currentLevel.map, model.scenes.play.currentLevel.entities);
      model.state.player = buildPlayer(level1, 5, playerStart); //{index: 28, x: 1, y:1}
      messageLog.reset();
      messageLog.currentStats.hp = model.state.player.hp;
      messageLog.currentStats.maxHp = model.state.player.maxHp;
      messageLog.currentStats.playerLevel = model.state.player.level;
      messageLog.currentStats.weapon = model.state.player.weapon;
      messageLog.currentStats.armor = model.state.player.armor;
      messageLog.currentStats.damageModifier = model.state.player.damageModifier;
      messageLog.currentStats.xp = model.state.player.xp;

      messageLog.currentStats.nextXp = playerXpTable[model.state.player.level];
      messageLog.currentStats.dungeonLevel = level1.baseDifficulty;
      //Model.scenes.play.currentLevel.entities.push({name: 'player', index: playerStart.index, x: playerStart.x * 64, y: playerStart.y * 64, key: 5 });
      //Model.state.player = Model.scenes.play.currentLevel.entities[0];
    }, controllerMaps.play );

    addEventListener("keydown", (event) => {
        dispatcher.sendMessage({action: "Key Press", payload: [event.key]});
    });
    model.changeScene("start");
  },
  run() {
    //might make sense to run update on every frame as well
    if(!model.state.lastMoveFinished){
          this.update(model.state);
    }
    draw(model.state);
    requestAnimationFrame(this.run.bind(this));
  },
  update(state) {
    if(this.state.currentScene.currentLevel.tick !== this.lastTick){
      this.lastTick = this.state.currentScene.currentLevel.tick;
      this.moveMonsters();
      if (this.lastTick % config.generateMonsterTick === 0) {
        //console.log("excuted");
        this.generateMonster();
      }
    }
    if(state.currentScene.name === "play") {
      animateEntityMovement(state);
    }
  },
  movePlayer(key) { //need to make this generic since monsters can move too
    if (!this.state.playerMoved && this.state.lastMoveFinished) {

      //check the new position and return a values
      //if value is empty go there
      //if there is something there handle it (stairs, monster, item);

      let targetAtIndex = checkIndex(this.state.player, key);
      let entitiesAtIndex = getEntitiesAtIndex(this.state.currentScene.currentLevel, targetAtIndex.index);
      if(targetAtIndex.target.passible){
        this.state.currentScene.currentLevel.tick++;
        this.gameTick++;
        // console.log("tick", this.state.currentScene.currentLevel.tick, this.gameTick);

        this.state.playerMoved = true;
        this.state.lastMoveFinished = false;
        //console.log(this.state.currentScene.currentLevel.entities, entityAtIndex)
        if (entitiesAtIndex.length > 0) { //need to reqrite this block as this will return an array of entities at an index
          let monsterIndex = null;
          let stairIndex = null;
          let itemIndex = null; //there really shouldn't be more than one of each
          for (let i = 0; i < entitiesAtIndex.length; i++) {
            if(entitiesAtIndex[i].type === "stairs") {
              stairIndex = i;
            } else if(entitiesAtIndex[i].type === "monster") {
              monsterIndex = i;
            } else if(entitiesAtIndex[i].type === "item") {
              itemIndex = i;
            }
          }
          if (monsterIndex !== null) {
            this.attackEntity(this.state.player, entitiesAtIndex[monsterIndex], this.state.currentScene.currentLevel);
          } else if (stairIndex !== null) {
            //MapUtil.moveEntity(this.state.player, key);
            this.useStairs(this.state.player, entitiesAtIndex[stairIndex]);
            dispatcher.sendMessage({action: "Player Moved", payload: [this.state.currentScene]});
          } else if (itemIndex !== null) {
            this.getItem(this.state.player, entitiesAtIndex[itemIndex], this.state.currentScene.currentLevel);
            moveEntity(this.state.player, key);
            dispatcher.sendMessage({action: "Player Moved", payload: [this.state.currentScene]});
          }
        } else {
          moveEntity(this.state.player, key);
          dispatcher.sendMessage({action: "Player Moved", payload: [this.state.currentScene]});
        }

      }

    }
  },
  useStairs(entity, stairs) {
    let currentLevel = this.state.currentScene.currentLevel;
    let nextLevel;
    if(stairs.targetLevel === null){
      nextLevel = model.createLevel(currentLevel, stairs);
    } else {
      nextLevel = model.levels[stairs.targetLevel];
    }
    //  let nextLevel = model.levels[stairs.target];
    entity.index = stairs.targetIndex;
    // need to add a way to delay this so it can be animated...
    nextLevel.entities.push(entity);
    Object.assign(entity, indexTrueToXY(entity.index)); //check
    entity.nextX = entity.x;
    entity.nextY = entity.y;

    //
    let message = "You go ";
    if(stairs.subtype === "stairs up"){ //there are only two types of stairs
      message += "up the stairs"; //to level?
    } else {
      message += "down the stairs";
    }
    messageLog.messages.push(message);
    messageLog.currentStats.dungeonLevel = nextLevel.baseDifficulty;
    this.goToLevel(stairs.targetLevel);
    removeEntityFromLevel(currentLevel, entity);

    dispatcher.sendMessage({action: "Fade-out-in", payload: [true]});
  },
  goToLevel(level) {
    this.state.currentScene.currentLevel = model.levels[level];
    buildEntityMap(this.state.currentScene.currentLevel);
    //console.log(Model);
    dispatcher.sendMessage({action: "Change Map", payload: [this.state.currentScene.currentLevel.map]});
    dispatcher.sendMessage({action: "Player Moved", payload: [this.state.currentScene]});
    //model.scenes.play.level.entitiesMap = model.entitiesMaps[level];
  },
  attackEntity(attacker, defender, level) {
    let damage, verb, aIdentity, dIdentiy; //maybe simplify this by giving all monsters a weapon?

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
      
    }else{
      aIdentity = "The " + attacker.name;
      dIdentiy = "you";
      
    }

    let message = `${aIdentity} ${verb} ${dIdentiy}`; //` for ${damage} bringing ${posAdj} hp to ${defender.hp}`;
    //console.log(`${aIdentity} ${verb} ${dIdentiy} for ${damage} bringing ${posAdj} hp to ${defender.hp}`);
    messageLog.messages.push(message);
    if(defender.type === "player"){
      messageLog.currentStats.hp = defender.hp;
    }
    if(defender.hp <= 0){
      if(defender.name === "black dragon") {
        messageLog.endGame.messages.push({
          text: `You have killed the black dragon spawn`,
           size: 24, x:125, y: 300});
        messageLog.endGame.messages.push({
          text: `saving the world for a generation!`,
          size: 24, x:145, y: 330});
        model.changeScene("gameOver");
      }

        removeEntityFromLevel(level, defender);
        if(attacker.type === "player"){
          attacker.xp += defender.xpVal;
          messageLog.currentStats.xp = attacker.xp;
          //check if player leveled
          this.checkPlayerLevel();
        }
      //}
    }
  },
  moveMonsters() { //randomly
    let entities = this.state.currentScene.currentLevel.entities;
    entities = entities.filter(entity => entity.type === 'monster');
    let direction;
    for(let i = 0; i < entities.length; i++) { // TODO do this only for monsters in viewport
      let currentCoords = indexToXY(entities[i].index);
      let sightPoints = getAllPoints(currentCoords, 5);
      let sightIndices = sightPoints.filter((p) => {
        p.index = xyToIndex(p); //these should contain their index?
        return p.index === model.state.player.index;
      });
      if(sightIndices.length > 0) {
        //console.log("can see the player");
        direction = getDirectionTowardsPoint(this.state.currentScene.currentLevel, currentCoords, sightIndices[0]);
        //console.log(`direction chosen towards player is:`, direction);
        direction = direction || getValidDirection(this.state.currentScene.currentLevel, entities[i]); //This is a cheat
        //if monster can't pass through wall or two monsters want to occupy the same place in the direction on the player
        //really need a weigthed system so if it's first choice isn't available it'll choose something else
        //but without diagonal movement this isnt really possible.
      } else {
        direction = getValidDirection(this.state.currentScene.currentLevel, entities[i]);
      }
      if (direction) {  //direction check is needed in case monster is surrounded by monsters and cannot move
        if (direction.entities.length > 0) {
          let playerIndex = null;
          for(let i = 0; i < direction.entities.length; i++) {
            if(direction.entities[i].name === "player"){
              playerIndex = i;
            }
          }
          //attack player
          if(playerIndex !== null) {
            this.attackEntity(entities[i], this.state.player, this.state.currentScene.currentLevel);
            if(this.state.player.hp <= 0){
              //add fadeout here as well
              messageLog.endGame.messages.push({
                text: `You were killed by a ${entities[i].name} on level ${this.state.currentScene.currentLevel.baseDifficulty}`,
                 size: 24, x:120, y: 300});
              model.changeScene("gameOver");
              break;
            }
          } else {
            moveEntity(entities[i], direction.key);
          }
        } else {
          moveEntity(entities[i], direction.key);
        }
      }

    }
  },
  checkPlayerLevel() { //in a more robust version monsters could also level but I'll keep this simple
    let player = model.state.player;
    //console.log(player.xp, playerXpTable[player.level]);
    if(player.xp >= playerXpTable[player.level]){
      player.level++;
      player.maxHp += 10;
      player.hp += 10; //we'll assume the player got a full roll, if too hard player.hp = player.maxHp
      player.xp = player.xp - playerXpTable[player.level-1];
      player.damageModifier++;

      messageLog.messages.push(`Nice work! You leveled up! You are level ${player.level}`);
      messageLog.messages.push("You gained 10 hit points and 1 point of damage!");
      messageLog.currentStats.xp = player.xp;
      messageLog.currentStats.hp = player.hp;
      messageLog.currentStats.maxHp = player.maxHp;
      messageLog.currentStats.playerLevel = player.level;
      messageLog.currentStats.nextXp = playerXpTable[player.level];
      //console.log(`player leveled to ${player.level}, hp: ${player.hp}`);
    }
  },
  getItem(entity, item, level) {
    let message;
    let itemProps = item.itemProps;
    if(itemProps.subtype === "weapon" && entity.weapon.threat < itemProps.threat){
      entity.weapon = itemProps;
      message = `You found a ${itemProps.name}!`;
      messageLog.currentStats.weapon = itemProps;
    }
    if(itemProps.subtype === "armor" && entity.armor.threat < itemProps.threat){
      entity.armor = itemProps;
      message = `You found ${itemProps.name}!`;
      messageLog.currentStats.armor = itemProps;
    }
    if(itemProps.subtype === "health"){
      entity.hp += itemProps.heals;
      message = `You ${itemProps.verb} a ${itemProps.name}, you heal ${itemProps.heals} points!`; //should probably have a verb too
      messageLog.currentStats.hp = entity.hp;
    }
    if(message){
      messageLog.messages.push(message);
      //console.log(message);
    }
    removeEntityFromLevel(level, item);
  },
  generateMonster() {
    let viewport = getIndicesInViewport();
    generateMonster(this.state.currentScene.currentLevel, viewport);
  }
};

Game.loadGame();
Game.start();
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYnVuZGxlLmpzIiwic291cmNlcyI6WyIuLi9zcmMvZGlzcGF0Y2hlci5qcyIsIi4uL3NyYy9jb25maWcuanMiLCIuLi9zcmMvY2FudmFzLmpzIiwiLi4vc3JjL3RpbGVzLmpzIiwiLi4vc3JjL3V0aWxpdHkuanMiLCIuLi9zcmMvcm9vbUdlbi5qcyIsIi4uL3NyYy9lbnRpdGllcy5qcyIsIi4uL3NyYy9tYXAtdXRpbC5qcyIsIi4uL3NyYy9tb2RlbC5qcyIsIi4uL3NyYy9jb250cm9sbGVyTWFwcy5qcyIsIi4uL3NyYy9zcHJpdGVzLmpzIiwiLi4vc3JjL21lc3NhZ2VMb2cuanMiLCIuLi9zcmMvZHJhdy5qcyIsIi4uL3NyYy9hdWRpby5qcyIsIi4uL3NyYy9nYW1lLmpzIiwiLi4vc3JjL2luZGV4LmpzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vV2FudCB0byBwYXNzIGFjdGlvbnMgdGhyb3VnaCBhIGRpc3BhdGNoZXIgcmF0aGVyIHRoYW4gdG8gdGhlIG1vZGVsIGRpcmVjdGx5XG5cbmNvbnN0IGRpc3BhdGNoZXIgPSB7XG4gIGxpc3RlbmVyczogW10sXG4gIGFjdGlvbnM6IHt9LFxuICBhZGRMaXN0ZW5lcihsaXN0ZW5lcil7XG4gICAgdGhpcy5saXN0ZW5lcnMucHVzaChsaXN0ZW5lcik7XG4gICAgY29uc29sZS5sb2coZGlzcGF0Y2hlcik7XG4gIH0sXG4gIGFkZEFjdGlvbihsaXN0ZW5lciwgYWN0aW9uKXtcbiAgICAvL2NvbnNvbGUubG9nKGFjdGlvbi50cmlnZ2VyKTtcbiAgICBsaXN0ZW5lci5hY3Rpb25zID0gbGlzdGVuZXIuYWN0aW9ucyB8fCB7fTtcbiAgICBsaXN0ZW5lci5hY3Rpb25zW2FjdGlvbi5uYW1lXSA9IGFjdGlvbi50cmlnZ2VyO1xuICAgIGNvbnNvbGUubG9nKGxpc3RlbmVyKTtcbiAgfSxcbiAgc2VuZE1lc3NhZ2UobWVzc2FnZSl7XG4gICAgLy9zY29uc29sZS5sb2coXCJyZWNlaXZlZCBtZXNzYWdlOlwiLCBtZXNzYWdlKTtcbiAgICBmb3IobGV0IGkgPSAwOyBpIDwgdGhpcy5saXN0ZW5lcnMubGVuZ3RoOyBpKyspe1xuICAgICAgbGV0IGxpc3RlbmVyID0gdGhpcy5saXN0ZW5lcnNbaV07XG4gICAgICAvL2ZvcihsZXQgYWN0aW9uIGluIGxpc3RlbmVyLmFjdGlvbnMpe1xuICAgICAgICBpZihsaXN0ZW5lci5hY3Rpb25zLmhhc093blByb3BlcnR5KG1lc3NhZ2UuYWN0aW9uKSl7XG4gICAgICAgICAgLy9jb25zb2xlLmxvZyhhY3Rpb24pO1xuICAgICAgICAgIGxpc3RlbmVyLmFjdGlvbnNbbWVzc2FnZS5hY3Rpb25dKC4uLm1lc3NhZ2UucGF5bG9hZCk7XG4gICAgICAgIH1cbiAgICAgIC8vfVxuICAgIH1cbiAgfVxufTtcblxuLy8gTm90IGVudGlyZWx5IHN1cmUgaWYgSSdtIGhhcHB5IHdpdGggdGhpcyBpbXBsZW1lbnRhdGlvbiBidXQgSSB3YW50ZWQgdG8gc2VlXG4vLyB3aGF0IEkgY291bGQgZG8gd2l0aG91dCBsb29raW5nIHVwIGFueSBwYXR0ZXJucy4gU2VlbXMgdG8gYmUgd29ya2luZyBhdCB0aGVcbi8vIG1vbWVudCBzbyBsZXQncyBzZWUgaG93IGl0IGdvZXMuXG5leHBvcnQgZGVmYXVsdCBkaXNwYXRjaGVyO1xuIiwiaW1wb3J0IERpc3BhdGNoZXIgZnJvbSBcIi4vZGlzcGF0Y2hlclwiO1xuXG5jb25zdCBjb25maWcgPSB7XG4gIGNhbnZhc0hlaWdodDogNzc2LFxuICBjYW52YXNXaWR0aDogNTc2LFxuICBtb3ZlQW5pU3BlZWQ6IDgsXG4gIHRpbGVTaXplOiA2NCxcbiAgY3VycmVudE1hcDogbnVsbCxcbiAgbWFwQ29sczogMCxcbiAgbWFwUm93czogMCxcbiAgcm93c1RvU2hvdzogNCwgLy9UaGVyZSBzaG91bGQgcHJvYmFibHkgYWxzbyBiZSBhIGNvbHNUb1Nob3cgaW4gY2F1c2UgSSB3YW50IHRvIGRpc3BsYXkgYSBub24tc3F1YXJlIHBsYXkgYXJlYVxuICBtYXhPZmZzZXRYOiAwLFxuICBtYXhPZmZzZXRZOiAwLFxuICBtaW5pbXVtTW9uc3RlcnM6IDMsXG4gIG1heGltdW1Nb25zdGVyczogMTIsXG4gIGdlbmVyYXRlTW9uc3RlclRpY2s6IDIwLFxuICBzZXRNYXhPZmZzZXRYKCl7XG4gICAgdGhpcy5tYXhPZmZzZXRYID0gdGhpcy5tYXBDb2xzIC0gMSAtIHRoaXMucm93c1RvU2hvdztcbiAgfSxcbiAgc2V0TWF4T2Zmc2V0WSgpe1xuICAgIHRoaXMubWF4T2Zmc2V0WSA9IHRoaXMubWFwUm93cyAtIDEgLSB0aGlzLnJvd3NUb1Nob3c7XG4gIH0sXG4gIGNoYW5nZU1hcChuZXdNYXApe1xuICAgIHRoaXMuY3VycmVudE1hcCA9IG5ld01hcDtcbiAgICB0aGlzLm1hcENvbHMgPSBuZXdNYXAubWFwQ29scztcbiAgICB0aGlzLnNldE1heE9mZnNldFgoKTtcbiAgICB0aGlzLm1hcFJvd3MgPSBuZXdNYXAubWFwUm93cztcbiAgICB0aGlzLnNldE1heE9mZnNldFkoKTtcbiAgfVxufTtcbmV4cG9ydCBkZWZhdWx0IGNvbmZpZztcblxuRGlzcGF0Y2hlci5hZGRMaXN0ZW5lcihjb25maWcpO1xuRGlzcGF0Y2hlci5hZGRBY3Rpb24oY29uZmlnLCB7bmFtZTogXCJDaGFuZ2UgTWFwXCIsIHRyaWdnZXI6IGNvbmZpZy5jaGFuZ2VNYXAuYmluZChjb25maWcpfSk7XG4iLCJpbXBvcnQgQ29uZmlnIGZyb20gXCIuL2NvbmZpZ1wiO1xuXG5jb25zdCBjYW52YXMgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdjYW52YXMnKTtcbmV4cG9ydCBjb25zdCBjdHggPSBjYW52YXMuZ2V0Q29udGV4dCgnMmQnKTtcbmNhbnZhcy5oZWlnaHQgPSBDb25maWcuY2FudmFzSGVpZ2h0O1xuY2FudmFzLndpZHRoID0gQ29uZmlnLmNhbnZhc1dpZHRoO1xuY2FudmFzLnN0eWxlID0gXCJib3JkZXI6IDFweCBzb2xpZCBibGFja1wiO1xuXG4vLyBjdHgud2Via2l0SW1hZ2VTbW9vdGhpbmdFbmFibGVkID0gZmFsc2U7XG4vLyBjdHgubW96SW1hZ2VTbW9vdGhpbmdFbmFibGVkID0gZmFsc2U7XG4vLyBjdHguaW1hZ2VTbW9vdGhpbmdFbmFibGVkID0gZmFsc2U7XG5cbmV4cG9ydCBjb25zdCBhdHRhY2hDYW52YXMgPSAoZWxlbWVudCkgPT4ge1xuICBlbGVtZW50LmFwcGVuZENoaWxkKGNhbnZhcyk7XG59O1xuIiwiZXhwb3J0IGNvbnN0IHRpbGVEaWN0aW9uYXJ5ID0ge1xuICAwOiB7cGFzc2libGU6IHRydWUsIHR5cGU6IFwiZmxvb3JcIn0sXG4gIDE6IHtwYXNzaWJsZTogdHJ1ZSwgdHlwZTogXCJmbG9vclwifSxcbiAgMjoge3Bhc3NpYmxlOiB0cnVlLCB0eXBlOiBcImZsb29yXCJ9LFxuICAzOiB7cGFzc2libGU6IGZhbHNlLCB0eXBlOiBcIndhbGxcIn0sXG4gIDQ6IHtwYXNzaWJsZTogZmFsc2UsIHR5cGU6IFwid2FsbFwifSxcbiAgNToge3Bhc3NpYmxlOiBmYWxzZSwgdHlwZTogXCJwbGF5ZXJcIn0sXG4gIDY6IHtwYXNzaWJsZTogdHJ1ZSwgdHlwZTogXCJzdGFpcnNcIiwgc3VidHlwZTogXCJzdGFpcnMgdXBcIn0sXG4gIDc6IHtwYXNzaWJsZTogdHJ1ZSwgdHlwZTogXCJzdGFpcnNcIiwgc3VidHlwZTogXCJzdGFpcnMgZG93blwifSxcbiAgODoge3Bhc3NpYmxlOiBmYWxzZSwgdHlwZTogXCJtb25zdGVyXCJ9LFxuICA5OiB7cGFzc2libGU6IGZhbHNlLCB0eXBlOiBcIm1vbnN0ZXJcIn0sXG4gIDEwOiB7cGFzc2libGU6IGZhbHNlLCB0eXBlOiBcIm1vbnN0ZXJcIn0sXG4gIDExOiB7cGFzc2libGU6IGZhbHNlLCB0eXBlOiBcIm1vbnN0ZXJcIn0sXG4gIDEyOiB7cGFzc2libGU6IGZhbHNlLCB0eXBlOiBcIm1vbnN0ZXJcIn0sXG4gIDEzOiB7cGFzc2libGU6IGZhbHNlLCB0eXBlOiBcIm1vbnN0ZXJcIn0sXG4gIDE0OiB7cGFzc2libGU6IGZhbHNlLCB0eXBlOiBcIm1vbnN0ZXJcIn0sXG4gIDE1OiB7cGFzc2libGU6IGZhbHNlLCB0eXBlOiBcIm1vbnN0ZXJcIn0sXG4gIDE2OiB7cGFzc2libGU6IHRydWUsIHR5cGU6IFwiaXRlbVwifSxcbiAgMTc6IHtwYXNzaWJsZTogdHJ1ZSwgdHlwZTogXCJpdGVtXCJ9LFxuICAxODoge3Bhc3NpYmxlOiB0cnVlLCB0eXBlOiBcIml0ZW1cIn0sXG4gIDE5OiB7cGFzc2libGU6IHRydWUsIHR5cGU6IFwiaXRlbVwifSxcbiAgMjA6IHtwYXNzaWJsZTogdHJ1ZSwgdHlwZTogXCJpdGVtXCJ9LFxuICAyMToge3Bhc3NpYmxlOiB0cnVlLCB0eXBlOiBcIml0ZW1cIn0sXG4gIDIyOiB7cGFzc2libGU6IHRydWUsIHR5cGU6IFwiaXRlbVwifSxcbiAgMjM6IHtwYXNzaWJsZTogdHJ1ZSwgdHlwZTogXCJpdGVtXCJ9LFxuICAyNDoge3Bhc3NpYmxlOiB0cnVlLCB0eXBlOiBcIml0ZW1cIn0sXG4gIDI1OiB7cGFzc2libGU6IHRydWUsIHR5cGU6IFwiaXRlbVwifSxcbiAgMjY6IHtwYXNzaWJsZTogdHJ1ZSwgdHlwZTogXCJpdGVtXCJ9LFxuICAyNzoge3Bhc3NpYmxlOiB0cnVlLCB0eXBlOiBcIml0ZW1cIn0sXG4gIDI4OiB7cGFzc2libGU6IHRydWUsIHR5cGU6IFwiaXRlbVwifSxcbiAgMjk6IHtwYXNzaWJsZTogdHJ1ZSwgdHlwZTogXCJpdGVtXCJ9LFxufTtcblxuZXhwb3J0IGNvbnN0IG1vbnN0ZXJEaWN0aW9uYXJ5ID0ge1xuICA4OiB7IG5hbWU6XCJnaWFudCByYXRcIiwgc3VidHlwZTpcImFuaW1hbFwiLCBocDogWzEsM10sIHdlYXBvbjogeyBkYW1hZ2U6IFsxLDJdLCB2ZXJiOiBcImJpdGVzXCIgfSwgeHBWYWw6IDUwLCBkYW1hZ2VNb2RpZmllcjogMCwgYXJtb3I6IHsgcHJvdGVjdGlvbjogMCB9LCB0aHJlYXQ6IDEgfSxcbiAgOTogeyBuYW1lOlwiZ3JlZW4gc2xpbWVcIiwgc3VidHlwZTpcIm9vemVcIiwgaHA6IFsxLDRdLCB3ZWFwb246IHsgZGFtYWdlOiBbMSwzXSwgdmVyYjogXCJzcGxhc2hlc1wiIH0sIHhwVmFsOiA3NSwgZGFtYWdlTW9kaWZpZXI6IDAsIGFybW9yOiB7IHByb3RlY3Rpb246IDAgfSwgdGhyZWF0OiAxIH0sXG4gIDEwOiB7IG5hbWU6XCJ3aWxkIGRvZ1wiLCBzdWJ0eXBlOlwiYW5pbWFsXCIsIGhwOiBbMSw2XSwgd2VhcG9uOiB7IGRhbWFnZTogWzEsNl0sIHZlcmI6IFwiYml0ZXNcIiB9LCB4cFZhbDogODAsIGRhbWFnZU1vZGlmaWVyOiAwLCBhcm1vcjogeyBwcm90ZWN0aW9uOiAwIH0sIHRocmVhdDogMiB9LFxuICAxMTogeyBuYW1lOlwiZ29ibGluXCIsIHN1YnR5cGU6XCJnb2JsaW5cIiwgaHA6IFsxLDZdLCB3ZWFwb246IHsgZGFtYWdlOiBbMSw2XSwgdmVyYjogXCJjbGF3c1wiIH0sIHhwVmFsOiAxMjAsIGRhbWFnZU1vZGlmaWVyOiAwLCBhcm1vcjogeyBwcm90ZWN0aW9uOiAxIH0sIHRocmVhdDogMyB9LFxuICAxMjogeyBuYW1lOlwia29ibGRcIiwgc3VidHlwZTpcImdvYmxpblwiLCBocDogWzIsNF0sIHdlYXBvbjogeyBkYW1hZ2U6IFsxLDZdLCB2ZXJiOiBcInN0YWJzXCIgfSwgeHBWYWw6IDE1MCwgZGFtYWdlTW9kaWZpZXI6IDEsIGFybW9yOiB7IHByb3RlY3Rpb246IDAgfSwgdGhyZWF0OiA0IH0sXG4gIDEzOiB7IG5hbWU6XCJvcmNcIiwgc3VidHlwZTpcImdvYmxpblwiLCBocDogWzIsNl0sIHdlYXBvbjogeyBkYW1hZ2U6IFsxLDZdLCB2ZXJiOiBcInNtYWNrc1wiIH0sIHhwVmFsOiAxNzUsIGRhbWFnZU1vZGlmaWVyOiAxLCBhcm1vcjogeyBwcm90ZWN0aW9uOiAxIH0sIHRocmVhdDogNSB9LFxuICAxNDogeyBuYW1lOlwic2tlbGV0b25cIiwgc3VidHlwZTpcInVuZGVhZFwiLCBocDogWzIsOF0sIHdlYXBvbjogeyBkYW1hZ2U6IFsxLDhdLCB2ZXJiOiBcInNsYXNoZXNcIiB9LCB4cFZhbDogMjUwLCBkYW1hZ2VNb2RpZmllcjogMiwgYXJtb3I6IHsgcHJvdGVjdGlvbjogMSB9LCB0aHJlYXQ6IDYgfSxcbiAgMTU6IHsgbmFtZTpcImJsYWNrIGRyYWdvblwiLCBzdWJ0eXBlOlwiZHJhZ29uXCIsIGhwOiBbMywxMF0sIHdlYXBvbjogeyBkYW1hZ2U6IFsxLDEwXSwgdmVyYjogXCJiYXNoZXNcIiB9LCB4cFZhbDogNDUwLCBkYW1hZ2VNb2RpZmllcjogNCwgYXJtb3I6IHsgcHJvdGVjdGlvbjogNCB9LCB0aHJlYXQ6IEluZmluaXR5IH1cbn07XG5cbmV4cG9ydCBjb25zdCBpdGVtRGljdGlvbmFyeSA9IHsvLyB0aHJlYXQgc2hvdWxkIGJlIHRocmVzaG9sZFxuICAxNjoge25hbWU6IFwiZGFnZ2VyXCIsIHR5cGU6XCJ3ZWFwb25cIiwgc3VidHlwZTogXCJ3ZWFwb25cIiwgZGFtYWdlOiBbMSw2XSwgdmVyYjogXCJzdGFiXCIsIHRocmVhdDogMX0sXG4gIDE3OiB7bmFtZTogXCJzaG9ydCBzd29yZFwiLCB0eXBlOlwid2VhcG9uXCIsIHN1YnR5cGU6IFwid2VhcG9uXCIsIGRhbWFnZTogWzEsOF0sIHZlcmI6IFwic2xhc2hcIiwgdGhyZWF0OiAzfSxcbiAgMTg6IHtuYW1lOiBcImRhcmsgc3dvcmRcIiwgdHlwZTpcIndlYXBvblwiLCBzdWJ0eXBlOiBcIndlYXBvblwiLCBkYW1hZ2U6IFsxLDEwXSwgdmVyYjogXCJzbGFzaFwiLCB0aHJlYXQ6IDV9LFxuICAxOToge25hbWU6IFwiZW1lcmFsZCBtYWNlXCIsIHR5cGU6XCJ3ZWFwb25cIiwgc3VidHlwZTogXCJ3ZWFwb25cIiwgZGFtYWdlOiBbMiw2XSwgdmVyYjogXCJiYXNoXCIsIHRocmVhdDogNn0sXG4gIDIwOiB7bmFtZTogXCJydWJ5IGF4ZVwiLCB0eXBlOlwid2VhcG9uXCIsIHN1YnR5cGU6IFwid2VhcG9uXCIsIGRhbWFnZTogWzIsOF0sIHZlcmI6IFwiaGFja1wiLCB0aHJlYXQ6IDh9LFxuICAyNDoge25hbWU6IFwibGVhdGhlciBhcm1vclwiLCBzdWJ0eXBlOiBcImFybW9yXCIsIHByb3RlY3Rpb246IDEsIHRocmVhdDogMX0sXG4gIDI1OiB7bmFtZTogXCJjaGFpbiBhcm1vclwiLCBzdWJ0eXBlOiBcImFybW9yXCIsIHByb3RlY3Rpb246IDIsIHRocmVhdDogM30sXG4gIDI2OiB7bmFtZTogXCJzY2FsZSBhcm1vclwiLCBzdWJ0eXBlOiBcImFybW9yXCIsIHByb3RlY3Rpb246IDMsIHRocmVhdDogNX0sXG4gIDI3OiB7bmFtZTogXCJwbGF0ZSBhcm1vclwiLCBzdWJ0eXBlOiBcImFybW9yXCIsIHByb3RlY3Rpb246IDQsIHRocmVhdDogN30sXG4gIDI4OiB7bmFtZTogXCJzdGFyIGFybW9yXCIsIHN1YnR5cGU6IFwiYXJtb3JcIiwgcHJvdGVjdGlvbjogNSwgdGhyZWF0OiA5fSxcbiAgMjE6IHtuYW1lOiBcImZyZXNoIGFwcGxlXCIsIHN1YnR5cGU6IFwiaGVhbHRoXCIsIHZlcmI6IFwiZWF0XCIsIGhlYWxzOiAxLCB0aHJlYXQ6IDF9LFxuICAyMjoge25hbWU6IFwiYnJlYWQgcm9sbFwiLCBzdWJ0eXBlOiBcImhlYWx0aFwiLCB2ZXJiOiBcImVhdFwiLCBoZWFsczogMiwgdGhyZWF0OiAyfSxcbiAgMjM6IHtuYW1lOiBcImhvbGlkYXkgaGFtXCIsIHN1YnR5cGU6IFwiaGVhbHRoXCIsIHZlcmI6IFwiZWF0XCIsIGhlYWxzOiA0LCB0aHJlYXQ6IDV9LFxuICAyOToge25hbWU6IFwiaGVhbHRoIHBvdGlvblwiLCBzdWJ0eXBlOiBcImhlYWx0aFwiLCB2ZXJiOiBcImRyaW5rXCIsIGhlYWxzOiAxMCwgdGhyZWF0OiA5fSxcbn07XG4iLCJleHBvcnQgY29uc3Qgcm9sbERpY2UgPSAoZGljZVRvUm9sbCwgbnVtT2ZTaWRlcykgPT4ge1xuICBsZXQgdG90YWwgPSAwO1xuICBmb3IobGV0IGkgPSAwOyBpPGRpY2VUb1JvbGw7IGkrKyl7XG4gICAgdG90YWwgKz0gTWF0aC5jZWlsKE1hdGgucmFuZG9tKCkqbnVtT2ZTaWRlcyk7XG4gIH1cbiAgcmV0dXJuIHRvdGFsO1xufTtcblxuZXhwb3J0IGNvbnN0IGZ1bGxEaWNlID0gKGRpY2VUb1JvbGwsIG51bU9mU2lkZXMpID0+IHtcbiAgcmV0dXJuIGRpY2VUb1JvbGwgKiBudW1PZlNpZGVzO1xufVxuXG5leHBvcnQgY29uc3QgZmlyc3REaWVGdWxsID0gKGRpY2VUb1JvbGwsIG51bU9mU2lkZXMpID0+IHtcbiAgcmV0dXJuIGZ1bGxEaWNlKDEsIG51bU9mU2lkZXMpICsgcm9sbERpY2UoZGljZVRvUm9sbC0xLCBudW1PZlNpZGVzKTtcbn1cblxuLy8gYnJlYWsgdGhpcyBpbnRvIHR3byBmaWxlcyBkaWNlIGFuZCB0cnVlIHVsdGl0aWVzXG5leHBvcnQgY29uc3QgZ2V0UmFuZG9tQXJyYXlJbmRleCA9IChhcnJheSkgPT4geyAvL2Zvcm1lcmx5OiBnZXRSYW5kb21JbkFycmF5XG4gIHJldHVybiBNYXRoLmZsb29yKE1hdGgucmFuZG9tKCkgKiBhcnJheS5sZW5ndGgpO1xufVxuZXhwb3J0IGNvbnN0IGdldFJhbmRvbUluQXJyYXkgPSAoYXJyYXkpID0+IHtcbiAgcmV0dXJuIGFycmF5W2dldFJhbmRvbUFycmF5SW5kZXgoYXJyYXkpXTtcbn1cblxuZXhwb3J0IGNvbnN0IGdldE51bUluUmFuZ2UgPSAobG93LCBoaWdoKSA9PiB7IC8vaW5jbHVzaXZlIC8vZm9ybWVybHk6IGdldFBvaW50QmV0d2VlblxuICByZXR1cm4gTWF0aC5mbG9vcihNYXRoLnJhbmRvbSgpICogKGhpZ2ggLSBsb3cgKyAxKSArIGxvdyk7XG59XG4iLCJpbXBvcnQgeyB0aWxlRGljdGlvbmFyeSB9IGZyb20gXCIuL3RpbGVzXCI7XG5cbmxldCBnZW5lcmF0ZWRSb29tcyA9IFtdO1xubGV0IG5vZGVMaXN0ID0ge307XG5cblxuXG5leHBvcnQgZnVuY3Rpb24gYnVpbGRNYXAoY29scywgcm93cywgdGlsZXMpIHtcbiAgZ2VuZXJhdGVkUm9vbXMgPSBbXTtcbiAgbm9kZUxpc3QgPSB7fTtcbiAgbGV0IG1hcEJhc2UgPSBBcnJheShjb2xzICogcm93cykuZmlsbCgxKTtcbiAgcG9wdWxhdGVNYXAobWFwQmFzZSwgY29scywgcm93cyk7XG4gIHJlcGxhY2VUaWxlcyhtYXBCYXNlLCB0aWxlcyk7XG4gIHJldHVybiB7bWFwQ29sczogY29scywgbWFwUm93czogcm93cywgaXNCRzogdHJ1ZSwgZ3JpZDogbWFwQmFzZSB9OyAvL3JlZmFjdG9yIGhlcmUgYW5kIGluIG90aGVyIHBsYWNlcyBub3cgdGhhdCBtYXAgaXMgYmVpbmcgZ2VuZXJhdGVkO1xufVxuXG5cbmZ1bmN0aW9uIHBvcHVsYXRlTWFwKGFycmF5LCBjb2xzLCByb3dzKSB7XG4gIGxldCByb29tc0dlbmVyYXRlZCA9IDA7XG4gIGxldCB0cmllcyA9IDA7XG4gIHdoaWxlICgocm9vbXNHZW5lcmF0ZWQgPCA3ICYmIHRyaWVzIDwgMzAwKSB8fCB0cmllcyA+IDMwMCkge1xuICAgIHRyaWVzKys7XG4gICAgbGV0IHJvb20gPSBnZW5lcmF0ZVJvb20oYXJyYXksIGNvbHMsIHJvd3MpO1xuICAgIGlmIChyb29tKSB7XG4gICAgICByb29tLmlkID0gcm9vbXNHZW5lcmF0ZWQ7XG4gICAgICBnZW5lcmF0ZWRSb29tc1tyb29tc0dlbmVyYXRlZF0gPSByb29tO1xuICAgICAgbm9kZUxpc3Rbcm9vbS5pZF0gPSBbcm9vbV07XG4gICAgICByb29tLm5vZGUgPSByb29tLmlkO1xuICAgICAgcm9vbXNHZW5lcmF0ZWQrKztcbiAgICB9XG4gIH1cbiAgY29ubmVjdFJvb21zKGFycmF5LCBjb2xzLCByb3dzLCBnZW5lcmF0ZWRSb29tcyk7XG59XG5cbmZ1bmN0aW9uIGRyYXdSb29tKGFycmF5LCBjb2xzLCByb29tKXtcbiAgZm9yKGxldCBpID0gcm9vbS50b3BMZWZ0Lng7IGkgPD0gcm9vbS5ib3R0b21SaWdodC54OyBpKyspIHtcbiAgICBmb3IobGV0IGogPSByb29tLnRvcExlZnQueTsgaiA8PSByb29tLmJvdHRvbVJpZ2h0Lnk7IGorKykge1xuICAgICAgYXJyYXlbaSArIChqICogY29scyldID0gMDtcbiAgICB9XG4gIH1cbn1cblxuZnVuY3Rpb24gcmVwbGFjZVRpbGVzKGJhc2VNYXAsIHRpbGVzKSB7XG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCBiYXNlTWFwLmxlbmd0aDsgaSsrKSB7XG4gICAgICBsZXQgcmFuZG9tID0gZ2V0UmFuZG9tSW5BcnJheSh0aWxlc1tiYXNlTWFwW2ldXSlcbiAgICAgIGJhc2VNYXBbaV0gPSB0aWxlc1tiYXNlTWFwW2ldXVtyYW5kb21dO1xuICAgIH1cbn1cblxuZnVuY3Rpb24gZ2V0UmFuZG9tSW5BcnJheShhcnJheSl7XG4gIHJldHVybiBNYXRoLmZsb29yKE1hdGgucmFuZG9tKCkgKiBhcnJheS5sZW5ndGgpO1xufVxuXG5mdW5jdGlvbiBnZXRFbXB0eUluZGV4KG1hcCl7XG4gIGxldCBlbXB0aWVzID0gW107XG4gIGZvciAobGV0IGkgPSAwOyBpIDwgbWFwLmxlbmd0aDsgaSsrKSB7XG4gICAgbGV0IHRpbGUgPSBtYXBbaV07XG4gICAgaWYodGlsZURpY3Rpb25hcnlbdGlsZV0udHlwZSA9PT0gXCJmbG9vclwiKSB7XG4gICAgICBlbXB0aWVzLnB1c2goaSk7XG4gICAgfSAvL29yIHBhc3NpYmxlP1xuICB9XG4gIHJldHVybiBlbXB0aWVzO1xufVxuIC8vc2hvdWxkIHRha2UgYW4gYXJyYXkgb2YgZW50aXRpZXMgYW5kIGZpbHRlciBhZ2FpbnN0IHRoZWlyIGluZGljZXNcbmV4cG9ydCBmdW5jdGlvbiBnZXRSYW5kb21BdmFpbGFibGUobWFwLCBlbnRpdGllcywgdmlld3BvcnQpe1xuICBsZXQgZW1wdGllcyA9IGdldEVtcHR5SW5kZXgobWFwLmdyaWQpO1xuICBpZiAodmlld3BvcnQpIHtcbiAgICBlbXB0aWVzID0gZW1wdGllcy5maWx0ZXIodmFsID0+ICF2aWV3cG9ydC5pbmNsdWRlcyh2YWwpKTtcblxuICB9XG4gIGlmIChlbnRpdGllcykge1xuICAgIGVtcHRpZXMgPSBlbXB0aWVzLmZpbHRlcih2YWwgPT4ge1xuICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBlbnRpdGllcy5sZW5ndGg7IGkrKykge1xuICAgICAgICBpZihlbnRpdGllc1tpXS5pbmRleCA9PT0gdmFsKXtcbiAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgcmV0dXJuIHRydWU7XG4gICAgfSk7XG4gIH1cbiAgbGV0IGluZGV4ID0gZW1wdGllc1tnZXRSYW5kb21JbkFycmF5KGVtcHRpZXMpXTtcbiAgbGV0IHh5ID0gaW5kZXhUb1hZKGluZGV4LCBtYXAubWFwQ29scyk7XG4gIHJldHVybiBPYmplY3QuYXNzaWduKHtpbmRleH0sIHh5KTtcbn1cblxuZnVuY3Rpb24gZ2VuZXJhdGVSb29tKGFycmF5LCBjb2xzLCByb3dzKXtcbiAgbGV0IG1pbldpZHRoID0gMztcbiAgbGV0IG1pbkhlaWdodCA9IDM7XG4gIGxldCBtYXhXaWR0aCA9IE1hdGguY2VpbChjb2xzIC8gNik7XG4gIGxldCBtYXhIZWlnaHQgPSBNYXRoLmNlaWwocm93cyAvIDYpO1xuICBsZXQgcm9vbVdpZHRoID0gTWF0aC5jZWlsKE1hdGgucmFuZG9tKCkgKiBtYXhXaWR0aCkgKyBtaW5XaWR0aDtcbiAgbGV0IHJvb21IZWlnaHQgPSBNYXRoLmNlaWwoTWF0aC5yYW5kb20oKSAqIG1heEhlaWdodCkgKyBtaW5IZWlnaHQ7XG4gIGxldCBtaW5EaXN0QXBwYXJ0ID0gMjtcblxuICBsZXQgcm9vbVN0YXJ0ID0gZ2V0Um9vbVN0YXJ0KGFycmF5LCBjb2xzLCByb3dzLCByb29tV2lkdGgsIHJvb21IZWlnaHQpO1xuICBsZXQgcm9vbUVuZCA9IHJvb21TdGFydCArIHJvb21XaWR0aDtcbiAgbGV0IHN1Y2Nlc3MgPSB0cnVlO1xuICBsZXQgdmFsaWRJbmRpY2llcyA9IFtdO1xuICBsZXQgbGFzdEluZGV4O1xuICBmb3IobGV0IGkgPSAwOyBpIDwgcm9vbVdpZHRoOyBpKyspe1xuICAgIGZvcihsZXQgaiA9IDA7IGogPCByb29tSGVpZ2h0OyBqKyspe1xuICAgICAgbGV0IGluZGV4ID0gcm9vbVN0YXJ0ICsgaSArIChqICogY29scyk7XG4gICAgICBpZihhcnJheVtpbmRleF0gPT09IDEpIHtcbiAgICAgICAgaWYoaSA9PT0gMCAmJiBhcnJheVtpbmRleC1taW5EaXN0QXBwYXJ0XSAhPT0gMSkgeyAvL2xlZnQgcm93IGRvd24gdG91Y2hpbmdcbiAgICAgICAgICBzdWNjZXNzID0gZmFsc2U7XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIH0gZWxzZSBpZiAoaSA9PT0gcm9vbVdpZHRoIC0gMSAmJiBhcnJheVtpbmRleCttaW5EaXN0QXBwYXJ0XSAhPT0gMSkgeyAvL3JpZ2h0IHJvdyBkb3duIHRvdWNoaW5nXG4gICAgICAgICAgc3VjY2VzcyA9IGZhbHNlO1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICB9ICBlbHNlIGlmIChqID09PSAwICYmIGFycmF5WyhpbmRleCAtIChjb2xzICogbWluRGlzdEFwcGFydCkpXSAhPT0gMSkgeyAvL3RvcCByb3cgdG91Y2hpbmdcbiAgICAgICAgICBzdWNjZXNzID0gZmFsc2U7XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIH0gIGVsc2UgaWYgKGogPT09IHJvb21IZWlnaHQgLSAxICYmIGFycmF5WyhpbmRleCArIChjb2xzICogbWluRGlzdEFwcGFydCkpXSAhPT0gMSkgeyAvL2JvdHRvbSByb3cgdG91Y2hpbmdcbiAgICAgICAgICBzdWNjZXNzID0gZmFsc2U7XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIH1cbiAgICAgICAgdmFsaWRJbmRpY2llcy5wdXNoKGluZGV4KTtcbiAgICAgICAgbGFzdEluZGV4ID0gaW5kZXg7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBzdWNjZXNzID0gZmFsc2U7XG4gICAgICAgIGJyZWFrO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIGlmIChzdWNjZXNzKSB7XG4gICAgZm9yKGxldCBpID0gMDsgaSA8IHZhbGlkSW5kaWNpZXMubGVuZ3RoOyBpKyspe1xuICAgICAgYXJyYXlbdmFsaWRJbmRpY2llc1tpXV0gPSAwO1xuICAgIH1cbiAgICByZXR1cm4ge3RvcExlZnQ6IGluZGV4VG9YWShyb29tU3RhcnQsIGNvbHMpLCBib3R0b21SaWdodDogaW5kZXhUb1hZKGxhc3RJbmRleCwgY29scyl9O1xuICB9ZWxzZXtcbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cbn1cblxuY29uc3QgaW5kZXhUb1hZID0gKGluZGV4LCBjb2xzKSA9PiB7XG4gIGxldCB4ID0gaW5kZXggJSBjb2xzO1xuICBsZXQgeSA9IE1hdGguZmxvb3IoaW5kZXggLyBjb2xzKTtcbiAgcmV0dXJuIHsgeCwgeSB9O1xufTtcblxuZnVuY3Rpb24gZ2V0Um9vbVN0YXJ0KGFycmF5LCBjb2xzLCByb3dzLCByb29tV2lkdGgsIHJvb21IZWlnaHQpIHtcbiAgbGV0IHN0YXJ0ID0gbnVsbDtcbiAgbGV0IGZvdW5kU3RhcnQgPSBmYWxzZTtcbiAgbGV0IHRyaWVzID0gMDtcbiAgd2hpbGUgKCFmb3VuZFN0YXJ0KSB7XG4gICAgbGV0IGluZGV4ID0gTWF0aC5mbG9vcihNYXRoLnJhbmRvbSgpICogYXJyYXkubGVuZ3RoKTtcbiAgICBsZXQgY29vcmRzID0gaW5kZXhUb1hZKGluZGV4LCBjb2xzKTtcblxuICAgIC8vIG1ha2VzIHN1cmUgcm9vbSBkb2Vzbid0IHN0YXJ0IG9yIGVuZCBvbiBtYXAgZWRnZVxuICAgIGlmICggY29vcmRzLnggKyByb29tV2lkdGggPCBjb2xzIC0gMSAmJiBjb29yZHMueSArIHJvb21IZWlnaHQgPCByb3dzIC0gMVxuICAgICAgJiYgY29vcmRzLnggPiAwICYmIGNvb3Jkcy55ID4gMCkge1xuICAgICAgZm91bmRTdGFydCA9IHRydWU7XG4gICAgICBzdGFydCA9IGluZGV4O1xuICAgIH1cbiAgICB0cmllcysrO1xuICAgIGlmICh0cmllcyA+IDIwKSB7XG4gICAgICBmb3VuZFN0YXJ0ID0gdHJ1ZTsgLy8gb3IgYnJlYWs/XG4gICAgfVxuICB9XG4gIHJldHVybiBzdGFydDtcbn1cblxuY29uc3QgeHlUb0luZGV4ID0gKGNvb3JkcywgY29scykgPT4ge1xuICByZXR1cm4gY29vcmRzLnkgKiBjb2xzICsgY29vcmRzLng7XG59O1xuXG5mdW5jdGlvbiBjb25uZWN0Um9vbXMoYXJyYXksIGNvbHMsIHJvd3MsIHJvb21zKSB7XG4gIGZvciAobGV0IGkgPSAwOyBpIDwgcm9vbXMubGVuZ3RoOyBpKyspIHtcbiAgICBsZXQgcm9vbSA9IHJvb21zW2ldO1xuICAgIGxldCB3aWxsQmVuZCA9IE1hdGgucmFuZG9tKCkgPiAwLjUxO1xuICAgIGxldCBwYXRoRm91bmQgPSBmYWxzZTtcbiAgICBsZXQgdmFsaWRJbmRpY2llcyA9IFtdO1xuICAgIGxldCB0cmllcyA9IDA7XG4gICAgbGV0IHBhdGg7XG5cbiAgICBpZihub2RlTGlzdFtyb29tLm5vZGVdLmxlbmd0aCA8IGdlbmVyYXRlZFJvb21zLmxlbmd0aCl7XG4gICAgICBwYXRoID0gY29ubmVjdFJvb21Ub1Jvb20ocm9vbSwgcm9vbXMuZmlsdGVyKCh4KSA9PiB4Lm5vZGUgIT09IHJvb20ubm9kZSkpO1xuICAgIH1lbHNle1xuICAgICAgcGF0aCA9IGNvbm5lY3RSb29tVG9Sb29tKHJvb20sIHJvb21zLmZpbHRlcigoeCkgPT4geC5pZCAhPT0gcm9vbS5pZCkpO1xuICAgIH1cbiAgICB2YWxpZEluZGljaWVzID0gZ2V0UGF0aEJldHdlZW5Sb29tcyhhcnJheSwgY29scywgcm93cywgcGF0aCk7XG5cbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IHZhbGlkSW5kaWNpZXMubGVuZ3RoOyBpKyspIHtcbiAgICAgIGFycmF5W3ZhbGlkSW5kaWNpZXNbaV1dID0gMDtcbiAgICB9XG4gIH1cbn1cblxuZnVuY3Rpb24gY29ubmVjdFJvb21Ub1Jvb20ocm9vbSwgcm9vbXMpe1xuICBsZXQgcmFuZG9tUm9vbSA9IHJvb21zW01hdGguZmxvb3IoTWF0aC5yYW5kb20oKSAqIHJvb21zLmxlbmd0aCldO1xuXG4gIGxldCBkaXJlY3Rpb24gPSB7eDogMCwgeTogMH07XG4gIGxldCBwb2ludCA9IHt9O1xuICBsZXQgcGFyYWxsZWwgPSB0cnVlO1xuICBsZXQgaW5pdGlhbERpcmVjdGlvbjtcbiAgbGV0IGVuZEF4aXM7XG4gIGlmIChyYW5kb21Sb29tLnRvcExlZnQueCA+IHJvb20uYm90dG9tUmlnaHQueCkgeyAvL1wicmlnaHRcIjtcbiAgICBkaXJlY3Rpb24ueCA9IDE7XG4gICAgcG9pbnQueCA9IHJvb20uYm90dG9tUmlnaHQueDtcbiAgfSBlbHNlIGlmIChyYW5kb21Sb29tLmJvdHRvbVJpZ2h0LnggPCByb29tLnRvcExlZnQueCkgeyAvLyBcImxlZnRcIjtcbiAgICBkaXJlY3Rpb24ueCA9IC0xO1xuICAgIHBvaW50LnggPSByb29tLnRvcExlZnQueDtcbiAgfVxuXG4gIGlmIChyYW5kb21Sb29tLnRvcExlZnQueSA+IHJvb20uYm90dG9tUmlnaHQueSkgeyAvLyBiZWxvd1xuICAgIGRpcmVjdGlvbi55ID0gMTtcbiAgICBwb2ludC55ID0gcm9vbS5ib3R0b21SaWdodC55O1xuICB9IGVsc2UgaWYgKHJhbmRvbVJvb20uYm90dG9tUmlnaHQueSA8IHJvb20udG9wTGVmdC55KSB7IC8vIGFib3ZlXG4gICAgZGlyZWN0aW9uLnkgPSAtMTtcbiAgICBwb2ludC55ID0gcm9vbS50b3BMZWZ0Lnk7XG4gIH1cblxuICAvL3BhcmFsbGVsIG9uIHggYXhpc1xuICBsZXQgcGFyYWxsZWxBeGVzID0gW107XG5cbiAgIC8vbmVlZCB0byBtYWtlIHN1cmUgdGhlIHN0YXJ0aW5nIHBvaW50IGlzIG5vdCBhbHJlYWR5IHVzZWQgb3IgYWRqZWNlbnQgdG8gYW5vdGhlciBjb3JyaWRvci5cbiAgaWYoKGRpcmVjdGlvbi54ID09PSAtMSB8fCBkaXJlY3Rpb24ueCA9PT0gMSkgJiYgZGlyZWN0aW9uLnkgPT09IDApIHtcbiAgICBwYXJhbGxlbEF4ZXMgPSByYW5nZShNYXRoLm1heChyb29tLnRvcExlZnQueSwgcmFuZG9tUm9vbS50b3BMZWZ0LnkpLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIE1hdGgubWluKHJvb20uYm90dG9tUmlnaHQueSwgcmFuZG9tUm9vbS5ib3R0b21SaWdodC55KSk7XG4gICAgcG9pbnQueSA9IHBhcmFsbGVsQXhlc1tNYXRoLmZsb29yKE1hdGgucmFuZG9tKCkqcGFyYWxsZWxBeGVzLmxlbmd0aCldO1xuICAgIGluaXRpYWxEaXJlY3Rpb24gPSBcInhcIjtcbiAgfSAvL3BhcmFsbGVsIG9uIHkgYXhpc1xuICBlbHNlIGlmKChkaXJlY3Rpb24ueSA9PT0gLTEgfHwgZGlyZWN0aW9uLnkgPT09IDEpICYmIGRpcmVjdGlvbi54ID09PSAwKSB7XG4gICAgcGFyYWxsZWxBeGVzID0gcmFuZ2UoTWF0aC5tYXgocm9vbS50b3BMZWZ0LngsIHJhbmRvbVJvb20udG9wTGVmdC54KSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBNYXRoLm1pbihyb29tLmJvdHRvbVJpZ2h0LngsIHJhbmRvbVJvb20uYm90dG9tUmlnaHQueCkpO1xuICAgIHBvaW50LnggPSBwYXJhbGxlbEF4ZXNbTWF0aC5mbG9vcihNYXRoLnJhbmRvbSgpKnBhcmFsbGVsQXhlcy5sZW5ndGgpXTtcbiAgICBpbml0aWFsRGlyZWN0aW9uID0gXCJ5XCI7XG4gIH0gZWxzZSB7IC8vIG5vdCBwYXJhbGxlbFxuICAgIGxldCBzdGFydFBvaW50cyA9IFtdO1xuICAgIGxldCBlbmRQb2ludHMgPSBbXTtcbiAgICBwYXJhbGxlbCA9IGZhbHNlO1xuICAgIGluaXRpYWxEaXJlY3Rpb24gPSBNYXRoLnJhbmRvbSgpIDwgMC41ID8gXCJ4XCIgOiBcInlcIjtcblxuICAgIGlmKGluaXRpYWxEaXJlY3Rpb24gPT09IFwieFwiKXtcbiAgICAgIHN0YXJ0UG9pbnRzID0gcmFuZ2Uocm9vbS50b3BMZWZ0LnksIHJvb20uYm90dG9tUmlnaHQueSk7XG4gICAgICBwb2ludC55ID0gc3RhcnRQb2ludHNbTWF0aC5mbG9vcihNYXRoLnJhbmRvbSgpICogc3RhcnRQb2ludHMubGVuZ3RoKV07XG4gICAgICBlbmRQb2ludHMgPSByYW5nZShyYW5kb21Sb29tLnRvcExlZnQueCwgcmFuZG9tUm9vbS5ib3R0b21SaWdodC54KTtcbiAgICAgIGVuZEF4aXMgPSBlbmRQb2ludHNbTWF0aC5mbG9vcihNYXRoLnJhbmRvbSgpICogZW5kUG9pbnRzLmxlbmd0aCldO1xuXG4gICAgfSBlbHNlIHtcbiAgICAgIHN0YXJ0UG9pbnRzID0gcmFuZ2Uocm9vbS50b3BMZWZ0LngsIHJvb20uYm90dG9tUmlnaHQueCk7XG4gICAgICBwb2ludC54ID0gc3RhcnRQb2ludHNbTWF0aC5mbG9vcihNYXRoLnJhbmRvbSgpICogc3RhcnRQb2ludHMubGVuZ3RoKV07XG4gICAgICBlbmRQb2ludHMgPSByYW5nZShyYW5kb21Sb29tLnRvcExlZnQueSwgcmFuZG9tUm9vbS5ib3R0b21SaWdodC55KTtcbiAgICAgIGVuZEF4aXMgPSBlbmRQb2ludHNbTWF0aC5mbG9vcihNYXRoLnJhbmRvbSgpICogZW5kUG9pbnRzLmxlbmd0aCldO1xuICAgIH1cbiAgfVxuICBtZXJnZU5vZGVzKHJvb20sIHJhbmRvbVJvb20pOyAvL1RoaXMgc2hvdWxkbid0IGJlIGhlcmUsIGl0IHNob3VsZCBoYXBwZW4gYWZ0ZXIgdGhlIHJvb21zIGFyZSBjb25uZWN0ZWQ7XG5cbiAgcmV0dXJuIHsgcG9pbnQsIGRpcmVjdGlvbiwgcGFyYWxsZWwsXG4gICAgaW5pdGlhbERpcmVjdGlvbiwgZW5kQXhpcyxcbiAgICBkZXN0aW5hdGlvbjogcmFuZG9tUm9vbX07XG59XG5cbmZ1bmN0aW9uIG1lcmdlTm9kZXMocm9vbTEsIHJvb20yKXtcbiAgaWYocm9vbTEubm9kZSAhPT0gcm9vbTIubm9kZSl7XG4gICAgbGV0IG9sZE5vZGUgPSByb29tMi5ub2RlO1xuICAgIGZvcihsZXQgaSA9IDA7IGkgPCBub2RlTGlzdFtvbGROb2RlXS5sZW5ndGg7IGkrKyl7XG4gICAgICBub2RlTGlzdFtvbGROb2RlXVtpXS5ub2RlID0gcm9vbTEubm9kZTtcbiAgICB9XG5cbiAgICBub2RlTGlzdFtyb29tMS5ub2RlXSA9IG5vZGVMaXN0W3Jvb20xLm5vZGVdLmNvbmNhdChub2RlTGlzdFtvbGROb2RlXSk7XG4gICAgZGVsZXRlIG5vZGVMaXN0W29sZE5vZGVdO1xuICB9XG59XG5cbmZ1bmN0aW9uIHJhbmdlKHN0YXJ0LCBlbmQpIHtcbiAgcmV0dXJuIEFycmF5KGVuZCAtIHN0YXJ0ICsgMSkuZmlsbCgpLm1hcCgoXywgaWR4KSA9PiBzdGFydCArIGlkeClcbn1cblxuZnVuY3Rpb24gZ2V0UGF0aEJldHdlZW5Sb29tcyhhcnJheSwgY29scywgcm93cywgcGF0aCl7XG4gIGxldCB2YWxpZEluZGljaWVzID0gW107XG4gIGxldCB1bmNvbm5lY3RlZCA9IHRydWU7XG4gIGxldCB0dXJuZWQgPSBmYWxzZTtcbiAgd2hpbGUodW5jb25uZWN0ZWQpe1xuICAgIHBhdGgucG9pbnRbcGF0aC5pbml0aWFsRGlyZWN0aW9uXSArPSBwYXRoLmRpcmVjdGlvbltwYXRoLmluaXRpYWxEaXJlY3Rpb25dO1xuXG4gICAgaWYoIXBhdGgucGFyYWxsZWwgJiYgcGF0aC5wb2ludFtwYXRoLmluaXRpYWxEaXJlY3Rpb25dID09PSBwYXRoLmVuZEF4aXMgJiYgIXR1cm5lZCl7XG4gICAgICBwYXRoLmluaXRpYWxEaXJlY3Rpb24gPSBwYXRoLmluaXRpYWxEaXJlY3Rpb24gPT09IFwieFwiID8gXCJ5XCIgOiBcInhcIjsgLy9mbGlwIGZyb20gXCJ4XCIgdG8gXCJ5XCI7XG4gICAgICB0dXJuZWQgPSB0cnVlO1xuICAgIH1cblxuICAgIGxldCBjdXJyZW50SW5kZXggPSB4eVRvSW5kZXgocGF0aC5wb2ludCwgY29scyk7XG4gICAgaWYocGF0aC5wb2ludC54ID4gMCAmJiBwYXRoLnBvaW50LnkgPiAwXG4gICAgJiYgcGF0aC5wb2ludC54IDwgY29scyAmJiBwYXRoLnBvaW50LnkgPCByb3dzKXtcbiAgICAgIHZhbGlkSW5kaWNpZXMucHVzaChjdXJyZW50SW5kZXgpO1xuICAgICAgLy8gYXJyYXlbY3VycmVudEluZGV4XSA9IDU7XG4gICAgICBpZihpc1BvaW50SW5Sb29tKHBhdGgucG9pbnQsIHBhdGguZGVzdGluYXRpb24pKXtcbiAgICAgICAgdW5jb25uZWN0ZWQgPSBmYWxzZTtcbiAgICAgIH1cblxuICAgIH0gZWxzZSB7XG4gICAgXHR2YWxpZEluZGljaWVzID0gW107XG4gICAgICBicmVhaztcbiAgICB9XG4gIH1cbiAgcmV0dXJuIHZhbGlkSW5kaWNpZXM7XG59XG5cbmZ1bmN0aW9uIGlzUG9pbnRJblJvb20ocG9pbnQsIHJvb20pe1xuICBpZiAocG9pbnQueCA+PSByb29tLnRvcExlZnQueCAmJiBwb2ludC54IDw9IHJvb20uYm90dG9tUmlnaHQueFxuICAgICYmIHBvaW50LnkgPj0gcm9vbS50b3BMZWZ0LnkgJiYgcG9pbnQueSA8PSByb29tLmJvdHRvbVJpZ2h0LnkpIHtcbiAgICByZXR1cm4gdHJ1ZTtcbiAgfVxuXG4gIHJldHVybiBmYWxzZTtcbn1cblxuZnVuY3Rpb24gZ2V0UG9pbnRCZXR3ZWVuKHh5MSwgeHkyKSB7IC8vaW5jbHVzaXZlXG4gIHJldHVybiBNYXRoLmZsb29yKE1hdGgucmFuZG9tKCkgKiAoeHkyIC0geHkxICsgMSkgKyB4eTEpO1xufVxuIiwiaW1wb3J0IENvbmZpZyBmcm9tIFwiLi9jb25maWdcIjtcbmltcG9ydCB7IHRpbGVEaWN0aW9uYXJ5LCBtb25zdGVyRGljdGlvbmFyeSwgaXRlbURpY3Rpb25hcnkgfSBmcm9tIFwiLi90aWxlc1wiO1xuaW1wb3J0IHsgcm9sbERpY2UsIGZ1bGxEaWNlLCBmaXJzdERpZUZ1bGwsIGdldE51bUluUmFuZ2UsIGdldFJhbmRvbUluQXJyYXkgfSBmcm9tICcuL3V0aWxpdHknO1xuaW1wb3J0IHsgZ2V0UmFuZG9tQXZhaWxhYmxlIH0gZnJvbSBcIi4vcm9vbUdlblwiO1xuXG5jb25zdCBFbnRpdHkgPSB7XG4gIHg6IDAsXG4gIHk6IDAsXG4gIHR5cGU6IG51bGxcbn07XG5cbmxldCBpZENvdW50ZXIgPSAxO1xuXG5sZXQgZ2VuZXJhdGVkSXRlbXMgPSBbXTsgLy8gVGhpcyBwcm9iYWJseSBzaG91bGQgYmUgb24gdGhlIGdhbWUgb2JqZWN0XG5cbmV4cG9ydCBjb25zdCByZXNldCA9ICgpID0+IHtcbiAgZ2VuZXJhdGVkSXRlbXMgPSBbXTtcbn0gXG5cbmV4cG9ydCBjb25zdCBidWlsZEVudGl0eU1hcCA9IChsZXZlbCkgPT4ge1xuICBsZXZlbC5lbnRpdGllc01hcCA9IHt9O1xuICBsZXZlbC5lbnRpdGllc01hcC5ncmlkID0gQXJyYXkoQ29uZmlnLm1hcENvbHMgKiBDb25maWcubWFwUm93cykuZmlsbCgwKTtcbiAgbGV2ZWwuZW50aXRpZXNNYXAubWFwQ29scyA9IENvbmZpZy5tYXBDb2xzO1xuICBsZXZlbC5lbnRpdGllc01hcC5tYXBSb3dzID0gQ29uZmlnLm1hcFJvd3M7XG4gIGZvcihsZXQgaSA9IDA7IGkgPCBsZXZlbC5lbnRpdGllcy5sZW5ndGg7IGkrKykge1xuXG4gICAgbGV0IGVudGl0eSA9IGxldmVsLmVudGl0aWVzW2ldO1xuICAgIC8vY29uc29sZS5sb2coZW50aXR5KTtcbiAgICBsZXZlbC5lbnRpdGllc01hcC5ncmlkW2VudGl0eS5pbmRleF0gPSBlbnRpdHkua2V5O1xuICB9XG59O1xuXG5jb25zdCBidWlsZEVudGl0eSA9IChsZXZlbCwga2V5LCBsb2NhdGlvbikgPT4geyAvL2xldHMgYXNzdW1lIHRoZSBpbmRleCBpcyBjbGVhciBhbmQgbm90IGNoZWNrIGhlcmVcbiAgbGV0IGVudGl0eSA9IE9iamVjdC5hc3NpZ24oe30sIEVudGl0eSwgeyBrZXksIGluZGV4OiBsb2NhdGlvbi5pbmRleCwgeDogbG9jYXRpb24ueCAqIENvbmZpZy50aWxlU2l6ZSwgeTogbG9jYXRpb24ueSAqIENvbmZpZy50aWxlU2l6ZSB9KTtcbiAgZW50aXR5Lm5leHRYID0gZW50aXR5Lng7XG4gIGVudGl0eS5uZXh0WSA9IGVudGl0eS55O1xuICBlbnRpdHkuaWQgPSBpZENvdW50ZXI7XG4gIGVudGl0eS50eXBlID0gdGlsZURpY3Rpb25hcnlbZW50aXR5LmtleV0udHlwZTtcbiAgZW50aXR5LnN1YnR5cGUgPSB0aWxlRGljdGlvbmFyeVtlbnRpdHkua2V5XS5zdWJ0eXBlO1xuXG4gIGlkQ291bnRlcisrO1xuICBsZXZlbC5lbnRpdGllc01hcFtlbnRpdHkuaW5kZXhdID0gZW50aXR5LmtleTtcbiAgbGV2ZWwuZW50aXRpZXMucHVzaChlbnRpdHkpO1xuXG4gIHJldHVybiBlbnRpdHk7XG59O1xuXG5leHBvcnQgY29uc3QgYnVpbGRTdGFpcnMgPSAobGV2ZWwsIGtleSwgbG9jYXRpb24sIHRhcmdldExldmVsID0gbnVsbCwgdGFyZ2V0SW5kZXggPSBudWxsKSA9PiB7XG4gIGxldCBzdGFpcnMgPSBidWlsZEVudGl0eShsZXZlbCwga2V5LCBsb2NhdGlvbik7XG4gIHN0YWlycy50YXJnZXRMZXZlbCA9IHRhcmdldExldmVsO1xuICBzdGFpcnMudGFyZ2V0SW5kZXggPSB0YXJnZXRJbmRleDtcbiAgcmV0dXJuIHN0YWlycztcbn07XG5cbmV4cG9ydCBjb25zdCBidWlsZFBsYXllciA9IChsZXZlbCwga2V5LCBsb2NhdGlvbikgPT4ge1xuICBsZXQgcGxheWVyID0gYnVpbGRFbnRpdHkobGV2ZWwsIGtleSwgbG9jYXRpb24pO1xuICBwbGF5ZXIubmFtZSA9IFwicGxheWVyXCI7XG4gIHBsYXllci5ocCA9IDEwO1xuICBwbGF5ZXIubWF4SHAgPSAxMDtcbiAgcGxheWVyLnhwID0gMDtcbiAgcGxheWVyLmxldmVsID0gMTtcbiAgcGxheWVyLmRhbWFnZU1vZGlmaWVyID0gMTtcbiAgcGxheWVyLndlYXBvbiA9IHtuYW1lOiBcImhhbmRcIiwgZGFtYWdlOiBbMSw0XSwgdmVyYjogXCJwdW5jaFwiLCBzdWJ0eXBlOiBcIndlYXBvblwiLCB0aHJlYXQ6IDB9XG4gIHBsYXllci5hcm1vciA9IHtuYW1lOiBcImNsb3RoXCIsIHByb3RlY3Rpb246IDAsIHRocmVhdDogMH1cbiAgcmV0dXJuIHBsYXllcjtcbn07XG5cbmV4cG9ydCBjb25zdCBidWlsZE1vbnN0ZXIgPSAobGV2ZWwsIGtleSwgaW5kZXgpID0+IHtcbiAgbGV0IGVudGl0eSA9IGJ1aWxkRW50aXR5KGxldmVsLCBrZXksIGluZGV4KTtcbiAgbGV0IG1vbnN0ZXJSZWYgPSBtb25zdGVyRGljdGlvbmFyeVtlbnRpdHkua2V5XTtcbiAgbGV0IG1vbnN0ZXIgPSBPYmplY3QuYXNzaWduKGVudGl0eSwgbW9uc3RlclJlZik7XG4gIG1vbnN0ZXIuaHAgPSBmaXJzdERpZUZ1bGwoLi4ubW9uc3RlclJlZi5ocCk7XG4gIG1vbnN0ZXIubWF4SHAgPSBtb25zdGVyLmhwO1xuICByZXR1cm4gbW9uc3Rlcjtcbn07XG5cbmV4cG9ydCBjb25zdCBidWlsZEl0ZW0gPSAobGV2ZWwsIGtleSwgaW5kZXgpID0+IHtcbiAgbGV0IGl0ZW0gPSBidWlsZEVudGl0eShsZXZlbCwga2V5LCBpbmRleCk7XG4gIGl0ZW0uaXRlbVByb3BzID0gaXRlbURpY3Rpb25hcnlbaXRlbS5rZXldO1xuICAvL2FkZCBkYW1hZ2VNb2RpZmllciB0byBtb25zdGVyIHRhYmxlXG4gIGNvbnNvbGUubG9nKGl0ZW0pO1xuICByZXR1cm4gaXRlbTtcbn07XG5cbmV4cG9ydCBjb25zdCBwb3B1bGF0ZUxldmVsID0gKGxldmVsKSA9PiB7XG4gIC8vIGxldmVsIGdldHMgYSByYW5kb20gbnVtYmVyIG9mIG1vbnN0ZXJzIGJldHdlZW4gdGhlIG1pbiBhbmQgbWF4SHBcbiAgLy8gc2hvdWxkIGJlIG1vcmUgZm9yIGhpZ2hlciBsZXZlbHNcbiAgLy8gdGhlIG1vbnN0ZXJzIG9uIGhpZ2ggbGV2ZWxzIHNob2xkIGJlIGhpZ2hlciBsZXZlbFxuICAvLyBzb21lIG1vbnN0ZXJzIHN1Y2ggYXMgdGhlIGRyYWdvbiBkbyBub3QgZ2VuZXJhdGVcbiAgbGV0IG51bU1vbnN0ZXJzID0gZ2V0TnVtSW5SYW5nZShDb25maWcubWluaW11bU1vbnN0ZXJzLCBDb25maWcubWF4aW11bU1vbnN0ZXJzKSArIE1hdGguZmxvb3IobGV2ZWwuYmFzZURpZmZpY3VsdHkgLyAyKTtcbiAgbGV0IHBvc3NpYmxlTW9uc3RlcnMgPSBnZXRQb3NzaWJsZU1vbnN0ZXJzKGxldmVsKTtcbiAgZm9yKGxldCBpID0gMDsgaSA8IG51bU1vbnN0ZXJzOyBpKyspe1xuXG4gICAgYnVpbGRNb25zdGVyKFxuICAgICAgbGV2ZWwsXG4gICAgICBnZXRSYW5kb21JbkFycmF5KHBvc3NpYmxlTW9uc3RlcnMpLFxuICAgICAgZ2V0UmFuZG9tQXZhaWxhYmxlKGxldmVsLm1hcCwgbGV2ZWwuZW50aXRpZXMpXG4gICAgKTtcbiAgfVxuICBsZXQgbnVtSXRlbXMgPSBNYXRoLmZsb29yKG51bU1vbnN0ZXJzIC8gMyk7XG4gIGxldCBwb3NzaWJsZUl0ZW1zID0gZ2V0UG9zc2libGVJdGVtcyhsZXZlbCk7XG4gIGZvcihsZXQgaSA9IDA7IGkgPCBudW1JdGVtczsgaSsrKXtcbiAgICBsZXQga2V5ID0gZ2V0UmFuZG9tSW5BcnJheShwb3NzaWJsZUl0ZW1zKTtcbiAgICBsZXQgaXRlbSA9IGl0ZW1EaWN0aW9uYXJ5W2tleV07XG4gICAgY29uc29sZS5sb2coYGdlbmVyYXRlZDogJHtpdGVtLm5hbWV9YCk7XG4gICAgaWYoaXRlbS5zdWJ0eXBlID09PSBcIndlYXBvblwiIHx8IGl0ZW0uc3VidHlwZSA9PT0gXCJhcm1vclwiKSB7XG4gICAgICBnZW5lcmF0ZWRJdGVtcy5wdXNoKGtleSk7XG4gICAgICBsZXQgaXRlbUtleSA9IHBvc3NpYmxlSXRlbXMuaW5kZXhPZihrZXkpO1xuICAgICAgcG9zc2libGVJdGVtcy5zcGxpY2UoaXRlbUtleSwxKTtcbiAgICB9XG4gICAgYnVpbGRJdGVtKFxuICAgICAgbGV2ZWwsXG4gICAgICBrZXksXG4gICAgICBnZXRSYW5kb21BdmFpbGFibGUobGV2ZWwubWFwLCBsZXZlbC5lbnRpdGllcylcbiAgICApO1xuICB9XG4gIC8vIGl0ZW1zIGdlbmVyYXRlZCBzaG91bGQgYmUgbnVtTW9uc3RlcnMgLyAzIChtb25zdGVycyB3aWxsIGFsc28gZHJvcCBmb29kIHNvbWV0aW1lcyBsYXRlcik7XG4gIC8vIG5vIG1vcmUgdGhhbiBvbmUgd2VhcG9uIG9yIGFybW9yIHNob3VsZCBnZW5lcmF0ZSBvbiBhIGxldmVsLFxuICAvLyB3ZWFwb25zIGFuZCBhcm1vciB3b3JzZSB0aGFuIHRob3NlIHRoYXQgaGF2ZSBiZWVuIGdlbmVyYXRlZCBzaG91bGQgbm90IGdlbmVyYXRlLlxuICAvLyBtYXliZSBzaG91bGQgYWx3YXlzIGdlbmVyYXRlIHdlYXBvbnMgYW5kIGFybW9yIGluIG9yZGVyIG9yIGNsb3NlIHRvIGl0P1xufTtcblxuZXhwb3J0IGNvbnN0IGdlbmVyYXRlTW9uc3RlciA9IChsZXZlbCwgdmlld3BvcnQpID0+IHtcbiAgbGV0IHBvc3NpYmxlTW9uc3RlcnMgPSBnZXRQb3NzaWJsZU1vbnN0ZXJzKGxldmVsKTtcbiAgbGV0IG1vbiA9IGJ1aWxkTW9uc3RlcihcbiAgICBsZXZlbCxcbiAgICBnZXRSYW5kb21JbkFycmF5KHBvc3NpYmxlTW9uc3RlcnMpLFxuICAgIGdldFJhbmRvbUF2YWlsYWJsZShsZXZlbC5tYXAsIGxldmVsLmVudGl0aWVzLCB2aWV3cG9ydClcbiAgKTtcbiAgY29uc29sZS5sb2coXCJnZW5lcmF0ZWQ6IFwiLCBtb24pO1xufTtcblxuY29uc3QgZ2V0UG9zc2libGVNb25zdGVycyA9IChsZXZlbCkgPT4ge1xuICByZXR1cm4gT2JqZWN0LmtleXMobW9uc3RlckRpY3Rpb25hcnkpLmZpbHRlcigobW9uS2V5KSA9PiB7XG4gICAgbGV0IG1vbnN0ZXIgPSBtb25zdGVyRGljdGlvbmFyeVttb25LZXldO1xuICAgIHJldHVybiBtb25zdGVyLnRocmVhdCA8PSBsZXZlbC5iYXNlRGlmZmljdWx0eSAmJiBtb25zdGVyLnRocmVhdCA+PSBNYXRoLmZsb29yKGxldmVsLmJhc2VEaWZmaWN1bHR5IC8gMik7XG4gIH0pO1xufVxuXG5jb25zdCBnZXRQb3NzaWJsZUl0ZW1zID0gKGxldmVsKSA9PiB7XG4gIHJldHVybiBPYmplY3Qua2V5cyhpdGVtRGljdGlvbmFyeSkuZmlsdGVyKChpS2V5KSA9PiB7XG4gICAgbGV0IGl0ZW0gPSBpdGVtRGljdGlvbmFyeVtpS2V5XTtcbiAgICByZXR1cm4gaXRlbS50aHJlYXQgPD0gbGV2ZWwuYmFzZURpZmZpY3VsdHkgXG4gICAgICAmJiBpdGVtLnRocmVhdCA+PSBNYXRoLmZsb29yKGxldmVsLmJhc2VEaWZmaWN1bHR5IC8gMikgXG4gICAgICAmJiBnZW5lcmF0ZWRJdGVtcy5pbmRleE9mKGlLZXkpID09PSAtMTtcbiAgfSk7XG59XG5cbmV4cG9ydCBjb25zdCByZW1vdmVFbnRpdHlGcm9tTGV2ZWwgPSAobGV2ZWwsIGVudGl0eSkgPT4ge1xuICBsZXZlbC5lbnRpdGllc01hcFtlbnRpdHkuaW5kZXhdID0gMDtcbiAgbGV0IGluZGV4O1xuICBmb3IobGV0IGkgPSAwOyBpIDwgbGV2ZWwuZW50aXRpZXMubGVuZ3RoOyBpKyspe1xuICAgIGxldCBlID0gbGV2ZWwuZW50aXRpZXNbaV07XG4gICAgaWYoZS5pZCA9PT0gZW50aXR5LmlkKXtcbiAgICAgIGluZGV4ID0gaTtcbiAgICAgIGJyZWFrO1xuICAgIH1cbiAgfVxuICBsZXZlbC5lbnRpdGllcy5zcGxpY2UoaW5kZXgsMSk7XG59O1xuXG5leHBvcnQgY29uc3QgZ2V0RW50aXRpZXNBdEluZGV4ID0gKGxldmVsLCBpbmRleCkgPT4ge1xuICBsZXQgZW50aXRpZXMgPSBbXTtcbiAgZm9yKGxldCBpID0gMDsgaSA8IGxldmVsLmVudGl0aWVzLmxlbmd0aDsgaSsrKXtcbiAgICBsZXQgZW50aXR5ID0gbGV2ZWwuZW50aXRpZXNbaV07XG4gICAgaWYoZW50aXR5LmluZGV4ID09PSBpbmRleCl7XG4gICAgICBlbnRpdGllcy5wdXNoKGVudGl0eSk7XG4gICAgfVxuICB9XG4gIHJldHVybiBlbnRpdGllcztcbn07XG4iLCJpbXBvcnQgQ29uZmlnIGZyb20gXCIuL2NvbmZpZ1wiO1xuaW1wb3J0IHsgdGlsZURpY3Rpb25hcnkgfSBmcm9tIFwiLi90aWxlc1wiO1xuaW1wb3J0IHsgZ2V0RW50aXRpZXNBdEluZGV4IH0gZnJvbSAnLi9lbnRpdGllcyc7XG5pbXBvcnQgeyBnZXRSYW5kb21JbkFycmF5IH0gZnJvbSAnLi91dGlsaXR5JztcblxuZXhwb3J0IGNvbnN0IGluZGV4VG9YWSA9IChpbmRleCkgPT4ge1xuICBsZXQgeCA9IGluZGV4ICUgQ29uZmlnLm1hcENvbHM7XG4gIGxldCB5ID0gTWF0aC5mbG9vcihpbmRleCAvIENvbmZpZy5tYXBDb2xzKTtcbiAgcmV0dXJuIHt4LCB5LCBpbmRleH07XG59O1xuXG5leHBvcnQgY29uc3QgaW5kZXhUcnVlVG9YWSA9IChpbmRleCkgPT4ge1xuICBsZXQgeCA9IChpbmRleCAlIENvbmZpZy5tYXBDb2xzKSAqIENvbmZpZy50aWxlU2l6ZTtcbiAgbGV0IHkgPSBNYXRoLmZsb29yKGluZGV4IC8gQ29uZmlnLm1hcENvbHMpICogQ29uZmlnLnRpbGVTaXplO1xuICByZXR1cm4ge3gsIHksIGluZGV4fTtcbn07XG5cbmV4cG9ydCBjb25zdCB4eVRvSW5kZXggPSAoY29vcmRzKSA9PiB7XG4gIHJldHVybiAoY29vcmRzLnkqQ29uZmlnLm1hcENvbHMpICsgY29vcmRzLng7XG59O1xuXG5leHBvcnQgY29uc3QgZ2V0VHJhbnNsYXRpb24gPSAoY29vcmRzKSA9PiB7XG4gIGxldCBvZmZzZXRDb29yZHMgPSB7eDowLCB5OjB9O1xuICBsZXQgZXh0cmEgPSAwO1xuICBpZihjb29yZHMueCA+IENvbmZpZy5tYXhPZmZzZXRYKXtcbiAgICBleHRyYSA9IGNvb3Jkcy54IC0gQ29uZmlnLm1heE9mZnNldFg7XG4gIH1cblxuICBpZihjb29yZHMueCA+PSBDb25maWcucm93c1RvU2hvdyApe1xuICAgIG9mZnNldENvb3Jkcy54ID0gY29vcmRzLnggLSAoQ29uZmlnLnJvd3NUb1Nob3cgKyBleHRyYSk7XG4gIH1lbHNle1xuICAgIG9mZnNldENvb3Jkcy54ID0gMDtcbiAgfVxuICBleHRyYSA9IDA7XG4gIGlmKGNvb3Jkcy55ID4gQ29uZmlnLm1heE9mZnNldFkpe1xuICAgIGV4dHJhID0gY29vcmRzLnkgLSBDb25maWcubWF4T2Zmc2V0WTtcbiAgfVxuICBpZihjb29yZHMueSA+PSBDb25maWcucm93c1RvU2hvdyl7XG4gICAgb2Zmc2V0Q29vcmRzLnkgPSBjb29yZHMueSAtIChDb25maWcucm93c1RvU2hvdyArIGV4dHJhKTtcbiAgfWVsc2V7XG4gICAgb2Zmc2V0Q29vcmRzLnkgPSAwO1xuICB9XG4gIHJldHVybiBvZmZzZXRDb29yZHM7XG59O1xuLy8ganVzdCB0byBnZXQgdGhpcyB0byB3b3JrLCB0aGlzIGFsbCBuZWVkcyB0byBiZSBjb21wbGV0ZWx5IHJld3JpdHRlblxuZXhwb3J0IGNvbnN0IGNvbnN0cmFpbkNhbWVyYVRyYW5zbGF0aW9uID0gKHBsYXllcikgPT4ge1xuICBsZXQgY29vcmRzID0ge3g6IDAsIHk6IDB9O1xuICBpZihwbGF5ZXIueCA8IENvbmZpZy5yb3dzVG9TaG93ICogQ29uZmlnLnRpbGVTaXplKXtcbiAgICBjb29yZHMueCA9IDA7XG4gIH1lbHNlIGlmIChwbGF5ZXIueCA+IENvbmZpZy5tYXhPZmZzZXRYICogQ29uZmlnLnRpbGVTaXplKSB7XG4gICAgY29vcmRzLnggPSAtKENvbmZpZy5tYXhPZmZzZXRYIC0gQ29uZmlnLnJvd3NUb1Nob3cpICogQ29uZmlnLnRpbGVTaXplLy8tNTc2OyAvLy0oMjIgLSA0KSAqIDMyO1xuICB9IGVsc2Uge1xuICAgIGNvb3Jkcy54ID0gLShwbGF5ZXIueCAtIChDb25maWcucm93c1RvU2hvdyAqIENvbmZpZy50aWxlU2l6ZSkpO1xuICB9XG5cbiAgaWYocGxheWVyLnkgPCBDb25maWcucm93c1RvU2hvdyAqIENvbmZpZy50aWxlU2l6ZSl7XG4gICAgY29vcmRzLnkgPSAwO1xuICB9ZWxzZSBpZihwbGF5ZXIueSA+IENvbmZpZy5tYXhPZmZzZXRZICogQ29uZmlnLnRpbGVTaXplKSB7XG4gICAgY29vcmRzLnkgPSAtKENvbmZpZy5tYXhPZmZzZXRZIC0gQ29uZmlnLnJvd3NUb1Nob3cpICogQ29uZmlnLnRpbGVTaXplLy8tNTc2OyAvLy0oMjIgLSA0KSAqIDMyO1xuICB9IGVsc2Uge1xuICAgIGNvb3Jkcy55ID0gLShwbGF5ZXIueSAtIChDb25maWcucm93c1RvU2hvdyAqIENvbmZpZy50aWxlU2l6ZSkpO1xuICB9XG4gIHJldHVybiBjb29yZHM7XG59O1xuLy8gVGhpcyBuZWVkcyB0byBiZSBtb3ZlZCB0byBlbnRpdGllc1xuZXhwb3J0IGNvbnN0IG1vdmVFbnRpdHkgPSAoZW50aXR5LCBrZXkpID0+IHtcbiAgbGV0IGN1cnJlbnRDb29yZHMgPSBpbmRleFRvWFkoZW50aXR5LmluZGV4KTtcbiAgLy8gY29uc29sZS5sb2coXCJiZWZvcmUgbW92ZSBlbnRpdHlcIiwga2V5LCBjdXJyZW50Q29vcmRzKTtcbiAgLy9zZW5kIGFuIGFjdGlvbiB0byBkaXNwYXRjaGVyIHRlbGxpbmcgdGhlIGRyYXcgdG8gcmVmcmVzaFxuICBlbnRpdHkubmV4dFkgPSBlbnRpdHkueTtcbiAgZW50aXR5Lm5leHRYID0gZW50aXR5Lng7XG4gIGlmKGtleSA9PT0gXCJ1cFwiICYmIGN1cnJlbnRDb29yZHMueSA+IDApe1xuICAgIGVudGl0eS5pbmRleCAtPSBDb25maWcubWFwQ29scztcbiAgICBlbnRpdHkubmV4dFkgLT0gQ29uZmlnLnRpbGVTaXplO1xuICB9XG4gIGlmKGtleSA9PT0gXCJkb3duXCIgJiYgY3VycmVudENvb3Jkcy55IDwgQ29uZmlnLm1hcFJvd3MgLSAxKXtcbiAgICBlbnRpdHkuaW5kZXggKz0gQ29uZmlnLm1hcENvbHM7XG4gICAgZW50aXR5Lm5leHRZICs9IENvbmZpZy50aWxlU2l6ZTtcbiAgfVxuICBpZihrZXkgPT09IFwibGVmdFwiICYmIGN1cnJlbnRDb29yZHMueCA+IDApe1xuICAgIGVudGl0eS5pbmRleCAtPSAxO1xuICAgIGVudGl0eS5uZXh0WCAtPSBDb25maWcudGlsZVNpemU7XG4gIH1cbiAgaWYoa2V5ID09PSBcInJpZ2h0XCIgJiYgY3VycmVudENvb3Jkcy54IDwgQ29uZmlnLm1hcENvbHMgLSAxKXtcbiAgICBlbnRpdHkuaW5kZXggKz0gMTtcbiAgICBlbnRpdHkubmV4dFggKz0gQ29uZmlnLnRpbGVTaXplO1xuICB9XG4gIGlmKGtleSA9PT0gXCJ1cC1sZWZ0XCIgJiYgY3VycmVudENvb3Jkcy55ID4gMCAmJiBjdXJyZW50Q29vcmRzLnggPiAwKXtcbiAgICBlbnRpdHkuaW5kZXggLT0gQ29uZmlnLm1hcENvbHMgKyAxO1xuICAgIGVudGl0eS5uZXh0WSAtPSBDb25maWcudGlsZVNpemU7XG4gICAgZW50aXR5Lm5leHRYIC09IENvbmZpZy50aWxlU2l6ZTtcbiAgfVxuICBpZihrZXkgPT09IFwidXAtcmlnaHRcIiAmJiBjdXJyZW50Q29vcmRzLnkgPiAwICYmIGN1cnJlbnRDb29yZHMueCA8IENvbmZpZy5tYXBDb2xzIC0gMSl7XG4gICAgZW50aXR5LmluZGV4IC09IENvbmZpZy5tYXBDb2xzIC0gMTtcbiAgICBlbnRpdHkubmV4dFkgLT0gQ29uZmlnLnRpbGVTaXplO1xuICAgIGVudGl0eS5uZXh0WCArPSBDb25maWcudGlsZVNpemU7XG4gIH1cbiAgaWYoa2V5ID09PSBcImRvd24tbGVmdFwiICYmIGN1cnJlbnRDb29yZHMueSA8IENvbmZpZy5tYXBSb3dzIC0gMSAmJiBjdXJyZW50Q29vcmRzLnggPiAwKXtcbiAgICBlbnRpdHkuaW5kZXggKz0gQ29uZmlnLm1hcENvbHMgLSAxO1xuICAgIGVudGl0eS5uZXh0WSArPSBDb25maWcudGlsZVNpemU7XG4gICAgZW50aXR5Lm5leHRYIC09IENvbmZpZy50aWxlU2l6ZTtcbiAgfVxuICBpZihrZXkgPT09IFwiZG93bi1yaWdodFwiICYmIGN1cnJlbnRDb29yZHMueSA8IENvbmZpZy5tYXBSb3dzIC0gMSAmJiBjdXJyZW50Q29vcmRzLnggPCBDb25maWcubWFwQ29scyAtIDEpe1xuICAgIGVudGl0eS5pbmRleCArPSBDb25maWcubWFwQ29scyArIDE7XG4gICAgZW50aXR5Lm5leHRZICs9IENvbmZpZy50aWxlU2l6ZTtcbiAgICBlbnRpdHkubmV4dFggKz0gQ29uZmlnLnRpbGVTaXplO1xuICB9XG4gIGlmKGtleSA9PT0gXCJ3YWl0XCIpe1xuICAgIC8vIGVudGl0eS5pbmRleDtcbiAgICAvLyBlbnRpdHkubmV4dFggKz0gQ29uZmlnLnRpbGVTaXplO1xuICB9XG4gIC8vIGNvbnNvbGUubG9nKGVudGl0eSk7XG59O1xuXG5leHBvcnQgY29uc3QgY2hlY2tJbmRleCA9IChlbnRpdHksIGtleSkgPT4geyAvL1RoaW5rIGFib3V0IGRyeWluZyB0aGlzIHVwXG4gIGxldCBjdXJyZW50Q29vcmRzID0gaW5kZXhUb1hZKGVudGl0eS5pbmRleCk7XG4gIGxldCBuZXdJbmRleDtcbiAgaWYoa2V5ID09PSBcInVwXCIgJiYgY3VycmVudENvb3Jkcy55ID4gMCl7XG4gICAgbmV3SW5kZXggPSBlbnRpdHkuaW5kZXggLSBDb25maWcubWFwQ29scztcbiAgfVxuICBpZihrZXkgPT09IFwiZG93blwiICYmIGN1cnJlbnRDb29yZHMueSA8IENvbmZpZy5tYXBSb3dzIC0gMSl7XG4gICAgbmV3SW5kZXggPSBlbnRpdHkuaW5kZXggKyBDb25maWcubWFwQ29scztcbiAgfVxuICBpZihrZXkgPT09IFwibGVmdFwiICYmIGN1cnJlbnRDb29yZHMueCA+IDApe1xuICAgIG5ld0luZGV4ID0gZW50aXR5LmluZGV4IC0gMTtcbiAgfVxuICBpZihrZXkgPT09IFwicmlnaHRcIiAmJiBjdXJyZW50Q29vcmRzLnggPCBDb25maWcubWFwQ29scyAtIDEpe1xuICAgIG5ld0luZGV4ID0gZW50aXR5LmluZGV4ICsgMTtcbiAgfVxuICBpZihrZXkgPT09IFwidXAtbGVmdFwiICYmIGN1cnJlbnRDb29yZHMueSA+IDAgJiYgY3VycmVudENvb3Jkcy54ID4gMCApe1xuICAgIG5ld0luZGV4ID0gZW50aXR5LmluZGV4IC0gQ29uZmlnLm1hcENvbHMgLSAxO1xuICB9XG4gIGlmKGtleSA9PT0gXCJ1cC1yaWdodFwiICYmIGN1cnJlbnRDb29yZHMueSA+IDAgJiYgY3VycmVudENvb3Jkcy54IDwgQ29uZmlnLm1hcENvbHMgLSAxKXtcbiAgICBuZXdJbmRleCA9IGVudGl0eS5pbmRleCAtIENvbmZpZy5tYXBDb2xzICsgMTtcbiAgfVxuICBpZihrZXkgPT09IFwiZG93bi1sZWZ0XCIgJiYgY3VycmVudENvb3Jkcy55IDwgQ29uZmlnLm1hcFJvd3MgLSAxICYmIGN1cnJlbnRDb29yZHMueCA+IDApe1xuICAgIG5ld0luZGV4ID0gZW50aXR5LmluZGV4ICsgQ29uZmlnLm1hcENvbHMgLSAxO1xuICB9XG4gIGlmKGtleSA9PT0gXCJkb3duLXJpZ2h0XCImJiBjdXJyZW50Q29vcmRzLnkgPCBDb25maWcubWFwUm93cyAtIDEgJiYgY3VycmVudENvb3Jkcy54IDwgQ29uZmlnLm1hcENvbHMgLSAxKXtcbiAgICBuZXdJbmRleCA9IGVudGl0eS5pbmRleCArIENvbmZpZy5tYXBDb2xzICsgMTtcbiAgfVxuICBpZihrZXkgPT09IFwid2FpdFwiICYmIGN1cnJlbnRDb29yZHMueCA8IENvbmZpZy5tYXBDb2xzIC0gMSl7XG4gICAgbmV3SW5kZXggPSBlbnRpdHkuaW5kZXg7XG4gIH1cbiAgIC8vVGhpcyB3b250IGhhbmRsZSBlbnRpdGllcyBhdCB0aGUgbW9tZW50LCBzaG91bGQgSSBjaGVjayBhZ2FpbnN0IHR3byBtYXBzIG9yIGZ1c2UgdGhlbT9cbiAgcmV0dXJuIHsgdGFyZ2V0OiB0aWxlRGljdGlvbmFyeVtDb25maWcuY3VycmVudE1hcC5ncmlkW25ld0luZGV4XV0sIGluZGV4OiBuZXdJbmRleCB9O1xufTtcblxuZXhwb3J0IGNvbnN0IGdldEluZGljZXNJblZpZXdwb3J0ID0gKHBhZGRpbmcgPSAwKSA9PiB7IC8vdGFrZXMgYSB2YXIgdG8gZ3JhYiBleHRyYSBtYXAgY2VsbHMgYXJvdW5kIHRoZSB0aGUgdmlld3BvcnRcbiAgbGV0IHZpZXdwb3J0ID0gT2JqZWN0LmFzc2lnbih7fSwgQ29uZmlnLnRyYW5zbGF0ZU9mZnNldCk7XG4gIC8vWCBhbmQgWSBtZWFpbmcgYm90aCB0aGUgcGl4ZWwgcG9zaXRpb24gYW5kIHRoZSBjb29yZGluYXRlIHBvc2l0aW9uIGlzIGNvbmZ1c2luZyBhbmQgc291cmNlIG9mIGJ1Z3MgZml4XG4gIHZpZXdwb3J0LnggPSAoTWF0aC5hYnModmlld3BvcnQueCkgLyBDb25maWcudGlsZVNpemUpIC0gcGFkZGluZztcbiAgdmlld3BvcnQueSA9IChNYXRoLmFicyh2aWV3cG9ydC55KSAvIENvbmZpZy50aWxlU2l6ZSkgLSBwYWRkaW5nO1xuICAvL2NvbnNvbGUubG9nKHZpZXdwb3J0LnggLCB2aWV3cG9ydC55KTtcbiAgLy9jb25zb2xlLmxvZyh2aWV3cG9ydC54ICwgdmlld3BvcnQueSk7XG4gIGxldCBpbmRpY2VzID0gW107IC8vIHRoaXMgc2hvdWxkIGhhdmUgYSBsZW5ndGggb2YgODE7XG4gIC8vY29uc29sZS5sb2codmlld3BvcnQueCArIChDb25maWcucm93c1RvU2hvdyAqIDIpLCB2aWV3cG9ydC55ICsgKENvbmZpZy5yb3dzVG9TaG93ICogMikpO1xuICAvL2NvbnNvbGUubG9nKHZpZXdwb3J0LnggKyAoQ29uZmlnLnJvd3NUb1Nob3cgKiAyKSArIHBhZGRpbmcsIHZpZXdwb3J0LnkgKyAoQ29uZmlnLnJvd3NUb1Nob3cgKiAyKSArIHBhZGRpbmcpO1xuICBpZihwYWRkaW5nID4gMCl7XG4gICAgcGFkZGluZyArPSAxOyAvL25vdCBzdXJlIHdoeSB0aGlzIGlzIG5lY2Vzc2FyeSBidXQgd2l0aG91dCBpdCwgaXQncyBub3QgZXh0ZW5kaW5nIGZhciBlbm91Z2guLi5cbiAgfVxuICBmb3IobGV0IGkgPSAwOyBpIDwgQ29uZmlnLmN1cnJlbnRNYXAuZ3JpZC5sZW5ndGg7IGkrKykge1xuICAgIGxldCB0aWxlQ29yZHMgPSBpbmRleFRvWFkoaSk7XG4gICAgaWYodGlsZUNvcmRzLnggPj0gdmlld3BvcnQueCAmJiB0aWxlQ29yZHMueCA8PSB2aWV3cG9ydC54ICsgKENvbmZpZy5yb3dzVG9TaG93ICogMikgKyBwYWRkaW5nXG4gICAgICAgJiYgdGlsZUNvcmRzLnkgPj0gdmlld3BvcnQueSAmJiB0aWxlQ29yZHMueSA8PSB2aWV3cG9ydC55ICsgKENvbmZpZy5yb3dzVG9TaG93ICogMikgKyBwYWRkaW5nKSB7XG4gICAgICBpbmRpY2VzLnB1c2goaSk7XG4gICAgfVxuICB9XG5cbiAgcmV0dXJuIGluZGljZXM7XG59XG5cbmV4cG9ydCBjb25zdCBnZXRWYWxpZERpcmVjdGlvbiA9IChsZXZlbCwgZW50aXR5KSA9PiB7IC8vbWF5YmUgdGhpcyBzaG91bGQgYmUgaW4gZW50aXRpZXNcbiAgbGV0IGN1cnJlbnRDb29yZHMgPSBpbmRleFRvWFkoZW50aXR5LmluZGV4KTtcbiAgbGV0IGRpcmVjdGlvbnNNYXAgPSB7fTtcbiAgZGlyZWN0aW9uc01hcFtlbnRpdHkuaW5kZXggLSBDb25maWcubWFwQ29sc10gPSB7IGtleTogXCJ1cFwiIH07XG4gIGRpcmVjdGlvbnNNYXBbZW50aXR5LmluZGV4ICsgQ29uZmlnLm1hcENvbHNdID0geyBrZXk6XCJkb3duXCIgfTtcbiAgZGlyZWN0aW9uc01hcFtlbnRpdHkuaW5kZXggLSAxXSA9IHsga2V5OiBcImxlZnRcIiB9O1xuICBkaXJlY3Rpb25zTWFwW2VudGl0eS5pbmRleCArIDFdID0geyBrZXk6IFwicmlnaHRcIiB9O1xuICBkaXJlY3Rpb25zTWFwW2VudGl0eS5pbmRleCAtIENvbmZpZy5tYXBDb2xzIC0gMV0gPSB7IGtleTogXCJ1cC1sZWZ0XCIgfTtcbiAgZGlyZWN0aW9uc01hcFtlbnRpdHkuaW5kZXggLSBDb25maWcubWFwQ29scyArIDFdID0geyBrZXk6XCJ1cC1yaWdodFwiIH07XG4gIGRpcmVjdGlvbnNNYXBbZW50aXR5LmluZGV4ICsgQ29uZmlnLm1hcENvbHMgLSAxXSA9IHsga2V5OiBcImRvd24tbGVmdFwiIH07XG4gIGRpcmVjdGlvbnNNYXBbZW50aXR5LmluZGV4ICsgQ29uZmlnLm1hcENvbHMgKyAxXSA9IHsga2V5OiBcImRvd24tcmlnaHRcIiB9O1xuXG4gIGxldCBkaXJlY3Rpb25zID0gY2hlY2tGb3JWYWxpZFBvaW50cyhsZXZlbCwgZGlyZWN0aW9uc01hcCk7XG4gIHJldHVybiBkaXJlY3Rpb25zTWFwW2dldFJhbmRvbUluQXJyYXkoZGlyZWN0aW9ucyldO1xufVxuXG5jb25zdCBjaGVja0ZvclZhbGlkUG9pbnRzID0gKGxldmVsLCBwb2ludE1hcCkgPT4ge1xuICByZXR1cm4gT2JqZWN0LmtleXMocG9pbnRNYXApLmZpbHRlcigoaW5kZXgpID0+IHtcbiAgICBsZXQgdmFsaWQgPSB0cnVlO1xuICAgIGluZGV4ID0gcGFyc2VJbnQoaW5kZXgpO1xuICAgIGlmICh0aWxlRGljdGlvbmFyeVtDb25maWcuY3VycmVudE1hcC5ncmlkW2luZGV4XV0ucGFzc2libGUpIHtcbiAgICAgIHBvaW50TWFwW2luZGV4XS5lbnRpdGllcyA9IGdldEVudGl0aWVzQXRJbmRleChsZXZlbCwgaW5kZXgpOyAvL3RoaXMgc2hvdWxkIG5vdCBoYXBwZW4gdW5sZXNzIHRpbGUucGFzc2JpbGUgb24gbWFwXG4gICAgICBmb3IgKGxldCBpID0gMDsgaSA8IHBvaW50TWFwW2luZGV4XS5lbnRpdGllcy5sZW5ndGg7IGkrKykge1xuICAgICAgICBpZihwb2ludE1hcFtpbmRleF0uZW50aXRpZXNbaV0udHlwZSA9PT0gJ21vbnN0ZXInKSB7XG4gICAgICAgICAgdmFsaWQgPSBmYWxzZTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgcmV0dXJuIHZhbGlkO1xuICAgIH1cbiAgICByZXR1cm4gZmFsc2U7XG4gIH0pO1xufVxuXG5mdW5jdGlvbiBnZXRQb2ludHMoYSxiLG11bHRpcGxpZXIpe1xuICB2YXIgZGlzdCA9IE1hdGguYWJzKGEueCAtIGIueCk7XG4gIHZhciBwb2ludHMgPSBbXTtcbiAgZm9yKHZhciBpID0gMTsgaSA8IGRpc3Q7IGkrKyl7XG4gICAgcG9pbnRzLnB1c2goe3g6IGEueCtpKm11bHRpcGxpZXIueCwgeTogYS55K2kqbXVsdGlwbGllci55LCBkaXN0OiBkaXN0fSk7XG4gIH1cbiAgcmV0dXJuIHBvaW50cztcbn1cblxuZnVuY3Rpb24gZ2V0QWxsUG9pbnRzQXRSYW5nZShvcmlnaW5Qb2ludCwgZGlzdCl7XG4gIGxldCBhID0ge3g6IG9yaWdpblBvaW50LngsIHk6IG9yaWdpblBvaW50LnkgLSBkaXN0LCBkaXN0OiBkaXN0fTtcbiAgbGV0IGIgPSB7eDogb3JpZ2luUG9pbnQueCArIGRpc3QsIHk6IG9yaWdpblBvaW50LnksIGRpc3Q6IGRpc3R9O1xuICBsZXQgYyA9IHt4OiBvcmlnaW5Qb2ludC54LCB5OiBvcmlnaW5Qb2ludC55ICsgZGlzdCwgZGlzdDogZGlzdH07XG4gIGxldCBkID0ge3g6IG9yaWdpblBvaW50LnggLSBkaXN0LCB5OiBvcmlnaW5Qb2ludC55LCBkaXN0OiBkaXN0fTtcblxuICBsZXQgcG9pbnRzID0gW2EsYixjLGRdXG4gICAgICAgICAgICAgICAgLmNvbmNhdChnZXRQb2ludHMoYSxiLCB7eDogMSwgeTogMX0pKVxuICAgICAgICAgICAgICAgIC5jb25jYXQoZ2V0UG9pbnRzKGIsYywge3g6IC0xLCB5OiAxfSkpXG4gICAgICAgICAgICAgICAgLmNvbmNhdChnZXRQb2ludHMoYyxkLCB7eDogLTEsIHk6IC0xfSkpXG4gICAgICAgICAgICAgICAgLmNvbmNhdChnZXRQb2ludHMoZCxhLCB7eDogMSwgeTogLTF9KSk7XG4gIHJldHVybiBwb2ludHM7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBnZXRBbGxQb2ludHMob3JpZ2luUG9pbnQsIGRpc3Qpe1xuICBsZXQgcG9pbnRzID0gW107XG4gIGZvcih2YXIgaSA9IDE7IGkgPCBkaXN0OyBpKyspe1xuICAgIGxldCB4ID0gZ2V0QWxsUG9pbnRzQXRSYW5nZShvcmlnaW5Qb2ludCwgaSk7XG4gICAgcG9pbnRzID0gcG9pbnRzLmNvbmNhdCh4KTtcbiAgfVxuICByZXR1cm4gcG9pbnRzO1xufVxuXG5leHBvcnQgY29uc3QgZ2V0RGlyZWN0aW9uVG93YXJkc1BvaW50ID0gKGxldmVsLCBvcmlnaW4sIGRlc3QpID0+IHtcbiAgbGV0IGRpcmVjdGlvbiA9IHsgeDogMCwgeTogMCB9O1xuICBsZXQgeERpZiwgeURpZjtcbiAgeERpZiA9IGRlc3QueCAtIG9yaWdpbi54O1xuICBpZiAoeERpZiA+IDApIHtcbiAgICBkaXJlY3Rpb24ueCA9IDE7XG4gIH0gZWxzZSBpZih4RGlmIDwgMCkge1xuICAgIGRpcmVjdGlvbi54ID0gLTE7XG4gIH1cblxuICB5RGlmID0gZGVzdC55IC0gb3JpZ2luLnk7XG4gIGlmICh5RGlmID4gMCkge1xuICAgIGRpcmVjdGlvbi55ID0gMTtcbiAgfSBlbHNlIGlmKHlEaWYgPCAwKSB7XG4gICAgZGlyZWN0aW9uLnkgPSAtMTtcbiAgfVxuICBsZXQgZGlyZWN0aW9uc01hcCA9IGdldERpcmVjdGlvbkluZGljZXMob3JpZ2luLCBkaXJlY3Rpb24pO1xuICBsZXQgZGlyZWN0aW9ucyA9IGNoZWNrRm9yVmFsaWRQb2ludHMobGV2ZWwsIGRpcmVjdGlvbnNNYXApO1xuICByZXR1cm4gZGlyZWN0aW9uc01hcFtnZXRSYW5kb21JbkFycmF5KGRpcmVjdGlvbnMpXTtcbn07XG5cbmNvbnN0IGdldERpcmVjdGlvbkluZGljZXMgPSAob3JpZ2luLCBkaXJlY3Rpb24pID0+IHsgLy9taW4gMSwgbWF4IDMgcG9zc2libGl0aWVzXG4gIGxldCBwb3NzaWJsZUluZGljZXMgPSB7fTtcbiAgLy9zb21lIGRpYWdvbmFscyBzaG91bGQgZ2V0IHNlbnQgZXZlbiBpZiB0aGV5IGFyZSBwYXJhbGxlbCBidXQgc2hvdWxkIHByZWZlciB0aGUgcGFyYWxsZWwgcm91dGUuLi5cbiAgLy9zaW1pbGFybHkgaXQgc2hvdWxkIHByZWZlciBkaWFnb25hbCByb3V0ZXMgd2hlbiBhdmFpbGFibGVcbiAgLy9wYXNzIHBhY2sgdHdvIGFycmF5cywgcHJpbWFyeSBhbmQgc2Vjb25kYXJ5IHJvdXRlcywgaWYgdGhlcmUgYXJlIG5vIHZhbGlkIHByaW1hcnkgcm91dGVzIGV2YWx1YXRlIHNlY29uZGFyeSByb3V0ZXNcbiAgaWYgKGRpcmVjdGlvbi54ICE9PSAwICYmIGRpcmVjdGlvbi55ICE9PSAwKXtcbiAgICAvL2RpYWdvbmFsLCBza2lwIGZvciBub3dcbiAgICAvLyB7IHg6IG9yaWdpbi54ICsgZGlyZWN0aW9uLngsXG4gICAgLy8gIHk6IG9yaWdpbi55ICsgZGlyZWN0aW9uLnkgfVxuICAgIGlmKGRpcmVjdGlvbi55ID09PSAtMSAmJiBkaXJlY3Rpb24ueCA9PT0gLTEpIHtcbiAgICAgIHBvc3NpYmxlSW5kaWNlc1tvcmlnaW4uaW5kZXggLSBDb25maWcubWFwQ29scyAtIDFdID0geyBrZXk6IFwidXAtbGVmdFwiIH1cbiAgICB9XG4gICAgaWYoZGlyZWN0aW9uLnkgPT09IC0xICYmIGRpcmVjdGlvbi54ID09PSAxKSB7XG4gICAgICBwb3NzaWJsZUluZGljZXNbb3JpZ2luLmluZGV4IC0gQ29uZmlnLm1hcENvbHMgKyAxXSA9IHsga2V5OiBcInVwLXJpZ2h0XCIgfVxuICAgIH1cbiAgICBpZihkaXJlY3Rpb24ueSA9PT0gMSAmJiBkaXJlY3Rpb24ueCA9PT0gLTEpIHtcbiAgICAgIHBvc3NpYmxlSW5kaWNlc1tvcmlnaW4uaW5kZXggKyBDb25maWcubWFwQ29scyAtIDFdID0geyBrZXk6IFwiZG93bi1sZWZ0XCIgfVxuICAgIH1cbiAgICBpZihkaXJlY3Rpb24ueSA9PT0gMSAmJiBkaXJlY3Rpb24ueCA9PT0gMSkge1xuICAgICAgcG9zc2libGVJbmRpY2VzW29yaWdpbi5pbmRleCArIENvbmZpZy5tYXBDb2xzICsgMV0gPSB7IGtleTogXCJkb3duLXJpZ2h0XCIgfVxuICAgIH1cbiAgfVxuICBpZiAoZGlyZWN0aW9uLnkgPT09IC0xKSB7XG4gICAgLy9wb3NzaWJsZUNvb3Jkcy5wdXNoKHt4OiBvcmlnaW4ueCArIGRpcmVjdGlvbi54LCB5OiBvcmlnaW4ueX0pO1xuICAgIHBvc3NpYmxlSW5kaWNlc1tvcmlnaW4uaW5kZXggLSBDb25maWcubWFwQ29sc10gPSB7IGtleTogXCJ1cFwiIH1cbiAgfVxuICBpZiAoZGlyZWN0aW9uLnkgPT09IDEpIHtcbiAgICAvL3Bvc3NpYmxlQ29vcmRzLnB1c2goe3g6IG9yaWdpbi54LCB5OiBvcmlnaW4ueSArIGRpcmVjdGlvbi55fSk7XG4gICAgcG9zc2libGVJbmRpY2VzW29yaWdpbi5pbmRleCArIENvbmZpZy5tYXBDb2xzXSA9IHsga2V5OlwiZG93blwiIH07XG4gIH1cbiAgaWYgKGRpcmVjdGlvbi54ID09PSAtMSkge1xuICAgIC8vcG9zc2libGVDb29yZHMucHVzaCh7eDogb3JpZ2luLnggKyBkaXJlY3Rpb24ueCwgeTogb3JpZ2luLnl9KTtcbiAgICBwb3NzaWJsZUluZGljZXNbb3JpZ2luLmluZGV4IC0gMV0gPSB7IGtleTogXCJsZWZ0XCIgfVxuICB9XG4gIGlmIChkaXJlY3Rpb24ueCA9PT0gMSkge1xuICAgIC8vcG9zc2libGVDb29yZHMucHVzaCh7eDogb3JpZ2luLngsIHk6IG9yaWdpbi55ICsgZGlyZWN0aW9uLnl9KTtcbiAgICBwb3NzaWJsZUluZGljZXNbb3JpZ2luLmluZGV4ICsgMV0gPSB7IGtleTogXCJyaWdodFwiIH07XG4gIH1cbiAgLy9yZXR1cm4gcG9zc2libGVDb29yZHM7XG4gIHJldHVybiBwb3NzaWJsZUluZGljZXM7XG59O1xuXG4vL25lZWQgdG8gbWFrZSAgZGljdGlvbmFyeSB3aXRoIHRoZSA5IHBvc3NpYmxlIGRpcmVjdGlvbiB0byBjbGVhbiB1cCBzb21lIG9mIHRoaXMgZHVwbGljYXRpb25cbiIsImltcG9ydCBEaXNwYXRjaGVyIGZyb20gJy4vZGlzcGF0Y2hlcic7XG5pbXBvcnQge21vdmVFbnRpdHksIGNoZWNrSW5kZXh9IGZyb20gJy4vbWFwLXV0aWwnO1xuaW1wb3J0IHsgdGlsZURpY3Rpb25hcnkgfSBmcm9tICcuL3RpbGVzJztcbmltcG9ydCAqIGFzIEVudGl0eSBmcm9tICcuL2VudGl0aWVzJztcbmltcG9ydCB7IGJ1aWxkTWFwLCBnZXRSYW5kb21BdmFpbGFibGUgfSBmcm9tIFwiLi9yb29tR2VuXCI7XG5cbmNvbnN0IG1vZGVsID0ge1xuICBzdGF0ZToge1xuICAgIGN1cnJlbnRTY2VuZTogbnVsbCxcbiAgICBsYXN0TW92ZUZpbmlzaGVkOiB0cnVlLFxuICAgIHBsYXllck1vdmVkOiBmYWxzZVxuICB9LFxuICBzY2VuZXM6IHt9LFxuICBsZXZlbHM6IHt9LCAvL1RoaXMgbWlnaHQgbm90IGV2ZW4gbmVlZCB0byBiZSBoZXJlXG4gIGxldmVsQ291bnRlcjogMSxcbiAgcmVzdGFydCgpIHtcbiAgICB0aGlzLmxldmVsQ291bnRlciA9IDE7XG4gICAgdGhpcy5sZXZlbHMgPSB7fTtcbiAgfSxcbiAgYWRkU2NlbmUobmFtZSwgb25FbnRlciwgY29udHJvbE1hcCkge1xuICAgIC8vY29uc29sZS5sb2codGhpcyk7XG4gICAgaWYoIXRoaXMuc2NlbmVzW25hbWVdKXtcbiAgICAgIHRoaXMuc2NlbmVzW25hbWVdID0gT2JqZWN0LmFzc2lnbih7fSwgU2NlbmUsIHtcbiAgICAgICAgbmFtZSxcbiAgICAgICAgaWQ6IFNjZW5lSWQsXG4gICAgICAgIGVudGl0aWVzOiBbXSxcbiAgICAgICAgb25FbnRlcixcbiAgICAgICAgY29udHJvbE1hcFxuICAgICAgfSk7XG4gICAgICBTY2VuZUlkKys7XG4gICAgfWVsc2V7XG4gICAgICBjb25zb2xlLmVycm9yKGBTY2VuZSB3aXRoIHRoZSBuYW1lICR7bmFtZX0gYWxyZWFkeSBleGlzdHNgKTtcbiAgICB9XG4gIH0sXG4gIGNoYW5nZVNjZW5lKHNjZW5lKXtcbiAgICAvLyB0aGlzIHNob3VsZCBzZW5kIGFuIGV2ZW50IHRvIGRpc3BhdGNoZXIgdG8gcmVkcmF3IHRoZSBzY3JlZW5cbiAgICAvL2NvbnNvbGUubG9nKFwidGhpc1wiLCB0aGlzKTtcbiAgICAvLyBzY29uc29sZS5sb2coXCJjaGFuZ2Ugc2NlbmVcIik7XG4gICAgdGhpcy5zdGF0ZS5jdXJyZW50U2NlbmUgPSB0aGlzLnNjZW5lc1tzY2VuZV07XG4gICAgdGhpcy5zdGF0ZS5jdXJyZW50U2NlbmUub25FbnRlcigpO1xuICAgIERpc3BhdGNoZXIuc2VuZE1lc3NhZ2Uoe2FjdGlvbjogXCJDaGFuZ2UgU2NlbmVcIiwgcGF5bG9hZDogW3RoaXMuc3RhdGUuY3VycmVudFNjZW5lXX0pO1xuICB9LFxuICBjcmVhdGVMZXZlbChwcmV2aW91c0xldmVsLCBjb25uZWN0aW5nU3RhaXJzKSB7XG4gICAgbGV0IGxldmVsID0ge1xuICAgICAgbmFtZTogXCJsZXZlbFwiICsgdGhpcy5sZXZlbENvdW50ZXIsXG4gICAgICBtYXA6IGJ1aWxkTWFwKDI3LCAyNywgezA6IFswLDEsMl0sIDE6IFszLDRdfSksIC8vbWFwMVxuICAgICAgZW50aXRpZXM6IFtdLFxuICAgICAgYmFzZURpZmZpY3VsdHk6IHRoaXMubGV2ZWxDb3VudGVyLFxuICAgICAgdGljazogMFxuICAgIH1cbiAgICB0aGlzLmxldmVsc1tsZXZlbC5uYW1lXSA9IGxldmVsO1xuXG4gICAgRW50aXR5LmJ1aWxkRW50aXR5TWFwKGxldmVsKTtcbiAgICBpZiAocHJldmlvdXNMZXZlbCkge1xuICAgICAgbGV0IHN0YWlyVXBJbmRleCA9IGdldFJhbmRvbUF2YWlsYWJsZShsZXZlbC5tYXAsIGxldmVsLmVudGl0aWVzKTtcbiAgICAgIEVudGl0eS5idWlsZFN0YWlycyhsZXZlbCwgNiwgc3RhaXJVcEluZGV4LCBwcmV2aW91c0xldmVsLm5hbWUsIGNvbm5lY3RpbmdTdGFpcnMuaW5kZXgpO1xuICAgICAgY29ubmVjdGluZ1N0YWlycy50YXJnZXRMZXZlbCA9IGxldmVsLm5hbWU7XG4gICAgICBjb25uZWN0aW5nU3RhaXJzLnRhcmdldEluZGV4ID0gc3RhaXJVcEluZGV4LmluZGV4O1xuICAgIH1cblxuICAgIGlmICh0aGlzLmxldmVsQ291bnRlciA8IDEwKSB7XG4gICAgICBsZXQgc3RhaXJEb3duSW5kZXggPSBnZXRSYW5kb21BdmFpbGFibGUobGV2ZWwubWFwLCBsZXZlbC5lbnRpdGllcyk7XG4gICAgICBFbnRpdHkuYnVpbGRTdGFpcnMobGV2ZWwsIDcsIHN0YWlyRG93bkluZGV4KTsgLy97aW5kZXg6IDI5LCB4OiAyLCB5OjF9XG4gICAgfVxuICAgIGlmKHRoaXMubGV2ZWxDb3VudGVyID09PSAxMCkge1xuICAgICAgbGV0IGRyYWdvbkluZGV4ID0gZ2V0UmFuZG9tQXZhaWxhYmxlKGxldmVsLm1hcCwgbGV2ZWwuZW50aXRpZXMpO1xuICAgICAgRW50aXR5LmJ1aWxkTW9uc3RlcihsZXZlbCwgMTUsIGRyYWdvbkluZGV4KTtcbiAgICB9XG5cbiAgICBFbnRpdHkucG9wdWxhdGVMZXZlbChsZXZlbCk7XG5cbiAgICB0aGlzLmxldmVsc1tsZXZlbC5uYW1lXSA9IGxldmVsO1xuICAgIHRoaXMubGV2ZWxDb3VudGVyKys7XG4gICAgcmV0dXJuIGxldmVsO1xuICB9LFxuICBoYW5kbGVLZXlQcmVzcyhrZXkpIHtcbiAgICAvL2NvbnNvbGUubG9nKGtleSlcbiAgICAvLyBjb25zb2xlLmxvZyhcInRoaXNcIiwgdGhpcywgdGhpcy5zdGF0ZSk7XG4gICAgbGV0IHJlcXVlc3Q7XG4gICAgaWYodHlwZW9mIHRoaXMuc3RhdGUuY3VycmVudFNjZW5lLmNvbnRyb2xNYXBba2V5XSA9PT0gXCJmdW5jdGlvblwiKXtcbiAgICAgIHJlcXVlc3QgPSB0aGlzLnN0YXRlLmN1cnJlbnRTY2VuZS5jb250cm9sTWFwW2tleV0oKTtcbiAgICB9XG4gICAgaWYocmVxdWVzdCl7XG4gICAgICAgIHJlcXVlc3QuYWN0aW9uKC4uLnJlcXVlc3QuYXJncyk7XG4gICAgfVxuICB9LFxufTtcblxuY29uc3QgU2NlbmUgPSB7XG4gIGlkOiBudWxsLFxuICBlbnRpdGllczogbnVsbCxcbiAgb25FbnRlcjogbnVsbCxcbiAgY29udHJvbGxlck1hcDogbnVsbFxufTtcbmxldCBTY2VuZUlkID0gMDtcblxuRGlzcGF0Y2hlci5hZGRMaXN0ZW5lcihtb2RlbCk7XG5EaXNwYXRjaGVyLmFkZEFjdGlvbihtb2RlbCwge25hbWU6IFwiS2V5IFByZXNzXCIsIHRyaWdnZXI6IG1vZGVsLmhhbmRsZUtleVByZXNzLmJpbmQobW9kZWwpfSk7XG5cblxuZXhwb3J0IGRlZmF1bHQgbW9kZWw7XG4iLCJpbXBvcnQgTW9kZWwgZnJvbSBcIi4vbW9kZWxcIjtcbmltcG9ydCB7IEdhbWUgfSBmcm9tICcuL2dhbWUnO1xuXG5jb25zdCBjb250cm9sbGVyTWFwcyA9IHtcbiAgc3RhcnQ6IHtcbiAgICBcIkVudGVyXCI6ICgpID0+IHsgcmV0dXJuIHthY3Rpb246IE1vZGVsLmNoYW5nZVNjZW5lLmJpbmQoTW9kZWwpLCBhcmdzOiBbXCJwbGF5XCJdfTsgfSxcbiAgICBcIm1cIjogKCkgPT4geyByZXR1cm4ge2FjdGlvbjogR2FtZS50b2dnbGVNdXNpYy5iaW5kKEdhbWUpLCBhcmdzOiBbXX07IH1cbiAgfSxcbiAgcGxheToge1xuICAgIC8vXCJFbnRlclwiOiAoKSA9PiB7IHJldHVybiB7YWN0aW9uOiBNb2RlbC5jaGFuZ2VTY2VuZS5iaW5kKE1vZGVsKSwgYXJnczogW1wiZ2FtZU92ZXJcIl19OyB9LFxuICAgIFwiQXJyb3dVcFwiOiAoKSA9PiB7IHJldHVybiB7YWN0aW9uOiBHYW1lLm1vdmVQbGF5ZXIuYmluZChHYW1lKSwgYXJnczogW1widXBcIl19OyB9LFxuICAgIFwiQXJyb3dEb3duXCI6ICgpID0+IHsgcmV0dXJuIHthY3Rpb246IEdhbWUubW92ZVBsYXllci5iaW5kKEdhbWUpLCBhcmdzOiBbXCJkb3duXCJdfTsgfSxcbiAgICBcIkFycm93TGVmdFwiOiAoKSA9PiB7IHJldHVybiB7YWN0aW9uOiBHYW1lLm1vdmVQbGF5ZXIuYmluZChHYW1lKSwgYXJnczogW1wibGVmdFwiXX07IH0sXG4gICAgXCJBcnJvd1JpZ2h0XCI6ICgpID0+IHsgcmV0dXJuIHthY3Rpb246IEdhbWUubW92ZVBsYXllci5iaW5kKEdhbWUpLCBhcmdzOiBbXCJyaWdodFwiXX07IH0sXG4gICAgXCI4XCI6ICgpID0+IHsgcmV0dXJuIHthY3Rpb246IEdhbWUubW92ZVBsYXllci5iaW5kKEdhbWUpLCBhcmdzOiBbXCJ1cFwiXX07IH0sXG4gICAgXCIyXCI6ICgpID0+IHsgcmV0dXJuIHthY3Rpb246IEdhbWUubW92ZVBsYXllci5iaW5kKEdhbWUpLCBhcmdzOiBbXCJkb3duXCJdfTsgfSxcbiAgICBcIjRcIjogKCkgPT4geyByZXR1cm4ge2FjdGlvbjogR2FtZS5tb3ZlUGxheWVyLmJpbmQoR2FtZSksIGFyZ3M6IFtcImxlZnRcIl19OyB9LFxuICAgIFwiNlwiOiAoKSA9PiB7IHJldHVybiB7YWN0aW9uOiBHYW1lLm1vdmVQbGF5ZXIuYmluZChHYW1lKSwgYXJnczogW1wicmlnaHRcIl19OyB9LFxuICAgIFwiN1wiOiAoKSA9PiB7IHJldHVybiB7YWN0aW9uOiBHYW1lLm1vdmVQbGF5ZXIuYmluZChHYW1lKSwgYXJnczogW1widXAtbGVmdFwiXX07IH0sXG4gICAgXCI5XCI6ICgpID0+IHsgcmV0dXJuIHthY3Rpb246IEdhbWUubW92ZVBsYXllci5iaW5kKEdhbWUpLCBhcmdzOiBbXCJ1cC1yaWdodFwiXX07IH0sXG4gICAgXCIxXCI6ICgpID0+IHsgcmV0dXJuIHthY3Rpb246IEdhbWUubW92ZVBsYXllci5iaW5kKEdhbWUpLCBhcmdzOiBbXCJkb3duLWxlZnRcIl19OyB9LFxuICAgIFwiM1wiOiAoKSA9PiB7IHJldHVybiB7YWN0aW9uOiBHYW1lLm1vdmVQbGF5ZXIuYmluZChHYW1lKSwgYXJnczogW1wiZG93bi1yaWdodFwiXX07IH0sXG4gICAgXCI1XCI6ICgpID0+IHsgcmV0dXJuIHthY3Rpb246IEdhbWUubW92ZVBsYXllci5iaW5kKEdhbWUpLCBhcmdzOiBbXCJ3YWl0XCJdfTsgfSxcbiAgICBcIndcIjogKCkgPT4geyByZXR1cm4ge2FjdGlvbjogR2FtZS5tb3ZlUGxheWVyLmJpbmQoR2FtZSksIGFyZ3M6IFtcInVwXCJdfTsgfSxcbiAgICBcInhcIjogKCkgPT4geyByZXR1cm4ge2FjdGlvbjogR2FtZS5tb3ZlUGxheWVyLmJpbmQoR2FtZSksIGFyZ3M6IFtcImRvd25cIl19OyB9LFxuICAgIFwiYVwiOiAoKSA9PiB7IHJldHVybiB7YWN0aW9uOiBHYW1lLm1vdmVQbGF5ZXIuYmluZChHYW1lKSwgYXJnczogW1wibGVmdFwiXX07IH0sXG4gICAgXCJkXCI6ICgpID0+IHsgcmV0dXJuIHthY3Rpb246IEdhbWUubW92ZVBsYXllci5iaW5kKEdhbWUpLCBhcmdzOiBbXCJyaWdodFwiXX07IH0sXG4gICAgXCJxXCI6ICgpID0+IHsgcmV0dXJuIHthY3Rpb246IEdhbWUubW92ZVBsYXllci5iaW5kKEdhbWUpLCBhcmdzOiBbXCJ1cC1sZWZ0XCJdfTsgfSxcbiAgICBcImVcIjogKCkgPT4geyByZXR1cm4ge2FjdGlvbjogR2FtZS5tb3ZlUGxheWVyLmJpbmQoR2FtZSksIGFyZ3M6IFtcInVwLXJpZ2h0XCJdfTsgfSxcbiAgICBcInpcIjogKCkgPT4geyByZXR1cm4ge2FjdGlvbjogR2FtZS5tb3ZlUGxheWVyLmJpbmQoR2FtZSksIGFyZ3M6IFtcImRvd24tbGVmdFwiXX07IH0sXG4gICAgXCJjXCI6ICgpID0+IHsgcmV0dXJuIHthY3Rpb246IEdhbWUubW92ZVBsYXllci5iaW5kKEdhbWUpLCBhcmdzOiBbXCJkb3duLXJpZ2h0XCJdfTsgfSxcbiAgICBcInNcIjogKCkgPT4geyByZXR1cm4ge2FjdGlvbjogR2FtZS5tb3ZlUGxheWVyLmJpbmQoR2FtZSksIGFyZ3M6IFtcIndhaXRcIl19OyB9LFxuICAgIFwibVwiOiAoKSA9PiB7IHJldHVybiB7YWN0aW9uOiBHYW1lLnRvZ2dsZU11c2ljLmJpbmQoR2FtZSksIGFyZ3M6IFtdfTsgfVxuICB9LFxuICBnYW1lT3Zlcjoge1xuICAgIFwiRW50ZXJcIjogKCkgPT4geyByZXR1cm4ge2FjdGlvbjogTW9kZWwuY2hhbmdlU2NlbmUuYmluZChNb2RlbCksIGFyZ3M6IFtcInN0YXJ0XCJdfTsgfVxuICB9XG59O1xuZXhwb3J0IGRlZmF1bHQgY29udHJvbGxlck1hcHM7XG4vLyBJJ2QgbGlrZSB0byBjcmVhdGUgdGhpcyBkeW5hbWljYWxseSwgbm90IGVudGlyZWx5IGNvbnZpbmNlZCB0aGF0IGl0IG1ha2VzIHNlbnNlXG4vLyBUaGUgYmluZGluZyBgTW9kZWwuY2hhbmdlU2NlbmUuYmluZChNb2RlbClgIHNlZW1zIHJlYWxseSBxdWlya3ksIGdvdHRhIGxvb2sgaW50byB3aHkgdGhlIGNvbnRleHQgaXMgZ2V0dGluZyBvYmxpdGVyYXRlZCB3aGVuIGl0J3Mgbm90IHNvIGxhdGUuXG4iLCJleHBvcnQgbGV0IHNwcml0ZXNoZWV0ID0ge1xuICBzaGVldDogbmV3IEltYWdlKCksXG4gIHN0YXJ0OiBuZXcgSW1hZ2UoKSxcbiAgZW5kOiBuZXcgSW1hZ2UoKSxcbiAgaXRlbXNUb0xvYWQ6IDAsXG4gIGl0ZW1zTG9hZGVkOiAwLFxuICBmaW5pc2hlZExvYWRpbmcoKSB7XG4gICAgY29uc29sZS5sb2coXCJmaW5pc2hlZExvYWRpbmcgY2FsbGVkXCIpXG4gICAgaWYodGhpcy5pdGVtc1RvTG9hZCA9PT0gdGhpcy5pdGVtc0xvYWRlZCkge1xuICAgICAgY29uc29sZS5sb2coXCJsb2FkZWRpbmcgZG9uZVwiLCB0aGlzLmNhbGxiYWNrcylcbiAgICAgIGZvcihsZXQgaSA9IDA7IGkgPCB0aGlzLmNhbGxiYWNrcy5sZW5ndGg7IGkrKyl7XG4gICAgICAgIHRoaXMuY2FsbGJhY2tzW2ldKCk7XG4gICAgICB9XG4gICAgfVxuICB9LFxuICBjYWxsYmFja3M6IFtdLFxuICByZXNldCgpIHtcbiAgICB0aGlzLml0ZW1zVG9Mb2FkID0gMDtcbiAgICB0aGlzLml0ZW1zTG9hZGVkID0gMDtcbiAgICB0aGlzLmNhbGxiYWNrcyA9IFtdO1xuICAgIHRoaXMuc2hlZXQgPSBuZXcgSW1hZ2UoKSxcbiAgICB0aGlzLnN0YXJ0ID0gbmV3IEltYWdlKCksXG4gICAgdGhpcy5lbmQgPSBuZXcgSW1hZ2UoKVxuICB9XG59XG5cblxuZXhwb3J0IGNvbnN0IGxvYWRTcHJpdGVzaGVldCA9IChzb3VyY2UsIHRpbGVTaXplLCBzaGVldFNpemUsIGNhbGxiYWNrKSA9PiB7XG4gIHNwcml0ZXNoZWV0LnNoZWV0LnNyYyA9IHNvdXJjZTtcbiAgc3ByaXRlc2hlZXQudGlsZVNpemUgPSB0aWxlU2l6ZTtcbiAgc3ByaXRlc2hlZXQuc2hlZXRTaXplID0gc2hlZXRTaXplO1xuICBzcHJpdGVzaGVldC5zaGVldENvbHMgPSBzaGVldFNpemUgLyB0aWxlU2l6ZTtcbiAgc3ByaXRlc2hlZXQuaXRlbXNUb0xvYWQrKztcbiAgaWYoY2FsbGJhY2spe1xuICAgIHNwcml0ZXNoZWV0LmNhbGxiYWNrcy5wdXNoKGNhbGxiYWNrKTtcbiAgfVxuICBzcHJpdGVzaGVldC5zaGVldC5vbmxvYWQgPSAoKSA9PiB7XG4gICAgLy9jYWxsYmFjaygpO1xuICAgIHNwcml0ZXNoZWV0Lml0ZW1zTG9hZGVkKys7XG4gICAgc3ByaXRlc2hlZXQuZmluaXNoZWRMb2FkaW5nKCk7XG4gIH07XG59XG5cbmV4cG9ydCBjb25zdCBsb2FkSW1hZ2UgPSAoc291cmNlLCB0YXJnZXQsIGNhbGxiYWNrKSA9PiB7IC8vbWVyZ2UgdGhlc2UgdHdvXG4gIHNwcml0ZXNoZWV0W3RhcmdldF0uc3JjID0gc291cmNlO1xuICBzcHJpdGVzaGVldC5pdGVtc1RvTG9hZCsrO1xuICBpZihjYWxsYmFjayl7XG4gICAgc3ByaXRlc2hlZXQuY2FsbGJhY2tzLnB1c2goY2FsbGJhY2spO1xuICB9XG4gIHNwcml0ZXNoZWV0W3RhcmdldF0ub25sb2FkID0gKCkgPT4ge1xuICAgIC8vY2FsbGJhY2soKTtcbiAgICBzcHJpdGVzaGVldC5pdGVtc0xvYWRlZCsrO1xuICAgIHNwcml0ZXNoZWV0LmZpbmlzaGVkTG9hZGluZygpO1xuICB9O1xufVxuIiwiZXhwb3J0IGxldCBtZXNzYWdlTG9nID0ge1xuICBtZXNzYWdlczogW10sXG4gIGN1cnJlbnRTdGF0czoge30sXG4gIGVuZEdhbWU6IHt9LFxuICBzdGFydEdhbWU6IHt9LFxuICByZXNldCgpe1xuICAgIHRoaXMubWVzc2FnZXMgPSBbXCJUaGUgZWdnIG9mIHRoZSBibGFjayBkcmFnb24gd2hvIGtpbGxlZCB5b3VyIGZhdGhlcidzIGZhbWlseSBoYXMgaGF0Y2hlZFwiLFxuICAgIFwiRGVlcCBhdCB0aGUgYm90dG9tIG9mIGEgbW91bnRhaW4gZm9ydHJlc3MgdGhlIGhhdGNobGluZyBnYXRoZXJzIHBvd2VyXCIsXG4gICAgXCJWZW50dXJlIGZvcnRoIGFuZCBraWxsIHRoZSBibGFjayBkcmFnb24gd2VscCBiZWZvcmUgaXQncyB0b28gbGF0ZSFcIl07XG4gICAgdGhpcy5jdXJyZW50U3RhdHMgPSB7fTtcbiAgICB0aGlzLmVuZEdhbWUgPSB7bWVzc2FnZXM6IFtcbiAgICAgIHt0ZXh0OiBcIkdhbWUgT3ZlclwiLCBzaXplOiA0MCwgeDoyMDAsIHk6MTUwfSxcbiAgICAgIHt0ZXh0OiBcIkhpdCBFbnRlclwiLCBzaXplOiAyNCwgeDoyNTAsIHk6NjAwfVxuICAgIF19O1xuICAgIHRoaXMuc3RhcnRHYW1lID0ge21lc3NhZ2VzOiBbXG4gICAgICB7dGV4dDogXCJXZWxjb21lIHRvIEJsYWNrIERyYWdvbiAyOiBEcmFnb24gU3Bhd25cIiwgc2l6ZTogMjQsIHg6MTIwLCB5OjY4MH0sXG4gICAgICB7dGV4dDogXCJIaXQgRW50ZXIgdG8gc3RhcnRcIiwgc2l6ZTogMjQsIHg6MjIwLCB5OjcxMH0sXG4gICAgICB7dGV4dDogXCJDb250cm9sIHVzaW5nIHRoZSBudW1iZXIgcGFkIG9yIGtleSBRLUMsIE0gdG8gdG9nZ2xlIG11c2ljXCIsIHNpemU6IDI0LCB4OiA1NSwgeTogNzQwfVxuICAgIF19O1xuICB9XG59O1xuXG5tZXNzYWdlTG9nLnJlc2V0KCk7XG4iLCJpbXBvcnQgQ29uZmlnIGZyb20gXCIuL2NvbmZpZ1wiO1xuaW1wb3J0IHtjdHh9IGZyb20gXCIuL2NhbnZhc1wiO1xuaW1wb3J0IHtzcHJpdGVzaGVldH0gZnJvbSBcIi4vc3ByaXRlc1wiO1xuaW1wb3J0IHtidWlsZEVudGl0eU1hcH0gZnJvbSBcIi4vZW50aXRpZXNcIjtcbmltcG9ydCAqIGFzIE1hcFV0aWwgZnJvbSBcIi4vbWFwLXV0aWxcIjtcbmltcG9ydCBNb2RlbCBmcm9tIFwiLi9tb2RlbFwiO1xuaW1wb3J0IERpc3BhdGNoZXIgZnJvbSBcIi4vZGlzcGF0Y2hlclwiO1xuaW1wb3J0IHsgbWVzc2FnZUxvZyB9IGZyb20gJy4vbWVzc2FnZUxvZyc7XG5cbmxldCBjdXJyZW50Q29vcmRzID0gbnVsbDtcbmxldCB0cmFuc2xhdGVPZmZzZXQgPSB7eDogMCwgeTogMH07XG5sZXQgdG9wT2ZmZXN0ID0gMTAwO1xuXG5sZXQgZmFkZU91dCA9IGZhbHNlO1xubGV0IGZhZGVJbiA9IGZhbHNlO1xubGV0IGFuaW1hdGlvbkNvdW50ZXIgPSAwO1xuXG5leHBvcnQgY29uc3QgZHJhdyA9IChzdGF0ZSkgPT4ge1xuICBjdHguY2xlYXJSZWN0KDAsIDAsIENvbmZpZy5jYW52YXNXaWR0aCwgQ29uZmlnLmNhbnZhc0hlaWdodCk7XG5cbiAgaWYoc3RhdGUuY3VycmVudFNjZW5lLm5hbWUgPT09IFwic3RhcnRcIikge1xuICAgZHJhd0NvdmVyKFwic3RhcnRcIik7XG4gICBkcmF3SW5zdHJ1Y3Rpb25zKFwic3RhcnRHYW1lXCIpO1xuICB9XG5cbiAgaWYoc3RhdGUuY3VycmVudFNjZW5lLm5hbWUgPT09IFwiZ2FtZU92ZXJcIikge1xuICAgLy9kcmF3Q292ZXIoXCJnYXZlT3ZlclwiKTtcbiAgIGN0eC5maWxsU3R5bGUgPSBcIiMwMDBcIjtcbiAgIGN0eC5maWxsUmVjdCgwLCAwLCBDb25maWcuY2FudmFzV2lkdGgsIENvbmZpZy5jYW52YXNIZWlnaHQpO1xuICAgZHJhd0luc3RydWN0aW9ucyhcImVuZEdhbWVcIik7XG4gIH1cblxuICBpZihzdGF0ZS5jdXJyZW50U2NlbmUuY3VycmVudExldmVsICYmIHN0YXRlLmN1cnJlbnRTY2VuZS5jdXJyZW50TGV2ZWwubWFwKSB7IC8vVGVtcG9yYXJ5XG4gICAgY3R4LnNhdmUoKTtcbiAgICBsZXQgY3VycmVudENvb3JkcyA9IE1hcFV0aWwuaW5kZXhUb1hZKE1vZGVsLnN0YXRlLnBsYXllci5pbmRleCk7XG4gICAgbGV0IHNpZ2h0UG9pbnRzID0gTWFwVXRpbC5nZXRBbGxQb2ludHMoY3VycmVudENvb3JkcywgNCk7XG4gICAgbGV0IHNpZ2h0SW5kaWNlcyA9IHNpZ2h0UG9pbnRzLm1hcCgocCkgPT4ge1xuICAgICAgcmV0dXJuIE1hcFV0aWwueHlUb0luZGV4KHApO1xuICAgIH0pO1xuICAgIHNpZ2h0SW5kaWNlcy5wdXNoKE1vZGVsLnN0YXRlLnBsYXllci5pbmRleCk7XG4gICAgbGV0IHZpZXdwb3J0ID0gTWFwVXRpbC5nZXRJbmRpY2VzSW5WaWV3cG9ydCgxKTtcbiAgICAvL2NvbnNvbGUubG9nKHZpZXdwb3J0Lmxlbmd0aCk7XG4gICAgLy9jb25zb2xlLmxvZyh0cmFuc2xhdGVPZmZzZXQpO1xuICAgIC8vY3R4LnRyYW5zbGF0ZSh0cmFuc2xhdGVPZmZzZXQueCAqIC1zcHJpdGVzaGVldC50aWxlU2l6ZSwgdHJhbnNsYXRlT2Zmc2V0LnkgKiAtc3ByaXRlc2hlZXQudGlsZVNpemUpO1xuICAgIGN0eC50cmFuc2xhdGUodHJhbnNsYXRlT2Zmc2V0LngsIHRyYW5zbGF0ZU9mZnNldC55ICsgdG9wT2ZmZXN0KTtcbiAgICBkcmF3TWFwKHN0YXRlLmN1cnJlbnRTY2VuZS5jdXJyZW50TGV2ZWwubWFwLCB2aWV3cG9ydCk7XG4gICAgZHJhd0VudGl0aWVzKHN0YXRlLmN1cnJlbnRTY2VuZS5jdXJyZW50TGV2ZWwsIHNpZ2h0SW5kaWNlcywgdmlld3BvcnQpO1xuICAgIGRyYXdGb2coc3RhdGUuY3VycmVudFNjZW5lLmN1cnJlbnRMZXZlbC5tYXAsIHNpZ2h0SW5kaWNlcywgdmlld3BvcnQpO1xuICAgIGN0eC5yZXN0b3JlKCk7XG4gICAgY3R4LmZpbGxTdHlsZSA9IFwiIzAwMDAwMFwiO1xuICAgIGN0eC5maWxsUmVjdCgwLCAwLCBDb25maWcuY2FudmFzV2lkdGgsIHRvcE9mZmVzdCk7XG4gICAgY3R4LmZpbGxSZWN0KDAsIENvbmZpZy5jYW52YXNIZWlnaHQgLSB0b3BPZmZlc3QsIENvbmZpZy5jYW52YXNXaWR0aCwgQ29uZmlnLmNhbnZhc0hlaWdodCk7XG5cbiAgICBpZihmYWRlT3V0KXtcbiAgICAgIGRyYXdGYWRlKCk7XG4gICAgfVxuICAgIGRyYXdTdGF0cyhtZXNzYWdlTG9nLmN1cnJlbnRTdGF0cyk7XG4gICAgZHJhd0xvZyhtZXNzYWdlTG9nLm1lc3NhZ2VzKTtcbiAgfVxuXG59XG5cbmNvbnN0IGRyYXdGYWRlID0gKCkgPT4ge1xuICBhbmltYXRpb25Db3VudGVyKys7XG4gIGxldCBjdXJBbHBoYTtcbiAgaWYgKGZhZGVJbil7XG4gICAgaWYgKGFuaW1hdGlvbkNvdW50ZXIgPD0gMTYpIHtcbiAgICAgIGN1ckFscGhhID0gYW5pbWF0aW9uQ291bnRlciAvIDE2O1xuICAgIH1cbiAgICBpZiAoYW5pbWF0aW9uQ291bnRlciA+IDE2KSB7XG4gICAgICBsZXQgZmFkZUluID0gKDE2IC0gKGFuaW1hdGlvbkNvdW50ZXIgJSAxNikpIC8gMTY7XG4gICAgICBjdXJBbHBoYSA9IE1hdGguZmxvb3IoYW5pbWF0aW9uQ291bnRlciAvIDIpICUgMTY7XG4gICAgfVxuICAgIGlmIChhbmltYXRpb25Db3VudGVyID09PSAzMikge1xuICAgICAgY3VyQWxwaGEgPSAwO1xuICAgIH1cbiAgfSBlbHNlIHtcbiAgICBjdXJBbHBoYSA9IGFuaW1hdGlvbkNvdW50ZXIgLyAzMlxuICB9XG4gIGN0eC5maWxsU3R5bGUgPSBgcmdiYSgwLDAsMCwke2N1ckFscGhhfSlgO1xuICBjdHguZmlsbFJlY3QoMCwgMCwgQ29uZmlnLmNhbnZhc1dpZHRoLCBDb25maWcuY2FudmFzSGVpZ2h0KTtcbiAgaWYgKGFuaW1hdGlvbkNvdW50ZXIgPT09IDMyKSB7XG4gICAgYW5pbWF0aW9uQ291bnRlciA9IDA7XG4gICAgZmFkZUluID0gZmFsc2U7XG4gICAgZmFkZU91dCA9IGZhbHNlO1xuICB9XG59XG5cbmNvbnN0IGRyYXdJbnN0cnVjdGlvbnMgPSAoc2NlbmUpID0+IHtcbiAgbGV0IG1lc3NhZ2VzID0gbWVzc2FnZUxvZ1tzY2VuZV0ubWVzc2FnZXM7XG4gIGN0eC5maWxsU3R5bGUgPSBcIiNmZmZcIjtcbiAgZm9yKGxldCBpID0gMDsgaSA8IG1lc3NhZ2VzLmxlbmd0aDsgaSsrKXtcbiAgICBjdHguZm9udCA9IGAke21lc3NhZ2VzW2ldLnNpemV9cHggT3JhbmdlIEtpZGA7XG4gICAgY3R4LmZpbGxUZXh0KG1lc3NhZ2VzW2ldLnRleHQsIG1lc3NhZ2VzW2ldLngsIG1lc3NhZ2VzW2ldLnkpO1xuICB9XG59XG5jb25zdCBzZXRDYW1lcmFPZmZzZXQgPSAoKSA9PiB7XG4gIC8vY29uc29sZS5sb2coXCJ0aGlzIGdvdCBjYWxsZWRcIik7XG4gIGN1cnJlbnRDb29yZHMgPSBNYXBVdGlsLmluZGV4VG9YWShNb2RlbC5zdGF0ZS5wbGF5ZXIuaW5kZXgpOyAvL29ubHkgZ2V0IHRoaXMgb24gc2NlbmUvbGV2ZWwgY2hhbmdlXG4gIHRyYW5zbGF0ZU9mZnNldCA9IE1hcFV0aWwuZ2V0VHJhbnNsYXRpb24oY3VycmVudENvb3Jkcyk7IC8vICcnXG4gIHRyYW5zbGF0ZU9mZnNldC54ICo9IC1Db25maWcudGlsZVNpemU7XG4gIHRyYW5zbGF0ZU9mZnNldC55ICo9IC1Db25maWcudGlsZVNpemU7XG4gIC8vIEkgZG9uJ3Qga25vdyBpZiBJIHJlYWxseSB3YW50IHRvIHB1dCB0aGlzIGhlcmUgYnV0IGp1c3QgZm9yIHRoZSBzYWtlIG9mIHNpbXBsaWNpdHlcbiAgQ29uZmlnLnRyYW5zbGF0ZU9mZnNldCA9IHRyYW5zbGF0ZU9mZnNldDtcbn1cblxuLy9UT0RPIERSWSB1cCB0aGVzZSB0d28gbWV0aG9kc1xuY29uc3QgZHJhd0VudGl0aWVzID0gKGxldmVsLCBzaWdodEluZGljZXMsIHZpZXdwb3J0KSA9PiB7IC8vVGVtcG9yYXJ5XG4gIC8vYnVpbGRFbnRpdHlNYXAobGV2ZWwpO1xuICAvL2NvbnNvbGUubG9nKFwiZW50aXRpZXNNYXBcIiwgbGV2ZWwuZW50aXRpZXNNYXApO1xuICAvLyBkcmF3TWFwKGxldmVsLmVudGl0aWVzTWFwKTtcbiAgLy8gbmVlZCB0byBkcmF3IGVudGl0aWVzIGJ5IFggYW5kIFkgdmFsdWVzIHNvIHRoYXQgSSBjYW4gYW5pbWF0ZSB0aGVtLFxuICAvLyBwcm9iYWJseSBhbHNvIG5lZWQgdG8gc3RvcmUgdGhlIG9mZnNldCBhcyBYIGFuZCBZIHNvIHRoZSBzY3JlZW4gc2hpZnQgd2lsbCBhbHNvIGJlIHNtb290aFxuICBmb3IobGV0IGkgPSAwOyBpIDwgIGxldmVsLmVudGl0aWVzLmxlbmd0aDsgaSsrKXtcbiAgICBsZXQgZW50aXR5ID0gbGV2ZWwuZW50aXRpZXNbaV07XG4gICAgLy9jb25zb2xlLmxvZyhlbnRpdHkpO1xuICAgIGlmICh2aWV3cG9ydC5pbmRleE9mKGVudGl0eS5pbmRleCkgIT09IC0xICYmIChzaWdodEluZGljZXMuaW5kZXhPZihlbnRpdHkuaW5kZXgpICE9PSAtMSB8fCBlbnRpdHkudHlwZSAhPT0gXCJtb25zdGVyXCIpKSB7XG4gICAgLy9jb25zb2xlLmxvZyhlbnRpdHkueCwgZW50aXR5LnkpO1xuICAgIC8vIHRoZXNlIHByb3BlcnRpZXMgY2FuIGJlIHN0b3JlZCBvbiB0aGUgZW50aXR5IGl0c2VsZiByYXRoZXIgdGhhbiBiZSBjYWxjdWxhdGVkIGV2ZXJ5dGltZVxuICAgICAgbGV0IHN4ID0gKGVudGl0eS5rZXkgJSBzcHJpdGVzaGVldC5zaGVldENvbHMpICogc3ByaXRlc2hlZXQudGlsZVNpemU7XG4gICAgICBsZXQgc3kgPSBNYXRoLmZsb29yKGVudGl0eS5rZXkgLyBzcHJpdGVzaGVldC5zaGVldENvbHMpICogc3ByaXRlc2hlZXQudGlsZVNpemU7XG4gICAgICBjdHguZHJhd0ltYWdlKHNwcml0ZXNoZWV0LnNoZWV0LCBzeCwgc3ksIHNwcml0ZXNoZWV0LnRpbGVTaXplLCBzcHJpdGVzaGVldC50aWxlU2l6ZSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZW50aXR5LngsIGVudGl0eS55LCBDb25maWcudGlsZVNpemUsIENvbmZpZy50aWxlU2l6ZSk7XG4gICAgfVxuICB9XG59XG5cbmNvbnN0IGRyYXdNYXAgPSAobWFwLCB2aWV3cG9ydCkgPT4geyAvL2NoZWNrIHZpZXdwb3J0IGhlcmUgYW5kIG9ubHkgZHJhdyB3aGF0J3MgaW4gdGhlIHZpZXdwb3J0XG4gIGZvcihsZXQgaSA9IDAsIGxlbiA9IG1hcC5ncmlkLmxlbmd0aDsgIGkgPCBsZW47IGkrKyl7XG4gICAgbGV0IHRpbGUgPSBtYXAuZ3JpZFtpXTtcbiAgICBpZih2aWV3cG9ydC5pbmRleE9mKGkpICE9PSAtMSAmJiAodGlsZSAhPT0gMCB8fCBtYXAuaXNCRykpe1xuICAgICAgbGV0IHggPSAoaSAlIG1hcC5tYXBDb2xzKSAqIENvbmZpZy50aWxlU2l6ZTsgLy8gaW5kZXggLyB3aWR0aCBvZiBkcmF3aW5nIGFyZWEgaW4gdGlsZXMgKiB0aWxlIHNpemVcbiAgICAgIGxldCB5ID0gTWF0aC5mbG9vcihpIC8gbWFwLm1hcENvbHMpICogQ29uZmlnLnRpbGVTaXplO1xuICAgICAgbGV0IHN4ID0gKHRpbGUgJSBzcHJpdGVzaGVldC5zaGVldENvbHMpICogc3ByaXRlc2hlZXQudGlsZVNpemUgLy8gdGlsZSB2YWx1ZSBhZ2FpbnN0IHdpZHRoIG9mIHRpbGVzaGVldCBpbiB0aWxlcyAqIHRpbGUgc2l6ZSBvbiBzaGVldFxuICAgICAgbGV0IHN5ID0gTWF0aC5mbG9vcih0aWxlIC8gc3ByaXRlc2hlZXQuc2hlZXRDb2xzKSAqIHNwcml0ZXNoZWV0LnRpbGVTaXplO1xuICAgICAgY3R4LmRyYXdJbWFnZShzcHJpdGVzaGVldC5zaGVldCwgc3gsIHN5LCBzcHJpdGVzaGVldC50aWxlU2l6ZSwgc3ByaXRlc2hlZXQudGlsZVNpemUsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHgsIHksIENvbmZpZy50aWxlU2l6ZSArIDEsIENvbmZpZy50aWxlU2l6ZSArIDEpO1xuICAgIH1cbiAgfVxufTtcbmNvbnN0IGRyYXdGb2cgPSAobWFwLCBzaWdodEluZGljZXMsIHZpZXdwb3J0KSA9PiB7XG4gIGZvcihsZXQgaSA9IDAsIGxlbiA9IG1hcC5ncmlkLmxlbmd0aDsgIGkgPCBsZW47IGkrKyl7XG4gICAgaWYgKHZpZXdwb3J0LmluZGV4T2YoaSkgIT09IC0xICYmIHNpZ2h0SW5kaWNlcy5pbmRleE9mKGkpID09PSAtMSkge1xuICAgICAgbGV0IHggPSAoaSAlIG1hcC5tYXBDb2xzKSAqIENvbmZpZy50aWxlU2l6ZTsgLy8gaW5kZXggLyB3aWR0aCBvZiBkcmF3aW5nIGFyZWEgaW4gdGlsZXMgKiB0aWxlIHNpemVcbiAgICAgIGxldCB5ID0gTWF0aC5mbG9vcihpIC8gbWFwLm1hcENvbHMpICogQ29uZmlnLnRpbGVTaXplO1xuICAgICAgY3R4LmZpbGxTdHlsZSA9ICdyZ2JhKDAsIDAsIDAsIDAuNiknO1xuICAgICAgY3R4LmZpbGxSZWN0KHgsIHksIENvbmZpZy50aWxlU2l6ZSwgQ29uZmlnLnRpbGVTaXplKTtcbiAgICB9XG4gIH1cbn1cbmNvbnN0IGRyYXdTdGF0cyA9IChzdGF0cykgPT4ge1xuICBjdHguZmlsbFN0eWxlID0gXCIjZmZmXCI7XG4gIGN0eC5mb250ID0gXCIyNXB4IE9yYW5nZSBLaWRcIjtcbiAgY3R4LmZpbGxUZXh0KGBIUDogJHtzdGF0cy5ocH0gLyAke3N0YXRzLm1heEhwfWAsIDIwLCAyNSk7XG4gIGN0eC5maWxsVGV4dChgV2VhcG9uOiAke3N0YXRzLndlYXBvbi5uYW1lfWAsIDIwLCA1NSk7XG4gIGN0eC5maWxsVGV4dChgQXJtb3I6ICR7c3RhdHMuYXJtb3IubmFtZX1gLCAyMCwgODUpO1xuICBjdHguZmlsbFRleHQoYFBsYXllciBMZXZlbDogJHtzdGF0cy5wbGF5ZXJMZXZlbH1gLCA0MjAsIDI1KTtcbiAgY3R4LmZpbGxUZXh0KGBYUDogJHtzdGF0cy54cH0gLyAke3N0YXRzLm5leHRYcH1gLCA0MjAsIDU1KTtcbiAgY3R4LmZpbGxUZXh0KGBEdW5nZW9uIExldmVsOiAke3N0YXRzLmR1bmdlb25MZXZlbH1gLCA0MjAsIDg1KTtcbn07XG5cbmNvbnN0IGRyYXdMb2cgPSAobG9nKSA9PiB7XG4gIGxldCBtZXNzYWdlcyA9IGxvZy5zbGljZSgtMyk7XG4gIGZvcihsZXQgaSA9IDA7IGkgPCBtZXNzYWdlcy5sZW5ndGg7IGkrKyl7XG4gICAgY3R4LmZpbGxTdHlsZSA9IFwiI2ZmZlwiO1xuICAgIGN0eC5mb250ID0gXCIyMHB4IE9yYW5nZSBLaWRcIjtcbiAgICBjdHguZmlsbFRleHQobWVzc2FnZXNbaV0sIDIwLCBDb25maWcuY2FudmFzSGVpZ2h0IC0gdG9wT2ZmZXN0ICsgKGkgKiAzMCkgKyAyNSk7XG4gIH1cbn07XG5cbmNvbnN0IGRyYXdDb3ZlciA9IChuYW1lKSA9PiB7XG4gIGN0eC5kcmF3SW1hZ2Uoc3ByaXRlc2hlZXRbbmFtZV0sIDAsIDAsIENvbmZpZy5jYW52YXNXaWR0aCwgQ29uZmlnLmNhbnZhc0hlaWdodCk7XG59XG5cbi8vIExldCdzIHNlZSB3aGVyZSB0aGlzIGdvZXMuLi5cbmNvbnN0IGRyYXdlciA9IHtcbiAgcmVkcmF3KCl7XG4gICAgaWYoTW9kZWwuc3RhdGUuY3VycmVudFNjZW5lLmN1cnJlbnRMZXZlbCl7XG4gICAgICBzZXRDYW1lcmFPZmZzZXQoKTtcbiAgICB9XG5cbiAgICBkcmF3KE1vZGVsLnN0YXRlKTtcbiAgfSxcbiAgdXBkYXRlQ2FtZXJhKHhBLCB5QSl7XG4gICAgdHJhbnNsYXRlT2Zmc2V0LnggKz0geEE7XG4gICAgdHJhbnNsYXRlT2Zmc2V0LnkgKz0geUE7XG4gICAgdHJhbnNsYXRlT2Zmc2V0ID0gTWFwVXRpbC5jb25zdHJhaW5DYW1lcmFUcmFuc2xhdGlvbihNb2RlbC5zdGF0ZS5wbGF5ZXIpO1xuICAgIENvbmZpZy50cmFuc2xhdGVPZmZzZXQgPSB0cmFuc2xhdGVPZmZzZXRcbiAgfSxcbiAgc2V0RmFkZW91dChzaG91bGRGYWRlSW4pe1xuICAgIGZhZGVPdXQgPSB0cnVlO1xuICAgIGZhZGVJbiA9IHNob3VsZEZhZGVJbjtcbiAgfVxufTtcbkRpc3BhdGNoZXIuYWRkTGlzdGVuZXIoZHJhd2VyKTtcbkRpc3BhdGNoZXIuYWRkQWN0aW9uKGRyYXdlciwge25hbWU6IFwiQ2hhbmdlIFNjZW5lXCIsIHRyaWdnZXI6IGRyYXdlci5yZWRyYXd9KTtcbkRpc3BhdGNoZXIuYWRkQWN0aW9uKGRyYXdlciwge25hbWU6IFwiVXBkYXRlIENhbWVyYVwiLCB0cmlnZ2VyOiBkcmF3ZXIudXBkYXRlQ2FtZXJhfSk7XG5EaXNwYXRjaGVyLmFkZEFjdGlvbihkcmF3ZXIsIHtuYW1lOiBcIkZhZGUtb3V0LWluXCIsIHRyaWdnZXI6IGRyYXdlci5zZXRGYWRlb3V0fSk7XG4iLCJleHBvcnQgY29uc3QgYWRkU29uZyA9IChzb3VyY2UsIGxvb3ApID0+IHtcbiAgbGV0IHNvbmcgPSBuZXcgQXVkaW8oc291cmNlKTtcbiAgaWYgKGxvb3ApIHtcbiAgICBpZiAodHlwZW9mIHNvbmcubG9vcCA9PSAnYm9vbGVhbicpIHtcbiAgICAgICAgc29uZy5sb29wID0gdHJ1ZTtcbiAgICB9IGVsc2Uge1xuICAgICAgICBzb25nLmFkZEV2ZW50TGlzdGVuZXIoJ2VuZGVkJywgKCkgPT4ge1xuICAgICAgICAgICAgc29uZy5jdXJyZW50VGltZSA9IDA7XG4gICAgICAgICAgICBzb25nLnBsYXkoKTtcbiAgICAgICAgfSwgZmFsc2UpO1xuICAgIH1cbiAgfVxuXG4gIHJldHVybiBzb25nO1xufTtcbiIsImltcG9ydCAqIGFzIENhbnZhcyBmcm9tIFwiLi9jYW52YXNcIjtcbmltcG9ydCBNb2RlbCBmcm9tIFwiLi9tb2RlbFwiO1xuaW1wb3J0IERpc3BhdGNoZXIgZnJvbSBcIi4vZGlzcGF0Y2hlclwiO1xuaW1wb3J0IENvbnRyb2xsZXJNYXBzIGZyb20gXCIuL2NvbnRyb2xsZXJNYXBzXCI7XG5pbXBvcnQgeyBsb2FkU3ByaXRlc2hlZXQsIGxvYWRJbWFnZSB9IGZyb20gXCIuL3Nwcml0ZXNcIjtcbmltcG9ydCB7IGRyYXcgfSBmcm9tIFwiLi9kcmF3XCI7XG5pbXBvcnQgeyBnZXRSYW5kb21BdmFpbGFibGUgfSBmcm9tIFwiLi9yb29tR2VuXCI7XG5pbXBvcnQgQ29uZmlnIGZyb20gXCIuL2NvbmZpZ1wiO1xuaW1wb3J0ICogYXMgTWFwVXRpbCBmcm9tIFwiLi9tYXAtdXRpbFwiO1xuaW1wb3J0ICogYXMgRW50aXR5IGZyb20gJy4vZW50aXRpZXMnO1xuaW1wb3J0IHsgbWFwMSB9IGZyb20gJy4vbWFwcyc7XG5pbXBvcnQgeyByb2xsRGljZSB9IGZyb20gJy4vdXRpbGl0eSc7XG5pbXBvcnQgeyBtZXNzYWdlTG9nIH0gZnJvbSAnLi9tZXNzYWdlTG9nJztcbmltcG9ydCB7IGFkZFNvbmcgfSBmcm9tICcuL2F1ZGlvJztcblxudmFyIGFuaW1hdGlvbkNvdW50ZXIgPSAwO1xuXG5jb25zdCBhbmltYXRlRW50aXR5TW92ZW1lbnQgPSAoc3RhdGUpID0+IHtcbiAgaWYoc3RhdGUucGxheWVyTW92ZWQpe1xuICAgICAgc3RhdGUucGxheWVyTW92ZWQgPSBmYWxzZTtcbiAgfVxuXG4gIGZvcihsZXQgaSA9IDA7IGkgPCBzdGF0ZS5jdXJyZW50U2NlbmUuY3VycmVudExldmVsLmVudGl0aWVzLmxlbmd0aDsgaSsrKXtcbiAgICAgIGxldCBlbnRpdHkgPSBzdGF0ZS5jdXJyZW50U2NlbmUuY3VycmVudExldmVsLmVudGl0aWVzW2ldO1xuICAgICAgbGV0IG1vdmVYLCBtb3ZlWTtcbiAgICAgIGlmKGVudGl0eS54ICE9IGVudGl0eS5uZXh0WCl7XG4gICAgICAgICAgaWYoZW50aXR5LnggPCBlbnRpdHkubmV4dFgpIHtcbiAgICAgICAgICAgIGVudGl0eS54ICs9IENvbmZpZy5tb3ZlQW5pU3BlZWQ7XG4gICAgICAgICAgICBtb3ZlWCA9IENvbmZpZy5tb3ZlQW5pU3BlZWQ7XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGVudGl0eS54IC09IENvbmZpZy5tb3ZlQW5pU3BlZWQ7XG4gICAgICAgICAgICBtb3ZlWCA9IC1Db25maWcubW92ZUFuaVNwZWVkO1xuICAgICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgaWYoZW50aXR5LnkgIT0gZW50aXR5Lm5leHRZKXtcbiAgICAgICAgaWYoZW50aXR5LnkgPCBlbnRpdHkubmV4dFkpIHtcbiAgICAgICAgICBlbnRpdHkueSArPSBDb25maWcubW92ZUFuaVNwZWVkO1xuICAgICAgICAgIG1vdmVZID0gQ29uZmlnLm1vdmVBbmlTcGVlZDtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBlbnRpdHkueSAtPSBDb25maWcubW92ZUFuaVNwZWVkO1xuICAgICAgICAgIG1vdmVZID0gLUNvbmZpZy5tb3ZlQW5pU3BlZWQ7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIGlmKGVudGl0eS5uYW1lID09PSAncGxheWVyJykge1xuICAgICAgICBEaXNwYXRjaGVyLnNlbmRNZXNzYWdlKHthY3Rpb246IFwiVXBkYXRlIENhbWVyYVwiLCBwYXlsb2FkOiBbbW92ZVgsIG1vdmVZXX0pO1xuICAgICAgfVxuICB9XG4gIGFuaW1hdGlvbkNvdW50ZXIgKz0gQ29uZmlnLm1vdmVBbmlTcGVlZDtcbiAgaWYoYW5pbWF0aW9uQ291bnRlciA9PT0gQ29uZmlnLnRpbGVTaXplKXtcbiAgICAgIGFuaW1hdGlvbkNvdW50ZXIgPSAwO1xuICAgICAgc3RhdGUubGFzdE1vdmVGaW5pc2hlZCA9IHRydWU7XG4gIH1cbn1cblxuY29uc3QgcGxheWVyWHBUYWJsZSA9IHsgLy90aGlzIHNob3VsZCBiZSBjb21wdXRlZCB1c2luZyBhIGNvbmZpZyB2YWx1ZVxuICAxOiAyMDAsXG4gIDI6IDQwMCxcbiAgMzogODAwLFxuICA0OiAxNjAwLFxuICA1OiAzMjAwLFxuICA2OiA2NDAwLFxuICA3OiAxMjgwMCxcbiAgODogMjU2MDAsXG4gIDk6IDUxMjAwLFxuICAxMDogMTAyNDAwXG59O1xubGV0IHRpdGxlVGhlbWUgPSBhZGRTb25nKCd0aXRsZS5tcDMnKTtcbmxldCBkdW5nZW9uVGhlbWUgPSBhZGRTb25nKCdjcmF3bC5tcDMnLCB0cnVlKTtcblxuZXhwb3J0IGNvbnN0IEdhbWUgPSB7XG4gIHN0YXRlOiBNb2RlbC5zdGF0ZSxcbiAgbG9hZEdhbWUoKXtcbiAgICBsb2FkSW1hZ2UoXCJibGFja2RyYWdvbkNvdmVyMS5wbmdcIiwgXCJzdGFydFwiKTtcbiAgICBsb2FkU3ByaXRlc2hlZXQoXCJtb3VudGFpbi1mb3J0cmVzcy5wbmdcIiwgMzIsIDI1NiwgKCkgPT4ge1xuICAgICAgdGhpcy5ydW4oKTtcbiAgICB9KTtcbiAgICAvL1RoZXNlIG5lZWQgdG8gYmUgYnVuZGxlZCBpbiBhbiBhc3NldCBsb2FkZXJcblxuICB9LFxuICBnYW1lVGljazogMCwgLy90b3RhbCBlbGFwc2VkIHR1cm5zXG4gIGxhc3RUaWNrOiAwLFxuICBtdXNpY0VuYWJsZWQ6IHRydWUsIC8vdGhpcyBzaG91bGQgYmUgaW4gbW9kZWxcbiAgY3VycmVudFRyYWNrOiBudWxsLFxuICB0b2dnbGVNdXNpYygpe1xuICAgIHRoaXMubXVzaWNFbmFibGVkID0gIXRoaXMubXVzaWNFbmFibGVkO1xuICAgIGlmKHRoaXMubXVzaWNFbmFibGVkKSB7XG4gICAgICB0aGlzLmN1cnJlbnRUcmFjay5wbGF5KCk7XG4gICAgfWVsc2Uge1xuICAgICAgdGhpcy5jdXJyZW50VHJhY2sucGF1c2UoKTtcbiAgICB9XG4gIH0sXG4gIHN0YXJ0KCl7XG4gICAgQ2FudmFzLmF0dGFjaENhbnZhcyhkb2N1bWVudC5ib2R5KTsgLy9zaG91bGQgb25seSBkbyB0aGlzIHRoZSBmaXJzdCB0aW1lXG4gICAgdGhpcy5sYXN0VGljayA9IDA7XG4gICAgdGhpcy5nYW1lVGljayA9IDA7XG5cblxuICAgIE1vZGVsLmFkZFNjZW5lKFwic3RhcnRcIiwgKCk9PiB7IGNvbnNvbGUubG9nKFwiZW50ZXIgc3RhcnQgc2NlbmVcIik7XG4gICAgICB0aGlzLmN1cnJlbnRUcmFjayA9IHRpdGxlVGhlbWU7XG4gICAgICBpZiAodGhpcy5tdXNpY0VuYWJsZWQpIHtcbiAgICAgICAgdGhpcy5jdXJyZW50VHJhY2sucGxheSgpO1xuICAgICAgfVxuICAgIH0sIENvbnRyb2xsZXJNYXBzLnN0YXJ0ICk7XG4gICAgTW9kZWwuYWRkU2NlbmUoXCJnYW1lT3ZlclwiLCAoKT0+IHsgY29uc29sZS5sb2coXCJlbnRlciBnYW1lIG92ZXIgc2NlbmVcIik7XG4gICAgICBNb2RlbC5zdGF0ZS5wbGF5ZXJNb3ZlZCA9IGZhbHNlO1xuICAgICAgTW9kZWwuc3RhdGUubGFzdE1vdmVGaW5pc2hlZCA9IHRydWU7XG4gICAgICBNb2RlbC5yZXN0YXJ0KCk7XG4gICAgICBFbnRpdHkucmVzZXQoKTtcbiAgICAgIHRoaXMuY3VycmVudFRyYWNrLnBhdXNlKCk7XG4gICAgICB0aGlzLmN1cnJlbnRUcmFjay5jdXJyZW5UaW1lID0gMDtcbiAgICB9LCBDb250cm9sbGVyTWFwcy5nYW1lT3ZlciApO1xuICAgIE1vZGVsLmFkZFNjZW5lKFwicGxheVwiLCAoKSA9PiB7IGNvbnNvbGUubG9nKFwiZW50ZXIgcGxheSBzY2VuZVwiKTtcbiAgICAgIHRoaXMuY3VycmVudFRyYWNrLnBhdXNlKCk7XG4gICAgICB0aGlzLmN1cnJlbnRUcmFjay5jdXJyZW5UaW1lID0gMDtcbiAgICAgIHRoaXMuY3VycmVudFRyYWNrID0gZHVuZ2VvblRoZW1lO1xuICAgICAgaWYgKHRoaXMubXVzaWNFbmFibGVkKSB7XG4gICAgICAgIHRoaXMuY3VycmVudFRyYWNrLnBsYXkoKTtcbiAgICAgIH1cbiAgICAgIGxldCBsZXZlbDEgPSBNb2RlbC5jcmVhdGVMZXZlbCgpO1xuICAgICAgTW9kZWwuc2NlbmVzLnBsYXkuY3VycmVudExldmVsID0gbGV2ZWwxO1xuICAgICAgRGlzcGF0Y2hlci5zZW5kTWVzc2FnZSh7YWN0aW9uOiBcIkNoYW5nZSBNYXBcIiwgcGF5bG9hZDogW01vZGVsLnNjZW5lcy5wbGF5LmN1cnJlbnRMZXZlbC5tYXBdfSk7XG4gICAgICBsZXQgcGxheWVyU3RhcnQgPSBnZXRSYW5kb21BdmFpbGFibGUoTW9kZWwuc2NlbmVzLnBsYXkuY3VycmVudExldmVsLm1hcCwgTW9kZWwuc2NlbmVzLnBsYXkuY3VycmVudExldmVsLmVudGl0aWVzKTtcbiAgICAgIE1vZGVsLnN0YXRlLnBsYXllciA9IEVudGl0eS5idWlsZFBsYXllcihsZXZlbDEsIDUsIHBsYXllclN0YXJ0KTsgLy97aW5kZXg6IDI4LCB4OiAxLCB5OjF9XG4gICAgICBtZXNzYWdlTG9nLnJlc2V0KCk7XG4gICAgICBtZXNzYWdlTG9nLmN1cnJlbnRTdGF0cy5ocCA9IE1vZGVsLnN0YXRlLnBsYXllci5ocDtcbiAgICAgIG1lc3NhZ2VMb2cuY3VycmVudFN0YXRzLm1heEhwID0gTW9kZWwuc3RhdGUucGxheWVyLm1heEhwO1xuICAgICAgbWVzc2FnZUxvZy5jdXJyZW50U3RhdHMucGxheWVyTGV2ZWwgPSBNb2RlbC5zdGF0ZS5wbGF5ZXIubGV2ZWw7XG4gICAgICBtZXNzYWdlTG9nLmN1cnJlbnRTdGF0cy53ZWFwb24gPSBNb2RlbC5zdGF0ZS5wbGF5ZXIud2VhcG9uO1xuICAgICAgbWVzc2FnZUxvZy5jdXJyZW50U3RhdHMuYXJtb3IgPSBNb2RlbC5zdGF0ZS5wbGF5ZXIuYXJtb3I7XG4gICAgICBtZXNzYWdlTG9nLmN1cnJlbnRTdGF0cy5kYW1hZ2VNb2RpZmllciA9IE1vZGVsLnN0YXRlLnBsYXllci5kYW1hZ2VNb2RpZmllcjtcbiAgICAgIG1lc3NhZ2VMb2cuY3VycmVudFN0YXRzLnhwID0gTW9kZWwuc3RhdGUucGxheWVyLnhwO1xuXG4gICAgICBtZXNzYWdlTG9nLmN1cnJlbnRTdGF0cy5uZXh0WHAgPSBwbGF5ZXJYcFRhYmxlW01vZGVsLnN0YXRlLnBsYXllci5sZXZlbF07XG4gICAgICBtZXNzYWdlTG9nLmN1cnJlbnRTdGF0cy5kdW5nZW9uTGV2ZWwgPSBsZXZlbDEuYmFzZURpZmZpY3VsdHk7XG4gICAgICAvL01vZGVsLnNjZW5lcy5wbGF5LmN1cnJlbnRMZXZlbC5lbnRpdGllcy5wdXNoKHtuYW1lOiAncGxheWVyJywgaW5kZXg6IHBsYXllclN0YXJ0LmluZGV4LCB4OiBwbGF5ZXJTdGFydC54ICogNjQsIHk6IHBsYXllclN0YXJ0LnkgKiA2NCwga2V5OiA1IH0pO1xuICAgICAgLy9Nb2RlbC5zdGF0ZS5wbGF5ZXIgPSBNb2RlbC5zY2VuZXMucGxheS5jdXJyZW50TGV2ZWwuZW50aXRpZXNbMF07XG4gICAgfSwgQ29udHJvbGxlck1hcHMucGxheSApO1xuXG4gICAgYWRkRXZlbnRMaXN0ZW5lcihcImtleWRvd25cIiwgKGV2ZW50KSA9PiB7XG4gICAgICAgIERpc3BhdGNoZXIuc2VuZE1lc3NhZ2Uoe2FjdGlvbjogXCJLZXkgUHJlc3NcIiwgcGF5bG9hZDogW2V2ZW50LmtleV19KTtcbiAgICB9KTtcbiAgICBNb2RlbC5jaGFuZ2VTY2VuZShcInN0YXJ0XCIpO1xuICB9LFxuICBydW4oKSB7XG4gICAgLy9taWdodCBtYWtlIHNlbnNlIHRvIHJ1biB1cGRhdGUgb24gZXZlcnkgZnJhbWUgYXMgd2VsbFxuICAgIGlmKCFNb2RlbC5zdGF0ZS5sYXN0TW92ZUZpbmlzaGVkKXtcbiAgICAgICAgICB0aGlzLnVwZGF0ZShNb2RlbC5zdGF0ZSk7XG4gICAgfVxuICAgIGRyYXcoTW9kZWwuc3RhdGUpO1xuICAgIHJlcXVlc3RBbmltYXRpb25GcmFtZSh0aGlzLnJ1bi5iaW5kKHRoaXMpKTtcbiAgfSxcbiAgdXBkYXRlKHN0YXRlKSB7XG4gICAgaWYodGhpcy5zdGF0ZS5jdXJyZW50U2NlbmUuY3VycmVudExldmVsLnRpY2sgIT09IHRoaXMubGFzdFRpY2spe1xuICAgICAgdGhpcy5sYXN0VGljayA9IHRoaXMuc3RhdGUuY3VycmVudFNjZW5lLmN1cnJlbnRMZXZlbC50aWNrO1xuICAgICAgdGhpcy5tb3ZlTW9uc3RlcnMoKTtcbiAgICAgIGlmICh0aGlzLmxhc3RUaWNrICUgQ29uZmlnLmdlbmVyYXRlTW9uc3RlclRpY2sgPT09IDApIHtcbiAgICAgICAgLy9jb25zb2xlLmxvZyhcImV4Y3V0ZWRcIik7XG4gICAgICAgIHRoaXMuZ2VuZXJhdGVNb25zdGVyKCk7XG4gICAgICB9XG4gICAgfVxuICAgIGlmKHN0YXRlLmN1cnJlbnRTY2VuZS5uYW1lID09PSBcInBsYXlcIikge1xuICAgICAgYW5pbWF0ZUVudGl0eU1vdmVtZW50KHN0YXRlKTtcbiAgICB9XG4gIH0sXG4gIG1vdmVQbGF5ZXIoa2V5KSB7IC8vbmVlZCB0byBtYWtlIHRoaXMgZ2VuZXJpYyBzaW5jZSBtb25zdGVycyBjYW4gbW92ZSB0b29cbiAgICBpZiAoIXRoaXMuc3RhdGUucGxheWVyTW92ZWQgJiYgdGhpcy5zdGF0ZS5sYXN0TW92ZUZpbmlzaGVkKSB7XG5cbiAgICAgIC8vY2hlY2sgdGhlIG5ldyBwb3NpdGlvbiBhbmQgcmV0dXJuIGEgdmFsdWVzXG4gICAgICAvL2lmIHZhbHVlIGlzIGVtcHR5IGdvIHRoZXJlXG4gICAgICAvL2lmIHRoZXJlIGlzIHNvbWV0aGluZyB0aGVyZSBoYW5kbGUgaXQgKHN0YWlycywgbW9uc3RlciwgaXRlbSk7XG5cbiAgICAgIGxldCB0YXJnZXRBdEluZGV4ID0gTWFwVXRpbC5jaGVja0luZGV4KHRoaXMuc3RhdGUucGxheWVyLCBrZXkpO1xuICAgICAgbGV0IGVudGl0aWVzQXRJbmRleCA9IEVudGl0eS5nZXRFbnRpdGllc0F0SW5kZXgodGhpcy5zdGF0ZS5jdXJyZW50U2NlbmUuY3VycmVudExldmVsLCB0YXJnZXRBdEluZGV4LmluZGV4KTtcbiAgICAgIGlmKHRhcmdldEF0SW5kZXgudGFyZ2V0LnBhc3NpYmxlKXtcbiAgICAgICAgdGhpcy5zdGF0ZS5jdXJyZW50U2NlbmUuY3VycmVudExldmVsLnRpY2srKztcbiAgICAgICAgdGhpcy5nYW1lVGljaysrO1xuICAgICAgICAvLyBjb25zb2xlLmxvZyhcInRpY2tcIiwgdGhpcy5zdGF0ZS5jdXJyZW50U2NlbmUuY3VycmVudExldmVsLnRpY2ssIHRoaXMuZ2FtZVRpY2spO1xuXG4gICAgICAgIHRoaXMuc3RhdGUucGxheWVyTW92ZWQgPSB0cnVlO1xuICAgICAgICB0aGlzLnN0YXRlLmxhc3RNb3ZlRmluaXNoZWQgPSBmYWxzZTtcbiAgICAgICAgLy9jb25zb2xlLmxvZyh0aGlzLnN0YXRlLmN1cnJlbnRTY2VuZS5jdXJyZW50TGV2ZWwuZW50aXRpZXMsIGVudGl0eUF0SW5kZXgpXG4gICAgICAgIGlmIChlbnRpdGllc0F0SW5kZXgubGVuZ3RoID4gMCkgeyAvL25lZWQgdG8gcmVxcml0ZSB0aGlzIGJsb2NrIGFzIHRoaXMgd2lsbCByZXR1cm4gYW4gYXJyYXkgb2YgZW50aXRpZXMgYXQgYW4gaW5kZXhcbiAgICAgICAgICBsZXQgbW9uc3RlckluZGV4ID0gbnVsbDtcbiAgICAgICAgICBsZXQgc3RhaXJJbmRleCA9IG51bGw7XG4gICAgICAgICAgbGV0IGl0ZW1JbmRleCA9IG51bGw7IC8vdGhlcmUgcmVhbGx5IHNob3VsZG4ndCBiZSBtb3JlIHRoYW4gb25lIG9mIGVhY2hcbiAgICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IGVudGl0aWVzQXRJbmRleC5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgaWYoZW50aXRpZXNBdEluZGV4W2ldLnR5cGUgPT09IFwic3RhaXJzXCIpIHtcbiAgICAgICAgICAgICAgc3RhaXJJbmRleCA9IGk7XG4gICAgICAgICAgICB9IGVsc2UgaWYoZW50aXRpZXNBdEluZGV4W2ldLnR5cGUgPT09IFwibW9uc3RlclwiKSB7XG4gICAgICAgICAgICAgIG1vbnN0ZXJJbmRleCA9IGk7XG4gICAgICAgICAgICB9IGVsc2UgaWYoZW50aXRpZXNBdEluZGV4W2ldLnR5cGUgPT09IFwiaXRlbVwiKSB7XG4gICAgICAgICAgICAgIGl0ZW1JbmRleCA9IGk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuICAgICAgICAgIGlmIChtb25zdGVySW5kZXggIT09IG51bGwpIHtcbiAgICAgICAgICAgIHRoaXMuYXR0YWNrRW50aXR5KHRoaXMuc3RhdGUucGxheWVyLCBlbnRpdGllc0F0SW5kZXhbbW9uc3RlckluZGV4XSwgdGhpcy5zdGF0ZS5jdXJyZW50U2NlbmUuY3VycmVudExldmVsKTtcbiAgICAgICAgICB9IGVsc2UgaWYgKHN0YWlySW5kZXggIT09IG51bGwpIHtcbiAgICAgICAgICAgIC8vTWFwVXRpbC5tb3ZlRW50aXR5KHRoaXMuc3RhdGUucGxheWVyLCBrZXkpO1xuICAgICAgICAgICAgdGhpcy51c2VTdGFpcnModGhpcy5zdGF0ZS5wbGF5ZXIsIGVudGl0aWVzQXRJbmRleFtzdGFpckluZGV4XSk7XG4gICAgICAgICAgICBEaXNwYXRjaGVyLnNlbmRNZXNzYWdlKHthY3Rpb246IFwiUGxheWVyIE1vdmVkXCIsIHBheWxvYWQ6IFt0aGlzLnN0YXRlLmN1cnJlbnRTY2VuZV19KTtcbiAgICAgICAgICB9IGVsc2UgaWYgKGl0ZW1JbmRleCAhPT0gbnVsbCkge1xuICAgICAgICAgICAgdGhpcy5nZXRJdGVtKHRoaXMuc3RhdGUucGxheWVyLCBlbnRpdGllc0F0SW5kZXhbaXRlbUluZGV4XSwgdGhpcy5zdGF0ZS5jdXJyZW50U2NlbmUuY3VycmVudExldmVsKTtcbiAgICAgICAgICAgIE1hcFV0aWwubW92ZUVudGl0eSh0aGlzLnN0YXRlLnBsYXllciwga2V5KTtcbiAgICAgICAgICAgIERpc3BhdGNoZXIuc2VuZE1lc3NhZ2Uoe2FjdGlvbjogXCJQbGF5ZXIgTW92ZWRcIiwgcGF5bG9hZDogW3RoaXMuc3RhdGUuY3VycmVudFNjZW5lXX0pO1xuICAgICAgICAgIH1cbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBNYXBVdGlsLm1vdmVFbnRpdHkodGhpcy5zdGF0ZS5wbGF5ZXIsIGtleSk7XG4gICAgICAgICAgRGlzcGF0Y2hlci5zZW5kTWVzc2FnZSh7YWN0aW9uOiBcIlBsYXllciBNb3ZlZFwiLCBwYXlsb2FkOiBbdGhpcy5zdGF0ZS5jdXJyZW50U2NlbmVdfSk7XG4gICAgICAgIH1cblxuICAgICAgfVxuXG4gICAgfVxuICB9LFxuICB1c2VTdGFpcnMoZW50aXR5LCBzdGFpcnMpIHtcbiAgICBsZXQgY3VycmVudExldmVsID0gdGhpcy5zdGF0ZS5jdXJyZW50U2NlbmUuY3VycmVudExldmVsO1xuICAgIGxldCBuZXh0TGV2ZWw7XG4gICAgaWYoc3RhaXJzLnRhcmdldExldmVsID09PSBudWxsKXtcbiAgICAgIG5leHRMZXZlbCA9IE1vZGVsLmNyZWF0ZUxldmVsKGN1cnJlbnRMZXZlbCwgc3RhaXJzKTtcbiAgICB9IGVsc2Uge1xuICAgICAgbmV4dExldmVsID0gTW9kZWwubGV2ZWxzW3N0YWlycy50YXJnZXRMZXZlbF07XG4gICAgfVxuICAgIC8vICBsZXQgbmV4dExldmVsID0gbW9kZWwubGV2ZWxzW3N0YWlycy50YXJnZXRdO1xuICAgIGVudGl0eS5pbmRleCA9IHN0YWlycy50YXJnZXRJbmRleDtcbiAgICAvLyBuZWVkIHRvIGFkZCBhIHdheSB0byBkZWxheSB0aGlzIHNvIGl0IGNhbiBiZSBhbmltYXRlZC4uLlxuICAgIG5leHRMZXZlbC5lbnRpdGllcy5wdXNoKGVudGl0eSk7XG4gICAgT2JqZWN0LmFzc2lnbihlbnRpdHksIE1hcFV0aWwuaW5kZXhUcnVlVG9YWShlbnRpdHkuaW5kZXgpKTsgLy9jaGVja1xuICAgIGVudGl0eS5uZXh0WCA9IGVudGl0eS54O1xuICAgIGVudGl0eS5uZXh0WSA9IGVudGl0eS55O1xuXG4gICAgLy9cbiAgICBsZXQgbWVzc2FnZSA9IFwiWW91IGdvIFwiO1xuICAgIGlmKHN0YWlycy5zdWJ0eXBlID09PSBcInN0YWlycyB1cFwiKXsgLy90aGVyZSBhcmUgb25seSB0d28gdHlwZXMgb2Ygc3RhaXJzXG4gICAgICBtZXNzYWdlICs9IFwidXAgdGhlIHN0YWlyc1wiOyAvL3RvIGxldmVsP1xuICAgIH0gZWxzZSB7XG4gICAgICBtZXNzYWdlICs9IFwiZG93biB0aGUgc3RhaXJzXCI7XG4gICAgfVxuICAgIG1lc3NhZ2VMb2cubWVzc2FnZXMucHVzaChtZXNzYWdlKTtcbiAgICBtZXNzYWdlTG9nLmN1cnJlbnRTdGF0cy5kdW5nZW9uTGV2ZWwgPSBuZXh0TGV2ZWwuYmFzZURpZmZpY3VsdHk7XG4gICAgdGhpcy5nb1RvTGV2ZWwoc3RhaXJzLnRhcmdldExldmVsKTtcbiAgICBFbnRpdHkucmVtb3ZlRW50aXR5RnJvbUxldmVsKGN1cnJlbnRMZXZlbCwgZW50aXR5KTtcblxuICAgIERpc3BhdGNoZXIuc2VuZE1lc3NhZ2Uoe2FjdGlvbjogXCJGYWRlLW91dC1pblwiLCBwYXlsb2FkOiBbdHJ1ZV19KTtcbiAgfSxcbiAgZ29Ub0xldmVsKGxldmVsKSB7XG4gICAgdGhpcy5zdGF0ZS5jdXJyZW50U2NlbmUuY3VycmVudExldmVsID0gTW9kZWwubGV2ZWxzW2xldmVsXTtcbiAgICBFbnRpdHkuYnVpbGRFbnRpdHlNYXAodGhpcy5zdGF0ZS5jdXJyZW50U2NlbmUuY3VycmVudExldmVsKTtcbiAgICAvL2NvbnNvbGUubG9nKE1vZGVsKTtcbiAgICBEaXNwYXRjaGVyLnNlbmRNZXNzYWdlKHthY3Rpb246IFwiQ2hhbmdlIE1hcFwiLCBwYXlsb2FkOiBbdGhpcy5zdGF0ZS5jdXJyZW50U2NlbmUuY3VycmVudExldmVsLm1hcF19KTtcbiAgICBEaXNwYXRjaGVyLnNlbmRNZXNzYWdlKHthY3Rpb246IFwiUGxheWVyIE1vdmVkXCIsIHBheWxvYWQ6IFt0aGlzLnN0YXRlLmN1cnJlbnRTY2VuZV19KTtcbiAgICAvL21vZGVsLnNjZW5lcy5wbGF5LmxldmVsLmVudGl0aWVzTWFwID0gbW9kZWwuZW50aXRpZXNNYXBzW2xldmVsXTtcbiAgfSxcbiAgYXR0YWNrRW50aXR5KGF0dGFja2VyLCBkZWZlbmRlciwgbGV2ZWwpIHtcbiAgICBsZXQgZGFtYWdlLCB2ZXJiLCBhSWRlbnRpdHksIGRJZGVudGl5LCBwb3NBZGo7IC8vbWF5YmUgc2ltcGxpZnkgdGhpcyBieSBnaXZpbmcgYWxsIG1vbnN0ZXJzIGEgd2VhcG9uP1xuXG4gICAgLy9pZihhdHRhY2tlci53ZWFwb24pe1xuICAgIGRhbWFnZSA9IHJvbGxEaWNlKC4uLmF0dGFja2VyLndlYXBvbi5kYW1hZ2UpO1xuICAgIGRhbWFnZSArPSBhdHRhY2tlci5kYW1hZ2VNb2RpZmllcjtcbiAgICB2ZXJiID0gYXR0YWNrZXIud2VhcG9uLnZlcmI7XG4gICAgLy8gfSBlbHNlIHtcbiAgICAvLyAgIGRhbWFnZSA9IHJvbGxEaWNlKC4uLmF0dGFja2VyLmRhbWFnZSk7XG4gICAgLy8gICBkYW1hZ2UgKz0gYXR0YWNrZXIuZGFtYWdlTW9kaWZpZXI7XG4gICAgLy8gICB2ZXJiID0gXCJoaXRzXCI7XG4gICAgLy8gfVxuICAgIGlmKGRhbWFnZSA+IGRlZmVuZGVyLmFybW9yLnByb3RlY3Rpb24pe1xuICAgICAgZGVmZW5kZXIuaHAgLT0gZGFtYWdlIC0gZGVmZW5kZXIuYXJtb3IucHJvdGVjdGlvbjtcbiAgICB9IGVsc2Uge1xuICAgICAgZGFtYWdlID0gMDtcbiAgICB9XG5cblxuICAgIGlmKGF0dGFja2VyLnR5cGUgPT09IFwicGxheWVyXCIpe1xuICAgICAgYUlkZW50aXR5ID0gXCJZb3VcIjtcbiAgICAgIGRJZGVudGl5ID0gXCJ0aGUgXCIgKyBkZWZlbmRlci5uYW1lO1xuICAgICAgcG9zQWRqID0gXCJ0aGVpclwiO1xuICAgIH1lbHNle1xuICAgICAgYUlkZW50aXR5ID0gXCJUaGUgXCIgKyBhdHRhY2tlci5uYW1lO1xuICAgICAgZElkZW50aXkgPSBcInlvdVwiO1xuICAgICAgcG9zQWRqID0gXCJ5b3VyXCI7XG4gICAgfVxuXG4gICAgbGV0IG1lc3NhZ2UgPSBgJHthSWRlbnRpdHl9ICR7dmVyYn0gJHtkSWRlbnRpeX1gOyAvL2AgZm9yICR7ZGFtYWdlfSBicmluZ2luZyAke3Bvc0Fkan0gaHAgdG8gJHtkZWZlbmRlci5ocH1gO1xuICAgIC8vY29uc29sZS5sb2coYCR7YUlkZW50aXR5fSAke3ZlcmJ9ICR7ZElkZW50aXl9IGZvciAke2RhbWFnZX0gYnJpbmdpbmcgJHtwb3NBZGp9IGhwIHRvICR7ZGVmZW5kZXIuaHB9YCk7XG4gICAgbWVzc2FnZUxvZy5tZXNzYWdlcy5wdXNoKG1lc3NhZ2UpO1xuICAgIGlmKGRlZmVuZGVyLnR5cGUgPT09IFwicGxheWVyXCIpe1xuICAgICAgbWVzc2FnZUxvZy5jdXJyZW50U3RhdHMuaHAgPSBkZWZlbmRlci5ocDtcbiAgICB9XG4gICAgaWYoZGVmZW5kZXIuaHAgPD0gMCl7XG4gICAgICBpZihkZWZlbmRlci5uYW1lID09PSBcImJsYWNrIGRyYWdvblwiKSB7XG4gICAgICAgIG1lc3NhZ2VMb2cuZW5kR2FtZS5tZXNzYWdlcy5wdXNoKHtcbiAgICAgICAgICB0ZXh0OiBgWW91IGhhdmUga2lsbGVkIHRoZSBibGFjayBkcmFnb24gc3Bhd25gLFxuICAgICAgICAgICBzaXplOiAyNCwgeDoxMjUsIHk6IDMwMH0pO1xuICAgICAgICBtZXNzYWdlTG9nLmVuZEdhbWUubWVzc2FnZXMucHVzaCh7XG4gICAgICAgICAgdGV4dDogYHNhdmluZyB0aGUgd29ybGQgZm9yIGEgZ2VuZXJhdGlvbiFgLFxuICAgICAgICAgIHNpemU6IDI0LCB4OjE0NSwgeTogMzMwfSk7XG4gICAgICAgIE1vZGVsLmNoYW5nZVNjZW5lKFwiZ2FtZU92ZXJcIik7XG4gICAgICB9XG5cbiAgICAgICAgRW50aXR5LnJlbW92ZUVudGl0eUZyb21MZXZlbChsZXZlbCwgZGVmZW5kZXIpO1xuICAgICAgICBpZihhdHRhY2tlci50eXBlID09PSBcInBsYXllclwiKXtcbiAgICAgICAgICBhdHRhY2tlci54cCArPSBkZWZlbmRlci54cFZhbDtcbiAgICAgICAgICBtZXNzYWdlTG9nLmN1cnJlbnRTdGF0cy54cCA9IGF0dGFja2VyLnhwO1xuICAgICAgICAgIC8vY2hlY2sgaWYgcGxheWVyIGxldmVsZWRcbiAgICAgICAgICB0aGlzLmNoZWNrUGxheWVyTGV2ZWwoKTtcbiAgICAgICAgfVxuICAgICAgLy99XG4gICAgfVxuICB9LFxuICBtb3ZlTW9uc3RlcnMoKSB7IC8vcmFuZG9tbHlcbiAgICBsZXQgZW50aXRpZXMgPSB0aGlzLnN0YXRlLmN1cnJlbnRTY2VuZS5jdXJyZW50TGV2ZWwuZW50aXRpZXM7XG4gICAgZW50aXRpZXMgPSBlbnRpdGllcy5maWx0ZXIoZW50aXR5ID0+IGVudGl0eS50eXBlID09PSAnbW9uc3RlcicpO1xuICAgIGxldCBkaXJlY3Rpb247XG4gICAgZm9yKGxldCBpID0gMDsgaSA8IGVudGl0aWVzLmxlbmd0aDsgaSsrKSB7IC8vIFRPRE8gZG8gdGhpcyBvbmx5IGZvciBtb25zdGVycyBpbiB2aWV3cG9ydFxuICAgICAgbGV0IGN1cnJlbnRDb29yZHMgPSBNYXBVdGlsLmluZGV4VG9YWShlbnRpdGllc1tpXS5pbmRleCk7XG4gICAgICBsZXQgc2lnaHRQb2ludHMgPSBNYXBVdGlsLmdldEFsbFBvaW50cyhjdXJyZW50Q29vcmRzLCA1KTtcbiAgICAgIGxldCBzaWdodEluZGljZXMgPSBzaWdodFBvaW50cy5maWx0ZXIoKHApID0+IHtcbiAgICAgICAgcC5pbmRleCA9IE1hcFV0aWwueHlUb0luZGV4KHApOyAvL3RoZXNlIHNob3VsZCBjb250YWluIHRoZWlyIGluZGV4P1xuICAgICAgICByZXR1cm4gcC5pbmRleCA9PT0gTW9kZWwuc3RhdGUucGxheWVyLmluZGV4O1xuICAgICAgfSk7XG4gICAgICBpZihzaWdodEluZGljZXMubGVuZ3RoID4gMCkge1xuICAgICAgICAvL2NvbnNvbGUubG9nKFwiY2FuIHNlZSB0aGUgcGxheWVyXCIpO1xuICAgICAgICBkaXJlY3Rpb24gPSBNYXBVdGlsLmdldERpcmVjdGlvblRvd2FyZHNQb2ludCh0aGlzLnN0YXRlLmN1cnJlbnRTY2VuZS5jdXJyZW50TGV2ZWwsIGN1cnJlbnRDb29yZHMsIHNpZ2h0SW5kaWNlc1swXSk7XG4gICAgICAgIC8vY29uc29sZS5sb2coYGRpcmVjdGlvbiBjaG9zZW4gdG93YXJkcyBwbGF5ZXIgaXM6YCwgZGlyZWN0aW9uKTtcbiAgICAgICAgZGlyZWN0aW9uID0gZGlyZWN0aW9uIHx8IE1hcFV0aWwuZ2V0VmFsaWREaXJlY3Rpb24odGhpcy5zdGF0ZS5jdXJyZW50U2NlbmUuY3VycmVudExldmVsLCBlbnRpdGllc1tpXSk7IC8vVGhpcyBpcyBhIGNoZWF0XG4gICAgICAgIC8vaWYgbW9uc3RlciBjYW4ndCBwYXNzIHRocm91Z2ggd2FsbCBvciB0d28gbW9uc3RlcnMgd2FudCB0byBvY2N1cHkgdGhlIHNhbWUgcGxhY2UgaW4gdGhlIGRpcmVjdGlvbiBvbiB0aGUgcGxheWVyXG4gICAgICAgIC8vcmVhbGx5IG5lZWQgYSB3ZWlndGhlZCBzeXN0ZW0gc28gaWYgaXQncyBmaXJzdCBjaG9pY2UgaXNuJ3QgYXZhaWxhYmxlIGl0J2xsIGNob29zZSBzb21ldGhpbmcgZWxzZVxuICAgICAgICAvL2J1dCB3aXRob3V0IGRpYWdvbmFsIG1vdmVtZW50IHRoaXMgaXNudCByZWFsbHkgcG9zc2libGUuXG4gICAgICB9IGVsc2Uge1xuICAgICAgICBkaXJlY3Rpb24gPSBNYXBVdGlsLmdldFZhbGlkRGlyZWN0aW9uKHRoaXMuc3RhdGUuY3VycmVudFNjZW5lLmN1cnJlbnRMZXZlbCwgZW50aXRpZXNbaV0pO1xuICAgICAgfVxuICAgICAgaWYgKGRpcmVjdGlvbikgeyAgLy9kaXJlY3Rpb24gY2hlY2sgaXMgbmVlZGVkIGluIGNhc2UgbW9uc3RlciBpcyBzdXJyb3VuZGVkIGJ5IG1vbnN0ZXJzIGFuZCBjYW5ub3QgbW92ZVxuICAgICAgICBpZiAoZGlyZWN0aW9uLmVudGl0aWVzLmxlbmd0aCA+IDApIHtcbiAgICAgICAgICBsZXQgcGxheWVySW5kZXggPSBudWxsXG4gICAgICAgICAgZm9yKGxldCBpID0gMDsgaSA8IGRpcmVjdGlvbi5lbnRpdGllcy5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgaWYoZGlyZWN0aW9uLmVudGl0aWVzW2ldLm5hbWUgPT09IFwicGxheWVyXCIpe1xuICAgICAgICAgICAgICBwbGF5ZXJJbmRleCA9IGk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuICAgICAgICAgIC8vYXR0YWNrIHBsYXllclxuICAgICAgICAgIGlmKHBsYXllckluZGV4ICE9PSBudWxsKSB7XG4gICAgICAgICAgICB0aGlzLmF0dGFja0VudGl0eShlbnRpdGllc1tpXSwgdGhpcy5zdGF0ZS5wbGF5ZXIsIHRoaXMuc3RhdGUuY3VycmVudFNjZW5lLmN1cnJlbnRMZXZlbCk7XG4gICAgICAgICAgICBpZih0aGlzLnN0YXRlLnBsYXllci5ocCA8PSAwKXtcbiAgICAgICAgICAgICAgLy9hZGQgZmFkZW91dCBoZXJlIGFzIHdlbGxcbiAgICAgICAgICAgICAgbWVzc2FnZUxvZy5lbmRHYW1lLm1lc3NhZ2VzLnB1c2goe1xuICAgICAgICAgICAgICAgIHRleHQ6IGBZb3Ugd2VyZSBraWxsZWQgYnkgYSAke2VudGl0aWVzW2ldLm5hbWV9IG9uIGxldmVsICR7dGhpcy5zdGF0ZS5jdXJyZW50U2NlbmUuY3VycmVudExldmVsLmJhc2VEaWZmaWN1bHR5fWAsXG4gICAgICAgICAgICAgICAgIHNpemU6IDI0LCB4OjEyMCwgeTogMzAwfSlcbiAgICAgICAgICAgICAgTW9kZWwuY2hhbmdlU2NlbmUoXCJnYW1lT3ZlclwiKTtcbiAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIE1hcFV0aWwubW92ZUVudGl0eShlbnRpdGllc1tpXSwgZGlyZWN0aW9uLmtleSk7XG4gICAgICAgICAgfVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIE1hcFV0aWwubW92ZUVudGl0eShlbnRpdGllc1tpXSwgZGlyZWN0aW9uLmtleSk7XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgIH1cbiAgfSxcbiAgY2hlY2tQbGF5ZXJMZXZlbCgpIHsgLy9pbiBhIG1vcmUgcm9idXN0IHZlcnNpb24gbW9uc3RlcnMgY291bGQgYWxzbyBsZXZlbCBidXQgSSdsbCBrZWVwIHRoaXMgc2ltcGxlXG4gICAgbGV0IHBsYXllciA9IE1vZGVsLnN0YXRlLnBsYXllcjtcbiAgICAvL2NvbnNvbGUubG9nKHBsYXllci54cCwgcGxheWVyWHBUYWJsZVtwbGF5ZXIubGV2ZWxdKTtcbiAgICBpZihwbGF5ZXIueHAgPj0gcGxheWVyWHBUYWJsZVtwbGF5ZXIubGV2ZWxdKXtcbiAgICAgIHBsYXllci5sZXZlbCsrO1xuICAgICAgcGxheWVyLm1heEhwICs9IDEwO1xuICAgICAgcGxheWVyLmhwICs9IDEwOyAvL3dlJ2xsIGFzc3VtZSB0aGUgcGxheWVyIGdvdCBhIGZ1bGwgcm9sbCwgaWYgdG9vIGhhcmQgcGxheWVyLmhwID0gcGxheWVyLm1heEhwXG4gICAgICBwbGF5ZXIueHAgPSBwbGF5ZXIueHAgLSBwbGF5ZXJYcFRhYmxlW3BsYXllci5sZXZlbC0xXTtcbiAgICAgIHBsYXllci5kYW1hZ2VNb2RpZmllcisrO1xuXG4gICAgICBtZXNzYWdlTG9nLm1lc3NhZ2VzLnB1c2goYE5pY2Ugd29yayEgWW91IGxldmVsZWQgdXAhIFlvdSBhcmUgbGV2ZWwgJHtwbGF5ZXIubGV2ZWx9YCk7XG4gICAgICBtZXNzYWdlTG9nLm1lc3NhZ2VzLnB1c2goXCJZb3UgZ2FpbmVkIDEwIGhpdCBwb2ludHMgYW5kIDEgcG9pbnQgb2YgZGFtYWdlIVwiKTtcbiAgICAgIG1lc3NhZ2VMb2cuY3VycmVudFN0YXRzLnhwID0gcGxheWVyLnhwO1xuICAgICAgbWVzc2FnZUxvZy5jdXJyZW50U3RhdHMuaHAgPSBwbGF5ZXIuaHA7XG4gICAgICBtZXNzYWdlTG9nLmN1cnJlbnRTdGF0cy5tYXhIcCA9IHBsYXllci5tYXhIcDtcbiAgICAgIG1lc3NhZ2VMb2cuY3VycmVudFN0YXRzLnBsYXllckxldmVsID0gcGxheWVyLmxldmVsO1xuICAgICAgbWVzc2FnZUxvZy5jdXJyZW50U3RhdHMubmV4dFhwID0gcGxheWVyWHBUYWJsZVtwbGF5ZXIubGV2ZWxdO1xuICAgICAgLy9jb25zb2xlLmxvZyhgcGxheWVyIGxldmVsZWQgdG8gJHtwbGF5ZXIubGV2ZWx9LCBocDogJHtwbGF5ZXIuaHB9YCk7XG4gICAgfVxuICB9LFxuICBnZXRJdGVtKGVudGl0eSwgaXRlbSwgbGV2ZWwpIHtcbiAgICBsZXQgbWVzc2FnZTtcbiAgICBsZXQgaXRlbVByb3BzID0gaXRlbS5pdGVtUHJvcHM7XG4gICAgaWYoaXRlbVByb3BzLnN1YnR5cGUgPT09IFwid2VhcG9uXCIgJiYgZW50aXR5LndlYXBvbi50aHJlYXQgPCBpdGVtUHJvcHMudGhyZWF0KXtcbiAgICAgIGVudGl0eS53ZWFwb24gPSBpdGVtUHJvcHM7XG4gICAgICBtZXNzYWdlID0gYFlvdSBmb3VuZCBhICR7aXRlbVByb3BzLm5hbWV9IWA7XG4gICAgICBtZXNzYWdlTG9nLmN1cnJlbnRTdGF0cy53ZWFwb24gPSBpdGVtUHJvcHM7XG4gICAgfVxuICAgIGlmKGl0ZW1Qcm9wcy5zdWJ0eXBlID09PSBcImFybW9yXCIgJiYgZW50aXR5LmFybW9yLnRocmVhdCA8IGl0ZW1Qcm9wcy50aHJlYXQpe1xuICAgICAgZW50aXR5LmFybW9yID0gaXRlbVByb3BzO1xuICAgICAgbWVzc2FnZSA9IGBZb3UgZm91bmQgJHtpdGVtUHJvcHMubmFtZX0hYDtcbiAgICAgIG1lc3NhZ2VMb2cuY3VycmVudFN0YXRzLmFybW9yID0gaXRlbVByb3BzO1xuICAgIH1cbiAgICBpZihpdGVtUHJvcHMuc3VidHlwZSA9PT0gXCJoZWFsdGhcIil7XG4gICAgICBlbnRpdHkuaHAgKz0gaXRlbVByb3BzLmhlYWxzO1xuICAgICAgbWVzc2FnZSA9IGBZb3UgJHtpdGVtUHJvcHMudmVyYn0gYSAke2l0ZW1Qcm9wcy5uYW1lfSwgeW91IGhlYWwgJHtpdGVtUHJvcHMuaGVhbHN9IHBvaW50cyFgOyAvL3Nob3VsZCBwcm9iYWJseSBoYXZlIGEgdmVyYiB0b29cbiAgICAgIG1lc3NhZ2VMb2cuY3VycmVudFN0YXRzLmhwID0gZW50aXR5LmhwO1xuICAgIH1cbiAgICBpZihtZXNzYWdlKXtcbiAgICAgIG1lc3NhZ2VMb2cubWVzc2FnZXMucHVzaChtZXNzYWdlKTtcbiAgICAgIC8vY29uc29sZS5sb2cobWVzc2FnZSk7XG4gICAgfVxuICAgIEVudGl0eS5yZW1vdmVFbnRpdHlGcm9tTGV2ZWwobGV2ZWwsIGl0ZW0pO1xuICB9LFxuICBnZW5lcmF0ZU1vbnN0ZXIoKSB7XG4gICAgbGV0IHZpZXdwb3J0ID0gTWFwVXRpbC5nZXRJbmRpY2VzSW5WaWV3cG9ydCgpO1xuICAgIEVudGl0eS5nZW5lcmF0ZU1vbnN0ZXIodGhpcy5zdGF0ZS5jdXJyZW50U2NlbmUuY3VycmVudExldmVsLCB2aWV3cG9ydCk7XG4gIH1cbn07XG4iLCJpbXBvcnQgeyBHYW1lIH0gZnJvbSAnLi9nYW1lJztcblxuR2FtZS5sb2FkR2FtZSgpO1xuR2FtZS5zdGFydCgpO1xuIl0sIm5hbWVzIjpbIkRpc3BhdGNoZXIiLCJDb25maWciLCJnZXRSYW5kb21JbkFycmF5IiwiaW5kZXhUb1hZIiwieHlUb0luZGV4IiwiRW50aXR5LmJ1aWxkRW50aXR5TWFwIiwiRW50aXR5LmJ1aWxkU3RhaXJzIiwiRW50aXR5LmJ1aWxkTW9uc3RlciIsIkVudGl0eS5wb3B1bGF0ZUxldmVsIiwiTW9kZWwiLCJhbmltYXRpb25Db3VudGVyIiwiTWFwVXRpbC5pbmRleFRvWFkiLCJNYXBVdGlsLmdldEFsbFBvaW50cyIsIk1hcFV0aWwueHlUb0luZGV4IiwiTWFwVXRpbC5nZXRJbmRpY2VzSW5WaWV3cG9ydCIsIk1hcFV0aWwuZ2V0VHJhbnNsYXRpb24iLCJNYXBVdGlsLmNvbnN0cmFpbkNhbWVyYVRyYW5zbGF0aW9uIiwiQ2FudmFzLmF0dGFjaENhbnZhcyIsIkNvbnRyb2xsZXJNYXBzIiwiRW50aXR5LnJlc2V0IiwiRW50aXR5LmJ1aWxkUGxheWVyIiwiTWFwVXRpbC5jaGVja0luZGV4IiwiRW50aXR5LmdldEVudGl0aWVzQXRJbmRleCIsIk1hcFV0aWwubW92ZUVudGl0eSIsIk1hcFV0aWwuaW5kZXhUcnVlVG9YWSIsIkVudGl0eS5yZW1vdmVFbnRpdHlGcm9tTGV2ZWwiLCJNYXBVdGlsLmdldERpcmVjdGlvblRvd2FyZHNQb2ludCIsIk1hcFV0aWwuZ2V0VmFsaWREaXJlY3Rpb24iLCJFbnRpdHkuZ2VuZXJhdGVNb25zdGVyIl0sIm1hcHBpbmdzIjoiOztBQUFBOztBQUVBLE1BQU0sVUFBVSxHQUFHO0VBQ2pCLFNBQVMsRUFBRSxFQUFFO0VBQ2IsT0FBTyxFQUFFLEVBQUU7RUFDWCxXQUFXLENBQUMsUUFBUSxDQUFDO0lBQ25CLElBQUksQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxDQUFDO0lBQzlCLE9BQU8sQ0FBQyxHQUFHLENBQUMsVUFBVSxDQUFDLENBQUM7R0FDekI7RUFDRCxTQUFTLENBQUMsUUFBUSxFQUFFLE1BQU0sQ0FBQzs7SUFFekIsUUFBUSxDQUFDLE9BQU8sR0FBRyxRQUFRLENBQUMsT0FBTyxJQUFJLEVB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bEMsQ0FBQyxFQUFFLENBQUMsUUFBUSxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUUsT0FBTyxDQUFDO0VBQ2xDLENBQUMsRUFBRSxDQUFDLFFBQVEsRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLE9BQU8sQ0FBQztFQUNsQyxDQUFDLEVBQUUsQ0FBQyxRQUFRLEVBQUUsS0FBSyxFQUFFLElBQUksRUFBRSxNQUFNLENBQUM7RUFDbEMsQ0FBQyxFQUFFLENBQUMsUUFBUSxFQUFFLEtBQUssRUFBRSxJQUFJLEVBQUUsTUFBTSxDQUFDO0VBQ2xDLENBQUMsRUFBRSxDQUFDLFFBQVEsRUFBRSxLQUFLLEVBQUUsSUFBSSxFQUFFLFFBQVEsQ0FBQztFQUNwQyxDQUFDLEVBQUUsQ0FBQyxRQUFRLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSxRQUFRLEVBQUUsT0FBTyxFQUFFLFdBQVcsQ0FBQztFQUN6RCxDQUFDLEVBQUUsQ0FBQyxRQUFRLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSxRQUFRLEVBQUUsT0FBTyxFQUFFLGFBQWEsQ0FBQztFQUMzRCxDQUFDLEVBQUUsQ0FBQyxRQUFRLEVBQUUsS0FBSyxFQUFFLElBQUksRUFBRSxTQUFTLENBQUM7RUFDckMsQ0FBQyxFQUFFLENBQUMsUUFBUSxFQUFFLEtBQUssRUFBRSxJQUFJLEVBQUUsU0FBUyxDQUFDO0VBQ3JDLEVBQUUsRUFBRSxDQUFDLFFBQVEsRUFBRSxLQUFLLEVBQUUsSUFBSSxFQUFFLFNBQVMsQ0FBQztFQUN0QyxFQUFFLEVBQUUsQ0FBQyxRQUFRLEVBQUUsS0FBSyxFQUFFLElBQUksRUFBRSxTQUFTLENBQUM7RUFDdEMsRUFBRSxFQUFFLENBQUMsUUFBUSxFQUFFLEtBQUssRUFBRSxJQUFJLEVBQUUsU0FBUyxDQUFDO0VBQ3RDLEVBQUUsRUFBRSxDQUFDLFFBQVEsRUFBRSxLQUFLLEVBQUUsSUFBSSxFQUFFLFNBQVMsQ0FBQztFQUN0QyxFQUFFLEVBQUUsQ0FBQyxRQUFRLEVBQUUsS0FBSyxFQUFFLElBQUksRUFBRSxTQUFTLENBQUM7RUFDdEMsRUFBRSxFQUFFLENBQUMsUUFBUSxFQUFFLEtBQUssRUFBRSxJQUFJLEVBQUUsU0FBUyxDQUFDO0VBQ3RDLEVBQUUsRUFBRSxDQUFDLFFBQVEsRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLE1BQU0sQ0FBQztFQUNsQyxFQUFFLEVBQUUsQ0FBQyxRQUFRLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSxNQUFNLENBQUM7RUFDbEMsRUFBRSxFQUFFLENBQUMsUUFBUSxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUUsTUFBTSxDQUFDO0VBQ2xDLEVBQUUsRUFBRSxDQUFDLFFBQVEsRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLE1BQU0sQ0FBQztFQUNsQyxFQUFFLEVBQUUsQ0FBQyxRQUFRLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSxNQUFNLENBQUM7RUFDbEMsRUFBRSxFQUFFLENBQUMsUUFBUSxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUUsTUFBTSxDQUFDO0VBQ2xDLEVBQUUsRUFBRSxDQUFDLFFBQVEsRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLE1BQU0sQ0FBQztFQUNsQyxFQUFFLEVBQUUsQ0FBQyxRQUFRLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSxNQUFNLENBQUM7RUFDbEMsRUFBRSxFQUFFLENBQUMsUUFBUSxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUUsTUFBTSxDQUFDO0VBQ2xDLEVBQUUsRUFBRSxDQUFDLFFBQVEsRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLE1BQU0sQ0FBQztFQUNsQyxFQUFFLEVBQUUsQ0FBQyxRQUFRLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSxNQUFNLENBQUM7RUFDbEMsRUFBRSxFQUFFLENBQUMsUUFBUSxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUUsTUFBTSxDQUFDO0VBQ2xDLEVBQUUsRUFBRSxDQUFDLFFBQVEsRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLE1BQU0sQ0FBQztFQUNsQyxFQUFFLEVBQUUsQ0FBQyxRQUFRLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSxNQUFNLENBQUM7Q0FDbkMsQ0FBQzs7QUFFRixBQUFPLE1BQU0saUJBQWlCLEdBQUc7RUFDL0IsQ0FBQyxFQUFFLEVBQUUsSUFBSSxDQUFDLFdBQVcsRUFBRSxPQUFPLENBQUMsUUFBUSxFQUFFLEVBQUUsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxNQUFNLEVBQUUsRUFBRSxNQUFNLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsSUFBSSxFQUFFLE9BQU8sRUFBRSxFQUFFLEtBQUssRUFBRSxFQUFFLEVBQUUsY0FBYyxFQUFFLENBQUMsRUFBRSxLQUFLLEVBQUUsRUFBRSxVQUFVLEVBQUUsQ0FBQyxFQUFFLEVBQUUsTUFBTSxFQUFFLENBQUMsRUFBRTtFQUNqSyxDQUFDLEVBQUUsRUFBRSxJQUFJLENBQUMsYUFBYSxFQUFFLE9BQU8sQ0FBQyxNQUFNLEVBQUUsRUFBRSxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLE1BQU0sRUFBRSxFQUFFLE1BQU0sRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxJQUFJLEVBQUUsVUFBVSxFQUFFLEVBQUUsS0FBSyxFQUFFLEVBQUUsRUFBRSxjQUFjLEVBQUUsQ0FBQyxFQUFFLEtBQUssRUFBRSxFQUFFLFVBQVUsRUFBRSxDQUFDLEVBQUUsRUFBRSxNQUFNLEVBQUUsQ0FBQyxFQUFFO0VBQ3BLLEVBQUUsRUFBRSxFQUFFLElBQUksQ0FBQyxVQUFVLEVBQUUsT0FBTyxDQUFDLFFBQVEsRUFBRSxFQUFFLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsTUFBTSxFQUFFLEVBQUUsTUFBTSxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLElBQUksRUFBRSxPQUFPLEVBQUUsRUFBRSxLQUFLLEVBQUUsRUFBRSxFQUFFLGNBQWMsRUFBRSxDQUFDLEVBQUUsS0FBSyxFQUFFLEVBQUUsVUFBVSxFQUFFLENBQUMsRUFBRSxFQUFFLE1BQU0sRUFBRSxDQUFDLEVBQUU7RUFDakssRUFBRSxFQUFFLEVBQUUsSUFBSSxDQUFDLFFBQVEsRUFBRSxPQUFPLENBQUMsUUFBUSxFQUFFLEVBQUUsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxNQUFNLEVBQUUsRUFBRSxNQUFNLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsSUFBSSxFQUFFLE9BQU8sRUFBRSxFQUFFLEtBQUssRUFBRSxHQUFHLEVBQUUsY0FBYyxFQUFFLENBQUMsRUFBRSxLQUFLLEVBQUUsRUFBRSxVQUFVLEVBQUUsQ0FBQyxFQUFFLEVBQUUsTUFBTSxFQUFFLENBQUMsRUFBRTtFQUNoSyxFQUFFLEVBQUUsRUFBRSxJQUFJLENBQUMsT0FBTyxFQUFFLE9BQU8sQ0FBQyxRQUFRLEVBQUUsRUFBRSxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLE1BQU0sRUFBRSxFQUFFLE1BQU0sRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxJQUFJLEVBQUUsT0FBTyxFQUFFLEVBQUUsS0FBSyxFQUFFLEdBQUcsRUFBRSxjQUFjLEVBQUUsQ0FBQyxFQUFFLEtBQUssRUFBRSxFQUFFLFVBQVUsRUFBRSxDQUFDLEVBQUUsRUFBRSxNQUFNLEVBQUUsQ0FBQyxFQUFFO0VBQy9KLEVBQUUsRUFBRSxFQUFFLElBQUksQ0FBQyxLQUFLLEVBQUUsT0FBTyxDQUFDLFFBQVEsRUFBRSxFQUFFLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsTUFBTSxFQUFFLEVBQUUsTUFBTSxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLElBQUksRUFBRSxRQUFRLEVBQUUsRUFBRSxLQUFLLEVBQUUsR0FBRyxFQUFFLGNBQWMsRUFBRSxDQUFDLEVBQUUsS0FBSyxFQUFFLEVBQUUsVUFBVSxFQUFFLENBQUMsRUFBRSxFQUFFLE1BQU0sRUFBRSxDQUFDLEVBQUU7RUFDOUosRUFBRSxFQUFFLEVBQUUsSUFBSSxDQUFDLFVBQVUsRUFBRSxPQUFPLENBQUMsUUFBUSxFQUFFLEVBQUUsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxNQUFNLEVBQUUsRUFBRSxNQUFNLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsSUFBSSxFQUFFLFNBQVMsRUFBRSxFQUFFLEtBQUssRUFBRSxHQUFHLEVBQUUsY0FBYyxFQUFFLENBQUMsRUFBRSxLQUFLLEVBQUUsRUFBRSxVQUFVLEVBQUUsQ0FBQyxFQUFFLEVBQUUsTUFBTSxFQUFFLENBQUMsRUFBRTtFQUNwSyxFQUFFLEVBQUUsRUFBRSxJQUFJLENBQUMsY0FBYyxFQUFFLE9BQU8sQ0FBQyxRQUFRLEVBQUUsRUFBRSxFQUFFLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLE1BQU0sRUFBRSxFQUFFLE1BQU0sRUFBRSxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxJQUFJLEVBQUUsUUFBUSxFQUFFLEVBQUUsS0FBSyxFQUFFLEdBQUcsRUFBRSxjQUFjLEVBQUUsQ0FBQyxFQUFFLEtBQUssRUFBRSxFQUFFLFVBQVUsRUFBRSxDQUFDLEVBQUUsRUFBRSxNQUFNLEVBQUUsUUFBUSxFQUFFO0NBQ2pMLENBQUM7O0FBRUYsQUFBTyxNQUFNLGNBQWMsR0FBRztFQUM1QixFQUFFLEVBQUUsQ0FBQyxJQUFJLEVBQUUsUUFBUSxFQUFFLElBQUksQ0FBQyxRQUFRLEVBQUUsT0FBTyxFQUFFLFFBQVEsRUFBRSxNQUFNLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsSUFBSSxFQUFFLE1BQU0sRUFBRSxNQUFNLEVBQUUsQ0FBQyxDQUFDO0VBQzlGLEVBQUUsRUFBRSxDQUFDLElBQUksRUFBRSxhQUFhLEVBQUUsSUFBSSxDQUFDLFFBQVEsRUFBRSxPQUFPLEVBQUUsUUFBUSxFQUFFLE1BQU0sRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxJQUFJLEVBQUUsT0FBTyxFQUFFLE1BQU0sRUFBRSxDQUFDLENBQUM7RUFDcEcsRUFBRSxFQUFFLENBQUMsSUFBSSxFQUFFLFlBQVksRUFBRSxJQUFJLENBQUMsUUFBUSxFQUFFLE9BQU8sRUFBRSxRQUFRLEVBQUUsTUFBTSxFQUFFLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLElBQUksRUFBRSxPQUFPLEVBQUUsTUFBTSxFQUFFLENBQUMsQ0FBQztFQUNwRyxFQUFFLEVBQUUsQ0FBQyxJQUFJLEVBQUUsY0FBYyxFQUFFLElBQUksQ0FBQyxRQUFRLEVBQUUsT0FBTyxFQUFFLFFBQVEsRUFBRSxNQUFNLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsSUFBSSxFQUFFLE1BQU0sRUFBRSxNQUFNLEVBQUUsQ0FBQyxDQUFDO0VBQ3BHLEVBQUUsRUFBRSxDQUFDLElBQUksRUFBRSxVQUFVLEVBQUUsSUFBSSxDQUFDLFFBQVEsRUFBRSxPQUFPLEVBQUUsUUFBUSxFQUFFLE1BQU0sRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxJQUFJLEVBQUUsTUFBTSxFQUFFLE1BQU0sRUFBRSxDQUFDLENBQUM7RUFDaEcsRUFBRSxFQUFFLENBQUMsSUFBSSxFQUFFLGVBQWUsRUFBRSxPQUFPLEVBQUUsT0FBTyxFQUFFLFVBQVUsRUFBRSxDQUFDLEVBQUUsTUFBTSxFQUFFLENBQUMsQ0FBQztFQUN2RSxFQUFFLEVBQUUsQ0FBQyxJQUFJLEVBQUUsYUFBYSxFQUFFLE9BQU8sRUFBRSxPQUFPLEVBQUUsVUFBVSxFQUFFLENBQUMsRUFBRSxNQUFNLEVBQUUsQ0FBQyxDQUFDO0VBQ3JFLEVBQUUsRUFBRSxDQUFDLElBQUksRUFBRSxhQUFhLEVBQUUsT0FBTyxFQUFFLE9BQU8sRUFBRSxVQUFVLEVBQUUsQ0FBQyxFQUFFLE1BQU0sRUFBRSxDQUFDLENBQUM7RUFDckUsRUFBRSxFQUFFLENBQUMsSUFBSSxFQUFFLGFBQWEsRUFBRSxPQUFPLEVBQUUsT0FBTyxFQUFFLFVBQVUsRUFBRSxDQUFDLEVBQUUsTUFBTSxFQUFFLENBQUMsQ0FBQztFQUNyRSxFQUFFLEVBQUUsQ0FBQyxJQUFJLEVBQUUsWUFBWSxFQUFFLE9BQU8sRUFBRSxPQUFPLEVBQUUs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QUMsQ0FBQyxHQUFHLE1BQU0sQ0FBQyxDQUFDLElBQUlBLE1BQU0sQ0FBQyxVQUFVLEdBQUcsS0FBSyxDQUFDLENBQUM7R0FDekQsSUFBSTtJQUNILFlBQVksQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDO0dBQ3BCO0VBQ0QsT0FBTyxZQUFZLENBQUM7Q0FDckIsQ0FBQzs7QUFFRixBQUFPLE1BQU0sMEJBQTBCLEdBQUcsQ0FBQyxNQUFNLEtBQUs7RUFDcEQsSUFBSSxNQUFNLEdBQUcsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQztFQUMxQixHQUFHLE1BQU0sQ0FBQyxDQUFDLEdBQUdBLE1BQU0sQ0FBQyxVQUFVLEdBQUdBLE1BQU0sQ0FBQyxRQUFRLENBQUM7SUFDaEQsTUFBTSxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUM7R0FDZCxLQUFLLElBQUksTUFBTSxDQUFDLENBQUMsR0FBR0EsTUFBTSxDQUFDLFVBQVUsR0FBR0EsTUFBTSxDQUFDLFFBQVEsRUFBRTtJQUN4RCxNQUFNLENBQUMsQ0FBQyxHQUFHLEVBQUVBLE1BQU0sQ0FBQyxVQUFVLEdBQUdBLE1BQU0sQ0FBQyxVQUFVLENBQUMsR0FBR0EsTUFBTSxDQUFDLFNBQVE7R0FDdEUsTUFBTTtJQUNMLE1BQU0sQ0FBQyxDQUFDLEdBQUcsRUFBRSxNQUFNLENBQUMsQ0FBQyxJQUFJQSxNQUFNLENBQUMsVUFBVSxHQUFHQSxNQUFNLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQztHQUNoRTs7RUFFRCxHQUFHLE1BQU0sQ0FBQyxDQUFDLEdBQUdBLE1BQU0sQ0FBQyxVQUFVLEdBQUdBLE1BQU0sQ0FBQyxRQUFRLENBQUM7SUFDaEQsTUFBTSxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUM7R0FDZCxLQUFLLEdBQUcsTUFBTSxDQUFDLENBQUMsR0FBR0EsTUFBTSxDQUFDLFVBQVUsR0FBR0EsTUFBTSxDQUFDLFFBQVEsRUFBRTtJQUN2RCxNQUFNLENBQUMsQ0FBQyxHQUFHLEVBQUVBLE1BQU0sQ0FBQyxVQUFVLEdB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Q0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLEVBQUU7SUFDL0UsV0FBVyxFQUFFLE1BQU0sRUFBRSxPQUFPLENBQUMsTUFBTSxFQUFFLElBQUksQ0FBQyxVQUFVLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxFQUFFLElBQUksRUFBRSxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsRUFBRTtJQUNuRixXQUFXLEVBQUUsTUFBTSxFQUFFLE9BQU8sQ0FBQyxNQUFNLEVBQUUsSUFBSSxDQUFDLFVBQVUsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLEVBQUUsSUFBSSxFQUFFLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxFQUFFO0lBQ25GLFlBQVksRUFBRSxNQUFNLEVBQUUsT0FBTyxDQUFDLE1BQU0sRUFBRSxJQUFJLENBQUMsVUFBVSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsRUFBRSxJQUFJLEVBQUUsQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLEVBQUU7SUFDckYsR0FBRyxFQUFFLE1BQU0sRUFBRSxPQUFPLENBQUMsTUFBTSxFQUFFLElBQUksQ0FBQyxVQUFVLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxFQUFFLElBQUksRUFBRSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsRUFBRTtJQUN6RSxHQUFHLEVBQUUsTUFBTSxFQUFFLE9BQU8sQ0FBQyxNQUFNLEVBQUUsSUFBSSxDQUFDLFVBQVUsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLEVBQUUsSUFBSSxFQUFFLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxFQUFFO0lBQzNFLEdBQUcsRUFBRSxNQUFNLEVBQUUsT0FBTyxDQUFDLE1BQU0sRUFBRSxJQUFJLENBQUMsVUFBVSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsRUFBRSxJQUFJLEVBQUUsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLEVBQUU7SUFDM0UsR0FBRyxFQUFFLE1BQU0sRUFBRSxPQUFPLENBQUMsTUFBTSxFQUFFLElBQUksQ0FBQyxVQUFVLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxFQUFFLElBQUksRUFBRSxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsRUFBRTtJQUM1RSxHQUFHLEVBQUUsTUFBTSxFQUFFLE9BQU8sQ0FBQyxNQUFNLEVBQUUsSUFBSSxDQUFDLFVBQVUsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLEVBQUUsSUFBSSxFQUFFLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxFQUFFO0lBQzlFLEdBQUcsRUFBRSxNQUFNLEVBQUUsT0FBTyxDQUFDLE1BQU0sRUFBRSxJQUFJLENBQUMsVUFBVSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsRUFBRSxJQUFJLEVBQUUsQ0FBQyxVQUFVLENBQUMsQ0FBQyxDQUFDLEVBQUU7SUFDL0UsR0FBRyxFQUFFLE1BQU0sRUFBRSxPQUFPLENBQUMsTUFBTSxFQUFFLElBQUksQ0FBQyxVQUFVLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxFQUFFLElBQUksRUFBRSxDQUFDLFdBQVcsQ0FBQyxDQUFDLENBQUMsRUFBRTtJQUNoRixHQUFHLEVBQUUsTUFBTSxFQUFFLE9BQU8sQ0FBQyxNQUFNLEVBQUUsSUFBSSxDQUFDLFVBQVUsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLEVBQUUsSUFBSSxFQUFFLENBQUMsWUFBWSxDQUFDLENBQUMsQ0FBQyxFQUFFO0lBQ2pGLEdBQUcsRUFBRSxNQUFNLEVBQUUsT0FBTyxDQUFDLE1BQU0sRUFBRSxJQUFJLENBQUMsVUFBVSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsRUFBRSxJQUFJLEVBQUUsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLEVBQUU7SUFDM0UsR0FBRyxFQUFFLE1BQU0sRUFBRSxPQUFPLENBQUMsTUFBTSxFQUFFLElBQUksQ0FBQyxVQUFVLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxFQUFFLElBQUksRUFBRSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsRUFBRTtJQUN6RSxHQUFHLEVBQUUsTUFBTSxFQUFFLE9BQU8sQ0FBQyxNQUFNLEVBQUUsSUFBSSxDQUFDLFVBQVUsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLEVBQUUsSUFBSSxFQUFFLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxFQUFFO0lBQzNFLEdBQUcsRUFBRSxNQUFNLEVBQUUsT0FBTyxDQUFDLE1BQU0sRUFBRSxJQUFJLENBQUMsVUFBVSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsRUFBRSxJQUFJLEVBQUUsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLEVBQUU7SUFDM0UsR0FBRyxFQUFFLE1BQU0sRUFBRSxPQUFPLENBQUMsTUFBTSxFQUFFLElBQUksQ0FBQyxVQUFVLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxFQUFFLElBQUksRUFBRSxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsRUFBRTtJQUM1RSxHQUFHLEVBQUUsTUFBTSxFQUFFLE9BQU8sQ0FBQyxNQUFNLEVBQUUsSUFBSSxDQUFDLFVBQVUsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLEVBQUUsSUFBSSxFQUFFLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxFQUFFO0lBQzlFLEdBQUcsRUFBRSxNQUFNLEVBQUUsT0FBTyxDQUFDLE1BQU0sRUFBRSxJQUFJLENBQUMsVUFBVSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsRUFBRSxJQUFJLEVBQUUsQ0FBQyxVQUFVLENBQUMsQ0FBQyxDQUFDLEVBQUU7SUFDL0UsR0FBRyxFQUFFLE1BQU0sRUFBRSxPQUFPLENBQUMsTUFBTSxFQUFFLElBQUksQ0FBQyxVQUFVLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxFQUFFLElBQUksRUFBRSxDQUFDLFdBQVcsQ0FBQyxDQUFDLENBQUMsRUFBRTtJQUNoRixHQUFHLEVBQUUsTUFBTSxFQUFFLE9BQU8sQ0FBQyxNQUFNLEVBQUUsSUFBSSxDQUFDLFVBQVUsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLEVBQUUsSUFBSSxFQUFFLENBQUMsWUFBWSxDQUFDLENBQUMsQ0FBQyxFQUFFO0lBQ2pGLEdBQUcsRUFBRSxNQUFNLEVBQUUsT0FBTyxDQUFDLE1BQU0sRUFBRSxJQUFJ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TSxDQUFDLFFBQVEsQ0FBQztNQUM1QyxJQUFJLENBQUMsR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUMsR0FBRyxHQUFHLENBQUMsT0FBTyxDQUFDLEdBQUdBLE1BQU0sQ0FBQyxRQUFRLENBQUM7TUFDdEQsR0FBRyxDQUFDLFNBQVMsR0FBRyxvQkFBb0IsQ0FBQztNQUNyQyxHQUFHLENBQUMsUUFBUSxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUVBLE1BQU0sQ0FBQyxRQUFRLEVBQUVBLE1BQU0sQ0FBQyxRQUFRLENBQUMsQ0FBQztLQUN0RDtHQUNGO0VBQ0Y7QUFDRCxNQUFNLFNBQVMsR0FBRyxDQUFDLEtBQUssS0FBSztFQUMzQixHQUFHLENBQUMsU0FBUyxHQUFHLE1BQU0sQ0FBQztFQUN2QixHQUFHLENBQUMsSUFBSSxHQUFHLGlCQUFpQixDQUFDO0VBQzdCLEdBQUcsQ0FBQyxRQUFRLENBQUMsQ0FBQyxJQUFJLEVBQUUsS0FBSyxDQUFDLEVBQUUsQ0FBQyxHQUFHLEVBQUUsS0FBSyxDQUFDLEtBQUssQ0FBQyxDQUFDLEVBQUUsRUFBRSxFQUFFLEVBQUUsQ0FBQyxDQUFDO0VBQ3pELEdBQUcsQ0FBQyxRQUFRLENBQUMsQ0FBQyxRQUFRLEVBQUUsS0FBSyxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsQ0FBQyxFQUFFLEVBQUUsRUFBRSxFQUFFLENBQUMsQ0FBQztFQUNyRCxHQUFHLENBQUMsUUFBUSxDQUFDLENBQUMsT0FBTyxFQUFFLEtBQUssQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLENBQUMsRUFBRSxFQUFFLEVBQUUsRUFBRSxDQUFDLENBQUM7RUFDbkQsR0FBRyxDQUFDLFFBQVEsQ0FBQyxDQUFDLGNBQWMsRUFBRSxLQUFLLENBQUMsV0FBVyxDQUFDLENBQUMsRUFBRSxHQUFHLEVBQUUsRUFBRSxDQUFDLENBQUM7RUFDNUQsR0FBRyxDQUFDLFFBQVEsQ0FBQyxDQUFDLElBQUksRUFBRSxLQUFLLENBQUMsRUFBRSxDQUFDLEdBQUcsRUFBRSxLQUFLLENBQUMsTUFBTSxDQUFDLENBQUMsRUFBRSxHQUFHLEVBQUUsRUFBRSxDQUFDLENBQUM7RUFDM0QsR0FBRyxDQUFDLFFBQVEsQ0FBQyxDQUFDLGVBQWUsRUFBRSxLQUFLLENBQUMsWUFBWSxDQUFDLENBQUMsRUFBRSxHQUFHLEVBQUUsRUFBRSxDQUFDLENBQUM7Q0FDL0QsQ0FBQzs7QUFFRixNQUFNLE9BQU8sR0FBRyxDQUFDLEdBQUcsS0FBSztFQUN2QixJQUFJLFFBQVEsR0FBRyxHQUFHLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7RUFDN0IsSUFBSSxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLFFBQVEsQ0FBQyxNQUFNLEVBQUUsQ0FBQyxFQUFFLENBQUM7SUFDdEMsR0FBRyxDQUFDLFNBQVMsR0FBRyxNQUFNLENBQUM7SUFDdkIsR0FBRyxDQUFDLElBQUksR0FBRyxpQkFBaUIsQ0FBQztJQUM3QixHQUFHLENBQUMsUUFBUSxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUMsRUFBRSxFQUFFLEVBQUVBLE1BQU0sQ0FBQyxZQUFZLEdBQUcsU0FBUyxJQUFJLENBQUMsR0FBRyxFQUFFLENBQUMsR0FBRyxFQUFFLENBQUMsQ0FBQztHQUNoRjtDQUNGLENBQUM7O0FBRUYsTUFBTSxTQUFTLEdBQUcsQ0FBQyxJQUFJLEtBQUs7RUFDMUIsR0FBRyxDQUFDLFNBQVMsQ0FBQyxXQUFXLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRUEsTUFBTSxDQUFDLFdBQVcsRUFBRUEsTUFBTSxDQUFDLFlBQVksQ0FBQyxDQUFDO0VBQ2pGOzs7QUFHRCxNQUFNLE1BQU0sR0FBRztFQUNiLE1BQU0sRUFBRTtJQUNOLEdBQUdRLEtBQUssQ0FBQyxLQUFLLENBQUMsWUFBWSxDQUFDLFlBQVksQ0FBQztNQUN2QyxlQUFlLEVBQUUsQ0FBQztLQUNuQjs7SUFFRCxJQUFJLENBQUNBLEtBQUssQ0FBQyxLQUFLLENBQUMsQ0FBQztHQUNuQjtFQUNELFlBQVksQ0FBQyxFQUFFLEVBQUUsRUFBRSxDQUFDO0lBQ2xCLGVBQWUsQ0FBQyxDQUFDLElBQUksRUFBRSxDQUFDO0lBQ3hCLGVBQWUsQ0FBQyxDQUFDLElBQUksRUFBRSxDQUFDO0lBQ3hCLGVBQWUsR0FBR08sMEJBQWtDLENBQUNQLEtBQUssQ0FBQyxLQUFLLENBQUMsTUFBTSxDQUFDLENBQUM7SUFDekVSLE1BQU0sQ0FBQyxlQUFlLEdBQUcsZ0JBQWU7R0FDekM7RUFDRCxVQUFVLENBQUMsWUFBWSxDQUFDO0lBQ3RCLE9BQU8sR0FBRyxJQUFJLENBQUM7SUFDZixNQUFNLEdBQUcsWUFBWSxDQUFDO0dBQ3ZCO0NBQ0YsQ0FBQztBQUNGRCxVQUFVLENBQUMsV0FBVyxDQUFDLE1BQU0sQ0FBQyxDQUFDO0FBQy9CQSxVQUFVLENBQUMsU0FBUyxDQUFDLE1BQU0sRUFBRSxDQUFDLElBQUksRUFBRSxjQUFjLEVBQUUsT0FBTyxFQUFFLE1BQU0sQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDO0FBQzdFQSxVQUFVLENBQUMsU0FBUyxDQUFDLE1BQU0sRUFBRSxDQUFDLElBQUksRUFBRSxlQUFlLEVBQUUsT0FBTyxFQUFFLE1BQU0sQ0FBQyxZQUFZLENBQUMsQ0FBQyxDQUFDO0FBQ3BGQSxVQUFVLENBQUMsU0FBUyxDQUFDLE1BQU0sRUFBRSxDQUFDLElBQUksRUFBRSxhQUFhLEVBQUUsT0FBTyxFQUFFLE1BQU0sQ0FBQyxVQUFVLENBQUMsQ0FBQyxDQUFDOztBQ3JNekUsTUFBTSxPQUFPLEdBQUcsQ0FBQyxNQUFNLEVBQUUsSUFBSSxLQUFLO0VBQ3ZDLElBQUksSUFBSSxHQUFHLElBQUksS0FBSyxDQUFDLE1BQU0sQ0FBQyxDQUFDO0VBQzdCLElBQUksSUFBSSxFQUFFO0lBQ1IsSUFBSSxPQUFPLElBQUksQ0FBQyxJQUFJLElBQUksU0FBUyxFQUFFO1FBQy9CLElBQUksQ0FBQyxJQUFJLEdBQUcsSUFBSSxDQUFDO0tBQ3BCLE1BQU07UUFDSCxJQUFJLENBQUMsZ0JBQWdCLENBQUMsT0FBTyxFQUFFLE1BQU07WUFDakMsSUFBSSxDQUFDLFdBQVcsR0FBRyxDQUFDLENBQUM7WUFDckIsSUFBSSxDQUFDLElBQUksRUFBRSxDQUFDO1NBQ2YsRUFBRSxLQUFLLENBQUMsQ0FBQztLQUNiO0dBQ0Y7O0VBRUQsT0FBTyxJQUFJLENBQUM7Q0FDYjs7QUNDRCxJQUFJLGdCQUFnQixHQUFHLENBQUMsQ0FBQzs7QUFFekIsTUFBTSxxQkFBcUIsR0FBRyxDQUFDLEtBQUssS0FBSztFQUN2QyxHQUFHLEtBQUssQ0FBQyxXQUFXLENBQUM7TUFDakIsS0FBSyxDQUFDLFdBQVcsR0FBRyxLQUFLLENBQUM7R0FDN0I7O0VBRUQsSUFBSSxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLEtBQUssQ0FBQyxZQUFZLENBQUMsWUFBWSxDQUFDLFFBQVEsQ0FBQyxNQUFNLEVBQUUsQ0FBQyxFQUFFLENBQUM7TUFDcEUsSUFBSSxNQUFNLEdBQUcsS0FBSyxDQUFDLFlBQVksQ0FBQyxZQUFZLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQyxDQUFDO01BQ3pELElBQUksS0FBSyxFQUFFLEtBQUssQ0FBQztNQUNqQixHQUFHLE1BQU0sQ0FBQyxDQUFDLElBQUksTUFBTSxDQUFDLEtBQUssQ0FBQztVQUN4QixHQUFHLE1BQU0sQ0FBQyxDQUFDLEdBQUcsTUFBTSxDQUFDLEtBQUssRUFBRTtZQUMxQixNQUFNLENBQUMsQ0FBQyxJQUFJQyxNQUFNLENBQUMsWUFBWSxDQUFDO1lBQ2hDLEtBQUssR0FBR0EsTUFBTSxDQUFDLFlBQVksQ0FBQztXQUM3QixNQUFNO1lBQ0wsTUFBTSxDQUFDLENBQUMsSUFBSUEsTUFBTSxDQUFDLFlBQVksQ0FBQztZQUNoQyxLQUFLLEdBQUcsQ0FBQ0EsTUFBTSxDQUFDLFlBQVksQ0FBQztXQUM5QjtPQUNKOztNQUVELEdBQUcsTUFBTSxDQUFDLENBQUMsSUFBSSxNQUFNLENBQUMsS0FBSyxDQUFDO1FBQzFCLEdBQUcsTUFBTSxDQUFDLENBQUMsR0FBRyxNQUFNLENBQUMsS0FBSyxFQUFFO1VBQzFCLE1BQU0sQ0FBQyxDQUFDLElBQUlBLE1BQU0sQ0FBQyxZQUFZLENBQUM7VUFDaEMsS0FBSyxHQUFHQSxNQUFNLENBQUMsWUFBWSxDQUFDO1NBQzdCLE1BQU07VUFDTCxNQUFNLENBQUMsQ0FBQyxJQUFJQSxNQUFNLENBQUMsWUFBWSxDQUFDO1VBQ2hDLEtBQUssR0FBRyxDQUFDQSxNQUFNLENBQUMsWUFBWSxDQUFDO1NBQzlCO09BQ0Y7TUFDRCxHQUFHLE1BQU0sQ0FBQyxJQUFJLEtBQUssUUFBUSxFQUFFO1FBQzNCRCxVQUFVLENBQUMsV0FBVyxDQUFDLENBQUMsTUFBTSxFQUFFLGVBQWUsRUFBRSxPQUFPLEVBQUUsQ0FBQyxLQUFLLEVBQUUsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDO09BQzVFO0dBQ0o7RUFDRCxnQkFBZ0IsSUFBSUMsTUFBTSxDQUFDLFlBQVksQ0FBQztFQUN4QyxHQUFHLGdCQUFnQixLQUFLQSxNQUFNLENBQUMsUUFBUSxDQUFDO01BQ3BDLGdCQUFnQixHQUFHLENBQUMsQ0FBQztNQUNyQixLQUFLLENBQUMsZ0JBQWdCLEdBQUcsSUFBSSxDQUFDO0dBQ2pDO0VBQ0Y7O0FBRUQsTUFBTSxhQUFhLEdBQUc7RUFDcEIsQ0FBQyxFQUFFLEdBQUc7RUFDTixDQUFDLEVBQUUsR0FBRztFQUNOLENBQUMsRUFBRSxHQUFHO0VBQ04sQ0FBQyxFQUFFLElBQUk7RUFDUCxDQUFDLEVBQUUsSUFBSTtFQUNQLENBQUMsRUFBRSxJQUFJO0VBQ1AsQ0FBQyxFQUFFLEtBQUs7RUFDUixDQUFDLEVBQUUsS0FBSztFQUNSLENBQUMsRUFBRSxLQUFLO0VBQ1IsRUFBRSxFQUFFLE1BQU07Q0FDWCxDQUFDO0FBQ0YsSUFBSSxVQUFVLEdBQUcsT0FBTyxDQUFDLFdBQVcsQ0FBQyxDQUFDO0FBQ3RDLElBQUksWUFBWSxHQUFHLE9BQU8sQ0FBQyxXQUFXLEVBQUUsSUFBSSxDQUFDLENBQUM7O0FBRTlDLEFBQU8sTUFBTSxJQUFJLEdBQUc7RUFDbEIsS0FBSyxFQUFFUSxLQUFLLENBQUMsS0FBSztFQUNsQixRQUFRLEVBQUU7SUFDUixTQUFTLENBQUMsdUJBQXVCLEVBQUUsT0FBTyxDQUFDLENBQUM7SUFDNUMsZUFBZSxDQUFDLHVCQUF1QixFQUFFLEVBQUUsRUFBRSxHQUFHLEVBQUUsTUFBTTtNQUN0RCxJQUFJLENBQUMsR0FBRyxFQUFFLENBQUM7S0FDWixDQUFDLENBQUM7OztHQUdKO0VBQ0QsUUFBUSxFQUFFLENBQUM7RUFDWCxRQUFRLEVBQUUsQ0FBQztFQUNYLFlBQVksRUFBRSxJQUFJO0VBQ2xCLFlBQVksRUFBRSxJQUFJO0VBQ2xCLFdBQVcsRUFBRTtJQUNYLElBQUksQ0FBQyxZQUFZLEdBQUcsQ0FBQyxJQUFJLENBQUMsWUFBWSxDQUFDO0lBQ3ZDLEdBQUcsSUFBSSxDQUFDLFlBQVksRUFBRTtNQUNwQixJQUFJLENBQUMsWUFBWSxDQUFDLElBQUksRUFBRSxDQUFDO0tBQzFCLEtBQUs7TUFDSixJQUFJLENBQUMsWUFBWSxDQUFDLEtBQUssRUFBRSxDQUFDO0tBQzNCO0dBQ0Y7RUFDRCxLQUFLLEVBQUU7SUFDTFEsWUFBbUIsQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLENBQUM7SUFDbkMsSUFBSSxDQUFDLFFBQVEsR0FBRyxDQUFDLENBQUM7SUFDbEIsSUFBSSxDQUFDLFFBQVEsR0FBRyxDQUFDLENBQUM7OztJQUdsQlIsS0FBSyxDQUFDLFFBQVEsQ0FBQyxPQUFPLEVBQUUsS0FBSyxFQUFFLE9BQU8sQ0FBQyxHQUFHLENBQUMsbUJBQW1CLENBQUMsQ0FBQztNQUM5RCxJQUFJLENBQUMsWUFBWSxHQUFHLFVBQVUsQ0FBQztNQUMvQixJQUFJLElBQUksQ0FBQyxZQUFZLEVBQUU7UUFDckIsSUFBSSxDQUFDLFlBQVksQ0FBQyxJQUFJLEVBQUUsQ0FBQztPQUMxQjtLQUNGLEVBQUVTLGNBQWMsQ0FBQyxLQUFLLEVBQUUsQ0FBQztJQUMxQlQsS0FBSyxDQUFDLFFBQVEsQ0FBQyxVQUFVLEVBQUUsS0FBSyxFQUFFLE9BQU8sQ0FBQyxHQUFHLENBQUMsdUJBQXVCLENBQUMsQ0FBQztNQUNyRUEsS0FBSyxDQUFDLEtBQUssQ0FBQyxXQUFXLEdBQUcsS0FBSyxDQUFDO01BQ2hDQSxLQUFLLENBQUMsS0FBSyxDQUFDLGdCQUFnQixHQUFHLElBQUksQ0FBQztNQUNwQ0EsS0FBSyxDQUFDLE9BQU8sRUFBRSxDQUFDO01BQ2hCVSxLQUFZLEVBQUUsQ0FBQztNQUNmLElBQUksQ0FBQyxZQUFZLENBQUMsS0FBSyxFQUFFLENBQUM7TUFDMUIsSUFBSSxDQUFDLFlBQVksQ0FBQyxVQUFVLEdBQUcsQ0FBQyxDQUFDO0tBQ2xDLEVBQUVELGNBQWMsQ0FBQyxRQUFRLEVBQUUsQ0FBQztJQUM3QlQsS0FBSyxDQUFDLFFBQVEsQ0FBQyxNQUFNLEVBQUUsTUFBTSxFQUFFLE9BQU8sQ0FBQyxHQUFHLENBQUMsa0JBQWtCLENBQUMsQ0FBQztNQUM3RCxJQUFJLENBQUMsWUFBWSxDQUFDLEtBQUssRUFBRSxDQUFDO01BQzFCLElBQUksQ0FBQyxZQUFZLENBQUMsVUFBVSxHQUFHLENBQUMsQ0FBQztNQUNqQyxJQUFJLENBQUMsWUFBWSxHQUFHLFlBQVksQ0FBQztNQUNqQyxJQUFJLElBQUksQ0FBQyxZQUFZLEVBQUU7UUFDckIsSUFBSSxDQUFDLFlBQVksQ0FBQyxJQUFJLEVBQUUsQ0FBQztPQUMxQjtNQUNELElBQUksTUFBTSxHQUFHQSxLQUFLLENBQUMsV0FBVyxFQUFFLENBQUM7TUFDakNBLEtBQUssQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLFlBQVksR0FBRyxNQUFNLENBQUM7TUFDeENULFVBQVUsQ0FBQyxXQUFXLENBQUMsQ0FBQyxNQUFNLEVBQUUsWUFBWSxFQUFFLE9BQU8sRUFBRSxDQUFDUyxLQUFLLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxZQUFZLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDO01BQzlGLElBQUksV0FBVyxHQUFHLGtCQUFrQixDQUFDQSxLQUFLLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxZQUFZLENBQUMsR0FBRyxFQUFFQSxLQUFLLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxZQUFZLENBQUMsUUFBUSxDQUFDLENBQUM7TUFDbEhBLEtBQUssQ0FBQyxLQUFLLENBQUMsTUFBTSxHQUFHVyxXQUFrQixDQUFDLE1BQU0sRUFBRSxDQUFDLEVBQUUsV0FBVyxDQUFDLENBQUM7TUFDaEUsVUFBVSxDQUFDLEtBQUssRUFBRSxDQUFDO01BQ25CLFVBQVUsQ0FBQyxZQUFZLENBQUMsRUFBRSxHQUFHWCxLQUFLLENBQUMsS0FBSyxDQUFDLE1BQU0sQ0FBQyxFQUFFLENBQUM7TUFDbkQsVUFBVSxDQUFDLFlBQVksQ0FBQyxLQUFLLEdBQUdBLEtBQUssQ0FBQyxLQUFLLENBQUMsTUFBTSxDQUFDLEtBQUssQ0FBQztNQUN6RCxVQUFVLENBQUMsWUFBWSxDQUFDLFdBQVcsR0FBR0EsS0FBSyxDQUFDLEtBQUssQ0FBQyxNQUFNLENBQUMsS0FBSyxDQUFDO01BQy9ELFVBQVUsQ0FBQyxZQUFZLENBQUMsTUFBTSxHQUFHQSxLQUFLLENBQUMsS0FBSyxDQUFDLE1BQU0sQ0FBQyxNQUFNLENBQUM7TUFDM0QsVUFBVSxDQUFDLFlBQVksQ0FBQyxLQUFLLEdBQUdBLEtBQUssQ0FBQyxLQUFLLENBQUMsTUFBTSxDQUFDLEtBQUssQ0FBQztNQUN6RCxVQUFVLENBQUMsWUFBWSxDQUFDLGNBQWMsR0FBR0EsS0FBSyxDQUFDLEtBQUssQ0FBQyxNQUFNLENBQUMsY0FBYyxDQUFDO01BQzNFLFVBQVUsQ0FBQyxZQUFZLENBQUMsRUFBRSxHQUFHQSxLQUFLLENBQUMsS0FBSyxDQUFDLE1BQU0sQ0FBQyxFQUFFLENBQUM7O01BRW5ELFVBQVUsQ0FBQyxZQUFZLENBQUMsTUFBTSxHQUFHLGFBQWEsQ0FBQ0EsS0FBSyxDQUFDLEtBQUssQ0FBQyxNQUFNLENBQUMsS0FBSyxDQUFDLENBQUM7TUFDekUsVUFBVSxDQUFDLFlBQVksQ0FBQyxZQUFZLEdBQUcsTUFBTSxDQUFDLGNBQWMsQ0FBQzs7O0tBRzlELEVBQUVTLGNBQWMsQ0FBQyxJQUFJLEVBQUUsQ0FBQzs7SUFFekIsZ0JBQWdCLENBQUMsU0FBUyxFQUFFLENBQUMsS0FBSyxLQUFLO1FBQ25DbEIsVUFBVSxDQUFDLFdBQVcsQ0FBQyxDQUFDLE1BQU0sRUFBRSxXQUFXLEVBQUUsT0FBTyxFQUFFLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQztLQUN2RSxDQUFDLENBQUM7SUFDSFMsS0FBSyxDQUFDLFdBQVcsQ0FBQyxPQUFPLENBQUMsQ0FBQztHQUM1QjtFQUNELEdBQUcsR0FBRzs7SUFFSixHQUFHLENBQUNBLEtBQUssQ0FBQyxLQUFLLENBQUMsZ0JBQWdCLENBQUM7VUFDM0IsSUFBSSxDQUFDLE1BQU0sQ0FBQ0EsS0FBSyxDQUFDLEtBQUssQ0FBQyxDQUFDO0tBQzlCO0lBQ0QsSUFBSSxDQUFDQSxLQUFLLENBQUMsS0FBSyxDQUFDLENBQUM7SUFDbEIscUJBQXFCLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQztHQUM1QztFQUNELE1BQU0sQ0FBQyxLQUFLLEVBQUU7SUFDWixHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsWUFBWSxDQUFDLFlBQVksQ0FBQyxJQUFJLEtBQUssSUFBSSxDQUFDLFFBQVEsQ0FBQztNQUM3RCxJQUFJLENBQUMsUUFBUSxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsWUFBWSxDQUFDLFlBQVksQ0FBQyxJQUFJLENBQUM7TUFDMUQsSUFBSSxDQUFDLFlBQVksRUFBRSxDQUFDO01BQ3BCLElBQUksSUFBSSxDQUFDLFFBQVEsR0FBR1IsTUFBTSxDQUFDLG1CQUFtQixLQUFLLENBQUMsRUFBRTs7UUFFcEQsSUFBSSxDQUFDLGVBQWUsRUFBRSxDQUFDO09BQ3hCO0tBQ0Y7SUFDRCxHQUFHLEtBQUssQ0FBQyxZQUFZLENBQUMsSUFBSSxLQUFLLE1BQU0sRUFBRTtNQUNyQyxxQkFBcUIsQ0FBQyxLQUFLLENBQUMsQ0FBQztLQUM5QjtHQUNGO0VBQ0QsVUFBVSxDQUFDLEdBQUcsRUFBRTtJQUNkLElBQUksQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLFdBQVcsSUFBSSxJQUFJLENBQUMsS0FBSyxDQUFDLGdCQUFnQixFQUFFOzs7Ozs7TUFNMUQsSUFBSSxhQUFhLEdBQUdvQixVQUFrQixDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsTUFBTSxFQUFFLEdBQUcsQ0FBQyxDQUFDO01BQy9ELElBQUksZUFBZSxHQUFHQyxrQkFBeUIsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLFlBQVksQ0FBQyxZQUFZLEVBQUUsYUFBYSxDQUFDLEtBQUssQ0FBQyxDQUFDO01BQzNHLEdBQUcsYUFBYSxDQUFDLE1BQU0sQ0FBQyxRQUFRLENBQUM7UUFDL0IsSUFBSSxDQUFDLEtBQUssQ0FBQyxZQUFZLENBQUMsWUFBWSxDQUFDLElBQUksRUFBRSxDQUFDO1FBQzVDLElBQUksQ0FBQyxRQUFRLEVBQUUsQ0FBQzs7O1FBR2hCLElBQUksQ0FBQyxLQUFLLENBQUMsV0FBVyxHQUFHLElBQUksQ0FBQztRQUM5QixJQUFJLENBQUMsS0FBSyxDQUFDLGdCQUFnQixHQUFHLEtBQUssQ0FBQzs7UUFFcEMsSUFBSSxlQUFlLENBQUMsTUFBTSxHQUFHLENBQUMsRUFBRTtVQUM5QixJQUFJLFlBQVksR0FBRyxJQUFJLENBQUM7VUFDeEIsSUFBSSxVQUFVLEdBQUcsSUFBSSxDQUFDO1VBQ3RCLElBQUksU0FBUyxHQUFHLElBQUksQ0FBQztVQUNyQixLQUFLLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsZUFBZSxDQUFDLE1BQU0sRUFBRSxDQUFDLEVBQUUsRUFBRTtZQUMvQyxHQUFHLGVBQWUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLEtBQUssUUFBUSxFQUFFO2NBQ3ZDLFVBQVUsR0FBRyxDQUFDLENBQUM7YUFDaEIsTUFBTSxHQUFHLGVBQWUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLEtBQUssU0FBUyxFQUFFO2NBQy9DLFlBQVksR0FBRyxDQUFDLENBQUM7YUFDbEIsTUFBTSxHQUFHLGVBQWUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLEtBQUssTUFBTSxFQUFFO2NBQzVDLFNBQVMsR0FBRyxDQUFDLENBQUM7YUFDZjtXQUNGO1VBQ0QsSUFBSSxZQUFZLEtBQUssSUFBSSxFQUFFO1lBQ3pCLElBQUksQ0FBQyxZQUFZLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxNQUFNLEVBQUUsZUFBZSxDQUFDLFlBQVksQ0FBQyxFQUFFLElBQUksQ0FBQyxLQUFLLENBQUMsWUFBWSxDQUFDLFlBQVksQ0FBQyxDQUFDO1dBQzNHLE1BQU0sSUFBSSxVQUFVLEtBQUssSUFBSSxFQUFFOztZQUU5QixJQUFJLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsTUFBTSxFQUFFLGVBQWUsQ0FBQyxVQUFVLENBQUMsQ0FBQyxDQUFDO1lBQy9EdEIsVUFBVSxDQUFDLFdBQVcsQ0FBQyxDQUFDLE1BQU0sRUFBRSxjQUFjLEVBQUUsT0FBTyxFQUFFLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxZQUFZLENBQUMsQ0FBQyxDQUFDLENBQUM7V0FDdEYsTUFBTSxJQUFJLFNBQVMsS0FBSyxJQUFJLEVBQUU7WUFDN0IsSUFBSSxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLE1BQU0sRUFBRSxlQUFlLENBQUMsU0FBUyxDQUFDLEVBQUUsSUFBSSxDQUFDLEtBQUssQ0FBQyxZQUFZLENBQUMsWUFBWSxDQUFDLENBQUM7WUFDbEd1QixVQUFrQixDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsTUFBTSxFQUFFLEdBQUcsQ0FBQyxDQUFDO1lBQzNDdkIsVUFBVSxDQUFDLFdBQVcsQ0FBQyxDQUFDLE1BQU0sRUFBRSxjQUFjLEVBQUUsT0FBTyxFQUFFLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxZQUFZLENBQUMsQ0FBQyxDQUFDLENBQUM7V0FDdEY7U0FDRixNQUFNO1VBQ0x1QixVQUFrQixDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsTUFBTSxFQUFFLEdBQUcsQ0FBQyxDQUFDO1VBQzNDdkIsVUFBVSxDQUFDLFdBQVcsQ0FBQyxDQUFDLE1BQU0sRUFBRSxjQUFjLEVBQUUsT0FBTyxFQUFFLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxZQUFZLENBQUMsQ0FBQyxDQUFDLENBQUM7U0FDdEY7O09BRUY7O0tBRUY7R0FDRjtFQUNELFNBQVMsQ0FBQyxNQUFNLEVBQUUsTUFBTSxFQUFFO0lBQ3hCLElBQUksWUFBWSxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsWUFBWSxDQUFDLFlBQVksQ0FBQztJQUN4RCxJQUFJLFNBQVMsQ0FBQztJQUNkLEdBQUcsTUFBTSxDQUFDLFdBQVcsS0FBSyxJQUFJLENBQUM7TUFDN0IsU0FBUyxHQUFHUyxLQUFLLENBQUMsV0FBVyxDQUFDLFlBQVksRUFBRSxNQUFNLENBQUMsQ0FBQztLQUNyRCxNQUFNO01BQ0wsU0FBUyxHQUFHQSxLQUFLLENBQUMsTUFBTSxDQUFDLE1BQU0sQ0FBQyxXQUFXLENBQUMsQ0FBQztLQUM5Qzs7SUFFRCxNQUFNLENBQUMsS0FBSyxHQUFHLE1BQU0sQ0FBQyxXQUFXLENBQUM7O0lBRWxDLFNBQVMsQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDO0lBQ2hDLE1BQU0sQ0FBQyxNQUFNLENBQUMsTUFBTSxFQUFFZSxhQUFxQixDQUFDLE1BQU0sQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDO0lBQzNELE1BQU0sQ0FBQyxLQUFLLEdBQUcsTUFBTSxDQUFDLENBQUMsQ0FBQztJQUN4QixNQUFNLENBQUMsS0FBSyxHQUFHLE1BQU0sQ0FBQyxDQUFDLENBQUM7OztJQUd4QixJQUFJLE9BQU8sR0FBRyxTQUFTLENBQUM7SUFDeEIsR0FBRyxNQUFNLENBQUMsT0FBTyxLQUFLLFdBQVcsQ0FBQztNQUNoQyxPQUFPLElBQUksZUFBZSxDQUFDO0tBQzVCLE1BQU07TUFDTCxPQUFPLElBQUksaUJBQWlCLENBQUM7S0FDOUI7SUFDRCxVQUFVLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsQ0FBQztJQUNsQyxVQUFVLENBQUMsWUFBWSxDQUFDLFlBQVksR0FBRyxTQUFTLENBQUMsY0FBYyxDQUFDO0lBQ2hFLElBQUksQ0FBQyxTQUFTLENBQUMsTUFBTSxDQUFDLFdBQVcsQ0FBQyxDQUFDO0lBQ25DQyxxQkFBNEIsQ0FBQyxZQUFZLEVBQUUsTUFBTSxDQUFDLENBQUM7O0lBRW5EekIsVUFBVSxDQUFDLFdBQVcsQ0FBQyxDQUFDLE1BQU0sRUFBRSxhQUFhLEVBQUUsT0FBTyxFQUFFLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDO0dBQ2xFO0VBQ0QsU0FBUyxDQUFDLEtBQUssRUFBRTtJQUNmLElBQUksQ0FBQyxLQUFLLENBQUMsWUFBWSxDQUFDLFlBQVksR0FBR1MsS0FBSyxDQUFDLE1BQU0sQ0FBQyxLQUFLLENBQUMsQ0FBQztJQUMzREosY0FBcUIsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLFlBQVksQ0FBQyxZQUFZLENBQUMsQ0FBQzs7SUFFNURMLFVBQVUsQ0FBQyxXQUFXLENBQUMsQ0FBQyxNQUFNLEVBQUUsWUFBWSxFQUFFLE9BQU8sRUFBRSxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsWUFBWSxDQUFDLFlBQVksQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUM7SUFDcEdBLFVBQVUsQ0FBQyxXQUFXLENBQUMsQ0FBQyxNQUFNLEVBQUUsY0FBYyxFQUFFLE9BQU8sRUFBRSxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsWUFBWSxDQUFDLENBQUMsQ0FBQyxDQUFDOztHQUV0RjtFQUNELFlBQVksQ0FBQyxRQUFRLEVBQUUsUUFBUSxFQUFFLEtBQUssRUFBRTtJQUN0QyxJQUFJLE1BQU0sRUFBRSxJQUFJLEVBQUUsU0FBUyxFQUFFLFFBQVEsQ0FBUzs7O0lBRzlDLE1BQU0sR0FBRyxRQUFRLENBQUMsR0FBRyxRQUFRLENBQUMsTUFBTSxDQUFDLE1BQU0sQ0FBQyxDQUFDO0lBQzdDLE1BQU0sSUFBSSxRQUFRLENBQUMsY0FBYyxDQUFDO0lBQ2xDLElBQUksR0FBRyxRQUFRLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQzs7Ozs7O0lBTTVCLEdBQUcsTUFBTSxHQUFHLFFBQVEsQ0FBQyxLQUFLLENBQUMsVUFBVSxDQUFDO01BQ3BDLFFBQVEsQ0FBQyxFQUFFLElBQUksTUFBTSxHQUFHLFFBQVEsQ0FBQyxLQUFLLENBQUMsVUFBVSxDQUFDO0tBQ25ELE1BQU07TUFDTCxNQUFNLEdBQUcsQ0FBQyxDQUFDO0tBQ1o7OztJQUdELEdBQUcsUUFBUSxDQUFDLElBQUksS0FBSyxRQUFRLENBQUM7TUFDNUIsU0FBUyxHQUFHLEtBQUssQ0FBQztNQUNsQixRQUFRLEdBQUcsTUFBTSxHQUFHLFFBQVEsQ0FBQyxJQUFJLENBQUM7TUFDbEMsQUFBaUI7S0FDbEIsSUFBSTtNQUNILFNBQVMsR0FBRyxNQUFNLEdBQUcsUUFBUSxDQUFDLElBQUksQ0FBQztNQUNuQyxRQUFRLEdBQUcsS0FBSyxDQUFDO01BQ2pCLEFBQWdCO0tBQ2pCOztJQUVELElBQUksT0FBTyxHQUFHLENBQUMsRUFBRSxTQUFTLENBQUMsQ0FBQyxFQUFFLElBQUksQ0FBQyxDQUFDLEVBQUUsUUFBUSxDQUFDLENBQUMsQ0FBQzs7SUFFakQsVUFBVSxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLENBQUM7SUFDbEMsR0FBRyxRQUFRLENBQUMsSUFBSSxLQUFLLFFBQVEsQ0FBQztNQUM1QixVQUFVLENBQUMsWUFBWSxDQUFDLEVBQUUsR0FBRyxRQUFRLENBQUMsRUFBRSxDQUFDO0tBQzFDO0lBQ0QsR0FBRyxRQUFRLENBQUMsRUFBRSxJQUFJLENBQUMsQ0FBQztNQUNsQixHQUFHLFFBQVEsQ0FBQyxJQUFJLEtBQUssY0FBYyxFQUFFO1FBQ25DLFVBQVUsQ0FBQyxPQUFPLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQztVQUMvQixJQUFJLEVBQUUsQ0FBQyxzQ0FBc0MsQ0FBQztXQUM3QyxJQUFJLEVBQUUsRUFBRSxFQUFFLENBQUMsQ0FBQyxHQUFHLEVBQUUsQ0FBQyxFQUFFLEdBQUcsQ0FBQyxDQUFDLENBQUM7UUFDN0IsVUFBVSxDQUFDLE9BQU8sQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDO1VBQy9CLElBQUksRUFBRSxDQUFDLGtDQUFrQyxDQUFDO1VBQzFDLElBQUksRUFBRSxFQUFFLEVBQUUsQ0FBQyxDQUFDLEdBQUcsRUFBRSxDQUFDLEVBQUUsR0FBRyxDQUFDLENBQUMsQ0FBQztRQUM1QlMsS0FBSyxDQUFDLFdBQVcsQ0FBQyxVQUFVLENBQUMsQ0FBQztPQUMvQjs7UUFFQ2dCLHFCQUE0QixDQUFDLEtBQUssRUFBRSxRQUFRLENBQUMsQ0FBQztRQUM5QyxHQUFHLFFBQVEsQ0FBQyxJQUFJLEtBQUssUUFBUSxDQUFDO1VBQzVCLFFBQVEsQ0FBQyxFQUFFLElBQUksUUFBUSxDQUFDLEtBQUssQ0FBQztVQUM5QixVQUFVLENBQUMsWUFBWSxDQUFDLEVBQUUsR0FBRyxRQUFRLENBQUMsRUFBRSxDQUFDOztVQUV6QyxJQUFJLENBQUMsZ0JBQWdCLEVBQUUsQ0FBQztTQUN6Qjs7S0FFSjtHQUNGO0VBQ0QsWUFBWSxHQUFHO0lBQ2IsSUFBSSxRQUFRLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxZQUFZLENBQUMsWUFBWSxDQUFDLFFBQVEsQ0FBQztJQUM3RCxRQUFRLEdBQUcsUUFBUSxDQUFDLE1BQU0sQ0FBQyxNQUFNLElBQUksTUFBTSxDQUFDLElBQUksS0FBSyxTQUFTLENBQUMsQ0FBQztJQUNoRSxJQUFJLFNBQVMsQ0FBQztJQUNkLElBQUksSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxRQUFRLENBQUMsTUFBTSxFQUFFLENBQUMsRUFBRSxFQUFFO01BQ3ZDLElBQUksYUFBYSxHQUFHZCxTQUFpQixDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsQ0FBQztNQUN6RCxJQUFJLFdBQVcsR0FBR0MsWUFBb0IsQ0FBQyxhQUFhLEVBQUUsQ0FBQyxDQUFDLENBQUM7TUFDekQsSUFBSSxZQUFZLEdBQUcsV0FBVyxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsS0FBSztRQUMzQyxDQUFDLENBQUMsS0FBSyxHQUFHQyxTQUFpQixDQUFDLENBQUMsQ0FBQyxDQUFDO1FBQy9CLE9BQU8sQ0FBQyxDQUFDLEtBQUssS0FBS0osS0FBSyxDQUFDLEtBQUssQ0FBQyxNQUFNLENBQUMsS0FBSyxDQUFDO09BQzdDLENBQUMsQ0FBQztNQUNILEdBQUcsWUFBWSxDQUFDLE1BQU0sR0FBRyxDQUFDLEVBQUU7O1FBRTFCLFNBQVMsR0FBR2lCLHdCQUFnQyxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsWUFBWSxDQUFDLFlBQVksRUFBRSxhQUFhLEVBQUUsWUFBWSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7O1FBRW5ILFNBQVMsR0FBRyxTQUFTLElBQUlDLGlCQUF5QixDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsWUFBWSxDQUFDLFlBQVksRUFBRSxRQUFRLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQzs7OztPQUl2RyxNQUFNO1FBQ0wsU0FBUyxHQUFHQSxpQkFBeUIsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLFlBQVksQ0FBQyxZQUFZLEVBQUUsUUFBUSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7T0FDMUY7TUFDRCxJQUFJLFNBQVMsRUFBRTtRQUNiLElBQUksU0FBUyxDQUFDLFFBQVEsQ0FBQyxNQUFNLEdBQUcsQ0FBQyxFQUFFO1VBQ2pDLElBQUksV0FBVyxHQUFHLEtBQUk7VUFDdEIsSUFBSSxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLFNBQVMsQ0FBQyxRQUFRLENBQUMsTUFBTSxFQUFFLENBQUMsRUFBRSxFQUFFO1lBQ2pELEdBQUcsU0FBUyxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLEtBQUssUUFBUSxDQUFDO2NBQ3pDLFdBQVcsR0FBRyxDQUFDLENBQUM7YUFDakI7V0FDRjs7VUFFRCxHQUFHLFdBQVcsS0FBSyxJQUFJLEVBQUU7WUFDdkIsSUFBSSxDQUFDLFlBQVksQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDLEVBQUUsSUFBSSxDQUFDLEtBQUssQ0FBQyxNQUFNLEVBQUUsSUFBSSxDQUFDLEtBQUssQ0FBQyxZQUFZLENBQUMsWUFBWSxDQUFDLENBQUM7WUFDeEYsR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLE1BQU0sQ0FBQyxFQUFFLElBQUksQ0FBQyxDQUFDOztjQUUzQixVQUFVLENBQUMsT0FBTyxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUM7Z0JBQy9CLElBQUksRUFBRSxDQUFDLHFCQUFxQixFQUFFLFFBQVEsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsVUFBVSxFQUFFLElBQUksQ0FBQyxLQUFLLENBQUMsWUFBWSxDQUFDLFlBQVksQ0FBQyxjQUFjLENBQUMsQ0FBQztpQkFDL0csSUFBSSxFQUFFLEVBQUUsRUFBRSxDQUFDLENBQUMsR0FBRyxFQUFFLENBQUMsRUFBRSxHQUFHLENBQUMsRUFBQztjQUM1QmxCLEtBQUssQ0FBQyxXQUFXLENBQUMsVUFBVSxDQUFDLENBQUM7Y0FDOUIsTUFBTTthQUNQO1dBQ0YsTUFBTTtZQUNMYyxVQUFrQixDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUMsRUFBRSxTQUFTLENBQUMsR0FBRyxDQUFDLENBQUM7V0FDaEQ7U0FDRixNQUFNO1VBQ0xBLFVBQWtCLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQyxFQUFFLFNBQVMsQ0FBQyxHQUFHLENBQUMsQ0FBQztTQUNoRDtPQUNGOztLQUVGO0dBQ0Y7RUFDRCxnQkFBZ0IsR0FBRztJQUNqQixJQUFJLE1BQU0sR0FBR2QsS0FBSyxDQUFDLEtBQUssQ0FBQyxNQUFNLENBQUM7O0lBRWhDLEdBQUcsTUFBTSxDQUFDLEVBQUUsSUFBSSxhQUFhLENBQUMsTUFBTSxDQUFDLEtBQUssQ0FBQyxDQUFDO01BQzFDLE1BQU0sQ0FBQyxLQUFLLEVBQUUsQ0FBQztNQUNmLE1BQU0sQ0FBQyxLQUFLLElBQUksRUFBRSxDQUFDO01BQ25CLE1BQU0sQ0FBQyxFQUFFLElBQUksRUFBRSxDQUFDO01BQ2hCLE1BQU0sQ0FBQyxFQUFFLEdBQUcsTUFBTSxDQUFDLEVBQUUsR0FBRyxhQUFhLENBQUMsTUFBTSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQztNQUN0RCxNQUFNLENBQUMsY0FBYyxFQUFFLENBQUM7O01BRXhCLFVBQVUsQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLENBQUMseUNBQXlDLEVBQUUsTUFBTSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQztNQUNyRixVQUFVLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxpREFBaUQsQ0FBQyxDQUFDO01BQzVFLFVBQVUsQ0FBQyxZQUFZLENBQUMsRUFBRSxHQUFHLE1BQU0sQ0FBQyxFQUFFLENBQUM7TUFDdkMsVUFBVSxDQUFDLFlBQVksQ0FBQyxFQUFFLEdBQUcsTUFBTSxDQUFDLEVBQUUsQ0FBQztNQUN2QyxVQUFVLENBQUMsWUFBWSxDQUFDLEtBQUssR0FBRyxNQUFNLENBQUMsS0FBSyxDQUFDO01BQzdDLFVBQVUsQ0FBQyxZQUFZLENBQUMsV0FBVyxHQUFHLE1BQU0sQ0FBQyxLQUFLLENBQUM7TUFDbkQsVUFBVSxDQUFDLFlBQVksQ0FBQyxNQUFNLEdBQUcsYUFBYSxDQUFDLE1BQU0sQ0FBQyxLQUFLLENBQUMsQ0FBQzs7S0FFOUQ7R0FDRjtFQUNELE9BQU8sQ0FBQyxNQUFNLEVBQUUsSUFBSSxFQUFFLEtBQUssRUFBRTtJQUMzQixJQUFJLE9BQU8sQ0FBQztJQUNaLElBQUksU0FBUyxHQUFHLElBQUksQ0FBQyxTQUFTLENBQUM7SUFDL0IsR0FBRyxTQUFTLENBQUMsT0FBTyxLQUFLLFFBQVEsSUFBSSxNQUFNLENBQUMsTUFBTSxDQUFDLE1BQU0sR0FBRyxTQUFTLENBQUMsTUFBTSxDQUFDO01BQzNFLE1BQU0sQ0FBQyxNQUFNLEdBQUcsU0FBUyxDQUFDO01BQzFCLE9BQU8sR0FBRyxDQUFDLFlBQVksRUFBRSxTQUFTLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDO01BQzNDLFVBQVUsQ0FBQyxZQUFZLENBQUMsTUFBTSxHQUFHLFNBQVMsQ0FBQztLQUM1QztJQUNELEdBQUcsU0FBUyxDQUFDLE9BQU8sS0FBSyxPQUFPLElBQUksTUFBTSxDQUFDLEtBQUssQ0FBQyxNQUFNLEdBQUcsU0FBUyxDQUFDLE1BQU0sQ0FBQztNQUN6RSxNQUFNLENBQUMsS0FBSyxHQUFHLFNBQVMsQ0FBQztNQUN6QixPQUFPLEdBQUcsQ0FBQyxVQUFVLEVBQUUsU0FBUyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQztNQUN6QyxVQUFVLENBQUMsWUFBWSxDQUFDLEtBQUssR0FBRyxTQUFTLENBQUM7S0FDM0M7SUFDRCxHQUFHLFNBQVMsQ0FBQyxPQUFPLEtBQUssUUFBUSxDQUFDO01BQ2hDLE1BQU0sQ0FBQyxFQUFFLElBQUksU0FBUyxDQUFDLEtBQUssQ0FBQztNQUM3QixPQUFPLEdBQUcsQ0FBQyxJQUFJLEVBQUUsU0FBUyxDQUFDLElBQUksQ0FBQyxHQUFHLEVBQUUsU0FBUyxDQUFDLElBQUksQ0FBQyxXQUFXLEVBQUUsU0FBUyxDQUFDLEtBQUssQ0FBQyxRQUFRLENBQUMsQ0FBQztNQUMzRixVQUFVLENBQUMsWUFBWSxDQUFDLEVBQUUsR0FBRyxNQUFNLENBQUMsRUFBRSxDQUFDO0tBQ3hDO0lBQ0QsR0FBRyxPQUFPLENBQUM7TUFDVCxVQUFVLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsQ0FBQzs7S0FFbkM7SUFDRGdCLHFCQUE0QixDQUFDLEtBQUssRUFBRSxJQUFJLENBQUMsQ0FBQztHQUMzQztFQUNELGVBQWUsR0FBRztJQUNoQixJQUFJLFFBQVEsR0FBR1gsb0JBQTRCLEVBQUUsQ0FBQztJQUM5Q2MsZUFBc0IsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLFlBQVksQ0FBQyxZQUFZLEVBQUUsUUFBUSxDQUFDLENBQUM7R0FDeEU7Q0FDRjs7QUN0WkQsSUFBSSxDQUFDLFFBQVEsRUFBRSxDQUFDO0FBQ2hCLElBQUksQ0FBQyxLQUFLLEVBQUUsQ0FBQyJ9
