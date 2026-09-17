import {
  createContext,
  useContext,
  useState,
  useEffect,
  type ReactNode,
} from 'react'
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  type User,
} from 'firebase/auth'
import { doc, getDoc, setDoc } from 'firebase/firestore'
import { auth, db } from '../services/firebase'

export type UserRole = 'garcom' | 'caixa' | 'admin'

export interface UserProfile {
  uid: string
  name: string
  email: string
  role: UserRole
}

interface AuthContextType {
  user: User | null
  profile: UserProfile | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<void>
  signUp: (
    name: string,
    email: string,
    password: string,
    role: UserRole
  ) => Promise<void>
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType)

export function useAuth() {
  return useContext(AuthContext)
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser)
      if (firebaseUser) {
        const docRef = doc(db, 'users', firebaseUser.uid)
        const docSnap = await getDoc(docRef)
        if (docSnap.exists()) {
          setProfile(docSnap.data() as UserProfile)
        }
      } else {
        setProfile(null)
      }
      setLoading(false)
    })
    return unsubscribe
  }, [])

  async function signIn(email: string, password: string) {
    await signInWithEmailAndPassword(auth, email, password)
  }

  async function signUp(
    name: string,
    email: string,
    password: string,
    role: UserRole
  ) {
    const credential = await createUserWithEmailAndPassword(
      auth,
      email,
      password
    )
    const userProfile: UserProfile = {
      uid: credential.user.uid,
      name,
      email,
      role,
    }
    await setDoc(doc(db, 'users', credential.user.uid), userProfile)
    setProfile(userProfile)
  }

  async function signOut() {
    await firebaseSignOut(auth)
    setProfile(null)
  }

  return (
    <AuthContext.Provider
      value={{ user, profile, loading, signIn, signUp, signOut }}
    >
      {children}
    </AuthContext.Provider>
  )
}
