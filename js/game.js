// load game data
var cards = {};
fetch('./data/cards.json')
    .then((response) => response.json())
    .then((json) => cards = json);

var objects = {};
fetch('./data/objects.json')
    .then((response) => response.json())
    .then((json) => objects = json);    

// DOM elements
const start_screen = document.getElementById("start-screen"); 
const main_screen = document.getElementById("main-screen");
const images_pane = document.getElementById("images"); 
const story_pane = document.getElementById("story");
const options_pane = document.getElementById("options"); 
const character_name = document.getElementById("character-name");
const character_window = document.getElementById("character-stats");
const character_abilities = document.getElementById("character-abilities");
const notebook_window = document.getElementById("notebook");
const records_window = document.getElementById("records");
const records_body = document.getElementById("records-body");
const character_builder_window = document.getElementById("character-builder");
const character_builder_abilities = document.getElementById("character-builder-abilities");
const inventory_window = document.getElementById("inventory");
const inventory_table = document.getElementById("inventory-table");
const object_window = document.getElementById("show-object");
const object_image = document.getElementById("object-image");
const console_pane = document.getElementById("console");
const healthbar_pane = document.getElementById("healthbar");

class Weapon {
    constructor({name = "default", ammo = AMMO_INFINITE, attackNumDice = 1, attackCap = 6} = {}) {
        this.name = name;
        this.ammo = ammo;
        this.attackNumDice = attackNumDice;
        this.attackCap = attackCap;
    }
}

// game constants
const TOTAL_CHARACTER_POINTS = 40;
const PLAYER_MAX_HITPOINTS = 100;
const AMMO_INFINITE = -1;
const WEAPONS = {
    Fists: new Weapon({name: "fists", ammo: AMMO_INFINITE, attackNumDice: 1, attackCap: 4}),    // 1d4 + STR
    BankersSpecial: new Weapon({name: "Colt 38 Banker's Special", ammo: 6, attackNumDice: 2, attackCap: 8}),
}

// debug constants
const DEBUG = false;

class Game {
    constructor(player) {
        this.player = player;
        this.record = "";
        this.inventory = [ "bankers-special"];
        this.state = {
            start: {
                "question_how_you_found_me" : false,
                "question_call_police" : false,
                "question_what_happened" : false,
                "read_letter" : false
            }
        }
        this.currentEnemy = undefined;
        this.card = undefined;
    }
}

class Player {
    constructor() {
        // name
        this.firstname = "Sam";
        this.lastname = "Spade";
        // stats
        this.hitpoints = PLAYER_MAX_HITPOINTS;
        this.armorClass = 12;
        // weapon
        this.setWeapon(WEAPONS.BankersSpecial);
        // money
        this.money = 15;
        // attributes / abilities
        this.muscle = 5;                // strength feats and hand to hand combat
        this.moxie = 5;                 // constitution
        this.handEyeCoordination = 5;   // shooting and knife skills, lock picking
        this.suavity = 5;               // how convincing you are
        this.erudition = 5;             // book knowledge
        this.streetsmarts = 5;          // street knowledge
        this.faith = 5;

        // traits
        this.cautious = 5;
        this.bold = 5;
        // law-abiding -- criminal
        // 
    }
    setWeapon(weapon) {
        this.weapon = weapon;
        this.attackCap = weapon.attackCap;
        this.attackNumDice = weapon.attackNumDice;
    }
    remainingPoints() {
        return TOTAL_CHARACTER_POINTS - (this.muscle + this.moxie + this.handEyeCoordination + this.suavity + this.erudition + this.streetsmarts + this.faith);
    }
    fullname() {
        return this.firstname + " " + this.lastname;
    }
    healthPercentage() {
        return Math.ceil((this.hitpoints / PLAYER_MAX_HITPOINTS) * 100);
    }
}

class Enemy {
    constructor({name = "Enemy", hitpoints = 10, attackNumDice= 1, attackCap = 6, armorClass = 8, weapon = WEAPONS.BankersSpecial} = {}) {
        this.name = name;
        this.armorClass = armorClass;
        this.hitpoints = hitpoints;
        this.maxHitpoints = hitpoints;
        this.setWeapon(weapon);
    }
    setWeapon(weapon) {
        this.weapon = weapon;
        this.attackCap = weapon.attackCap;
        this.attackNumDice = weapon.attackNumDice;
    }
    fullname() {
        return this.name;
    }
    healthPercentage() {
        return Math.ceil((this.hitpoints / this.maxHitpoints) * 100);
    }
}

