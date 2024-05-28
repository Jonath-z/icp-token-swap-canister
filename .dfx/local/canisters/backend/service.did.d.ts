import type { Principal } from '@dfinity/principal';
import type { ActorMethod } from '@dfinity/agent';
import type { IDL } from '@dfinity/candid';

export interface _SERVICE {
  'deposit' : ActorMethod<
    [
      {
        'fee' : [] | [bigint],
        'token' : Principal,
        'spender_subaccount' : [] | [string],
        'from' : {
          'owner' : Principal,
          'subaccount' : [] | [Uint8Array | number[]],
        },
        'memo' : [] | [Uint8Array | number[]],
        'created_at_time' : [] | [bigint],
        'amount' : bigint,
      },
    ],
    { 'Ok' : bigint } |
      {
        'Err' : {
            'GenericError' : { 'message' : string, 'error_code' : bigint }
          } |
          { 'TemporarilyUnavailable' : null } |
          { 'InsufficientAllowance' : { 'allowance' : bigint } } |
          { 'BadBurn' : { 'min_burn_amount' : bigint } } |
          { 'Duplicate' : { 'duplicate_of' : bigint } } |
          { 'BadFee' : { 'expected_fee' : bigint } } |
          { 'CreatedInFuture' : { 'ledger_time' : bigint } } |
          { 'TooOld' : null } |
          { 'InsufficientFunds' : { 'balance' : bigint } }
      }
  >,
  'initialize' : ActorMethod<
    [{ 'token_a' : Principal, 'token_b' : Principal }],
    string
  >,
  'listBalances' : ActorMethod<[], string>,
  'swap' : ActorMethod<
    [{ 'user_a' : Principal, 'user_b' : Principal }],
    string
  >,
  'withdraw' : ActorMethod<
    [
      {
        'to' : {
          'owner' : Principal,
          'subaccount' : [] | [Uint8Array | number[]],
        },
        'fee' : [] | [bigint],
        'token' : Principal,
        'memo' : [] | [Uint8Array | number[]],
        'created_at_time' : [] | [bigint],
        'amount' : bigint,
      },
    ],
    { 'Ok' : bigint } |
      {
        'Err' : {
            'GenericError' : { 'message' : string, 'error_code' : bigint }
          } |
          { 'TemporarilyUnavailable' : null } |
          { 'BadBurn' : { 'min_burn_amount' : bigint } } |
          { 'Duplicate' : { 'duplicate_of' : bigint } } |
          { 'BadFee' : { 'expected_fee' : bigint } } |
          { 'CreatedInFuture' : { 'ledger_time' : bigint } } |
          { 'TooOld' : null } |
          { 'InsufficientFunds' : { 'balance' : bigint } }
      }
  >,
}
export declare const idlFactory: IDL.InterfaceFactory;
export declare const init: (args: { IDL: typeof IDL }) => IDL.Type[];
