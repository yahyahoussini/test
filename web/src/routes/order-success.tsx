import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { z } from 'zod'
import { useTranslation } from 'react-i18next'
import { useMutation } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Label } from '@/components/ui/Label'

const orderSuccessSearchSchema = z.object({
  orderId: z.string(),
  shortId: z.string(),
})

export const Route = createFileRoute('/order-success')({
  validateSearch: orderSuccessSearchSchema,
  component: OrderSuccessPage,
})

async function verifyOtp({ orderId, code }: { orderId: string, code: string }) {
  const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/orders/${orderId}/verify-otp`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ code }),
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({ message: 'Failed to verify OTP'}));
    throw new Error(errorData.message || 'Failed to verify OTP');
  }
  return res.json();
}

function OrderSuccessPage() {
  const { t } = useTranslation()
  const { orderId, shortId } = Route.useSearch()
  const navigate = useNavigate()

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<{ code: string }>();

  const mutation = useMutation({
    mutationFn: (code: string) => verifyOtp({ orderId, code }),
    onSuccess: () => {
      alert("Commande confirmée! Merci pour votre achat."); // Replace with toast
      navigate({ to: '/' });
    },
    onError: (error) => {
      alert(`Erreur: ${error.message}`); // Replace with toast
    },
  });

  const onSubmit = (data: { code: string }) => {
    mutation.mutate(data.code);
  };

  return (
    <div className="container mx-auto p-4 max-w-lg text-center py-16">
      <h1 className="text-3xl font-bold text-primary mb-4">{t('success_title')}</h1>
      <p className="text-gray-600 mb-8">
        Votre commande <span className="font-bold">#{shortId}</span> a bien été enregistrée.
      </p>

      <div className="bg-white border p-6 rounded-lg shadow-sm">
        <h2 className="text-lg font-semibold mb-3">{t('otp_prompt')}</h2>
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col items-center gap-4">
          <div className="w-full max-w-xs">
            <Label htmlFor="otp" className="sr-only">OTP Code</Label>
            <Input
              {...register('code', { required: true, minLength: 6, maxLength: 6 })}
              id="otp"
              type="text"
              inputMode="numeric"
              maxLength={6}
              className="w-full text-center text-2xl tracking-[.3em] p-2"
              placeholder="------"
            />
            {errors.code && <p className="text-sm text-red-600 mt-1">Le code doit faire 6 chiffres.</p>}
          </div>
          <Button
            type="submit"
            disabled={isSubmitting || mutation.isPending}
            className="w-full max-w-xs"
            size="lg"
          >
            {isSubmitting || mutation.isPending ? t('loading') : "Vérifier & Confirmer"}
          </Button>
        </form>
      </div>
    </div>
  )
}
