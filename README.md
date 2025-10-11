# imgdesc

CLI tool that generates AI-powered image descriptions locally using [Transformers.js](https://github.com/xenova/transformers.js) and the BLIP captioning model.

## Quick start

1. Install dependencies:

	```bash
	npm install
	```

2. Generate a caption for a sample image:

	```bash
	npm run dev
	```

## Usage

```
imgdesc <input> [options]
```

| Option | Default | Description |
| ------ | ------- | ----------- |
| `-o, --output <file>` | `descriptions.json` | Output file for generated captions. |

### Environment variables

- `HF_TOKEN` / `HF_ACCESS_TOKEN`: Optional Hugging Face token used to authenticate model downloads if your network requires it.

### Example

```bash
imgdesc ./photos --output captions.json
```

This command processes every image in the `photos` directory and writes the results to `captions.json`.
