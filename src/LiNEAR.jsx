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

function getConfig(network) {
  switch (network) {
    case "mainnet":
      return {
        contractId: "linear-protocol.near",
        nodeUrl: "https://rpc.mainnet.near.org",
        appUrl: "https://app.linearprotocol.org",
      };
    case "testnet":
      return {
        contractId: "linear-protocol.testnet",
        nodeUrl: "https://rpc.testnet.near.org",
        appUrl: "https://testnet.linearprotocol.org",
      };
    default:
      throw Error(`Unconfigured environment '${network}'.`);
  }
}
const config = getConfig(context.networkId);
/** common lib end */

State.init({
  tabName: "stake", // stake | unstake
});

const Main = styled.div`
      color: white;
      width: 100%;
      height: 80vh;
      background: #09071f;
      padding: 20px;
  
      display: flex;
      justify-content: center;
      align-items: center;
      flex-direction: column
  `;

const updateTabName = (tabName) =>
  State.update({
    ...state,
    tabName,
  });

return (
  <Main>
    <Widget src="linear-builder.testnet/widget/LiNEAR.BrandLogo" />
    <Widget src="linear-builder.testnet/widget/LiNEAR.TitleAndDescription" />
    <Widget src="linear-builder.testnet/widget/LiNEAR.Apy" />
    <Widget
      src="linear-builder.testnet/widget/LiNEAR.Tab"
      props={{
        tabName: state.tabName,
        updateTabName,
      }}
    />
    {state.tabName === "stake" && (
      <Widget src="linear-builder.testnet/widget/LiNEAR.Stake" />
    )}
    {state.tabName === "unstake" && (
      <Widget src="linear-builder.testnet/widget/LiNEAR.Unstake" />
    )}
  </Main>
);
