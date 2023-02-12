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

// game constants
const TOTAL_CHARACTER_POINTS = 40;

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
    }
}

class Player {
    constructor() {
        // name
        this.firstname = "Sam";
        this.lastname = "Spade";
        // stats
        this.health = 100;
        this.money = 100;
        // attributes / abilities
        this.muscle = 5;                // strength feats and hand to hand combat
        this.moxie = 5;                 // constitution
        this.handEyeCoordination = 5;   // shooting and knife skills, lock picking
        this.suavity = 5;               // how convincing you are
        this.erudition = 5;             // book knowledge
        this.streetsmarts = 5;          // street knowledge
        this.faith = 5;

        // traits
        // cautious -- bold
        // law-abiding -- criminal
        // 
    }
    remainingPoints() {
        return TOTAL_CHARACTER_POINTS - (this.muscle + this.moxie + this.handEyeCoordination + this.suavity + this.erudition + this.streetsmarts + this.faith);
    }
}

var game = new Game(new Player());

function startGame() {
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
        return '<td width="10%" align="center"> <img src="./img/empty-image.png" width="80%" height="100%"/> </td>';
    } else {
        return '<td width="10%" align="center"> <div data-title="' + object.description + '"> <img src="./img/'+ object.thumbnail + '" width="80%" height="100%" onClick="showObject(\'' + object_name + '\')"/> </div> </td> ';
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

async function displayCard(card) {
    clearStory();
    clearOptions();
    displayImage(card.image);
    await displayStory(card.story);
    displayOptions(card);
}

function clearOptions() {
    options_pane.innerHTML = "";
}

function processPostcondition(postcondition) {
    if (postcondition.startsWith('state.') || postcondition.startsWith('inventory.')) {
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
            if (option.precondition.startsWith('state.')) {
                const result = indirectEval("this.game." + option.precondition);
                if (!result) return;  // if precondition is not satisfied, skip this option
            }
        }
        options_pane.innerHTML += "<span onClick='chooseOption(cards." + card.name + ".options[" + index + "])' class=\"user-option\">&nbsp;&nbsp;" + option.displayText + "</span> <br>"
    });
}

function displayImage(name) {
    if (name !== null && name !== undefined) {
        images_pane.innerHTML = "<img width=100% src='./img/" + name + "'/>"
    }
};

const SOUND_GAIN_FULL = 1.0;
const SOUND_GAIN_MEDIUM = 0.5;
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
    playAudio("./audio/BennyCarter-Nightfall.mp3", SOUND_GAIN_MEDIUM);
    playAudio("./audio/rain.wav", SOUND_GAIN_MEDIUM);
}

function clearStory() {
    story_pane.innerHTML = "";
}

async function displayStory(sentences) {
    for (var i=0; i < sentences.length; i++) {
        const sentence = sentences[i];
        if (sentence === "p") {
            var to_add = "<br>";
            story_pane.innerHTML += to_add;
            game.record += to_add;
        } else if (sentence.startsWith("play_sound: ")) {
            var splitCommand = sentence.split(/\s/);
            playAudio(splitCommand[1], SOUND_GAIN_FULL);
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

// utility functions

function fadeIn(id) {
    var fade = document.getElementById(id);
    if (!DEBUG) {
        var opacity = 0;
        var intervalID = setInterval(function() {
            if (opacity < 1) {
                opacity = opacity + 0.1
                fade.style.opacity = opacity;
                //console.log(id + " opacity: " + fade.style.opacity); 
            } else {
                fade.style.opacity = 1;
                //console.log(id + " opacity DONE: " + fade.style.opacity); 
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
    return eval?.(`"use strict";(${obj})`);
}
