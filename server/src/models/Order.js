import Order from '../models/Order.js';

// Create order after successful payment/capture
export async function createOrder(req, res) {
  try {
    const {
      userId,
      customer,
      items,
      shippingAddress,
      billingAddress,
      totals,
      referenceId,
      paypalOrderId,
      intent,
      status,
      approvalLink,
      paypalCreateResponse,
      paypalCaptureResponse,
      captures,
      webhooks
    } = req.body;

    // Generate reference ID if not provided
    const finalReferenceId = referenceId || `ORD-${Date.now().toString().slice(-6)}`;

    const order = await Order.create({
      userId,
      customer,
      items: items.map(item => ({
        productId: item.id,
        name: item.name || item.title,
        qty: item.quantity,
        price: item.price,
        total: item.price * item.quantity,
        variant: item.variant
      })),
      shippingAddress: {
        fullName: `${shippingAddress.firstName} ${shippingAddress.lastName}`,
        line1: shippingAddress.address1,
        line2: shippingAddress.address2,
        city: shippingAddress.city,
        state: shippingAddress.state,
        postalCode: shippingAddress.zip,
        countryCode: shippingAddress.country,
        phone: shippingAddress.phone,
        email: shippingAddress.email
      },
      billingAddress: billingAddress ? {
        fullName: `${billingAddress.firstName} ${billingAddress.lastName}`,
        line1: billingAddress.address1,
        line2: billingAddress.address2,
        city: billingAddress.city,
        state: billingAddress.state,
        postalCode: billingAddress.zip,
        countryCode: billingAddress.country,
        phone: billingAddress.phone,
        email: billingAddress.email
      } : null,
      totals: {
        subtotal: totals.subtotal,
        tax: totals.tax,
        shipping: totals.shipping,
        discount: totals.discount,
        grandTotal: totals.total,
        currency: 'USD'
      },
      referenceId: finalReferenceId,
      paypalOrderId,
      intent: intent || 'CAPTURE',
      status: status || 'CREATED',
      approvalLink,
      paypalCreateResponse,
      paypalCaptureResponse,
      captures: captures || [],
      webhooks: webhooks || []
    });

    res.status(201).json({
      success: true,
      orderId: order._id,
      referenceId: order.referenceId,
      order
    });
  } catch (error) {
    console.error('Create order error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to create order',
      details: error.message 
    });
  }
}

// List all orders (admin)
export async function getOrders(req, res) {
  try {
    const { page = 1, limit = 50, status, paypalOrderId } = req.query;
    
    const filter = {};
    if (status) filter.status = status;
    if (paypalOrderId) filter.paypalOrderId = paypalOrderId;

    const orders = await Order.find(filter)
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .lean();

    const total = await Order.countDocuments(filter);

    // Transform for admin UI compatibility
    const items = orders.map(order => ({
      _id: order._id,
      orderNo: order.referenceId,
      customer: {
        name: `${order.customer?.firstName || ''} ${order.customer?.lastName || ''}`.trim(),
        email: order.customer?.email
      },
      customerName: `${order.customer?.firstName || ''} ${order.customer?.lastName || ''}`.trim(),
      items: order.items.map(item => ({
        title: item.name,
        qty: item.qty,
        price: item.price
      })),
      subTotal: order.totals?.subtotal || 0,
      shipping: { amount: order.totals?.shipping || 0 },
      tax: order.totals?.tax || 0,
      total: order.totals?.grandTotal || 0,
      discounts: order.totals?.discount ? [{ amount: order.totals.discount }] : [],
      status: order.status?.toLowerCase() || 'pending',
      shippingAddress: order.shippingAddress,
      notes: order.referenceId,
      createdAt: order.createdAt
    }));

    res.json({ 
      success: true, 
      items, 
      total, 
      page: parseInt(page), 
      limit: parseInt(limit) 
    });
  } catch (error) {
    console.error('Get orders error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to fetch orders' 
    });
  }
}

// Update order status (admin)
export async function updateOrderStatus(req, res) {
  try {
    const { id } = req.params;
    const { status } = req.body;
    
    const validStatuses = [
      'CREATED', 'SAVED', 'APPROVED', 'VOIDED', 'COMPLETED', 'PAYER_ACTION_REQUIRED',
      'pending', 'paid', 'fulfilled', 'unfulfilled', 'cancelled', 'refunded', 'failed'
    ];
    
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ 
        success: false, 
        error: 'Invalid status' 
      });
    }

    const order = await Order.findByIdAndUpdate(
      id,
      { 
        status,
        updatedAt: new Date()
      },
      { new: true }
    );

    if (!order) {
      return res.status(404).json({ 
        success: false, 
        error: 'Order not found' 
      });
    }

    res.json({ 
      success: true, 
      status: order.status,
      order 
    });
  } catch (error) {
    console.error('Update order status error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to update order status' 
    });
  }
}

// Get single order (for details)
export async function getOrder(req, res) {
  try {
    const { id } = req.params;
    const order = await Order.findById(id).lean();
    
    if (!order) {
      return res.status(404).json({ 
        success: false, 
        error: 'Order not found' 
      });
    }

    res.json({ 
      success: true, 
      order 
    });
  } catch (error) {
    console.error('Get order error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to fetch order' 
    });
  }
}

// Update order with PayPal capture response
export async function updateOrderWithCapture(req, res) {
  try {
    const { paypalOrderId } = req.params;
    const { captureResponse } = req.body;

    const order = await Order.findOneAndUpdate(
      { paypalOrderId },
      { 
        paypalCaptureResponse: captureResponse,
        status: 'COMPLETED',
        $push: { 
          captures: captureResponse 
        }
      },
      { new: true }
    );

    if (!order) {
      return res.status(404).json({ 
        success: false, 
        error: 'Order not found' 
      });
    }

    res.json({ 
      success: true, 
      order 
    });
  } catch (error) {
    console.error('Update capture error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to update capture' 
    });
  }
}

// Add webhook event to order
export async function addWebhookEvent(req, res) {
  try {
    const { paypalOrderId } = req.params;
    const webhookEvent = req.body;

    const order = await Order.findOneAndUpdate(
      { paypalOrderId },
      { 
        $push: { 
          webhooks: {
            ...webhookEvent,
            receivedAt: new Date()
          }
        }
      },
      { new: true }
    );

    if (!order) {
      return res.status(404).json({ 
        success: false, 
        error: 'Order not found' 
      });
    }

    res.json({ 
      success: true, 
      order 
    });
  } catch (error) {
    console.error('Add webhook error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to add webhook event' 
    });
  }
}
