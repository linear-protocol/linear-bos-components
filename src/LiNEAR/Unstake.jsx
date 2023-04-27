/** state init start */
State.init({
  inputValue: "",
  inputError: "",
  unstakeType: "instant", // instant | delayed
  showConfirmInstantUnstake: false,
  showConfirmDelayedUnstake: false,
});
/** state init end */

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
function getLinearBalance(accountId) {
  const linearBalanceRaw = Near.view(config.contractId, "ft_balance_of", {
    account_id: accountId,
  });
  if (!linearBalanceRaw) return "-";
  const balance = Big(linearBalanceRaw).div(Big(10).pow(LiNEAR_DECIMALS));
  return balance.lt(0) ? "0" : balance.toFixed(5, BIG_ROUND_DOWN);
}

const linearBalance = getLinearBalance(accountId);

const linearPrice = Big(
  Near.view(config.contractId, "ft_price", `{}`) ?? "0"
).div(Big(10).pow(24));
const nearPriceInLiNEAR = Big(1).div(linearPrice).toFixed(5);
/** events start */
const onChange = (e) => {
  // Has user signed in?
  if (!isSignedIn) {
    State.update({
      inputError: "Sign in please",
    });
    return;
  }
  const targetValue = e.target.value;
  if (targetValue !== "" && !targetValue.match(/^\d*(\.\d*)?$/)) {
    return;
  }
  let unstakeAmount = targetValue.replace(/^0+/, "0"); // remove prefix 0
  // limit 24 decimals
  const most24DecimalsPattern = /^-?\d+(\.\d{0,24})?/;
  let values = unstakeAmount.match(most24DecimalsPattern);
  if (values) {
    unstakeAmount = values[0];
  }
  if (
    linearBalance &&
    (isNaN(Number(unstakeAmount)) ||
      unstakeAmount === "" ||
      Big(unstakeAmount).lt(1) ||
      Big(unstakeAmount).gt(Big(linearBalance)))
  ) {
    if (
      isNaN(Number(unstakeAmount)) ||
      unstakeAmount === "" ||
      Big(unstakeAmount).lt(1)
    ) {
      State.update({
        inputValue: unstakeAmount,
        inputError: `Stake at least ${nearPriceInLiNEAR} LiNEAR`,
      });
    } else {
      State.update({
        inputValue: unstakeAmount,
        inputError: `Max is ${linearBalance} LiNEAR`,
      });
    }
    return;
  }
  State.update({
    inputValue: unstakeAmount,
    inputError: "",
  });
};

const onClickMax = () => {
  if (
    isNaN(Number(linearBalance)) ||
    linearBalance === "" ||
    Big(linearBalance).lt(nearPriceInLiNEAR)
  ) {
    State.update({
      inputValue: linearBalance,
      inputError: `Stake at least ${nearPriceInLiNEAR} NEAR`,
    });
    return;
  } else {
    State.update({
      inputValue: linearBalance,
      inputError: "",
    });
  }
};

const onClickUnstake = async () => {
  // const stakeAmount = state.inputValue;
  // if (
  //   nearBalance &&
  //   (isNaN(Number(stakeAmount)) ||
  //     stakeAmount === "" ||
  //     Big(stakeAmount).lt(1) ||
  //     Big(stakeAmount).gt(Big(nearBalance)))
  // ) {
  //   if (
  //     isNaN(Number(stakeAmount)) ||
  //     stakeAmount === "" ||
  //     Big(stakeAmount).lt(1)
  //   ) {
  //     State.update({ inputError: "Stake at least 1 NEAR" });
  //   } else if (Big(stakeAmount).gt(Big(nearBalance))) {
  //     State.update({
  //       inputError: `Max is ${nearBalance} NEAR`,
  //     });
  //   } else setInputError("");
  //   return;
  // }
  // Near.call(
  //   config.contractId,
  //   "deposit_and_stake",
  //   {},
  //   undefined,
  //   Big(state.inputValue).mul(Big(10).pow(NEAR_DECIMALS)).toFixed(0)
  // );
  // // check and update balance
  // const interval = setInterval(() => {
  //   const balance = getNearBalance(accountId);
  //   if (balance !== nearBalance) {
  //     clearInterval(interval);
  //     State.update({
  //       inputValue: "",
  //       inputError: "",
  //       nearBalance: balance,
  //     });
  //   }
  // }, 500);
};
/** events end */

