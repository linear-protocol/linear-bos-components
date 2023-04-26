const LinearButton = styled.button`
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
        opacity: ${props.disabled ? "0" : "1"};
    }
`;

return (
  <LinearButton disabled={props.disabled} onClick={props.onClick}>
    {props.text}
  </LinearButton>
);
