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

const MyAccountTitle = styled.h1`
  font-size: 40px;
  font-weight: bold;
  margin-bottom: 40px;
`;

const MyAccountContent = styled.div`
  width: 100%;
  max-width: 540px;
`;

const MyAccountCardWrapper = styled.div`
  border-radius: 15px;
  background: #12123f;

  padding: 24px 20px;
  width: 100%;
  display: flex;
  justify-content: space-between;
`;

const TokenValue = styled.div`
  font-size: 22px;
  font-weight: bold;
  display: flex;
  align-items: center;
  img {
    margin-left: 8px;
  }
`;

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

const GrayContent = styled.div`
  color: #939395;
  font-size: 14px;
`;

const RewardsFinishedTime = styled.div`
  font-size: 12px;
  div {
    margin-top: 10px;
  }
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: flex-end;
`;

const { updatePage, updateTabName } = props;
return (
  <Main>
    <Widget src={`${config.ownerId}/widget/LiNEAR.Navigation`} />
    <MyAccountTitle>My Account</MyAccountTitle>
    <MyAccountContent>
      <MyAccountCardWrapper>
        <div>
          <TokenValue>
            <div>9.79920</div>
            <img
              src="https://ipfs.near.social/ipfs/bafkreid5xjykpqdvinmj432ldrkbjisrp3m4n25n4xefd32eml674ypqly"
              width={20}
              height={20}
              alt="NEAR Icon"
            />
          </TokenValue>
          <GrayContent>Available NEAR in Wallet</GrayContent>
        </div>
        <div style={{ width: "130px" }}>
          <Widget
            src={`${config.ownerId}/widget/LiNEAR.Button`}
            props={{
              onClick: () => {
                updatePage("stake");
                updateTabName("stake");
              },
              text: "Stake",
              size: "base",
              full: "full",
            }}
          />
        </div>
      </MyAccountCardWrapper>

      <MyAccountCardWrapper style={{ marginTop: "10px" }}>
        <div>
          <TokenValue>
            <div>9.79920</div>
            <img
              src="https://ipfs.near.social/ipfs/bafkreie2nqrjdjka3ckf4doocsrip5hwqrxh37jzwul2nyzeg3badfl2pm"
              width={20}
              height={20}
              alt="LiNEAR Icon"
            />
          </TokenValue>
          <GrayContent>Your LiNEAR Tokens</GrayContent>
        </div>
        <div style={{ width: "130px" }}>
          <Widget
            src={`${config.ownerId}/widget/LiNEAR.Button`}
            props={{
              onClick: () => {
                updatePage("stake");
                updateTabName("unstake");
              },
              text: "Unstake",
              size: "base",
              full: "full",
            }}
          />
        </div>
      </MyAccountCardWrapper>
      <MyAccountCardWrapper style={{ marginTop: "10px" }}>
        <div>
          <GrayContent>Staking Rewards</GrayContent>
          <TokenValue>
            <div>9.79920</div>
            <img
              src="https://ipfs.near.social/ipfs/bafkreid5xjykpqdvinmj432ldrkbjisrp3m4n25n4xefd32eml674ypqly"
              width={20}
              height={20}
              alt="NEAR Icon"
            />
          </TokenValue>
        </div>
        <RewardsFinishedTime>
          <Widget
            src={`${config.ownerId}/widget/LiNEAR.Tooltip`}
            props={{
              message:
                "Staking rewards are included in the LiNEAR price. LiNEAR price increases every epoch (12~15 hours).",
            }}
          />
          <div>Staking rewards since 2022/04/18</div>
        </RewardsFinishedTime>
      </MyAccountCardWrapper>
      <div style={{ marginTop: "16px" }}>
        <Widget
          src={`${config.ownerId}/widget/LiNEAR.Button`}
          props={{
            onClick: () => {
              // todos
            },
            text: "Add LiNEAR to NEAR Web Wallet",
            padding: "large",
          }}
        />
      </div>
    </MyAccountContent>
  </Main>
);
