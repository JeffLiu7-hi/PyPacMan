# Pac-Man (Pygame + Web)

This project contains the original Pygame implementation of Pac-Man along with a browser-based version that mirrors the exact gameplay, layout, art, and audio. It uses the same level data and assets for both versions.

## Project Structure

```
PacMan/
├── Levels.py          # Level geometry, food placement, ghost movement tracks
├── Sprites.py         # Shared sprite classes for the pygame version
├── main.py            # Pygame entry point
├── resources/         # Fonts, images, and sounds shared by both editions
└── web/
    ├── index.html     # Canvas UI with overlay messages
    ├── styles.css     # Arcade styling (Algerian font, overlay look)
    └── game.js        # Canvas game logic mirroring the pygame rules
```

## Running the Pygame Edition

1. Ensure Python 3.x and `pygame` are installed.
2. From the project root run:
   ```bash
   python3 -m pip install pygame --upgrade
   python3 main.py
   ```
3. Use the arrow keys to play. Press `Enter` to continue after win/lose, `Esc` to quit.

## Running the Web Edition Locally

Opening `web/index.html` directly works, but sound playback and some browsers behave better over HTTP. To serve the folder:

```bash
cd "/Users/JeffLiu_1/Stuff/Python Stuff/PacMan"
python3 -m http.server 8000
```

Then browse to [http://localhost:8000/web/](http://localhost:8000/web/) and play with the arrow keys.

## Deploying to GitHub Pages

1. Commit the repository to GitHub.
2. Enable GitHub Pages (Settings → Pages) and point it to the `main` branch and `/ (root)` or `docs` depending on your layout. If you keep the current structure, the site URL will be `https://<username>.github.io/<repo>/web/`.
3. Visit that URL to play the web version using the same assets.

## Controls (Web + Pygame)

- Arrow keys: move Pac-Man
- Enter: restart/continue after win/lose message
- Esc: quit (web version shows a message; reload to play again)

## Notes

- The assets load from the `resources` directory. Make sure the relative paths stay intact if you reorganize the project.
- The web version draws at 606×606 and runs at 10 FPS to match the original Pygame timing.
- Background music plays after the first key press due to browser autoplay policies.

## License

This repository is licensed under the MIT License
