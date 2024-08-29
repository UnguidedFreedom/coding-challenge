/**
 * Represents the error thrown when an amount is invalid
 */
export class InvalidAmountError extends Error {
}

/**
 * Represents the error thrown when an account's balance is insufficient for a given transaction
 */
export class InsufficientBalanceError extends Error {
}

/**
 * Represents the error thrown when an account is not found within the bank
 */
export class MissingAccountError extends Error {
}

/**
 * Represents the error thrown when an account name is invalid
 */
export class InvalidNameError extends Error {
}

/**
 * Represents the error thrown when an account name conflict occurs
 */
export class NameAlreadyExistsError extends Error {
}
