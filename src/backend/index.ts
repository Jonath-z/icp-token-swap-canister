import {
  blob,
  Canister,
  ic,
  init,
  nat,
  nat64,
  nat8,
  None,
  Opt,
  Principal,
  query,
  serialize,
  Some,
  StableBTreeMap,
  text,
  Tuple,
  update,
  Record,
  Vec,
} from "azle";
import {
  Account,
  AllowanceArgs,
  AllowanceResult,
  ApproveArgs,
  ApproveResult,
  ICRC,
  SupportedStandard,
  TransferArgs,
  TransferFromArgs,
  TransferFromResult,
  TransferResult,
  Value,
} from "azle/canisters/icrc";
import { getCanisterId } from "azle/dfx";

const DepositArgs = Record({
  spender_subaccount: Opt(text),
  token: Principal,
  from: Account,
  amount: nat,
  fee: Opt(nat),
  memo: blob,
  created_at_time: Opt(nat64),
});

// Define private variables to track the deposited balances for token A and token B:
const balanceA = StableBTreeMap<string, number>(0);
const balanceB = StableBTreeMap<string, number>(1);

export default Canister({
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

  deposit: update(
    [DepositArgs, text],
    TransferFromResult,
    async (transferArgs, token) => {
      console.log({ env: process.env });
      const tokenId =
        token === "token_a"
          ? "by6od-j4aaa-aaaaa-qaadq-cai"
          : "avqkn-guaaa-aaaaa-qaaea-cai";

      const icrc = ICRC(Principal.fromText(tokenId));
      let balanceStore;
      if (token === "token_a") balanceStore = balanceA;
      if (token === "token_b") balanceStore = balanceB;

      const oldBalance = balanceStore?.get(
        transferArgs.from.owner.toString()
      ).Some;
      console.log({ oldBalance });
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
          owner: Principal.fromText("bw4dl-smaaa-aaaaa-qaacq-cai"),
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
    }
  ),

  withdraw: update(
    [TransferArgs, text],
    TransferResult,
    async (transferArgs, token) => {
      const tokenId =
        token === "token_a"
          ? "by6od-j4aaa-aaaaa-qaadq-cai"
          : "avqkn-guaaa-aaaaa-qaaea-cai";

      const icrc = ICRC(Principal.fromText(tokenId));

      let transfer_result = await ic.call(icrc.icrc1_transfer, {
        args: [transferArgs],
      });
      return transfer_result;
    }
  ),

  swap: update([text, text], text, (user_a, user_b) => {
    // Give user_a's token_a to user_b:
    // Add the the two user's token_a balances, and then give all of it to user_b:
    const userABalanceForTokenA = balanceA.get(user_a).Some;
    const userBBalanceForTokenA = balanceA.get(user_b).Some;
    if (userABalanceForTokenA && userBBalanceForTokenA) {
      balanceA.insert(user_b, userABalanceForTokenA + userBBalanceForTokenA);
      balanceA.remove(user_a);
    } else {
      return "user_a and user_b dot not have deposits in token a";
    }

    // Give user_b's token_b to user_a:
    // Add the the two user's token_b balances, and then give all of it to user_a:
    const userABalanceForTokenB = balanceB.get(user_a).Some;
    const userBBalanceForTokenB = balanceB.get(user_b).Some;
    if (userABalanceForTokenB && userBBalanceForTokenB) {
      balanceB.insert(user_a, userBBalanceForTokenB + userABalanceForTokenB);
      balanceB.remove(user_b);
    } else {
      return "user_a and user_b dot not have deposits in token b";
    }

    return "Success";
  }),
});
