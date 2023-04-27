// Forked from: weige.near/widget/ref-swap-getEstimate
const shrinkToken = (value, decimals) => {
  return new Big(value || 0).div(new Big(10).pow(decimals || 24));
};

const expandToken = (value, decimals) => {
  return new Big(value).mul(new Big(10).pow(decimals));
};

const {
  tokenIn: tokenInFromProps,
  tokenOut: tokenOutFromProps,
  amountIn,
  loadRes,
  reloadPools,
  setReloadPools,
} = props;

const tokenIn =
  tokenInFromProps.id === "NEAR"
    ? { ...tokenInFromProps, id: "wrap.near" }
    : tokenInFromProps;

const tokenOut =
  tokenOutFromProps.id === "NEAR"
    ? { ...tokenOutFromProps, id: "wrap.near" }
    : tokenOutFromProps;

const FEE_DIVISOR = 10000;

const getSinglePoolEstimate = (tokenIn, tokenOut, pool, amountIn) => {
  const allocation = amountIn;

  const amount_with_fee =
    Number(allocation) * (FEE_DIVISOR - pool.total_fee || pool.fee || 0);

  const in_balance = shrinkToken(
    pool.amounts[pool.token_account_ids[0] === tokenIn.id ? 0 : 1],
    tokenIn.decimals
  );

  const out_balance = shrinkToken(
    pool.amounts[pool.token_account_ids[0] === tokenIn.id ? 1 : 0],

    tokenOut.decimals
  );

  const estimate = new Big(
    (
      (amount_with_fee * Number(out_balance)) /
      (FEE_DIVISOR * Number(in_balance) + amount_with_fee)
    ).toString()
  ).toFixed();

  return {
    estimate,
    pool,
    tokenIn,
    tokenOut,
  };
};

const returnNull = (sig) => {
  loadRes({ sig });
  return <div />;
};

const wrapOperation =
  [tokenIn, tokenOut].every((meta) => meta.id === "wrap.near") &&
  !![tokenIn, tokenOut].find((meta) => meta.symbol === "NEAR");

if (wrapOperation) {
  loadRes({
    estimate: amountIn,
    tokenIn,
    tokenOut,
    pool: "wrap",
  });

  return <div />;
}

if (tokenIn.id === tokenOut.id) return returnNull();

let topPools = JSON.parse(
  fetch("https://indexer.ref.finance/list-top-pools").body
);

const reloadTopPools = () => {
  asyncFetch("https://indexer.ref.finance/list-top-pools").then((res) => {
    const data = res.body;
    topPools = JSON.parse(data);
    setReloadPools(false);
  });
};

if (reloadPools) {
  reloadTopPools();
}

if (!topPools) return returnNull();

if (Number(amountIn) === 0) {
  return returnNull();
}

const poolsThisPair = topPools.filter(
  (p) =>
    p.token_account_ids.includes(tokenIn.id) &&
    p.token_account_ids.includes(tokenOut.id)
);

const poolThisPair = poolsThisPair.find((p) => p.token_account_ids.length > 2)
  ? poolsThisPair.find((p) => p.token_account_ids.length > 2)
  : poolsThisPair[0];

if (!poolThisPair || poolThisPair.amounts.some((a) => Number(a) === 0)) {
  return returnNull("no_pool");
}

if (poolThisPair.pool_kind === "SIMPLE_POOL") {
  const res = getSinglePoolEstimate(tokenIn, tokenOut, poolThisPair, amountIn);

  loadRes(res);
} else {
  return (
    <Widget
      src="linear-builder.testnet/widget/Ref.ref-stable-swap-algorithm"
      props={{
        loadRes: loadRes,
        tokenIn,
        tokenOut,

        amountIn: amountIn,
        pool: poolThisPair,
      }}
    />
  );
}

return <div />;
