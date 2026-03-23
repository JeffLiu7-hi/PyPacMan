# Pac-Man

This project contains the original Pygame implementation of Pac-Man along with a browser-based version that mirrors the exact gameplay, layout, art, and audio. It uses the same level data and assets for both versions.

## Project Structure

```
PacMan/
├── Levels.py          # Level geometry, food placement, ghost movement tracks
├── Sprites.py         # Shared sprite classes for the pygame version
├── main.py            # Pygame entry point
├── resources/         # Fonts, images, and sounds shared by both editions
```

## Running the Pygame Edition

1. Ensure Python 3.x and `pygame` are installed.
2. From the project root run:
   ```bash
   python3 -m pip install pygame --upgrade
   python3 main.py
   ```
3. Use the arrow keys to play. Press `Enter` to continue after win/lose, `Esc` to quit.

## Controls

- Arrow keys: move Pac-Man
- Enter: restart/continue after win/lose message
- Esc: quit

## Notes

- The assets load from the `resources` directory. Make sure the relative paths stay intact if you reorganize the project.

## License

This repository is licensed under the MIT License
