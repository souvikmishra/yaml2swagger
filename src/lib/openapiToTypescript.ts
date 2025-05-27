import { OpenAPIObject } from 'openapi-typescript';

interface SchemaObject {
  type?: string;
  format?: string;
  properties?: Record<string, SchemaObject>;
  items?: SchemaObject;
  enum?: string[];
  allOf?: SchemaObject[];
  oneOf?: SchemaObject[];
  anyOf?: SchemaObject[];
  $ref?: string;
  [key: string]: unknown;
}

function generateTypeFromSchema(schema: SchemaObject, name: string): string {
  if (schema.$ref) {
    return schema.$ref.split('/').pop() || 'unknown';
  }

  if (schema.enum) {
    return schema.enum.map((value) => `'${value}'`).join(' | ');
  }

  if (schema.type === 'object' && schema.properties) {
    const properties = Object.entries(schema.properties)
      .map(([propName, propSchema]) => {
        const type = generateTypeFromSchema(propSchema, propName);
        return `  ${propName}${propSchema.required ? '' : '?'}: ${type};`;
      })
      .join('\n');
    return `{\n${properties}\n}`;
  }

  if (schema.type === 'array' && schema.items) {
    const itemType = generateTypeFromSchema(schema.items, `${name}Item`);
    return `Array<${itemType}>`;
  }

  switch (schema.type) {
    case 'string':
      return 'string';
    case 'number':
    case 'integer':
      return 'number';
    case 'boolean':
      return 'boolean';
    case 'null':
      return 'null';
    default:
      return 'unknown';
  }
}

function generateTypesFromSchemas(
  schemas: Record<string, SchemaObject>
): string {
  return Object.entries(schemas)
    .map(([name, schema]) => {
      const type = generateTypeFromSchema(schema, name);
      return `export type ${name} = ${type};`;
    })
    .join('\n\n');
}

function generateRequestTypes(paths: OpenAPIObject['paths']): string {
  const types: string[] = [];

  Object.entries(paths).forEach(([path, pathItem]) => {
    Object.entries(pathItem).forEach(([method, operation]) => {
      if (method === 'parameters') return;

      const operationId =
        operation.operationId ||
        `${method}${path.replace(/[^a-zA-Z0-9]/g, '')}`;

      // Request type
      if (operation.requestBody?.content) {
        const contentType = Object.keys(operation.requestBody.content)[0];
        const schema = operation.requestBody.content[contentType].schema;
        if (schema) {
          const requestType = generateTypeFromSchema(
            schema,
            `${operationId}Request`
          );
          types.push(`export type ${operationId}Request = ${requestType};`);
        }
      }

      // Response type
      if (operation.responses?.['200']?.content) {
        const contentType = Object.keys(operation.responses['200'].content)[0];
        const schema = operation.responses['200'].content[contentType].schema;
        if (schema) {
          const responseType = generateTypeFromSchema(
            schema,
            `${operationId}Response`
          );
          types.push(`export type ${operationId}Response = ${responseType};`);
        }
      }
    });
  });

  return types.join('\n\n');
}

export async function generateTypeScriptTypes(
  spec: OpenAPIObject
): Promise<string> {
  try {
    const types: string[] = [];

    // Generate types from schemas
    if (spec.components?.schemas) {
      types.push(generateTypesFromSchemas(spec.components.schemas));
    }

    // Generate request/response types
    if (spec.paths) {
      types.push(generateRequestTypes(spec.paths));
    }

    return types.join('\n\n');
  } catch (error) {
    throw new Error(
      `Error generating TypeScript types: ${
        error instanceof Error ? error.message : String(error)
      }`
    );
  }
}
