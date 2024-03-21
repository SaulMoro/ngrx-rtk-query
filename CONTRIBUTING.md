# Contribution Guidelines

When contributing to `ngrx-rtk-query`, whether on GitHub or in other community spaces:

- Be respectful, civil, and open-minded.
- Before opening a new pull request, try searching through the [issue tracker](https://github.com/SaulMoro/ngrx-rtk-query/issues) for known issues or fixes.
- If you want to make code changes based on your personal opinion(s), make sure you open an issue first describing the changes you want to make, and open a pull request only when your suggestions get approved by maintainers.

## How to Contribute

### Prerequisites

In order to not waste your time implementing a change that has already been declined, or is generally not needed, start by [opening an issue](https://github.com/SaulMoro/ngrx-rtk-query/issues/new/choose) describing the problem you would like to solve.

### Contributing via Codesandbox

You can contribute to this documentation on codesandbox which will automatically run all the setup command for you. [![Open with CodeSandbox](https://assets.codesandbox.io/github/button-edit-lime.svg)](https://codesandbox.io/p/github/SaulMoro/ngrx-rtk-query).

### Setup your environment locally

_Some commands will assume you have the Github CLI installed, if you haven't, consider [installing it](https://github.com/cli/cli#installation), but you can always use the Web UI if you prefer that instead._

In order to contribute to this project, you will need to fork the repository:

```bash
gh repo fork SaulMoro/ngrx-rtk-query
```

then, clone it to your local machine:

```bash
gh repo clone <your-github-name>/ngrx-rtk-query
```

This project uses [pnpm](https://pnpm.io) as its package manager. Install it if you haven't already:

```bash
npm install -g pnpm
```

Then, install the project's dependencies:

```bash
pnpm install
```

### Implement your changes

This project is a [Nx](https://nx.dev/) monorepo. The code for the CLI is in the `cli` directory, and the docs is in the `docs` directory. Now you're all setup and can start implementing your changes.

Here are some useful scripts for when you are developing:

| Command                     | Description                                             |
| --------------------------- | ------------------------------------------------------- |
| `pnpm dev:[example]`        | Builds and starts the [example] app                     |
| `pnpm dev:docs`             | Starts the development server for the docs with HMR     |
| `pnpm build:ngrx-rtk-query` | Builds ngrx-rtk-query package                           |
| `pnpm build:docs`           | Builds the docs                                         |
| `pnpm affected:build`       | Builds affected packages                                |
| `pnpm affected:lint`        | Lints affected packages                                 |
| `pnpm affected:test`        | Test affected packages                                  |
| `pnpm affected:e2e`         | Test e2e affected packages                              |
| `pnpm affected:e2e:watch`   | Test e2e affected packages with watch                   |
| `pnpm affected:check`       | Checks your code for typeerrors, formatting and linting |
| `pnpm format`               | Formats the code                                        |

When making commits, make sure to follow the [conventional commit](https://www.conventionalcommits.org/en/v1.0.0/) guidelines, i.e. prepending the message with `feat:`, `fix:`, `chore:`, `docs:`, etc... You can use `git status` to double check which files have not yet been staged for commit:

```bash
git add <file> && git commit -m "feat/fix/chore/docs: commit message"
```

### When you're done

Check that your code follows the project's style guidelines by running:

```bash
pnpm affected:check
```

Please also make a manual, functional test of your changes.

If your change should appear in the changelog, i.e. it changes some behavior of either the CLI or the outputted application, it must be captured by `changeset` which is done by running

```bash
pnpm changeset
```

and filling out the form with the appropriate information. Then, add the generated changeset to git:

```bash
git add .changeset/*.md && git commit -m "chore: add changeset"
```

When all that's done, it's time to file a pull request to upstream:

```bash
gh pr create --web
```

and fill out the title and body appropriately. Again, make sure to follow the [conventional commit](https://www.conventionalcommits.org/en/v1.0.0/) guidelines for your title.

## Translations

Coming soon...

## Credits

This documented was inspired by the contributing guidelines for [t3-oss/create-t3-ap](https://github.com/t3-oss/create-t3-ap/blob/main/CONTRIBUTING.md).
