'use client';

import { useState } from 'react';
import { InputForm } from '@/components/InputForm';
import { OutputSection } from '@/components/OutputSection';
import type { OpenAPIObject } from 'openapi-typescript';
import { ThemeSelector } from '@/components/ThemeSelector';

export default function Home() {
  const [spec, setSpec] = useState<OpenAPIObject | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSpecValid, setIsSpecValid] = useState(false);

  const handleSpecParsed = (parsedSpec: OpenAPIObject) => {
    setSpec(parsedSpec);
    setError(null);
    setIsSpecValid(true);
  };

  const handleError = (errorMessage: string) => {
    setError(errorMessage);
    setSpec(null);
    setIsSpecValid(false);
  };

  return (
    <main className="min-h-screen flex flex-col justify-between bg-primary-foreground">
      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="flex justify-end mb-4">
          <ThemeSelector />
        </div>
        <div className="text-center mb-12">
          <h1 className="text-4xl text-primary font-bold mb-4">
            OpenAPI Specification Converter
          </h1>
          <p className="text-xl text-primary">
            Convert your OpenAPI specification to Postman collection, Swagger
            UI, and TypeScript types
          </p>
        </div>

        <InputForm
          onSpecParsed={handleSpecParsed}
          onError={handleError}
          onValidityChange={setIsSpecValid}
        />

        {error && (
          <div className="mt-8 p-4 bg-red-50 border border-red-200 rounded-md text-red-700">
            {error}
          </div>
        )}

        {spec && <OutputSection spec={spec} enableGenerate={isSpecValid} />}
      </div>
      <footer className="py-4 text-center text-sm text-muted-foreground">
        Made with ❤️ by{' '}
        <a
          href="https://avgweb.dev"
          target="_blank"
          rel="noopener noreferrer"
          className="hover:underline"
        >
          kivous
        </a>
      </footer>
    </main>
  );
}
