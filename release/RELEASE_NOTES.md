Release notes:

- Added `aria-label`s, restructured DOM headings and tags, verified `tabIndex` order, and made other accessibility improvements.
- Went through all recommendations [here](https://developer.chrome.com/docs/lighthouse/accessibility/) and [here](https://www.a11yproject.com/checklist/).
  - Some recommendations have not yet been implemented or have been addressed with alternatives (e.g. using `role="list"` instead of using a `<ul>` tag).
- Fixed bug where errors reading a past stream would prevent the creation of a new one.
- Fixed overflow bug on Help page.

Download on the [Chrome Webstore](https://chrome.google.com/webstore/detail/agdomcadfhkpkcjceenogkiglbhgpclg?authuser=0&hl=en-GB) ◦ Checksum: `7b0e3fa8f5f2217bfd597700ba4689da9d32375347d9da41b6b5ef0380e67ab5`

**Full Changelog**: https://github.com/kewbish/cobweb/compare/v0.0.10...v0.0.11