var game = new Game(new Player());

function startGame() {
    game = new Game(new Player());
    hideCharacterBuilderWindow();
    character_name.innerHTML = game.player.firstname + " " + game.player.lastname;
    start_screen.hidden = true;
    main_screen.hidden = false;
    playMusic();
    displayCard(cards.start);
}

function showCharacterBuilderWindow() {
    editCharacterAbilities(character_builder_abilities);
    character_builder_window.hidden = false;
}

function hideCharacterBuilderWindow() {
    character_builder_window.hidden = true;
}

function showCharacterWindow() {
    displayCharacterAbilities(character_abilities);
    character_window.hidden = false;
}

function hideCharacterWindow() {
    character_window.hidden = true;
}

function renderInventoryObject(index) {
    var object_name = game.inventory[index];
    var object = objects[object_name];
    if (typeof object == 'undefined') {
        return '<td width="10%" align="center"> <img src="./img/empty-image.png" width="80%" /> </td>';
    } else {
        return '<td width="10%" align="center"> <div data-title="' + object.description + '"> <img src="./img/'+ object.thumbnail + '" width="80%" onClick="showObject(\'' + object_name + '\')"/> </div> </td> ';
    }
}

function showInventoryWindow() {
    var table_body = "";
    // render upper row
    table_body += '<tr>';
    for (i=0; i<5; i++) {
        table_body += renderInventoryObject(i);
    }
    table_body += '</tr>';
    // render bottom row
    table_body += '<tr>';
    for (i=5; i<10; i++) {
        table_body += renderInventoryObject(i);
    }
    table_body += '</tr>';
    inventory_table.innerHTML = table_body;

    inventory_window.hidden = false;
}

function hideInventoryWindow() {
    inventory_window.hidden = true;
}

function showObject(obj_name) {
    var obj = objects[obj_name];
    object_image.src = "./img/" + obj.image;
    object_window.hidden = false;
}

function hideObject() {
    object_window.hidden = true;
}

function hideCharacterWindow() {
    inventory_window.hidden = true;
}

function showNotebookWindow() {
    notebook_window.hidden = false;
}

function hideNotebookWindow() {
    notebook_window.hidden = true;
}

function showRecordsWindow() {
    records_body.innerHTML = game.record;
    records_window.hidden = false;
}

function hideRecordsWindow() {
    records_window.hidden = true;
}

function editCharacterAbilities(pane) {   
    pane.innerHTML = "";
    pane.innerHTML += "<tr><td><span colspan=4 style='text-align: center;'> Points to distribute: " + game.player.remainingPoints() + "</span></td></tr>";
    pane.innerHTML += "<tr><td><span data-title='Affects strength feats and hand to hand combat.'>Muscle               : </span></td>&nbsp;&nbsp;&nbsp;<td><button class='game-button'>-</button> <span>" + game.player.muscle + "</span> <button class='game-button'>+</button></td></tr>";
    pane.innerHTML += "<tr><td><span data-title='How much abuse you can suffer before giving up the ghost. Also affects how well you hold your liquor.'>Moxie                : </span></td>&nbsp;&nbsp;&nbsp;<td><span>" + game.player.moxie + "</span></td></tr>";
    pane.innerHTML += "<tr><td><span data-title='Influences shooting and blade skills, as well as lock picking and sleight of hand.'>Hand-eye coordination: </span></td>&nbsp;&nbsp;&nbsp;<td><span>" + game.player.handEyeCoordination + "</span></td></tr>";
    pane.innerHTML += "<tr><td><span data-title='How good you are in talking people into giving you what you want.'>Suavity              : </span></td>&nbsp;&nbsp;&nbsp;<td><span>" + game.player.suavity + "</span></td></tr>";
    pane.innerHTML += "<tr><td><span data-title='The kind of knowledge you only find in books.'>Erudition            : </span></td>&nbsp;&nbsp;&nbsp;<td><span>" + game.player.erudition + "</span></td></tr>";
    pane.innerHTML += "<tr><td><span data-title='The kind of knowledge you cannot find in any book.'>Street smarts        : </span></td>&nbsp;&nbsp;&nbsp;<td><span>" + game.player.streetsmarts + "</span></td></tr>";
    pane.innerHTML += "<tr><td><span data-title=\"How much you gamble in Pascal's Wager.\">Faith        : </span></td>&nbsp;&nbsp;&nbsp;<td><span>" + game.player.faith + "</span></td></tr>";
}

