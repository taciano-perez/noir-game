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

class Game {
    constructor(player) {
        this.player = player;
        this.record = "";
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
        this.muscle = 5;    // strength feats and hand to hand combat
        this.moxie = 5;     // constitution
        this.handEyeCoordination = 5;   // shooting and knife skills, lock picking
        this.suavity = 5;      // how convincing you are
        this.erudition = 5;     // book knowledge
        this.streetsmarts = 5;  // street knowledge

        // traits
        // cautious -- bold
        // law-abiding -- criminal
        // 
    }
}

const cards = {
    start: {
        image: "city-skyline-rain.png",
        story: ["<b>Chapter I</b>",
                    "p", 'Rains fall over Triste-le-Roy.', "God knows this shithole needs a wash. But the gale doesn't clean the streets.",
                    "p", 'On the contrary.',
                    "p", 'Sometimes it flushes the vermin out.',
                    "p", "I'm happy to be off the streets. Still, I could use the money...",
                    "p", "My office was damp and musty, but at least indoors I wouldn't catch lead poisoning.",
                    "p", "My stomach rumbles.", "I light a cigarette, and watch the smoke dance towards the ceiling.",
                    "p", "Then someone knocks on the door.", "play_sound: ./audio/door-knock.mp3"],
        options: [
            ["Open the door.", "start_client_enters"],
            ["Ask who's there.", "start_who_is_there"],
            ["Tell them to go away.", "start_let_me_in"],
            ["Hide behind your desk and stay quiet.", "start_let_me_in"]
        ]
    },
    start_who_is_there: {
        image: "office-door-closed.png",
        story: ["p", "I hear a muffled woman's voice. \"A client. Open the door, please.\""],
        options: [
            ["Open the door.", "start_client_enters"],
            ["Tell her to go away.", "start_let_me_in"],
        ]
    },
    start_let_me_in: {
        image: "office-door-closed.png",
        story: [
            "p", "\"I know you're in there. What kind of detective won't receive a client? Besides...\" Her voice cracks.",
            "p", "\"I need help.\""
        ],
         options: [
            ["Open the door.", "start_client_enters"]
         ]
    },
    start_client_enters: {
        image: "client_enters.png",
        story: [
            "p", "I open the door, and in walks a dame.",
            "p", "Without asking permission, she slides a chair and sits down. Her hose swishes as she crosses her legs.",
            "p", "I sit across her.",
            "p", "\"Detective, I need your help.\""
        ],
         options: [
            ["Go on."]
         ]
    }
}

var game = new Game(new Player());

function startGame() {
    character_name.innerHTML = game.player.firstname + " " + game.player.lastname;
    start_screen.hidden = true;
    main_screen.hidden = false;
    playMusic();
    displayCard(cards.start);
}

function showCharacterWindow() {
    displayCharacterAbilities();
    character_window.hidden = false;
}

function hideCharacterWindow() {
    character_window.hidden = true;
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

function displayCharacterAbilities() {   
    character_abilities.innerHTML = "";
    character_abilities.innerHTML += "<tr><td><span data-title='Affects strength feats and hand to hand combat.'>Muscle               : </span></td>&nbsp;&nbsp;&nbsp;<td><span>" + game.player.muscle + "</span></td></tr>";
    character_abilities.innerHTML += "<tr><td><span data-title='How much abuse you can suffer before giving up the ghost. Also affects how well you hold your liquor.'>Moxie                : </span></td>&nbsp;&nbsp;&nbsp;<td><span>" + game.player.moxie + "</span></td></tr>";
    character_abilities.innerHTML += "<tr><td><span data-title='Influences shooting and blade skills, as well as lock picking and sleight of hand.'>Hand-eye coordination: </span></td>&nbsp;&nbsp;&nbsp;<td><span>" + game.player.handEyeCoordination + "</span></td></tr>";
    character_abilities.innerHTML += "<tr><td><span data-title='How good you are in talking people into giving you what you want.'>Suavity              : </span></td>&nbsp;&nbsp;&nbsp;<td><span>" + game.player.suavity + "</span></td></tr>";
    character_abilities.innerHTML += "<tr><td><span data-title='The kind of knowledge you only find in books.'>Erudition            : </span></td>&nbsp;&nbsp;&nbsp;<td><span>" + game.player.erudition + "</span></td></tr>";
    character_abilities.innerHTML += "<tr><td><span data-title='The kind of knowledge you cannot find in any book.'>Street smarts        : </span></td>&nbsp;&nbsp;&nbsp;<td><span>" + game.player.streetsmarts + "</span></td></tr>";
}

async function displayCard(card) {
    clearStory();
    clearOptions();
    displayImage(card.image);
    await displayStory(card.story);
    displayOptions(card.options);
}

function clearOptions() {
    options_pane.innerHTML = "";
}

function displayOptions(options) {
    options_pane.innerHTML += "<span class='user-option-header'>What should I do?</span> <br>";
    options.forEach((option, index) => {
        options_pane.innerHTML += "<span onClick='displayCard(cards." + option[1] + ")' class=\"user-option\">&nbsp;&nbsp;" + option[0] + "</span> <br>"
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
        await sleep(1000);
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
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}
