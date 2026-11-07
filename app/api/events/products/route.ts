import { NextRequest } from 'next/server';
import { orderEvents } from '@/lib/realtime';

export async function GET(req: NextRequest) {
  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    start(controller) {
      // Send initial keep-alive comment
      controller.enqueue(encoder.encode(': keep-alive\n\n'));

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const handleProductCreated = (product: any) => {
        try {
          const payload = JSON.stringify({ type: 'PRODUCT_CREATED', product });
          controller.enqueue(encoder.encode(`data: ${payload}\n\n`));
        } catch {
          // stream might be closed
        }
      };

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const handleProductUpdated = (product: any) => {
        try {
          const payload = JSON.stringify({ type: 'PRODUCT_UPDATED', product });
          controller.enqueue(encoder.encode(`data: ${payload}\n\n`));
        } catch {
          // stream might be closed
        }
      };

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const handleProductDeleted = (data: any) => {
        try {
          const payload = JSON.stringify({ type: 'PRODUCT_DELETED', data });
          controller.enqueue(encoder.encode(`data: ${payload}\n\n`));
        } catch {
          // stream might be closed
        }
      };

      orderEvents.on('product-created', handleProductCreated);
      orderEvents.on('product-updated', handleProductUpdated);
      orderEvents.on('product-deleted', handleProductDeleted);

      const heartbeatInterval = setInterval(() => {
        try {
          controller.enqueue(encoder.encode(': heartbeat\n\n'));
        } catch {
          clearInterval(heartbeatInterval);
        }
      }, 25000);

      req.signal.addEventListener('abort', () => {
        clearInterval(heartbeatInterval);
        orderEvents.off('product-created', handleProductCreated);
        orderEvents.off('product-updated', handleProductUpdated);
        orderEvents.off('product-deleted', handleProductDeleted);
      });
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      Connection: 'keep-alive',
      'X-Accel-Buffering': 'no',
    },
  });
}