function displayCharacterAbilities(pane) {   
    pane.innerHTML = "";
    pane.innerHTML += "<tr><td><span data-title='Affects strength feats and hand to hand combat.'>Muscle               : </span></td>&nbsp;&nbsp;&nbsp;<td><span>" + game.player.muscle + "</span></td></tr>";
    pane.innerHTML += "<tr><td><span data-title='How much abuse you can suffer before giving up the ghost. Also affects how well you hold your liquor.'>Moxie                : </span></td>&nbsp;&nbsp;&nbsp;<td><span>" + game.player.moxie + "</span></td></tr>";
    pane.innerHTML += "<tr><td><span data-title='Influences shooting and blade skills, as well as lock picking and sleight of hand.'>Hand-eye coordination: </span></td>&nbsp;&nbsp;&nbsp;<td><span>" + game.player.handEyeCoordination + "</span></td></tr>";
    pane.innerHTML += "<tr><td><span data-title='How good you are in talking people into giving you what you want.'>Suavity              : </span></td>&nbsp;&nbsp;&nbsp;<td><span>" + game.player.suavity + "</span></td></tr>";
    pane.innerHTML += "<tr><td><span data-title='The kind of knowledge you only find in books.'>Erudition            : </span></td>&nbsp;&nbsp;&nbsp;<td><span>" + game.player.erudition + "</span></td></tr>";
    pane.innerHTML += "<tr><td><span data-title='The kind of knowledge you cannot find in any book.'>Street smarts        : </span></td>&nbsp;&nbsp;&nbsp;<td><span>" + game.player.streetsmarts + "</span></td></tr>";
    pane.innerHTML += "<tr><td><span data-title=\"How much you gamble in Pascal's Wager.\">Faith        : </span></td>&nbsp;&nbsp;&nbsp;<td><span>" + game.player.faith + "</span></td></tr>";
}

function updateHealthBar(player) {
    var style = "progress-100";
    if (player.healthPercentage() <= 50) style = "progress-50";
    if (player.healthPercentage() <= 20) style = "progress-20";
    healthbar_pane.innerHTML = "<progress value='" + player.hitpoints + "' max='"+ PLAYER_MAX_HITPOINTS +"' class='"+style+"' data-title='Health: "+ player.healthPercentage() +"%.'></progress>&nbsp; <br>";
}

async function displayCard(card) {
    game.card = card;
    clearStory();
    clearOptions();
    displayImage(card);
    updateHealthBar(game.player);
    await displayStory(card.story);
    displayOptions(card);
}

function clearOptions() {
    options_pane.innerHTML = "";
}

function processPostcondition(postcondition) {
    if (postcondition.startsWith('state.') || postcondition.startsWith('inventory.') || postcondition.startsWith('player.') || postcondition.startsWith('currentEnemy')) {
        indirectEval("this.game." + postcondition);
    } else {
        indirectEval(postcondition);
    }
}

function chooseOption(option) {
    if (option.postcondition !== undefined) {    // process postcondition, if present
        processPostcondition(option.postcondition);
    }
    if (option.postconditions !== undefined) {    // process postconditions, if present
        option.postconditions.forEach((postcondition) => processPostcondition(postcondition));
    }
    displayCard(cards[option.targetCard]);
}

function displayOptions(card) {
    options_pane.innerHTML += "<span class='user-option-header'>What should I do?</span> <br>";
    card.options.forEach((option, index) => {
        if (option.precondition !== undefined) {    // is there a precondition?
            var precond = option.precondition
            if (option.precondition.startsWith('state.') || option.precondition.startsWith('player.')) {
                precond = "this.game." + precond;
            }
            const result = indirectEval(precond);
            if (!result) return;  // if precondition is not satisfied, skip this option
    }
        options_pane.innerHTML += "<span onClick='chooseOption(cards." + card.name + ".options[" + index + "])' class=\"user-option\">&nbsp;&nbsp;" + option.displayText + "</span> <br>"
    });
}

function displayImage(card) {
    const imgName = card.image;
    if (imgName !== null && imgName !== undefined) {
        images_pane.innerHTML = "<img id='image1' class='image1' width=100% src='./img/" + imgName + "'/>"
    }
    const overlayImageName = card.overlayImage;
    if (overlayImageName !== undefined) {
        overlayImage(overlayImageName, false);
    }
};

