# Custom Samples Directory

Place your custom audio samples here to serve them locally for use in Strudel patterns.

## Directory Structure

Organize your samples however you like:

```
samples/
├── drums/
│   ├── kick.wav
│   ├── snare.wav
│   └── hat.wav
├── bass/
│   └── bass-c.wav
├── synths/
│   └── lead.wav
└── README.md
```

## Supported Formats

- WAV (`.wav`)
- MP3 (`.mp3`)
- OGG (`.ogg`)
- FLAC (`.flac`)

## Usage in Strudel

Start the samples server:

```bash
npm run samples:serve
# or as part of full dev environment:
npm run dev:full
```

This will serve your samples at `http://localhost:8000` (or the port specified in `.env`).

In your Strudel patterns, reference them like:

```javascript
// Reference samples from the server
samples('http://localhost:8000')

// Use samples by filename (without extension)
sound("kick snare hat snare")

// Use samples from subdirectories
sound("drums/kick drums/snare drums/hat")

// Combine with Strudel's built-in samples
samples('http://localhost:5555', 'http://localhost:8000')
sound("bd casio/c4 drums/kick")
```

## Sample JSON Generation

The `strudel-json-generator` creates a JSON file that maps your sample filenames to URLs, making it easier to use your samples in Strudel patterns.

### Local Development

During development, generate JSON that points to your local samples server:

```bash
# One-time generation
npm run samples:generate:local

# Watch mode (auto-updates when samples change) - included in dev:all
npm run samples:generate:watch
```

This creates a JSON file with URLs like `http://localhost:8000/drums/kick.wav`.

Then in your Strudel patterns:
```javascript
samples('http://localhost:8000/samples.json')
sound("kick snare hat drums/snare")
```

The watch mode (included in `npm run dev:all`) automatically regenerates the JSON when you add, remove, or modify samples - perfect for rapid iteration.

### GitHub Hosting (Production)

To host your samples on GitHub for remote access:

1. After `npm run setup`, edit `.env` and configure your GitHub details:
   ```env
   GITHUB_USERNAME=your-username
   GITHUB_REPO=your-repo
   SAMPLES_DIR=samples
   ```

2. Generate the samples JSON with GitHub URLs:
   ```bash
   npm run samples:generate
   ```

3. Push your samples and JSON to GitHub:
   ```bash
   git add samples/
   git commit -m "Add custom samples"
   git push
   ```

4. Use in Strudel patterns:
   ```javascript
   samples('https://raw.githubusercontent.com/your-username/your-repo/main/samples/samples.json')
   sound("kick snare hat")
   ```

## Configuration

Edit `.env` to change:

```env
SAMPLES_PORT=8000      # Port for the samples server
SAMPLES_DIR=samples    # Directory to serve (relative to project root)
GITHUB_USERNAME=your-username  # For GitHub hosting
GITHUB_REPO=your-repo          # For GitHub hosting
```

## Tips

1. **Organize by type**: Group similar sounds together
2. **Use descriptive names**: `kick-808.wav` instead of `k1.wav`
3. **Keep file sizes reasonable**: Compress audio when possible
4. **Consistent sample rate**: 44.1kHz or 48kHz recommended

## Example Samples

Here are some free sample sources:

- [Freesound](https://freesound.org/)
- [99Sounds](https://99sounds.org/free-sound-effects/)
- [Bedroom Producers Blog](https://bedroomproducersblog.com/free-samples/)

## CORS

The samples server is configured with CORS enabled, so Strudel can access your samples from the browser without issues.