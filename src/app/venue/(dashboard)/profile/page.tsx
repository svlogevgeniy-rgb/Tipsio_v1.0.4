'use client'

import { useState, useEffect } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { Eye, EyeOff, Loader2 } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useToast } from '@/hooks/use-toast'

// Схема валидации профиля
const profileSchema = z.object({
  companyName: z.string().min(2, 'Название компании должно содержать минимум 2 символа'),
  email: z.string().email('Неверный формат email'),
  password: z.string().optional(),
  confirmPassword: z.string().optional(),
}).refine((data) => {
  if (data.password && data.password.length > 0 && data.password.length < 6) {
    return false
  }
  return true
}, {
  message: 'Пароль должен содержать минимум 6 символов',
  path: ['password'],
}).refine((data) => {
  if (data.password && data.password !== data.confirmPassword) {
    return false
  }
  return true
}, {
  message: 'Пароли не совпадают',
  path: ['confirmPassword'],
})

type ProfileFormData = z.infer<typeof profileSchema>

export default function VenueProfilePage() {
  const [isLoading, setIsLoading] = useState(false)
  const [isFetching, setIsFetching] = useState(true)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const { toast } = useToast()

  const form = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      companyName: '',
      email: '',
      password: '',
      confirmPassword: '',
    },
  })

  // Загрузка данных профиля при монтировании
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await fetch('/api/venues/profile')
        const result = await response.json()

        if (response.ok && result.success) {
          form.reset({
            companyName: result.data.companyName || '',
            email: result.data.email || '',
            password: '',
            confirmPassword: '',
          })
        } else {
          toast({
            title: 'Ошибка',
            description: result.message || 'Не удалось загрузить данные профиля',
            variant: 'destructive',
          })
        }
      } catch (error) {
        console.error('Error fetching profile:', error)
        toast({
          title: 'Ошибка',
          description: 'Не удалось загрузить данные профиля',
          variant: 'destructive',
        })
      } finally {
        setIsFetching(false)
      }
    }

    fetchProfile()
  }, [form, toast])

  const onSubmit = async (data: ProfileFormData) => {
    setIsLoading(true)

    try {
      // Подготавливаем данные для отправки
      const updateData: {
        companyName?: string
        email?: string
        password?: string
        confirmPassword?: string
      } = {
        companyName: data.companyName,
        email: data.email,
      }

      // Добавляем пароль только если он был введен
      if (data.password && data.password.length > 0) {
        updateData.password = data.password
        updateData.confirmPassword = data.confirmPassword
      }

      const response = await fetch('/api/venues/profile', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updateData),
      })

      const result = await response.json()

      if (response.ok && result.success) {
        toast({
          title: 'Успешно',
          description: 'Профиль успешно обновлен',
        })

        // Очищаем поля пароля после успешного обновления
        form.setValue('password', '')
        form.setValue('confirmPassword', '')
      } else {
        // Обработка ошибок валидации
        if (result.errors) {
          Object.entries(result.errors).forEach(([field, message]) => {
            form.setError(field as keyof ProfileFormData, {
              type: 'manual',
              message: message as string,
            })
          })
        }

        toast({
          title: 'Ошибка',
          description: result.message || 'Не удалось обновить профиль',
          variant: 'destructive',
        })
      }
    } catch (error) {
      console.error('Error updating profile:', error)
      toast({
        title: 'Ошибка',
        description: 'Произошла ошибка при обновлении профиля',
        variant: 'destructive',
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="p-4 md:p-6 space-y-6 max-w-2xl">
      <div>
        <h1 className="text-2xl font-heading font-bold">Профиль</h1>
        <p className="text-muted-foreground">
          Управление информацией вашего профиля и учетными данными
        </p>
      </div>

      <Card className="glass">
        <CardHeader>
          <CardTitle>Информация профиля</CardTitle>
          <CardDescription>
            Обновите данные вашего профиля и пароль
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isFetching ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : (
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {/* Название компании */}
              <div className="space-y-2">
                <Label htmlFor="companyName">Название компании</Label>
                <Input
                  id="companyName"
                  placeholder="Введите название компании"
                  {...form.register('companyName')}
                  className="h-12"
                />
                {form.formState.errors.companyName && (
                  <p className="text-sm text-destructive">
                    {form.formState.errors.companyName.message}
                  </p>
                )}
              </div>

              {/* Email */}
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="admin@example.com"
                  {...form.register('email')}
                  className="h-12"
                />
                {form.formState.errors.email && (
                  <p className="text-sm text-destructive">
                    {form.formState.errors.email.message}
                  </p>
                )}
              </div>

              {/* Пароль */}
              <div className="space-y-2">
                <Label htmlFor="password">Новый пароль</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Оставьте пустым, если не хотите менять"
                    {...form.register('password')}
                    className="h-12 pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
                {form.formState.errors.password && (
                  <p className="text-sm text-destructive">
                    {form.formState.errors.password.message}
                  </p>
                )}
              </div>

              {/* Подтверждение пароля */}
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Подтвердите пароль</Label>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    placeholder="Повторите новый пароль"
                    {...form.register('confirmPassword')}
                    className="h-12 pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
                {form.formState.errors.confirmPassword && (
                  <p className="text-sm text-destructive">
                    {form.formState.errors.confirmPassword.message}
                  </p>
                )}
              </div>

              {/* Кнопка сохранения */}
              <Button
                type="submit"
                disabled={isLoading}
                className="w-full h-12 text-lg font-heading font-bold"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Сохранение...
                  </>
                ) : (
                  'Сохранить изменения'
                )}
              </Button>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
