// load game data
var cards = {};
fetch('./data/cards.json')
    .then((response) => response.json())
    .then((json) => cards = json);

var objects = {};
fetch('./data/objects.json')
    .then((response) => response.json())
    .then((json) => objects = json);    

const landmarks = {
    "office": {
        "description": "My office.",
        "thumbnail": "office-landmark.png",
        "targetCard": "start_car"
    },
    "park": {
        "description": "The City Park.",
        "thumbnail": "park-landmark.png",
        "targetCard": "start_chapter2"
    }

}

// DOM elements
const start_screen = document.getElementById("start-screen"); 
const main_screen = document.getElementById("main-screen");
const images_pane = document.getElementById("images"); 
const story_pane = document.getElementById("story");
const options_pane = document.getElementById("options"); 
const character_name = document.getElementById("character-name");
const character_image = document.getElementById("character-image");
const character_window = document.getElementById("character-stats");
const character_abilities = document.getElementById("character-abilities");
const notebook_window = document.getElementById("notebook");
const records_window = document.getElementById("records");
const records_body = document.getElementById("records-body");
const character_builder_window = document.getElementById("character-builder");
const character_builder_gender = document.getElementById("character-builder-gender");
const character_builder_image = document.getElementById("character-builder-image");
const character_builder_abilities = document.getElementById("character-builder-abilities");
const inventory_window = document.getElementById("inventory");
const inventory_table = document.getElementById("inventory-table");
const map_window = document.getElementById("map");
const map_table = document.getElementById("map-table");
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
const MAX_TRAIT_VALUE = 10;
const MALE = "male";
const FEMALE = "female";
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
        this.mapLandmarks = [,"office",,,,,,,"park",];   // sparse array
        this.consoleQueue = [];
    }
}

