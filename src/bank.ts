import {Account} from "./account";

/** Interface that a bank needs to implement */
export interface Bank {
    createAccount(name: string, balance: number): Account;
}
