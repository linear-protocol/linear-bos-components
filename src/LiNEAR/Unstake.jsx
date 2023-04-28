/** state init start */
State.init({
  unstakeMax: false,
  inputValue: "",
  inputError: "",
  unstakeType: "instant", // instant | delayed
  showConfirmInstantUnstake: false,
  showConfirmDelayedUnstake: false,
  swapEstimate: {},
  swapAmountIn: "",
  swapAmountOut: "",
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
const nearPriceInLiNEAR = linearPrice.eq(0)
  ? "1"
  : Big(1).div(linearPrice).toFixed(5);

function getReceivedDelayedUnstakeNear() {
  const { unstakeMax, inputValue } = state;
  if (!isValid(linearBalance) || !isValid(inputValue)) {
    return "-";
  }
  const delayedUnstakeLiNear = unstakeMax ? linearBalance : inputValue;
  const _delayedUnstakeNear = Big(delayedUnstakeLiNear)
    .times(linearPrice)
    .toFixed(5);
  return _delayedUnstakeNear;
}

function getReceivedInstantUnstakeNear() {
  const { inputValue, swapAmountOut } = state;
  if (
    !isValid(linearBalance) ||
    !isValid(inputValue) ||
    !isValid(swapAmountOut)
  ) {
    return "-";
  }
  return Big(swapAmountOut).toFixed(5);
}

const receivedDelayedUnstakeNear = getReceivedDelayedUnstakeNear();
const receivedInstantUnstakeNear = getReceivedInstantUnstakeNear();
const UNSTAKE_DIFF_ERROR_RATIO = 0.05;
const IMPACT_TOO_HIGH_ERROR = "Price impact high. Unstake less or try later";
if (
  !state.inputError &&
  isValid(receivedDelayedUnstakeNear) &&
  isValid(receivedInstantUnstakeNear) &&
  state.inputValue === state.swapAmountIn && // compare received NEAR only if the input amounts matches
  Big(receivedDelayedUnstakeNear)
    .minus(receivedInstantUnstakeNear)
    .div(receivedDelayedUnstakeNear)
    .gt(UNSTAKE_DIFF_ERROR_RATIO)
) {
  State.update({
    ...state,
    inputError: IMPACT_TOO_HIGH_ERROR,
  });
} else if (
  state.inputError === IMPACT_TOO_HIGH_ERROR &&
  isValid(receivedDelayedUnstakeNear) &&
  isValid(receivedInstantUnstakeNear) &&
  state.inputValue === state.swapAmountIn &&
  Big(receivedDelayedUnstakeNear)
    .minus(receivedInstantUnstakeNear)
    .div(receivedDelayedUnstakeNear)
    .lte(UNSTAKE_DIFF_ERROR_RATIO)
) {
  State.update({
    ...state,
    inputError: "",
  });
}

/** events start */
const onChange = (e) => {
  // Has user signed in?
  if (!isSignedIn) {
    State.update({
      ...state,
      unstakeMax: false,
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
      Big(unstakeAmount).lt(nearPriceInLiNEAR) ||
      Big(unstakeAmount).gt(Big(linearBalance)))
  ) {
    if (
      isNaN(Number(unstakeAmount)) ||
      unstakeAmount === "" ||
      Big(unstakeAmount).lt(nearPriceInLiNEAR)
    ) {
      State.update({
        ...state,
        unstakeMax: false,
        onClickMax: false,
        inputValue: unstakeAmount,
        inputError: `Stake at least ${nearPriceInLiNEAR} LiNEAR`,
      });
    } else {
      State.update({
        ...state,
        unstakeMax: false,
        onClickMax: false,
        inputValue: unstakeAmount,
        inputError: `Max is ${linearBalance} LiNEAR`,
      });
    }
    return;
  }
  State.update({
    ...state,
    unstakeMax: false,
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
      ...state,
      unstakeMax: true,
      inputValue: linearBalance,
      inputError: `Stake at least ${nearPriceInLiNEAR} NEAR`,
    });
    return;
  } else {
    State.update({
      ...state,
      unstakeMax: true,
      inputValue: linearBalance,
      inputError: "",
    });
  }
};

const onClickUnstake = async () => {
  const { inputValue, unstakeMax, unstakeType, swapAmountOut } = state;
  const amount = Big(inputValue)
    .times(linearPrice)
    .times(Big(10).pow(LiNEAR_DECIMALS))
    .toFixed(0);

  if (unstakeType === "instant") {
    callRefSwapTx(
      TOKEN_LINEAR,
      TOKEN_NEAR,
      inputValue,
      swapAmountOut,
      SLIPPAGE_TOLERANCE
    );
  } else {
    if (unstakeMax) {
      Near.call(config.contractId, "unstake_all", {});
    } else {
      Near.call(config.contractId, "unstake", {
        amount,
      });
    }
  }
};

// Ref swap constants and functions

// token in and token out of swap
const TOKEN_LINEAR = { id: config.contractId, decimals: LiNEAR_DECIMALS };
const TOKEN_NEAR = { id: "NEAR", decimals: NEAR_DECIMALS };
const SLIPPAGE_TOLERANCE = 0.05;

const REF_EXCHANGE_CONTRACT_ID =
  context.networkId === "mainnet"
    ? "v2.ref-finance.near"
    : "ref-finance-101.testnet";
const WNEAR_CONTRACT_ID =
  context.networkId === "mainnet" ? WNEAR_CONTRACT_ID : "wrap.testnet";

// Forked from weige.near/widget/ref-swap
const registered = Near.view(WNEAR_CONTRACT_ID, "storage_balance_of", {
  account_id: accountId,
});

const expandToken = (value, decimals) => {
  return new Big(value).mul(new Big(10).pow(decimals));
};

const callRefSwapTx = (
  tokenIn,
  tokenOut,
  amountIn,
  amountOut,
  slippageTolerance
) => {
  const tx = [];

  const nearDeposit = {
    contractName: WNEAR_CONTRACT_ID,
    methodName: "near_deposit",
    deposit: expandToken(amountIn, 24).toFixed(),
    gas: expandToken(50, 12),
  };
  const nearWithdraw = {
    contractName: WNEAR_CONTRACT_ID,
    methodName: "near_withdraw",
    deposit: new Big("1").toFixed(),
    args: {
      amount: expandToken(amountIn, 24).toFixed(),
    },
  };

  if (state.swapEstimate.pool === "wrap") {
    if (tokenIn.id === "NEAR") {
      tx.push(nearDeposit);
    } else {
      tx.push(nearWithdraw);
    }

    return Near.call(tx);
  }

  if (registered === null) {
    tx.push({
      contractName: tokenOut.id === "NEAR" ? WNEAR_CONTRACT_ID : tokenOut.id,
      methodName: "storage_deposit",
      deposit: expandToken(0.1, 24).toFixed(),
      gas: expandToken(50, 12),
      args: {
        registration_only: true,
        account_id: accountId,
      },
    });
  }

  if (tokenIn.id === "NEAR") {
    tx.push(nearDeposit);
  }

  const minAmountOut = expandToken(
    new Big(amountOut)
      .mul(1 - Number(slippageTolerance) / 100)
      .toFixed(tokenOut.decimals, 0),
    tokenOut.decimals
  ).toFixed();

  tx.push({
    methodName: "ft_transfer_call",
    contractName: tokenIn.id === "NEAR" ? WNEAR_CONTRACT_ID : tokenIn.id,
    gas: expandToken(180, 12),
    deposit: new Big("1").toFixed(),
    args: {
      receiver_id: REF_EXCHANGE_CONTRACT_ID,
      amount: expandToken(amountIn, tokenIn.decimals).toFixed(0, 0),
      msg: JSON.stringify({
        actions: [
          {
            pool_id: Number(state.swapEstimate.pool.id),
            token_in: tokenIn.id === "NEAR" ? WNEAR_CONTRACT_ID : tokenIn.id,
            token_out: tokenOut.id === "NEAR" ? WNEAR_CONTRACT_ID : tokenOut.id,
            amount_in: expandToken(amountIn, tokenIn.decimals).toFixed(0, 0),
            min_amount_out: minAmountOut,
          },
        ],
      }),
    },
  });

  if (tokenOut.id === "NEAR") {
    tx.push({
      contractName: WNEAR_CONTRACT_ID,
      methodName: "near_withdraw",
      deposit: new Big("1").toFixed(),
      args: {
        amount: minAmountOut,
      },
    });
  }

  Near.call(tx);
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
  border-radius: 13px;
  padding: 20px;
  cursor: pointer;
`;

const UnstakeTabTitle = styled.div`
  font-size: 12px;
  font-weight: bold;
  display: flex;
  justify-content: space-between;
  height: 16px;
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
    <div style={{ display: "none" }}>
      <Widget
        src="linear-builder.testnet/widget/Ref.ref-swap-getEstimate"
        props={{
          tokenIn: TOKEN_LINEAR,
          tokenOut: TOKEN_NEAR,
          amountIn: state.inputValue || 0,
          loadRes: (value) => {
            State.update({
              swapEstimate: value,
              swapAmountIn: value === null ? "" : value.amountIn,
              swapAmountOut: value === null ? "" : value.estimate,
            });
          },
        }}
      />
    </div>
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
            if (
              state.swapAmountOut &&
              // proceed with instant unstake only if the input amounts matches
              state.inputValue === state.swapAmountIn
            ) {
              State.update({ ...state, showConfirmInstantUnstake: true });
            } else {
              State.update({
                inputError:
                  "Instant unstake received NEAR estimation is loading. Please wait or try again.",
              });
            }
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
        <UnstakeTabTitle>
          <p>INSTANT UNSTAKE</p>
          <Widget
            src="linear-builder.testnet/widget/LiNEAR.Tooltip"
            props={{
              message:
                "The slippage and fee of instant unstake is based on the LiNEAR/wNEAR StableSwap pool on Ref",
            }}
          />
        </UnstakeTabTitle>
        <EstimateGetValue>{receivedInstantUnstakeNear} NEAR</EstimateGetValue>
        <UnstakeFee>Unstake fee: 0.05%</UnstakeFee>
      </UnstakeTab>
      <UnstakeTab
        select={state.unstakeType === "delayed"}
        onClick={() => State.update({ ...state, unstakeType: "delayed" })}
      >
        <UnstakeTabTitle>DELAYED UNSTAKE ~2 DAYS</UnstakeTabTitle>
        <EstimateGetValue>{receivedDelayedUnstakeNear} NEAR</EstimateGetValue>
        <UnstakeFee>Unstake fee: 0</UnstakeFee>
      </UnstakeTab>
    </UnstakeTabWrapper>
    {state.showConfirmInstantUnstake && (
      <Widget
        src="linear-builder.testnet/widget/LiNEAR.Modal.ConfirmInstantUnstake"
        props={{
          youWillReceive: receivedInstantUnstakeNear,
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
          youWillReceive: receivedDelayedUnstakeNear,
          onClickConfirm: onClickUnstake,
          onClickCancel: () =>
            State.update({ ...state, showConfirmDelayedUnstake: false }),
        }}
      />
    )}
  </StakeFormWrapper>
);
