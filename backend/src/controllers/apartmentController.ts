import { Request, Response } from 'express';
import { apartmentService } from '../services/apartmentService';
import { CreateApartmentRequest, UpdateApartmentRequest, ApartmentFilters } from '../types/apartment';
import { logger } from '../utils/logger';

logger.info('Apartment controller loaded');

/**
 * @swagger
 * components:
 *   schemas:
 *     Apartment:
 *       type: object
 *       required:
 *         - unitName
 *         - unitNumber
 *         - project
 *         - price
 *         - bedrooms
 *         - bathrooms
 *         - areaSqft
 *         - location
 *       properties:
 *         id:
 *           type: string
 *           description: Unique identifier for the apartment
 *         unitName:
 *           type: string
 *           description: Name of the unit
 *         unitNumber:
 *           type: string
 *           description: Unit number
 *         project:
 *           type: string
 *           description: Project name
 *         price:
 *           type: number
 *           description: Price of the apartment
 *         bedrooms:
 *           type: integer
 *           description: Number of bedrooms
 *         bathrooms:
 *           type: integer
 *           description: Number of bathrooms
 *         areaSqft:
 *           type: integer
 *           description: Area in square feet
 *         location:
 *           type: string
 *           description: Location of the apartment
 *         description:
 *           type: string
 *           description: Description of the apartment
 *         images:
 *           type: array
 *           items:
 *             type: string
 *           description: Array of image URLs
 *         amenities:
 *           type: array
 *           items:
 *             type: string
 *           description: Array of amenities
 *         isAvailable:
 *           type: boolean
 *           description: Whether the apartment is available
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: Creation timestamp
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: Last update timestamp
 */

export class ApartmentController {
  /**
   * @swagger
   * /api/apartments/{id}:
   *   get:
   *     summary: Get apartment by ID
   *     tags: [Apartments]
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *         description: Apartment ID
   *     responses:
   *       200:
   *         description: Apartment details
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 success:
   *                   type: boolean
   *                 data:
   *                   $ref: '#/components/schemas/Apartment'
   *       404:
   *         description: Apartment not found
   *       500:
   *         description: Internal server error
   */
  async getApartmentById(req: Request, res: Response): Promise<void> {
    const { id } = req?.params;
    try {
      if (!id) {
        res.status(400).json({
          success: false,
          message: 'Apartment ID is required'
        });
        return;
      }

      const apartment = await apartmentService.getApartmentById(id);

      if (!apartment) {
        res.status(404).json({
          success: false,
          message: 'Apartment not found'
        });
        return;
      }

      res.status(200).json({
        success: true,
        data: apartment
      });
    } catch (error) {
      logger.error({ error, apartmentId: id }, 'Error fetching apartment by ID');
      res.status(500).json({
        success: false,
        message: 'Failed to fetch apartment',
        error: process.env.NODE_ENV === 'development' ? error : 'Internal server error'
      });
    }
  }

