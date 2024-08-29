/** Interface that a bank account needs to implement */
export interface Account {
    checkBalance(): number;

    deposit(amount: number): void;

    withdraw(amount: number): void;

    transfer(recipient: string, amount: number): void;
}