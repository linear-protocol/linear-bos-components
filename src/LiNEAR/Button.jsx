const PrimaryButton = styled.button`
  display: flex;
  justify-content: center;
  align-items: center;
  border: none;
  color: white;
  width: 100%;
  border-radius: 10px;
  font-size: 20px;
  font-weight: bold;
  overflow: hidden;
  padding: 8px 0;

  background-size: 100%;
  background-image: linear-gradient(
    180deg,
    #5561ff 0%,
    #3643fc 100%,
    #3643fc 100%
  );
  position: relative;
  z-index: 0;
  &:disabled {
    background: #1c2056;
    color: #3d47d6;
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
    opacity: ${props.disabled ? "0" : "1"};
  }
`;

const OutlineButton = styled.button`
  display: flex;
  justify-content: center;
  align-items: center;
  border: 2px solid #30348a;
  color: #30348a;
  width: 100%;
  border-radius: 10px;
  font-size: 20px;
  font-weight: bold;
  overflow: hidden;
  padding: 8px 0;
  transition: all 0.3s ease-in-out;

  &:disabled {
    background: #1c2056;
    color: #3d47d6;
  }
  &:hover {
    border: 2px solid #404be2;
    color: white;
    background: #404be2;
  }
`;

const type = props.type || "primary"; // primary || outline

if (type === "outline") {
  return (
    <OutlineButton disabled={props.disabled} onClick={props.onClick}>
      {props.text}
    </OutlineButton>
  );
} else {
  return (
    <PrimaryButton disabled={props.disabled} onClick={props.onClick}>
      {props.text}
    </PrimaryButton>
  );
}
