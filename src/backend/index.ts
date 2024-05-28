import {
  blob,
  Canister,
  ic,
  nat,
  nat64,
  None,
  Opt,
  Principal,
  query,
  StableBTreeMap,
  text,
  update,
  Record,
  init,
} from "azle";
import {
  Account,
  ICRC,
  TransferArgs,
  TransferFromResult,
  TransferResult,
} from "azle/canisters/icrc";

const DepositArgs = Record({
  spender_subaccount: Opt(text),
  token: Principal,
  from: Account,
  amount: nat,
  fee: Opt(nat),
  memo: Opt(blob),
  created_at_time: Opt(nat64),
});

const WithdrawArgs = Record({
  token: Principal,
  to: Account,
  amount: nat,
  fee: Opt(nat),
  memo: Opt(blob),
  created_at_time: Opt(nat64),
});

// Define private variables to track the deposited balances for token A and token B:
const balanceA = StableBTreeMap<string, number>(0);
const balanceB = StableBTreeMap<string, number>(1);

let tokenA: Principal;
let tokenB: Principal;

const InitArgs = Record({
  token_a: Principal,
  token_b: Principal,
});

export default Canister({
  initialize: update([InitArgs], text, (args) => {
    console.log({ args });
    tokenA = args.token_a;
    tokenB = args.token_b;
    return "initialized";
  }),

  listBalances: query([], text, () => {
    const balancesA = balanceA.keys().map((value) => {
      return {
        [value]: balanceA.get(value).Some,
      };
    });

    const balancesB = balanceB.keys().map((value) => {
      return {
        [value]: balanceB.get(value).Some,
      };
    });

    return JSON.stringify({ balancesA, balancesB });
  }),

  deposit: update([DepositArgs], TransferFromResult, async (transferArgs) => {
    console.log({ env: process.env });
    const tokenId = transferArgs.token.toString();
    console.log({
      icrc: transferArgs.token.toString(),
      tokena: tokenA.toString(),
      tokenb: tokenB.toString(),
    });
    const icrc = ICRC(Principal.fromText(transferArgs.token.toString()));

    let balanceStore;
    if (tokenId === tokenA.toString()) balanceStore = balanceA;
    if (tokenId === tokenB.toString()) balanceStore = balanceB;

    const oldBalance = balanceStore?.get(
      transferArgs.from.owner.toString()
    ).Some;

    if (!oldBalance)
      balanceStore?.insert(
        transferArgs.from.owner.toString(),
        Number(transferArgs.amount.toString())
      );
    else
      balanceStore?.insert(
        transferArgs.from.owner.toString(),
        Number(transferArgs.amount.toString()) + oldBalance
      );

    // Load the fee from the token:
    // The user can pass a null fee, which means uses the default. TO determine the default, it needs to be retrieved:
    const fee = transferArgs.fee
      ? transferArgs.fee
      : await ic.call(icrc.icrc1_fee, { args: [] });

    const transferData: TransferArgs = {
      ...transferArgs,
      to: {
        owner: Principal.fromText(ic.id().toString()),
        subaccount: None,
      },
      from_subaccount: None,
      memo: None,
      fee: fee,
    };

    let transfer_result = await ic.call(icrc.icrc2_transfer_from, {
      args: [transferData],
    });
    return transfer_result;
  }),

  withdraw: update([WithdrawArgs], TransferResult, async (transferArgs) => {
    const tokenId = transferArgs.token.toString();

    const icrc = ICRC(Principal.fromText(tokenId));

    const transferData: TransferArgs = {
      to: transferArgs.to,
      from_subaccount: None,
      memo: transferArgs.memo,
      fee: transferArgs.fee,
      amount: transferArgs.amount,
      created_at_time: transferArgs.created_at_time,
    };

    let transfer_result = await ic.call(icrc.icrc1_transfer, {
      args: [transferData],
    });
    return transfer_result;
  }),

  swap: update(
    [Record({ user_a: Principal, user_b: Principal })],
    text,
    (swapArgs) => {
      const user_a = swapArgs.user_a.toString();
      const user_b = swapArgs.user_b.toString();
      // Give user_a's token_a to user_b:
      // Add the the two user's token_a balances, and then give all of it to user_b:
      const userABalanceForTokenA = balanceA.get(user_a).Some;
      const userBBalanceForTokenA = balanceA.get(user_b).Some;

      balanceA.insert(
        user_b,
        (userABalanceForTokenA ?? 0) + (userBBalanceForTokenA ?? 0)
      );
      balanceA.remove(user_a);

      // Give user_b's token_b to user_a:
      // Add the the two user's token_b balances, and then give all of it to user_a:
      const userABalanceForTokenB = balanceB.get(user_a).Some;
      const userBBalanceForTokenB = balanceB.get(user_b).Some;

      balanceB.insert(
        user_a,
        (userBBalanceForTokenB ?? 0) + (userABalanceForTokenB ?? 0)
      );
      balanceB.remove(user_b);

      return "Success";
    }
  ),
});