async function overlayImage(name, fade) {
    if (name !== null && name !== undefined) {
        var opacity = fade? 0 : 1;
        images_pane.innerHTML += "<img id='image2' class='image2' width=100% src='./img/" + name + "' style='opacity: " + opacity + "'/>"
        if (fade) await fadeIn("image2");
    }
}

function clearOverlayImage() {
    const overlayImage = document.getElementById("image2");
    overlayImage.style.opacity = 0;
}

async function fadeOverlayImageOut() {
    const overlayImage = document.getElementById("image2");
    if (overlayImage !== undefined) await fadeOut("image2");
}

async function fadeImageOut() {
    await fadeToBlack("image1");
}

const SOUND_GAIN_MAX = 1.0;
const SOUND_GAIN_FULL = 0.5;
const SOUND_GAIN_MEDIUM = 0.3;
const SOUND_GAIN_LOW = 0.1;

function playAudio(sourceName, gain) {
    if (DEBUG) return;  // skip audio in DEBUG mode

    const audioCtx = new AudioContext();
    const audio = new Audio(sourceName);

    var gainNode = audioCtx.createGain()
    gainNode.gain.value = gain;
    gainNode.connect(audioCtx.destination)

    const source = audioCtx.createMediaElementSource(audio);
    source.connect(gainNode);
    audio.play();
}

function playMusic() {
    playAudio("./audio/BennyCarter-Nightfall.mp3", SOUND_GAIN_LOW);
    playAudio("./audio/rain.wav", SOUND_GAIN_LOW);
}

function clearStory() {
    story_pane.innerHTML = "";
}

async function displayStory(sentences) {
    for (var i=0; i < sentences.length; i++) {
        const sentence = sentences[i];
        if (sentence.precondition !== undefined && sentence.story !== undefined) {
            const result = indirectEval(sentence.precondition);
            if (result) {
                displayStory(sentence.story);
            }
            continue;
        }
        if (sentence === "p") {
            var to_add = "<br>";
            story_pane.innerHTML += to_add;
            game.record += to_add;
        } else if (sentence.startsWith("play_sound: ")) {
            var splitCommand = sentence.split(/\s/);
            playAudio(splitCommand[1], SOUND_GAIN_FULL);
        } else if (sentence.startsWith("display_image: ")) {
            var splitCommand = sentence.split(/\s/);
            displayImage(splitCommand[1]);
        } else if (sentence.startsWith("overlay_image: ")) {
            var splitCommand = sentence.split(/\s/);
            overlayImage(splitCommand[1], true);
        } else if (sentence.startsWith("fade_out_image")) {
            await fadeOverlayImageOut();
            await fadeImageOut();
        } else {
            story_pane.innerHTML += sentenceOpaque(sentence, i);;
            await fadeIn("sentence" + i);
            game.record += sentenceRecord(sentence);
        }
        if (!DEBUG) await sleep(1000);
    }
}

function sentenceOpaque(sentence, i) {
    return '<span id="sentence' + i + '" style="opacity: 0">' + sentence + ' </span>';
}

function sentenceRecord(sentence) {
    return '<span class="typewriter">' + sentence + ' </span>';
}

function writeConsole(message) {
    console_pane.innerHTML += '<span>' + message + '</span><br>';
}

function clearConsole() {    
    console_pane.innerHTML = "";
}

