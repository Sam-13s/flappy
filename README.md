# Flappy Bird Game

A simple Flappy Bird game implemented in both web (HTML/CSS/JS) and Python (Pygame) versions.

## Features
- Multiple levels with increasing difficulty
- Collect coins for bonus points
- High score tracking
- Pause/resume functionality (web version)
- Sound effects and background music (Python version, optional)

## Web Version
### How to Run
1. Open `index.html` in a web browser.
2. Click "Start Game" to begin.
3. Use spacebar to make the bird jump.

### Controls
- Spacebar: Jump / Start game / Restart

## Python Version
### Requirements
- Python 3.x
- Pygame library (`pip install pygame`)

### How to Run
1. Run `python flappy.py`.
2. Use spacebar to jump.

### Controls
- Spacebar: Jump / Restart

### Sound Files (Optional)
- `jump.wav`
- `collision.wav`
- `coin.wav`

## Technologies Used
- Web: HTML, CSS, JavaScript, Canvas API
- Python: Pygame

## High Score
- Web version: Stored in localStorage
- Python version: Stored in `highscore.txt`
