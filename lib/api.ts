const handleResponse = async (response: Response) => {
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ message: "An unknown error occurred." }))
    throw new Error(errorData.message || "Something went wrong.")
  }
  return response.json()
}

export const api = {
  get: async (url: string) => {
    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    })
    return handleResponse(response)
  },
  post: async (url: string, data: any) => {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    })
    return handleResponse(response)
  },
  put: async (url: string, data: any) => {
    const response = await fetch(url, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    })
    return handleResponse(response)
  },
  delete: async (url: string) => {
    const response = await fetch(url, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
    })
    return handleResponse(response)
  },
}
