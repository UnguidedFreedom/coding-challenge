import {Bank} from "./bank";
import {Manager} from "./manager";
import {Account} from "./account";

import {createBank} from "./impl";

import {
    InsufficientBalanceError,
    InvalidAmountError,
    InvalidNameError, MissingAccountError,
    NameAlreadyExistsError,
} from "./errors";

describe("Bank", () => {
    test("overall scenario", () => {
        const {bank, manager} = createBank();
        const firstAccount = bank.createAccount("Erin", 50);
        const secondAccount = bank.createAccount("Paul", 20);

        expect(manager.getTotalBankBalance()).toBe(70);

        // Deposit into the first account
        firstAccount.deposit(30);
        expect(firstAccount.checkBalance()).toBe(80);
        expect(manager.getTotalBankBalance()).toBe(100);

        // Transfer between accounts
        firstAccount.transfer("Paul", 25);
        expect(firstAccount.checkBalance()).toBe(55);
        expect(secondAccount.checkBalance()).toBe(45);
        expect(manager.getTotalBankBalance()).toBe(100);

        // Withdraw from the second account
        secondAccount.withdraw(30);
        expect(secondAccount.checkBalance()).toBe(15);
        expect(manager.getTotalBankBalance()).toBe(70);
    });

    describe("createBank()", () => {
        it("should create a bank", () => {
            const {bank, manager} = createBank();
            expect(bank).not.toBeNull();
            expect(manager).not.toBeNull();
        });

        it("should have an initial bank balance of 0", () => {
            const {manager} = createBank();
            expect(manager.getTotalBankBalance()).toBe(0);
        });
    });

    describe("createAccount()", () => {
        let bank: Bank;
        let manager: Manager;

        beforeEach(() => {
            const result = createBank();
            bank = result.bank;
            manager = result.manager;
        });

        it("should create an account", () => {
            const account = bank.createAccount("Erin", 50);
            expect(account).not.toBeNull();
        });

        it("should create multiple accounts", () => {
            const firstAccount = bank.createAccount("Erin", 50);
            const secondAccount = bank.createAccount("Paul", 20);
            expect(firstAccount).not.toBeNull();
            expect(secondAccount).not.toBeNull();
        });

        it("should throw an error when creating an account with an invalid balance", () => {
            const creation = () => bank.createAccount("Erin", -50);
            expect(creation).toThrow(InvalidAmountError);
        });

        it("should throw an error when creating an account with an invalid name", () => {
            const creation = () => bank.createAccount("", 50);
            expect(creation).toThrow(InvalidNameError);
        });

        it("should throw an error when creating an account with an existing name", () => {
            const creation = () => bank.createAccount("Erin", 50);
            expect(creation).not.toThrow(); // First execution should pass
            expect(creation).toThrow(NameAlreadyExistsError); // Second execution should throw
        });

        it("should initialise the account's balance", () => {
            const account = bank.createAccount("Erin", 50);
            expect(account.checkBalance()).toBe(50);
        });

        it("should add the opening balance to the bank's total balance", () => {
            bank.createAccount("Erin", 50);
            expect(manager.getTotalBankBalance()).toBe(50);
        });

        it("should add the opening balances to the bank's total balance when opening several accounts", () => {
            bank.createAccount("Erin", 50);
            bank.createAccount("Paul", 20);
            expect(manager.getTotalBankBalance()).toBe(70);
        });
    });
});

describe("Account", () => {
    let account: Account;
    let bank: Bank;
    let manager: Manager;

    beforeEach(() => {
        const result = createBank();
        bank = result.bank;
        manager = result.manager;

        account = bank.createAccount("Erin", 50);
    });

    describe("deposit()", () => {
        it("should deposit an amount in an account", () => {
            const deposit = () => account.deposit(25);
            expect(deposit).not.toThrow();
            expect(account.checkBalance()).toBe(75);
        });

        it("should handle multiple deposits in an account", () => {
            const deposit = () => account.deposit(25);
            expect(deposit).not.toThrow();
            expect(deposit).not.toThrow();
            expect(account.checkBalance()).toBe(100);
        });

        it("should update the bank's total balance", () => {
            account.deposit(25);
            expect(manager.getTotalBankBalance()).toBe(75);
        });

        it("should throw an error if the amount is invalid", () => {
            const deposit = () => account.deposit(-5);
            expect(deposit).toThrow(InvalidAmountError);
        });
    });

    describe("withdraw()", () => {
        it("should withdraw an amount from an account", () => {
            const withdrawal = () => account.withdraw(20);
            expect(withdrawal).not.toThrow();
            expect(account.checkBalance()).toBe(30);
        });

        it("should handle multiple withdrawals from an account", () => {
            const withdrawal = () => account.withdraw(20);
            expect(withdrawal).not.toThrow();
            expect(withdrawal).not.toThrow();
            expect(account.checkBalance()).toBe(10);
        });

        it("should update the bank's total balance", () => {
            account.withdraw(20);
            expect(manager.getTotalBankBalance()).toBe(30);
        });

        it("should allow a withdrawal that brings the balance to 0", () => {
            const withdrawal = () => account.withdraw(50);
            expect(withdrawal).not.toThrow();
            expect(account.checkBalance()).toBe(0);
        });

        it("should throw an error if balance is insufficient", () => {
            const withdrawal = () => account.withdraw(70);
            expect(withdrawal).toThrow(InsufficientBalanceError);
        });

        it("should throw an error if the amount is invalid", () => {
            const withdrawal = () => account.withdraw(-5);
            expect(withdrawal).toThrow(InvalidAmountError);
        });
    });

    describe("transfer()", () => {
        let otherAccount: Account;
        beforeEach(() => {
            otherAccount = bank.createAccount("Paul", 20);
        });

        it("should transfer between two accounts", () => {
            const transfer = () => account.transfer("Paul", 10);
            expect(transfer).not.toThrow();
            expect(account.checkBalance()).toBe(40);
            expect(otherAccount.checkBalance()).toBe(30);
        });

        it("should handle multiple transfers between accounts", () => {
            const transfer = () => account.transfer("Paul", 10);
            expect(transfer).not.toThrow();
            expect(transfer).not.toThrow();
            expect(account.checkBalance()).toBe(30);
            expect(otherAccount.checkBalance()).toBe(40);
        });

        it("should not update the bank's total balance", () => {
            const previousBalance = manager.getTotalBankBalance();
            account.transfer("Paul", 10);
            expect(manager.getTotalBankBalance()).toBe(previousBalance);
        });

        it("should throw an error if the amount is invalid", () => {
            const transfer = () => account.transfer("Paul", -5);
            expect(transfer).toThrow(InvalidAmountError);
        });

        it("should throw an error if the recipient does not exist", () => {
            const transfer = () => account.transfer("John Doe", 20);
            expect(transfer).toThrow(MissingAccountError);
        });

        it("should not do anything if the recipient is the same as the sender", () => {
            const previousBalance = account.checkBalance();
            const transfer = () => account.transfer("Erin", 20);
            expect(transfer).not.toThrow();
            expect(account.checkBalance()).toBe(previousBalance);
        });

        it("should handle a transfer that brings the balance to 0", () => {
            const transfer = () => account.transfer("Paul", 50);
            expect(transfer).not.toThrow();
            expect(account.checkBalance()).toBe(0);
        });

        it("should throw an error if the balance is insufficient", () => {
            const transfer = () => account.transfer("Paul", 100);
            expect(transfer).toThrow(InsufficientBalanceError);
        });
    });
});