const ModalWrapper = styled.div`
  position: absolute;
  z-index: 99999;
  left: 0;
  top: 0;
  width: 100%;
  height: 100%;

  background: #000000aa;

  display: flex;
  justify-content: center;
  align-items: center;
`;

const ModalContent = styled.div`
  width: 530px;
  padding: 30px;
  border-radius: 20px;
  background: #090723;

  color: white;
`;

const ModalTitle = styled.div`
  font-size: 18px;
  font-weight: bold;
`;

const ModalSubTitle = styled.div`
  margin-top: 24px;
  margin-bottom: 20px;
  font-size: 14px;
`;

const ReciveContent = styled.div`
  background: #131332;
  border-radius: 6px;
  padding: 16px 24px;

  font-size: 16px;

  margin-bottom: 20px;
`;

const NEARIcon = () => (
  <img
    style={{ marginLeft: "8px" }}
    src="https://ipfs.near.social/ipfs/bafkreid5xjykpqdvinmj432ldrkbjisrp3m4n25n4xefd32eml674ypqly"
    width={24}
    height={24}
    alt="Near Icon"
  />
);

const ButtonGroup = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
`;

const Hr = styled.hr`
  background: #6a74f8;
  border: 0;
  height: 1px;
  margin-top: 16px;
  margin-bottom: 8px;
`;

const Slippage = styled.div`
  color: #6a74f8;
  font-size: 12px;
`;

return (
  <ModalWrapper>
    <ModalContent>
      <ModalTitle>Start Delayed Unstake</ModalTitle>
      <ModalSubTitle>
        Funds will be available in approximately 49 hours. You will not receive
        rewards during that period.
      </ModalSubTitle>
      <ReciveContent>
        <p>{`Start delayed-unstake process for: ${props.youWillReceive}`}</p>
        <NEARIcon />
      </ReciveContent>
      <ButtonGroup>
        <Widget
          src="linear-builder.testnet/widget/LiNEAR.Button"
          props={{
            onClick: props.onClickConfirm,
            text: "Confirm",
          }}
        />
        <Widget
          src="linear-builder.testnet/widget/LiNEAR.Button"
          props={{
            onClick: props.onClickCancel,
            text: "Cancel",
            type: "outline",
          }}
        />
      </ButtonGroup>
      <Hr />
      <Slippage>
        After the waiting period is over, the funds will be available for
        withdrawal.
      </Slippage>
    </ModalContent>
  </ModalWrapper>
);
