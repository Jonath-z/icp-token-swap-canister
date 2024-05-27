export const idlFactory = ({ IDL }) => {
  return IDL.Service({
    'deposit' : IDL.Func(
        [
          IDL.Record({
            'fee' : IDL.Opt(IDL.Nat),
            'token' : IDL.Principal,
            'spender_subaccount' : IDL.Opt(IDL.Text),
            'from' : IDL.Record({
              'owner' : IDL.Principal,
              'subaccount' : IDL.Opt(IDL.Vec(IDL.Nat8)),
            }),
            'memo' : IDL.Vec(IDL.Nat8),
            'created_at_time' : IDL.Opt(IDL.Nat64),
            'amount' : IDL.Nat,
          }),
          IDL.Text,
        ],
        [
          IDL.Variant({
            'Ok' : IDL.Nat,
            'Err' : IDL.Variant({
              'GenericError' : IDL.Record({
                'message' : IDL.Text,
                'error_code' : IDL.Nat,
              }),
              'TemporarilyUnavailable' : IDL.Null,
              'InsufficientAllowance' : IDL.Record({ 'allowance' : IDL.Nat }),
              'BadBurn' : IDL.Record({ 'min_burn_amount' : IDL.Nat }),
              'Duplicate' : IDL.Record({ 'duplicate_of' : IDL.Nat }),
              'BadFee' : IDL.Record({ 'expected_fee' : IDL.Nat }),
              'CreatedInFuture' : IDL.Record({ 'ledger_time' : IDL.Nat64 }),
              'TooOld' : IDL.Null,
              'InsufficientFunds' : IDL.Record({ 'balance' : IDL.Nat }),
            }),
          }),
        ],
        [],
      ),
    'listBalances' : IDL.Func([], [IDL.Text], ['query']),
    'swap' : IDL.Func([IDL.Text, IDL.Text], [IDL.Text], []),
    'withdraw' : IDL.Func(
        [
          IDL.Record({
            'to' : IDL.Record({
              'owner' : IDL.Principal,
              'subaccount' : IDL.Opt(IDL.Vec(IDL.Nat8)),
            }),
            'fee' : IDL.Opt(IDL.Nat),
            'memo' : IDL.Opt(IDL.Vec(IDL.Nat8)),
            'from_subaccount' : IDL.Opt(IDL.Vec(IDL.Nat8)),
            'created_at_time' : IDL.Opt(IDL.Nat64),
            'amount' : IDL.Nat,
          }),
          IDL.Text,
        ],
        [
          IDL.Variant({
            'Ok' : IDL.Nat,
            'Err' : IDL.Variant({
              'GenericError' : IDL.Record({
                'message' : IDL.Text,
                'error_code' : IDL.Nat,
              }),
              'TemporarilyUnavailable' : IDL.Null,
              'BadBurn' : IDL.Record({ 'min_burn_amount' : IDL.Nat }),
              'Duplicate' : IDL.Record({ 'duplicate_of' : IDL.Nat }),
              'BadFee' : IDL.Record({ 'expected_fee' : IDL.Nat }),
              'CreatedInFuture' : IDL.Record({ 'ledger_time' : IDL.Nat64 }),
              'TooOld' : IDL.Null,
              'InsufficientFunds' : IDL.Record({ 'balance' : IDL.Nat }),
            }),
          }),
        ],
        [],
      ),
  });
};
export const init = ({ IDL }) => { return []; };
