const accountId = props.accountId || context.accountId;
const LiNEAR_DECIMALS = 24;
const subgraphApiUrl =
  context.networkId === "mainnet"
    ? "https://api.thegraph.com/subgraphs/name/linear-protocol/linear"
    : "https://api.thegraph.com/subgraphs/name/linear-protocol/linear-testnet";

const { config, onLoad } = props;

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
    return undefined;
  }
}

function getFirstStakingTime(accountId) {
  const { data } = querySubgraph(`
    {
      users (first: 1, where: {id: "${accountId}"} ){
        firstStakingTime
      }
    }
  `);
  if (data) {
    // turn nanoseconds into milliseconds
    return parseInt(data.users[0]?.firstStakingTime / 1_000_000);
  } else {
    return undefined;
  }
}

function getStakingRewards(accountId, excludingFees) {
  const { data } = querySubgraph(`
    {
      users (first: 1, where: {id: "${accountId}"} ){
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
  // If the user has no relevant operations before, return 0
  if (!user) {
    return undefined;
  }

  const {
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

  const linearPrice = getLinearPrice();
  if (Number(linearPrice) === 0) {
    return undefined;
  }

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

  if (!excludingFees) {
    return rewards.plus(feesPaid).toFixed(0);
  } else {
    return rewards.toFixed(0);
  }
}

if (onLoad) {
  onLoad({
    firstStakingTime: getFirstStakingTime(accountId),
    stakingRewards: getStakingRewards(accountId),
  });
}

return <div style={{ display: "none" }} />;
