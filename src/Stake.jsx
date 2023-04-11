State.init({
  inputValue: "",
  inputError: "",
});

const accountId = props.accountId || context.accountId;
const isSignedIn = !!accountId;
const NEAR_DECIMALS = 24;
const LiNEAR_CONTRACT_ID = "linear-protocol.near";

function getNearBalance(accountId) {
  const account = fetch("https://rpc.mainnet.near.org", {
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
  const availableBalance = new Big(amount || 0).minus(
    new Big(storage_usage).mul(new Big(10).pow(19))
  );
  const balance = availableBalance
    .div(new Big(10).pow(NEAR_DECIMALS))
    .minus(COMMON_MIN_BALANCE);
  return balance.lt(0) ? "0" : balance.toFixed(5);
}

function getAPY() {
  const result = fetch("https://metrics.linearprotocol.org", {
    method: "GET",
  });
  const apy = result.body.apy;
  if (!apy) return "-";
  return Big(apy).mul(100).toFixed(2) + "%";
}

const apy = getAPY();
const nearBalance = getNearBalance(accountId);

function isValid(a) {
  if (!a) return false;
  if (isNaN(Number(a))) return false;
  if (a === "") return false;
  return true;
}

const Title = styled.h1`
      font-size: 40px;
      font-weight: bold;
  `;

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

const Description = styled.div`
      font-size: 14px;
      color: #999999;
      margin-top: 5px;
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
const StakeButton = styled.button`
      border: none;
      color: white;
      width: 100%;
      border-radius: 10px;
      font-size: 20px;
      font-weight: bold;
      overflow: hidden;
      padding: 8px 0;
  
      background-size: 100%;
      background-image: linear-gradient(180deg, #5561ff 0%, #3643fc 100%, #3643fc 100%);
      position: relative;
      z-index: 0;
      &:disabled {
          background: #1C2056;
          color: #3D47D6;
      }
      &:before {
          background-image: linear-gradient(180deg, #4954f2 0%, #2029a7 100%);
          content: "";
          display: block;
          height: 100%;
          position: absolute;
          top: 0;
          left: 0;
          opacity: 0;
          width: 100%;
          z-index: -100;
          transition: opacity 0.6s;
      }
      &:hover:before {
          opacity: ${disabledStakeButton ? "0" : "1"};
      }
  `;

const InputWrapper = styled.div`
      width: 100%;
      border-radius: 10px;
      background: #0d0d2b;
      padding: 20px;
      margin-bottom: 20px;
  `;

const HorizentalLine = styled.hr`
      height: 1px;
      border: none;
      background: white;
      opacity: 0.1;
      margin-top: 16px;
      margin-bottom: 8px;
  `;

const BalanceContainer = styled.div`
      color: #c1c1c1;
      font-size: 14px;
      display: flex;
      justify-content: space-between;
      .error {
          color: #ec6868;
      }
  `;

const APYContainer = styled.div`
      font-size: 20px;
      margin: 12px 0;
      span {
          margin-left: 12px;
          font-weight: bold;
      }
  `;

const NEARInputContainer = styled.div`
  display: flex;
  justify-content: space-between;
`;

const NEARIcon = () => (
  <img
    src={`https://ipfs.near.social/ipfs/bafkreid5xjykpqdvinmj432ldrkbjisrp3m4n25n4xefd32eml674ypqly`}
    width={26}
    height={26}
    alt="NEAR Icon"
  />
);

const NEARTexture = styled.div`
  font-size: 24px;
  font-weight: bold;
  margin-left: 10px;
`;

const LogoWithText = styled.div`
  display: flex;
  align-items: center;
`;

const NEARInputComp = ({ value, onChange, error }) => (
  <input
    style={{
      "text-align": "right",
      width: "100%",
      background: "transparent",
      border: "0",
      "font-size": "16px",
      "font-weight": "bold",
      color: error ? "#ec6868" : "white",
      outline: "none",
      "box-shadow": "none",
      "margin-right": "16px",

      "-webkit-appearance": "none",
      "-moz-appearance": "textfield",
    }}
    placeholder="NEAR amount to stake"
    value={value}
    onChange={onChange}
  />
);

const MaxTexture = styled.div`
  font-size: 24px;
  color: #4451FD;
  cursor: pointer;
`;

const NEARInput = ({ value, onChange, onClickMax }) => {
  return (
    <NEARInputContainer>
      <LogoWithText>
        <NEARIcon />
        <NEARTexture>NEAR</NEARTexture>
      </LogoWithText>
      <NEARInputComp
        value={value}
        onChange={onChange}
        error={state.inputError}
      />
      <MaxTexture onClick={onClickMax}>MAX</MaxTexture>
    </NEARInputContainer>
  );
};

return (
  <Main>
    <Title>Stake Your NEAR</Title>
    <Description>
      Stake NEAR and receive LiNEAR while earning staking rewards
    </Description>
    <APYContainer>
      APY <span>{apy}</span>
    </APYContainer>
    <StakeFormWrapper>
      <InputWrapper>
        <NEARInput
          value={state.inputValue}
          onChange={(e) => {
            const stakeAmount = e.target.value;
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
                  ...state,
                  inputValue: stakeAmount,
                  inputError: "Stake at least 1 NEAR",
                });
              } else if (Big(stakeAmount).gt(Big(nearBalance))) {
                State.update({
                  ...state,
                  inputValue: stakeAmount,
                  inputError: `Max is ${nearBalance} NEAR`,
                });
              } else {
                State.update({
                  ...state,
                  inputValue: stakeAmount,
                  inputError: "",
                });
              }
              return;
            }
            State.update({
              ...state,
              inputValue: e.target.value,
              inputError: "",
            });
          }}
          onClickMax={() => {
            State.update({ ...state, inputValue: nearBalance, inputError: "" });
          }}
        />
        <HorizentalLine />
        <BalanceContainer>
          <p>Balance: {nearBalance} NEAR</p>
          <p className="error">{state.inputError}</p>
        </BalanceContainer>
      </InputWrapper>
      <StakeButton
        disabled={disabledStakeButton}
        onClick={async () => {
          const stakeAmount = state.inputValue;
          if (
            nearBalance &&
            (isNaN(Number(stakeAmount)) ||
              stakeAmount === "" ||
              new Big(stakeAmount).lt(1) ||
              new Big(stakeAmount).gt(new Big(nearBalance)))
          ) {
            if (
              isNaN(Number(stakeAmount)) ||
              stakeAmount === "" ||
              new Big(stakeAmount).lt(1)
            ) {
              State.update({ ...state, inputError: "Stake at least 1 NEAR" });
            } else if (Big(stakeAmount).gt(Big(nearBalance))) {
              State.update({
                ...state,
                inputError: `Max is ${nearBalance} NEAR`,
              });
            } else setInputError("");
            return;
          }
          Near.call(
            LiNEAR_CONTRACT_ID,
            "deposit_and_stake",
            {},
            undefined,
            new Big(state.inputValue)
              .mul(new Big(10).pow(NEAR_DECIMALS))
              .toFixed(0)
          );
        }}
      >
        Stake
      </StakeButton>
    </StakeFormWrapper>
  </Main>
);
