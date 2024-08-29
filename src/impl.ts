import {Account} from "./account";
import {Bank} from "./bank";
import {Manager} from "./manager";

import {
    InsufficientBalanceError,
    InvalidAmountError,
    InvalidNameError,
    MissingAccountError,
    NameAlreadyExistsError
} from "./errors";

/**
 * Helper method to validate that an amount is valid
 *
 * @param amount The amount to validate
 *
 * @throws {InvalidAmountError} if the amount is invalid
 */
function validateAmount(amount: number) {
    if (amount <= 0) {
        throw new InvalidAmountError();
    }
}

/**
 * Represents a bank
 */
class BankImpl implements Bank {
    /** The accounts held at the bank */
    private readonly accounts: Map<string, AccountImpl> = new Map<string, AccountImpl>();

    /** The total balance held at the bank across all accounts */
    private totalBalance = 0;

    /**
     * Gets the total balance of the bank across all accounts
     *
     * @returns The total balance of the bank
     */
    getTotalBalance(): number {
        return this.totalBalance;
    }

    /**
     * Updates the total balance of the bank after a deposit into an account
     *
     * @param amount - The amount being deposited
     */
    deposit(amount: number) {
        this.totalBalance += amount;
    }

    /**
     * Updates the total balance of the bank after a withdrawal from an account
     *
     * @param amount - The amount being withdrawn
     */
    withdraw(amount: number) {
        // No need to check here if the resulting balance would be non-negative,
        // because if all accounts have a non-negative balance then the total balance (sum) will also be non-negative.
        this.totalBalance -= amount;
    }

    /**
     * Gets a given account by name
     *
     * @param name - The name of the account to retrieve
     *
     * @returns The retrieved account
     *
     * @throws {MissingAccountError} if the account does not exist within the bank
     */
    getAccountByName(name: string): AccountImpl {
        const account = this.accounts.get(name);
        if (!account) {
            throw new MissingAccountError(`no account with name ${name}`);
        }
        return account;
    }

    /**
     * Create an account with the given name and initial balance
     *
     * @param name - The name of the account
     * @param balance - The initial balance of the account
     *
     * @returns The newly created account
     *
     * @throws {InvalidAmountError} if the initial balance isn't valid
     * @throws {InvalidNameError} if the provided name is empty
     * @throws {NameAlreadyExistsError} if an account with that name already exists
     */
    createAccount(name: string, balance: number): Account {
        // Input validation
        validateAmount(balance);

        if (this.accounts.has(name)) {
            throw new NameAlreadyExistsError("an account with that name already exists");
        }

        // Create the account
        const account = new AccountImpl(this, name, balance);

        // Persist the account
        this.accounts.set(name, account);
        this.totalBalance += balance;

        return account;
    }
}

/**
 * Represents a bank account
 */
class AccountImpl implements Account {
    /**
     * @param bank - The {@link Bank} that the account belongs to
     * @param name - The name of the account
     * @param balance - The balance of the account
     */
    constructor(
        private readonly bank: BankImpl,
        private readonly name: string,
        private balance: number,
    ) {
        // Input validation
        validateAmount(balance);

        this.name = name.trim();
        if (name.length === 0) {
            throw new InvalidNameError("a valid name needs to be provided");
        }
    }

    /**
     * Deposits a given amount into the account
     *
     * @param amount - The amount being deposited
     *
     * @throws {InvalidAmountError} if the provided amount isn't valid
     */
    deposit(amount: number) {
        // Input validation
        validateAmount(amount);

        // Perform the operation
        this.balance += amount;

        // Ensure that the total balance of the bank is updated accordingly
        this.bank.deposit(amount);
    }

    /**
     * Withdraws the given amount from the account
     *
     * @param amount - The amount being withdrawn
     *
     * @throws {InvalidAmountError} if the amount isn't valid
     * @throws {InsufficientBalanceError} if the account's balance is insufficient
     */
    withdraw(amount: number) {
        // Input validation
        validateAmount(amount);

        if (this.balance < amount) {
            throw new InsufficientBalanceError(`balance of ${this.balance} is insufficient to withdraw ${amount}`);
        }

        // Perform the operation
        this.balance -= amount;

        // Ensure that the total balance of the bank is updated accordingly
        this.bank.withdraw(amount);
    }

    /**
     * Transfers the given amount to the given recipient
     *
     * @param recipient -  The recipient of the transfer
     * @param amount - The amount being transferred
     *
     * @throws {InvalidAmountError} if the amount isn't valid
     * @throws {InsufficientBalanceError} if the account's balance is insufficient
     * @throws {MissingAccountError} if the recipient doesn't exist within the bank
     */
    transfer(recipient: string, amount: number) {
        // Input validation
        validateAmount(amount);

        if (this.balance < amount) {
            throw new InsufficientBalanceError(`balance of ${this.balance} is insufficient to transfer ${amount}`);
        }

        // no-op if the sender is the same as the recipient
        if (this.name === recipient) {
            return;
        }

        // Perform the operation

        // this might throw an exception if the recipient is not found
        const recipientAccount = this.bank.getAccountByName(recipient);
        this.balance -= amount;
        recipientAccount.receiveTransfer(amount);

        // No need to update the bank's total balance as money stayed within the bank
    }

    /**
     * Checks the current balance of the account
     *
     * @returns The current balance of the account
     */
    checkBalance(): number {
        return this.balance;
    }

    /**
     * Receive a transfer from another account
     *
     * @param amount - The amount being transferred
     */
    private receiveTransfer(amount: number) {
        // The method is private and only ever called as part of a transfer which has already validated the input,
        // hence why we do not need to re-validate the inputs here.
        this.balance += amount;
    }
}

/**
 * Represents the manager of a bank
 */
class ManagerImpl implements Manager {
    /**
     * @param bank - The {@link Bank} that this instance is a manager of
     */
    constructor(
        private readonly bank: BankImpl
    ) {
    }

    /**
     * Check the total balance of the bank across all the accounts
     *
     * @returns The total balance of the bank
     */
    getTotalBankBalance(): number {
        return this.bank.getTotalBalance();
    }
}

/**
 * Represents the result of creating a new bank.
 */
interface BankCreationResult {
    /** The {@link Bank} that was created */
    bank: Bank,
    /** The {@link Manager} of the bank */
    manager: Manager,
}

/**
 * Helper method to create a new bank.
 *
 * @returns The created {@link Bank} and its {@link Manager}
 */
export function createBank(): BankCreationResult {
    const bank = new BankImpl();
    const manager = new ManagerImpl(bank);

    return {bank, manager};
}