import nodemailer, { type Transporter } from 'nodemailer';
import mongoose from 'mongoose';
import { IOrder } from '@/types';
import connectToDatabase from '@/lib/db';
import Supplier from '@/models/Supplier';
import Product from '@/models/Product';

const GMAIL_USER = process.env.GMAIL_USER || 'palettehubb@gmail.com';
const GMAIL_PASS = process.env.GMAIL_APP_PASSWORD || 'ixvlpbzudsclaydm';

// Singleton Nodemailer transporter with connection pooling
let transporterInstance: Transporter | null = null;

function getTransporter(): Transporter {
  if (!transporterInstance) {
    transporterInstance = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: GMAIL_USER,
        pass: GMAIL_PASS,
      },
      pool: true,
      maxConnections: 5,
      maxMessages: 100,
    });
  }
  return transporterInstance;
}

/**
 * Sends order notification emails to:
 * 1. Admin (palettehubb@gmail.com)
 * 2. Assigned Supplier(s) - each supplier receives ONLY their assigned products!
 * 3. Customer (receipt)
 *
 * Runs asynchronously and fails gracefully without blocking the checkout flow.
 */
export async function sendOrderEmails(order: IOrder): Promise<void> {
  try {
    const transporter = getTransporter();
    await connectToDatabase();

    // 1. Group items by supplier to notify each supplier of ONLY their specific line items
    const supplierItemsMap = new Map<string, typeof order.items>();
    const supplierIds = new Set<string>();

    for (const item of order.items) {
      let suppId = item.supplierId;

      // Fallback: if supplierId wasn't on the cart item, look up genuine product's supplierId
      if (!suppId && item.productId) {
        try {
          const query = mongoose.isValidObjectId(item.productId)
            ? { _id: item.productId }
            : { slug: item.slug || item.productId };
          const p = await Product.findOne(query).lean();
          if (p?.supplierId) {
            suppId = p.supplierId;
          }
        } catch {
          // ignore lookup error
        }
      }

      if (suppId) {
        supplierIds.add(suppId);
        const existing = supplierItemsMap.get(suppId) || [];
        existing.push(item);
        supplierItemsMap.set(suppId, existing);
      }
    }

    // Connect to database to retrieve each assigned supplier's email address
    const supplierEmailMap = new Map<string, { email: string; name: string }>();
    if (supplierIds.size > 0) {
      try {
        const validIds = Array.from(supplierIds).filter((id) => mongoose.isValidObjectId(id));
        const suppliers = await Supplier.find({
          $or: [
            ...(validIds.length > 0 ? [{ _id: { $in: validIds } }] : []),
            { email: { $in: Array.from(supplierIds) } },
          ],
        }).lean();

        for (const s of suppliers) {
          supplierEmailMap.set(s._id.toString(), { email: s.email, name: s.name });
          if (s.email) {
            supplierEmailMap.set(s.email, { email: s.email, name: s.name });
          }
        }
      } catch (err) {
        console.error('Error fetching suppliers for email dispatch:', err);
      }
    }

    const itemsHtml = order.items
      .map(
        (it) => `
        <tr style="border-bottom: 1px solid #eeeeee;">
          <td style="padding: 10px 0;">
            <strong style="color: #111;">${it.name}</strong><br/>
            <span style="font-size: 12px; color: #666;">
              ${it.size ? `Size: ${it.size} | ` : ''}${it.color ? `Color: ${it.color} | ` : ''}Qty: ${it.quantity}
            </span>
          </td>
          <td style="padding: 10px 0; text-align: right; font-weight: bold; color: #111;">
            $${(it.price * it.quantity).toFixed(2)}
          </td>
        </tr>`
      )
      .join('');

    // --- EMAIL 1: NOTIFICATION TO ADMIN ---
    const adminHtml = `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff; border: 1px solid #e5e5e5; border-radius: 16px; padding: 24px; color: #1a1a1a;">
        <div style="border-bottom: 2px solid #000; padding-bottom: 16px; margin-bottom: 20px;">
          <h1 style="font-size: 20px; font-weight: 900; margin: 0; text-transform: uppercase; letter-spacing: 1px;">Palette Hubb</h1>
          <p style="font-size: 13px; color: #0070ba; font-weight: bold; margin: 4px 0 0 0;">New Verified Order: #${order.orderNumber}</p>
        </div>

        <div style="background: #f8fafc; border-radius: 12px; padding: 16px; margin-bottom: 20px; border: 1px solid #e2e8f0;">
          <p style="margin: 0 0 6px 0; font-size: 13px;"><strong>Customer:</strong> ${order.customer.fullName}</p>
          <p style="margin: 0 0 6px 0; font-size: 13px;"><strong>Email:</strong> ${order.customer.email}</p>
          <p style="margin: 0 0 6px 0; font-size: 13px;"><strong>Phone:</strong> ${order.customer.phone}</p>
          <p style="margin: 0 0 6px 0; font-size: 13px;"><strong>Shipping Address:</strong> ${order.customer.street}, ${order.customer.city}, ${order.customer.state} ${order.customer.pincode}, ${order.customer.country}</p>
          <p style="margin: 0; font-size: 13px;"><strong>Payment Method:</strong> ${order.paymentMethod.toUpperCase()} (Status: ${order.paymentStatus})</p>
        </div>

        <h3 style="font-size: 14px; text-transform: uppercase; margin: 0 0 10px 0; color: #555;">Ordered Items</h3>
        <table style="width: 100%; border-collapse: collapse; font-size: 13px; margin-bottom: 20px;">
          ${itemsHtml}
        </table>

        <div style="border-top: 2px solid #111; padding-top: 12px; margin-top: 10px;">
          <div style="display: flex; justify-content: space-between; margin-bottom: 4px; font-size: 13px;">
            <span>Subtotal:</span>
            <span>$${order.subtotal.toFixed(2)}</span>
          </div>
          ${order.discount ? `<div style="display: flex; justify-content: space-between; margin-bottom: 4px; font-size: 13px; color: #16a34a;"><span>Discount:</span><span>-$${order.discount.toFixed(2)}</span></div>` : ''}
          <div style="display: flex; justify-content: space-between; margin-bottom: 4px; font-size: 13px;">
            <span>Shipping:</span>
            <span>${order.shipping === 0 ? 'FREE' : `$${order.shipping.toFixed(2)}`}</span>
          </div>
          <div style="display: flex; justify-content: space-between; font-size: 16px; font-weight: 900; margin-top: 8px;">
            <span>Total Paid (USD):</span>
            <span style="color: #0070ba;">$${order.total.toFixed(2)}</span>
          </div>
        </div>

        <div style="margin-top: 24px; text-align: center;">
          <a href="https://palettehubb.com/admin" style="display: inline-block; background: #000; color: #fff; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-size: 13px; font-weight: bold;">
            Open Admin Dashboard
          </a>
        </div>
      </div>
    `;

    // Send admin notification
    await transporter.sendMail({
      from: `"Palette Hubb Orders" <${GMAIL_USER}>`,
      to: GMAIL_USER,
      subject: `🔔 New Order #${order.orderNumber} - $${order.total.toFixed(2)} USD (${order.customer.fullName})`,
      html: adminHtml,
    });

    // --- EMAIL 2: NOTIFICATIONS TO ASSIGNED SUPPLIERS ---
    for (const [suppId, suppItems] of supplierItemsMap.entries()) {
      const suppInfo = supplierEmailMap.get(suppId);
      if (!suppInfo || !suppInfo.email) continue;

      const supplierLinesHtml = suppItems
        .map(
          (it) => `
          <tr style="border-bottom: 1px solid #eeeeee;">
            <td style="padding: 10px 0;">
              <strong>${it.name}</strong><br/>
              <span style="font-size: 12px; color: #666;">
                ${it.size ? `Size: ${it.size} | ` : ''}${it.color ? `Color: ${it.color} | ` : ''}Quantity: <b>${it.quantity}</b>
              </span>
            </td>
          </tr>`
        )
        .join('');

      const suppHtml = `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff; border: 1px solid #e5e5e5; border-radius: 16px; padding: 24px; color: #1a1a1a;">
          <h2 style="font-size: 18px; font-weight: 900; margin: 0 0 4px 0;">Fulfillment Dispatch Request</h2>
          <p style="font-size: 13px; color: #666; margin: 0 0 20px 0;">Order Ref: <strong>#${order.orderNumber}</strong> (${order.supplierOrderRef || 'SUP-DIRECT'})</p>

          <p style="font-size: 13px; line-height: 1.5;">Hello <strong>${suppInfo.name}</strong>,<br/>A new paid order has been assigned to your dropshipping facility. Please prepare the items below for dispatch:</p>

          <div style="background: #f8fafc; border-radius: 12px; padding: 14px; margin: 16px 0; border: 1px solid #e2e8f0; font-size: 13px;">
            <strong style="display: block; margin-bottom: 6px; color: #333;">Ship To:</strong>
            ${order.customer.fullName}<br/>
            ${order.customer.street}<br/>
            ${order.customer.city}, ${order.customer.state} ${order.customer.pincode}<br/>
            ${order.customer.country}<br/>
            Phone: ${order.customer.phone}
          </div>

          <h3 style="font-size: 13px; text-transform: uppercase; margin: 16px 0 8px 0; color: #555;">Assigned Items to Pack</h3>
          <table style="width: 100%; border-collapse: collapse; font-size: 13px;">
            ${supplierLinesHtml}
          </table>

          <div style="margin-top: 24px; text-align: center;">
            <a href="https://palettehubb.com/supplier-dashboard" style="display: inline-block; background: #0070ba; color: #fff; padding: 10px 20px; border-radius: 8px; text-decoration: none; font-size: 13px; font-weight: bold;">
              Open Supplier Portal
            </a>
          </div>
        </div>
      `;

      await transporter.sendMail({
        from: `"Palette Hubb Dropship" <${GMAIL_USER}>`,
        to: suppInfo.email,
        subject: `📦 Dropship Dispatch Request #${order.orderNumber} - Palette Hubb`,
        html: suppHtml,
      });
    }

    // --- EMAIL 3: RECEIPT TO CUSTOMER ---
    if (order.customer.email) {
      const customerHtml = `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff; border: 1px solid #e5e5e5; border-radius: 16px; padding: 24px; color: #1a1a1a;">
          <h1 style="font-size: 20px; font-weight: 900; margin: 0; text-transform: uppercase;">Palette Hubb</h1>
          <p style="font-size: 14px; color: #16a34a; font-weight: bold; margin: 4px 0 20px 0;">✓ Order Confirmed #${order.orderNumber}</p>

          <p style="font-size: 13px; line-height: 1.6;">Thank you for your order, <strong>${order.customer.fullName}</strong>! We've received your payment and our verified suppliers are preparing your package.</p>

          <table style="width: 100%; border-collapse: collapse; font-size: 13px; margin: 20px 0;">
            ${itemsHtml}
          </table>

          <div style="border-top: 2px solid #111; padding-top: 12px; margin-top: 10px;">
            <div style="display: flex; justify-content: space-between; font-size: 16px; font-weight: 900;">
              <span>Total Paid:</span>
              <span style="color: #0070ba;">$${order.total.toFixed(2)} USD</span>
            </div>
          </div>

          <div style="margin-top: 24px; text-align: center;">
            <a href="https://palettehubb.com/track-order?orderNumber=${order.orderNumber}" style="display: inline-block; background: #000; color: #fff; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-size: 13px; font-weight: bold;">
              Track Your Order Status
            </a>
          </div>
        </div>
      `;

      await transporter.sendMail({
        from: `"Palette Hubb" <${GMAIL_USER}>`,
        to: order.customer.email,
        subject: `Your Palette Hubb Order #${order.orderNumber} is Confirmed!`,
        html: customerHtml,
      });
    }

    console.log(`[Email Dispatch] Successfully sent order emails for #${order.orderNumber}`);
  } catch (error) {
    console.error(`[Email Dispatch Error] Failed to send order emails for #${order.orderNumber}:`, error);
  }
}

