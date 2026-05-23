import React from 'react'
import { AuthProvider } from './context/AuthContext'

function App() {
  return (
    <AuthProvider>
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
        <div className="max-w-2xl w-full">
          <div className="text-center space-y-8">
            {/* Logo/Icon */}
            <div className="flex justify-center">
              <div className="w-24 h-24 bg-amber-500 rounded-full flex items-center justify-center shadow-2xl">
                <span className="text-5xl">🐥</span>
              </div>
            </div>
            
            {/* Title */}
            <div>
              <h1 className="text-6xl font-bold text-white mb-4">
                AvesGest PRO
              </h1>
              <p className="text-2xl text-amber-200 font-semibold">
                Sistema de Gestão de Aves Poedeiras
              </p>
            </div>

            {/* Description */}
            <div className="bg-white/10 backdrop-blur-md rounded-xl p-8 border border-white/20">
              <p className="text-lg text-slate-200 mb-6">
                Plataforma completa para gerenciamento de produção de ovos, sanidade, nutrição e controle financeiro.
              </p>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                <div className="bg-white/5 rounded-lg p-4">
                  <div className="text-3xl mb-2">🥚</div>
                  <div className="text-sm text-slate-300">Produção</div>
                </div>
                <div className="bg-white/5 rounded-lg p-4">
                  <div className="text-3xl mb-2">💉</div>
                  <div className="text-sm text-slate-300">Sanidade</div>
                </div>
                <div className="bg-white/5 rounded-lg p-4">
                  <div className="text-3xl mb-2">🌾</div>
                  <div className="text-sm text-slate-300">Nutrição</div>
                </div>
                <div className="bg-white/5 rounded-lg p-4">
                  <div className="text-3xl mb-2">💰</div>
                  <div className="text-sm text-slate-300">Financeiro</div>
                </div>
              </div>
            </div>

            {/* Status */}
            <div className="bg-amber-500/20 border border-amber-500/50 rounded-lg p-6">
              <p className="text-amber-200 font-semibold mb-2">
                ✨ Projeto em Desenvolvimento
              </p>
              <p className="text-sm text-slate-300">
                Sistema base configurado com Firebase e React. Próximas etapas: implementação dos módulos de gestão.
              </p>
            </div>

            {/* Footer */}
            <div className="text-slate-400 text-sm">
              <p>Desenvolvido com ❤️ para a avicultura brasileira</p>
              <p className="mt-2">
                <a href="https://github.com/vgasparini-dev/avesgest" target="_blank" rel="noopener noreferrer" className="text-amber-400 hover:text-amber-300 transition-colors">
                  💎 GitHub Repository
                </a>
              </p>
            </div>
          </div>
        </div>
      </div>
    </AuthProvider>
  )
}

export default App
