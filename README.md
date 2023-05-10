# LiNEAR BOS Components

[LiNEAR Protocol](https://linearprotocol.org/) is a liquid staking solution built on the NEAR Protocol. LiNEAR unlocks liquidity of the staked NEAR by creating a staking derivative to be engaged with various DeFi protocols on NEAR and Aurora, while also enjoying over 10% APY staking rewards of the underlying base tokens. LiNEAR is the cornerstone piece of the NEAR-Aurora DeFi ecosystem.

This repository holds [LiNEAR BOS components](https://near.org/linearprotocol.near/widget/LiNEAR) hosted on NEAR BOS (Blockchain Operating System), to interact with [LiNEAR smart contract](https://github.com/linear-protocol/LiNEAR).


## Setup Local Environment

We use [BOS Loader](https://docs.near.org/bos/dev/bos-loader) to enable instant preview in local environment, so you don't have to deploy all your components to mainnet to preview and test your changes.

1. [Download and install BOS Loader](https://github.com/near/bos-loader/releases)

> Linux / Mac: Install prebuilt binaries via shell script
>
> ```bash
> # WARNING: this installer is experimental
> curl --proto '=https' --tlsv1.2 -LsSf https://github.com/mpeterdev/bos-loader/releases/download/v0.6.0/bos-loader-v0.6.0-installer.sh | sh
> ```
>
> Windows: Install prebuilt binaries via powershell script
>
> ```bash
> # WARNING: this installer is experimental
> irm https://github.com/mpeterdev/bos-loader/releases/download/v0.6.0/bos-loader-v0.6.0-installer.ps1 | iex
> ```

2. Open https://test.near.org/flags, and set the loader URL to http://127.0.0.1:3030
3. Clone repository: `git clone https://github.com/linear-protocol/linear-bos-components`
4. Install dependencies: `cd linear-bos-components && yarn`
5. Launch testnet [preview page](https://test.near.org/linear-builder.testnet/widget/LiNEAR) and BOS loader: `yarn dev`
6. Modify LiNEAR components code, and refresh preview page to view the latest change. Please notice that because **hot reload** is not ready in BOS loader, you need to refresh the preview page in browser after code change.
7. [`prettier`](https://prettier.io/) is configured in Git pre-commit hook with [husky](https://github.com/typicode/husky) and [lint-staged](https://github.com/okonet/lint-staged) to automatically format the modified components code.

## Folder Structure

The source code of LiNEAR components are available in the `src` folder, and organized by sub-folders. For example, the `linearprotocol.near/widget/LiNEAR.Element.Button` component is available in `src/LiNEAR/Element/Button.jsx`. BOS Loader and BOS CLI both use `.` delimiter when converting local file path to component name, and vice versa.

## Continuous Integration & Delivery

We use [BOS CLI](https://github.com/FroVolod/bos-cli-rs) and its [GitHub actions](https://github.com/FroVolod/bos-cli-rs/tree/master/.github/workflows) for continuous integration and delivery.

1. We have set up one [testnet GitHub action](https://github.com/linear-protocol/linear-bos-components/blob/main/.github/workflows/testnet-preview.yml) to deploy latest commit in pull request to testnet for preview and testing once the PR is submitted. (However, since now we have only configured on `TESTNET_DEPLOY_ACCOUNT`, if you have multiple open PRs, they may conflict with each other. This will be fixed later.)
2. We have another [mainnet GitHub action](https://github.com/linear-protocol/linear-bos-components/blob/main/.github/workflows/mainnet-release.yml) to deploy the latest `main branch` components code to mainnet.

To make the CI workflow work, we need to create function call keys for testnet and mainnet deployment, following the instructions in [BOS CLI](https://github.com/FroVolod/bos-cli-rs), and set up below GitHub actions [variables and secrets](https://docs.github.com/en/actions/learn-github-actions/variables#creating-configuration-variables-for-a-repository).

- `TESTNET_DEPLOY_ACCOUNT` / `TESTNET_SIGNER_PUBLIC_KEY` / `TESTNET_SIGNER_PRIVATE_KEY`
- `MAINNET_DEPLOY_ACCOUNT` / `MAINNET_SIGNER_PUBLIC_KEY` / `MAINNET_SIGNER_PRIVATE_KEY`

## Testing

1. We recommend testing locally with BOS Loader first, before submit pull request for code review and testnet testing.
2. Once a PR is submitted, it will be automatically deployed to testnet, which makes it easy for others to test and provide feedback.
3. Only after a PR is well tested and reviewed, it will be merged and the latest `main branch` commit will be deployed to mainnet.

## License

MIT License
