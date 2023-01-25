# ⚒️ Import .tool-versions of asdf to GitHub Actions


Import `.tool-versions` of [asdf](https://asdf-vm.com/) to GitHub Actions workflows.


## Usage
```yaml
jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v3
      - uses: wasabeef/import-asdf-tool-versions-action@v1.0.0
        id: asdf
        # with:
        #   path: .tool-versions # Default
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
- uses: wasabeef/import-asdf-tool-versions-action@v1.0.0
  id: asdf
- uses: subosito/flutter-action@v2.8.0
  with:
    channel: stable
    flutter-version: ${{ steps.asdf.outputs.flutter }}
    cache: true
```
