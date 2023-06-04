Release notes:

- Added `aria-label`s, restructured DOM headings and tags, verified `tabIndex` order, and made other accessibility improvements.
- Went through all recommendations [here](https://developer.chrome.com/docs/lighthouse/accessibility/) and [here](https://www.a11yproject.com/checklist/).
  - Some recommendations have not yet been implemented or have been addressed with alternatives (e.g. using `role="list"` instead of using a `<ul>` tag).
- Fixed bug where errors reading a past stream would prevent the creation of a new one.
- Fixed overflow bug on Help page.

Download on the [Chrome Webstore](https://chrome.google.com/webstore/detail/agdomcadfhkpkcjceenogkiglbhgpclg?authuser=0&hl=en-GB) ◦ Checksum: `f8fcf1dcb877899b6b8d9819784605dbb2eb69e8aa11cf075ffc454c6a2cf5df`

**Full Changelog**: https://github.com/kewbish/cobweb/compare/v0.0.10...v0.0.11
