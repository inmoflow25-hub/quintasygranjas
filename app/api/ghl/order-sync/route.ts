await fetch("URL_DEL_WEBHOOK_GHL", {
  method: "POST",
  headers: {
    "Content-Type": "application/json"
  },
  body: JSON.stringify({
    order_id: order.id,
    customer_name: order.customer_name,
    customer_email: order.customer_email,
    customer_phone: order.customer_phone,
    price: order.price,
    source: order.source || "web_app",
    status: order.status,
    payment_status: order.payment_status,
    order_type: order.box_id ? "box" : "custom_cart",
    box_id: order.box_id,
    created_at: order.created_at
  })
});
