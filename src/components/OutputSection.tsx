import { useState, useRef } from 'react';
import { Download, ExternalLink } from 'lucide-react';
import { convertToPostman } from '@/lib/openapiToPostman';
import { generateSwaggerHTML } from '@/lib/openapiToSwaggerHTML';
import { generateTypeScriptTypes } from '@/lib/openapiToTypescript';
import type { OpenAPIObject } from 'openapi-typescript';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from '@/components/ui/dialog';

interface OutputSectionProps {
  spec: OpenAPIObject;
  enableGenerate?: boolean;
}

export function OutputSection({
  spec,
  enableGenerate = true,
}: OutputSectionProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [outputs, setOutputs] = useState<{
    postman: string | null;
    swagger: string | null;
    typescript: string | null;
  }>({
    postman: null,
    swagger: null,
    typescript: null,
  });
  const [showSwaggerModal, setShowSwaggerModal] = useState(false);
  const swaggerIframeRef = useRef<HTMLIFrameElement>(null);

  const generateOutputs = async () => {
    setIsGenerating(true);
    setError(null);

    try {
      const [postman, typescript] = await Promise.all([
        convertToPostman(spec),
        generateTypeScriptTypes(spec),
      ]);

      const swagger = generateSwaggerHTML(spec);

      setOutputs({
        postman,
        swagger,
        typescript,
      });
    } catch (error) {
      setError(
        error instanceof Error ? error.message : 'Failed to generate outputs'
      );
    } finally {
      setIsGenerating(false);
    }
  };

  const downloadFile = (content: string, filename: string) => {
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="w-full max-w-4xl mx-auto p-4 space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Generated Outputs</h2>
        <Button
          onClick={generateOutputs}
          disabled={isGenerating || !enableGenerate}
        >
          {isGenerating ? 'Generating...' : 'Generate Outputs'}
        </Button>
      </div>

      {error && (
        <Card className="border-destructive">
          <CardContent className="p-4 text-destructive">{error}</CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Postman Collection */}
        <Card>
          <CardHeader>
            <CardTitle>Postman Collection</CardTitle>
            <CardDescription>
              Download a Postman collection for your API
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              variant="outline"
              onClick={() =>
                outputs.postman &&
                downloadFile(outputs.postman, 'postman-collection.json')
              }
              disabled={!outputs.postman}
              className="w-full"
            >
              <Download className="w-4 h-4 mr-2" />
              Download
            </Button>
          </CardContent>
        </Card>

        {/* Swagger UI */}
        <Card>
          <CardHeader>
            <CardTitle>Swagger UI</CardTitle>
            <CardDescription>
              Preview your API documentation Swagger style
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              variant="outline"
              onClick={() => setShowSwaggerModal(true)}
              disabled={!outputs.swagger}
              className="w-full"
            >
              <ExternalLink className="w-4 h-4 mr-2" />
              Preview
            </Button>
          </CardContent>
        </Card>

        {/* TypeScript Types */}
        <Card>
          <CardHeader>
            <CardTitle>TypeScript Types</CardTitle>
            <CardDescription>
              Download TypeScript type definitions
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              variant="outline"
              onClick={() =>
                outputs.typescript &&
                downloadFile(outputs.typescript, 'api-types.ts')
              }
              disabled={!outputs.typescript}
              className="w-full"
            >
              <Download className="w-4 h-4 mr-2" />
              Download
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Swagger Modal */}
      <Dialog open={showSwaggerModal} onOpenChange={setShowSwaggerModal}>
        <DialogContent className="max-w-4xl h-[80vh]">
          <DialogHeader>
            <DialogTitle>Swagger UI Preview</DialogTitle>
            <DialogClose />
          </DialogHeader>
          {outputs.swagger && (
            <iframe
              ref={swaggerIframeRef}
              srcDoc={outputs.swagger}
              title="Swagger UI Preview"
              className="flex-1 w-full border-0 rounded-b-lg"
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
