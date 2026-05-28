export interface BlogPost {
  _id?: string
  title: string
  content: string
  summary: string
  coverImage?: string
  tags: string[]
  status: 'draft' | 'published'
  createdAt?: Date
  updatedAt?: Date
  authorId: string
  authorName: string
}

export interface User {
  id: string
  username: string
  nickname?: string
  avatarUrl?: string
}

export interface AuthContextType {
  user: User | null
  isLoading: boolean
  isAuthenticated: boolean
  login: (username: string, password: string) => Promise<{ success: boolean; error?: string }>
  logout: () => Promise<void>
}