import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/db';
import Order from '@/models/Order';
import Product from '@/models/Product';
import Supplier from '@/models/Supplier';
import Coupon from '@/models/Coupon';
import { getAdminSession } from '@/lib/auth';

export async function GET() {
  try {
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized. Admin credentials required.' },
        { status: 401 }
      );
    }

    const db = await connectToDatabase();

    if (!db) {
      return NextResponse.json({
        success: true,
        stats: {
          totalSales: 0,
          totalOrders: 0,
          pendingSupplierFulfillment: 0,
          inTransitCount: 0,
          deliveredCount: 0,
          statusCounts: {
            'Pending Payment': 0,
            'Paid': 0,
            'Processing': 0,
            'Ordered from Supplier': 0,
            'Shipped': 0,
            'Delivered': 0,
            'Cancelled': 0,
            'Refunded': 0,
          },
          lowStockCount: 0,
          lowStockProducts: [],
          topProducts: [],
          totalProducts: 0,
          activeSuppliersCount: 0,
          activeOffersCount: 0,
        },
      });
    }

    const [orders, products, suppliers, coupons] = await Promise.all([
      Order.find().lean(),
      Product.find().lean(),
      Supplier.find().lean(),
      Coupon.find({ isActive: true }).lean(),
    ]);

    const totalSales = orders
      .filter((o) => o.paymentStatus === 'paid' && o.orderStatus !== 'Cancelled' && o.orderStatus !== 'Refunded')
      .reduce((sum, o) => sum + (o.total || 0), 0);

    const statusCounts: Record<string, number> = {
      'Pending Payment': 0,
      'Paid': 0,
      'Processing': 0,
      'Ordered from Supplier': 0,
      'Shipped': 0,
      'Delivered': 0,
      'Cancelled': 0,
      'Refunded': 0,
    };

    let pendingSupplierFulfillment = 0;
    let inTransitCount = 0;
    let deliveredCount = 0;

    orders.forEach((o) => {
      const st = o.orderStatus || 'Pending Payment';
      if (statusCounts[st] !== undefined) {
        statusCounts[st] += 1;
      }
      if (st === 'Paid' || st === 'Processing') {
        pendingSupplierFulfillment += 1;
      }
      if (st === 'Shipped') {
        inTransitCount += 1;
      }
      if (st === 'Delivered') {
        deliveredCount += 1;
      }
    });

    const lowStockProducts = products
      .filter((p) => p.stock <= 5 && p.isAvailable)
      .map((p) => ({
        _id: p._id,
        name: p.name,
        slug: p.slug,
        stock: p.stock,
        image: p.images?.[0] || '/images/products/oversized-tshirt.png',
        supplierId: p.supplierId,
      }));

    const topProducts = [...products]
      .sort((a, b) => (b.salesCount || 0) - (a.salesCount || 0))
      .slice(0, 5)
      .map((p) => ({
        _id: p._id,
        name: p.name,
        slug: p.slug,
        salesCount: p.salesCount || 0,
        price: p.price,
        image: p.images?.[0] || '/images/products/oversized-tshirt.png',
      }));

    return NextResponse.json({
      success: true,
      stats: {
        totalSales: Math.round(totalSales * 100) / 100,
        totalOrders: orders.length,
        pendingSupplierFulfillment,
        inTransitCount,
        deliveredCount,
        statusCounts,
        lowStockCount: lowStockProducts.length,
        lowStockProducts,
        topProducts,
        totalProducts: products.length,
        activeSuppliersCount: suppliers.filter((s) => s.isActive).length,
        activeOffersCount: coupons.length,
      },
    });
  } catch (error: unknown) {
    console.error('Error fetching admin statistics:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to retrieve admin operational metrics' },
      { status: 500 }
    );
  }
}
