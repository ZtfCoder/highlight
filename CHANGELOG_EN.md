# Changelog

## 3.0.1
-----------------
1. Batch import mode - Add multiple highlights at once, separated by line breaks, commas, or spaces, with auto deduplication
2. Uniform style settings - Apply consistent styles to all highlights in a group with one click
3. Import with preset styles - Pre-configure colors and styles when importing highlights
4. Batch import preview - Preview highlights to be added in batch mode

## 3.0.0
-----------------
🎉 Major Update
- Internationalization - Added Chinese/English language switch, auto-detects browser language
- New UI Architecture - Rebuilt popup with React + TypeScript for smoother interactions
- Group Management - Create, edit, and delete highlight groups for better organization
- Enhanced Style Customization - Set color, bold, underline styles for each highlight individually
- Import/Export Optimization - JSON format batch import/export, compatible with v2 configs
- Shadow DOM Support - Full compatibility with Shadow DOM and micro-frontend architectures
- Performance Optimization - Fixed memory leaks for better long-term stability

⚠️ Upgrade Notice
- v3.0.0 is a major update with data structure changes
- Please export your config backup in v2.1.2 before upgrading to v3.0.0

## 2.1.2
-----------------
1. Added v2 JSON config export to prepare for v3 import

tip: Users updating to v2.1.2 should export their JSON config as backup to avoid data loss when updating to 3.0.0

## 2.1.1
-----------------
1. Batch add highlights (split by line breaks or spaces)
2. No modification to webpage source code, high compatibility with websites