  /**
   * @swagger
   * /api/apartments:
   *   post:
   *     summary: Create a new apartment
   *     tags: [Apartments]
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required:
   *               - unitName
   *               - unitNumber
   *               - project
   *               - price
   *               - bedrooms
   *               - bathrooms
   *               - areaSqft
   *               - location
   *             properties:
   *               unitName:
   *                 type: string
   *               unitNumber:
   *                 type: string
   *               project:
   *                 type: string
   *               price:
   *                 type: number
   *               bedrooms:
   *                 type: integer
   *               bathrooms:
   *                 type: integer
   *               areaSqft:
   *                 type: integer
   *               location:
   *                 type: string
   *               description:
   *                 type: string
   *               images:
   *                 type: array
   *                 items:
   *                   type: string
   *               amenities:
   *                 type: array
   *                 items:
   *                   type: string
   *               isAvailable:
   *                 type: boolean
   *     responses:
   *       201:
   *         description: Apartment created successfully
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 success:
   *                   type: boolean
   *                 data:
   *                   $ref: '#/components/schemas/Apartment'
   *       400:
   *         description: Bad request
   *       500:
   *         description: Internal server error
   */
  async createApartment(req: Request, res: Response): Promise<void> {
    try {
      const apartmentData: CreateApartmentRequest = req.body;

      // Basic validation
      if (!apartmentData.unitName || !apartmentData.unitNumber || !apartmentData.project || 
          !apartmentData.price || !apartmentData.bedrooms || !apartmentData.bathrooms || 
          !apartmentData.areaSqft || !apartmentData.location) {
        res.status(400).json({
          success: false,
          message: 'Missing required fields'
        });
        return;
      }

      const apartment = await apartmentService.createApartment(apartmentData);

      res.status(201).json({
        success: true,
        data: apartment,
        message: 'Apartment created successfully'
      });
    } catch (error) {
      logger.error({ error, data: req.body }, 'Error creating apartment');
      res.status(500).json({
        success: false,
        message: 'Failed to create apartment',
        error: process.env.NODE_ENV === 'development' ? error : 'Internal server error'
      });
    }
  }

  /**
   * @swagger
   * /api/apartments/{id}:
   *   put:
   *     summary: Update an apartment
   *     tags: [Apartments]
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *         description: Apartment ID
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             properties:
   *               unitName:
   *                 type: string
   *               unitNumber:
   *                 type: string
   *               project:
   *                 type: string
   *               price:
   *                 type: number
   *               bedrooms:
   *                 type: integer
   *               bathrooms:
   *                 type: integer
   *               areaSqft:
   *                 type: integer
   *               location:
   *                 type: string
   *               description:
   *                 type: string
   *               images:
   *                 type: array
   *                 items:
   *                   type: string
   *               amenities:
   *                 type: array
   *                 items:
   *                   type: string
   *               isAvailable:
   *                 type: boolean
   *     responses:
   *       200:
   *         description: Apartment updated successfully
   *       404:
   *         description: Apartment not found
   *       500:
   *         description: Internal server error
   */
  async updateApartment(req: Request, res: Response): Promise<void> {
    const { id } = req.params;
    const updateData: UpdateApartmentRequest = req.body;
    try {
      if (!id) {
        res.status(400).json({
          success: false,
          message: 'Apartment ID is required'
        });
        return;
      }

      const apartment = await apartmentService.updateApartment(id, updateData);

      if (!apartment) {
        res.status(404).json({
          success: false,
          message: 'Apartment not found'
        });
        return;
      }

      res.status(200).json({
        success: true,
        data: apartment,
        message: 'Apartment updated successfully'
      });
    } catch (error) {
      logger.error({ error, apartmentId: id, data: updateData }, 'Error updating apartment');
      res.status(500).json({
        success: false,
        message: 'Failed to update apartment',
        error: process.env.NODE_ENV === 'development' ? error : 'Internal server error'
      });
    }
  }

  /**
   * @swagger
   * /api/apartments/{id}:
   *   delete:
   *     summary: Delete an apartment
   *     tags: [Apartments]
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *         description: Apartment ID
   *     responses:
   *       200:
   *         description: Apartment deleted successfully
   *       404:
   *         description: Apartment not found
   *       500:
   *         description: Internal server error
   */
  async deleteApartment(req: Request, res: Response): Promise<void> {
    const { id } = req.params;
    try {
      if (!id) {
        res.status(400).json({
          success: false,
          message: 'Apartment ID is required'
        });
        return;
      }

      const deleted = await apartmentService.deleteApartment(id);

      if (!deleted) {
        res.status(404).json({
          success: false,
          message: 'Apartment not found'
        });
        return;
      }

      res.status(200).json({
        success: true,
        message: 'Apartment deleted successfully'
      });
    } catch (error) {
      logger.error({ error, apartmentId: id }, 'Error deleting apartment');
      res.status(500).json({
        success: false,
        message: 'Failed to delete apartment',
        error: process.env.NODE_ENV === 'development' ? error : 'Internal server error'
      });
    }
  }
  /**
   * @swagger
   * /api/apartments/locations:
   *   get:
   *     summary: Get popular locations
   *     tags: [Apartments]
   *     parameters:
   *       - in: query
   *         name: limit
   *         schema:
   *           type: integer
   *           default: 10
   *         description: Maximum number of locations
   *     responses:
   *       200:
   *         description: List of popular locations
   *       500:
   *         description: Internal server error
   */
  async getPopularLocations(req: Request, res: Response): Promise<void> {
    try {
      const locations = await apartmentService.getPopularLocations();

      res.status(200).json({
        success: true,
        data: locations
      });
    } catch (error) {
      logger.error({ error }, 'Error fetching popular locations');
      res.status(500).json({
        success: false,
        message: 'Failed to fetch popular locations',
        error: process.env.NODE_ENV === 'development' ? error : 'Internal server error'
      });
    }
  }

