// MIT License: https://github.com/linear-protocol/linear-bos-components/blob/main/LICENSE

const ModalWrapper = styled.div`
  position: absolute;
  z-index: 1000;
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
  width: 400px;
  padding: 30px;
  border-radius: 20px;
  background: #090723;

  color: white;
`;

const ReciveContent = styled.div`
  background: #131332;
  border-radius: 6px;
  padding: 16px 24px;

  font-size: 16px;
  display: flex;
  margin-bottom: 20px;
`;

const TipMessage = styled.div`
  font-size: 16px;
  text-align: center;

  margin: 20px 0;
`;
const IconWrapper = styled.div`
  display: grid;
  place-content: center;
`;
const RightIcon = () => (
  <IconWrapper>
    <img
      src="https://ipfs.near.social/ipfs/bafkreieesb2t7izqrw2xqlh5dqczd5a3ay2p76qet35lxqfbvw5cry4y6q"
      width={60}
      height={60}
      alt="Near Icon"
    />
  </IconWrapper>
);

// load config
const config = props.config;
if (!config) {
  return "Component cannot be loaded. Missing `config` props";
}

return (
  <ModalWrapper>
    <ModalContent>
      <RightIcon />
      <TipMessage>
        Your previous delayed unstake is available now. You should withdraw
        first
      </TipMessage>
      <Widget
        src={`${config.ownerId}/widget/LiNEAR.Element.Button`}
        props={{
          onClick: props.onClickWithdraw,
          text: "Withdraw Now",
          size: "sm",
        }}
      />
    </ModalContent>
  </ModalWrapper>
);
