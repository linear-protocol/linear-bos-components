// MIT License: https://github.com/linear-protocol/linear-bos-components/blob/main/LICENSE

const NavigationWrapper = styled.div`
  width: 100%;
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 60px;
`;

const MenuItemWrapper = styled.div`
  display: flex;
  cursor: pointer;
`;
const MenuItem = styled.div`
  font-size: 12px;
  font-weight: bold;
  margin-left: 20px;
  transition: all 0.3s ease-in-out;
  &:hover {
    opacity: 0.3;
  }
`;

const BrandLogo = () => (
  <a href="https://linearprotocol.org/" target="_blank">
    <img
      style={{
        height: "20px",
        width: "auto",
      }}
      src="https://ipfs.near.social/ipfs/bafkreifb45onycd5nycpvt6vboe54zc5c4lynjg5xare4i2tqblwlkogoq"
      alt="Brand Logo"
      height={20}
      width={"auto"}
    />
  </a>
);

return (
  <NavigationWrapper>
    <BrandLogo />
    <MenuItemWrapper>
      <MenuItem onClick={() => props.updatePage("stake")}>Stake</MenuItem>
      <MenuItem onClick={() => props.updatePage("account")}>
        My Account
      </MenuItem>
    </MenuItemWrapper>
  </NavigationWrapper>
);
