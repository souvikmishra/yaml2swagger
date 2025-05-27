import { OpenAPIObject } from 'openapi-typescript';

interface PostmanRequest {
  name: string;
  request: {
    method: string;
    header: Array<{ key: string; value: string }>;
    url: {
      raw: string;
      host: string[];
      path: string[];
      query?: Array<{ key: string; value: string }>;
    };
    body?: {
      mode: string;
      raw?: string;
      formdata?: Array<{ key: string; value: string }>;
    };
  };
  response: Array<{
    name: string;
    originalRequest: unknown;
    status: string;
    code: number;
    _postman_previewlanguage: string;
    header: Array<{ key: string; value: string }>;
    cookie: Array<unknown>;
    body: string;
  }>;
}

interface PostmanCollection {
  info: {
    name: string;
    description?: string;
    schema: string;
  };
  item: PostmanRequest[];
}

interface OpenAPIParameter {
  name: string;
  in: string;
  description?: string;
  required?: boolean;
  schema?: {
    type: string;
    [key: string]: unknown;
  };
}

export async function convertToPostman(spec: OpenAPIObject): Promise<string> {
  try {
    const collection: PostmanCollection = {
      info: {
        name: spec.info.title || 'API Collection',
        description: spec.info.description,
        schema:
          'https://schema.getpostman.com/json/collection/v2.1.0/collection.json',
      },
      item: [],
    };

    // Convert paths to Postman requests
    Object.entries(spec.paths).forEach(([path, pathItem]) => {
      Object.entries(pathItem).forEach(([method, operation]) => {
        if (method === 'parameters') return; // Skip path parameters

        const request: PostmanRequest = {
          name:
            operation.summary ||
            operation.operationId ||
            `${method.toUpperCase()} ${path}`,
          request: {
            method: method.toUpperCase(),
            header: [],
            url: {
              raw: path,
              host: [spec.servers?.[0]?.url || '{{baseUrl}}'],
              path: path.split('/').filter(Boolean),
            },
          },
          response: [],
        };

        // Add request body if present
        if (operation.requestBody) {
          const content = operation.requestBody.content;
          const contentType = Object.keys(content)[0];
          request.request.header.push({
            key: 'Content-Type',
            value: contentType,
          });

          if (contentType === 'application/json') {
            request.request.body = {
              mode: 'raw',
              raw: JSON.stringify({}, null, 2),
            };
          }
        }

        // Add query parameters if present
        if (operation.parameters) {
          const queryParams = operation.parameters
            .filter((param: OpenAPIParameter) => param.in === 'query')
            .map((param: OpenAPIParameter) => ({
              key: param.name,
              value: '',
            }));
          if (queryParams.length > 0) {
            request.request.url.query = queryParams;
          }
        }

        collection.item.push(request);
      });
    });

    return JSON.stringify(collection, null, 2);
  } catch (error) {
    throw new Error(
      `Error converting to Postman: ${
        error instanceof Error ? error.message : String(error)
      }`
    );
  }
}
