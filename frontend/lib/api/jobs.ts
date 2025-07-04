import { apiClient } from "./api-client"

export const jobsApi = {
  openJobCode: ({ jobUid }: { jobUid: string }) => {
    return apiClient.get<{}>(`/api/v1/jobs/open-code/${jobUid}`)
  },
}