  /**
   * @swagger
   * /api/v1/apartments/search:
   *   post:
   *     summary: Search and filter apartments with advanced options
   *     tags: [Apartments]
   *     requestBody:
   *       required: false
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             properties:
   *               page:
   *                 type: integer
   *                 default: 1
   *                 description: Page number for pagination
   *               limit:
   *                 type: integer
   *                 default: 12
   *                 description: Number of items per page
   *               sortBy:
   *                 type: string
   *                 enum: [price, createdAt, areaSqft, bedrooms, bathrooms]
   *                 default: createdAt
   *                 description: Field to sort by
   *               sortOrder:
   *                 type: string
   *                 enum: [asc, desc]
   *                 default: desc
   *                 description: Sort order
   *               minPrice:
   *                 type: number
   *                 description: Minimum price filter
   *               maxPrice:
   *                 type: number
   *                 description: Maximum price filter
   *               minArea:
   *                 type: number
   *                 description: Minimum area in sqft
   *               maxArea:
   *                 type: number
   *                 description: Maximum area in sqft
   *               bedrooms:
   *                 type: array
   *                 items:
   *                   type: integer
   *                 description: Array of bedroom counts (e.g., [2, 3, 4])
   *               bathrooms:
   *                 type: array
   *                 items:
   *                   type: integer
   *                 description: Array of bathroom counts
   *               locations:
   *                 type: array
   *                 items:
   *                   type: string
   *                 description: Array of location filters
   *               amenities:
   *                 type: array
   *                 items:
   *                   type: string
   *                 description: Array of required amenities
   *               isAvailable:
   *                 type: boolean
   *                 default: true
   *                 description: Filter by availability status
   *     responses:
   *       200:
   *         description: Filtered list of apartments with pagination
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 success:
   *                   type: boolean
   *                 data:
   *                   type: array
   *                   items:
   *                     $ref: '#/components/schemas/Apartment'
   *                 pagination:
   *                   type: object
   *                   properties:
   *                     page:
   *                       type: integer
   *                     limit:
   *                       type: integer
   *                     total:
   *                       type: integer
   *                     totalPages:
   *                       type: integer
   *                     hasNext:
   *                       type: boolean
   *                     hasPrev:
   *                       type: boolean
   *       400:
   *         description: Validation error
   *       500:
   *         description: Internal server error
   */
  async filterApartments(req: Request, res: Response): Promise<void> {
    const filters: ApartmentFilters = req.body || {};
    logger.info({ filters }, 'Filtering apartments');
    
    try {
      const result = await apartmentService.getApartments(filters);
      
      res.status(200).json({
        success: true,
        data: result.data,
        pagination: result.pagination
      });
    } catch (error) {
      logger.error({ error, filters }, 'Error filtering apartments');
      res.status(500).json({
        success: false,
        message: 'Failed to filter apartments',
        error: process.env.NODE_ENV === 'development' ? error : 'Internal server error'
      });
    }
  }
}

export const apartmentController = new ApartmentController();

