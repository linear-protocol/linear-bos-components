const accountId = props.accountId || context.accountId;

const { config, accountDetails, onLoad } = props;
if (!config) {
  return "Component cannot be loaded. Missing `config` props";
}

// one hour in ms
const HOUR_MS = 60 * 60 * 1000;

function nsToMs(ns) {
  return Math.round((ns ?? 0) / 1e6);
}

function callNearRpc(method, params) {
  const options = {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      jsonrpc: "2.0",
      id: "dontcare",
      method,
      params,
    }),
  };
  return fetch(config.nodeUrl, options).body.result;
}

function getValidators() {
  return callNearRpc("validators", [null]);
}

function getBlock(blockId) {
  return callNearRpc(
    "block",
    !!blockId
      ? {
          block_id: blockId,
        }
      : {
          finality: "final",
        }
  );
}

function getEpochInfo() {
  const now = new Date().getTime();
  const latestBlock = getBlock();
  const latestBlockTimestamp = nsToMs(latestBlock.header.timestamp);
  const latestBlockHeight = latestBlock.header.height;

  // last epoch
  const epochEndBlock = getBlock(latestBlock.header.next_epoch_id);
  const epochStartBlock = getBlock(latestBlock.header.epoch_id);
  const epochEndBlockHeight = epochEndBlock.header.height;
  const epochStartBlockHeight = epochStartBlockHeight;

  let epochStartTimestamp = nsToMs(epochStartBlock.header.timestamp);
  let epochEndTimestamp = nsToMs(epochEndBlock.header.timestamp);

  let epochBlockNum = epochEndBlockHeight - epochStartBlockHeight;
  let epochLengthMs = epochEndTimestamp - epochStartTimestamp;
  if (epochBlockNum === 0) {
    epochBlockNum = 43200;
    epochLengthMs = 14 * HOUR_MS;
    const scale = Big(latestBlockHeight)
      .sub(epochEndBlockHeight)
      .div(epochBlockNum)
      .toNumber();
    epochEndTimestamp = latestBlockTimestamp - epochLengthMs * scale;
    epochStartTimestamp = epochEndTimestamp - epochLengthMs;
  }

  return {
    lastEpochLengthHours: epochLengthMs / HOUR_MS,
    hoursTillEpochEnd: (epochEndTimestamp + epochLengthMs - now) / HOUR_MS,
  };
}

function estimateUnstakeEndTime(endEpochHeight) {
  const validators = getValidators();
  const currentEpochHeight = validators.epoch_height;

  if (currentEpochHeight >= endEpochHeight) {
    return {
      ready: true,
    };
  }

  const { hoursTillEpochEnd, lastEpochLengthHours } = getEpochInfo();
  const EXTRA_HOURS = 3;
  const remainingHours =
    (endEpochHeight - currentEpochHeight - 1) * lastEpochLengthHours +
    hoursTillEpochEnd +
    EXTRA_HOURS;

  if (remainingHours && remainingHours > 0) {
    return {
      ready: false,
      timestamp: Date.now() + remainingHours * HOUR_MS,
      remainingHours: Math.floor(remainingHours).toString(),
    };
  } else {
    return null;
  }
}

if (onLoad) {
  const endTime =
    accountDetails && accountDetails.unstaked_available_epoch_height
      ? estimateUnstakeEndTime(accountDetails.unstaked_available_epoch_height)
      : {};

  if (accountDetails) {
    onLoad({
      amount: accountDetails.unstaked_balance,
      canWithdraw: accountDetails.can_withdraw,
      endTime,
    });
  }
}

return <div style={{ display: "none" }} />;
