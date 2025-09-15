// server/src/controllers/paypalController.js
import { createOrder, captureOrder } from '../utils/paypalClient.js';
import Order from '../models/Order.js';
import { sendMail } from '../utils/mailer.js';

function genOrderId() {
  const ts = Date.now().toString().slice(-8);
  const rnd = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
  return `ODR-${ts}${rnd}`;
}

export const createPaypalOrder = async (req, res) => {
  try {
    const { summary } = req.body || {};
    const total = Number(summary?.total || 0);
    const currency = summary?.currency || 'USD';
    if (!(total > 0)) return res.status(400).json({ message: 'Invalid total' });

    const created = await createOrder(total, currency);
    return res.json({ id: created.id });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ message: 'Failed to create PayPal order' });
  }
};

export const capturePaypalOrder = async (req, res) => {
  try {
    const { orderId: paypalOrderId, cart, customer, summary } = req.body || {};
    if (!paypalOrderId) return res.status(400).json({ message: 'Missing orderId' });

    const captured = await captureOrder(paypalOrderId);
    const cap = captured?.purchase_units?.[0]?.payments?.captures?.[0];
    const status = cap?.status || captured?.status;
    if (status !== 'COMPLETED') return res.status(400).json({ message: 'Payment not completed', status });

    const appOrderId = genOrderId();
    const order = await Order.create({
      orderId: appOrderId,
      method: 'paypal',
      status: 'PAID',
      paypal: { orderId: paypalOrderId, captureId: cap?.id || '', raw: captured },
      customer, items: cart, summary,
    });

    const rows = (cart || [])
      .map(i => `<tr><td>${i.title}</td><td>${i.qty}</td><td>${(i.unitPrice).toFixed(2)}</td><td>${(i.lineTotal).toFixed(2)}</td></tr>`)
      .join('');
    const html = `
      <div style="font-family:system-ui,Arial,sans-serif;color:#000">
        <h1 style="margin:0 0 8px">PnP Art Studio</h1>
        <h2 style="margin:0 0 12px">Order Confirmed: ${order.orderId}</h2>
        <p>Thank you for your purchase, ${customer?.name || ''}.</p>
        <p><strong>Total:</strong> ${summary?.currency || 'USD'} ${Number(summary?.total || 0).toFixed(2)}</p>
        <table border="1" cellpadding="6" cellspacing="0" style="border-collapse:collapse">
          <thead><tr><th>Item</th><th>Qty</th><th>Unit</th><th>Total</th></tr></thead>
          <tbody>${rows}</tbody>
        </table>
        <p><strong>Shipping:</strong> ${customer?.address?.line1 || ''}, ${customer?.address?.city || ''}, ${customer?.address?.state || ''} ${customer?.address?.postal_code || ''}, ${customer?.address?.country || ''}</p>
      </div>
    `;
    if (customer?.email) {
      await sendMail(customer.email, `PnP Art Studio: Order ${order.orderId} confirmed`, html);
    }

    return res.json({ ok: true, orderId: appOrderId });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ message: 'Failed to capture & save order' });
  }
};
