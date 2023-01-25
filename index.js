const core = require('@actions/core');
const github = require('@actions/github');
const { promises: fs } = require('fs');

/** .tool-version format
 * {Runtime} {Version}
 *
 * e.g.
 * dart 2.18.7
 * flutter 3.7.0-stable
 * kotlin 1.7.21
 */
const main = async () => {
  const path = core.getInput('path');
  const text = await fs.readFile(path, 'utf8');
  const content = text
    .toString()
    .replace(/(\r?\n)+/g, '\n')
    .replace(/(\r?\n)+$/g, '')
    .split(/\r\n|\n/);
  content.forEach(function (line) {
    const tool = line.trim().split(/\s+/);
    core.setOutput(tool[0], tool[1]);
  });
};

main().catch((err) => core.setFailed(err.message));
