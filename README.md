# How to run

The code was tested using Node v22. To install the depdencies:
```shell
npm install
```

Then to run the tests:
```shell
npm run test
```

# Overall structure

Three interfaces were defined: `Bank`, `Account` and `Manager`, outlining the various functions that each entity needs to perform.

These interfaces were then implemented as non-exported classes in `impl.ts`. This had the advantage of allowing some of the methods of the classes to be public so that instances of other classes could access them (e.g. ability for an account to update the overall bank's balance on withdrawal or deposit), but not have those methods available outside the file due to the non export. All outside interactions with the classes are purely happening through the interfaces.

This also means that the constructors of those classes are not available, meaning that the only way to create a new account is to call `createAccount()` on a `Bank`, as opposed to allowing other code to create their own instances.

# Implementation choices and trade-offs

## Representing amounts

All the amounts and balances are represented using the `number` type. If we wanted to be rigorous and avoid any potential floating point arithmetic errors when updating balances, it would probably be wiser to strictly store and manipulate amounts as integers (e.g. the number of cents).

## Concurrency

In its current state, the implementation may not be safe for concurrent operations. A potential improvement could be to introduce mutexes to ensure that several operations do not modify the balance at the same time, or that in the case of a withdrawal or transfer that there might be a change in the balance between when the balance is checked and when the operation is executed.

Introducing mutexes or other mechanisms to ensure safety of concurrent operations would also likely mean that the various methods (particularly on `Account`) would either become `async` or be updated to return a `Promise` instead.

## Return values

Given this was a relatively simple code with no real-life usage, some methods such as `withdraw` or `deposit` do not return anything. Instead, it is assumed that if the call returns successfully (i.e. does not throw an exception) then the operation was executed. Given that in those cases the output would be strictly equal to the input (the amount being withdrawn / deposited), I saw little value in returning it. It would be a trivial change to return it if we wanted that behaviour instead.

## Input validation

Two forms of input validation have been implemented:
- Validating amounts (usually ensuring they are positive)
- Validating names when creating new accounts

At the moment, the name validation consists of trimming the input and ensuring that the resulting name isn't empty. Other checks or validations could easily be added if there was a requirement for them.