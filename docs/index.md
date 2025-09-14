# Developing hints

## Versioning the plugin

We release on each push on `main`.
Since VSCode marked place kind of demands to have the next version number in the pre-release, the version number in `package.json` is always the next version number (without SemVer suffix).

## Releasing a new version

1. `npx release-it --no-increment`
2. `npx github-release-from-changelog`
