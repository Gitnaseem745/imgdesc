# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.1.0] - 2025-11-05

### Added
- Batch processing with concurrent image handling (10 images per batch)
- Intelligent rate limiting with 2-second delays between batches
- Better handling of Gemini API rate limits (optimized for 30 RPM)
- Improved progress logging with batch indicators
- Enhanced error handling for individual image processing failures

### Changed
- Default model changed to `gemini-2.0-flash-lite` for better performance
- Optimized processing speed with concurrent batch execution
- Updated progress output to show batch-level progress

### Fixed
- Rate limiting issues when processing multiple images
- Improved stability for large image folder processing

## [1.0.1] - 2025-10-XX

### Fixed
- Minor bug fixes and improvements

## [1.0.0] - 2025-10-XX

### Added
- Initial release
- Bulk image processing with Gemini AI
- Support for multiple image formats (JPG, PNG, WebP, GIF, BMP)
- Custom instruction prompts for tailored descriptions
- Multiple Gemini model support
- JSON and text output formats
- Verbose logging mode
- AI-generated filename suggestions
- Rich metadata output (description, alt text, tags, category, rename slug)
