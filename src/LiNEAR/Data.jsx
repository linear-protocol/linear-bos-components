const accountId = props.accountId || context.accountId;
const LiNEAR_DECIMALS = 24;
const subgraphApiUrl =
  context.networkId === "mainnet"
    ? "https://api.thegraph.com/subgraphs/name/linear-protocol/linear"
    : "https://api.thegraph.com/subgraphs/name/linear-protocol/linear-testnet";

const { config, onLoad } = props;

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

function getTransferIncome(accountId) {
  const { data } = querySubgraph(`
    {
      users(first: 1, where:{id:"${accountId}"}) {
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

  const linearPrice = getLinearPrice();
  const transferInShares = data.users[0].transferedInShares;
  const transferInValue = data.users[0].transferedInValue;
  const transferOutShares = data.users[0].transferedOutShares;
  const transferOutValue = data.users[0].transferedOutValue;

  let transferInReward = linearPrice * transferInShares - transferInValue;
  let transferOutReward = linearPrice * transferOutShares - transferOutValue;
  return transferInReward - transferOutReward;
}

function getLinearPrice() {
  return Big(Near.view(config.contractId, "ft_price", "{}") ?? "0").div(
    Big(10).pow(LiNEAR_DECIMALS)
  );
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
      }
    }
  `);
  if (!data) {
    return "0";
  }
  let user = data.users[0];
  // If the user has no relevant operations before, return 0
  if (!user) {
    return "0";
  }

  const linearPrice = Big(getLinearPrice());
  const mintedLinear = Big(user.mintedLinear);
  const stakedNear = Big(user.stakedNear);
  const unstakedLinear = Big(user.unstakedLinear);
  const unstakeReceivedNEAR = Big(user.unstakeReceivedNear);
  const feesPaid = Big(user.feesPaid);
  const currentLinear = mintedLinear.minus(unstakedLinear);
  const transferReward = Big(getTransferIncome(accountId));

  const reward = currentLinear
    .times(linearPrice)
    .round()
    .minus(stakedNear)
    .plus(unstakeReceivedNEAR)
    .plus(transferReward);

  if (!excludingFees) {
    const rewardFinal = reward.plus(feesPaid);
    return rewardFinal.toFixed();
  } else {
    return reward.toFixed();
  }
}

if (onLoad) {
  onLoad({
    firstStakingTime: getFirstStakingTime(accountId),
    stakingRewards: getStakingRewards(accountId),
  });
}

return <div style={{ display: "none" }} />;
