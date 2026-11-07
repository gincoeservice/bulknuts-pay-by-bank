import '@shopify/ui-extensions/preact';
import {render} from 'preact';

const WORKER_URL = 'https://bulknuts-pay-by-bank.eservice-ginco.workers.dev';

export default function extension() {
  render(<Extension />, document.body);
}

function Extension() {
  const order = shopify.orderConfirmation.value?.order;
  const total = shopify.cost.totalAmount.value;
  const payments = shopify.selectedPaymentOptions?.value || [];

  const isPayByBank = payments.some((p) => p.type === 'manualPayment');
  if (!order || !isPayByBank) return null;

  const orderId = String(order.id).split('/').pop();
  const amount = new Intl.NumberFormat('en-GB', {
    style: 'currency',
    currency: total.currencyCode,
  }).format(Number(total.amount));

  return (
    <s-banner tone="critical" heading="Payment pending">
      <s-stack gap="base">
        <s-heading>Order will not be processed until you make payment.</s-heading>
        <s-button variant="primary" href={`${WORKER_URL}/pay?order=${orderId}`}>
          Pay {amount} by Bank
        </s-button>
        <s-text color="subdued">
          Pay by Bank is secure (powered by GoCardless). Approve the payment in your banking app – no card needed.
        </s-text>
      </s-stack>
    </s-banner>
  );
}
