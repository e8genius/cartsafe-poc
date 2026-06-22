import type {
  CartValidationsGenerateRunInput,
  CartValidationsGenerateRunResult,
  ValidationError,
} from "../generated/api";

export function cartValidationsGenerateRun(input: CartValidationsGenerateRunInput): CartValidationsGenerateRunResult {
  const discountApplications = input.cart.discountApplications || [];

  if (discountApplications.length > 1) {
    const error: ValidationError = {
      message: "Multiple discounts are not allowed. Please remove one of the discounts.",
      target: "$.cart"
    };
    return {
      operations: [
        {
          validationAdd: {
            errors: [error]
          }
        }
      ]
    };
  }

  return { operations: [] };
}