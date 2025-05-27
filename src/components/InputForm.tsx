import { useState, useCallback, useRef } from 'react';
import { Upload, FileText } from 'lucide-react';
import * as yaml from 'js-yaml';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import type { OpenAPIObject } from 'openapi-typescript';

interface InputFormProps {
  onSpecParsed: (spec: OpenAPIObject) => void;
  onError: (error: string) => void;
  onValidityChange?: (valid: boolean) => void;
}

export function InputForm({
  onSpecParsed,
  onError,
  onValidityChange,
}: InputFormProps) {
  const [textInput, setTextInput] = useState('');
  const [isValid, setIsValid] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleFileUpload = useCallback(
    async (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (!file) {
        setIsValid(false);
        if (onValidityChange) onValidityChange(false);
        return;
      }

      try {
        const text = await file.text();
        const spec = parseSpec(text);
        setIsValid(true);
        if (onValidityChange) onValidityChange(true);
        onSpecParsed(spec);
      } catch (error) {
        setIsValid(false);
        if (onValidityChange) onValidityChange(false);
        onError(
          error instanceof Error ? error.message : 'Failed to parse file'
        );
      }
    },
    [onSpecParsed, onError, onValidityChange]
  );

  const handleTextSubmit = useCallback(
    (event: React.FormEvent) => {
      event.preventDefault();
      try {
        const spec = parseSpec(textInput);
        setIsValid(true);
        if (onValidityChange) onValidityChange(true);
        onSpecParsed(spec);
      } catch (error) {
        setIsValid(false);
        if (onValidityChange) onValidityChange(false);
        onError(
          error instanceof Error ? error.message : 'Failed to parse spec'
        );
      }
    },
    [textInput, onSpecParsed, onError, onValidityChange]
  );

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setTextInput(e.target.value);
    try {
      parseSpec(e.target.value);
      setIsValid(true);
      if (onValidityChange) onValidityChange(true);
    } catch {
      setIsValid(false);
      if (onValidityChange) onValidityChange(false);
    }

    // Scroll to end after content changes
    if (textareaRef.current) {
      textareaRef.current.scrollTop = textareaRef.current.scrollHeight;
    }
  };

  const parseSpec = (text: string): OpenAPIObject => {
    try {
      // Try parsing as JSON first
      return JSON.parse(text) as OpenAPIObject;
    } catch {
      try {
        // If JSON fails, try parsing as YAML
        return yaml.load(text) as OpenAPIObject;
      } catch {
        throw new Error(
          'Invalid OpenAPI specification format. Please provide valid JSON or YAML.'
        );
      }
    }
  };

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardContent className="p-6">
        <Tabs defaultValue="file" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="file" className="flex items-center gap-2">
              <Upload className="w-4 h-4" />
              Upload File
            </TabsTrigger>
            <TabsTrigger value="text" className="flex items-center gap-2">
              <FileText className="w-4 h-4" />
              Paste Text
            </TabsTrigger>
          </TabsList>

          <TabsContent value="file" className="mt-6">
            <div className="border-2 border-dashed rounded-lg p-8 text-center">
              <input
                type="file"
                accept=".json,.yaml,.yml"
                onChange={handleFileUpload}
                className="hidden"
                id="file-upload"
              />
              <label htmlFor="file-upload">
                <Button variant="outline" className="cursor-pointer">
                  <Upload className="w-4 h-4 mr-2" />
                  Choose File
                </Button>
              </label>
              <p className="mt-2 text-sm text-muted-foreground">
                Upload a .json or .yaml file containing your OpenAPI
                specification
              </p>
            </div>
          </TabsContent>

          <TabsContent value="text" className="mt-6">
            <form onSubmit={handleTextSubmit} className="space-y-4">
              <Textarea
                ref={textareaRef}
                value={textInput}
                onChange={handleTextChange}
                placeholder="Paste your OpenAPI specification here..."
                className="h-[300px] font-mono overflow-y-auto resize-none"
              />
              <Button
                type="submit"
                disabled={!textInput.trim() || !isValid}
                className="w-full"
              >
                Parse Specification
              </Button>
            </form>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
