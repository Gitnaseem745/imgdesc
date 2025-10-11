#!/usr/bin/env node
/**
 * imgdesc CLI Tool
 * ----------------
 * Generates AI-based image descriptions for single or multiple images.
 * Works offline using BLIP (via @xenova/transformers).
 * 
 * Flow:
 *   Input → main() → decides single/multiple → writeDescription() → generateOutputFile()
 * 
 * Author: Naseem Ansari
 * License: MIT
 */

import fs from "fs";
import path from "path";
import { Command } from "commander";
import chalk from "chalk";
import { pipeline } from "@xenova/transformers";

// ------------------------------------------------------------
// CLI SETUP
// ------------------------------------------------------------
const program = new Command();
program
    .name("imgdesc")
    .description("Generate AI-powered image descriptions for single or multiple images.")
    .argument("<input>", "Path to image file or folder")
    .option("-o, --output <file>", "Output file name (default: descriptions.json)", "descriptions.json")
    .option("--ai <mode>", "AI mode: local (default) or api (future use)", "local")
    .option("--token <hf_token>", "Hugging Face access token. Falls back to HF_TOKEN/HF_ACCESS_TOKEN env vars.")
    .option("--cache-dir <dir>", "Custom cache directory for downloaded model files.")
    .parse(process.argv);

const options = program.opts();
const inputPath = program.args[0];
const outputFile = options.output;

const CACHE_DIR = path.resolve(process.cwd(), ".imgdesc-cache");
fs.mkdirSync(CACHE_DIR, { recursive: true });

// ------------------------------------------------------------
// UTILITY FUNCTIONS
// ------------------------------------------------------------

/**
 * Check if given path is a file or folder.
 */
function isDirectory(p) {
    try {
        return fs.statSync(p).isDirectory();
    } catch (err) {
        console.error(chalk.red("❌ Invalid input path."));
        process.exit(1);
    }
}

/**
 * Reads all image files (jpg/png/jpeg/webp) from a directory.
 */
function getImageFiles(dirPath) {
    const validExtensions = [".jpg", ".jpeg", ".png", ".webp"];
    const allFiles = fs.readdirSync(dirPath);
    return allFiles
        .filter(file => validExtensions.includes(path.extname(file).toLowerCase()))
        .map(file => path.join(dirPath, file));
}

// ------------------------------------------------------------
// AI MODEL SETUP (BLIP)
// ------------------------------------------------------------

let captioner;

/**
 * Loads BLIP model only once.
 */
async function loadModel() {
    console.log(chalk.yellow("🧠 Loading AI model..."));
    try {
        // using alternative as blip is currently not available 
        // changing later with blip
        captioner = await pipeline("image-to-text", "Xenova/vit-gpt2-image-captioning", {
            revision: "main",
            cache_dir: CACHE_DIR,
        });
        console.log(chalk.green("✅ Model loaded successfully."));
    } catch (err) {
        if (typeof err?.message === "string" && err.message.includes("Unauthorized access")) {
            console.error(
                chalk.red(
                    "❌ Unauthorized: Hugging Face denied access. Set the HF_TOKEN environment variable if authentication is required."
                )
            );
        }
        throw err;
    }
}

/**
 * Generate AI-based description for a single image.
 */
async function writeDescription(imagePath) {
    try {
        const result = await captioner(imagePath);
        const description = result[0]?.generated_text || "No description available.";
        return {
            name: path.basename(imagePath),
            description,
            src: imagePath
        };
    } catch (err) {
        console.error(chalk.red(`❌ Error generating description for ${imagePath}:`), err.message);
        return {
            name: path.basename(imagePath),
            description: "Error generating description.",
            src: imagePath
        };
    }
}

/**
 * Writes all generated descriptions to an output file.
 */
function generateOutputFile(contentArray, outputFile) {
    try {
        fs.writeFileSync(outputFile, JSON.stringify(contentArray, null, 2), "utf8");
        console.log(chalk.green(`✅ Output file created: ${outputFile}`));
    } catch (err) {
        console.error(chalk.red("❌ Error writing output file:"), err.message);
    }
}

// ------------------------------------------------------------
// MAIN FUNCTION (Follows Your Flow Exactly)
// ------------------------------------------------------------

async function main() {
    console.log(chalk.cyanBright("🚀 Starting image description generator...\n"));

    // 1️⃣ Validate input
    if (!fs.existsSync(inputPath)) {
        console.error(chalk.red("❌ Input path does not exist."));
        process.exit(1);
    }

    // 2️⃣ Load AI model
    await loadModel();

    // 3️⃣ Detect input type
    const isDir = isDirectory(inputPath);
    const results = [];

    if (isDir) {
        // Multiple images
        console.log(chalk.blue("📁 Folder detected — processing multiple images...\n"));
        const imageFiles = getImageFiles(inputPath);

        if (imageFiles.length === 0) {
            console.log(chalk.red("⚠️ No image files found in the folder."));
            process.exit(0);
        }

        for (const img of imageFiles) {
            console.log(chalk.yellow(`🖼️ Processing: ${path.basename(img)}...`));
            const desc = await writeDescription(img);
            results.push(desc);
        }

        generateOutputFile(results, outputFile);
    } else {
        // Single image
        console.log(chalk.blue("🖼️ Single image detected — generating description...\n"));
        const desc = await writeDescription(inputPath);
        generateOutputFile([desc], outputFile);
    }

    console.log(chalk.greenBright("\n🎉 Done! All descriptions generated successfully.\n"));
}

// ------------------------------------------------------------
// RUN MAIN
// ------------------------------------------------------------
main().catch(err => {
    console.error(chalk.red("❌ Unexpected error:"), err);
    process.exit(1);
});
