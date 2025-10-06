'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { CreateApartmentRequest } from '@/types/apartment';
import { ArrowLeft, Save, X } from 'lucide-react';
import { useToast } from '@/contexts/ToastContext';
import { useCreateApartment } from '@/hooks/useApartments';
import { AMENITY_OPTIONS } from '@/constants/filters';

export default function AddApartmentPage() {
  const router = useRouter();
  const toast = useToast();
  const [errors, setErrors] = useState<Record<string, string>>({});
  const { mutate: createApartment, isPending } = useCreateApartment();
  const inputRefs = useRef<Record<string, HTMLInputElement | HTMLTextAreaElement | null>>({});
  
  const [formData, setFormData] = useState<CreateApartmentRequest>({
    unitName: '',
    unitNumber: '',
    project: '',
    price: 0,
    bedrooms: 1,
    bathrooms: 1,
    areaSqft: 0,
    location: '',
    description: '',
    images: [],
    amenities: [],
    isAvailable: true
  });

  const [newImage, setNewImage] = useState('');
  const [newAmenity, setNewAmenity] = useState('');

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'number' ? Number(value) : type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleAddImage = () => {
    if (newImage.trim()) {
      setFormData(prev => ({
        ...prev,
        images: [...(prev.images || []), newImage.trim()]
      }));
      setNewImage('');
    }
  };

  const handleRemoveImage = (index: number) => {
    setFormData(prev => ({
      ...prev,
      images: (prev.images || []).filter((_, i) => i !== index)
    }));
  };

  const handleAddAmenity = () => {
    if (newAmenity.trim()) {
      setFormData(prev => ({
        ...prev,
        amenities: [...(prev.amenities || []), newAmenity.trim()]
      }));
      setNewAmenity('');
    }
  };

  const handleRemoveAmenity = (index: number) => {
    setFormData(prev => ({
      ...prev,
      amenities: (prev.amenities || []).filter((_, i) => i !== index)
    }));
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    let firstErrorField: string | null = null;

    if (!formData.unitName.trim()) {
      newErrors.unitName = 'Unit name is required';
      if (!firstErrorField) firstErrorField = 'unitName';
    }
    if (!formData.unitNumber.trim()) {
      newErrors.unitNumber = 'Unit number is required';
      if (!firstErrorField) firstErrorField = 'unitNumber';
    }
    if (!formData.project.trim()) {
      newErrors.project = 'Project is required';
      if (!firstErrorField) firstErrorField = 'project';
    }
    if (!formData.location.trim()) {
      newErrors.location = 'Location is required';
      if (!firstErrorField) firstErrorField = 'location';
    }
    if (formData.price <= 0) {
      newErrors.price = 'Price must be greater than 0';
      if (!firstErrorField) firstErrorField = 'price';
    }
    if (formData.areaSqft <= 0) {
      newErrors.areaSqft = 'Area must be greater than 0';
      if (!firstErrorField) firstErrorField = 'areaSqft';
    }
    if (formData.bedrooms < 1) {
      newErrors.bedrooms = 'Bedrooms must be at least 1';
      if (!firstErrorField) firstErrorField = 'bedrooms';
    }
    if (formData.bathrooms < 1) {
      newErrors.bathrooms = 'Bathrooms must be at least 1';
      if (!firstErrorField) firstErrorField = 'bathrooms';
    }

    setErrors(newErrors);
    
    // Focus on first error field
    if (firstErrorField && inputRefs.current[firstErrorField]) {
      inputRefs.current[firstErrorField]?.focus();
      inputRefs.current[firstErrorField]?.scrollIntoView({ 
        behavior: 'smooth', 
        block: 'center' 
      });
    }

    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    createApartment(formData, {
      onSuccess: () => {
        toast.success(
          'Success!',
          'Apartment created successfully',
          3000
        );
        setTimeout(() => {
          router.push('/');
        }, 1000);
      },
      onError: (error: unknown) => {
        console.error('Error creating apartment:', error);
        const err = error as { response?: { data?: { error?: { message?: string; errors?: Array<{ field: string; message: string }> } } } };
        
        if (err.response?.data?.error?.message?.includes('unique constraint')) {
          setErrors({ unitNumber: 'Unit number already exists in this project' });
          toast.error(
            'Duplicate Unit Number',
            'This unit number already exists in this project.',
            5000
          );
        } else if (err.response?.data?.error?.errors) {
          const validationErrors: Record<string, string> = {};
          err.response.data.error.errors.forEach((e) => {
            validationErrors[e.field] = e.message;
          });
          setErrors(validationErrors);
          toast.error(
            'Validation Error',
            'Please check the form for errors and try again.',
            5000
          );
        } else {
          toast.error(
            'Failed to Create Apartment',
            err.response?.data?.error?.message || 'An unexpected error occurred. Please try again.',
            5000
          );
        }
      },
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => router.back()}
            className="flex items-center text-gray-600 hover:text-gray-900 mb-4 cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </button>
          <h1 className="text-3xl font-bold text-gray-900">Add New Apartment</h1>
          <p className="text-gray-600 mt-2">Fill in the details to add a new apartment listing</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-md p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Unit Name */}
            <div>
              <label htmlFor="unitName" className="block text-sm font-medium text-gray-700 mb-2">
                Unit Name *
              </label>
              <input
                ref={(el) => { inputRefs.current['unitName'] = el; }}
                type="text"
                id="unitName"
                name="unitName"
                value={formData.unitName}
                onChange={handleInputChange}
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 placeholder-gray-600 ${
                  errors.unitName ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="e.g., Sky Penthouse Apartment"
              />
              {errors.unitName && <p className="text-red-500 text-sm mt-1">{errors.unitName}</p>}
            </div>

            {/* Unit Number */}
            <div>
              <label htmlFor="unitNumber" className="block text-sm font-medium text-gray-700 mb-2">
                Unit Number *
              </label>
              <input
                ref={(el) => { inputRefs.current['unitNumber'] = el; }}
                type="text"
                id="unitNumber"
                name="unitNumber"
                value={formData.unitNumber}
                onChange={handleInputChange}
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 placeholder-gray-600 ${
                  errors.unitNumber ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="e.g., AP-001, VILLA-001"
              />
              {errors.unitNumber && <p className="text-red-500 text-sm mt-1">{errors.unitNumber}</p>}
            </div>

            {/* Project */}
            <div>
              <label htmlFor="project" className="block text-sm font-medium text-gray-700 mb-2">
                Project *
              </label>
              <input
                ref={(el) => { inputRefs.current['project'] = el; }}
                type="text"
                id="project"
                name="project"
                value={formData.project}
                onChange={handleInputChange}
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 placeholder-gray-600 ${
                  errors.project ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="e.g., Marina Heights, Palm Jumeirah Villas"
              />
              {errors.project && <p className="text-red-500 text-sm mt-1">{errors.project}</p>}
            </div>

            {/* Location */}
            <div>
              <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-2">
                Location *
              </label>
              <input
                ref={(el) => { inputRefs.current['location'] = el; }}
                type="text"
                id="location"
                name="location"
                value={formData.location}
                onChange={handleInputChange}
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 placeholder-gray-600 ${
                  errors.location ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="e.g., Dubai Marina, Palm Jumeirah"
              />
              {errors.location && <p className="text-red-500 text-sm mt-1">{errors.location}</p>}
            </div>

            {/* Price */}
            <div>
              <label htmlFor="price" className="block text-sm font-medium text-gray-700 mb-2">
                Price (USD) *
              </label>
              <input
                ref={(el) => { inputRefs.current['price'] = el; }}
                type="text"
                id="price"
                name="price"
                value={formData.price || ''}
                onChange={(e) => {
                  const value = e.target.value.replace(/[^0-9]/g, '');
                  handleInputChange({
                    ...e,
                    target: { ...e.target, name: 'price', value, type: 'number' }
                  } as any);
                }}
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 placeholder-gray-600 ${
                  errors.price ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="e.g., 1500000"
              />
              {errors.price && <p className="text-red-500 text-sm mt-1">{errors.price}</p>}
            </div>

            {/* Area */}
            <div>
              <label htmlFor="areaSqft" className="block text-sm font-medium text-gray-700 mb-2">
                Area (sq ft) *
              </label>
              <input
                ref={(el) => { inputRefs.current['areaSqft'] = el; }}
                type="text"
                id="areaSqft"
                name="areaSqft"
                value={formData.areaSqft || ''}
                onChange={(e) => {
                  const value = e.target.value.replace(/[^0-9]/g, '');
                  handleInputChange({
                    ...e,
                    target: { ...e.target, name: 'areaSqft', value, type: 'number' }
                  } as any);
                }}
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 placeholder-gray-600 ${
                  errors.areaSqft ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="e.g., 1500"
              />
              {errors.areaSqft && <p className="text-red-500 text-sm mt-1">{errors.areaSqft}</p>}
            </div>

            {/* Bedrooms */}
            <div>
              <label htmlFor="bedrooms" className="block text-sm font-medium text-gray-700 mb-2">
                Bedrooms *
              </label>
              <select
                ref={(el) => { if (el) inputRefs.current['bedrooms'] = el as unknown as HTMLInputElement; }}
                id="bedrooms"
                name="bedrooms"
                value={formData.bedrooms}
                onChange={handleInputChange}
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 ${
                  errors.bedrooms ? 'border-red-500' : 'border-gray-300'
                }`}
              >
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(num => (
                  <option key={num} value={num}>{num}</option>
                ))}
              </select>
              {errors.bedrooms && <p className="text-red-500 text-sm mt-1">{errors.bedrooms}</p>}
            </div>

            {/* Bathrooms */}
            <div>
              <label htmlFor="bathrooms" className="block text-sm font-medium text-gray-700 mb-2">
                Bathrooms *
              </label>
              <select
                ref={(el) => { if (el) inputRefs.current['bathrooms'] = el as unknown as HTMLInputElement; }}
                id="bathrooms"
                name="bathrooms"
                value={formData.bathrooms}
                onChange={handleInputChange}
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 ${
                  errors.bathrooms ? 'border-red-500' : 'border-gray-300'
                }`}
              >
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(num => (
                  <option key={num} value={num}>{num}</option>
                ))}
              </select>
              {errors.bathrooms && <p className="text-red-500 text-sm mt-1">{errors.bathrooms}</p>}
            </div>
          </div>

          {/* Description */}
          <div className="mt-6">
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
              Description
            </label>
            <textarea
              ref={(el) => { inputRefs.current['description'] = el; }}
              id="description"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 placeholder-gray-600"
              placeholder="Describe the apartment features, views, and unique selling points..."
            />
          </div>

          {/* Images */}
          <div className="mt-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Images
            </label>
            <div className="flex gap-2 mb-2">
              <input
                type="url"
                value={newImage}
                onChange={(e) => setNewImage(e.target.value)}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 placeholder-gray-600"
                placeholder="Enter image URL"
              />
              <button
                type="button"
                onClick={handleAddImage}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors cursor-pointer"
              >
                Add
              </button>
            </div>
            {formData.images && formData.images.length > 0 && (
              <div className="space-y-2">
                {formData.images.map((image, index) => (
                  <div key={index} className="flex items-center justify-between bg-gray-50 p-2 rounded">
                    <span className="text-sm text-gray-600 truncate">{image}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveImage(index)}
                      className="text-red-500 hover:text-red-700 cursor-pointer"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Amenities */}
          <div className="mt-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Amenities
            </label>
            <div className="flex gap-2 mb-2">
              <select
                value={newAmenity}
                onChange={(e) => setNewAmenity(e.target.value)}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
              >
                <option value="">Select amenity...</option>
                {AMENITY_OPTIONS.filter(amenity => !formData.amenities?.includes(amenity)).map((amenity) => (
                  <option key={amenity} value={amenity}>
                    {amenity}
                  </option>
                ))}
              </select>
              <button
                type="button"
                onClick={handleAddAmenity}
                disabled={!newAmenity}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Add
              </button>
            </div>
            {formData.amenities && formData.amenities.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {formData.amenities.map((amenity, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
                  >
                    {amenity}
                    <button
                      type="button"
                      onClick={() => handleRemoveAmenity(index)}
                      className="text-blue-600 hover:text-blue-800 cursor-pointer"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Availability */}
          <div className="mt-6">
            <label className="flex items-center">
              <input
                type="checkbox"
                name="isAvailable"
                checked={formData.isAvailable}
                onChange={handleInputChange}
                className="mr-2"
              />
              <span className="text-sm font-medium text-gray-700">Available for rent/sale</span>
            </label>
          </div>

          {/* Submit Button */}
          <div className="mt-8 flex justify-end gap-4">
            <button
              type="button"
              onClick={() => router.back()}
              className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isPending}
              className="flex items-center px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              {isPending ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                  Creating...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Create Apartment
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
