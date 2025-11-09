import { queryObjects } from "v8";
import { z } from "zod";

// Schema validation to request
export const SearchRequestSchema = z.object({
  query: z.string().min(1, "Product name must be 3 chars least."),
  stores: z.array(z.enum(["mercadolivre", "amazon", "shopee"])).optional(),
});

// Typescript type generated automatically from schema
export type SearchRequest = z.infer<typeof SearchRequestSchema>;

// Type for the result of a product
export interface ProductResult {
  store: string;
  title: string;
  price: number;
  shipping: number;
  url: string;
}

//Type for the complete response
export interface SearchResponse {
  query: string;
  results: ProductResult[];
  timestamp: string;
}
