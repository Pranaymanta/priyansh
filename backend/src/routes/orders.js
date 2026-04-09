import express from 'express';
import { supabase } from '../config/supabase.js';
import { authMiddleware } from '../middleware/auth.js';

const router = express.Router();

// Create new order
router.post('/create', authMiddleware, async (req, res) => {
  try {
    const { restaurantId, items, deliveryAddress, totalPrice } = req.body;
    const userId = req.user.id;

    const { data: order, error } = await supabase
      .from('orders')
      .insert({
        customer_id: userId,
        restaurant_id: restaurantId,
        items: items,
        delivery_address: deliveryAddress,
        total_price: totalPrice,
        status: 'pending',
        created_at: new Date(),
      })
      .select();

    if (error) throw error;

    res.status(201).json({
      message: 'Order created successfully',
      order: order[0],
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get orders for customer
router.get('/customer/:customerId', authMiddleware, async (req, res) => {
  try {
    const { data: orders, error } = await supabase
      .from('orders')
      .select('*')
      .eq('customer_id', req.params.customerId)
      .order('created_at', { ascending: false });

    if (error) throw error;

    res.status(200).json(orders);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get orders for restaurant
router.get('/restaurant/:restaurantId', authMiddleware, async (req, res) => {
  try {
    const { data: orders, error } = await supabase
      .from('orders')
      .select('*')
      .eq('restaurant_id', req.params.restaurantId)
      .order('created_at', { ascending: false });

    if (error) throw error;

    res.status(200).json(orders);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update order status
router.patch('/update-status/:orderId', authMiddleware, async (req, res) => {
  try {
    const { status } = req.body;

    const { data: order, error } = await supabase
      .from('orders')
      .update({ status, updated_at: new Date() })
      .eq('id', req.params.orderId)
      .select();

    if (error) throw error;

    res.status(200).json({
      message: 'Order status updated',
      order: order[0],
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get order details with real-time updates
router.get('/:orderId', authMiddleware, async (req, res) => {
  try {
    const { data: order, error } = await supabase
      .from('orders')
      .select('*')
      .eq('id', req.params.orderId)
      .single();

    if (error) throw error;

    res.status(200).json(order);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;