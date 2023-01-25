# ⚒️ Import .tool-versions of asdf to GitHub Actions workflows

```yaml
jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v3
      - uses: wasabeef/import-asdf-tool-versions-action@v1.0.0
        id: asdf
        with:
          path: .tool-versions
      - name: Echo asdf
        run: |
          echo "${{ steps.asdf.outputs.flutter }}"
          echo "${{ steps.asdf.outputs.dart }}"
          echo "${{ steps.asdf.outputs.nodejs }}"
          echo "${{ steps.asdf.outputs.gradle }}"
          echo "${{ steps.asdf.outputs.java }}"
          echo "${{ steps.asdf.outputs.kotlin }}"
```
