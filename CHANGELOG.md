Refined cache usage, bug fix: `python-sep` template.

- Bug Fix: Project template `python-sep` was not working.
- Dependency Fix: `libcrypto-3-x64.dll` not found, in production.
- In GitHub Actions `tags` pushes, only `restore`s caches, **_doesn't store!._**
- Action Fix: Workflow runs only for `v*` -> `main` and `beta-*` -> `development` branch.
