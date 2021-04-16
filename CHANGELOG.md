# Changelog
All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.2.0]

Breaking changes.

### Changed

- Exported types Optional is operating upon.
- Moved Optional from named to default export.
- Documented all IOptional methods.
- Added new methods `#satisfies()`, `#dissatisfies()`, `#contains()`,
  `#orElseNull()`.
- Renamed `#or()` into `#orElse()`.
- Added UPL-1.0 license.

## [0.1.3]
### Fixed

- Fixed `.map()` method inheriting null and undefined type returned by
transformer.

## [0.1.2]
### Fixed

- Types were pointing to invalid location

## [0.1.1]

Technical release, no functional changes.

## [0.1.0]
### Added

- Initial version
