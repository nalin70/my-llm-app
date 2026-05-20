import { Router } from 'express';
import { FundController } from '../controller/fundController';

const fundController = new FundController();

export const fundRoutes = Router();

fundRoutes.get('/search', (request, response, next) => {
  fundController.searchFundsByName(request, response).catch(next);
});
