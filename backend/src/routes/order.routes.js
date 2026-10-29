import { Router } from 'express';
import { orderService } from '../services/order/orderService.js';
import { requireAuth } from '../middleware/auth.js';
import { asyncHandler, ok, created } from '../utils/index.js';
import { createOrderRequest } from '@marketforge/shared/types';

const router = Router();

router.post('/review', requireAuth, asyncHandler(async (req, res) => {
  const reqObj = createOrderRequest(req.body);
  const result = await orderService.reviewOrder(req.user.id, reqObj);
  ok(res, result);
}));

router.post('/', requireAuth, asyncHandler(async (req, res) => {
  const reqObj = createOrderRequest(req.body);
  const order = await orderService.createOrder(req.user.id, reqObj);
  created(res, order);
}));

router.post('/:id/confirm', requireAuth, asyncHandler(async (req, res) => {
  // Confirm an order if pending
  const order = await orderService.getOrderById(req.user.id, req.params.id);
  ok(res, order);
}));

router.delete('/:id', requireAuth, asyncHandler(async (req, res) => {
  const cancelled = await orderService.cancelOrder(req.user.id, req.params.id);
  ok(res, cancelled);
}));

router.get('/', requireAuth, asyncHandler(async (req, res) => {
  const orders = await orderService.getUserOrders(req.user.id, {
    status: req.query.status,
    limit: Number(req.query.limit) || 50,
  });
  ok(res, orders);
}));

router.get('/:id', requireAuth, asyncHandler(async (req, res) => {
  const order = await orderService.getOrderById(req.user.id, req.params.id);
  ok(res, order);
}));

export default router;
