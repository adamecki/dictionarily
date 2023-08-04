// required libraries
const filesystem = require('node:fs');
const Writable = require('stream').Writable;
var mutableStdout = new Writable({
    write: function(chunk, encoding, callback) {
        if (!this.muted) {
            process.stdout.write(chunk, encoding);
        }
        callback();
    }
});
const input = require('readline').createInterface({
    input:  process.stdin,
    output: mutableStdout,
    terminal: true
});

// global variables
// word to be guessed
var word_database = [];
let fetched_word = "";
// tries
let tries_left = 15;
// welcome text positioning
var middle_1 = 0;
var middle_2 = 0;
var spaces_1 = "";
var spaces_2 = "";

// welcome text centering script
function center_welcome_text() {
    if (process.stdout.columns % 2 == 0) {
        middle_1 = (process.stdout.columns / 2) - 13;
        middle_2 = (process.stdout.columns / 2) - 26;
    } else {
        middle_1 = (process.stdout.columns / 2) - 13.5;
        middle_2 = (process.stdout.columns / 2) - 26.5;
    }
    
    for (let i = 0; i < middle_1; i++) {
        spaces_1 += " ";
    }
    for (let i = 0; i < middle_2; i++) {
        spaces_2 += " ";
    }
}

// console size check
function check_essentials() {
    if (!filesystem.existsSync('dictionary.json')) {
        console.log('Game cannot start in offline mode without dictionary file.');
        console.log('Make sure there is a file "dictionary.json" in the game directory.');
        process.exit(0);
    } else {
        word_database = require('./dictionary.json');
    }
    if (process.stdout.columns < 88 || process.stdout.rows < 22) {
        console.log('Game cannot start in console window smaller than 88x22 (columns x rows).');
        console.log('Please resize your console window and then run the game again.');
        process.exit(0);
    }
}

// show welcome screen and start game
function start_game() {
    console.log(`${spaces_1}\x1b[95mDictionarily - How to play\x1b[0m`);
    console.log(`${spaces_2}Type in the word to guess it. Hints will help you out.\n`);

    console.log(`Example:          The word is "maintenance"`);
    console.log(`---`);
    console.log(`bear↓           - none of the letters are matching,`);
    console.log(`\x1b[32mma\x1b[0mp↑            - some of the letters are matching,`);
    console.log(`\x1b[32mmain\x1b[0m…           - every letter is matching, but the word is longer,`);
    console.log(`\x1b[32mmaintenance\x1b[0ms←   - every letter is matching, but the word is shorter.`);
    console.log(`↓               - the word is lower in dictionary`);
    console.log(`↑               - the word is higher in dictionary`);

    console.log(`\nNote that \x1b[31monly the first\x1b[0m matching letters are \x1b[32mgreen\x1b[0m.`);

    console.log(`\nExample:          The word is "marching"`);
    console.log(`---`);
    console.log(`\x1b[32mma\x1b[0mtching↑       - only two first letters are green,`);
    console.log(`                  because letter "t" has broken the matching letters "streak".\n`);

    process.stdout.write(`You've got ${tries_left} tries. Press \x1b[34mEnter\x1b[0m to start playing.`);
    input.question('', () => {
        mutableStdout.muted = false;
        get_word();
    });
}

// start script
// prepare console window
console.clear();
mutableStdout.muted = true;
check_essentials();

// prepare gameplay
center_welcome_text();
start_game();

async function get_word() {
    fetched_word = word_database[Math.floor(Math.random() * word_database.length)].toLowerCase();

    console.log('\n\x1b[34mThe game is starting…\x1b[0m');
    setTimeout(() => {
        console.clear();
        console.log('\x1b[95mDictionarily\x1b[0m\n');
        // start awaiting user input
        ask_for_word();
    }, 1000);
}

async function ask_for_word() {
    input.question(`You've got ${tries_left} tries left. Type in your guess: `, answer => {
        check_for_existence(answer);
    });
}

async function check_for_existence(word) {
    if (word_database.includes(word)) {
        compare(word);
    } else {
        console.log('\x1b[31mWord not found. Please try again.\x1b[0m\n');
        ask_for_word();
    }
}

async function compare(word) {
    tries_left--;
    process.stdout.write('Your word: ');

    if (word.length < fetched_word.length || word.length == fetched_word.length) {
        // type matching letters in green
        let typed_green = 0;
        for (let i = 0; i < word.length; i++) {
            if (word.charAt(i).toLowerCase() == fetched_word.charAt(i)) {
                process.stdout.write(`\x1b[32m${word.charAt(i).toLowerCase()}\x1b[0m`);
                typed_green++;
            } else {
                break;
            }
        }

        // type the rest of the letters in white
        for (let i = typed_green; i < word.length; i++) {
            process.stdout.write(word.charAt(i).toLowerCase());
        }

        if (word.length < fetched_word.length && typed_green == word.length) {
            // if the letters match, but the word is longer
            process.stdout.write('…');
        } else {
            if (word.toLowerCase() != fetched_word) {
                // or if not, position it in the dictionary
                let sorted = [word.toLowerCase(), fetched_word].sort();
                if (sorted[0] == word.toLowerCase()) {
                    process.stdout.write('↓');
                }
                if (sorted[0] == fetched_word) {
                    process.stdout.write('↑');
                }
            }
        }

        if (typed_green == fetched_word.length && fetched_word.length == word.length) {
            game_won();
        }
    }

    if (word.length > fetched_word.length) {
        // type matching letters in green
        let typed_green = 0;
        for (let i = 0; i < word.length; i++) {
            if (i < fetched_word.length) {
                if (word.charAt(i).toLowerCase() == fetched_word.charAt(i)) {
                    process.stdout.write(`\x1b[32m${word.charAt(i).toLowerCase()}\x1b[0m`);
                    typed_green++;
                } else {
                    break;
                }
            }
        }

        // type the rest of the letters in white
        for (let i = typed_green; i < word.length; i++) {
            process.stdout.write(word.charAt(i).toLowerCase());
        }

        if (typed_green == fetched_word.length) {
            // if the letters match, but the word is shorter
            process.stdout.write('←');
        } else {
            // or if not, position it in the dictionary
            let sorted = [word.toLowerCase(), fetched_word].sort();
            if (sorted[0] == word.toLowerCase()) {
                process.stdout.write('↓');
            }
            if (sorted[0] == fetched_word) {
                process.stdout.write('↑');
            }
        }
    }

    process.stdout.write(`\n\n`);
    if (tries_left == 0) {
        game_lost();
    } else {
        ask_for_word();
    }
}

function game_won() {
    console.log(`\x1b[95m\n\nYou've guessed the word! Congratulations!\x1b[0m`);
    console.log(`The word was \x1b[32m${fetched_word}\x1b[0m.`);
    console.log(`It took you ${15 - tries_left} tries.`);
    
    console.log('\nTo play again, restart the app.');
    console.log(`Game by \x1b[34mAdamecki\x1b[0m`);
    process.exit(0);
}

function game_lost() {
    console.log('\x1b[31mUnfortunately, you lost!\x1b[0m');
    console.log(`The word was \x1b[31m${fetched_word}\x1b[0m.`);
    
    console.log('\nTo play again, restart the app.');
    console.log(`Game by \x1b[34mAdamecki\x1b[0m`);
    process.exit(0);
}