class Player {
    constructor({firstname = "Sam", lastname = "Spade", image = "bogart.png", gender = MALE, hitpoints = PLAYER_MAX_HITPOINTS, armorClass=12, weapon = WEAPONS.BankersSpecial, money = 15, muscle = 5, moxie = 5, handEyeCoordination = 5,  suavity = 5, erudition = 5, streetsmarts = 5, faith = 5 } = {}) {
        // name
        this.firstname = firstname;
        this.lastname = lastname;
        // image, gender
        this.image = image;
        this.gender = gender;
        // stats
        this.hitpoints = hitpoints;
        this.armorClass = armorClass;
        // weapon
        this.setWeapon(weapon);
        // money
        this.money = money;
        // attributes / abilities
        this.muscle = muscle;                // strength feats and hand to hand combat
        this.moxie = moxie;                 // constitution
        this.handEyeCoordination = handEyeCoordination;   // shooting and knife skills, lock picking
        this.suavity = suavity;               // how convincing you are
        this.erudition = erudition;             // book knowledge
        this.streetsmarts = streetsmarts;          // street knowledge
        this.faith = faith;

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

const PLAYER_SAM_SPADE = new Player();
const PLAYER_CARRIE_CASHIN = new Player({firstname: "Carrie", lastname: "Cashin", image: "bacall.png"});

class Enemy {
    constructor({name = "Enemy", hitpoints = 10, attackNumDice= 1, attackCap = 6, armorClass = 8, weapon = WEAPONS.BankersSpecial, bold = 5} = {}) {
        this.name = name;
        this.armorClass = armorClass;
        this.hitpoints = hitpoints;
        this.maxHitpoints = hitpoints;
        this.setWeapon(weapon);
        this.bold = bold;
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

function startGame(aPlayer) {
    var player = aPlayer;
    if (aPlayer === undefined) {
        player = new Player();
    }
    game = new Game(player);
    character_image.innerHTML = `<img src="./img/${game.player.image}" width="50%"> <br>`;
    character_name.innerHTML = game.player.firstname + " " + game.player.lastname;
    start_screen.hidden = true;
    main_screen.hidden = false;
    playMusic();
    displayCard(cards.start);
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

function renderMapLandmark(index) {
    var landmark_name = game.mapLandmarks[index];
    var landmark = landmarks[landmark_name];
    if (typeof landmark == 'undefined') {
        return '<td width="10%" align="center"> <img src="./img/empty-image.png" width="80%" /> </td>';
    } else {
        return '<td width="10%" align="center"> <div data-title="' + landmark.description + '"> <img src="./img/'+ landmark.thumbnail + '" width="50%" onClick="travelTo(\'' + landmark.targetCard + '\')"/> </div> </td> ';
    }
}

async function travelTo(targetCard) {
    hideMapWindow();
    displayCard(cards[targetCard]);
}

function showMapWindow() {
    var table_body = "";
    // render upper row
    table_body += '<tr>';
    for (i=0; i<5; i++) {
        table_body += renderMapLandmark(i);
    }
    table_body += '</tr>';
    // render bottom row
    table_body += '<tr>';
    for (i=5; i<10; i++) {
        table_body += renderMapLandmark(i);
    }
    table_body += '</tr>';
    map_table.innerHTML = table_body;

    map_window.hidden = false;

    playAudio("./audio/car-start.wav", SOUND_GAIN_MEDIUM);
}

function hideMapWindow() {
    map_window.hidden = true;
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

function showCharacterBuilderWindow() {
    editCharacterAbilities(character_builder_abilities);
    var male_checked = "checked";
    var female_checked = "";
    if (game.player.gender == FEMALE) {
        female_checked = "checked";
        male_checked = "";
    }
    character_builder_gender.innerHTML = 
        `<input type="radio" id="radio-male" name="gender" value="male" class='game-button' ${male_checked} onClick="swapGender();">
        <label for="radio-male">Male</label> <br>
        <input type="radio" id="radio-female" name="gender" value="female" class='game-button' ${female_checked} onClick="swapGender();">
        <label for="radio-female">Female</label>`;
    if (game.player.gender == FEMALE) {
        character_builder_image.innerHTML = `<img src="img/bacall.png" width="104">`;
    } else {
        character_builder_image.innerHTML = `<img src="img/bogart.png" width="104">`;
    }
    character_builder_window.hidden = false;
}

function hideCharacterBuilderWindow() {
    character_builder_window.hidden = true;
}

function swapGender() {
    if (game.player.gender == MALE) {
        game.player.gender = FEMALE;
    } else {
        game.player.gender = MALE;
    }
    showCharacterBuilderWindow();   // refresh
}

function createCharacter() {
    const firstname = document.getElementById('character-builder-firstname').value;
    const lastname = document.getElementById('character-builder-lastname').value;
    var imageName = "bogart.png";
    if (game.player.gender == FEMALE) {
        imageName = "bacall.png";
    }
    hideCharacterBuilderWindow();
    startGame(new Player({firstname: firstname, lastname: lastname, image: imageName, gender: game.player.gender, muscle: game.player.muscle, moxie: game.player.moxie, handEyeCoordination: game.player.handEyeCoordination, suavity: game.player.suavity, erudition: game.player.erudition, streetsmarts: game.player.streetsmarts, faith: game.player.faith }));
}

function editCharacterAbilities(pane) {   
    pane.innerHTML = "";
    pane.innerHTML += "<tr><td colspan=4 style='text-align: center;'><span> (points to distribute: " + game.player.remainingPoints() + ")</span></td></tr>";
    pane.innerHTML += "<tr><td><span data-title='Affects strength feats and hand to hand combat.'>Muscle               : </span></td><td><button class='game-button' onClick='decreaseAbility(\"muscle\");'>-</button> <span>" + game.player.muscle + "</span> <button class='game-button' onClick='increaseAbility(\"muscle\");'>+</button></td></tr>";
    pane.innerHTML += "<tr><td><span data-title='How much abuse you can suffer before giving up the ghost. Also affects how well you hold your liquor.'>Moxie                : </span></td><td><button class='game-button' onClick='decreaseAbility(\"moxie\");'>-</button> <span>" + game.player.moxie + "</span> <button class='game-button' onClick='increaseAbility(\"moxie\");'>+</button></td></tr>";
    pane.innerHTML += "<tr><td><span data-title='Influences shooting and blade skills, as well as lock picking and sleight of hand.'>Hand-eye coordination : </span></td><td><button class='game-button' onClick='decreaseAbility(\"handEyeCoordination\");'>-</button> <span>" + game.player.handEyeCoordination + "</span> <button class='game-button' onClick='increaseAbility(\"handEyeCoordination\");'>+</button></td></tr>";
    pane.innerHTML += "<tr><td><span data-title='How good you are in talking people into giving you what you want.'>Suavity              : </span></td><td><button class='game-button' onClick='decreaseAbility(\"suavity\");'>-</button> <span>" + game.player.suavity + "</span> <button class='game-button' onClick='increaseAbility(\"suavity\");'>+</button></td></tr>";
    pane.innerHTML += "<tr><td><span data-title='The kind of knowledge you only find in books.'>Erudition            : </span></td><td><button class='game-button' onClick='decreaseAbility(\"erudition\");'>-</button> <span>" + game.player.erudition + "</span> <button class='game-button' onClick='increaseAbility(\"erudition\");'>+</button></td></tr>";
    pane.innerHTML += "<tr><td><span data-title='The kind of knowledge you cannot find in any book.'>Street smarts        : </span></td><td><button class='game-button' onClick='decreaseAbility(\"streetsmarts\");'>-</button> <span>" + game.player.streetsmarts + "</span> <button class='game-button' onClick='increaseAbility(\"streetsmarts\");'>+</button></td></tr>";
    pane.innerHTML += "<tr><td><span data-title=\"How much you gamble in Pascal's Wager.\">Faith        : </span></td><td><button class='game-button' onClick='decreaseAbility(\"faith\");'>-</button> <span>" + game.player.faith + "</span> <button class='game-button' onClick='increaseAbility(\"faith\");'>+</button></td></tr>";
}

function increaseAbility(ability) {
    if (game.player.remainingPoints() > 0 && game.player[ability] < MAX_TRAIT_VALUE) {
        game.player[ability] += 1;
    }
    editCharacterAbilities(character_builder_abilities);
}

function decreaseAbility(ability) {
    if (game.player[ability] > 0) {
        game.player[ability] -= 1;
    }
    editCharacterAbilities(character_builder_abilities);
}

function displayCharacterAbilities(pane) {   
    pane.innerHTML = "";
    pane.innerHTML += "<tr><td><span data-title='Affects strength feats and hand to hand combat.'>Muscle               : </span></td><td><span>" + game.player.muscle + "</span></td></tr>";
    pane.innerHTML += "<tr><td><span data-title='How much abuse you can suffer before giving up the ghost. Also affects how well you hold your liquor.'>Moxie                : </span></td><td><span>" + game.player.moxie + "</span></td></tr>";
    pane.innerHTML += "<tr><td><span data-title='Influences shooting and blade skills, as well as lock picking and sleight of hand.'>Hand-eye coordination: </span></td><td><span>" + game.player.handEyeCoordination + "</span></td></tr>";
    pane.innerHTML += "<tr><td><span data-title='How good you are in talking people into giving you what you want.'>Suavity              : </span></td><td><span>" + game.player.suavity + "</span></td></tr>";
    pane.innerHTML += "<tr><td><span data-title='The kind of knowledge you only find in books.'>Erudition            : </span></td><td><span>" + game.player.erudition + "</span></td></tr>";
    pane.innerHTML += "<tr><td><span data-title='The kind of knowledge you cannot find in any book.'>Street smarts        : </span></td><td><span>" + game.player.streetsmarts + "</span></td></tr>";
    pane.innerHTML += "<tr><td><span data-title=\"How much you gamble in Pascal's Wager.\">Faith        : </span></td><td><span>" + game.player.faith + "</span></td></tr>";
    pane.innerHTML += `<tr><td colspan=2><center><div class="slidecontainer"><span data-title='Cautious characters are better at evading danger.'>Cautious</span> <input type="range" min="0" max="10" value="${game.player.bold}" class="slider" id="myRange" disabled> <span data-title='Bold characters deal more damage.'>Bold</span></div></center></td>`;
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
    clearConsole();
    displayImage(card);
    updateHealthBar(game.player);
    flushConsoleQueue();
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
        options_pane.innerHTML += "<span onClick='chooseOption(cards." + card.name + ".options[" + index + "])' class=\"user-option\">&nbsp;&nbsp;" + option.displayText + "</span>"
        if (option.label !== undefined) options_pane.innerHTML += "&nbsp; <span class=\"user-option-label\">[" + option.label + "]</span>";
        options_pane.innerHTML += " <br>"
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

function checkForOppositeTrait(trait, amount, increase) {
    if (trait == 'cautious') {
        if (increase) { decreaseTraitValue('bold', amount) }
        else { increaseTraitValue('bold', amount) }
    }
    else if (trait == 'bold') {
        if (increase) { decreaseTraitValue('cautious', amount); }
        else { increaseTraitValue('cautious', amount) }
    }
}

function increaseTrait(trait, amount) {
    if (game.player[trait] === undefined) {
        console.log('Error: trait [' + trait + '] is undefined.');
    } else {
        increaseTraitValue(trait, amount);
        checkForOppositeTrait(trait, amount, true);
    }
}

function increaseTraitValue(trait, amount) {
    if ((game.player[trait] + amount) <= MAX_TRAIT_VALUE) {
        game.player[trait] += amount;
        queueConsoleMessage("+" + amount + " " + trait);
    }
}

function decreaseTrait(trait, amount) {
    if (game.player[trait] === undefined) {
        console.log('Error: trait [' + trait + '] is undefined.');
    } else {
        decreaseTraitValue(trait);
        checkForOppositeTrait(trait, amount, false);
    }
}

function decreaseTraitValue(trait, amount) {
    if ((game.player[trait] - amount) > 0) {
        game.player[trait] -= amount;
        queueConsoleMessage("-" + amount + " " + trait);
    }
}

function writeConsole(message) {
    console_pane.innerHTML += '<span style="color:red">' + message + '</span><br>';
}

function clearConsole() {    
    console_pane.innerHTML = "";
}

function queueConsoleMessage(message) {
    game.consoleQueue.push(message);
}

function flushConsoleQueue() {
    while (game.consoleQueue.length > 0) {
        var message = game.consoleQueue.shift();
        writeConsole(message);
    }
}

function combat({ playerAttacksFirst = true, playerWeapon = WEAPONS.Fists} = {}) {
    //clearConsole();

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
            queueConsoleMessage("I punch " + game.currentEnemy.fullname() + " square in the chin.");
            playAudio('./audio/punch-boxing.wav', SOUND_GAIN_FULL);
        } else {
            queueConsoleMessage("I aim true and squeeze the trigger of my " + game.player.weapon.name + ".");
            playAudio('./audio/single-shot.wav', SOUND_GAIN_FULL);
        }
        queueConsoleMessage("I deal " + damage + " damage points to " + game.currentEnemy.fullname() + ".");
        queueConsoleMessage(game.currentEnemy.fullname() + " has now " + game.currentEnemy.hitpoints + " hitpoint(s) ("+ game.currentEnemy.healthPercentage()  + "% health).");
    } else {
        if (playerWeapon === WEAPONS.Fists) {
            queueConsoleMessage("I unleash my fist in a vicious uppercut, but the bastard shuffles and dodges it.");
        } else {
            queueConsoleMessage("I pump metal with my " + game.player.weapon.name + ", but the recoil makes me miss the shot.");
            playAudio('./audio/single-shot.wav', SOUND_GAIN_FULL);
        }
    }
    if (game.currentEnemy.hitpoints > 0) {  // dead enemies cause no damage
        writeConsole('');   // empty line
        if (enemyHitsPlayer) {
            const damage = damageRoll(game.currentEnemy, game.player, game.currentEnemy.weapon);
            queueConsoleMessage(game.currentEnemy.fullname() + " shoots at me.");
            queueConsoleMessage("I take " + damage + " damage points.");
            queueConsoleMessage("I have now " + game.player.hitpoints + " hitpoint(s) ("+ game.player.healthPercentage()  + "% health).");
        } else {
            queueConsoleMessage(game.currentEnemy.fullname() + " throws lead at me, but the palooka misses it.");
            playAudio('./audio/bullet-flyby.wav', SOUND_GAIN_FULL);
        }
    } else {
        queueConsoleMessage("You've sent " + game.currentEnemy.fullname() + " to the big sleep.");
        playAudio('./audio/male-death.mp3', SOUND_GAIN_FULL);
    }

}

// determines if an attack hits or misses
// returns a boolean (true = hit)
function attackRoll(attacker, target, weapon) {
    var hit = false;
    var roll = 0;
    for (n=0; n<weapon.attackNumDice; n++) {
        roll += rollDice(weapon.attackCap);
    }

    // PLAYER ATTACK MODIFIERS
    if (attacker instanceof Player) {
        // players roll up to +1 hp per handEyeCoordination point when shooting
        if (weapon !== WEAPONS.Fists) {
            const sharpshoot = rollDice(Math.floor(attacker.handEyeCoordination));
            roll += sharpshoot;
            queueConsoleMessage(attacker.fullname() + " receives " + sharpshoot + " extra attack roll points for hand-eye coordination");
        }
    }

    if (roll < target.armorClass) {
        hit = true;
    }
    return hit;
}

// determines the attack damage
// returns an integer between 1 and max weapon damage
function damageRoll(attacker, target, weapon) {
    roll = 0;
    for (n=0; n<weapon.attackNumDice; n++) {
        roll += rollDice(weapon.attackCap);
    }
    
    // PLAYER ATTACK MODIFIERS
    if (attacker instanceof Player) {
        // bold players get a bonus up to +5 hp, cautious characters get a penalty up to 4 hp
        const boldness = Math.ceil(attacker.bold - 5);
        queueConsoleMessage(attacker.fullname()  + " receives " + boldness + " hit points for boldness");
        roll += boldness;   

        // players roll up to +1 hp per muscle point in hand to hand combat
        if (weapon === WEAPONS.Fists) {
            const muscle = rollDice(Math.floor(attacker.muscle));
            roll += muscle;
            queueConsoleMessage(attacker.fullname() + " receives " + muscle + " hit points for muscle");
        }
    }

    if (roll <= 0) roll = 1;    // damage is at least 1 
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
