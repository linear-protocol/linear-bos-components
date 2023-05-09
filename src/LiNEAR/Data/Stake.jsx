// MIT License: https://github.com/linear-protocol/linear-bos-components/blob/main/LICENSE

const accountId = props.accountId || context.accountId;
const LiNEAR_DECIMALS = 24;
const subgraphApiUrl =
  context.networkId === "mainnet"
    ? "https://api.thegraph.com/subgraphs/name/linear-protocol/linear"
    : "https://api.thegraph.com/subgraphs/name/linear-protocol/linear-testnet";

const { config, onLoad } = props;
if (!config) {
  return "Component cannot be loaded. Missing `config` props";
}

function getLinearPrice() {
  return Big(Near.view(config.contractId, "ft_price", "{}") ?? "0").div(
    Big(10).pow(LiNEAR_DECIMALS)
  );
}

function querySubgraph(query, variables) {
  const res = fetch(subgraphApiUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      query,
      variables,
    }),
  });
  if (res && res.ok) {
    return res.body;
  } else {
    return {};
  }
}

function queryStakingData(accountId, excludingFees) {
  const { data } = querySubgraph(`
    {
      users (first: 1, where: {id: "${accountId}"} ){
        firstStakingTime
        mintedLinear
        stakedNear
        unstakedLinear
        unstakeReceivedNear
        feesPaid
        transferedInShares
        transferedInValue
        transferedOutShares
        transferedOutValue
      }
    }
  `);
  if (!data) {
    return undefined;
  }
  const user = data.users[0];
  if (!user) {
    return undefined;
  }

  const linearPrice = getLinearPrice();
  if (Number(linearPrice) === 0) {
    return undefined;
  }

  const {
    firstStakingTime,
    stakedNear,
    mintedLinear,
    unstakedLinear,
    unstakeReceivedNear,
    feesPaid,
    transferedInShares,
    transferedInValue,
    transferedOutShares,
    transferedOutValue,
  } = user;

  const transferIn = linearPrice
    .mul(transferedInShares)
    .minus(transferedInValue);
  const transferOut = linearPrice
    .mul(transferedOutShares)
    .minus(transferedOutValue);
  const netTransfer = transferIn.minus(transferOut);

  const currentLinear = Big(mintedLinear).minus(unstakedLinear);
  const rewards = currentLinear
    .mul(linearPrice)
    .minus(stakedNear)
    .plus(unstakeReceivedNear)
    .plus(netTransfer);

  return {
    // turn nanoseconds into milliseconds
    firstStakingTime: firstStakingTime
      ? parseInt(firstStakingTime / 1_000_000)
      : undefined,
    // add fees if necessary
    stakingRewards: (excludingFees ? rewards : rewards.plus(feesPaid)).toFixed(
      0
    ),
  };
}

if (onLoad) {
  const data = queryStakingData(accountId);
  if (data) {
    onLoad(data);
  }
}

return <div style={{ display: "none" }} />;
