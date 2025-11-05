# 🌇 imgdesc

<div align="center">

[![npm version](https://badge.fury.io/js/imgdesc.svg)](https://www.npmjs.com/package/imgdesc)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js Version](https://img.shields.io/node/v/imgdesc)](https://nodejs.org)

</div>

> **CLI tool for generating image metadata in bulk — powered by Gemini for smarter, more context-aware descriptions.**

---

## 🧭 What is imgdesc?

**imgdesc** is a fast, open-source CLI for turning images into rich captions, alt text, and metadata using Google Gemini. Perfect for developers, content teams, eCommerce, and dataset curators who need instant, consistent descriptions from the terminal.

---

## ✨ Features

- ✅ **Bulk Processing**: Point to a folder and caption everything in one run.
- 🧠 **Rich Metadata Output**: Generates description, alt text, tags, category, and a smart rename slug.
- 🔄 **Instruction Prompting**: Tailor tone for SEO, accessibility, storytelling, datasets, product catalogs, etc.
- ⚡ **Fast Models**: Optimized for Gemini Flash with optional upgrade to Pro for higher fidelity.
- 🧪 **Model Roadmap**: Planned support for BLIP / local vision models for offline or hybrid workflows.
- 🛠️ **Flexible Output**: Stream JSON to stdout or write structured JSON files.
- 🌐 **Multi-Use Cases**: eCommerce, blogs, accessibility remediation, dataset labeling, CMS ingestion.
- 🧵 **Consistent Naming**: AI-suggested slugs help you standardize file naming.
- 🧩 **Composable**: Pipe results into other tools for renaming, indexing, or uploading.
- 🔐 **Secure Key Handling**: Reads from flags or environment variables—no hardcoding required.
- 🧷 **Idempotent Runs**: Safe to re-run; simply overwrite or diff outputs.
- 📝 **Readable CLI Output**: Clear progress logs; verbose mode for debugging.

---

## 🧠 How It Works

1. Resolves your input path and collects every supported image file.
2. Batches each image into a multimodal Gemini request using your chosen model.
3. Applies your instruction prompt to guide captions, alt text, metadata formatting, and a suggested filename slug.
4. Returns the AI-enriched record (including rename suggestion) to the terminal and optionally writes it to the destination file.
5. Supports multi-image processing so full folders can be captioned in a single run.

---

## 📦 Installation

Requires Node.js `>=18.0.0`.

**Global install:**
```bash
npm install -g imgdesc
```

**Run without installing:**
```bash
npx imgdesc --help
```

**Quick start:**
```bash
npx imgdesc ./images -o result.json --api-key <YOUR_KEY>
```

---

## 🚀 Quick Start

Describe all images in a folder and save results to JSON:
```bash
imgdesc ./images -o result.json --api-key <YOUR_KEY>
```

Describe a single image with a custom instruction:
```bash
imgdesc ./assets/product.jpg -o desc.txt --instruction "Write SEO product descriptions for eCommerce"
```

---

## 🧩 CLI Usage & Options

**Syntax:**
```bash
imgdesc <input> [--api-key <key>] [--model <model>] [--instruction <text>] [--output <file>] [--json] [--verbose]
```

| Flag | Type | Default | Description | Example |
| --- | --- | --- | --- | --- |
| `--api-key, -k` | string | none | Gemini API key. Falls back to `GEMINI_API_KEY`/`GOOGLE_API_KEY`. | `-k $GEMINI_API_KEY` |
| `--model, -m` | string | `gemini-2.5-flash` | Gemini multimodal model to target. Supported models:
	- `gemini-2.5-pro`
	- `gemini-2.5-flash`
	- `gemini-2.5-flash-preview`
	- `gemini-2.5-flash-lite`
	- `gemini-2.5-flash-lite-preview`
	- `gemini-2.0-flash`
	- `gemini-2.0-flash-lite`
| Example: `--model gemini-2.5-flash` |
| `--instruction, -i` | string | Instructional default prompt | Customizes output tone, length, or format. | `-i "Write a playful Instagram caption"` |
| `--output, -o` | string | `descriptions.json` | File to save generated content; skipped when omitted. | `-o captions.json` |
| `--input` (positional) | path | required | Image file or directory to process. Supports JPG, PNG, WebP, GIF, BMP. | `imgdesc ./photos` |
| `--verbose, -v` | boolean | `false` | Prints detailed progress logs while processing. | `--verbose` |
| `--json` | boolean | `false` | Streams JSON results to stdout for piping. | `--json > output.json` |
| `--help, -h` | boolean | n/a | Display CLI help and exit. | `imgdesc --help` |

---


## 🧱 Example Outputs
**Single image (`desc.txt`)**
```
{
	"name": "pour-over-coffee-marble-counter.jpg",
	"originalName": "morning-pour-over.jpg",
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
		"name": "minimalist-white-sneaker-three-quarter.jpg",
		"originalName": "product-front.jpg",
		"description": "Minimalist white sneaker angled three-quarters on a soft beige backdrop, emphasizing breathable mesh and gum outsole for everyday wear.",
		"alt": "White mesh sneaker on a beige backdrop at a three-quarter angle",
		"tags": ["sneaker", "minimalist", "footwear", "retail"],
		"category": "product",
		"src": "./assets/product-front.jpg"
	},
	{
		"name": "runner-lacing-sneakers-sunset-stairs.jpg",
		"originalName": "product-lifestyle.jpg",
		"description": "Runner tying the sneaker on a sunlit city staircase, capturing motion and everyday versatility in golden-hour tones.",
		"alt": "Person lacing sneakers on a city staircase at sunset",
		"tags": ["lifestyle", "fitness", "sunset", "sneaker"],
		"category": "lifestyle",
		"src": "./assets/product-lifestyle.jpg"
	}
]
```

---

## 🔐 Authentication
- Sign in to [Google AI Studio](https://ai.google.dev/) and create a Gemini API key.
- Pass the key via `--api-key` / `-k`, or rely on environment variables (`GEMINI_API_KEY` or `GOOGLE_API_KEY`).
- API keys never leave your environment; imgdesc simply forwards requests directly to Gemini.

---

## 🧰 Configuration
- Store your key once per shell session:
	```bash
	export GEMINI_API_KEY="your_api_key_here"
	```
- Optionally add to your shell profile (`.bashrc`, `.zshrc`, PowerShell profile) or a local `.env` file if you manage environment loading with tools like `dotenv-cli`.
- Combine with process managers (e.g., `direnv`) to auto-load keys when entering the project.

---

## 🛠️ Troubleshooting & Common Problems

### Supported Gemini Models
The following Gemini models are supported for image description as of October 2025:

- `gemini-2.5-pro`
- `gemini-2.5-flash`
- `gemini-2.5-flash-preview`
- `gemini-2.5-flash-lite`
- `gemini-2.5-flash-lite-preview`
- `gemini-2.0-flash`
- `gemini-2.0-flash-lite`

Specify the model using the `--model` or `-m` flag. If you encounter errors, try switching to another supported model from this list.

 Below are frequent runtime messages you may encounter when running `imgdesc`, what they mean, and how to resolve them. In many cases simply switching to a different available model (e.g. falling back to `gemini-2.0-flash`) or retrying is enough.

### 1. 404 Not Found (Model Not Found)
```
 [GoogleGenerativeAI Error]: ... [404 Not Found] models/gemini-2.0-flash is not found for API version v1beta, or is not supported for generateContent.
```
**Why it happens:**
- Typo in the model name (e.g. `gemini-2.0-flash` before it is generally available to your key / region).
- The model string changed or is not supported for the chosen endpoint / API version.
- Temporary propagation delay for newly announced versions.

**Fix:**
- List available models in Google AI Studio ("List Models" in the UI) and copy the exact identifier.
- Try a stable model such as:
 	- `gemini-2.0-flash`
- Update your command:
	```bash
 	npx imgdesc example.jpg --model gemini-2.0-flash -k $GEMINI_API_KEY
	```
- If you previously succeeded with a newer model but now get 404, revert to the last known working model and check release notes later.

### 2. 503 Service Unavailable (Model Overloaded)
```
[GoogleGenerativeAI Error]: ... [503 Service Unavailable] The model is overloaded. Please try again later.
```
**Why it happens:** High demand or temporary capacity limits for that model/region.

**Fix / Mitigation:**
- Retry with exponential backoff (e.g. wait 2s, 4s, 8s, up to a cap).
 	- Switch to another model variant (`gemini-2.0-flash` vs a newer flash release) or temporarily use another supported model if latency is acceptable.
- Reduce batch size / concurrency (future CLI flag roadmap) or run images in smaller groups.

### 3. 400 Bad Request: API key not valid
```
[GoogleGenerativeAI Error]: ... [400 Bad Request] API key not valid. Please pass a valid API key. {"reason":"API_KEY_INVALID" ...}
```
**Why it happens:**
- Wrong key copied (extra whitespace, truncated, or expired key).
- Using a key from a different Google project without Generative Language API enabled.
- The key was revoked (for example after accidental exposure in a log, terminal history, or commit).

**Fix:**
- Regenerate a new key in Google AI Studio, enable required APIs, and export it again:
	```bash
	export GEMINI_API_KEY="<NEW_KEY>"
	npx imgdesc example.jpg -o out.json
	```
- Ensure there are no quotes or stray characters when passing `--api-key`.
- Prefer using the environment variable instead of pasting the key each time.
- If you accidentally posted a key publicly (issues, README, terminal screenshot) revoke and rotate immediately.

### 4. Successful run but reported individual errors
You may see a per‑image error message followed by `✅ Output file created` and `🎉 Done!`. The CLI writes an output file even if some images failed; failed items simply will not have entries. Re-run on the failed subset (or the whole folder—runs are idempotent) after addressing the error.

### 5. General Advice When Things Fail
 	- Try a known-good model: `--model gemini-2.0-flash`.
- Double‑check your network / proxy; some corporate proxies strip headers.
- Run with `--verbose` for additional logging context.
- If errors persist across models, open an issue and include:
	- Command (omit the real key!)
	- Model name
	- Sanitized error message
	- Approximate timestamp & region (if relevant)

### Quick Model Switch Examples
```bash
 # Stable flash baseline
 npx imgdesc image.jpg -m gemini-2.0-flash -k $GEMINI_API_KEY
```

> If you consistently hit 503 overload errors on a specific model, prefer a different one temporarily rather than rapid-fire retrying—that helps avoid rate limiting and gets you results faster.

### Security Reminder
Never commit your API key or paste it into issues. If you believe a key was exposed (even in a terminal transcript), rotate it and update your environment variable. Keys shown in examples here are placeholders.

---

## 💬 Feedback & Contribution
- Issues, ideas, and pull requests are welcome at [GitHub Issues](https://github.com/Gitnaseem745/imgdesc/issues).
- Share feature requests or success stories to help shape the roadmap.
- See `CONTRIBUTING.md` (coming soon) for coding standards and release workflow.

---

## 📜 License
- Released under the [MIT License](LICENSE). Feel free to fork, extend, and incorporate into your own toolchains.
