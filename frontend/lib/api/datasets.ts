import z from "zod"
import { apiClient } from "./api-client"

export const datasetsApi = {
  addShopifyDataset: (data: z.infer<typeof AddShopifyDatasetFormSchema>) => {
    console.debug(data)
    return apiClient.post<{}>("/api/v1/datasets/add-from-shopify", data)
  },
}

export const AddShopifyDatasetFormSchema = z.object({
  name: z.string().min(1, { message: "Dataset name is required" }),
  url: z
    .string()
    .min(1, { message: "Store URL is required" })
    .url({ message: "Not a valid URL" })
    .refine(
      (url) => {
        try {
          const urlObj = new URL(url)
          return urlObj.protocol === "https:" || urlObj.protocol === "http:"
        } catch {
          return false
        }
      },
      { message: "URL must start with http:// or https://" }
    ),
  pat: z.string().min(1, { message: "Access Token is required" }),
  description: z.string().optional(),
})
