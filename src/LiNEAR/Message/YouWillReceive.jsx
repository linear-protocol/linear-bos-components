const YouWillReceive = styled.div`
  color: white;
  display: flex;
  justify-content: space-between;
  font-size: 14px;
  margin-top: 16px;
`;

return (
  <YouWillReceive>
    <p>You will receive </p>
    <p>{props.text}</p>
  </YouWillReceive>
);
