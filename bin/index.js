#!/usr/bin/env node
/**
 * imgdesc CLI Tool
 * ----------------
 * Generates Gemini-powered image descriptions for single files or directories.
 * Users bring their own Gemini API key for multimodal prompting.
 *
 * Flow: parse CLI → prepare Gemini client → describe images → persist JSON output.
 */

import fs from "fs";
import path from "path";
import { Command } from "commander";
import chalk from "chalk";
import { GoogleGenerativeAI } from "@google/generative-ai";

// ------------------------------------------------------------
// CLI OPTIONS
// ------------------------------------------------------------
const program = new Command();
program
    .name("imgdesc")
    .description("Generate custom image descriptions using Google's Gemini models.")
    .argument("<input>", "Path to an image file or a folder of images")
    .option("-o, --output <file>", "Output file name", "descriptions.json")
    .option("-m, --model <model>", "Gemini model name", "gemini-1.5-flash")
    .option("-k, --api-key <key>", "Gemini API key (or set GEMINI_API_KEY/GOOGLE_API_KEY env var)")
    .option(
        "-i, --instruction <text>",
        "Instruction that guides description style",
        "Write a marketing-friendly description, concise alt text under 160 characters, five descriptive tags, a primary category label, and a short slug for a better filename."
    )
    .option("--json", "Print JSON output to stdout instead of writing to a file")
    .option("-v, --verbose", "Enable verbose logging for debugging")
    .parse(process.argv);

const options = program.opts();
const inputPath = program.args[0];

// ------------------------------------------------------------
// CONSTANTS & HELPERS
// ------------------------------------------------------------
const SUPPORTED_EXTENSIONS = new Map([
    [".jpg", "image/jpeg"],
    [".jpeg", "image/jpeg"],
    [".png", "image/png"],
    [".webp", "image/webp"],
    [".gif", "image/gif"],
    [".bmp", "image/bmp"]
]);

function resolveApiKey(explicitKey) {
    return explicitKey || process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY || "";
}

function logVerbose(message) {
    if (options.verbose) {
        console.log(chalk.gray(`[debug] ${message}`));
    }
}

function ensureInputExists(p) {
    if (!p) {
        console.error(chalk.red("❌ Please provide an input path."));
        process.exit(1);
    }

    if (!fs.existsSync(p)) {
        console.error(chalk.red("❌ Input path does not exist."));
        process.exit(1);
    }
}

function isDirectory(p) {
    try {
        return fs.statSync(p).isDirectory();
    } catch (err) {
        console.error(chalk.red("❌ Invalid input path."));
        process.exit(1);
    }
}

function collectImageFiles(p) {
    if (isDirectory(p)) {
        const files = fs.readdirSync(p);
        return files
            .filter(file => SUPPORTED_EXTENSIONS.has(path.extname(file).toLowerCase()))
            .map(file => path.join(p, file));
    }

    if (!SUPPORTED_EXTENSIONS.has(path.extname(p).toLowerCase())) {
        console.error(chalk.red("❌ Unsupported image format. Use jpg, jpeg, png, webp, gif, or bmp."));
        process.exit(1);
    }

    return [p];
}

function buildSchemaPrompt({ filename, userInstruction }) {
        const baseInstruction = userInstruction?.trim().length
                ? userInstruction.trim()
                : "Write a marketing-friendly description, concise alt text under 160 characters, five descriptive tags, a primary category label, and a short slug for a better filename.";

    const structureDirective = `You must respond with a JSON object matching this TypeScript interface:
{
    "name": string; // new descriptive filename stem (no extension, lowercase, hyphen-separated)
  "description": string; // human-friendly description that blends context and detail
  "alt": string; // accessibility-focused alt text under 160 characters
  "tags": string[]; // 3-7 descriptive keywords in lowercase
  "category": string; // primary category label, e.g. product, lifestyle, nature
}

Requirements:
- Honor the user's instruction for tone, medium, or audience while populating the fields.
- Avoid markdown. Return raw JSON only without backticks or explanation.
- Ensure tags do not duplicate each other and omit the file extension.
- The description should be longer than the alt text, which should stay practical for screen readers.
- Generate the name as a concise lowercase slug using letters, numbers, and hyphens only. Do not include a file extension.
`;

    return `${baseInstruction}

Image filename: ${filename}

${structureDirective}`;
}

