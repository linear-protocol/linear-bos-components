/** common lib start */
const accountId = props.accountId || context.accountId;
const isSignedIn = !!accountId;
const NEAR_DECIMALS = 24;
const LiNEAR_DECIMALS = 24;
const BIG_ROUND_DOWN = 0;
const MIN_BALANCE_CHANGE = 0.5;

function isValid(a) {
  if (!a) return false;
  if (isNaN(Number(a))) return false;
  if (a === "") return false;
  return true;
}
/** common lib end */

// Config for LiNEAR app
function getConfig(network) {
  switch (network) {
    case "mainnet":
      return {
        ownerId: "linearprotocol.near",
        contractId: "linear-protocol.near",
        nodeUrl: "https://rpc.mainnet.near.org",
        appUrl: "https://app.linearprotocol.org",
      };
    case "testnet":
      return {
        ownerId: "linear-builder.testnet",
        contractId: "linear-protocol.testnet",
        nodeUrl: "https://rpc.testnet.near.org",
        appUrl: "https://testnet.linearprotocol.org",
      };
    default:
      throw Error(`Unconfigured environment '${network}'.`);
  }
}
const config = getConfig(context.networkId);

State.init({
  tabName: "stake", // stake | unstake
  page: "stake", // "stake" | "account"
  nearBalance: "",
  unstakeInfo: {},
});

const Main = styled.div`
  position: relative;
  color: white;
  width: 100%;
  height: 100vh;
  background: #09071f;
  padding: 20px;

  display: flex;
  align-items: center;
  flex-direction: column;
`;

const updateTabName = (tabName) =>
  State.update({
    tabName,
  });

const updatePage = (pageName) => State.update({ page: pageName });

// Account balances
function getNearBalance(accountId, onInvalidate) {
  const options = {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      jsonrpc: "2.0",
      id: "dontcare",
      method: "query",
      params: {
        request_type: "view_account",
        finality: "final",
        account_id: accountId,
      },
    }),
  };
  asyncFetch(config.nodeUrl, options).then((res) => {
    const { amount, storage_usage } = res.body.result;
    const COMMON_MIN_BALANCE = 0.05;

    let newBalance = "-";
    if (amount) {
      const availableBalance = Big(amount || 0).minus(
        Big(storage_usage).mul(Big(10).pow(19))
      );
      const balance = availableBalance
        .div(Big(10).pow(NEAR_DECIMALS))
        .minus(COMMON_MIN_BALANCE);
      newBalance = balance.lt(0) ? "0" : balance.toFixed(5, BIG_ROUND_DOWN);
    }
    State.update({
      nearBalance: newBalance,
    });
    if (onInvalidate) {
      onInvalidate(nearBalance, newBalance);
    }
  });
}

function getLinearBalance(accountId, subscribe) {
  const linearBalanceRaw = Near.view(
    config.contractId,
    "ft_balance_of",
    {
      account_id: accountId,
    },
    undefined,
    subscribe
  );
  if (!linearBalanceRaw) return "-";
  const balance = Big(linearBalanceRaw).div(Big(10).pow(LiNEAR_DECIMALS));
  return balance.lt(0) ? "0" : balance.toFixed();
}

function getAccountDetails(accountId, subscribe) {
  return Near.view(
    config.contractId,
    "get_account_details",
    {
      account_id: accountId,
    },
    undefined,
    subscribe
  );
}

const nearBalance = accountId ? state.nearBalance : "-";
// Initial fetch of account NEAR balance
if (accountId && !isValid(nearBalance)) {
  getNearBalance(accountId);
}
const linearBalance = accountId ? getLinearBalance(accountId) : "-";
const accountDetails = accountId ? getAccountDetails(accountId) : "-";

function updateAccountInfo({ notNEAR, callback }) {
  const interval1 = setInterval(() => {
    const data = getAccountDetails(accountId, true);
    if (
      data.unstaked_balance !== accountDetails.unstaked_balance ||
      data.staked_balance !== accountDetails.staked_balance
    ) {
      // stop polling
      clearInterval(interval1);
      // update NEAR and LiNEAR balances
      getLinearBalance(accountId, true);
      getNearBalance(accountId);
      // invoke callback functions if any
      if (callback) callback();
    }
  }, 500);
  if (!notNEAR) {
    const interval2 = setInterval(() => {
      getNearBalance(accountId, (oldBalance, newBalance) => {
        if (
          newBalance !== "-" &&
          oldBalance !== "-" &&
          Big(newBalance).sub(oldBalance).abs().gt(MIN_BALANCE_CHANGE)
        ) {
          // stop polling and invoke callback functions if any
          clearInterval(interval2);
        }
      });
    }, 500);
  }
}

function onLoad(data) {
  State.update({ unstakeInfo: data });
}

const body =
  state.page === "stake" ? (
    <Main>
      <Widget src={`${config.ownerId}/widget/LiNEAR.TitleAndDescription`} />
      <Widget src={`${config.ownerId}/widget/LiNEAR.Apy`} />
      <Widget
        src={`${config.ownerId}/widget/LiNEAR.Tab`}
        props={{
          tabName: state.tabName,
          updateTabName,
        }}
      />
      {state.tabName === "stake" && (
        <Widget
          src={`${config.ownerId}/widget/LiNEAR.Stake`}
          props={{ config, nearBalance, linearBalance, updateAccountInfo }}
        />
      )}
      {state.tabName === "unstake" && (
        <Widget
          src={`${config.ownerId}/widget/LiNEAR.Unstake`}
          props={{
            config,
            linearBalance,
            unstakeInfo: state.unstakeInfo,
            updateAccountInfo,
            updatePage,
          }}
        />
      )}
    </Main>
  ) : (
    <Widget
      src={`${config.ownerId}/widget/LiNEAR.Account`}
      props={{
        config,
        nearBalance,
        linearBalance,
        unstakeInfo: state.unstakeInfo,
        updatePage,
        updateTabName,
        updateAccountInfo,
      }}
    />
  );

return (
  <Main>
    <Widget
      src={`${config.ownerId}/widget/LiNEAR.Data.Unstake`}
      props={{ config, accountDetails, onLoad }}
    />
    <Widget
      src={`${config.ownerId}/widget/LiNEAR.Navigation`}
      props={{
        updatePage,
      }}
    />
    {body}
  </Main>
);
