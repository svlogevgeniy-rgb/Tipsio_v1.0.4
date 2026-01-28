import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";

// GET /api/admin/profile - Получить данные профиля администратора
export async function GET() {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        id: true,
        email: true,
        role: true,
        createdAt: true,
        updatedAt: true,
        managedVenues: {
          select: {
            id: true,
            name: true,
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

    // Для администратора используем название первого заведения как "название компании"
    const companyName = user.managedVenues[0]?.name || "";

    return NextResponse.json({
      success: true,
      data: {
        email: user.email,
        companyName,
        role: user.role,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      },
    });
  } catch (error) {
    console.error("Error fetching admin profile:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}

// Схема валидации для обновления профиля
const updateProfileSchema = z.object({
  companyName: z.string().min(2, "Company name must be at least 2 characters").optional(),
  email: z.string().email("Invalid email address").optional(),
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

// PATCH /api/admin/profile - Обновить профиль администратора
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
    const validation = updateProfileSchema.safeParse(body);

    if (!validation.success) {
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

    const { companyName, email, password } = validation.data;

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

    // Подготавливаем данные для обновления
    const updateData: {
      email?: string;
      passwordHash?: string;
      updatedAt: Date;
    } = {
      updatedAt: new Date(),
    };

    if (email) {
      updateData.email = email;
    }

    if (password) {
      updateData.passwordHash = await bcrypt.hash(password, 10);
    }

    // Обновляем пользователя
    const updatedUser = await prisma.user.update({
      where: { id: session.user.id },
      data: updateData,
      select: {
        id: true,
        email: true,
        role: true,
        updatedAt: true,
      },
    });

    // Если указано название компании, обновляем первое заведение
    if (companyName) {
      const venue = await prisma.venue.findFirst({
        where: { managerId: session.user.id },
      });

      if (venue) {
        await prisma.venue.update({
          where: { id: venue.id },
          data: { name: companyName },
        });
      }
    }

    return NextResponse.json({
      success: true,
      message: "Profile updated successfully",
      data: {
        email: updatedUser.email,
        companyName: companyName || "",
        updatedAt: updatedUser.updatedAt,
      },
    });
  } catch (error) {
    console.error("Error updating admin profile:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Internal server error",
      },
      { status: 500 }
    );
  }
}