function parseStructuredOutput(text) {
    if (!text) {
        return null;
    }

    const trimmed = text.trim();
    const candidate = trimmed.startsWith("{") ? trimmed : (trimmed.match(/\{[\s\S]*\}/) || [])[0];

    if (!candidate) {
        return null;
    }

    try {
        return JSON.parse(candidate);
    } catch (err) {
        logVerbose(`Failed to parse JSON: ${err.message}`);
        return null;
    }
}

function createGeminiClient(apiKey, modelName) {
    if (!apiKey) {
        console.error(chalk.red("❌ Gemini API key not provided. Use -k or set GEMINI_API_KEY/GOOGLE_API_KEY."));
        process.exit(1);
    }

    try {
        const client = new GoogleGenerativeAI(apiKey);
        return client.getGenerativeModel({ model: modelName });
    } catch (err) {
        console.error(chalk.red("❌ Failed to initialize Gemini client:"), err.message);
        process.exit(1);
    }
}

function toInlineData(imagePath) {
    const ext = path.extname(imagePath).toLowerCase();
    const mimeType = SUPPORTED_EXTENSIONS.get(ext);

    if (!mimeType) {
        throw new Error(`Unsupported image extension: ${ext}`);
    }

    const fileBuffer = fs.readFileSync(imagePath);
    return {
        inlineData: {
            mimeType,
            data: fileBuffer.toString("base64")
        }
    };
}

async function describeImage({ model, instruction, imagePath }) {
    try {
        const prompt = buildSchemaPrompt({
            filename: path.basename(imagePath),
            userInstruction: instruction
        });

        const response = await model.generateContent([
            { text: prompt },
            toInlineData(imagePath)
        ]);

        const rawText = typeof response?.response?.text === "function" ? response.response.text() : "";
        const text = rawText.trim();
        if (!text) {
            throw new Error("Model returned an empty description.");
        }

        const parsed = parseStructuredOutput(text);
        if (!parsed) {
            logVerbose(`Raw response for ${path.basename(imagePath)}: ${text}`);
            throw new Error("Structured JSON response missing or invalid.");
        }

        const descriptionValue = parsed.description ?? "";
        const description = typeof descriptionValue === "string" ? descriptionValue.trim() : String(descriptionValue || "").trim();

        const altValue = parsed.alt ?? parsed.altText ?? "";
        const alt = typeof altValue === "string" ? altValue.trim() : String(altValue || "").trim();

        const tags = Array.isArray(parsed.tags)
            ? parsed.tags.filter(Boolean).map(tag => String(tag).trim()).filter(Boolean)
            : [];
        const category = String(parsed.category || parsed.type || "uncategorized").trim() || "uncategorized";

        const descriptionText = description || "Description unavailable.";
        const altText = alt || descriptionText || "Alt text unavailable.";

        return {
            name: path.basename(imagePath),
            description: descriptionText,
            alt: altText,
            tags,
            category,
            src: imagePath
        };
    } catch (err) {
        console.error(chalk.red(`❌ Error generating description for ${path.basename(imagePath)}:`), err.message);
        return {
            name: path.basename(imagePath),
            description: "Error generating description.",
            alt: "Alt text unavailable due to error.",
            tags: [],
            category: "error",
            src: imagePath
        };
    }
}

function writeOutputFile(results, outputFile) {
    try {
        fs.writeFileSync(outputFile, JSON.stringify(results, null, 2), "utf8");
        console.log(chalk.green(`✅ Output file created: ${outputFile}`));
    } catch (err) {
        console.error(chalk.red("❌ Error writing output file:"), err.message);
    }
}

// ------------------------------------------------------------
// MAIN EXECUTION
// ------------------------------------------------------------
(async function main() {
    console.log(chalk.cyanBright("🚀 Starting Gemini-powered image description generator...\n"));

    ensureInputExists(inputPath);

    const apiKey = resolveApiKey(options.apiKey);
    const model = createGeminiClient(apiKey, options.model);
    const imageFiles = collectImageFiles(inputPath);

    if (imageFiles.length === 0) {
        console.log(chalk.yellow("⚠️ No supported images found to process."));
        return;
    }

    const results = [];
    for (const file of imageFiles) {
        console.log(chalk.yellow(`🖼️ Processing: ${path.basename(file)}...`));
        const description = await describeImage({
            model,
            instruction: options.instruction,
            imagePath: file
        });
        results.push(description);
    }

    if (options.json) {
        console.log(JSON.stringify(results, null, 2));
    } else {
        writeOutputFile(results, options.output);
    }
    console.log(chalk.greenBright("\n🎉 Done! Descriptions generated successfully.\n"));
})().catch(err => {
    console.error(chalk.red("❌ Unexpected error:"), err.message || err);
    process.exit(1);
});