/**
 * Sends a one-time password (OTP) email for Admin password reset.
 */
export async function sendAdminOtpEmail(email: string, otp: string): Promise<boolean> {
  try {
    const transporter = getTransporter();

    const html = `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 500px; margin: 0 auto; background: #ffffff; border: 1px solid #e5e5e5; border-radius: 16px; padding: 24px; color: #1a1a1a;">
        <h2 style="font-size: 18px; font-weight: 900; margin: 0 0 10px 0;">Palette Hubb Admin Security</h2>
        <p style="font-size: 13px; color: #555; line-height: 1.5; margin: 0 0 20px 0;">
          A password reset request was initiated for your Palette Hubb administrator account. Use the one-time code below to verify your identity:
        </p>

        <div style="background: #f1f5f9; border-radius: 12px; padding: 18px; text-align: center; margin: 20px 0;">
          <span style="font-family: monospace; font-size: 32px; font-weight: 900; letter-spacing: 8px; color: #0f172a;">
            ${otp}
          </span>
        </div>

        <p style="font-size: 12px; color: #64748b; line-height: 1.5; margin: 0 0 10px 0;">
          • This OTP is valid for <strong>10 minutes</strong>.<br/>
          • If you did not request this, please secure your account immediately.
        </p>

        <div style="border-top: 1px solid #e2e8f0; padding-top: 14px; margin-top: 20px; text-align: center; font-size: 11px; color: #94a3b8;">
          256-Bit SSL Encrypted Admin Authentication System
        </div>
      </div>
    `;

    await transporter.sendMail({
      from: `"Palette Hubb Security" <${GMAIL_USER}>`,
      to: email,
      subject: `🔐 ${otp} is your Palette Hubb Admin Password Reset Code`,
      html,
    });

    return true;
  } catch (error) {
    console.error('[Admin OTP Email Error]:', error);
    return false;
  }
}
