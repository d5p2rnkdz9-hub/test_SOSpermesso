import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Questionario AI | DigiCrazy Lab",
  description: "Valutazione delle competenze e aspettative sull'uso dell'AI nella professione forense",
}

/**
 * Quiz layout - Clean layout without header/footer
 * DigiCrazy Lab branded background (subtle)
 */
export default function QuizLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      {/* Subtle branded background pattern */}
      <div
        className="fixed inset-0 -z-10 opacity-[0.02]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%231e3a5f' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }}
      />

      <main className="relative flex min-h-screen flex-col items-center justify-center px-4 py-8 md:py-12">
        <div className="w-full max-w-2xl">
          {children}
        </div>
      </main>
    </div>
  )
}
