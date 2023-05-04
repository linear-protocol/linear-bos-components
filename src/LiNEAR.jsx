/** common lib start */
const accountId = props.accountId || context.accountId;
const isSignedIn = !!accountId;
const NEAR_DECIMALS = 24;
const LiNEAR_DECIMALS = 24;
const BIG_ROUND_DOWN = 0;

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

function getNearBalance(accountId) {
  const account = fetch(config.nodeUrl, {
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
  });
  const { amount, storage_usage } = account.body.result;
  const COMMON_MIN_BALANCE = 0.05;
  if (!amount) return "-";
  const availableBalance = Big(amount || 0).minus(
    Big(storage_usage).mul(Big(10).pow(19))
  );
  const balance = availableBalance
    .div(Big(10).pow(NEAR_DECIMALS))
    .minus(COMMON_MIN_BALANCE);
  return balance.lt(0) ? "0" : balance.toFixed(5, BIG_ROUND_DOWN);
}

const nearBalance = getNearBalance(accountId);

function getLinearBalance(accountId) {
  const linearBalanceRaw = Near.view(config.contractId, "ft_balance_of", {
    account_id: accountId,
  });
  if (!linearBalanceRaw) return "-";
  const balance = Big(linearBalanceRaw).div(Big(10).pow(LiNEAR_DECIMALS));
  return balance.lt(0) ? "0" : balance.toFixed();
}

const linearBalance = getLinearBalance(accountId);
const formattedLinearBalance =
  linearBalance === "-" ? "-" : Big(linearBalance).toFixed(5, BIG_ROUND_DOWN);

State.init({
  tabName: "stake", // stake | unstake
  page: "stake", // "stake" | "account"
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
          props={{ config, nearBalance }}
        />
      )}
      {state.tabName === "unstake" && (
        <Widget
          src={`${config.ownerId}/widget/LiNEAR.Unstake`}
          props={{ config, linearBalance, formattedLinearBalance }}
        />
      )}
    </Main>
  );
} else {
  return (
    <Widget
      src={`${config.ownerId}/widget/LiNEAR.Account`}
      props={{
        updatePage,
        updateTabName,
        config,
        nearBalance,
        linearBalance: formattedLinearBalance,
      }}
    />
  );
}
