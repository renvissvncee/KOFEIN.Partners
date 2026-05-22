import { Router } from 'express';
import { getOrders, updateOrderStatus } from '../controllers/ordersController.js';

const router = Router();

router.get('/', getOrders);
router.put('/:id/status', updateOrderStatus);

export default router;
