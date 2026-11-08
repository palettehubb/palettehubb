import { NextResponse } from 'next/server';
import mongoose from 'mongoose';
import connectToDatabase from '@/lib/db';

export async function GET() {
  const startTime = performance.now();

  let dbStatus = 'disconnected';
  try {
    await connectToDatabase();
    dbStatus = mongoose.connection.readyState === 1 ? 'healthy' : 'degraded';
  } catch {
    dbStatus = 'unreachable';
  }

  const latencyMs = Math.round(performance.now() - startTime);
  const memory = process.memoryUsage();

  return NextResponse.json(
    {
      status: dbStatus === 'healthy' ? 'operational' : 'degraded',
      timestamp: new Date().toISOString(),
      uptimeSeconds: Math.round(process.uptime()),
      latencyMs,
      services: {
        database: dbStatus,
        paymentGateway: 'paypal_live',
        nodeVersion: process.version,
      },
      memory: {
        heapUsedMB: Math.round((memory.heapUsed / 1024 / 1024) * 100) / 100,
        heapTotalMB: Math.round((memory.heapTotal / 1024 / 1024) * 100) / 100,
        rssMB: Math.round((memory.rss / 1024 / 1024) * 100) / 100,
      },
    },
    {
      status: dbStatus === 'healthy' ? 200 : 503,
      headers: {
        'Cache-Control': 'no-store, max-age=0',
      },
    }
  );
}
