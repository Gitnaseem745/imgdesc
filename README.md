# imgdesc

> 🧠 Generate smart image descriptions from CLI — powered by Gemini.

## 🧭 Overview
- **imgdesc** is an open-source command line assistant that turns images into rich captions, alt text, and metadata using Google Gemini 1.5 Flash/Pro.
- Built for developers, content teams, eCommerce owners, and dataset curators who need fast, consistent descriptions straight from the terminal.
- Works entirely from the CLI, stays free when you supply your own Gemini API key, and processes single images or full folders in seconds.

## ⚙️ Installation
- Requires Node.js `>=18.0.0`.
- Install globally or run on-demand with `npx`.

```bash
# global install
npm install -g imgdesc

# run without installing
npx imgdesc --help

# quick start one-liner
npx imgdesc ./images -o result.json --api-key <YOUR_KEY>
```

## 🚀 Usage
- Basic invocation follows `imgdesc <input> [options]` where `<input>` is a file or folder of images.
- Use instructions to tailor tone (SEO copy, storytelling, accessibility, etc.).
- Responses are structured objects with `name`, `description`, `alt`, `tags`, `category`, and `src` fields.
- Output files created with `-o/--output` are always JSON, even if you choose a `.txt` extension.

```bash
npx imgdesc ./images -o result.json --api-key <YOUR_KEY>
npx imgdesc ./assets/product.jpg -o desc.txt --instruction "Write SEO product descriptions for eCommerce"
```

### CLI Syntax
```bash
imgdesc <input> \
	[--api-key <key>] [--model <model>] [--instruction <text>] \
	[--output <file>] [--json] [--verbose]
```

## 🧩 Flags and Options
| Flag | Type | Default | Description | Example |
| --- | --- | --- | --- | --- |
| `--api-key, -k` | string | none | Gemini API key. Falls back to `GEMINI_API_KEY`/`GOOGLE_API_KEY`. | `-k $GEMINI_API_KEY` |
| `--model, -m` | string | `gemini-1.5-flash` | Gemini multimodal model to target (`gemini-1.5-pro` also supported). | `--model gemini-1.5-pro` |
| `--instruction, -i` | string | Instructional default prompt | Customizes output tone, length, or format. | `-i "Write a playful Instagram caption"` |
| `--output, -o` | string | `descriptions.json` | File to save generated content; skipped when omitted. | `-o captions.json` |
| `--input` (positional) | path | required | Image file or directory to process. Supports JPG, PNG, WebP, GIF, BMP. | `imgdesc ./photos` |
| `--verbose, -v` | boolean | `false` | Prints detailed progress logs while processing. | `--verbose` |
| `--json` | boolean | `false` | Streams JSON results to stdout for piping. | `--json > output.json` |
| `--help, -h` | boolean | n/a | Display CLI help and exit. | `imgdesc --help` |

## 🧠 How It Works
1. Resolves your input path and collects every supported image file.
2. Batches each image into a multimodal Gemini request using your chosen model.
3. Applies your instruction prompt to guide captions, alt text, or metadata formatting.
4. Returns the AI-generated description in the terminal and optionally writes it to the destination file.
5. Supports multi-image processing so full folders can be captioned in a single run.

## 🧱 Example Outputs
**Single image (`desc.txt`)**
```
{
	"name": "morning-pour-over.jpg",
	"description": "Handcrafted pour-over coffee setup on a marble counter, sunlight catching the steam while whole beans add a warm, artisanal mood.",
	"alt": "Pour-over coffee maker steaming on a marble countertop in morning light",
	"tags": ["coffee", "pour over", "morning", "artisan"],
	"category": "lifestyle",
	"src": "./images/morning-pour-over.jpg"
}
```

**Batch JSON (`result.json`)**
```json
[
	{
		"name": "product-front.jpg",
		"description": "Minimalist white sneaker angled three-quarters on a soft beige backdrop, emphasizing breathable mesh and gum outsole for everyday wear.",
		"alt": "White mesh sneaker on a beige backdrop at a three-quarter angle",
		"tags": ["sneaker", "minimalist", "footwear", "retail"],
		"category": "product",
		"src": "./assets/product-front.jpg"
	},
	{
		"name": "product-lifestyle.jpg",
		"description": "Runner tying the sneaker on a sunlit city staircase, capturing motion and everyday versatility in golden-hour tones.",
		"alt": "Person lacing sneakers on a city staircase at sunset",
		"tags": ["lifestyle", "fitness", "sunset", "sneaker"],
		"category": "lifestyle",
		"src": "./assets/product-lifestyle.jpg"
	}
]
```

## 🔐 Authentication
- Sign in to [Google AI Studio](https://ai.google.dev/) and create a Gemini API key.
- Pass the key via `--api-key` / `-k`, or rely on environment variables (`GEMINI_API_KEY` or `GOOGLE_API_KEY`).
- API keys never leave your environment; imgdesc simply forwards requests directly to Gemini.

## 🧰 Configuration
- Store your key once per shell session:
	```bash
	export GEMINI_API_KEY="your_api_key_here"
	```
- Optionally add to your shell profile (`.bashrc`, `.zshrc`, PowerShell profile) or a local `.env` file if you manage environment loading with tools like `dotenv-cli`.
- Combine with process managers (e.g., `direnv`) to auto-load keys when entering the project.

## 🧑‍💻 Developer Guide
- Clone the repository and install dependencies:
	```bash
	git clone https://github.com/Gitnaseem745/imgdesc.git
	cd imgdesc
	npm install
	```
- Folder highlights:
	- `bin/` — CLI entry point and Gemini integration logic.
	- `output.txt` — sample output artifact to understand formatting.
	- `api-test.txt` / `v2-updates.txt` — internal notes on Gemini upgrade.
- Local debugging:
	```bash
	npm run dev
	# or run directly
	node ./bin/index.js ./images --verbose --api-key $GEMINI_API_KEY
	```
- Testing: `npm test` (currently placeholder, contributions welcome!).

## 💬 Feedback & Contribution
- Issues, ideas, and pull requests are welcome at [GitHub Issues](https://github.com/Gitnaseem745/imgdesc/issues).
- Share feature requests or success stories to help shape the roadmap.
- See `CONTRIBUTING.md` (coming soon) for coding standards and release workflow.

## 📜 License
- Released under the [MIT License](LICENSE). Feel free to fork, extend, and incorporate into your own toolchains.
