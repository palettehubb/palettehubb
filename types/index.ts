export interface ICategory {
  _id?: string;
  name: string;
  slug: string;
  description?: string;
  image: string;
  itemCount?: number;
  isActive?: boolean;
  order?: number;
  subcategories?: string[];
  createdAt?: string;
  updatedAt?: string;
}

export interface IColorMapping {
  color: string;
  image: string;
}

export interface IProduct {
  _id: string;
  name: string;
  slug: string;
  description: string;
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
  variants?: {
    sizes?: string[];
    colors?: string[];
    colorImages?: IColorMapping[];
  };
  rating?: number;
  reviewsCount?: number;
  salesCount?: number;
  isFeatured?: boolean;
  isAvailable?: boolean;
  supplierId?: string;
  tags?: string[];
  createdAt?: string;
  updatedAt?: string;
}

export interface ICartItem {
  productId: string;
  name: string;
  slug: string;
  price: number;
  originalPrice?: number;
  image: string;
  quantity: number;
  size?: string;
  color?: string;
  stock: number;
  supplierId?: string;
  deliveryChargeInsideDubai?: number;
  deliveryChargeOutsideDubai?: number;
  tax?: number;
}

export type OrderStatus =
  | 'Pending Payment'
  | 'Paid'
  | 'Processing'
  | 'Ordered from Supplier'
  | 'Shipped'
  | 'Delivered'
  | 'Cancelled'
  | 'Refunded';

export type PaymentStatus = 'pending' | 'paid' | 'failed' | 'refunded';

export interface IOrderItem {
  productId: string;
  name: string;
  slug: string;
  image: string;
  price: number;
  quantity: number;
  size?: string;
  color?: string;
  supplierId?: string;
  supplierName?: string;
  itemStatus?: 'Pending' | 'Processing' | 'Dispatched' | 'Delivered' | 'Cancelled';
  trackingNumber?: string;
  trackingCarrier?: string;
  deliveryChargeInsideDubai?: number;
  deliveryChargeOutsideDubai?: number;
  tax?: number;
}

export interface IShippingAddress {
  fullName: string;
  email: string;
  phone: string;
  street: string;
  city: string;
  state: string;
  pincode?: string;
  country: string;
}

export interface IOrder {
  _id: string;
  orderNumber: string;
  customer: IShippingAddress;
  items: IOrderItem[];
  subtotal: number;
  discount: number;
  couponCode?: string;
  shipping: number;
  tax: number;
  total: number;
  paymentMethod: 'razorpay' | 'cod' | 'test_pay' | 'paypal';
  paymentStatus: PaymentStatus;
  razorpayOrderId?: string;
  razorpayPaymentId?: string;
  paypalOrderId?: string;
  paypalCaptureId?: string;
  orderStatus: OrderStatus;
  supplierOrderRef?: string;
  trackingNumber?: string;
  trackingCarrier?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ISupplier {
  _id: string;
  name: string;
  contactName: string;
  email: string;
  phone: string;
  website?: string;
  leadTimeDays: number;
  notes?: string;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface ICoupon {
  _id?: string;
  code: string;
  discountType: 'percentage' | 'fixed';
  value: number;
  minOrderAmount?: number;
  isActive: boolean;
  expiresAt?: string;
  timesUsed?: number;
}

export interface IUser {
  _id: string;
  name: string;
  email: string;
  role: 'customer' | 'admin' | 'supplier';
  createdAt: string;
}
