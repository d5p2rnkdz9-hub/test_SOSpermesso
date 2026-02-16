import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Questionario | SOSpermesso",
  description: "Valutazione delle competenze e aspettative per il permesso di soggiorno",
}

/**
 * Quiz layout - Clean layout with SOSpermesso background
 */
export default function QuizLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-background">
      <main className="relative flex min-h-screen flex-col items-center justify-center px-4 py-8 md:py-12">
        <div className="w-full max-w-2xl">
          {children}
        </div>
      </main>
    </div>
  )
}
