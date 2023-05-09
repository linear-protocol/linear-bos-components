// MIT License: https://github.com/linear-protocol/linear-bos-components/blob/main/LICENSE

const accountId = props.accountId || context.accountId;
const ONE_MICRO_NEAR = "1000000000000000000";
const YOCTO_NEAR = "1000000000000000000000000";
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
  config,
  nearBalance,
  linearBalance,
  unstakeInfo,
  updatePage,
  updateTabName,
  updateAccountInfo,
} = props;
if (!config) {
  return "Component cannot be loaded. Missing `config` props";
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

function formatDateTime(timestamp) {
  const d = new Date(timestamp);
  const time = [
    ("0" + d.getHours()).slice(-2),
    ("0" + d.getMinutes()).slice(-2),
    ("0" + d.getSeconds()).slice(-2),
  ].join(":");
  return formatDate(timestamp) + " " + time;
}

const data = (accountId && state.data) || {};
const stakingRewards = data.stakingRewards
  ? formatAmount(
      Math.max(
        Big(data.stakingRewards, 0).div(Big(10).pow(NEAR_DECIMALS)).toFixed(5),
        0
      )
    )
  : "-";
const firstStakingTime = data.firstStakingTime
  ? formatDate(data.firstStakingTime)
  : undefined;

const formattedLinearBalance =
  !linearBalance || linearBalance === "-"
    ? "-"
    : Big(linearBalance).toFixed(5, BIG_ROUND_DOWN);

const endTime = unstakeInfo.endTime || {};

const onClickWithdraw = () => {
  Near.call(config.contractId, "withdraw_all", {});

  // update account balances
  if (updateAccountInfo) {
    updateAccountInfo();
  }
};

return (
  <Main>
    <Widget
      src={`${config.ownerId}/widget/LiNEAR.Data.Stake`}
      props={{ config, onLoad }}
    />
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
            src={`${config.ownerId}/widget/LiNEAR.Element.Button`}
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
            <div>{formattedLinearBalance}</div>
            <LiNEARIcon />
          </TokenValue>
          <GrayContent>Your LiNEAR Tokens</GrayContent>
        </div>
        <div style={{ width: "130px" }}>
          <Widget
            src={`${config.ownerId}/widget/LiNEAR.Element.Button`}
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

      {firstStakingTime && (
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
              src={`${config.ownerId}/widget/LiNEAR.Element.Tooltip`}
              props={{
                message:
                  "Staking rewards are included in the LiNEAR price. LiNEAR price increases every epoch (12~15 hours).",
              }}
            />
            <div>Staking rewards since {firstStakingTime}</div>
          </RewardsFinishedTime>
        </MyAccountCardWrapper>
      )}

      {unstakeInfo &&
        unstakeInfo.amount &&
        Big(unstakeInfo.amount).gte(ONE_MICRO_NEAR) && (
          <MyAccountCardGroupWrapper style={{ marginTop: "10px" }}>
            <div>
              <TokenValue>
                <div>
                  {unstakeInfo.amount
                    ? Big(unstakeInfo.amount).div(YOCTO_NEAR).toFixed(5)
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
                  {endTime.ready && <div>Unstake is Ready</div>}
                  {!endTime.ready && endTime.remainingHours && (
                    <div>~{endTime.remainingHours} hours</div>
                  )}
                </TokenValue>
                <GrayContent>Remaining</GrayContent>
              </div>
              <div style={{ width: "130px" }}>
                <Widget
                  src={`${config.ownerId}/widget/LiNEAR.Element.Button`}
                  props={{
                    onClick: onClickWithdraw,
                    disabled: !endTime.ready,
                    text: "Withdraw",
                    size: "base",
                    full: "full",
                  }}
                />
              </div>
            </div>
            {endTime.timestamp && (
              <>
                <HorizontalLine />
                <div>
                  <div>
                    <TokenValue>
                      <div>{formatDateTime(endTime.timestamp)}</div>
                    </TokenValue>
                    <GrayContent>Withdrawal will be available</GrayContent>
                  </div>
                </div>
              </>
            )}
          </MyAccountCardGroupWrapper>
        )}
    </MyAccountContent>
  </Main>
);
