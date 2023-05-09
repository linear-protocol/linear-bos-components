// MIT License: https://github.com/linear-protocol/linear-bos-components/blob/main/LICENSE

const InputWrapper = styled.div`
  width: 100%;
  border-radius: 10px;
  background: #0d0d2b;
  padding: 20px;
  color: white;
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
  color: #4451fd;
  cursor: pointer;
`;

return (
  <InputWrapper>
    <NEARInputContainer>
      <LogoWithText>
        <img
          src={
            props.iconUrl ||
            `https://ipfs.near.social/ipfs/bafkreid5xjykpqdvinmj432ldrkbjisrp3m4n25n4xefd32eml674ypqly`
          }
          width={26}
          height={26}
          alt="Token Icon"
        />
        <NEARTexture>{props.iconName}</NEARTexture>
      </LogoWithText>
      <input
        style={{
          "text-align": "right",
          width: "100%",
          background: "transparent",
          border: "0",
          "font-size": "16px",
          "font-weight": "bold",
          color: props.inputError ? "#ec6868" : "white",
          outline: "none",
          "box-shadow": "none",
          "margin-right": "16px",

          "-webkit-appearance": "none",
          "-moz-appearance": "textfield",
        }}
        placeholder={props.placeholder}
        value={props.value}
        onChange={props.onChange}
      />
      <MaxTexture onClick={props.onClickMax}>MAX</MaxTexture>
    </NEARInputContainer>
    <HorizentalLine />
    <BalanceContainer>
      <p>Balance: {props.balance}</p>
      <p className="error">{props.inputError}</p>
    </BalanceContainer>
  </InputWrapper>
);
