import React, { createContext, useContext, useState, useEffect } from 'react'
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged
} from 'firebase/auth'
import { doc, getDoc, setDoc, collection, getDocs, updateDoc, deleteDoc } from 'firebase/firestore'
import { auth, db } from '../services/firebase'

const AuthContext = createContext()

export function useAuth() {
  return useContext(AuthContext)
}

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null)
  const [userProfile, setUserProfile] = useState(null)
  const [loading, setLoading] = useState(true)

  // Buscar perfil do usuario no Firestore
  async function fetchUserProfile(uid) {
    const ref = doc(db, 'usuarios', uid)
    const snap = await getDoc(ref)
    if (snap.exists()) {
      setUserProfile(snap.data())
      return snap.data()
    }
    return null
  }

  // Login
  async function login(email, senha) {
    const cred = await signInWithEmailAndPassword(auth, email, senha)
    const profile = await fetchUserProfile(cred.user.uid)
    if (!profile) throw new Error('Usuario nao encontrado no sistema.')
    if (!profile.ativo) throw new Error('Acesso bloqueado. Contate o administrador.')
    return cred
  }

  // Logout
  function logout() {
    setUserProfile(null)
    return signOut(auth)
  }

  // Admin: listar todos os usuarios
  async function listarUsuarios() {
    const snap = await getDocs(collection(db, 'usuarios'))
    return snap.docs.map(d => ({ id: d.id, ...d.data() }))
  }

  // Admin: conceder acesso a um usuario (criar ou habilitar)
  async function concederAcesso(email, nome, role = 'operador') {
    // Cria conta ou habilita usuario existente
    // Admin usa Cloud Function ou cria diretamente via FirebaseAdmin
    // Aqui salva o convite pendente no Firestore
    const conviteRef = doc(collection(db, 'convites'))
    await setDoc(conviteRef, {
      email,
      nome,
      role,
      criadoEm: new Date().toISOString(),
      status: 'pendente',
      criadoPor: currentUser?.email
    })
    return conviteRef.id
  }

  // Admin: revogar acesso
  async function revogarAcesso(uid) {
    await updateDoc(doc(db, 'usuarios', uid), { ativo: false })
  }

  // Admin: reativar acesso
  async function reativarAcesso(uid) {
    await updateDoc(doc(db, 'usuarios', uid), { ativo: true })
  }

  // Admin: alterar role do usuario
  async function alterarRole(uid, novaRole) {
    await updateDoc(doc(db, 'usuarios', uid), { role: novaRole })
  }

  // Primeiro acesso: registrar usuario via convite
  async function registrarComConvite(email, senha, nome, conviteId) {
    const conviteRef = doc(db, 'convites', conviteId)
    const convite = await getDoc(conviteRef)
    if (!convite.exists()) throw new Error('Convite invalido.')
    if (convite.data().email !== email) throw new Error('Email nao corresponde ao convite.')
    if (convite.data().status !== 'pendente') throw new Error('Convite ja utilizado.')

    const cred = await createUserWithEmailAndPassword(auth, email, senha)
    await setDoc(doc(db, 'usuarios', cred.user.uid), {
      email,
      nome,
      role: convite.data().role || 'operador',
      ativo: true,
      criadoEm: new Date().toISOString()
    })
    await updateDoc(conviteRef, { status: 'usado' })
    return cred
  }

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user)
      if (user) {
        await fetchUserProfile(user.uid)
      } else {
        setUserProfile(null)
      }
      setLoading(false)
    })
    return unsub
  }, [])

  const isAdmin = userProfile?.role === 'admin'
  const isOperador = userProfile?.role === 'operador'

  const value = {
    currentUser,
    userProfile,
    isAdmin,
    isOperador,
    login,
    logout,
    listarUsuarios,
    concederAcesso,
    revogarAcesso,
    reativarAcesso,
    alterarRole,
    registrarComConvite
  }

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  )
}

export default AuthContext
