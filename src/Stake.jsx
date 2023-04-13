const accountId = props.accountId || context.accountId;
const isSignedIn = !!accountId;
const NEAR_DECIMALS = 24;
const BIG_ROUND_DOWN = 0;
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
  const availableBalance = Big(amount || 0).minus(
    Big(storage_usage).mul(Big(10).pow(19))
  );
  const balance = availableBalance
    .div(Big(10).pow(NEAR_DECIMALS))
    .minus(COMMON_MIN_BALANCE);
  return balance.lt(0) ? "0" : balance.toFixed(5, BIG_ROUND_DOWN);
}

function getAPY() {
  const result = fetch("https://metrics.linearprotocol.org", {
    method: "GET",
  });
  const apy = result.body.apy;
  if (!apy) return "-";
  return Big(apy).mul(100).toFixed(2) + "%";
}

State.init({
  inputValue: "",
  inputError: "",
  nearBalance: getNearBalance(accountId),
});
const nearBalance =
  !state.nearBalance || state.nearBalance === "-"
    ? getNearBalance(accountId)
    : state.nearBalance;
const apy = getAPY();

function isValid(a) {
  if (!a) return false;
  if (isNaN(Number(a))) return false;
  if (a === "") return false;
  return true;
}

const linearPrice = Big(
  Near.view("linear-protocol.near", "ft_price", `{}`) ?? "0"
).div(Big(10).pow(24));
const youWillReceive = (
  linearPrice.lte(0)
    ? Big(0)
    : Big(isValid(state.inputValue) ? state.inputValue : 0).div(linearPrice)
).toFixed(5, BIG_ROUND_DOWN);

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
      padding: 8px 20px;
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

const NEARTexture = styled.div`
  font-size: 24px;
  font-weight: bold;
  margin-left: 10px;
`;

const LogoWithText = styled.div`
  display: flex;
  align-items: center;
`;

const MaxTexture = styled.div`
  font-size: 24px;
  color: #4451FD;
  cursor: pointer;
`;

const FooterLink = styled.a`
    color: #4451FD;
    text-decoration: underline;
    transition: all 0.2s ease-in-out;
    margin-top: 12px;
    text-underline-offset: 3px;
`;

const YouWillReceive = styled.div`
    display: flex;
    justify-content: space-between;

    font-size: 14px;
    margin-top: 16px;
`;

const NEARInput = ({ value, onChange, onClickMax }) => {
  return (
    <NEARInputContainer>
      <LogoWithText>
        <img
          src={`https://ipfs.near.social/ipfs/bafkreid5xjykpqdvinmj432ldrkbjisrp3m4n25n4xefd32eml674ypqly`}
          width={26}
          height={26}
          alt="NEAR Icon"
        />
        <NEARTexture>NEAR</NEARTexture>
      </LogoWithText>
      <input
        style={{
          "text-align": "right",
          width: "100%",
          background: "transparent",
          border: "0",
          "font-size": "16px",
          "font-weight": "bold",
          color: state.inputError ? "#ec6868" : "white",
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
      <MaxTexture onClick={onClickMax}>MAX</MaxTexture>
    </NEARInputContainer>
  );
};

return (
  <Main>
    <a href="https://linearprotocol.org/" target="_blank">
      <img
        style={{
          height: "20px",
          width: "auto",
          position: "absolute",
          left: "32px",
          top: "44px",
        }}
        src="https://ipfs.near.social/ipfs/bafkreifb45onycd5nycpvt6vboe54zc5c4lynjg5xare4i2tqblwlkogoq"
        alt="Brand Logo"
        height={20}
        width={"auto"}
      />
    </a>
    <Title>Stake Your NEAR</Title>
    <Description>
      Stake NEAR and receive LiNEAR while earning staking rewards
    </Description>
    <APYContainer>
      APY <span>{apy}</span>
    </APYContainer>
    <StakeFormWrapper>
      <InputWrapper>
        <NEARInputContainer>
          <LogoWithText>
            <img
              src={`https://ipfs.near.social/ipfs/bafkreid5xjykpqdvinmj432ldrkbjisrp3m4n25n4xefd32eml674ypqly`}
              width={26}
              height={26}
              alt="NEAR Icon"
            />
            <NEARTexture>NEAR</NEARTexture>
          </LogoWithText>
          <input
            style={{
              "text-align": "right",
              width: "100%",
              background: "transparent",
              border: "0",
              "font-size": "16px",
              "font-weight": "bold",
              color: state.inputError ? "#ec6868" : "white",
              outline: "none",
              "box-shadow": "none",
              "margin-right": "16px",

              "-webkit-appearance": "none",
              "-moz-appearance": "textfield",
            }}
            placeholder="NEAR amount to stake"
            value={state.inputValue}
            onChange={(e) => {
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
            }}
          />
          <MaxTexture
            onClick={() => {
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
            }}
          >
            MAX
          </MaxTexture>
        </NEARInputContainer>
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
            LiNEAR_CONTRACT_ID,
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
        }}
      >
        Stake
      </StakeButton>
      <YouWillReceive>
        <p>You will receive </p>
        <p>{youWillReceive} LiNEAR</p>
      </YouWillReceive>
    </StakeFormWrapper>
    <FooterLink
      href="https://app.linearprotocol.org/?tab=unstake"
      target="_blank"
    >
      Unstake <strong>$LiNEAR</strong>
    </FooterLink>
  </Main>
);
