# Noir, a game
A text-oriented game in JavaScript.

## Starting the game

```
> http_server
```

## Game design

### Mechanics

- [X] Text and dialogue-based. The story is narrated mostly via text (with auxiliary images and sounds, no animations). The player advances through the story by choosing how the character reacts to situations.
- [X] RPG elements. Your character has abilities and stats points, and those influence what you can/cannot do. In-story choices have consequences for your character build.
- [X] Inventory. The character has an inventory with the objects collected so far. Objects enable story choices. Inventory is kept simple, objects cannot be combined.
- [X] Combat. The character faces hostile NPCs and can either fight or evade them (with multiple weapons/abilities).
- [X] Map Navigation. The story takes place in multiple locations of the fictional city of Triste-le-Roy, and the player can navigate among them using a map.
- [ ] Save/restore. The player can save the game and resume from a previous point.
- [X] PC-oriented. The game is meant to be played on a PC computer (desktop, laptop). If it can also run on a mobile device that's fine, but not a hard requirement.

### Theme and prose

- The game is inspired by hardboiled detective fiction, and follows the tropes of the genre.
- Sentences are short and direct, and use present tense.
- Slang is heavily used. See [reference1](https://www.miskatonic.org/slang.html), [reference2](http://www.classiccrimefiction.com/hardboiled-slang.htm), [reference3](https://atleb.tripod.com/ordbok/hardboiled_slang.htm).
- Guns used in hardboiled fiction: (http://raymondchandlercrimeglossary.blogspot.com/p/the-guns-of-raymond-chandler.html)

### Reference material

- https://thrillingdetective.com/2020/12/03/dangerous-dames/

### Story

I will not detail the story in order to prevent spoilers. The below list helps me keep track of the major parts that need to be done.

- [ ] Chapter 1: The job
- [ ] Chapter 2: City Park
- [ ] Chapter 3: The 3rd Talmudian Conference
- [ ] Chapter 4: The Blind Dutchman
- [ ] Chapter 5: Summoned by the Police

### Tech Debt
- [ ] Automate testing
- [ ] Music & sound controls
- [ ] Incorporate combat fully in the main narrative panel (so case file isn't messed up)
- [ ] Make it possible to flee from combat
- [X] Combat takes character stats into account
- [ ] Handguns need reloading
- [ ] Implement Notebook functionality

### Resources

The following free art resources have been used in making the game. We thank the artists who shared their work, and make proper attribution here.

#### Audio clips

- Rain sound - https://freesound.org/people/EduFigueres/sounds/539332/
- Door knock - https://freesound.org/people/SubwaySandwitch420/sounds/540770/
- Heels - https://freesound.org/people/pollyschambers/sounds/428982/
- Footsteps on wood - https://freesound.org/people/Fewes/sounds/234263/
- Single shot - https://freesound.org/people/johnyridgeback/sounds/567272/
- Punch Argh! - https://freesound.org/people/CastIronCarousel/sounds/216781/
- Punch Boxing - https://freesound.org/people/newagesoup/sounds/348242/
- Male Death - https://freesound.org/people/HighPixel/sounds/554443/
- Heartbeat - https://freesound.org/people/JasperL91/sounds/369821/
- Bullet flyby - https://freesound.org/people/kMoon/sounds/90784/
- Car start - https://freesound.org/people/tatianafeudal/sounds/511677/

#### Fonts

- Advanced Pixel 7: https://www.1001freefonts.com/advanced-pixel-7.font
- Homemade Apple: https://www.1001freefonts.com/homemade-apple.font
- Mom's Typewriter: https://www.1001freefonts.com/moms-typewriter.font

#### Images

- Most images were generated using DALL-E or Midjourney.
- Some images were pixelated using (https://onlineimagetools.com/pixelate-image)

The game and its assets are, unless otherwise indicated, copyright of Taciano Dreckmann Perez (C) 2023.