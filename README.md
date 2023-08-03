# Dictionarily
A simple word game made in Node.JS by Adamecki.

# How does it work?
When you start the game, it fetches a random word from a dictionary API and tells you to guess it.
Each guess is verified if it's in the dictionary so you guess by typing real words and not random letters.
After that, game gives you hints about what you should type next (look below).

![Screenshot](screenshot.png "Screenshot")

# Languages
English is the only language supported so far, but I plan on adding Polish and German in the future.

# Requirements
- Terminal window sized 88x22 or more (columns x rows) or command line OS
- Node.JS v18.13.0 or newer (may work on older versions, but not guaranteed)
- Internet connection
- Wide vocabulary knowledge ;)

*app not tested on Windows and macOS*

# APIs used to fetch & verify words
https://random-word-api.vercel.app/api?words=1 - word fetching API
https://api.dictionaryapi.dev/api/v2/entries/en/<word> - word verifying API

# Cheats
More guesses - edit line 21 and 257 and put in as many chances as you want.
Disable word verifying - comment out function `check-for-existence` and directly move on to `compare`. May be useful if you encounter any problems with word verification API (e.g. fetching API fetched a word that isn't in the verifying API). I'm still working on finding one server to fetch & verify words.
