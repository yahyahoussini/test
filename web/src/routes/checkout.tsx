import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useTranslation } from 'react-i18next'
import { useMutation } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { CreateOrderSchema, CreateOrderDto, OrderResponse } from 'shared'

export const Route = createFileRoute('/checkout')({
  component: CheckoutPage,
})

// Mock city options
const cityOptions = [
  "Casablanca", "Rabat", "Marrakech", "Agadir", "Fes", "Tangier", "Other"
];

async function postOrder(orderData: CreateOrderDto): Promise<OrderResponse> {
  const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/orders`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(orderData),
  })
  if (!res.ok) {
    const errorData = await res.json();
    throw new Error(errorData.message || 'Failed to place order');
  }
  return res.json()
}

function CheckoutPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()

  // TODO: Replace with actual cart state
  const mockCart = {
    items: [{ productId: 'clslm8b9d000108l376g5hfds', qty: 1 }],
  };

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<CreateOrderDto>({
    resolver: zodResolver(CreateOrderSchema),
    defaultValues: {
      items: mockCart.items,
      acceptPrivacy: false,
      customer: { name: '', phone: '', city: 'Casablanca', address: '' }
    }
  });

  const mutation = useMutation({
    mutationFn: postOrder,
    onSuccess: (data) => {
      // Navigate to order success page with order details
      navigate({ to: '/order-success', search: { orderId: data.id, shortId: data.shortId } });
    },
    onError: (error) => {
      // TODO: Show a toast notification with the error
      alert(`Error: ${error.message}`);
    }
  });

  const onSubmit = (data: CreateOrderDto) => {
    mutation.mutate(data);
  };

  return (
    <div className="container mx-auto p-4 max-w-2xl">
      <h1 className="text-3xl font-bold mb-6">{t('checkout')}</h1>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700">{t('form_name')}</label>
          <input {...register('customer.name')} id="name" className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm" />
          {errors.customer?.name && <p className="mt-2 text-sm text-red-600">{errors.customer.name.message}</p>}
        </div>

        <div>
          <label htmlFor="phone" className="block text-sm font-medium text-gray-700">{t('form_phone')}</label>
          <input {...register('customer.phone')} id="phone" placeholder="0612345678" className="mt-1 block w-full rounded-md border-gray-300 shadow-sm" />
          {errors.customer?.phone && <p className="mt-2 text-sm text-red-600">{errors.customer.phone.message}</p>}
        </div>

        <div>
          <label htmlFor="city" className="block text-sm font-medium text-gray-700">{t('form_city')}</label>
          <select {...register('customer.city')} id="city" className="mt-1 block w-full rounded-md border-gray-300 shadow-sm">
            {cityOptions.map(city => <option key={city} value={city}>{city}</option>)}
          </select>
          {errors.customer?.city && <p className="mt-2 text-sm text-red-600">{errors.customer.city.message}</p>}
        </div>

        <div>
          <label htmlFor="address" className="block text-sm font-medium text-gray-700">{t('form_address')}</label>
          <textarea {...register('customer.address')} id="address" rows={3} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm" />
          {errors.customer?.address && <p className="mt-2 text-sm text-red-600">{errors.customer.address.message}</p>}
        </div>

        <div className="flex items-start">
            <div className="flex h-5 items-center">
                <input {...register('acceptPrivacy')} id="acceptPrivacy" type="checkbox" className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500" />
            </div>
            <div className="ml-3 text-sm">
                <label htmlFor="acceptPrivacy" className="font-medium text-gray-700">I accept the privacy policy</label>
                {errors.acceptPrivacy && <p className="text-sm text-red-600">{errors.acceptPrivacy.message}</p>}
            </div>
        </div>

        <div className="bg-gray-50 p-4 rounded-lg text-center">
          <p className="font-bold text-lg">{t('badge_cod')}</p>
          <p className="text-sm text-gray-600">{t('cod_disclaimer')}</p>
        </div>

        <button type="submit" disabled={isSubmitting || mutation.isPending} className="w-full bg-green-700 text-white py-3 rounded-lg hover:bg-green-800 disabled:bg-gray-400">
          {isSubmitting || mutation.isPending ? t('loading') : t('place_order')}
        </button>
      </form>
    </div>
  )
}
