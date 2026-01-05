import { createClient } from '@/lib/supabase/client'
import { LoginForm, RegisterForm } from '@/types'
import { Database } from '@/types/supabase'

const supabase = createClient() as any

type UserInsert = Database['public']['Tables']['users']['Insert']

export const authService = {
  login: async (credentials: LoginForm) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: credentials.email,
      password: credentials.password,
    })

    if (error) throw error

    return {
      user: data.user,
      session: data.session,
    }
  },

  register: async (userData: RegisterForm) => {
    const { data, error } = await supabase.auth.signUp({
      email: userData.email,
      password: userData.password,
      options: {
        data: {
          name: userData.name,
        },
      },
    })

    if (error) throw error

    if (data.user) {
      const newUser: UserInsert = {
        id: data.user.id,
        name: userData.name,
        email: userData.email,
        password_hash: 'managed_by_supabase_auth',
      }

      const { error: profileError } = await supabase
        .from('users')
        .insert(newUser)
      
      if (profileError) {
        console.error('Erro ao criar perfil de usuário:', profileError)
      }
    }

    return {
      user: data.user,
      session: data.session,
    }
  },

  logout: async () => {
    const { error } = await supabase.auth.signOut()
    if (error) throw error
  },

  getProfile: async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return null

    const { data: profile } = await supabase
      .from('users')
      .select('*')
      .eq('id', user.id)
      .single()

    if (!profile) {
      return {
        id: user.id,
        email: user.email,
        name: user.user_metadata.name || '',
      }
    }

    return {
      id: user.id,
      email: user.email,
      ...profile,
    }
  },
  
  getSession: async () => {
    const { data } = await supabase.auth.getSession()
    return data.session
  }
}
