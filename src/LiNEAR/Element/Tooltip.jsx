State.init({
  show: false,
});

const handleOnMouseEnter = () => {
  State.update({ show: true });
};
const handleOnMouseLeave = () => {
  State.update({ show: false });
};

const OverlayContainer = styled.div`
  max-width: 24em;
  z-index: 1000;
  background: #1c1c52;
  color: white;
  border-radius: 8px;

  padding: 16px;
  font-size: 12px;
  font-weight: 500;
`;
const overlay = (
  <OverlayContainer
    onMouseEnter={handleOnMouseEnter}
    onMouseLeave={handleOnMouseLeave}
  >
    {props.message}
  </OverlayContainer>
);

return (
  <OverlayTrigger
    show={state.show}
    trigger={["hover", "focus"]}
    delay={{ show: 250, hide: 300 }}
    placement="auto"
    overlay={overlay}
  >
    <img
      src="https://ipfs.near.social/ipfs/bafkreiaxicbi3h45oc432rvjty5lngeluluaqgnov3lid2e5x2kq3zy2q4"
      onMouseEnter={handleOnMouseEnter}
      onMouseLeave={handleOnMouseLeave}
      width={14}
      height={14}
    />
  </OverlayTrigger>
);
