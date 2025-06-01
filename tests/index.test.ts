import * as core from '@actions/core';
import { promises as fs } from 'fs';
import { main } from '../src/index';

// Mock settings
jest.mock('@actions/core');
jest.mock('fs', () => ({
  promises: {
    readFile: jest.fn(),
  },
}));

describe('import-asdf-tool-versions-action', () => {
  let setOutputSpy: jest.SpyInstance;
  let getInputSpy: jest.SpyInstance;
  let readFileSpy: jest.SpyInstance;
  let warningSpy: jest.SpyInstance;
  let setFailedSpy: jest.SpyInstance;

  beforeEach(() => {
    setOutputSpy = jest.spyOn(core, 'setOutput');
    getInputSpy = jest.spyOn(core, 'getInput');
    readFileSpy = jest.spyOn(fs, 'readFile');
    warningSpy = jest.spyOn(core, 'warning');
    setFailedSpy = jest.spyOn(core, 'setFailed');

    getInputSpy.mockReturnValue('.tool-versions'); // Default mock for path
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Core Functionality and Parsing', () => {
    it('should parse .tool-versions and set outputs for valid entries', async () => {
      readFileSpy.mockResolvedValue(`nodejs 20.10.0
ruby 3.2.2
`);
      await main();

      expect(setOutputSpy).toHaveBeenCalledWith('nodejs', '20.10.0');
      expect(setOutputSpy).toHaveBeenCalledWith('ruby', '3.2.2');
      expect(setOutputSpy).toHaveBeenCalledTimes(2);
      expect(warningSpy).not.toHaveBeenCalled();
    });

    it('should correctly handle flutter versions, stripping suffixes', async () => {
      readFileSpy.mockResolvedValue(`flutter 3.7.0-stable
flutter 3.10.0.pre-beta
flutter 3.13.1
`);
      await main();

      expect(setOutputSpy).toHaveBeenCalledWith('flutter', '3.7.0');
      expect(setOutputSpy).toHaveBeenCalledWith('flutter', '3.10.0');
      expect(setOutputSpy).toHaveBeenCalledWith('flutter', '3.13.1');
      // If multiple flutter versions, setOutput is called for each.
      // The action's behavior is that the last one set for a given key wins.
      // Test ensures parsing is correct for each line.
      expect(setOutputSpy).toHaveBeenCalledTimes(3);
      expect(warningSpy).not.toHaveBeenCalled();
    });
  });

  describe('Handling of Ignorable and Malformed Lines', () => {
    it('should skip empty lines and comment lines silently (no warnings)', async () => {
      readFileSpy.mockResolvedValue(
`
# This is a full-line comment
nodejs 1.0.0
  # This is a comment with leading spaces
java   11 # This is a comment after version

python 3.9.0
`
      );
      // Note: "java   11 # comment" parses to "java" and "11" due to comment stripping in src/index.ts.

      await main();

      expect(setOutputSpy).toHaveBeenCalledWith('nodejs', '1.0.0');
      expect(setOutputSpy).toHaveBeenCalledWith('java', '11'); // Assuming "java   11 # comment" parses to "java" and "11"
      expect(setOutputSpy).toHaveBeenCalledWith('python', '3.9.0');
      expect(setOutputSpy).toHaveBeenCalledTimes(3);
      expect(warningSpy).not.toHaveBeenCalled();
    });

    it('should issue warnings and skip lines that are malformed or result in empty versions', async () => {
      readFileSpy.mockResolvedValue(
`
nodejs 
  1.0.0
toolonly
flutter -stable
  # Valid comment line, should be skipped silently
another 1.2.3
   # Another valid comment
invalid line with no version
`
      );
      await main();

      expect(warningSpy).toHaveBeenCalledWith('Skipping malformed line in .tool-versions: "nodejs"');
      expect(warningSpy).toHaveBeenCalledWith('Skipping malformed line in .tool-versions: "1.0.0"'); // Space at start makes it malformed by current check
      expect(warningSpy).toHaveBeenCalledWith('Skipping malformed line in .tool-versions: "toolonly"');
      expect(warningSpy).toHaveBeenCalledWith('Skipping output for line: "flutter -stable" due to empty tool name or version after parsing.');
      expect(warningSpy).toHaveBeenCalledWith('Skipping malformed line in .tool-versions: "invalid line with no version". Version part "line with no version" contains spaces.');
      
      expect(setOutputSpy).toHaveBeenCalledWith('another', '1.2.3');
      expect(setOutputSpy).toHaveBeenCalledTimes(1); // Only 'another' should be set

      // Ensure no warnings for lines that are actual comments
      expect(warningSpy).not.toHaveBeenCalledWith(expect.stringContaining('# Valid comment line'));
      expect(warningSpy).not.toHaveBeenCalledWith(expect.stringContaining('# Another valid comment'));
    });
  });
  
  it('should call setFailed if the input file cannot be read', async () => {
    readFileSpy.mockRejectedValue(new Error('File not found'));
    // getInputSpy is mocked in beforeEach

    await main();

    expect(setFailedSpy).toHaveBeenCalledWith('File not found');
    expect(setOutputSpy).not.toHaveBeenCalled();
    expect(warningSpy).not.toHaveBeenCalled();
  });
});
