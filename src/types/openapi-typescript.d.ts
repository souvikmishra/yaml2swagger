declare module 'openapi-typescript' {
  export interface OpenAPIObject {
    openapi: string;
    info: {
      title: string;
      version: string;
      [key: string]: any;
    };
    paths: {
      [path: string]: {
        [method: string]: any;
      };
    };
    [key: string]: any;
  }

  export interface GenerateApiOptions {
    input: OpenAPIObject;
    output: {
      format: 'string' | 'file';
      path?: string;
    };
  }

  export function generateApi(options: GenerateApiOptions): Promise<string>;
}
