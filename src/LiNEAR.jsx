/** common lib start */
const accountId = props.accountId || context.accountId;
const isSignedIn = !!accountId;
const NEAR_DECIMALS = 24;
const LiNEAR_DECIMALS = 24;
const BIG_ROUND_DOWN = 0;
const MIN_BALANCE_CHANGE = 0.5;
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
/** common lib end */

// Config for LiNEAR app
function getConfig(network) {
  switch (network) {
    case "mainnet":
      return {
        ownerId: "linearprotocol.near",
        contractId: "linear-protocol.near",
        nodeUrl: "https://rpc.mainnet.near.org",
        appUrl: "https://app.linearprotocol.org",
      };
    case "testnet":
      return {
        ownerId: "linear-builder.testnet",
        contractId: "linear-protocol.testnet",
        nodeUrl: "https://rpc.testnet.near.org",
        appUrl: "https://testnet.linearprotocol.org",
      };
    default:
      throw Error(`Unconfigured environment '${network}'.`);
  }
}
const config = getConfig(context.networkId);

function getNearBalance(accountId) {
  const account = fetch(config.nodeUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      jsonrpc: "2.0",
      id: "dontcare",
      method: "query",
      params: {
        request_type: "view_account",
        finality: "final",
        account_id: accountId,
      },
    }),
  });
  const { amount, storage_usage } = account.body.result;
  const COMMON_MIN_BALANCE = 0.05;
  if (!amount) return "-";
  const availableBalance = Big(amount || 0).minus(
    Big(storage_usage).mul(Big(10).pow(19))
  );
  const balance = availableBalance
    .div(Big(10).pow(NEAR_DECIMALS))
    .minus(COMMON_MIN_BALANCE);
  return balance.lt(0) ? "0" : balance.toFixed(5, BIG_ROUND_DOWN);
}

function getLinearBalance(accountId) {
  const linearBalanceRaw = Near.view(config.contractId, "ft_balance_of", {
    account_id: accountId,
  });
  if (!linearBalanceRaw) return "-";
  const balance = Big(linearBalanceRaw).div(Big(10).pow(LiNEAR_DECIMALS));
  return balance.lt(0) ? "0" : balance.toFixed();
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

function lastestBlock() {
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

  if (nowEpochHeight >= epochHeight) return null;

  const { hoursToEnd, lastEpochDurationHours } = lastestBlock();
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

const account = Near.view(config.contractId, "get_account_details", {
  account_id: accountId,
});

const finishedTime = queryFinishedTime(account.unstaked_available_epoch_height);

State.init({
  tabName: "stake", // stake | unstake
  page: "stake", // "stake" | "account"
  nearBalance: "",
});

const Main = styled.div`
  position: relative;
  color: white;
  width: 100%;
  height: 100vh;
  background: #09071f;
  padding: 20px;

  display: flex;
  align-items: center;
  flex-direction: column;
`;

const updateTabName = (tabName) =>
  State.update({
    tabName,
  });

const updatePage = (pageName) => State.update({ page: pageName });

// Account balances
function updateNearBalance(account, onInvalidate) {
  const { amount, storage_usage } = account.body.result;
  const COMMON_MIN_BALANCE = 0.05;

  let newBalance = "-";
  if (amount) {
    const availableBalance = Big(amount || 0).minus(
      Big(storage_usage).mul(Big(10).pow(19))
    );
    const balance = availableBalance
      .div(Big(10).pow(NEAR_DECIMALS))
      .minus(COMMON_MIN_BALANCE);
    newBalance = balance.lt(0) ? "0" : balance.toFixed(5, BIG_ROUND_DOWN);
  }
  State.update({
    nearBalance: newBalance,
  });
  if (onInvalidate) {
    onInvalidate(nearBalance, newBalance);
  }
}

function getNearBalance(accountId, onInvalidate) {
  const options = {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      jsonrpc: "2.0",
      id: "dontcare",
      method: "query",
      params: {
        request_type: "view_account",
        finality: "final",
        account_id: accountId,
      },
    }),
  };
  asyncFetch(config.nodeUrl, options).then((account) =>
    updateNearBalance(account, onInvalidate)
  );
}

function getLinearBalance(accountId, subscribe) {
  const linearBalanceRaw = Near.view(
    config.contractId,
    "ft_balance_of",
    {
      account_id: accountId,
    },
    undefined,
    subscribe
  );
  if (!linearBalanceRaw) return "-";
  const balance = Big(linearBalanceRaw).div(Big(10).pow(LiNEAR_DECIMALS));
  return balance.lt(0) ? "0" : balance.toFixed();
}

const nearBalance = state.nearBalance;
// Initial fetch of account NEAR balance
if (accountId && !isValid(nearBalance)) {
  getNearBalance(accountId);
}
const linearBalance = accountId ? getLinearBalance(accountId) : "-";
const formattedLinearBalance =
  linearBalance === "-" ? "-" : Big(linearBalance).toFixed(5, BIG_ROUND_DOWN);

function updateAccountInfo(callback) {
  const interval = setInterval(() => {
    getNearBalance(accountId, (oldBalance, newBalance) => {
      if (
        newBalance !== "-" &&
        oldBalance !== "-" &&
        Big(newBalance).sub(oldBalance).abs().gt(MIN_BALANCE_CHANGE)
      ) {
        // now update LiNEAR balance after NEAR balance has been updated
        getLinearBalance(accountId, true);
        // stop polling and invoke callback functions if any
        clearInterval(interval);
        if (callback) callback();
      }
    });
  }, 500);
}

if (state.page === "stake") {
  return (
    <Main>
      <Widget
        src={`${config.ownerId}/widget/LiNEAR.Navigation`}
        props={{
          updatePage,
        }}
      />
      <Widget src={`${config.ownerId}/widget/LiNEAR.TitleAndDescription`} />
      <Widget src={`${config.ownerId}/widget/LiNEAR.Apy`} />
      <Widget
        src={`${config.ownerId}/widget/LiNEAR.Tab`}
        props={{
          tabName: state.tabName,
          updateTabName,
        }}
      />
      {state.tabName === "stake" && (
        <Widget
          src={`${config.ownerId}/widget/LiNEAR.Stake`}
          props={{ config, nearBalance, linearBalance, updateAccountInfo }}
        />
      )}
      {state.tabName === "unstake" && (
        <Widget
          src={`${config.ownerId}/widget/LiNEAR.Unstake`}
          props={{
            config,
            linearBalance,
            formattedLinearBalance,
            updateAccountInfo,
          }}
        />
      )}
    </Main>
  );
} else {
  return (
    <Widget
      src={`${config.ownerId}/widget/LiNEAR.Account`}
      props={{
        updatePage,
        updateTabName,
        config,
        nearBalance,
        account,
        linearBalance: formattedLinearBalance,
        finishedTime,
      }}
    />
  );
}
