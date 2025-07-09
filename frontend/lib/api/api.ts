import { formatBytes } from "../utils"

export interface Dataset {
  uid: string
  name: string
  description: string
  size: string
  type: string
  createdAt: Date
  lastUpdated: Date
  accessRequests: number
  permissions: string[]
  usersCount: number
  requestsCount: number
  activityData: number[]
}

export interface Job {
  uid: string
  datasetName: string
  projectName: string
  description: string
  requestedTime: Date
  requesterEmail: string
  status: "pending" | "approved" | "denied"
}

interface DatasetResponse {
  uid: string
  createdBy: string
  createdAt: string
  updatedAt: string
  clientId: string
  name: string
  private: string
  privateSize: number
  mock: string
  mockSize: number
  summary: string
  readme: string
  tags: string[]
  runtime: {
    cmd: string[]
    imageName: string | null
    mountDir: string | null
  }
  autoApproval: string[]
}

interface DatasetListResponse {
  datasets: DatasetResponse[]
}

type JobStatus = 
  | "pending_code_review"
  | "job_run_failed"
  | "job_run_finished"
  | "rejected"
  | "shared"
  | "approved"

const pendingStatuses = ["pending_code_review", "job_run_failed"] as const
const approvedStatuses = ["shared", "approved", "job_run_finished"] as const
const deniedStatuses = ["rejected"] as const

interface JobResponse {
  uid: string
  createdBy: string
  createdAt: string
  updatedAt: string
  clientId: string
  name: string
  description: string
  userCodeId: string
  tags: string[]
  userMetadata: Record<string, string>
  status: JobStatus
  error: string
  errorMessage: string | null
  outputUrl: string
  datasetName: string
  enclave: string
}

interface JobListResponse {
  jobs: JobResponse[]
}

interface AutoApproveResponse {
  datasites: string[]
}

const getBaseUrl = () => {
  return process.env.NEXT_PUBLIC_API_URL || ""
}

export const apiService = {
  async getDatasets(): Promise<{ datasets: Dataset[] }> {
    const response = await fetch(`${getBaseUrl()}/api/v1/datasets`)
    const data: DatasetListResponse = await response.json()
    const jobs = await this.getJobs()

    const jobMap = jobs.jobs.reduce((map, job) => {
      const jobs = map.get(job.datasetName) || []
      map.set(job.datasetName, [...jobs, job])
      return map
    }, new Map<string, Job[]>())

    // Get the unique users count for each dataset
    const uniqueUsersMap = jobs.jobs.reduce((map, job) => {
      const uniqueEmails = map.get(job.datasetName) || new Set<string>()
      uniqueEmails.add(job.requesterEmail)
      map.set(job.datasetName, uniqueEmails)
      return map
    }, new Map<string, Set<string>>())

    // Get activity data for the past 12 weeks
    const getWeekNumber = (date: Date): number => {
      const now = new Date()
      const diffTime = now.getTime() - date.getTime()
      const diffWeeks = Math.floor(diffTime / (1000 * 60 * 60 * 24 * 7))
      return diffWeeks
    }

    const activityDataMap = jobs.jobs.reduce((map, job) => {
      const weekNumber = getWeekNumber(job.requestedTime)
      // Only consider jobs from the past 12 weeks
      if (weekNumber >= 0 && weekNumber < 12) {
        const currentActivity = map.get(job.datasetName) || Array(12).fill(0)
        // weekNumber 0 is current week, so we need to reverse the index
        currentActivity[11 - weekNumber]++
        map.set(job.datasetName, currentActivity)
      }
      return map
    }, new Map<string, number[]>())

    return {
      datasets: data.datasets.map((dataset) => ({
        uid: dataset.uid,
        name: dataset.name,
        description: dataset.summary,
        size: formatBytes(dataset.privateSize),
        type: dataset.private.split(".").pop() || "unknown",
        createdAt: new Date(dataset.createdAt),
        lastUpdated: new Date(dataset.updatedAt),
        accessRequests: 0,
        permissions: [],
        usersCount: uniqueUsersMap.get(dataset.name)?.size || 0,
        requestsCount: jobMap.get(dataset.name)?.length || 0,
        activityData: activityDataMap.get(dataset.name) || Array(12).fill(0),
      })),
    }
  },

  async createDataset(
    formData: FormData
  ): Promise<{ success: boolean; message: string }> {
    try {
      const response = await fetch(`${getBaseUrl()}/api/v1/datasets`, {
        method: "POST",
        body: formData,
        // Important: Don't set Content-Type header - browser will set it automatically with boundary for FormData
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.detail || "Failed to create dataset")
      }

      const data: DatasetResponse = await response.json()
      return {
        success: true,
        message: `Dataset "${formData.get("name")}" created successfully`,
      }
    } catch (error) {
      console.error("Error creating dataset:", error)
      throw error
    }
  },

  async getJobs(): Promise<{ jobs: Job[] }> {
    const response = await fetch(`${getBaseUrl()}/api/v1/jobs`)
    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.detail || "Failed to fetch jobs")
    }
    const data: JobListResponse = await response.json()
    return {
      jobs: data.jobs.map((job) => ({
        uid: job.uid,
        datasetName: job.datasetName,
        projectName: job.name,
        description: job.description,
        requestedTime: new Date(job.createdAt),
        requesterEmail: job.createdBy,
        status: (pendingStatuses as readonly string[]).includes(job.status)
          ? "pending"
          : (approvedStatuses as readonly string[]).includes(job.status)
          ? "approved"
          : "denied",
      })),
    }
  },

  async getAutoApprovedDatasites(): Promise<{ datasites: string[] }> {
    const response = await fetch(
      `${getBaseUrl()}/api/v1/auto-approved-datasites`
    )
    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.detail || "Failed to fetch auto-approve list")
    }
    const data: AutoApproveResponse = await response.json()
    return data
  },

  async setAutoApprovedDatasites(
    datasites: string[]
  ): Promise<{ message: string }> {
    const response = await fetch(
      `${getBaseUrl()}/api/v1/auto-approved-datasites`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(datasites),
      }
    )

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error || "Failed to update auto-approve list")
    }

    const data = await response.json()
    return data
  },

  async deleteDataset(datasetName: string): Promise<{ message: string }> {
    const response = await fetch(
      `${getBaseUrl()}/api/v1/datasets/${encodeURIComponent(datasetName)}`,
      {
        method: "DELETE",
      }
    )

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.detail || "Failed to delete dataset")
    }

    const data = await response.json()
    return data
  },

  async downloadDatasetPrivate(datasetUid: string): Promise<Response> {
    const response = await fetch(
      `${getBaseUrl()}/api/v1/datasets/${datasetUid}/private`,
      {
        method: "GET",
      }
    )

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.detail || "Failed to download dataset")
    }

    return response
  },

  async approveJob(jobId: string): Promise<{ message: string }> {
    const response = await fetch(
      `${getBaseUrl()}/api/v1/jobs/${jobId}/approve`,
      {
        method: "POST",
      }
    )

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.detail || "Failed to approve job")
    }

    const data = await response.json()
    return data
  },

  async rejectJob(jobId: string): Promise<{ message: string }> {
    const response = await fetch(
      `${getBaseUrl()}/api/v1/jobs/${jobId}/reject`,
      {
        method: "POST",
      }
    )

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.detail || "Failed to reject job")
    }

    const data = await response.json()
    return data
  },
}
