import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/api'

export interface User {
  id: string
  email: string
  firstName: string
  lastName: string
  roleId: string
  isActive: boolean
  role?: {
    name: string
  }
}

export function useUsers() {
  const queryClient = useQueryClient()

  const { data, isLoading, error } = useQuery({
    queryKey: ['users'],
    queryFn: async () => {
      const response = await api.get('/users')
      return response as User[]
    },
  })

  const addUserMutation = useMutation({
    mutationFn: async (data: any) => {
      return await api.post('/users', data)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] })
    },
  })

  const updateUserMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string, data: any }) => {
      return await api.put(`/users/${id}`, data)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] })
    },
  })

  const deleteUserMutation = useMutation({
    mutationFn: async (id: string) => {
      return await api.delete(`/users/${id}`)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] })
    },
  })

  return {
    users: data || [],
    isLoading,
    error,
    addUser: (data: any) => addUserMutation.mutateAsync(data),
    updateUser: (id: string, data: any) => updateUserMutation.mutateAsync({ id, data }),
    deleteUser: (id: string) => deleteUserMutation.mutateAsync(id)
  }
}
