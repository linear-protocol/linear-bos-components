/** state init start */
State.init({
  inputValue: "",
  inputError: "",
});
/** state init end */

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
  let stakeAmount = targetValue.replace(/^0+/, "0"); // remove prefix 0
  // limit 24 decimals
  const most24DecimalsPattern = /^-?\d+(\.\d{0,24})?/;
  let values = stakeAmount.match(most24DecimalsPattern);
  if (values) {
    stakeAmount = values[0];
  }
  if (
    nearBalance &&
    (isNaN(Number(stakeAmount)) ||
      stakeAmount === "" ||
      Big(stakeAmount).lt(1) ||
      Big(stakeAmount).gt(Big(nearBalance)))
  ) {
    if (
      isNaN(Number(stakeAmount)) ||
      stakeAmount === "" ||
      Big(stakeAmount).lt(1)
    ) {
      State.update({
        inputValue: stakeAmount,
        inputError: "Stake at least 1 NEAR",
      });
    } else {
      State.update({
        inputValue: stakeAmount,
        inputError: `Max is ${nearBalance} NEAR`,
      });
    }
    return;
  }
  State.update({
    inputValue: stakeAmount,
    inputError: "",
  });
};

const onClickMax = () => {
  if (
    isNaN(Number(nearBalance)) ||
    nearBalance === "" ||
    Big(nearBalance).lt(1)
  ) {
    State.update({
      inputValue: nearBalance,
      inputError: "Stake at least 1 NEAR",
    });
    return;
  } else {
    State.update({
      inputValue: nearBalance,
      inputError: "",
    });
  }
};

const onClickStake = async () => {
  const stakeAmount = state.inputValue;
  if (
    nearBalance &&
    (isNaN(Number(stakeAmount)) ||
      stakeAmount === "" ||
      Big(stakeAmount).lt(1) ||
      Big(stakeAmount).gt(Big(nearBalance)))
  ) {
    if (
      isNaN(Number(stakeAmount)) ||
      stakeAmount === "" ||
      Big(stakeAmount).lt(1)
    ) {
      State.update({ inputError: "Stake at least 1 NEAR" });
    } else if (Big(stakeAmount).gt(Big(nearBalance))) {
      State.update({
        inputError: `Max is ${nearBalance} NEAR`,
      });
    } else setInputError("");
    return;
  }
  Near.call(
    config.contractId,
    "deposit_and_stake",
    {},
    undefined,
    Big(state.inputValue).mul(Big(10).pow(NEAR_DECIMALS)).toFixed(0)
  );
  // check and update balance
  const interval = setInterval(() => {
    const balance = getNearBalance(accountId);
    if (balance !== nearBalance) {
      clearInterval(interval);
      State.update({
        inputValue: "",
        inputError: "",
        nearBalance: balance,
      });
    }
  }, 500);
};
/** events end */

const disabledStakeButton =
  !isValid(state.inputValue) || Big(state.inputValue).eq(0) || state.inputError;

const linearPrice = Big(
  Near.view(config.contractId, "ft_price", `{}`) ?? "0"
).div(Big(10).pow(24));

const youWillReceive = (
  linearPrice.lte(0)
    ? Big(0)
    : Big(isValid(state.inputValue) ? state.inputValue : 0).div(linearPrice)
).toFixed(5, BIG_ROUND_DOWN);

const StakeFormWrapper = styled.div`
    width: 100%;
    max-width: 500px;
    padding: 20px;
    background: #0f0f31;
    border-radius: 10px;
`;

return (
  <StakeFormWrapper>
    <Widget
      src="linear-builder.testnet/widget/LinearInput"
      props={{
        placeholder: "NEAR amount to stake",
        value: state.inputValue,
        onChange,
        onClickMax,
        inputError: state.inputError,
        nearBalance,
      }}
    />
    <Widget
      src="linear-builder.testnet/widget/LinearButton"
      props={{
        onClick: onClickStake,
        disabled: disabledStakeButton,
        text: "Stake",
      }}
    />
    <Widget
      src="linear-builder.testnet/widget/YouWillReceive"
      props={{ text: `${youWillReceive} LiNEAR` }}
    />
  </StakeFormWrapper>
);
