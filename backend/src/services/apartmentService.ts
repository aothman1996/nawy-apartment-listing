import { prisma } from '../utils/database';
import { getCache } from '../utils/cache';
import { 
  CreateApartmentRequest, 
  UpdateApartmentRequest, 
  ApartmentFilters, 
  ApartmentResponse,
  PaginatedResponse 
} from '../types/apartment';
import { 
  NotFoundError, 
  handlePrismaError 
} from '../errors/AppError';
import { logger } from '../utils/logger';

const CACHE_TTL = parseInt(process.env.CACHE_TTL || '3600'); // 1 hour default
const CACHE_PREFIX = 'apartment:';

export class ApartmentService {
  /**
   * Get all apartments with filtering, searching, and pagination
   */
  async getApartments(filters: ApartmentFilters = {}): Promise<PaginatedResponse<ApartmentResponse>> {
    logger.debug({ filters }, 'Fetching apartments with filters');
    
    const {
      search,
      minPrice,
      maxPrice,
      minArea,
      maxArea,
      bedrooms,
      bathrooms,
      locations,
      amenities,
      isAvailable,
      page = 1,
      limit = 10,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = filters;

    const hasFilters = !!(
      search || 
      minPrice !== undefined || 
      maxPrice !== undefined || 
      minArea !== undefined || 
      maxArea !== undefined || 
      (bedrooms && bedrooms.length > 0) || 
      (bathrooms && bathrooms.length > 0) || 
      (locations && locations.length > 0) || 
      (amenities && amenities.length > 0) || 
      isAvailable !== undefined
    );

    if (!hasFilters) {
      const cache = getCache();
      const cacheKey = `apartments:list:p${page}:l${limit}:${sortBy}:${sortOrder}`;
      
      const cached = cache.get(cacheKey);
      if (cached) {
        logger.debug({ cacheKey }, 'Cache hit for apartment listing');
        return JSON.parse(cached);
      }
    }

    const skip = (page - 1) * limit;

    // Build where clause
    const where: any = {};

    if (search) {
      where.OR = [
        { unitName: { contains: search, mode: 'insensitive' } },
        { unitNumber: { contains: search, mode: 'insensitive' } },
        { project: { contains: search, mode: 'insensitive' } },
        { location: { contains: search, mode: 'insensitive' } }
      ];
    }

    if (minPrice !== undefined) {
      where.price = { ...where.price, gte: minPrice };
    }

    if (maxPrice !== undefined) {
      where.price = { ...where.price, lte: maxPrice };
    }

    if (minArea !== undefined) {
      where.areaSqft = { ...where.areaSqft, gte: minArea };
    }

    if (maxArea !== undefined) {
      where.areaSqft = { ...where.areaSqft, lte: maxArea };
    }

    if (bedrooms && bedrooms.length > 0) {
      where.bedrooms = { in: bedrooms };
    }

    if (bathrooms && bathrooms.length > 0) {
      where.bathrooms = { in: bathrooms };
    }

    if (locations && locations.length > 0) {
      where.location = { in: locations };
    }

    // Filter by amenities (apartment must have ALL selected amenities)
    if (amenities && amenities.length > 0) {
      where.amenities = { hasEvery: amenities };
    }

    // Default to showing only available apartments unless explicitly specified
    where.isAvailable = isAvailable !== undefined ? isAvailable : true;

    // Build orderBy clause
    const orderBy: any = {};
    orderBy[sortBy] = sortOrder;

    try {
      // Use Prisma transaction for consistency and performance
      // Single round-trip to database instead of 2 separate queries
      const [apartments, total] = await prisma.$transaction([
        prisma.apartment.findMany({
          where,
          skip,
          take: limit,
          orderBy,
        }),
        prisma.apartment.count({ where })
      ]);

      const totalPages = Math.ceil(total / limit);

      const response = {
        data: apartments.map(this.mapApartmentToResponse),
        pagination: {
          page,
          limit,
          total,
          totalPages,
          hasNext: page < totalPages,
          hasPrev: page > 1
        }
      };

      if (!hasFilters) {
        const cache = getCache();
        const cacheKey = `apartments:list:p${page}:l${limit}:${sortBy}:${sortOrder}`;
        cache.setEx(cacheKey, CACHE_TTL, JSON.stringify(response));
        logger.debug({ cacheKey }, 'Cached apartment listing');
      }

      return response;
    } catch (error: any) {
      logger.error({ error, filters }, 'Error fetching apartments');
      throw handlePrismaError(error);
    }
  }

  /**
   * Get apartment by ID with caching
   */
  async getApartmentById(id: string): Promise<ApartmentResponse | null> {
    const cacheKey = `${CACHE_PREFIX}${id}`;
    const cache = getCache();

    try {
      // Try to get from cache first
      const cached = cache.get(cacheKey);
      if (cached) {
        logger.debug({ apartmentId: id }, 'Cache hit for apartment');
        return JSON.parse(cached);
      }

      // If not in cache, fetch from database
      const apartment = await prisma.apartment.findUnique({
        where: { id }
      });

      if (!apartment) {
        throw new NotFoundError('Apartment', id);
      }

      const apartmentResponse = this.mapApartmentToResponse(apartment);

      // Cache the result
      cache.setEx(cacheKey, CACHE_TTL, JSON.stringify(apartmentResponse));
      logger.debug({ apartmentId: id }, 'Cached apartment');

      return apartmentResponse;
    } catch (error: any) {
      // If it's already our custom error, re-throw it
      if (error instanceof NotFoundError) {
        throw error;
      }
      logger.error({ error, apartmentId: id }, 'Error fetching apartment by ID');
      throw handlePrismaError(error);
    }
  }

  /**
   * Create a new apartment
   */
  async createApartment(data: CreateApartmentRequest): Promise<ApartmentResponse> {
    try {
      const apartment = await prisma.apartment.create({
        data: {
          unitName: data.unitName,
          unitNumber: data.unitNumber,
          project: data.project,
          price: data.price,
          bedrooms: data.bedrooms,
          bathrooms: data.bathrooms,
          areaSqft: data.areaSqft,
          location: data.location,
          description: data.description,
          images: data.images || [],
          amenities: data.amenities || [],
          isAvailable: data.isAvailable ?? true
        }
      });

      // Invalidate locations cache since we added a new apartment (potentially new location)
      await this.invalidateCache(apartment.id, true);

      return this.mapApartmentToResponse(apartment);
    } catch (error: any) {
      logger.error({ error, data }, 'Error creating apartment');
      throw handlePrismaError(error);
    }
  }

  /**
   * Update an apartment by ID
   */
  async updateApartment(id: string, data: UpdateApartmentRequest): Promise<ApartmentResponse | null> {
    try {
      const apartment = await prisma.apartment.update({
        where: { id },
        data: {
          ...(data.unitName && { unitName: data.unitName }),
          ...(data.unitNumber && { unitNumber: data.unitNumber }),
          ...(data.project && { project: data.project }),
          ...(data.price !== undefined && { price: data.price }),
          ...(data.bedrooms !== undefined && { bedrooms: data.bedrooms }),
          ...(data.bathrooms !== undefined && { bathrooms: data.bathrooms }),
          ...(data.areaSqft !== undefined && { areaSqft: data.areaSqft }),
          ...(data.location && { location: data.location }),
          ...(data.description !== undefined && { description: data.description }),
          ...(data.images !== undefined && { images: data.images }),
          ...(data.amenities !== undefined && { amenities: data.amenities }),
          ...(data.isAvailable !== undefined && { isAvailable: data.isAvailable })
        }
      });

      // Invalidate cache (also invalidate locations if location might have changed)
      const locationChanged = data.location !== undefined;
      await this.invalidateCache(id, locationChanged);

      return this.mapApartmentToResponse(apartment);
    } catch (error: any) {
      logger.error({ error, apartmentId: id }, 'Error updating apartment');
      throw handlePrismaError(error);
    }
  }

  /**
   * Delete an apartment by ID
   */
  async deleteApartment(id: string): Promise<boolean> {
    try {
      await prisma.apartment.delete({
        where: { id }
      });

      // Invalidate cache (also invalidate locations since we removed an apartment)
      await this.invalidateCache(id, true);

      return true;
    } catch (error: any) {
      logger.error({ error, apartmentId: id }, 'Error deleting apartment');
      throw handlePrismaError(error);
    }
  }

  /**
   * Search apartments by text
   */
  async searchApartments(query: string, limit: number = 10): Promise<ApartmentResponse[]> {
    try {
      const apartments = await prisma.apartment.findMany({
        where: {
          OR: [
            { unitName: { contains: query, mode: 'insensitive' } },
            { unitNumber: { contains: query, mode: 'insensitive' } },
            { project: { contains: query, mode: 'insensitive' } },
            { location: { contains: query, mode: 'insensitive' } }
          ]
        },
        take: limit,
        orderBy: { createdAt: 'desc' }
      });

      return apartments.map(this.mapApartmentToResponse);
    } catch (error: any) {
      logger.error({ error, query, limit }, 'Error searching apartments');
      throw handlePrismaError(error);
    }
  }

  /**
   * Get all unique locations (sorted alphabetically for better UX)
   * Cached for 1 hour since locations don't change frequently
   */
  async getPopularLocations(): Promise<string[]> {
    const LOCATIONS_CACHE_KEY = 'popular_locations';
    const LOCATIONS_CACHE_TTL = 3600; // 1 hour (locations don't change often)

    try {
      const cache = getCache();
      
      // Try to get from cache first
      const cachedLocations = cache.get(LOCATIONS_CACHE_KEY);
      if (cachedLocations) {
        logger.debug('Popular locations served from cache');
        return JSON.parse(cachedLocations);
      }

      // Cache miss - fetch from database
      logger.debug('Cache miss for popular locations, fetching from database');
      const locations = await prisma.apartment.groupBy({
        by: ['location'],
        _count: {
          location: true
        },
        orderBy: {
          location: 'asc' // Alphabetical order for easier browsing
        }
      });

      const locationsList = locations.map((loc: any) => loc.location);

      // Cache the result
      cache.setEx(LOCATIONS_CACHE_KEY, LOCATIONS_CACHE_TTL, JSON.stringify(locationsList));
      logger.debug({ count: locationsList.length }, 'Popular locations cached');

      return locationsList;
    } catch (error: any) {
      logger.error({ error }, 'Error fetching locations');
      throw handlePrismaError(error);
    }
  }

  /**
   * Invalidate cache for an apartment and related caches
   */
  private async invalidateCache(id: string, invalidateLocations: boolean = false): Promise<void> {
    try {
      const cache = getCache();
      cache.del(`${CACHE_PREFIX}${id}`);
      
      if (invalidateLocations) {
        cache.del('popular_locations');
        logger.debug('Locations cache invalidated');
      }

      // Invalidate listing caches (common pagination/sort combinations)
      const limits = [10, 12, 20];
      const sortBys = ['createdAt', 'price'];
      const sortOrders = ['desc', 'asc'];
      
      for (const lim of limits) {
        for (const sortBy of sortBys) {
          for (const sortOrder of sortOrders) {
            for (let p = 1; p <= 5; p++) {
              cache.del(`apartments:list:p${p}:l${lim}:${sortBy}:${sortOrder}`);
            }
          }
        }
      }
      logger.debug('Listing caches invalidated');
      
      logger.debug({ apartmentId: id }, 'Cache invalidated for apartment');
    } catch (error) {
      logger.warn({ error, apartmentId: id }, 'Error invalidating cache');
    }
  }

  /**
   * Map database apartment to response format
   */
  private mapApartmentToResponse(apartment: any): ApartmentResponse {
    return {
      id: apartment.id,
      unitName: apartment.unitName,
      unitNumber: apartment.unitNumber,
      project: apartment.project,
      price: Number(apartment.price),
      bedrooms: apartment.bedrooms,
      bathrooms: apartment.bathrooms,
      areaSqft: apartment.areaSqft,
      location: apartment.location,
      description: apartment.description,
      images: apartment.images,
      amenities: apartment.amenities,
      isAvailable: apartment.isAvailable,
      createdAt: apartment.createdAt,
      updatedAt: apartment.updatedAt
    };
  }
}

export const apartmentService = new ApartmentService();

