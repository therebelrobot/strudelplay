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

## Configuration

Edit `.env` to change:

```env
SAMPLES_PORT=8000      # Port for the samples server
SAMPLES_DIR=samples    # Directory to serve (relative to project root)
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