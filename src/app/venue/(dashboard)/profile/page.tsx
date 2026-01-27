'use client'

import { useState, useEffect, useRef } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { Eye, EyeOff, Loader2, Upload, X, User } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useToast } from '@/hooks/use-toast'
import { useAvatarUpload } from '@/components/venue/staff/use-avatar-upload'

// Схема валидации профиля
const profileSchema = z.object({
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  email: z.string().email('Неверный формат email'),
  phone: z.string().optional(),
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

interface ProfileData {
  email: string
  phone: string | null
  firstName: string | null
  lastName: string | null
  avatarUrl: string | null
  companyName: string
}

export default function VenueProfilePage() {
  const [isLoading, setIsLoading] = useState(false)
  const [isFetching, setIsFetching] = useState(true)
  const [isUploading, setIsUploading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [profileData, setProfileData] = useState<ProfileData | null>(null)
  const [currentAvatarUrl, setCurrentAvatarUrl] = useState<string | null>(null)
  const { toast } = useToast()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const {
    avatarFile,
    avatarPreview,
    selectFile,
    clearAvatar,
  } = useAvatarUpload()

  const form = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
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
          const data = result.data
          setProfileData(data)
          setCurrentAvatarUrl(data.avatarUrl)
          form.reset({
            firstName: data.firstName || '',
            lastName: data.lastName || '',
            email: data.email || '',
            phone: data.phone || '',
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

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    // Валидация формата
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png']
    if (!allowedTypes.includes(file.type)) {
      toast({
        title: 'Ошибка',
        description: 'Разрешены только файлы JPG или PNG',
        variant: 'destructive',
      })
      return
    }

    // Валидация размера
    const maxSize = 5 * 1024 * 1024 // 5MB
    if (file.size > maxSize) {
      toast({
        title: 'Ошибка',
        description: 'Файл слишком большой. Максимум 5MB',
        variant: 'destructive',
      })
      return
    }

    const error = selectFile(file)
    if (error) {
      toast({
        title: 'Ошибка',
        description: error,
        variant: 'destructive',
      })
    }
  }

  const handleClearAvatar = () => {
    clearAvatar()
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const getInitials = (firstName?: string | null, lastName?: string | null) => {
    const first = firstName?.[0]?.toUpperCase() || ''
    const last = lastName?.[0]?.toUpperCase() || ''
    return (first + last) || 'U'
  }

  const onSubmit = async (data: ProfileFormData) => {
    setIsLoading(true)

    try {
      let avatarUrl = currentAvatarUrl

      // Загружаем аватар, если выбран новый файл
      if (avatarFile) {
        setIsUploading(true)
        try {
          const formData = new FormData()
          formData.append('file', avatarFile)

          const uploadRes = await fetch('/api/upload', {
            method: 'POST',
            body: formData,
          })

          if (!uploadRes.ok) {
            const uploadError = await uploadRes.json()
            throw new Error(uploadError.message || 'Не удалось загрузить изображение')
          }

          const uploadData = await uploadRes.json()
          avatarUrl = uploadData.url
        } catch (uploadError) {
          toast({
            title: 'Ошибка',
            description: uploadError instanceof Error ? uploadError.message : 'Не удалось загрузить изображение',
            variant: 'destructive',
          })
          setIsLoading(false)
          setIsUploading(false)
          return
        } finally {
          setIsUploading(false)
        }
      }

      // Подготавливаем данные для отправки
      const updateData: {
        firstName?: string
        lastName?: string
        email?: string
        phone?: string
        avatarUrl?: string | null
        password?: string
        confirmPassword?: string
      } = {
        firstName: data.firstName || null,
        lastName: data.lastName || null,
        email: data.email,
        phone: data.phone || null,
        avatarUrl: avatarUrl || null,
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

        // Обновляем локальное состояние
        setCurrentAvatarUrl(avatarUrl)
        if (profileData) {
          setProfileData({
            ...profileData,
            ...updateData,
            avatarUrl: avatarUrl || null,
          })
        }

        // Очищаем поля пароля и аватара после успешного обновления
        form.setValue('password', '')
        form.setValue('confirmPassword', '')
        clearAvatar()
        if (fileInputRef.current) {
          fileInputRef.current.value = ''
        }
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

  const displayAvatarUrl = avatarPreview || currentAvatarUrl
  const displayInitials = getInitials(
    form.watch('firstName') || profileData?.firstName,
    form.watch('lastName') || profileData?.lastName
  )

  return (
    <div className="p-4 md:p-6 space-y-6 max-w-4xl">
      <div>
        <h1 className="text-2xl font-heading font-bold">Профиль</h1>
        <p className="text-muted-foreground">
          Управление информацией вашего профиля и учетными данными
        </p>
      </div>

      {isFetching ? (
        <Card className="glass">
          <CardContent className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </CardContent>
        </Card>
      ) : (
        <Tabs defaultValue="settings" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="bonuses">Бонусы</TabsTrigger>
            <TabsTrigger value="settings">Настройка профиля</TabsTrigger>
            <TabsTrigger value="referral">Реферальная программа</TabsTrigger>
          </TabsList>

          {/* Вкладка: Бонусы */}
          <TabsContent value="bonuses" className="mt-6">
            <Card className="glass">
              <CardContent className="py-12 text-center">
                <p className="text-muted-foreground text-lg">
                  Скоро здесь появятся предложения от партнёров.
                </p>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Вкладка: Настройка профиля */}
          <TabsContent value="settings" className="mt-6">
            <Card className="glass">
              <CardHeader>
                <CardTitle>Информация профиля</CardTitle>
                <CardDescription>
                  Обновите данные вашего профиля и пароль
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  {/* Загрузка аватара */}
                  <div className="space-y-2">
                    <Label>Фото профиля</Label>
                    <div className="flex items-center gap-4">
                      <div className="relative w-24 h-24 rounded-full overflow-hidden bg-muted flex items-center justify-center border-2 border-primary/20">
                        {displayAvatarUrl ? (
                          <>
                            <Image
                              src={displayAvatarUrl}
                              alt="Avatar"
                              width={96}
                              height={96}
                              className="w-full h-full object-cover"
                            />
                            {(avatarPreview || avatarFile) && (
                              <button
                                type="button"
                                onClick={handleClearAvatar}
                                className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity"
                              >
                                <X className="w-6 h-6 text-white" />
                              </button>
                            )}
                          </>
                        ) : (
                          <span className="text-2xl font-semibold text-primary">
                            {displayInitials}
                          </span>
                        )}
                      </div>
                      <div className="flex-1">
                        <input
                          ref={fileInputRef}
                          type="file"
                          accept="image/jpeg,image/jpg,image/png"
                          className="hidden"
                          id="avatar-upload"
                          onChange={handleFileSelect}
                        />
                        <Label
                          htmlFor="avatar-upload"
                          className="cursor-pointer inline-flex items-center gap-2 px-4 py-2 border border-input bg-background hover:bg-accent hover:text-accent-foreground rounded-md transition-colors"
                        >
                          <Upload className="w-4 h-4" />
                          {displayAvatarUrl ? 'Изменить фото' : 'Загрузить фото'}
                        </Label>
                        <p className="text-sm text-muted-foreground mt-2">
                          JPG или PNG, квадратное фото 1:1, максимум 5MB
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Имя */}
                  <div className="space-y-2">
                    <Label htmlFor="firstName">Имя</Label>
                    <Input
                      id="firstName"
                      placeholder="Введите имя"
                      {...form.register('firstName')}
                      className="h-12"
                    />
                    {form.formState.errors.firstName && (
                      <p className="text-sm text-destructive">
                        {form.formState.errors.firstName.message}
                      </p>
                    )}
                  </div>

                  {/* Фамилия */}
                  <div className="space-y-2">
                    <Label htmlFor="lastName">Фамилия</Label>
                    <Input
                      id="lastName"
                      placeholder="Введите фамилию"
                      {...form.register('lastName')}
                      className="h-12"
                    />
                    {form.formState.errors.lastName && (
                      <p className="text-sm text-destructive">
                        {form.formState.errors.lastName.message}
                      </p>
                    )}
                  </div>

                  {/* Email */}
                  <div className="space-y-2">
                    <Label htmlFor="email">Электронная почта</Label>
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

                  {/* Номер телефона */}
                  <div className="space-y-2">
                    <Label htmlFor="phone">Номер телефона</Label>
                    <Input
                      id="phone"
                      type="tel"
                      placeholder="+7 (999) 123-45-67"
                      {...form.register('phone')}
                      className="h-12"
                    />
                    {form.formState.errors.phone && (
                      <p className="text-sm text-destructive">
                        {form.formState.errors.phone.message}
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
                    disabled={isLoading || isUploading}
                    className="w-full h-12 text-lg font-heading font-bold"
                  >
                    {isLoading || isUploading ? (
                      <>
                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                        {isUploading ? 'Загрузка изображения...' : 'Сохранение...'}
                      </>
                    ) : (
                      'Сохранить'
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Вкладка: Реферальная программа */}
          <TabsContent value="referral" className="mt-6">
            <Card className="glass">
              <CardContent className="py-12 text-center">
                <div className="max-w-md mx-auto space-y-4">
                  <div className="w-24 h-24 mx-auto rounded-full bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center">
                    <User className="w-12 h-12 text-primary/60" />
                  </div>
                  <p className="text-muted-foreground text-lg">
                    Скоро вам будет доступна реферальная программа
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      )}
    </div>
  )
}
