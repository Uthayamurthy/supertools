# SuperTools

<div align="center">
  <img src="src/assets/logo.png" width="220" />
</div>

**SuperTools** is a powerful suite of free online tools to simplify everyday tasks. Whether you're
working with code, images, videos, PDFs, or data — SuperTools has you covered. All processing
happens entirely in your browser: nothing ever leaves your device.

![img.png](docs-images/img.png)

## Table of Contents

- [Features](#features)
- [Self-host](#self-hostrun)
- [License](#license)

## Features

We offer a wide variety of tools across multiple categories:

### **Image/Video/Audio Tools**

- Image Resizer & Converter
- Background Remover (AI-powered)
- Image Editor
- Video Trimmer & Speed Changer
- GIF Tools
- Audio Trimmer & Merger
- And more...

### **PDF Tools**

- PDF Splitter & Merger
- PDF Editor
- PDF to PNG / EPUB
- Compress & Rotate PDFs
- And more...

### **Text/List Tools**

- Case Converters
- List Shuffler & Sorter
- Text Formatters
- Regex Tester
- And more...

### **Date and Time Tools**

- Date Calculators
- Time Zone Converters
- Cron Expression Validator
- And more...

### **Math Tools**

- Scientific Calculator
- Prime Number Generator
- Voltage / Current / Resistance Calculator
- And more...

### **Data Tools**

- JSON / CSV / XML Tools
- YAML Converter
- And more...

## Self-host / Run

### Docker

```bash
docker run -d --name supertools --restart unless-stopped -p 8080:80 supertools:latest
```

### Docker Compose

```yaml
services:
  supertools:
    image: supertools:latest
    container_name: supertools
    restart: unless-stopped
    ports:
      - "8080:80"
```

### Build from Source

```bash
git clone https://github.com/Uthayamurthy/supertools.git
cd supertools
npm install
npm run dev
```

### Create a new tool

```bash
npm run script:create:tool my-tool-name folder1   # e.g. npm run script:create:tool split pdf
npm run script:create:tool my-tool-name folder1/folder2   # for nested tools
```

### Run tests

```bash
npm run test        # unit tests
npm run test:e2e    # end-to-end tests
```

## License

MIT License. See the [LICENSE](LICENSE) file for details.
