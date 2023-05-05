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

function updateNearBalance(account, onInvalidate) {
  const { amount, storage_usage } = account.body.result;
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
}

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
  if (onInvalidate) {
    asyncFetch(config.nodeUrl, options).then((account) =>
      updateNearBalance(account, onInvalidate)
    );
  } else {
    updateNearBalance(fetch(config.nodeUrl, options));
  }
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

const nearBalance = state.nearBalance;
// Initial fetch of account NEAR balance
if (accountId && !isValid(nearBalance)) {
  getNearBalance(accountId);
}
const linearBalance = accountId ? getLinearBalance(accountId) : "-";

function updateAccountInfo(callback) {
  const interval = setInterval(() => {
    getNearBalance(accountId, (oldBalance, newBalance) => {
      if (
        newBalance !== "-" &&
        oldBalance !== "-" &&
        Big(newBalance).sub(oldBalance).abs().gt(MIN_BALANCE_CHANGE)
      ) {
        // now update LiNEAR balance after NEAR balance has been updated
        getLinearBalance(accountId, true);
        // stop polling and invoke callback functions if any
        clearInterval(interval);
        if (callback) callback();
      }
    });
  }, 500);
}

if (state.page === "stake") {
  return (
    <Main>
      <Widget
        src={`${config.ownerId}/widget/LiNEAR.Navigation`}
        props={{
          updatePage,
        }}
      />
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
          props={{ config, nearBalance, updateAccountInfo }}
        />
      )}
      {state.tabName === "unstake" && (
        <Widget
          src={`${config.ownerId}/widget/LiNEAR.Unstake`}
          props={{ config, linearBalance, updateAccountInfo }}
        />
      )}
    </Main>
  );
} else {
  return (
    <Main>
      <Widget
        src={`${config.ownerId}/widget/LiNEAR.Navigation`}
        props={{
          updatePage,
        }}
      />
      {/**TODOS, new pr later */}
    </Main>
  );
}
