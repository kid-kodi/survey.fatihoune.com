'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { contactFormSchema, ContactFormData } from '@/lib/validation';
import { Mail, Building2, User, MessageSquare, CheckCircle2, AlertCircle } from 'lucide-react';

export default function ContactPage() {
  const t = useTranslations('Contact');
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  const form = useForm<ContactFormData>({
    resolver: zodResolver(contactFormSchema),
    defaultValues: {
      name: '',
      email: '',
      company: '',
      inquiryType: 'custom_plan',
      message: '',
    },
  });

  async function onSubmit(data: ContactFormData) {
    setIsSubmitting(true);
    setSubmitStatus('idle');
    setErrorMessage('');

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) {
        setSubmitStatus('error');
        setErrorMessage(result.error || t('error_generic'));
        return;
      }

      setSubmitStatus('success');
      form.reset();

      // Redirect to pricing page after 3 seconds
      setTimeout(() => {
        router.push('/pricing');
      }, 3000);
    } catch (error) {
      console.error('Contact form error:', error);
      setSubmitStatus('error');
      setErrorMessage(t('error_network'));
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="container mx-auto px-4 py-16 max-w-3xl">
      {/* Hero Section */}
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold mb-4">{t('title')}</h1>
        <p className="text-xl text-gray-600">{t('subtitle')}</p>
      </div>

      {/* Contact Form Card */}
      <Card>
        <CardHeader>
          <CardTitle>{t('form_title')}</CardTitle>
          <CardDescription>{t('form_description')}</CardDescription>
        </CardHeader>
        <CardContent>
          {submitStatus === 'success' ? (
            <div className="text-center py-8">
              <CheckCircle2 className="h-16 w-16 text-green-500 mx-auto mb-4" />
              <h3 className="text-2xl font-semibold mb-2">{t('success_title')}</h3>
              <p className="text-gray-600 mb-4">{t('success_message')}</p>
              <p className="text-sm text-gray-500">{t('redirecting')}</p>
            </div>
          ) : (
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                {/* Name Field */}
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('field_name')}</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                          <Input
                            {...field}
                            placeholder={t('field_name_placeholder')}
                            className="pl-10"
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Email Field */}
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('field_email')}</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                          <Input
                            {...field}
                            type="email"
                            placeholder={t('field_email_placeholder')}
                            className="pl-10"
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Company Field */}
                <FormField
                  control={form.control}
                  name="company"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('field_company')}</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Building2 className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                          <Input
                            {...field}
                            placeholder={t('field_company_placeholder')}
                            className="pl-10"
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Inquiry Type Field */}
                <FormField
                  control={form.control}
                  name="inquiryType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('field_inquiry_type')}</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder={t('field_inquiry_type_placeholder')} />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="custom_plan">
                            {t('inquiry_type_custom_plan')}
                          </SelectItem>
                          <SelectItem value="enterprise">
                            {t('inquiry_type_enterprise')}
                          </SelectItem>
                          <SelectItem value="general">
                            {t('inquiry_type_general')}
                          </SelectItem>
                          <SelectItem value="support">
                            {t('inquiry_type_support')}
                          </SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Message Field */}
                <FormField
                  control={form.control}
                  name="message"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('field_message')}</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <MessageSquare className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                          <Textarea
                            {...field}
                            placeholder={t('field_message_placeholder')}
                            className="pl-10 min-h-[150px]"
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Error Message */}
                {submitStatus === 'error' && (
                  <div className="flex items-start gap-2 p-4 bg-red-50 border border-red-200 rounded-lg">
                    <AlertCircle className="h-5 w-5 text-red-500 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-sm font-medium text-red-800">{t('error_title')}</p>
                      <p className="text-sm text-red-700 mt-1">{errorMessage}</p>
                    </div>
                  </div>
                )}

                {/* Submit Button */}
                <Button type="submit" className="w-full" disabled={isSubmitting}>
                  {isSubmitting ? t('button_submitting') : t('button_submit')}
                </Button>

                {/* Privacy Notice */}
                <p className="text-xs text-gray-500 text-center">
                  {t('privacy_notice')}
                </p>
              </form>
            </Form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
