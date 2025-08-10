import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useTranslation } from 'react-i18next'
import { useMutation } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { CreateOrderSchema, CreateOrderDto, OrderResponse } from 'shared'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Label } from '@/components/ui/Label'

export const Route = createFileRoute('/checkout')({
  component: CheckoutPage,
})

// In a real app, this would come from a global state (e.g., Zustand, Context)
const MOCK_CART = [{ productId: 'clslm8b9d000108l376g5hfds', qty: 1 }];
const MOCK_CITIES = ["Casablanca", "Rabat", "Marrakech", "Agadir", "Fes", "Tangier", "Autre"];

async function postOrder(orderData: CreateOrderDto): Promise<OrderResponse> {
  const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/orders`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(orderData),
  })
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({ message: 'An unknown error occurred' }));
    throw new Error(errorData.message || 'Failed to place order');
  }
  return res.json()
}

function CheckoutPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<CreateOrderDto>({
    resolver: zodResolver(CreateOrderSchema),
    defaultValues: {
      items: MOCK_CART,
      acceptPrivacy: false,
      customer: { name: '', phone: '', city: 'Casablanca', address: '', notes: '' }
    }
  });

  const mutation = useMutation({
    mutationFn: postOrder,
    onSuccess: (data) => {
      navigate({ to: '/order-success', search: { orderId: data.id, shortId: data.shortId } });
    },
    onError: (error) => {
      alert(`Erreur: ${error.message}`); // Replace with a proper toast notification
    }
  });

  const onSubmit = (data: CreateOrderDto) => {
    mutation.mutate(data);
  };

  return (
    <div className="container mx-auto p-4 max-w-2xl py-8">
      <h1 className="text-3xl font-bold mb-6 text-center">{t('checkout')}</h1>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="space-y-1">
          <Label htmlFor="name">{t('form_name')}</Label>
          <Input {...register('customer.name')} id="name" />
          {errors.customer?.name && <p className="text-sm text-red-600">{errors.customer.name.message}</p>}
        </div>

        <div className="space-y-1">
          <Label htmlFor="phone">{t('form_phone')}</Label>
          <Input {...register('customer.phone')} id="phone" placeholder="0612345678" />
          {errors.customer?.phone && <p className="text-sm text-red-600">{errors.customer.phone.message}</p>}
        </div>

        <div className="space-y-1">
          <Label htmlFor="city">{t('form_city')}</Label>
          <select {...register('customer.city')} id="city" className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50">
            {MOCK_CITIES.map(city => <option key={city} value={city}>{city}</option>)}
          </select>
          {errors.customer?.city && <p className="text-sm text-red-600">{errors.customer.city.message}</p>}
        </div>

        <div className="space-y-1">
          <Label htmlFor="address">{t('form_address')}</Label>
          <Input {...register('customer.address')} id="address" />
          {errors.customer?.address && <p className="text-sm text-red-600">{errors.customer.address.message}</p>}
        </div>

        <div className="flex items-start gap-x-3 pt-2">
            <input {...register('acceptPrivacy')} id="acceptPrivacy" type="checkbox" className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary mt-1" />
            <div className="text-sm leading-6">
              <Label htmlFor="acceptPrivacy" className="font-medium text-gray-700">{t('privacy_policy_acceptance')}</Label>
              {errors.acceptPrivacy && <p className="text-sm text-red-600">{errors.acceptPrivacy.message}</p>}
            </div>
        </div>

        <div className="bg-green-50 border border-green-200 p-4 rounded-lg text-center mt-6">
          <p className="font-bold text-lg text-primary">{t('badge_cod')}</p>
          <p className="text-sm text-green-800">{t('cod_disclaimer')}</p>
        </div>

        <Button type="submit" disabled={isSubmitting || mutation.isPending} className="w-full" size="lg">
          {isSubmitting || mutation.isPending ? t('loading') : t('place_order')}
        </Button>
      </form>
    </div>
  )
}
