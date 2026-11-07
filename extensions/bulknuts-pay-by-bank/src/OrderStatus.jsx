import '@shopify/ui-extensions/preact';
import {render} from 'preact';
import {useEffect, useState} from 'preact/hooks';

const WORKER_URL = 'https://bulknuts-pay-by-bank.eservice-ginco.workers.dev';

export default function extension() {
  render(<Extension />, document.body);
}

function Extension() {
  const order = shopify.order.value;
  const [unpaid, setUnpaid] = useState(null);

  useEffect(() => {
    if (!order?.id) return;
    fetch('shopify://customer-account/api/2026-10/graphql.json', {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({
        query: `query($id: ID!) {
          order(id: $id) { cancelledAt financialStatus totalPrice { amount currencyCode } }
        }`,
        variables: {id: order.id},
      }),
    })
      .then((r) => r.json())
      .then(({data}) => {
        const o = data?.order;
        if (!o || o.cancelledAt) return setUnpaid(false);
        const isUnpaid = ['PENDING', 'PARTIALLY_PAID'].includes(o.financialStatus);
        setUnpaid(isUnpaid ? o.totalPrice : false);
      })
      .catch(() => setUnpaid(false));
  }, [order?.id]);

  if (!unpaid) return null;

  const orderId = String(order.id).split('/').pop();
  const amount = new Intl.NumberFormat('en-GB', {
    style: 'currency',
    currency: unpaid.currencyCode,
  }).format(Number(unpaid.amount));

  return (
    <s-banner tone="critical" heading="Payment pending">
      <s-stack gap="base">
        <s-heading>Order {order.name} will not be processed until you make payment.</s-heading>
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
