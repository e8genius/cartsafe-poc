import type {
  CartPaymentMethodsTransformRunInput,
  CartPaymentMethodsTransformRunResult,
} from "../generated/api";

const NO_CHANGES: CartPaymentMethodsTransformRunResult = {
  operations: [],
};

export function cartPaymentMethodsTransformRun(input: CartPaymentMethodsTransformRunInput): CartPaymentMethodsTransformRunResult {
  // 1. Get the _discount_active cart attribute
  const discountActiveAttr = input.cart?.attribute?.value;
  
  // 2. Check if the discount is active
  if (discountActiveAttr !== "true") {
    return NO_CHANGES;
  }

  // 3. Filter payment methods that look like a Gift Card
  // We match against "gift_card", "gift-card", "gift card", "giftcard" and Hebrew "כרטיס מתנה" (case-insensitive)
  const giftCardRegex = /gift[-_\s]?card|כרטיס\s+מתנה/i;

  const giftCardMethods = input.paymentMethods.filter(method => 
    giftCardRegex.test(method.name) || giftCardRegex.test(method.id)
  );

  if (giftCardMethods.length === 0) {
    return NO_CHANGES;
  }

  // 4. Return hide operations for all matched gift card payment methods
  const operations = giftCardMethods.map(method => ({
    paymentMethodHide: {
      paymentMethodId: method.id
    }
  }));

  return { operations };
}