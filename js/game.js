const start_screen = document.getElementById("start-screen"); 
const main_screen = document.getElementById("main-screen");

const sentences1 = ['Rains fall over Triste-le-Roy.', "God knows this shithole needs a wash. But the gale doesn't clean the streets.",
"p", 'On the contrary.',
"p", 'Sometimes it flushes the vermin out.',
"p", "I'm happy to be off the streets. Still, I could use the money...",
"p", "My office was damp and musty, but at least indoors I wouldn't catch lead poisoning.",
"p", "My stomach rumbles.", "I light a cigarette, and watch the smoke dance towards the ceiling.",
"p", "Then someone knocks on the door.", "play_sound: ./audio/door-knock.mp3"];

function startGame() {
    start_screen.hidden = true;
    main_screen.hidden = false;
    playMusic();
    displaySentences(sentences1);
}

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

const text = document.getElementById("text"); 

async function displaySentences(sentences) {
    for (var i=0; i < sentences.length; i++) {
        const sentence = sentences[i];
        if (sentence === "p") {
            text.innerHTML += "<br>";
        } else if (sentence.startsWith("play_sound: ")) {
            var splitCommand = sentence.split(/\s/);
            playAudio(splitCommand[1], SOUND_GAIN_FULL);
        } else {
            text.innerHTML += '<span id="sentence' + i + '" style="opacity: 0">' + sentence + ' </div>';
            await fadeIn("sentence" + i);
        }
        await sleep(1000);
    }
}

// utility functions

function fadeIn(id) {
    var fade = document.getElementById(id);
    var opacity = 0;
    var intervalID = setInterval(function() {
        if (opacity < 1) {
            opacity = opacity + 0.1
            fade.style.opacity = opacity;
        } else {
            fade.style.opacity = 1;
            console.log("id: " + id + ", opacity: " + fade.style.opacity);
            clearInterval(intervalID);
        }
    }, 80);
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}
