"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Loader2 } from "lucide-react"
import Image from "next/image"

export interface StartScreenProps {
  onStart: () => void
  isLoading?: boolean
}

/**
 * StartScreen - Welcome screen before quiz begins
 * Shows DigiCrazy Lab branding and introduces the questionnaire
 */
export function StartScreen({ onStart, isLoading = false }: StartScreenProps) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] px-4">
      {/* Logo with tagline */}
      <div className="mb-6">
        <Image
          src="/logo.png"
          alt="DigiCrazy Lab - TrAIn your BrAIn"
          width={320}
          height={180}
          priority
          className="h-auto"
        />
      </div>

      {/* Main card */}
      <Card className="w-full max-w-lg border-2 border-brand-blue/10 shadow-lg">
        <CardContent className="pt-8 pb-8 px-8">
          {/* Course title */}
          <div className="text-center mb-6">
            <h1 className="text-2xl md:text-3xl font-bold text-brand-blue mb-2">
              AI e professione forense
            </h1>
          </div>

          {/* Intro text */}
          <div className="space-y-4 text-gray-600 text-center mb-8">
            <p className="leading-relaxed">
              Questo breve questionario ci aiutera a personalizzare il corso
              in base alla tua esperienza e alle tue aspettative.
            </p>
            <p className="text-sm text-gray-500">
              Richiede circa 5 minuti.
            </p>
          </div>

          {/* Start button */}
          <Button
            onClick={onStart}
            disabled={isLoading}
            className="w-full py-6 text-lg font-semibold bg-brand-blue hover:bg-brand-blue/90 transition-colors"
            size="lg"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Caricamento...
              </>
            ) : (
              "Inizia"
            )}
          </Button>

          {/* Privacy note */}
          <p className="mt-6 text-xs text-gray-400 text-center leading-relaxed">
            Le tue risposte sono riservate e saranno utilizzate solo per
            migliorare la tua esperienza formativa.
          </p>
        </CardContent>
      </Card>

      {/* Footer tagline */}
      <p className="mt-8 text-sm text-gray-400">
        Formazione AI per professionisti legali
      </p>
    </div>
  )
}
