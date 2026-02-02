import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import prisma from '@/lib/prisma'

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth()

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Get the QR code with staff and venue information
    const qrCode = await prisma.qrCode.findUnique({
      where: { id: params.id },
      include: {
        staff: {
          select: {
            venueId: true,
          },
        },
      },
    })

    if (!qrCode) {
      return NextResponse.json(
        { error: 'QR code not found' },
        { status: 404 }
      )
    }

    // Verify that the QR code belongs to the user's venue
    const userVenueId = (session.user as { venueId?: string }).venueId
    if (qrCode.staff.venueId !== userVenueId) {
      return NextResponse.json(
        { error: 'You do not have permission to delete this QR code' },
        { status: 403 }
      )
    }

    // Delete the QR code
    await prisma.qrCode.delete({
      where: { id: params.id },
    })

    return new NextResponse(null, { status: 204 })
  } catch (error) {
    console.error('Error deleting QR code:', error)
    return NextResponse.json(
      { error: 'Failed to delete QR code' },
      { status: 500 }
    )
  }
}
