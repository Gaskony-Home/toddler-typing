/**
 * DinoPhrases - Comprehensive phrase library for the dinosaur voice personality
 *
 * All phrases written in a slow, friendly drawl style with elongated vowels,
 * ellipses for pauses, and warm exclamations.
 *
 * Template variables: {target}, {color}, {shape}, {word}, {char}, {sound}, {example}
 */

(function () {
  'use strict';

  const phrases = {
    greeting: [
      "Heey there, little one.. welcome back!",
      "Weeell hello, my favorite typist!",
      "Hiii buddy.. ready to have some fuun?",
      "Ohhh look who's here.. let's plaay!",
      "Heey friend.. I missed you!"
    ],

    instruction: {
      letter: [
        "Can you fiiind the letter {target} for me?",
        "Ohhh.. press the letter {target}!",
        "I seeee.. it's the letter {target}.. go ahead!",
        "Heeey.. try pressing {target} on the keyboard!",
        "Looook.. it's {target}.. give it a tap!"
      ],
      number: [
        "Can you fiiind the number {target}?",
        "Ohhh.. press the number {target}!",
        "Looook.. it's the number {target}.. you got this!",
        "Heeey.. where's number {target}?",
        "I seeee number {target}.. press it!"
      ],
      word: [
        "Let's spell the word {target}.. one letter at a time!",
        "Ohhh.. can you type {target} for me?",
        "Tiiime to spell {target}.. ready?",
        "Looook.. the word is {target}.. let's gooo!",
        "Heeey.. spell out {target}!"
      ]
    },

    correct_first_try: [
      "Wooow.. you got it first try! Amaazing!",
      "Ohhh yeees! Perfect, little one!",
      "Riiight on! You're sooo smart!",
      "Fantaaastic! First try, wooow!",
      "Yeeees! That's exactly right!",
      "Wooonderful! You nailed it!"
    ],

    correct_after_hints: [
      "Theere you go.. great job!",
      "Yaaay.. you figured it out!",
      "Niiice work.. I knew you could do it!",
      "Goood job, buddy.. you got it!"
    ],

    wrong_key: [
      "Hmmmm.. not quite.. try again!",
      "Ohhh.. close! Look for the glowing key!",
      "Almoost.. give it another try!",
      "Nooope.. but you're doing great.. try again!",
      "Hmmm.. that's not it.. keep looking!"
    ],

    encouragement: [
      "You're doing sooo well!",
      "Keeeep going, little one!",
      "I belieeeve in you!",
      "Sooo proud of you!",
      "You're amaazing at this!"
    ],

    streak: {
      3: [
        "Threee in a row.. you're on fiire!",
        "Wooow.. three right! Keep it up!",
        "Ohhh.. a three streak! Amaazing!"
      ],
      5: [
        "Fiiive in a row! Increeedible!",
        "Wooow wooow wooow.. five streak!",
        "Fiive right! You're a superstaaar!"
      ],
      10: [
        "Teeen in a row! Unbelieeevable!",
        "TEN! You are a typing chaaampion!",
        "Wooooow.. ten streak! I'm sooo proud!"
      ]
    },

    level_up: [
      "LEVEL UP! Wooow.. you're getting sooo good!",
      "Amaazing.. you reached a new level!",
      "Ohhh my.. LEVEL UP! You're a superstaaar!",
      "Wooow.. new level unlocked! You're increeedible!",
      "Level up, buddy! You're on fiiiire!"
    ],

    star_earned: [
      "Ohhh.. a gold star for you!",
      "Yaaay.. you earned a star!",
      "Looook.. another shiny star!",
      "Woooow.. a star! You're amaazing!",
      "Sparkle sparkle.. a new star!"
    ],

    new_stage: {
      numbers: [
        "Wooow.. you unlocked NUMBERS! Let's count!",
        "Amaazing.. now you can type numbers tooo!",
        "Ohhh.. numbers are ready for you!"
      ],
      words: [
        "Increeedible.. you unlocked WORDS! Sooo exciting!",
        "Wooow.. time to spell real words now!",
        "Ohhh my.. WORDS mode unlocked! Let's gooo!"
      ]
    },

    dino_click: [
      "Heeey.. you tapped me! That tickles!",
      "Rooooar! Just kidding.. hehe!",
      "Ohhh.. hi there, friend!",
      "Did you know.. dinosaurs looved to learn tooo?",
      "Weeee! You found me!",
      "I looove hanging out with you!",
      "Heeey buddy.. let's keep playing!",
      "Ohhh.. you're sooo friendly!",
      "Raawr.. that means I love you in dinosaur!",
      "Heeheehee.. do that again!",
      "You're my faaavorite human!",
      "Ohhh.. I was just thinking about you!",
      "Boop! You booped my nose!",
      "Wooow.. you're really good at tapping!"
    ],

    activity_welcome: {
      letters_numbers: [
        "Ohhh.. let's learn some letters and numbers! Press the key you see on the screen!",
        "Weeelcome to letters and numbers! Look at the big letter.. then fiiind it on the keyboard!",
        "Heeey.. time to practice! I'll show you a letter or number.. you press it!"
      ],
      typing_game: [
        "Ohhh.. typing time! Press the key that matches what you see!",
        "Weeelcome to the typing game! Start with letters.. then unlock numbers and words!",
        "Heeey.. let's type! Look at the screen and press the matching key!"
      ],
      drawing: [
        "Ohhh.. free drawing time! Pick a color and draaaw anything you like!",
        "Weeelcome to drawing! Use your finger or mouse to make something beautiful!",
        "Heeey artist.. the canvas is all yours! Pick colors and go craaazy!"
      ],
      colors_shapes: [
        "Ohhh.. colors and shapes! Click on the shape I ask for!",
        "Weeelcome! I'll ask for a color and shape.. you fiiind it and tap it!",
        "Heeey.. let's learn shapes! Listen to what I say.. then click the right one!"
      ],
      coloring: [
        "Ohhh.. coloring time! Pick a color and fill in the picture!",
        "Weeelcome to coloring! Choose your favorite colors and make it pretty!",
        "Heeey.. let's color! Pick a color below.. then tap inside the picture!"
      ],
      dot2dot: [
        "Ohhh.. dot to dot! Connect the dots to make a picture.. then color it in!",
        "Weeelcome! Follow the numbers and connect the dots in order!",
        "Heeey.. let's connect dots! Tap each dot in the right order!"
      ],
      sounds: [
        "Ohhh.. letter sounds! Listen to the sound.. then pick the right word!",
        "Weeelcome to the sound quiz! Can you fiiind the word with the right sound?",
        "Heeey.. time for sounds! Listen carefully and choose the right answer!"
      ],
      memory_game: [
        "Ohhh.. memory time! Flip two cards and try to fiiind the matching pairs!",
        "Weeelcome to the memory game! Remember where the cards are!",
        "Heeey.. let's test your memory! Tap two cards to see if they match!"
      ],
      jigsaw: [
        "Ohhh.. puzzle time! Tap a piece.. then tap where it goes!",
        "Weeelcome to jigsaw puzzles! Put the pieces in the right spots!",
        "Heeey.. let's solve a puzzle! Pick a piece and fiiind where it belongs!"
      ],
      sorting: [
        "Ohhh.. sorting time! Put each item in the right basket!",
        "Weeelcome to sorting! Look at the item.. then tap the right group!",
        "Heeey.. let's sort things! Which basket does it belong in?"
      ],
      trophy_room: [
        "Wooow.. look at all your trophies! You've been sooo busy!",
        "Ohhh.. your trophy room! Sooo many amazing rewards!",
        "Heeey.. let's see what you've earned! Increeedible collection!"
      ]
    },

    menu_welcome: [
      "Weeelcome back! Pick an activity.. any activity!",
      "Heeey.. choose what you wanna play!",
      "Ohhh.. so many fun things to do! Pick one!",
      "Hiii again! What shall we learn today?"
    ],

    idle_nudge: [
      "Heeey.. are you still there, buddy?",
      "I'm waaiting for you.. press a key!",
      "Hellooo.. the keyboard misses you!",
      "Don't be shyyy.. give it a try!"
    ],

    farewell: [
      "Byeee.. see you next time, little one!",
      "Greaat job today.. come back sooon!",
      "Waaaving goodbye.. you did amaazing!",
      "Seee you later, superstaaar!",
      "Byeee buddy.. that was sooo much fun!"
    ],

    word_complete: [
      "Yooou spelled the whole word! Wooow!",
      "Amaazing.. the word is done!",
      "Ohhh.. you finished it! Sooo good!"
    ],

    hint: [
      "Looook for the glowing key.. it's right there!",
      "Heeey.. the bright key is the one you need!",
      "See that glowing button? Taaap it!"
    ],

    colors_shapes: {
      instruction: [
        "Can you fiiind the {color} {shape}?",
        "Ohhh.. where's the {color} {shape}?",
        "Looook for the {color} {shape}.. tap it!",
        "Heeey.. click the {color} {shape}!",
        "I seeee a {color} {shape}.. can you find it?"
      ],
      correct: [
        "Yaaay.. that's the right one!",
        "Peerfect! You found it!",
        "Wooow.. you know your shapes!",
        "Greaat job! That's exactly right!"
      ],
      wrong: [
        "Hmmmm.. not that one.. try again!",
        "Ohhh.. close! Look more carefully!",
        "Almoost.. that's not the right one!",
        "Noope.. keep looking, buddy!"
      ]
    },

    sounds: {
      welcome: [
        "Heey.. let's learn some letter sounds!",
        "Ohhh.. time to explore sounds togeether!",
        "Weeelcome to sounds! Let's liisten!"
      ],
      instruction: [
        "Liisten.. this is the {sound} sound!",
        "Heear that? It's {sound}.. like in {example}!",
        "The sound {sound}.. can you say it?"
      ]
    },

    sorting: {
      item_appear: [
        "Ohhh.. it's a {target}! Where does it belong?",
        "Looook.. a {target}! Which basket?",
        "Heeey.. I see a {target}! Tap the right group!",
        "A {target}! Can you sort it?"
      ],
      correct: [
        "Yaaay.. right basket! You're sooo smart!",
        "Peerfect sorting! That's where it goes!",
        "Wooow.. you know exactly where it belongs!",
        "Greaat job! That's the right one!"
      ],
      wrong: [
        "Hmmmm.. not that basket.. try the other one!",
        "Ohhh.. almost! Try the other group!",
        "Noope.. that doesn't go there.. try again!",
        "Not quite.. look at the baskets again!"
      ],
      round_complete: [
        "Wooow.. you sorted them all! Amaazing job!",
        "Alll done! Every item in the right basket!",
        "Increeedible sorting! Let's do another round!"
      ]
    },

    memory: {
      start: [
        "Flip two cards and fiiind the matching pairs!",
        "Remember where the pictures are.. match them up!",
        "Tap a card to flip it.. then fiiind its twin!"
      ],
      match_found: [
        "Yaaay.. you found a match! Great memory!",
        "Wooow.. they match! You remembered!",
        "Peerfect pair! Sooo clever!",
        "Greaat match! Keep going!"
      ],
      no_match: [
        "Hmmmm.. those don't match.. try to remember them!",
        "Ohhh.. not a pair.. but now you know where they are!",
        "Not a match.. keep looking, you'll get it!"
      ],
      all_matched: [
        "Wooow.. you found ALL the pairs! Amaazing!",
        "Increeedible memory! Every pair matched!",
        "You did it.. all pairs found! Superstaaar!"
      ]
    },

    jigsaw: {
      start: [
        "Put the puzzle pieces in the right spots!",
        "Tap a piece.. then tap where it goes on the board!",
        "Let's build this picture.. one piece at a time!"
      ],
      piece_placed: [
        "Peerfect fit! That piece is in the right spot!",
        "Yaaay.. it fits! Great job!",
        "Wooow.. right where it belongs!",
        "Niiice one! That piece is placed!"
      ],
      wrong_spot: [
        "Hmmmm.. that piece doesn't go there!",
        "Ohhh.. try a different spot!",
        "Not quite.. that's not where it fits!"
      ],
      complete: [
        "Wooow.. the puzzle is complete! Beautiful picture!",
        "You did it.. every piece in place! Amaazing!",
        "Peerfect puzzle! You're a puzzle master!"
      ]
    },

    drawing: {
      encouragement: [
        "Wooow.. what a beautiful drawing!",
        "Ohhh.. I love those colors!",
        "Keeeep going.. you're an artist!",
        "Sooo creative! I love it!"
      ],
      saved: [
        "Amaazing! Your drawing is saved!",
        "Wooow.. that's a masterpiece! Saved!",
        "Greaat job.. picture saved!",
        "Looook at what you made! Saved!"
      ],
      clear: [
        "Ohhh.. a fresh canvas! What will you draw?",
        "Clean slate! Time for something new!",
        "Alll clear.. let your imagination go!",
        "Heeey.. a new page to create on!"
      ]
    },

    coloring: {
      image_change: [
        "Ohhh.. let's color the {target}!",
        "Looook.. it's a {target}! Pick your colors!",
        "Heeey.. time to color the {target}!",
        "A {target}! What colors will you use?"
      ],
      saved: [
        "Amaazing coloring! Picture saved!",
        "Wooow.. sooo pretty! Saved!",
        "Greaat job coloring! Saved!",
        "Looook how beautiful! Saved!"
      ],
      clear: [
        "Ohhh.. let's start fresh on this one!",
        "Clean canvas.. color it again!",
        "Starting over.. you can do it different this time!"
      ],
      encouragement: [
        "Wooow.. such pretty colors!",
        "Ohhh.. that looks sooo beautiful!",
        "Keeeep coloring.. you're an artist!",
        "Sooo creative! I love the colors you picked!"
      ]
    },

    dot2dot: {
      image_change: [
        "Ohhh.. let's connect the dots for a {target}!",
        "Looook.. a {target} is hiding in the dots!",
        "Heeey.. connect the dots to make a {target}!",
        "A {target}! Follow the numbers!"
      ],
      saved: [
        "Amaazing! Your dot to dot is saved!",
        "Wooow.. great connecting! Saved!",
        "Looook what you made! Saved!",
        "Peerfect! Picture saved!"
      ],
      clear: [
        "Ohhh.. fresh dots! Connect them again!",
        "Clean start! Follow the numbers!",
        "Alll clear.. let's try again!"
      ],
      encouragement: [
        "Wooow.. great connecting!",
        "Ohhh.. you're following those dots sooo well!",
        "Keeeep going.. it's looking amaazing!",
        "Sooo good! The picture is coming together!"
      ]
    },

    letters_numbers: {
      instruction_letter: [
        "Fiiind the letter {target} and press it!",
        "Ohhh.. it's letter {target}.. go ahead!",
        "Looook.. press {target} on the keyboard!",
        "Heeey.. where is the letter {target}?",
        "I seeee the letter {target}.. tap it!"
      ],
      instruction_number: [
        "Fiiind the number {target} and press it!",
        "Ohhh.. it's number {target}.. go ahead!",
        "Looook.. press {target} on the keyboard!",
        "Heeey.. where is the number {target}?",
        "I seeee the number {target}.. tap it!"
      ]
    }
  };

  /**
   * Get a random phrase from a category/subcategory and fill in template variables.
   * @param {string} category - Top-level category (e.g. 'greeting', 'correct_first_try')
   * @param {string} [subcategory] - Subcategory (e.g. 'letter', '3')
   * @param {Object} [replacements] - Template variable replacements
   * @returns {string} The filled phrase, or empty string if not found
   */
  function DinoPhrase(category, subcategory, replacements) {
    let pool;

    if (subcategory !== undefined && subcategory !== null) {
      pool = phrases[category] && phrases[category][subcategory];
    } else {
      pool = phrases[category];
    }

    if (!pool || !Array.isArray(pool) || pool.length === 0) {
      console.warn(`[DinoPhrases] No phrases for: ${category}/${subcategory}`);
      return '';
    }

    let text = pool[Math.floor(Math.random() * pool.length)];

    if (replacements) {
      for (const [key, value] of Object.entries(replacements)) {
        text = text.replace(new RegExp(`\\{${key}\\}`, 'g'), value);
      }
    }

    return text;
  }

  window.DinoPhrases = phrases;
  window.DinoPhrase = DinoPhrase;
})();