const disabledStakeButton =
  !isValid(state.inputValue) || Big(state.inputValue).eq(0) || state.inputError;

const StakeFormWrapper = styled.div`
  width: 100%;
  max-width: 500px;
  padding: 20px;
  background: #0f0f31;
  border-radius: 10px;
`;

const UnstakeTabWrapper = styled.div`
  color: white;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 14px;

  margin-top: 20px;
`;

const UnstakeTab = styled.div`
  background: ${(props) => (props.select ? "#232363" : "transparent")};
  border: 2px solid #4f4fa7;
  border-radius:13px;
  padding: 20px;
  cursor: pointer;
`;

const UnstakeTabTitle = styled.div`
  font-size: 12px;
  font-weight: bold;
  display: flex;
  justify-content: space-between;
`;

const EstimateGetValue = styled.div`
  font-size: 12px;
  font-weight: bold;

  margin-top: 12px;
  margin-bottom: 48px;
`;

const UnstakeFee = styled.div`
  font-size: 14px;
  color: #899cce;
`;

return (
  <StakeFormWrapper>
    <Widget
      src="linear-builder.testnet/widget/LiNEAR.Input"
      props={{
        placeholder: "LiNEAR amount to unstake",
        value: state.inputValue,
        onChange,
        onClickMax,
        inputError: state.inputError,
        balance: `${linearBalance} LiNEAR`,
        iconName: "LiNEAR",
        iconUrl:
          "https://ipfs.near.social/ipfs/bafkreie2nqrjdjka3ckf4doocsrip5hwqrxh37jzwul2nyzeg3badfl2pm",
      }}
    />
    <Widget
      src="linear-builder.testnet/widget/LiNEAR.Button"
      props={{
        onClick: () => {
          if (state.unstakeType === "instant") {
            State.update({ ...state, showConfirmInstantUnstake: true });
          } else {
            State.update({ ...state, showConfirmDelayedUnstake: true });
          }
        },
        disabled: disabledStakeButton,
        text: "Unstake",
      }}
    />
    <UnstakeTabWrapper>
      <UnstakeTab
        select={state.unstakeType === "instant"}
        onClick={() => State.update({ ...state, unstakeType: "instant" })}
      >
        <UnstakeTabTitle>INSTANT UNSTAKE</UnstakeTabTitle>
        <EstimateGetValue>- NEAR</EstimateGetValue>
        <UnstakeFee>Unstake fee: 0.05%</UnstakeFee>
      </UnstakeTab>
      <UnstakeTab
        select={state.unstakeType === "delayed"}
        onClick={() => State.update({ ...state, unstakeType: "delayed" })}
      >
        <UnstakeTabTitle>DELAYED UNSTAKE ~2 DAYS</UnstakeTabTitle>
        <EstimateGetValue>- NEAR</EstimateGetValue>
        <UnstakeFee>Unstake fee: 0</UnstakeFee>
      </UnstakeTab>
    </UnstakeTabWrapper>
    {state.showConfirmInstantUnstake && (
      <Widget
        src="linear-builder.testnet/widget/LiNEAR.Modal.ConfirmInstantUnstake"
        props={{
          youWillReceive,
          onClickConfirm: onClickUnstake,
          onClickCancel: () =>
            State.update({ ...state, showConfirmInstantUnstake: false }),
        }}
      />
    )}
    {state.showConfirmDelayedUnstake && (
      <Widget
        src="linear-builder.testnet/widget/LiNEAR.Modal.ConfirmDelayedUnstake"
        props={{
          youWillReceive,
          onClickConfirm: onClickUnstake,
          onClickCancel: () =>
            State.update({ ...state, showConfirmDelayedUnstake: false }),
        }}
      />
    )}
  </StakeFormWrapper>
);
