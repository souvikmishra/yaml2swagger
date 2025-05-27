# OpenAPI Specification Converter

A Next.js web application that converts OpenAPI 3.0 specifications to various formats:

- Postman Collection (v2.1 JSON format)
- Swagger UI HTML page
- TypeScript client SDK

## Features

- Upload OpenAPI specification files (.yaml or .json)
- Paste raw OpenAPI specification text
- Generate and download Postman collections
- Preview Swagger UI documentation
- Generate TypeScript type definitions
- Modern UI with TailwindCSS
- Client-side processing (no backend required)

## Getting Started

### Prerequisites

- Node.js 18.x or later
- npm 9.x or later

### Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/yourusername/yaml2swagger.git
   cd yaml2swagger
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Start the development server:

   ```bash
   npm run dev
   ```

4. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Usage

1. **Input OpenAPI Specification**

   - Upload a .yaml or .json file containing your OpenAPI specification
   - Or paste the raw specification text into the text area

2. **Generate Outputs**

   - Click the "Generate Outputs" button to process the specification
   - Wait for the generation to complete

3. **Download or Preview**
   - Download the Postman collection as a JSON file
   - Preview the Swagger UI documentation in a new tab
   - Download the TypeScript type definitions

## Technologies Used

- Next.js 14
- React
- TypeScript
- TailwindCSS
- js-yaml
- openapi-to-postmanv2
- swagger-ui-dist
- openapi-typescript

## Development

### Project Structure

```
src/
  ├── app/
  │   ├── page.tsx
  │   └── layout.tsx
  ├── components/
  │   ├── InputForm.tsx
  │   └── OutputSection.tsx
  └── lib/
      ├── openapiToPostman.ts
      ├── openapiToSwaggerHTML.ts
      └── openapiToTypescript.ts
```

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run lint` - Run ESLint

## License

MIT

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.
