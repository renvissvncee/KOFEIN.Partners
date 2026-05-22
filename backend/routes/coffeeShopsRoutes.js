import { Router } from 'express';
import { getCoffeeShop, updateCoffeeShop, getStaff, addStaff, removeStaff } from '../controllers/coffeeShopsController.js';

const router = Router();

router.get('/:id', getCoffeeShop);
router.put('/:id', updateCoffeeShop);
router.get('/:id/staff', getStaff);
router.post('/:id/staff', addStaff);
router.delete('/:id/staff/:telegramId', removeStaff);

export default router;
