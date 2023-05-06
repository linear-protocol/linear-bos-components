const ONE_MICRO_NEAR = "1000000000000000000";
const YOCTONEAR = "1000000000000000000000000";
const NEAR_DECIMALS = 24;
const BIG_ROUND_DOWN = 0;

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

const MyAccountCardGroupWrapper = styled.div`
  border-radius: 15px;
  background: #12123f;

  padding: 24px 20px;
  width: 100%;
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

const NearIcon = () => (
  <img
    src="https://ipfs.near.social/ipfs/bafkreid5xjykpqdvinmj432ldrkbjisrp3m4n25n4xefd32eml674ypqly"
    width={20}
    height={20}
    alt="NEAR Icon"
  />
);

const LiNEARIcon = () => (
  <img
    src="https://ipfs.near.social/ipfs/bafkreie2nqrjdjka3ckf4doocsrip5hwqrxh37jzwul2nyzeg3badfl2pm"
    width={20}
    height={20}
    alt="LiNEAR Icon"
  />
);

const HorizontalLine = () => (
  <hr
    style={{
      width: "100%",
      background: "black",
      border: "0",
      height: "1px",
      borderRadius: "9999px",
    }}
  />
);

const {
  updatePage,
  updateTabName,
  config,
  nearBalance,
  linearBalance,
  account,
} = props;
if (!config) {
  return "Component not be loaded. Missing `config` props";
}

State.init({
  data: {},
});

function onLoad(data) {
  State.update({ data });
}

function isValid(a) {
  if (!a) return false;
  if (isNaN(Number(a))) return false;
  if (a === "") return false;
  return true;
}

function formatAmount(a) {
  return isValid(a)
    ? Number(a).toLocaleString(undefined, {
        minimumFractionDigits: 5,
        maximumFractionDigits: 5,
      })
    : a;
}

function formatDate(timestamp) {
  const d = new Date(timestamp);
  return [
    d.getFullYear(),
    ("0" + (d.getMonth() + 1)).slice(-2),
    ("0" + d.getDate()).slice(-2),
  ].join("/");
}

const data = state.data || {};
const stakingRewards = data.stakingRewards
  ? formatAmount(
      Big(data.stakingRewards).div(Big(10).pow(NEAR_DECIMALS)).toFixed(5)
    )
  : "-";
const firstStakingTime = data.firstStakingTime
  ? formatDate(data.firstStakingTime)
  : "-";

return (
  <Main>
    <Widget
      src={`${config.ownerId}/widget/LiNEAR.Data`}
      props={{ config, onLoad }}
    />
    <Widget src={`${config.ownerId}/widget/LiNEAR.Navigation`} />
    <MyAccountTitle>My Account</MyAccountTitle>
    <MyAccountContent>
      <MyAccountCardWrapper>
        <div>
          <TokenValue>
            <div>{nearBalance}</div>
            <NearIcon />
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
            <div>{linearBalance}</div>
            <LiNEARIcon />
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
            <div>{stakingRewards}</div>
            <NearIcon />
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
          <div>Staking rewards since {firstStakingTime}</div>
        </RewardsFinishedTime>
      </MyAccountCardWrapper>

      {account &&
        account.unstaked_balance &&
        Big(account.unstaked_balance).gte(ONE_MICRO_NEAR) && (
          <MyAccountCardGroupWrapper style={{ marginTop: "10px" }}>
            <div>
              <TokenValue>
                <div>
                  {account.unstaked_balance
                    ? Big(account.unstaked_balance).div(YOCTONEAR).toFixed(5)
                    : "-"}
                </div>
                <NearIcon />
              </TokenValue>
              <GrayContent>Pending Unstake</GrayContent>
            </div>
            <HorizontalLine />
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <div>
                <TokenValue>
                  <div>Unstake is Ready</div>
                  {/* <div>14.55128</div>
            <NearIcon /> */}
                </TokenValue>
                <GrayContent>Remaining</GrayContent>
              </div>
              <div style={{ width: "130px" }}>
                <Widget
                  src={`${config.ownerId}/widget/LiNEAR.Button`}
                  props={{
                    onClick: () => {
                      // onClick withdraw
                    },
                    text: "Withdraw",
                    size: "base",
                    full: "full",
                  }}
                />
              </div>
            </div>
          </MyAccountCardGroupWrapper>
        )}
      <div style={{ marginTop: "16px" }}>
        <Widget
          src={`${config.ownerId}/widget/LiNEAR.Button`}
          props={{
            onClick: () => {
              Near.call(config.contractId, "ft_transfer", {
                receiver_id: accountId,
                amount: "0",
                memo: "Add LiNEAR to NEAR Web Wallet",
              });
            },
            text: "Add LiNEAR to NEAR Web Wallet",
            padding: "large",
          }}
        />
      </div>
    </MyAccountContent>
  </Main>
);
