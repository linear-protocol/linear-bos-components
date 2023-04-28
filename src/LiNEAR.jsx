/** common lib start */
const accountId = props.accountId || context.accountId;
const isSignedIn = !!accountId;
const NEAR_DECIMALS = 24;
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
    ...state,
    tabName,
  });

const updatePage = (pageName) => State.update({ ...state, page: pageName });

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
          props={{ config }}
        />
      )}
      {state.tabName === "unstake" && (
        <Widget
          src={`${config.ownerId}/widget/LiNEAR.Unstake`}
          props={{ config }}
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
