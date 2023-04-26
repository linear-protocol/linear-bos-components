const accountId = props.accountId || context.accountId;
const isSignedIn = !!accountId;
const NEAR_DECIMALS = 24;
const BIG_ROUND_DOWN = 0;

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

State.init({
  inputValue: "",
  inputError: "",
  nearBalance: getNearBalance(accountId),
  tabName: "stake", // stake | unstake
});
const nearBalance =
  !state.nearBalance || state.nearBalance === "-"
    ? getNearBalance(accountId)
    : state.nearBalance;

function isValid(a) {
  if (!a) return false;
  if (isNaN(Number(a))) return false;
  if (a === "") return false;
  return true;
}

const linearPrice = Big(
  Near.view(config.contractId, "ft_price", `{}`) ?? "0"
).div(Big(10).pow(24));
const youWillReceive = (
  linearPrice.lte(0)
    ? Big(0)
    : Big(isValid(state.inputValue) ? state.inputValue : 0).div(linearPrice)
).toFixed(5, BIG_ROUND_DOWN);

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

const StakeFormWrapper = styled.div`
      width: 100%;
      max-width: 500px;
      padding: 20px;
      background: #0f0f31;
      border-radius: 10px;
  `;

const disabledStakeButton =
  !isValid(state.inputValue) || Big(state.inputValue).eq(0) || state.inputError;

const FooterLink = styled.a`
    color: #4451FD;
    text-decoration: underline;
    transition: all 0.2s ease-in-out;
    margin-top: 12px;
    text-underline-offset: 3px;
`;

const TabContainer = styled.div`
    display: flex;
    justify-content: center;
    align-items: center;
    margin-bottom: 20px;
    background: #2e2c44;
    border-radius: 9999px;

    padding: 4px;
`;

const TabItem = styled.div`
    display: flex;
    justify-content: center;
    align-items: center;
    height: 40px;
    width: 128px;
    border-radius: 9999px;

    font-size: 18px;
    font-weight: bold;
    cursor: pointer;

    transition: all 0.3s ease-in-o
`;

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
return (
  <Main>
    <Widget src="linear-builder.testnet/widget/BrandLogo" />
    <Widget src="linear-builder.testnet/widget/TitleAndDescription" />
    <Widget src="linear-builder.testnet/widget/Apy" />
    <TabContainer>
      <TabItem
        style={{
          background: state.tabName === "stake" ? "#5137ee" : "transparent",
        }}
        onClick={() =>
          State.update({
            ...state,
            tabName: "stake",
          })
        }
      >
        Stake
      </TabItem>
      <TabItem
        style={{
          background: state.tabName === "unstake" ? "#5137ee" : "transparent",
        }}
        onClick={() =>
          State.update({
            ...state,
            tabName: "unstake",
          })
        }
      >
        Unstake
      </TabItem>
    </TabContainer>
    {state.tabName === "stake" && (
      <StakeFormWrapper>
        <Widget
          src="linear-builder.testnet/widget/LinearInput"
          props={{
            placeholder: "NEAR amount to stake",
            value: state.inputValue,
            onChange,
            onClickMax,
            inputError: state.inputError,
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
    )}
    <FooterLink href={`${config.appUrl}/?tab=unstake`} target="_blank">
      Unstake <strong>$LiNEAR</strong>
    </FooterLink>
  </Main>
);
