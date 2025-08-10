import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { z } from 'zod'
import { useTranslation } from 'react-i18next'
import { useMutation } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'

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
    const errorData = await res.json();
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
      // On successful verification, maybe navigate to a final "thank you" page
      // or just display a success message here.
      alert("Order Confirmed! Thank you for your purchase.");
      navigate({ to: '/' });
    },
    onError: (error) => {
      alert(`Error: ${error.message}`);
    },
  });

  const onSubmit = (data: { code: string }) => {
    mutation.mutate(data.code);
  };

  return (
    <div className="container mx-auto p-4 max-w-lg text-center">
      <h1 className="text-3xl font-bold text-green-700 mb-4">{t('success_title')}</h1>
      <p className="text-gray-600 mb-6">
        Your order #{shortId} has been placed. Please verify your phone number to confirm it.
      </p>

      <div className="bg-gray-50 p-6 rounded-lg shadow-sm">
        <h2 className="text-lg font-semibold mb-3">{t('otp_prompt')}</h2>
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col items-center gap-4">
          <input
            {...register('code', { required: true, minLength: 6, maxLength: 6 })}
            id="otp"
            type="text"
            maxLength={6}
            className="w-48 text-center text-2xl tracking-[.2em] p-2 border rounded-md shadow-sm"
            placeholder="------"
          />
          {errors.code && <p className="text-sm text-red-600">OTP must be 6 digits.</p>}
          <button
            type="submit"
            disabled={isSubmitting || mutation.isPending}
            className="w-full bg-green-700 text-white py-3 rounded-lg hover:bg-green-800 disabled:bg-gray-400"
          >
            {isSubmitting || mutation.isPending ? t('loading') : "Verify & Confirm Order"}
          </button>
        </form>
      </div>
    </div>
  )
}
