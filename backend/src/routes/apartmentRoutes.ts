import { Router } from 'express';
import { apartmentController } from '../controllers/apartmentController';
import { validateBody, validateQuery } from '../middleware/validateRequest';
import { 
  createApartmentSchema, 
  updateApartmentSchema,
  apartmentFiltersSchema 
} from '../validation/apartmentSchema';

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Apartments
 *   description: Apartment management endpoints
 */

// POST /api/apartments - Create new apartment
router.post('/', validateBody(createApartmentSchema), apartmentController.createApartment.bind(apartmentController));

// GET /api/apartments/locations - Get popular locations
router.get('/locations', apartmentController.getPopularLocations.bind(apartmentController));

// POST /api/apartments/search - Filter apartments based on request body
router.post('/search', validateBody(apartmentFiltersSchema), apartmentController.filterApartments.bind(apartmentController));

// GET /api/apartments/:id - Get apartment by ID
router.get('/:id', apartmentController.getApartmentById.bind(apartmentController));

// PUT /api/apartments/:id - Update apartment
router.put('/:id', validateBody(updateApartmentSchema), apartmentController.updateApartment.bind(apartmentController));

// DELETE /api/apartments/:id - Delete apartment
router.delete('/:id', apartmentController.deleteApartment.bind(apartmentController));

export default router;

