/* eslint-disable @typescript-eslint/no-explicit-any */
declare module 'swagger-to-postman' {
  interface ConvertOptions {
    folderStrategy?: 'paths' | 'tags';
  }

  interface ConvertResult {
    status: 'success' | 'error';
    output?: Array<{
      type: string;
      data: any;
    }>;
    reason?: string;
  }

  export function convert(
    spec: { type: string; data: any },
    options?: ConvertOptions
  ): Promise<ConvertResult>;
}
