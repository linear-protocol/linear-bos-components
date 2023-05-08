const accountId = props.accountId || context.accountId;

const { config, onLoad } = props;
if (!config) {
  return "Component cannot be loaded. Missing `config` props";
}

//time in ms
const SECONDS = 1000;
const MINUTES = 60 * SECONDS;
const HOURS = 60 * MINUTES;

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
  let prev_timestamp = Math.round((prevBlock.header.timestamp ?? 0) / 1e6);
  let start_block_height = startBlock.header.height;
  let start_timestamp = Math.round((startBlock.header.timestamp ?? 0) / 1e6);
  let last_block_timestamp = Math.round(
    (lastBlock.header.timestamp ?? 0) / 1e6
  );

  if (start_timestamp < new Date().getTime() - 48 * HOURS) {
    //genesis or hard-fork
    start_timestamp = new Date().getTime() - 6 * HOURS;
  }
  if (prev_timestamp < new Date().getTime() - 48 * HOURS) {
    //genesis or hard-fork
    prev_timestamp = new Date().getTime() - 12 * HOURS;
  }

  //const noPrevBloc = startBlock.header.height == prevBlock.header.height;
  let length = startBlock.header.height - prevBlock.header.height,
    duration_ms = 0,
    advance;
  let start_dtm, ends_dtm, duration_till_now_ms;
  if (length === 0) {
    //!prevBlock, genesis or hard-fork
    length = 43200;
    duration_ms = 12 * HOURS;
    //estimated start & prev timestamps
    advance =
      Math.round(
        Number(
          ((BigInt(lastBlock.header.height) - BigInt(this.start_block_height)) *
            BigInt(1000000)) /
            BigInt(this.length)
        )
      ) / 1000000;
    start_timestamp = last_block_timestamp - duration_ms * advance;
    prev_timestamp = start_timestamp - duration_ms;
  } else {
    duration_ms = start_timestamp - prev_timestamp;
  }

  start_dtm = new Date(start_timestamp);
  ends_dtm = new Date(start_timestamp + duration_ms);
  duration_till_now_ms = last_block_timestamp - start_timestamp;

  // update function
  if (isValid(lastBlock.header.height) && isValid(start_block_height)) {
    advance =
      Math.round(
        Big(lastBlock.header.height)
          .minus(start_block_height)
          .times(1000000)
          .div(length)
          .toNumber()
      ) / 1000000;
    if (advance > 0.1) {
      ends_dtm = new Date(
        start_timestamp +
          duration_till_now_ms +
          duration_till_now_ms * (1 - advance)
      );
    }
  }
  return {
    lastEpochDurationHours: duration_ms / HOURS,
    hoursToEnd:
      Math.round(
        ((start_timestamp + duration_ms - new Date().getTime()) / HOURS) * 100
      ) / 100,
  };
}

function padNumber(n) {
  if (n < 10) return `0${n}`;
  return n.toString();
}

function queryFinishedTime(epochHeight) {
  const nowValidator = getValidators();
  let nowEpochHeight = nowValidator.epoch_height;

  if (nowEpochHeight >= epochHeight) return {};

  const { hoursToEnd, lastEpochDurationHours } = latestBlock();
  const BUFFER = 3; // 3 HOURs buffer
  const durationHours =
    hoursToEnd +
    (epochHeight - nowEpochHeight - 1) * lastEpochDurationHours +
    BUFFER;

  if (durationHours) {
    const finishedTime = new Date(new Date().getTime() + durationHours * HOURS);
    return {
      finishedTime: `${finishedTime.getFullYear()}/${padNumber(
        finishedTime.getMonth() + 1
      )}/${padNumber(finishedTime.getDate())} ${padNumber(
        finishedTime.getHours()
      )}:${padNumber(finishedTime.getMinutes())}:${padNumber(
        finishedTime.getSeconds()
      )}`,
      durationHours: Math.floor(durationHours).toString(),
    };
  } else {
    return {};
  }
}

if (onLoad) {
  const details = Near.view(config.contractId, "get_account_details", {
    account_id: accountId,
  });
  const endTime =
    details && details.unstaked_available_epoch_height
      ? queryFinishedTime(details.unstaked_available_epoch_height)
      : {};

  if (details || endTime) {
    onLoad({
      amount: details.unstaked_balance,
      endTime,
    });
  }
}

return <div style={{ display: "none" }} />;
