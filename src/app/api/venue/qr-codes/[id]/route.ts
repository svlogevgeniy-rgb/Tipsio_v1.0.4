import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Get the QR code with staff and venue information
    const qrCode = await prisma.qRCode.findUnique({
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
    if (qrCode.staff.venueId !== session.user.venueId) {
      return NextResponse.json(
        { error: 'You do not have permission to delete this QR code' },
        { status: 403 }
      )
    }

    // Delete the QR code
    await prisma.qRCode.delete({
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