function combat({ playerAttacksFirst = true, playerWeapon = WEAPONS.Fists} = {}) {
    clearConsole();

    // attack roll round (do any of the combatants hit each other)?
    var playerHitsEnemy = false;
    var enemyHitsPlayer = false;
    while (!playerHitsEnemy && !enemyHitsPlayer) {
        playerHitsEnemy = attackRoll(game.player, game.currentEnemy, playerWeapon);
        enemyHitsPlayer = attackRoll(game.currentEnemy, game.player, game.currentEnemy.weapon);
    }

    if (playerHitsEnemy) {
        const damage = damageRoll(game.player, game.currentEnemy, playerWeapon);
        if (playerWeapon === WEAPONS.Fists) {
            writeConsole("I punch " + game.currentEnemy.fullname() + " square in the chin.");
            playAudio('./audio/punch-boxing.wav', SOUND_GAIN_FULL);
        } else {
            writeConsole("I aim true and squeeze the trigger of my " + game.player.weapon.name + ".");
            playAudio('./audio/single-shot.wav', SOUND_GAIN_FULL);
        }
        writeConsole("I deal " + damage + " damage points to " + game.currentEnemy.fullname() + ".");
        writeConsole(game.currentEnemy.fullname() + " has now " + game.currentEnemy.hitpoints + " hitpoint(s) ("+ game.currentEnemy.healthPercentage()  + "% health).");
    } else {
        if (playerWeapon === WEAPONS.Fists) {
            writeConsole("I unleash my fist in a vicious uppercut, but the bastard shuffles and dodges it.");
        } else {
            writeConsole("I pump metal with my " + game.player.weapon.name + ", but the recoil makes me miss the shot.");
            playAudio('./audio/single-shot.wav', SOUND_GAIN_FULL);
        }
    }
    if (game.currentEnemy.hitpoints > 0) {  // dead enemies cause no damage
        writeConsole('');   // empty line
        if (enemyHitsPlayer) {
            const damage = damageRoll(game.currentEnemy, game.player, game.currentEnemy.weapon);
            writeConsole(game.currentEnemy.fullname() + " shoots at me.");
            writeConsole("I take " + damage + " damage points.");
            writeConsole("I have now " + game.player.hitpoints + " hitpoint(s) ("+ game.player.healthPercentage()  + "% health).");
        } else {
            writeConsole(game.currentEnemy.fullname() + " throws lead at me, but the palooka misses it.");
            playAudio('./audio/bullet-flyby.wav', SOUND_GAIN_FULL);
        }
    } else {
        writeConsole("You've sent " + game.currentEnemy.fullname() + " to the big sleep.");
        playAudio('./audio/male-death.mp3', SOUND_GAIN_FULL);

    }

}

// determines if an attack hits or misses
// returns a boolean (true = hit)
function attackRoll(attacker, target, weapon) {
    // TODO: use attacker stats to change odds
    var hit = false;
    var roll = 0;
    for (n=0; n<weapon.attackNumDice; n++) {
        roll += rollDice(weapon.attackCap);
    }
    if (roll < target.armorClass) {
        hit = true;
    }
    return hit;
}

// determines the attack damage
// returns an integer between 1 and max weapon damage
function damageRoll(attacker, target, weapon) {
    // TODO: use attacker stats to change odds
    roll = 0;
    for (n=0; n<weapon.attackNumDice; n++) {
        roll += rollDice(weapon.attackCap);
    }
    if (roll == 0) roll = 1;    // damage is at least 1 
    damage = Math.min(roll, target.hitpoints);  // damage cannot exceed target's hitpoints
    target.hitpoints -= damage;
    return damage;
}

// utility functions

function fadeIn(id) {
    var fade = document.getElementById(id);
    if (!DEBUG) {
        var opacity = 0;
        var intervalID = setInterval(function() {
            if (opacity < 1) {
                opacity = opacity + 0.1
                fade.style.opacity = opacity;
            } else {
                fade.style.opacity = 1;
                clearInterval(intervalID);
            }
        }, 80);
    } else {    // DEBUG
        fade.style.opacity = 1;
    }
}

function fadeOut(id) {
    const fade = document.getElementById(id);
    if (!DEBUG) {
        var opacity = 1;
        const intervalID = setInterval(function() {
            if (opacity > 0) {
                opacity = opacity - 0.1;
                fade.style.opacity = opacity;
            } else {
                fade.style.opacity = 0;
                clearInterval(intervalID);
            }
        }, 80);
    } else {    // DEBUG
        fade.style.opacity = 1;
    }
}

function fadeToBlack(id) {
    const fade = document.getElementById(id);
    if (!DEBUG) {
        var opacity = 1;
        const intervalID = setInterval(function() {
            if (opacity > 0) {
                opacity = opacity - 0.1;
                fade.style.opacity = opacity;
                images_pane.style.backgroundColor = "#5C4033";   // dark brown
            } else {
                fade.style.opacity = 0;
                images_pane.style.backgroundColor = "#5C4033";   // dark brown
                clearInterval(intervalID);
            }
        }, 80);
    } else {    // DEBUG
        fade.style.opacity = 1;
    }
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

function indirectEval(obj) {
    var result = eval?.(`"use strict";(${obj})`);
    return result;
}

function rollDice(max) {
    var roll = Math.floor(Math.random() * max);
    return roll;
}
