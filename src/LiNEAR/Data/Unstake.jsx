const accountId = props.accountId || context.accountId;

const { config, onLoad } = props;
if (!config) {
  return "Component cannot be loaded. Missing `config` props";
}

// one hour in ms
const HOUR_MS = 60 * 60 * 1000;

function isValid(a) {
  if (!a) return false;
  if (isNaN(Number(a))) return false;
  if (a === "") return false;
  return true;
}

function getValidators() {
  const options = {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      jsonrpc: "2.0",
      id: "dontcare",
      method: "validators",
      params: [null],
    }),
  };
  return fetch(config.nodeUrl, options).body.result;
}

function getBlock(blockId) {
  const options = {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      jsonrpc: "2.0",
      id: "dontcare",
      method: "block",
      params: !!blockId
        ? {
            block_id: blockId,
          }
        : {
            finality: "final",
          },
    }),
  };
  return fetch(config.nodeUrl, options).body.result;
}

function latestBlock() {
  const lastBlock = getBlock();
  const startBlock = getBlock(lastBlock.header.next_epoch_id);
  const prevBlock = getBlock(lastBlock.header.epoch_id);
  const startBlockHeight = startBlock.header.height;
  let prevBlockTimestamp = Math.round((prevBlock.header.timestamp ?? 0) / 1e6);
  let startBlockTimestamp = Math.round(
    (startBlock.header.timestamp ?? 0) / 1e6
  );
  let lastBlockTimestamp = Math.round((lastBlock.header.timestamp ?? 0) / 1e6);

  if (startBlockTimestamp < new Date().getTime() - 48 * HOUR_MS) {
    //genesis or hard-fork
    startBlockTimestamp = new Date().getTime() - 6 * HOUR_MS;
  }
  if (prevBlockTimestamp < new Date().getTime() - 48 * HOUR_MS) {
    //genesis or hard-fork
    prevBlockTimestamp = new Date().getTime() - 12 * HOUR_MS;
  }

  //const noPrevBloc = startBlock.header.height == prevBlock.header.height;
  let length = startBlock.header.height - prevBlock.header.height,
    duration_ms = 0,
    advance;
  let start_dtm, ends_dtm, duration_till_now_ms;
  if (length === 0) {
    //!prevBlock, genesis or hard-fork
    length = 43200;
    duration_ms = 12 * HOUR_MS;
    //estimated start & prev timestamps
    advance =
      Math.round(
        Number(
          ((BigInt(lastBlock.header.height) - BigInt(this.start_block_height)) *
            BigInt(1000000)) /
            BigInt(this.length)
        )
      ) / 1000000;
    startBlockTimestamp = lastBlockTimestamp - duration_ms * advance;
    prevBlockTimestamp = startBlockTimestamp - duration_ms;
  } else {
    duration_ms = startBlockTimestamp - prevBlockTimestamp;
  }

  start_dtm = new Date(startBlockTimestamp);
  ends_dtm = new Date(startBlockTimestamp + duration_ms);
  duration_till_now_ms = lastBlockTimestamp - startBlockTimestamp;

  // update function
  if (isValid(lastBlock.header.height) && isValid(startBlockHeight)) {
    advance =
      Math.round(
        Big(lastBlock.header.height)
          .minus(startBlockHeight)
          .times(1000000)
          .div(length)
          .toNumber()
      ) / 1000000;
    if (advance > 0.1) {
      ends_dtm = new Date(
        startBlockTimestamp +
          duration_till_now_ms +
          duration_till_now_ms * (1 - advance)
      );
    }
  }
  return {
    lastEpochDurationHours: duration_ms / HOUR_MS,
    hoursToEnd:
      Math.round(
        ((startBlockTimestamp + duration_ms - new Date().getTime()) / HOUR_MS) *
          100
      ) / 100,
  };
}

function padNumber(n) {
  if (n < 10) return `0${n}`;
  return n.toString();
}

function getUnstakeEndTime(epochHeight) {
  const nowValidator = getValidators();
  let currentEpochHeight = nowValidator.epoch_height;

  if (currentEpochHeight >= epochHeight) return {};

  const { hoursToEnd, lastEpochDurationHours } = latestBlock();
  const BUFFER = 3; // 3 HOURs buffer
  const remainingHours =
    hoursToEnd +
    (epochHeight - currentEpochHeight - 1) * lastEpochDurationHours +
    BUFFER;

  if (remainingHours) {
    const endTime = new Date(new Date().getTime() + remainingHours * HOUR_MS);
    return {
      time: `${endTime.getFullYear()}/${padNumber(
        endTime.getMonth() + 1
      )}/${padNumber(endTime.getDate())} ${padNumber(
        endTime.getHours()
      )}:${padNumber(endTime.getMinutes())}:${padNumber(endTime.getSeconds())}`,
      remainingHours: Math.floor(remainingHours).toString(),
    };
  } else {
    return {};
  }
}

if (onLoad) {
  const accountDetails = Near.view(config.contractId, "get_account_details", {
    account_id: accountId,
  });
  const endTime =
    accountDetails && accountDetails.unstaked_available_epoch_height
      ? getUnstakeEndTime(accountDetails.unstaked_available_epoch_height)
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
