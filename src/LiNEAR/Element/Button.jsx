// MIT License: https://github.com/linear-protocol/linear-bos-components/blob/main/LICENSE

const type = props.type || "primary"; // primary || outline
const size = props.size || "lg"; // lg || base
const full = props.full || "full"; // full || none
const padding = props.padding || "normal"; // normal || large

const PrimaryButton = styled.button`
  display: flex;
  justify-content: center;
  align-items: center;
  border: none;
  color: white;
  ${full === "full" && "width: 100%;"}
  border-radius: 10px;
  font-size: ${size === "lg" ? "20px" : "16px"};
  font-weight: bold;
  overflow: hidden;
  padding: ${padding === "normal" ? "8px 0" : "12px 24px"};

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
  ${full === "full" && "width: 100%;"}
  border-radius: 10px;
  font-size: ${size === "lg" ? "20px" : "16px"};
  font-weight: bold;
  overflow: hidden;
  padding: ${padding === "normal" ? "8px 0" : "12px 24px"};
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
