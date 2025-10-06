import Joi, { CustomHelpers } from 'joi';

/**
 * Joi validation schemas for apartment operations
 * Using Joi provides better error messages and more flexible validation
 */

export const createApartmentSchema = Joi.object({
  unitName: Joi.string()
    .min(1)
    .max(100)
    .required()
    .trim()
    .messages({
      'string.empty': 'Unit name is required',
      'string.min': 'Unit name must be at least 1 character',
      'string.max': 'Unit name must not exceed 100 characters',
      'any.required': 'Unit name is required'
    }),

  unitNumber: Joi.string()
    .min(1)
    .max(50)
    .required()
    .trim()
    .messages({
      'string.empty': 'Unit number is required',
      'string.min': 'Unit number must be at least 1 character',
      'string.max': 'Unit number must not exceed 50 characters',
      'any.required': 'Unit number is required'
    }),

  project: Joi.string()
    .min(1)
    .max(100)
    .required()
    .trim()
    .messages({
      'string.empty': 'Project name is required',
      'any.required': 'Project name is required'
    }),

  price: Joi.number()
    .positive()
    .required()
    .messages({
      'number.base': 'Price must be a number',
      'number.positive': 'Price must be greater than 0',
      'any.required': 'Price is required'
    }),

  bedrooms: Joi.number()
    .integer()
    .min(0)
    .max(20)
    .required()
    .messages({
      'number.base': 'Bedrooms must be a number',
      'number.integer': 'Bedrooms must be an integer',
      'number.min': 'Bedrooms cannot be negative',
      'number.max': 'Bedrooms cannot exceed 20',
      'any.required': 'Number of bedrooms is required'
    }),

  bathrooms: Joi.number()
    .integer()
    .min(0)
    .max(20)
    .required()
    .messages({
      'number.base': 'Bathrooms must be a number',
      'number.integer': 'Bathrooms must be an integer',
      'number.min': 'Bathrooms cannot be negative',
      'number.max': 'Bathrooms cannot exceed 20',
      'any.required': 'Number of bathrooms is required'
    }),

  areaSqft: Joi.number()
    .integer()
    .positive()
    .required()
    .messages({
      'number.base': 'Area must be a number',
      'number.integer': 'Area must be an integer',
      'number.positive': 'Area must be greater than 0',
      'any.required': 'Area is required'
    }),

  location: Joi.string()
    .min(1)
    .max(200)
    .required()
    .trim()
    .messages({
      'string.empty': 'Location is required',
      'any.required': 'Location is required'
    }),

  description: Joi.string()
    .max(2000)
    .optional()
    .allow('')
    .trim()
    .messages({
      'string.max': 'Description must not exceed 2000 characters'
    }),

  images: Joi.array()
    .items(
      Joi.string().uri().messages({
        'string.uri': 'Each image must be a valid URL'
      })
    )
    .optional()
    .default([])
    .messages({
      'array.base': 'Images must be an array'
    }),

  amenities: Joi.array()
    .items(
      Joi.string().min(1).max(100).messages({
        'string.empty': 'Amenity cannot be empty',
        'string.max': 'Amenity must not exceed 100 characters'
      })
    )
    .optional()
    .default([])
    .messages({
      'array.base': 'Amenities must be an array'
    }),

  isAvailable: Joi.boolean()
    .optional()
    .default(true)
    .messages({
      'boolean.base': 'isAvailable must be a boolean'
    })
});

export const updateApartmentSchema = Joi.object({
  unitName: Joi.string()
    .min(1)
    .max(100)
    .optional()
    .trim(),

  unitNumber: Joi.string()
    .min(1)
    .max(50)
    .optional()
    .trim(),

  project: Joi.string()
    .min(1)
    .max(100)
    .optional()
    .trim(),

  price: Joi.number()
    .positive()
    .optional(),

  bedrooms: Joi.number()
    .integer()
    .min(0)
    .max(20)
    .optional(),

  bathrooms: Joi.number()
    .integer()
    .min(0)
    .max(20)
    .optional(),

  areaSqft: Joi.number()
    .integer()
    .positive()
    .optional(),

  location: Joi.string()
    .min(1)
    .max(200)
    .optional()
    .trim(),

  description: Joi.string()
    .max(2000)
    .optional()
    .allow('')
    .trim(),

  images: Joi.array()
    .items(Joi.string().uri())
    .optional(),

  amenities: Joi.array()
    .items(Joi.string().min(1).max(100))
    .optional(),

  isAvailable: Joi.boolean()
    .optional()
}).min(1).messages({
  'object.min': 'At least one field must be provided for update'
});

export const apartmentFiltersSchema = Joi.object({
  search: Joi.string().optional().allow(''),
  minPrice: Joi.number().min(0).optional(),
  maxPrice: Joi.number().min(0).optional(),
  minArea: Joi.number().min(0).optional(),
  maxArea: Joi.number().min(0).optional(),
  bedrooms: Joi.array().items(Joi.number().integer().min(0)).optional(),
  bathrooms: Joi.array().items(Joi.number().integer().min(0)).optional(),
  locations: Joi.array().items(Joi.string()).optional(),
  amenities: Joi.array().items(Joi.string()).optional(),
  isAvailable: Joi.boolean().optional(),
  page: Joi.number().integer().min(1).optional().default(1),
  limit: Joi.number().integer().min(1).max(100).optional().default(10),
  sortBy: Joi.string().valid('price', 'createdAt', 'areaSqft', 'bedrooms', 'bathrooms').optional(),
  sortOrder: Joi.string().valid('asc', 'desc').optional()
}).custom((value: any, helpers: CustomHelpers) => {
  // Custom validation: maxPrice should be greater than minPrice
  if (value.minPrice && value.maxPrice && value.maxPrice < value.minPrice) {
    return helpers.error('custom.priceRange');
  }
  // Custom validation: maxArea should be greater than minArea
  if (value.minArea && value.maxArea && value.maxArea < value.minArea) {
    return helpers.error('custom.areaRange');
  }
  return value;
}).messages({
  'custom.priceRange': 'Maximum price must be greater than minimum price',
  'custom.areaRange': 'Maximum area must be greater than minimum area'
});

