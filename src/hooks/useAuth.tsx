import { createContext, useContext } from 'react'
import type { User } from '../types'

export const AuthCtx = createContext<{ user?: User; logout: () => void }>({ logout: () => {} })
export const useAuth = () => useContext(AuthCtx)
