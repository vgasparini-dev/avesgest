import React, { useState, useEffect } from 'react'
import { Home, Users, Egg, TrendingUp, DollarSign, Settings, Plus, X, Edit2, Trash2 } from 'lucide-react'

function App() {
  const [currentView, setCurrentView] = useState('dashboard')
  const [lotes, setLotes] = useState([])
  const [producao, setProducao] = useState([])
  const [financeiro, setFinanceiro] = useState([])
  const [showModal, setShowModal] = useState(false)
  const [modalType, setModalType] = useState('')
  const [editingItem, setEditingItem] = useState(null)
  const [formData, setFormData] = useState({})

  // Load data from localStorage
  useEffect(() => {
    const savedLotes = localStorage.getItem('avesgest_lotes')
    const savedProducao = localStorage.getItem('avesgest_producao')
    const savedFinanceiro = localStorage.getItem('avesgest_financeiro')
    if (savedLotes) setLotes(JSON.parse(savedLotes))
    if (savedProducao) setProducao(JSON.parse(savedProducao))
    if (savedFinanceiro) setFinanceiro(JSON.parse(savedFinanceiro))
  }, [])

  // Save data to localStorage
  useEffect(() => {
    localStorage.setItem('avesgest_lotes', JSON.stringify(lotes))
  }, [lotes])

  useEffect(() => {
    localStorage.setItem('avesgest_producao', JSON.stringify(producao))
  }, [producao])

  useEffect(() => {
    localStorage.setItem('avesgest_financeiro', JSON.stringify(financeiro))
  }, [financeiro])

  // Open modal functions
  const openModal = (type, item = null) => {
    setModalType(type)
    setEditingItem(item)
    if (item) {
      setFormData(item)
    } else {
      // Reset form with defaults
      if (type === 'lote') {
        setFormData({ lote: '', raca: '', quantidade: '', data: '', alojamento: '' })
      } else if (type === 'producao') {
        setFormData({ data: '', lote: '', ovos: '', trincados: '' })
      } else if (type === 'financeiro') {
        setFormData({ data: '', descricao: '', tipo: 'receita', valor: '' })
      }
    }
    setShowModal(true)
  }

  const closeModal = () => {
    setShowModal(false)
    setModalType('')
    setEditingItem(null)
    setFormData({})
  }

  // Add/Edit functions
  const handleSubmit = (e) => {
    e.preventDefault()
    
    if (modalType === 'lote') {
      if (editingItem) {
        setLotes(lotes.map(l => l.id === editingItem.id ? {...formData, id: editingItem.id} : l))
      } else {
        setLotes([...lotes, {...formData, id: Date.now()}])
      }
    } else if (modalType === 'producao') {
      if (editingItem) {
        setProducao(producao.map(p => p.id === editingItem.id ? {...formData, id: editingItem.id} : p))
      } else {
        setProducao([...producao, {...formData, id: Date.now()}])
      }
    } else if (modalType === 'financeiro') {
      if (editingItem) {
        setFinanceiro(financeiro.map(f => f.id === editingItem.id ? {...formData, id: editingItem.id} : f))
      } else {
        setFinanceiro([...financeiro, {...formData, id: Date.now()}])
      }
    }
    
    closeModal()
  }

  // Delete function
  const handleDelete = (id, type) => {
    if (!window.confirm('Tem certeza que deseja excluir?')) return
    
    if (type === 'lote') {
      setLotes(lotes.filter(l => l.id !== id))
    } else if (type === 'producao') {
      setProducao(producao.filter(p => p.id !== id))
    } else if (type === 'financeiro') {
      setFinanceiro(financeiro.filter(f => f.id !== id))
    }
  }

  // Calculate stats
  const totalAves = lotes.reduce((sum, lote) => sum + parseInt(lote.quantidade || 0), 0)
  const producaoHoje = producao
    .filter(p => p.data === new Date().toISOString().split('T')[0])
    .reduce((sum, p) => sum + parseInt(p.ovos || 0), 0)
  
  const receitasMes = financeiro
    .filter(f => f.tipo === 'receita' && new Date(f.data).getMonth() === new Date().getMonth())
    .reduce((sum, f) => sum + parseFloat(f.valor || 0), 0)
  
  const despesasMes = financeiro
    .filter(f => f.tipo === 'despesa' && new Date(f.data).getMonth() === new Date().getMonth())
    .reduce((sum, f) => sum + parseFloat(f.valor || 0), 0)
  
  const saldoMes = receitasMes - despesasMes

  // Components
  const NavButton = ({ icon: Icon, label, view }) => (
    <button
      onClick={() => setCurrentView(view)}
      className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
        currentView === view
          ? 'bg-amber-500 text-white'
          : 'bg-slate-700 hover:bg-slate-600 text-white'
      }`}
    >
      <Icon size={20} />
      {label}
    </button>
  )

  const StatCard = ({ icon: Icon, label, value, color }) => (
    <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
      <div className="flex items-center justify-between mb-2">
        <div className={`p-3 rounded-lg bg-${color}-500/20`}>
          <Icon className={`text-${color}-500`} size={24} />
        </div>
      </div>
      <p className="text-slate-400 text-sm mb-1">{label}</p>
      <p className="text-2xl font-bold text-white">{value}</p>
    </div>
  )

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
      <div className="w-24 h-24 bg-amber-500 rounded-full flex items-center justify-center shadow-2xl mb-4 absolute top-6 left-6">
        <Egg className="text-slate-900" size={48} />
      </div>
      
      <div className="max-w-7xl w-full bg-slate-900/80 backdrop-blur rounded-2xl shadow-2xl p-8 border border-slate-700">
        <div className="mb-8">
          <h1 className="text-6xl font-bold text-white mb-2">AvesGest</h1>
          <p className="text-slate-300 text-lg">Gestão de Aves Poedeiras</p>
        </div>

        {/* Navigation */}
        <div className="flex gap-3 mb-8 flex-wrap">
          <NavButton icon={Home} label="Dashboard" view="dashboard" />
          <NavButton icon={Users} label="Lotes" view="lotes" />
          <NavButton icon={Egg} label="Produção" view="producao" />
          <NavButton icon={DollarSign} label="Financeiro" view="financeiro" />
        </div>

        {/* Dashboard View */}
        {currentView === 'dashboard' && (
          <div>
            <h2 className="text-3xl font-bold text-white mb-6 flex items-center gap-2">
              <Users className="text-amber-500" size={32} />
              Dashboard
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <StatCard icon={Users} label="Total de Aves" value={totalAves} color="amber" />
              <StatCard icon={Egg} label="Produção Hoje" value={producaoHoje} color="blue" />
              <StatCard icon={TrendingUp} label="Receitas (Mês)" value={`R$ ${receitasMes.toFixed(2)}`} color="green" />
              <StatCard icon={DollarSign} label="Saldo (Mês)" value={`R$ ${saldoMes.toFixed(2)}`} color={saldoMes >= 0 ? 'green' : 'red'} />
            </div>
          </div>
        )}

        {/* Lotes View */}
        {currentView === 'lotes' && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-3xl font-bold text-white flex items-center gap-2">
                <Users className="text-amber-500" size={32} />
                Lotes de Aves
              </h2>
              <button
                onClick={() => openModal('lote')}
                className="flex items-center gap-2 bg-amber-500 hover:bg-amber-600 text-white px-6 py-3 rounded-lg transition-colors"
              >
                <Plus size={20} />
                Novo Lote
              </button>
            </div>
            
            {lotes.length === 0 ? (
              <p className="text-slate-400 text-center py-12">Nenhum lote cadastrado</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-slate-700">
                      <th className="text-left text-slate-300 py-3">Lote</th>
                      <th className="text-left text-slate-300 py-3">Raça</th>
                      <th className="text-left text-slate-300 py-3">Quantidade</th>
                      <th className="text-left text-slate-300 py-3">Data</th>
                      <th className="text-left text-slate-300 py-3">Alojamento</th>
                      <th className="text-left text-slate-300 py-3">Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    {lotes.map(lote => (
                      <tr key={lote.id} className="border-b border-slate-800 hover:bg-slate-800/50">
                        <td className="py-3 text-white">{lote.lote}</td>
                        <td className="py-3 text-white">{lote.raca}</td>
                        <td className="py-3 text-white">{lote.quantidade}</td>
                        <td className="py-3 text-white">{new Date(lote.data).toLocaleDateString('pt-BR')}</td>
                        <td className="py-3 text-white">{lote.alojamento}</td>
                        <td className="py-3">
                          <div className="flex gap-2">
                            <button
                              onClick={() => openModal('lote', lote)}
                              className="p-2 bg-blue-500 hover:bg-blue-600 rounded-lg transition-colors"
                            >
                              <Edit2 size={16} className="text-white" />
                            </button>
                            <button
                              onClick={() => handleDelete(lote.id, 'lote')}
                              className="p-2 bg-red-500 hover:bg-red-600 rounded-lg transition-colors"
                            >
                              <Trash2 size={16} className="text-white" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Produção View */}
        {currentView === 'producao' && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-3xl font-bold text-white flex items-center gap-2">
                <Egg className="text-amber-500" size={32} />
                Produção de Ovos
              </h2>
              <button
                onClick={() => openModal('producao')}
                className="flex items-center gap-2 bg-amber-500 hover:bg-amber-600 text-white px-6 py-3 rounded-lg transition-colors"
              >
                <Plus size={20} />
                Registrar Produção
              </button>
            </div>
            
            {producao.length === 0 ? (
              <p className="text-slate-400 text-center py-12">Nenhuma produção registrada</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-slate-700">
                      <th className="text-left text-slate-300 py-3">Data</th>
                      <th className="text-left text-slate-300 py-3">Lote</th>
                      <th className="text-left text-slate-300 py-3">Ovos Produzidos</th>
                      <th className="text-left text-slate-300 py-3">Trincados</th>
                      <th className="text-left text-slate-300 py-3">Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    {producao.map(prod => (
                      <tr key={prod.id} className="border-b border-slate-800 hover:bg-slate-800/50">
                        <td className="py-3 text-white">{new Date(prod.data).toLocaleDateString('pt-BR')}</td>
                        <td className="py-3 text-white">{prod.lote}</td>
                        <td className="py-3 text-white">{prod.ovos}</td>
                        <td className="py-3 text-white">{prod.trincados}</td>
                        <td className="py-3">
                          <div className="flex gap-2">
                            <button
                              onClick={() => openModal('producao', prod)}
                              className="p-2 bg-blue-500 hover:bg-blue-600 rounded-lg transition-colors"
                            >
                              <Edit2 size={16} className="text-white" />
                            </button>
                            <button
                              onClick={() => handleDelete(prod.id, 'producao')}
                              className="p-2 bg-red-500 hover:bg-red-600 rounded-lg transition-colors"
                            >
                              <Trash2 size={16} className="text-white" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Financeiro View */}
        {currentView === 'financeiro' && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-3xl font-bold text-white flex items-center gap-2">
                <DollarSign className="text-amber-500" size={32} />
                Financeiro
              </h2>
              <button
                onClick={() => openModal('financeiro')}
                className="flex items-center gap-2 bg-amber-500 hover:bg-amber-600 text-white px-6 py-3 rounded-lg transition-colors"
              >
                <Plus size={20} />
                Nova Transação
              </button>
            </div>
            
            {financeiro.length === 0 ? (
              <p className="text-slate-400 text-center py-12">Nenhuma transação registrada</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-slate-700">
                      <th className="text-left text-slate-300 py-3">Data</th>
                      <th className="text-left text-slate-300 py-3">Descrição</th>
                      <th className="text-left text-slate-300 py-3">Tipo</th>
                      <th className="text-left text-slate-300 py-3">Valor</th>
                      <th className="text-left text-slate-300 py-3">Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    {financeiro.map(fin => (
                      <tr key={fin.id} className="border-b border-slate-800 hover:bg-slate-800/50">
                        <td className="py-3 text-white">{new Date(fin.data).toLocaleDateString('pt-BR')}</td>
                        <td className="py-3 text-white">{fin.descricao}</td>
                        <td className="py-3">
                          <span className={`px-3 py-1 rounded-full text-sm ${
                            fin.tipo === 'receita' 
                              ? 'bg-green-500/20 text-green-400' 
                              : 'bg-red-500/20 text-red-400'
                          }`}>
                            {fin.tipo.charAt(0).toUpperCase() + fin.tipo.slice(1)}
                          </span>
                        </td>
                        <td className={`py-3 font-semibold ${
                          fin.tipo === 'receita' ? 'text-green-400' : 'text-red-400'
                        }`}>
                          {fin.tipo === 'receita' ? '+' : '-'} R$ {parseFloat(fin.valor).toFixed(2)}
                        </td>
                        <td className="py-3">
                          <div className="flex gap-2">
                            <button
                              onClick={() => openModal('financeiro', fin)}
                              className="p-2 bg-blue-500 hover:bg-blue-600 rounded-lg transition-colors"
                            >
                              <Edit2 size={16} className="text-white" />
                            </button>
                            <button
                              onClick={() => handleDelete(fin.id, 'financeiro')}
                              className="p-2 bg-red-500 hover:bg-red-600 rounded-lg transition-colors"
                            >
                              <Trash2 size={16} className="text-white" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50">
            <div className="bg-slate-800 rounded-2xl p-8 max-w-md w-full border border-slate-700">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-2xl font-bold text-white">
                  {editingItem ? 'Editar' : 'Novo'} {
                    modalType === 'lote' ? 'Lote' :
                    modalType === 'producao' ? 'Produção' :
                    'Transação'
                  }
                </h3>
                <button onClick={closeModal} className="text-slate-400 hover:text-white">
                  <X size={24} />
                </button>
              </div>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                {modalType === 'lote' && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-1">Lote</label>
                      <input
                        type="text"
                        required
                        value={formData.lote || ''}
                        onChange={e => setFormData({...formData, lote: e.target.value})}
                        className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2 text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-1">Raça</label>
                      <input
                        type="text"
                        required
                        value={formData.raca || ''}
                        onChange={e => setFormData({...formData, raca: e.target.value})}
                        className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2 text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-1">Quantidade</label>
                      <input
                        type="number"
                        required
                        value={formData.quantidade || ''}
                        onChange={e => setFormData({...formData, quantidade: e.target.value})}
                        className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2 text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-1">Data de Alojamento</label>
                      <input
                        type="date"
                        required
                        value={formData.data || ''}
                        onChange={e => setFormData({...formData, data: e.target.value})}
                        className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2 text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-1">Local de Alojamento</label>
                      <input
                        type="text"
                        required
                        value={formData.alojamento || ''}
                        onChange={e => setFormData({...formData, alojamento: e.target.value})}
                        className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2 text-white"
                      />
                    </div>
                  </>
                )}

                {modalType === 'producao' && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-1">Data</label>
                      <input
                        type="date"
                        required
                        value={formData.data || ''}
                        onChange={e => setFormData({...formData, data: e.target.value})}
                        className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2 text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-1">Lote</label>
                      <select
                        required
                        value={formData.lote || ''}
                        onChange={e => setFormData({...formData, lote: e.target.value})}
                        className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2 text-white"
                      >
                        <option value="">Selecione um lote</option>
                        {lotes.map(lote => (
                          <option key={lote.id} value={lote.lote}>{lote.lote} - {lote.raca}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-1">Ovos Produzidos</label>
                      <input
                        type="number"
                        required
                        value={formData.ovos || ''}
                        onChange={e => setFormData({...formData, ovos: e.target.value})}
                        className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2 text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-1">Ovos Trincados</label>
                      <input
                        type="number"
                        required
                        value={formData.trincados || ''}
                        onChange={e => setFormData({...formData, trincados: e.target.value})}
                        className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2 text-white"
                      />
                    </div>
                  </>
                )}

                {modalType === 'financeiro' && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-1">Data</label>
                      <input
                        type="date"
                        required
                        value={formData.data || ''}
                        onChange={e => setFormData({...formData, data: e.target.value})}
                        className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2 text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-1">Descrição</label>
                      <input
                        type="text"
                        required
                        value={formData.descricao || ''}
                        onChange={e => setFormData({...formData, descricao: e.target.value})}
                        className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2 text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-1">Tipo</label>
                      <select
                        required
                        value={formData.tipo || 'receita'}
                        onChange={e => setFormData({...formData, tipo: e.target.value})}
                        className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2 text-white"
                      >
                        <option value="receita">Receita</option>
                        <option value="despesa">Despesa</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-1">Valor (R$)</label>
                      <input
                        type="number"
                        step="0.01"
                        required
                        value={formData.valor || ''}
                        onChange={e => setFormData({...formData, valor: e.target.value})}
                        className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2 text-white"
                      />
                    </div>
                  </>
                )}

                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={closeModal}
                    className="flex-1 bg-slate-700 hover:bg-slate-600 text-white px-4 py-2 rounded-lg transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="flex-1 bg-amber-500 hover:bg-amber-600 text-white px-4 py-2 rounded-lg transition-colors"
                  >
                    Salvar
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default App
