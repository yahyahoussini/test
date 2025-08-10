import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/')({
  component: HomeComponent,
})

function HomeComponent() {
  return (
    <div className="container mx-auto p-4">
      <div className="text-center py-20">
        <h1 className="text-4xl font-bold">Welcome to Tussna Biocosmétique</h1>
        <p className="text-lg text-gray-600 mt-4">
          Your source for the best bio cosmetics from Morocco.
        </p>
      </div>
    </div>
  )
}
