import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    // Test database connection by executing a simple query
    await prisma.$queryRaw`SELECT 1`;

    // Get database info
    const userCount = await prisma.user.count();
    const surveyCount = await prisma.survey.count();

    return NextResponse.json({
      status: 'ok',
      database: {
        connected: true,
        users: userCount,
        surveys: surveyCount,
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Database connection error:', error);

    return NextResponse.json(
      {
        status: 'error',
        database: {
          connected: false,
          error: error instanceof Error ? error.message : 'Unknown error',
        },
        timestamp: new Date().toISOString(),
      },
      { status: 503 }
    );
  }
}
