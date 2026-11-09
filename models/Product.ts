import mongoose, { Schema, Document } from 'mongoose';

export interface IColorMappingDoc {
  color: string;
  image: string;
}

export interface IProductDoc extends Document {
  name: string;
  slug: string;
  description?: string;
  category: string;
  subcategory?: string;
  price: number;
  originalPrice?: number;
  discountPercent?: number;
  deliveryChargeInsideDubai?: number;
  deliveryChargeOutsideDubai?: number;
  tax?: number;
  images: string[];
  stock: number;
  variants: {
    sizes: string[];
    colors: string[];
    colorImages?: IColorMappingDoc[];
  };
  rating: number;
  reviewsCount: number;
  salesCount: number;
  isFeatured: boolean;
  isAvailable: boolean;
  supplierId?: string;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
}

const ProductSchema = new Schema<IProductDoc>(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true, index: true },
    description: { type: String, default: '' },
    category: { type: String, required: true, index: true },
    subcategory: { type: String, default: '', index: true },
    price: { type: Number, required: true, min: 0 },
    originalPrice: { type: Number, default: 0 },
    discountPercent: { type: Number, default: 0 },
    deliveryChargeInsideDubai: { type: Number, default: 0, min: 0 },
    deliveryChargeOutsideDubai: { type: Number, default: 0, min: 0 },
    tax: { type: Number, default: 0, min: 0 },
    images: { type: [String], required: true },
    stock: { type: Number, required: true, default: 0, min: 0 },
    variants: {
      sizes: { type: [String], default: [] },
      colors: { type: [String], default: [] },
      colorImages: {
        type: [
          {
            color: { type: String, default: '', trim: true },
            image: { type: String, default: '', trim: true },
          },
        ],
        default: [],
      },
    },
    rating: { type: Number, default: 5.0 },
    reviewsCount: { type: Number, default: 0 },
    salesCount: { type: Number, default: 0, index: true },
    isFeatured: { type: Boolean, default: false, index: true },
    isAvailable: { type: Boolean, default: true },
    supplierId: { type: String, index: true },
    tags: { type: [String], default: [] },
  },
  { timestamps: true }
);

ProductSchema.index({ isAvailable: 1, isFeatured: 1 });
ProductSchema.index({ isAvailable: 1, category: 1 });
ProductSchema.index({ isAvailable: 1, createdAt: -1 });
ProductSchema.index({ category: 1, isAvailable: 1, createdAt: -1 });
ProductSchema.index({ isAvailable: 1, salesCount: -1 });
ProductSchema.index({ slug: 1, isAvailable: 1 });

export default mongoose.models.Product || mongoose.model<IProductDoc>('Product', ProductSchema);
