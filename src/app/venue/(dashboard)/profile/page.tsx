'use client'

import { useState, useEffect, useRef, useMemo } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { Eye, EyeOff, Loader2, Upload, X } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useToast } from '@/hooks/use-toast'
import { useAvatarUpload } from '@/components/venue/staff/use-avatar-upload'
import { useTranslations } from 'next-intl'

type ProfileFormData = {
  companyName: string
  email: string
  phone?: string
  password?: string
  confirmPassword?: string
}

interface ProfileData {
  email: string
  phone: string | null
  companyName: string
  logoUrl: string | null
}

export default function VenueProfilePage() {
  const t = useTranslations('venue.profile')
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

  // Схема валидации с переводами
  const profileSchema = useMemo(() => z.object({
    companyName: z.string().min(2, t('validation.companyNameMin')),
    email: z.string().email(t('validation.emailInvalid')),
    phone: z.string().optional(),
    password: z.string().optional(),
    confirmPassword: z.string().optional(),
  }).refine((data) => {
    if (data.password && data.password.length > 0 && data.password.length < 6) {
      return false
    }
    return true
  }, {
    message: t('validation.passwordMin'),
    path: ['password'],
  }).refine((data) => {
    if (data.password && data.password !== data.confirmPassword) {
      return false
    }
    return true
  }, {
    message: t('validation.passwordMismatch'),
    path: ['confirmPassword'],
  }), [t])

  const form = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      companyName: '',
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
          setCurrentAvatarUrl(data.logoUrl)
          form.reset({
            companyName: data.companyName || '',
            email: data.email || '',
            phone: data.phone || '',
            password: '',
            confirmPassword: '',
          })
        } else {
          toast({
            title: t('error'),
            description: result.message || t('error'),
            variant: 'destructive',
          })
        }
      } catch (error) {
        console.error('Error fetching profile:', error)
        toast({
          title: t('error'),
          description: t('error'),
          variant: 'destructive',
        })
      } finally {
        setIsFetching(false)
      }
    }

    fetchProfile()
  }, [form, toast, t])

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    // Валидация формата
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png']
    if (!allowedTypes.includes(file.type)) {
      toast({
        title: t('error'),
        description: t('validation.fileType'),
        variant: 'destructive',
      })
      return
    }

    // Валидация размера
    const maxSize = 5 * 1024 * 1024 // 5MB
    if (file.size > maxSize) {
      toast({
        title: t('error'),
        description: t('validation.fileSize'),
        variant: 'destructive',
      })
      return
    }

    const error = selectFile(file)
    if (error) {
      toast({
        title: t('error'),
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

  const getInitials = (companyName?: string | null) => {
    if (!companyName) return 'C'
    const words = companyName.trim().split(/\s+/)
    if (words.length >= 2) {
      return (words[0][0] + words[1][0]).toUpperCase()
    }
    return companyName.substring(0, 2).toUpperCase()
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
            title: t('error'),
            description: uploadError instanceof Error ? uploadError.message : t('uploadError'),
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
        companyName?: string
        email?: string
        phone?: string | null
        logoUrl?: string | null
        password?: string
        confirmPassword?: string
      } = {
        email: data.email,
        phone: data.phone || null,
        logoUrl: avatarUrl || null,
      }

      // Добавляем companyName только если он заполнен
      if (data.companyName && data.companyName.trim().length >= 2) {
        updateData.companyName = data.companyName.trim()
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
          title: t('success'),
          description: t('success'),
        })

        // Обновляем локальное состояние
        setCurrentAvatarUrl(avatarUrl)
        if (profileData) {
          setProfileData({
            ...profileData,
            ...updateData,
            logoUrl: avatarUrl || null,
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
          title: t('error'),
          description: result.message || t('error'),
          variant: 'destructive',
        })
      }
    } catch (error) {
      console.error('Error updating profile:', error)
      toast({
        title: t('error'),
        description: t('error'),
        variant: 'destructive',
      })
    } finally {
      setIsLoading(false)
    }
  }

  const displayAvatarUrl = avatarPreview || currentAvatarUrl
  const displayInitials = getInitials(
    form.watch('companyName') || profileData?.companyName
  )

  return (
    <div className="p-4 md:p-6 space-y-6 max-w-4xl">
      <div>
        <h1 className="text-2xl font-heading font-bold">{t('title')}</h1>
        <p className="text-muted-foreground">
          {t('description')}
        </p>
      </div>

      {isFetching ? (
        <Card className="glass">
          <CardContent className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </CardContent>
        </Card>
      ) : (
        <div className="w-full">
          {/* Настройка профиля */}
          <div className="mt-6">
            <Card className="glass">
              <CardHeader>
                <CardTitle>{t('profileInfo')}</CardTitle>
                <CardDescription>
                  {t('profileInfoDesc')}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  {/* Загрузка аватара */}
                  <div className="space-y-2">
                    <Label>{t('companyLogo')}</Label>
                    <div className="flex items-center gap-4">
                      <div className="relative w-24 h-24 rounded-full overflow-hidden bg-muted flex items-center justify-center border-2 border-primary/20">
                        {displayAvatarUrl ? (
                          <>
                            <Image
                              src={displayAvatarUrl}
                              alt="Logo"
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
                          {displayAvatarUrl ? t('changeLogo') : t('uploadLogo')}
                        </Label>
                        <p className="text-sm text-muted-foreground mt-2">
                          {t('logoHelper')}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Название компании */}
                  <div className="space-y-2">
                    <Label htmlFor="companyName">{t('companyName')}</Label>
                    <Input
                      id="companyName"
                      placeholder={t('companyNamePlaceholder')}
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
                    <Label htmlFor="email">{t('email')}</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder={t('emailPlaceholder')}
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
                    <Label htmlFor="phone">{t('phone')}</Label>
                    <Input
                      id="phone"
                      type="tel"
                      placeholder={t('phonePlaceholder')}
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
                    <Label htmlFor="password">{t('password')}</Label>
                    <div className="relative">
                      <Input
                        id="password"
                        type={showPassword ? 'text' : 'password'}
                        placeholder={t('passwordPlaceholder')}
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
                    <Label htmlFor="confirmPassword">{t('confirmPassword')}</Label>
                    <div className="relative">
                      <Input
                        id="confirmPassword"
                        type={showConfirmPassword ? 'text' : 'password'}
                        placeholder={t('confirmPasswordPlaceholder')}
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
                        {isUploading ? t('uploading') : t('saving')}
                      </>
                    ) : (
                      t('save')
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  )
}
