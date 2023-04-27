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
  color: white;

  display: flex;
  justify-content: center;
  align-items: center;
  height: 40px;
  width: 128px;
  border-radius: 9999px;

  font-size: 18px;
  font-weight: bold;
  cursor: pointer;

  transition: all 0.3s ease-in-o;
`;

const tabName = props.tabName || "stake";
return (
  <TabContainer>
    <TabItem
      style={{
        background: tabName === "stake" ? "#5137ee" : "transparent",
      }}
      onClick={() => props.updateTabName("stake")}
    >
      Stake
    </TabItem>
    <TabItem
      style={{
        background: tabName === "unstake" ? "#5137ee" : "transparent",
      }}
      onClick={() => props.updateTabName("unstake")}
    >
      Unstake
    </TabItem>
  </TabContainer>
);
