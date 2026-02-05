import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";

// GET /api/venues/profile - Получить данные профиля владельца заведения
export async function GET() {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      );
    }

    // Получаем пользователя и его первое заведение
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        id: true,
        email: true,
        phone: true,
        role: true,
        createdAt: true,
        updatedAt: true,
        managedVenues: {
          select: {
            id: true,
            name: true,
            logoUrl: true,
          },
          take: 1,
        },
      },
    });

    if (!user) {
      return NextResponse.json(
        { message: "User not found" },
        { status: 404 }
      );
    }

    // Используем название и логотип первого заведения
    const companyName = user.managedVenues[0]?.name || "";
    const logoUrl = user.managedVenues[0]?.logoUrl || null;

    return NextResponse.json({
      success: true,
      data: {
        email: user.email,
        phone: user.phone,
        companyName,
        logoUrl,
        role: user.role,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      },
    });
    } catch (error) {
      console.error("Error fetching venue profile:", error);
      const errorMessage = error instanceof Error ? error.message : String(error);
      // Проверяем, не связана ли ошибка с отсутствием полей в БД
      if (errorMessage.includes("Unknown column") || (errorMessage.includes("column") && errorMessage.includes("does not exist"))) {
        return NextResponse.json(
          { 
            message: "Database migration required. Please run: npx prisma db push",
            error: "Migration not applied"
          },
          { status: 500 }
        );
      }
      return NextResponse.json(
        { message: "Internal server error", error: errorMessage },
        { status: 500 }
      );
    }
}

// Схема валидации для обновления профиля
const updateProfileSchema = z.object({
  companyName: z.string().min(2, "Company name must be at least 2 characters").or(z.literal("")).optional(),
  email: z.string().email("Invalid email address").optional(),
  phone: z.string().nullable().optional(),
  logoUrl: z.union([
    z.string().min(1),
    z.literal(""),
    z.null(),
  ]).optional(),
  password: z.string().min(6, "Password must be at least 6 characters").optional(),
  confirmPassword: z.string().optional(),
}).refine(
  (data) => {
    // Если указан пароль, должно быть подтверждение
    if (data.password && !data.confirmPassword) {
      return false;
    }
    // Пароли должны совпадать
    if (data.password && data.confirmPassword && data.password !== data.confirmPassword) {
      return false;
    }
    return true;
  },
  {
    message: "Passwords must match",
    path: ["confirmPassword"],
  }
);

// PATCH /api/venues/profile - Обновить профиль владельца заведения
export async function PATCH(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await request.json();
    console.log('Profile update request body:', JSON.stringify(body, null, 2));
    
    const validation = updateProfileSchema.safeParse(body);

    if (!validation.success) {
      console.error('Validation failed:', validation.error.issues);
      const errors: Record<string, string> = {};
      validation.error.issues.forEach((err) => {
        if (err.path[0]) {
          errors[err.path[0].toString()] = err.message;
        }
      });

      return NextResponse.json(
        {
          success: false,
          message: "Validation failed",
          errors,
        },
        { status: 400 }
      );
    }

    const { companyName, email, phone, logoUrl, password } = validation.data;

    // Проверяем, не занят ли email другим пользователем
    if (email && email !== session.user.email) {
      const existingUser = await prisma.user.findUnique({
        where: { email },
      });

      if (existingUser && existingUser.id !== session.user.id) {
        return NextResponse.json(
          {
            success: false,
            message: "Email already in use",
            errors: { email: "This email is already registered" },
          },
          { status: 400 }
        );
      }
    }

    // Проверяем, не занят ли телефон другим пользователем
    if (phone && phone.trim() !== '') {
      const existingUser = await prisma.user.findUnique({
        where: { phone },
      });

      if (existingUser && existingUser.id !== session.user.id) {
        return NextResponse.json(
          {
            success: false,
            message: "Phone already in use",
            errors: { phone: "This phone is already registered" },
          },
          { status: 400 }
        );
      }
    }

    // Подготавливаем данные для обновления пользователя
    const updateUserData: {
      email?: string;
      phone?: string | null;
      passwordHash?: string;
      updatedAt: Date;
    } = {
      updatedAt: new Date(),
    };

    if (email) {
      updateUserData.email = email;
    }

    // Обрабатываем телефон: пустая строка или null = удаление
    if (phone !== undefined) {
      updateUserData.phone = phone && phone.trim() !== '' ? phone : null;
    }

    if (password) {
      updateUserData.passwordHash = await bcrypt.hash(password, 10);
    }

    // Обновляем пользователя
    const updatedUser = await prisma.user.update({
      where: { id: session.user.id },
      data: updateUserData,
      select: {
        id: true,
        email: true,
        phone: true,
        role: true,
        updatedAt: true,
      },
    });

    // Если указано название компании или логотип, обновляем первое заведение
    if (companyName !== undefined || logoUrl !== undefined) {
      const venue = await prisma.venue.findFirst({
        where: { managerId: session.user.id },
      });

      if (venue) {
        const updateVenueData: {
          name?: string;
          logoUrl?: string | null;
        } = {};

        if (companyName !== undefined) {
          updateVenueData.name = companyName;
        }

        if (logoUrl !== undefined) {
          updateVenueData.logoUrl = logoUrl || null;
        }

        await prisma.venue.update({
          where: { id: venue.id },
          data: updateVenueData,
        });
      }
    }

    // Получаем обновленные данные заведения
    const venue = await prisma.venue.findFirst({
      where: { managerId: session.user.id },
      select: {
        name: true,
        logoUrl: true,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Profile updated successfully",
      data: {
        email: updatedUser.email,
        phone: updatedUser.phone,
        companyName: venue?.name || "",
        logoUrl: venue?.logoUrl || null,
        updatedAt: updatedUser.updatedAt,
      },
    });
    } catch (error) {
      console.error("Error updating venue profile:", error);
      const errorMessage = error instanceof Error ? error.message : String(error);
      // Проверяем, не связана ли ошибка с отсутствием полей в БД
      if (errorMessage.includes("Unknown column") || (errorMessage.includes("column") && errorMessage.includes("does not exist"))) {
        return NextResponse.json(
          {
            success: false,
            message: "Database migration required. Please run: npx prisma db push",
            error: "Migration not applied"
          },
          { status: 500 }
        );
      }
      return NextResponse.json(
        {
          success: false,
          message: "Internal server error",
          error: errorMessage
        },
        { status: 500 }
      );
    }
}
