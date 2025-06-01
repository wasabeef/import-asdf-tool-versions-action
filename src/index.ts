import * as core from '@actions/core';
import { promises as fs } from 'fs';

/** .tool-version format
 * {Runtime} {Version}
 *
 * e.g.
 * dart 2.18.7
 * flutter 3.7.0-stable
 * kotlin 1.7.21
 */
export const main = async () => {
  try {
    const path = core.getInput('path');
    const text = await fs.readFile(path, 'utf8');
    const lines = text
      .toString()
      .trim() // Trim whitespace from the entire input, including trailing newlines
      .split('\n'); // Split into lines

    lines.forEach(function (line: string) {
      const trimmedLine = line.trim();
      // Skip empty lines and lines starting with # (comments)
      if (trimmedLine === '' || trimmedLine.startsWith('#')) {
        return;
      }

      const firstSpaceIndex = trimmedLine.indexOf(' ');
      if (firstSpaceIndex === -1 || firstSpaceIndex === 0 || firstSpaceIndex === trimmedLine.length - 1) {
        // If no space, or space is at the beginning (no tool name) or at the end (no version)
        core.warning(`Skipping malformed line in .tool-versions: "${trimmedLine}"`);
        return;
      }

      const toolName = trimmedLine.substring(0, firstSpaceIndex);
      let toolVersion = trimmedLine.substring(firstSpaceIndex + 1).trim(); 

      // Remove comments from toolVersion if any
      const commentStartIndex = toolVersion.indexOf('#');
      if (commentStartIndex !== -1) {
        toolVersion = toolVersion.substring(0, commentStartIndex).trim();
      }

      // Specific case for Flutter: remove suffixes like -stable, .pre-beta, .pre-dev
      if (toolName === 'flutter') {
        toolVersion = toolVersion.replace(/-stable$/, '');
        toolVersion = toolVersion.replace(/\.pre-beta$/, '');
        toolVersion = toolVersion.replace(/\.pre-dev$/, '');
      }

      // Final guard before setting output
      // Also, check if toolVersion itself is valid (e.g., does not contain spaces for non-flutter tools)
      // For simplicity, we'll consider any space in toolVersion (after initial parsing and flutter handling) as potentially problematic
      // unless it's a known case we want to allow.
      // However, the current logic already tries to parse, so an empty toolVersion after processing is the main concern here.
      if (toolName && toolVersion && !toolVersion.includes(' ')) { // Added check for space in toolVersion
        core.setOutput(toolName, toolVersion);
      } else if (toolName && toolVersion && toolVersion.includes(' ')) {
        core.warning(`Skipping malformed line in .tool-versions: "${trimmedLine}". Version part "${toolVersion}" contains spaces.`);
      } else {
        core.warning(`Skipping output for line: "${trimmedLine}" due to empty tool name or version after parsing.`);
      }
    });
  } catch (error: any) { 
    if (error instanceof Error) {
      core.setFailed(error.message);
    } else {
      core.setFailed(String(error));
    }
  }
};

main();
