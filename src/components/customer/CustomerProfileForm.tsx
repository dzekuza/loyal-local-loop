
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '../ui/form';
import { User } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const customerFormSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  surname: z.string().min(1, 'Surname is required'),
  email: z.string().email('Valid email is required'),
  phone: z.string().optional(),
});

const passwordFormSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: z.string().min(6, 'Password must be at least 6 characters'),
  confirmPassword: z.string().min(6, 'Password confirmation is required'),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

interface CustomerProfileFormProps {
  profile: any;
  onUpdate: (profile: any) => void;
}

const CustomerProfileForm: React.FC<CustomerProfileFormProps> = ({ profile, onUpdate }) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const { t } = useTranslation();
  const [isLoading, setIsLoading] = useState(false);
  const [isPasswordLoading, setIsPasswordLoading] = useState(false);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [showPasswordForm, setShowPasswordForm] = useState(false);

  const form = useForm<z.infer<typeof customerFormSchema>>({
    resolver: zodResolver(customerFormSchema),
    defaultValues: {
      name: profile?.name?.split(' ')[0] || '',
      surname: profile?.name?.split(' ')[1] || '',
      email: user?.email || '',
      phone: profile?.phone || '',
    },
  });

  const passwordForm = useForm<z.infer<typeof passwordFormSchema>>({
    resolver: zodResolver(passwordFormSchema),
    defaultValues: {
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    },
  });

  const handleAvatarUpload = async (file: File) => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${user?.id}/avatar.${fileExt}`;

    // Create bucket if it doesn't exist
    await supabase.storage.createBucket('customer-avatars', { public: true });

    const { error: uploadError } = await supabase.storage
      .from('customer-avatars')
      .upload(fileName, file, { upsert: true });

    if (uploadError) throw uploadError;

    const { data: { publicUrl } } = supabase.storage
      .from('customer-avatars')
      .getPublicUrl(fileName);

    return publicUrl;
  };

  const onSubmit = async (values: z.infer<typeof customerFormSchema>) => {
    if (!user) return;

    setIsLoading(true);
    try {
      let avatarUrl = profile?.avatar;

      if (avatarFile) {
        avatarUrl = await handleAvatarUpload(avatarFile);
      }

      // Update profile
      const fullName = `${values.name} ${values.surname}`;
      const { data, error } = await supabase
        .from('profiles')
        .update({
          name: fullName,
          phone: values.phone,
          avatar: avatarUrl,
        })
        .eq('id', user.id)
        .select()
        .single();

      if (error) throw error;

      // Update email if changed
      if (values.email !== user.email) {
        const { error: emailError } = await supabase.auth.updateUser({
          email: values.email,
        });

        if (emailError) throw emailError;

        toast({
          title: t('profile.emailUpdate'),
          description: t('profile.emailUpdateDescription'),
        });
      }

      onUpdate(data);

      toast({
        title: t('common.success'),
        description: t('profile.profileUpdateSuccess'),
      });
    } catch (error) {
      console.error('Error updating profile:', error);
      toast({
        title: t('common.error'),
        description: t('profile.profileUpdateError'),
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const onPasswordSubmit = async (values: z.infer<typeof passwordFormSchema>) => {
    setIsPasswordLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({
        password: values.newPassword
      });

      if (error) throw error;

      toast({
        title: t('common.success'),
        description: t('profile.passwordUpdateSuccess'),
      });

      passwordForm.reset();
      setShowPasswordForm(false);
    } catch (error) {
      console.error('Error updating password:', error);
      toast({
        title: t('common.error'),
        description: t('profile.passwordUpdateError'),
        variant: "destructive",
      });
    } finally {
      setIsPasswordLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <User className="w-5 h-5" />
            <span>{t('profile.title')}</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {/* Avatar Upload */}
              <div className="space-y-2">
                <label className="text-sm font-medium">{t('profile.avatar')}</label>
                <div className="flex items-center space-x-4">
                  {profile?.avatar && (
                    <img src={profile.avatar} alt="Current avatar" className="w-16 h-16 object-cover rounded-full" />
                  )}
                  <div>
                    <Input
                      type="file"
                      accept="image/*"
                      onChange={(e) => setAvatarFile(e.target.files?.[0] || null)}
                      className="w-auto"
                    />
                    <p className="text-sm text-gray-500 mt-1">{t('profile.avatarUpload')}</p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('profile.firstName')}</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="surname"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('profile.lastName')}</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('profile.email')}</FormLabel>
                    <FormControl>
                      <Input {...field} type="email" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('profile.phone')}</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder={t('profile.phoneOptional')} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button type="submit" disabled={isLoading} className="w-full">
                {isLoading ? t('profile.updating') : t('profile.updateProfile')}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      {/* Password Change Section */}
      <Card>
        <CardHeader>
          <CardTitle>{t('profile.changePassword')}</CardTitle>
        </CardHeader>
        <CardContent>
          {!showPasswordForm ? (
            <Button onClick={() => setShowPasswordForm(true)} variant="outline">
              {t('profile.changePassword')}
            </Button>
          ) : (
            <Form {...passwordForm}>
              <form onSubmit={passwordForm.handleSubmit(onPasswordSubmit)} className="space-y-4">
                <FormField
                  control={passwordForm.control}
                  name="currentPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('profile.currentPassword')}</FormLabel>
                      <FormControl>
                        <Input {...field} type="password" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={passwordForm.control}
                  name="newPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('profile.newPassword')}</FormLabel>
                      <FormControl>
                        <Input {...field} type="password" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={passwordForm.control}
                  name="confirmPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('profile.confirmPassword')}</FormLabel>
                      <FormControl>
                        <Input {...field} type="password" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="flex space-x-2">
                  <Button type="submit" disabled={isPasswordLoading}>
                    {isPasswordLoading ? t('profile.updating') : t('profile.updatePassword')}
                  </Button>
                  <Button type="button" variant="outline" onClick={() => setShowPasswordForm(false)}>
                    {t('profile.cancel')}
                  </Button>
                </div>
              </form>
            </Form>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default CustomerProfileForm;
