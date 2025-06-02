# ⚒️ Import .tool-versions of asdf to GitHub Actions

[![GitHub release](https://img.shields.io/github/release/wasabeef/import-asdf-tool-versions-action.svg)](https://github.com/wasabeef/import-asdf-tool-versions-action/releases)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

This GitHub Action imports tool versions from your `.tool-versions` file (used by [asdf-vm](https://asdf-vm.com/)) and makes them available as outputs in your GitHub Actions workflows.

## Usage

```yaml
jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v4
      - uses: wasabeef/import-asdf-tool-versions-action@v1.1.0
        id: asdf
        # with:
        #   path: .tool-versions # Default
      # The outputs will mirror your .tool-versions file.
      # e.g., if you have 'nodejs 20.0.0', access it with ${{ steps.asdf.outputs.nodejs }}
      - name: Echo asdf
        run: |
          echo "${{ steps.asdf.outputs.flutter }}"
          echo "${{ steps.asdf.outputs.dart }}"
          echo "${{ steps.asdf.outputs.nodejs }}"
          echo "${{ steps.asdf.outputs.gradle }}"
          echo "${{ steps.asdf.outputs.java }}"
          echo "${{ steps.asdf.outputs.kotlin }}"
```

### Samples

Use with `subosito/flutter-action`

```yaml
- uses: wasabeef/import-asdf-tool-versions-action@v1.1.0
  id: asdf
- uses: subosito/flutter-action@v2
  with:
    channel: stable
    flutter-version: ${{ steps.asdf.outputs.flutter }}
    cache: true
```
