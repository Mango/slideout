# Contributing

## Code style
Regarding code style like indentation and whitespace, **follow the conventions you see used in the source already.**

## Modifying the code

Please don't edit `/dist/slideout.js` and `/dist/slideout.min.js` files. You'll find source code in the `index.js` file.

1. Fork and clone the repo.
2. Run `npm install` to install all dependencies.
3. Create a new branch, please don't work in your `master` branch directly.
4. Open the file `/test/index.html`.
5. Code!

### Running the tests

- Run `npm test` from your command line and check the console
- Open the `/test/index.html` file to run test in your browser.

## Pull requests

1. Create a new branch, **please don't work in your `master` branch directly**.
2. Code!
3. Update the tests and run `npm test` to see the tests.
4. Run `npm run hint`.
5. Run `npm run dist` to build a new version.
6. Update the documentation and package to reflect any changes.
7. Push to your fork and submit a pull request.