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

  // Add/Edit functions
  const handleAddLote = (data) => {
    if (editingItem) {
      setLotes(lotes.map(l => l.id === editingItem.id ? {...data, id: editingItem.id} : l))
    } else {
      setLotes([...lotes, {...data, id: Date.now()}])
    }
    closeModal()
  }

  const handleAddProducao = (data) => {
    if (editingItem) {
      setProducao(producao.map(p => p.id === editingItem.id ? {...data, id: editingItem.id} : p))
    } else {
      setProducao([...producao, {...data, id: Date.now()}])
    }
    closeModal()
  }

  const handleAddFinanceiro = (data) => {
    if (editingItem) {
      setFinanceiro(financeiro.map(f => f.id === editingItem.id ? {...data, id: editingItem.id} : f))
    } else {
      setFinanceiro([...financeiro, {...data, id: Date.now()}])
    }
    closeModal()
  }

  const handleDelete = (id, type) => {
    if (window.confirm('Deseja realmente excluir?')) {
      if (type === 'lote') setLotes(lotes.filter(l => l.id !== id))
      if (type === 'producao') setProducao(producao.filter(p => p.id !== id))
      if (type === 'financeiro') setFinanceiro(financeiro.filter(f => f.id !== id))
    }
  }

  const openModal = (type, item = null) => {
    setModalType(type)
    setEditingItem(item)
    setShowModal(true)
  }

  const closeModal = () => {
    setShowModal(false)
    setModalType('')
    setEditingItem(null)
  }

  // Calculate statistics
  const totalAves = lotes.reduce((sum, l) => sum + (parseInt(l.quantidade) || 0), 0)
  const producaoHoje = producao.filter(p => p.data === new Date().toISOString().split('T')[0])
    .reduce((sum, p) => sum + (parseInt(p.ovos) || 0), 0)
  const receitasMes = financeiro.filter(f => f.tipo === 'receita' && f.data?.startsWith(new Date().toISOString().slice(0,7)))
    .reduce((sum, f) => sum + (parseFloat(f.valor) || 0), 0)
  const despesasMes = financeiro.filter(f => f.tipo === 'despesa' && f.data?.startsWith(new Date().toISOString().slice(0,7)))
    .reduce((sum, f) => sum + (parseFloat(f.valor) || 0), 0)

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100">
      {/* Sidebar */}
      <div className="fixed left-0 top-0 h-full w-64 bg-slate-800 border-r border-slate-700 p-4">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-amber-400 flex items-center gap-2">
            <span className="text-3xl">🐥</span> AvesGest
          </h1>
          <p className="text-xs text-slate-400 mt-1">Gestão de Aves Poedeiras</p>
        </div>
        
        <nav className="space-y-2">
          <NavItem icon={<Home size={20}/>} label="Dashboard" active={currentView === 'dashboard'} onClick={() => setCurrentView('dashboard')} />
          <NavItem icon={<Users size={20}/>} label="Lotes" active={currentView === 'lotes'} onClick={() => setCurrentView('lotes')} />
          <NavItem icon={<Egg size={20}/>} label="Produção" active={currentView === 'producao'} onClick={() => setCurrentView('producao')} />
          <NavItem icon={<DollarSign size={20}/>} label="Financeiro" active={currentView === 'financeiro'} onClick={() => setCurrentView('financeiro')} />
        </nav>
      </div>

      {/* Main Content */}
      <div className="ml-64 p-8">
        {currentView === 'dashboard' && (
          <Dashboard totalAves={totalAves} producaoHoje={producaoHoje} receitasMes={receitasMes} despesasMes={despesasMes} />
        )}
        {currentView === 'lotes' && (
          <LotesView lotes={lotes} onAdd={() => openModal('lote')} onEdit={(item) => openModal('lote', item)} onDelete={(id) => handleDelete(id, 'lote')} />
        )}
        {currentView === 'producao' && (
          <ProducaoView producao={producao} lotes={lotes} onAdd={() => openModal('producao')} onEdit={(item) => openModal('producao', item)} onDelete={(id) => handleDelete(id, 'producao')} />
        )}
        {currentView === 'financeiro' && (
          <FinanceiroView financeiro={financeiro} onAdd={() => openModal('financeiro')} onEdit={(item) => openModal('financeiro', item)} onDelete={(id) => handleDelete(id, 'financeiro')} />
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <Modal onClose={closeModal}>
          {modalType === 'lote' && <LoteForm onSubmit={handleAddLote} initialData={editingItem} onCancel={closeModal} />}
          {modalType === 'producao' && <ProducaoForm onSubmit={handleAddProducao} initialData={editingItem} lotes={lotes} onCancel={closeModal} />}
          {modalType === 'financeiro' && <FinanceiroForm onSubmit={handleAddFinanceiro} initialData={editingItem} onCancel={closeModal} />}
        </Modal>
      )}
    </div>
  )
}

// Components
function NavItem({ icon, label, active, onClick }) {
  return (
    <button onClick={onClick} className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
      active ? 'bg-amber-500 text-white' : 'text-slate-300 hover:bg-slate-700'
    }`}>
      {icon}
      <span className="font-medium">{label}</span>
    </button>
  )
}

function Dashboard({ totalAves, producaoHoje, receitasMes, despesasMes }) {
  const saldoMes = receitasMes - despesasMes
  return (
    <div>
      <h2 className="text-3xl font-bold mb-6">Dashboard</h2>
      <div className="grid grid-cols-4 gap-6">
        <StatCard icon={<Users size={32}/>} label="Total de Aves" value={totalAves} color="blue" />
        <StatCard icon={<Egg size={32}/>} label="Produção Hoje" value={producaoHoje} color="amber" />
        <StatCard icon={<TrendingUp size={32}/>} label="Receitas (Mês)" value={`R$ ${receitasMes.toFixed(2)}`} color="green" />
        <StatCard icon={<DollarSign size={32}/>} label="Saldo (Mês)" value={`R$ ${saldoMes.toFixed(2)}`} color={saldoMes >= 0 ? 'green' : 'red'} />
      </div>
    </div>
  )
}

function StatCard({ icon, label, value, color }) {
  const colors = {
    blue: 'bg-blue-500/20 text-blue-400',
    amber: 'bg-amber-500/20 text-amber-400',
    green: 'bg-green-500/20 text-green-400',
    red: 'bg-red-500/20 text-red-400'
  }
  return (
    <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
      <div className={`inline-flex p-3 rounded-lg ${colors[color]} mb-3`}>
        {icon}
      </div>
      <p className="text-slate-400 text-sm mb-1">{label}</p>
      <p className="text-2xl font-bold">{value}</p>
    </div>
  )
}

function LotesView({ lotes, onAdd, onEdit, onDelete }) {
  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-bold">Lotes de Aves</h2>
        <button onClick={onAdd} className="bg-amber-500 hover:bg-amber-600 px-4 py-2 rounded-lg flex items-center gap-2 transition-colors">
          <Plus size={20} /> Novo Lote
        </button>
      </div>
      <div className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden">
        <table className="w-full">
          <thead className="bg-slate-700">
            <tr>
              <th className="text-left p-4">Lote</th>
              <th className="text-left p-4">Raça</th>
              <th className="text-left p-4">Quantidade</th>
              <th className="text-left p-4">Data Alojamento</th>
              <th className="text-right p-4">Ações</th>
            </tr>
          </thead>
          <tbody>
            {lotes.length === 0 ? (
              <tr><td colSpan="5" className="text-center p-8 text-slate-400">Nenhum lote cadastrado</td></tr>
            ) : (
              lotes.map(lote => (
                <tr key={lote.id} className="border-t border-slate-700 hover:bg-slate-750">
                  <td className="p-4">{lote.nome}</td>
                  <td className="p-4">{lote.raca}</td>
                  <td className="p-4">{lote.quantidade}</td>
                  <td className="p-4">{new Date(lote.dataAlojamento).toLocaleDateString('pt-BR')}</td>
                  <td className="p-4 text-right">
                    <button onClick={() => onEdit(lote)} className="text-blue-400 hover:text-blue-300 mr-3"><Edit2 size={18}/></button>
                    <button onClick={() => onDelete(lote.id)} className="text-red-400 hover:text-red-300"><Trash2 size={18}/></button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}

function ProducaoView({ producao, lotes, onAdd, onEdit, onDelete }) {
  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-bold">Produção de Ovos</h2>
        <button onClick={onAdd} className="bg-amber-500 hover:bg-amber-600 px-4 py-2 rounded-lg flex items-center gap-2 transition-colors">
          <Plus size={20} /> Registrar Produção
        </button>
      </div>
      <div className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden">
        <table className="w-full">
          <thead className="bg-slate-700">
            <tr>
              <th className="text-left p-4">Data</th>
              <th className="text-left p-4">Lote</th>
              <th className="text-left p-4">Ovos Produzidos</th>
              <th className="text-left p-4">Trincados</th>
              <th className="text-right p-4">Ações</th>
            </tr>
          </thead>
          <tbody>
            {producao.length === 0 ? (
              <tr><td colSpan="5" className="text-center p-8 text-slate-400">Nenhuma produção registrada</td></tr>
            ) : (
              producao.map(p => {
                const lote = lotes.find(l => l.id === parseInt(p.loteId))
                return (
                  <tr key={p.id} className="border-t border-slate-700 hover:bg-slate-750">
                    <td className="p-4">{new Date(p.data).toLocaleDateString('pt-BR')}</td>
                    <td className="p-4">{lote?.nome || 'Lote não encontrado'}</td>
                    <td className="p-4">{p.ovos}</td>
                    <td className="p-4">{p.trincados || 0}</td>
                    <td className="p-4 text-right">
                      <button onClick={() => onEdit(p)} className="text-blue-400 hover:text-blue-300 mr-3"><Edit2 size={18}/></button>
                      <button onClick={() => onDelete(p.id)} className="text-red-400 hover:text-red-300"><Trash2 size={18}/></button>
                    </td>
                  </tr>
                )
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}

function FinanceiroView({ financeiro, onAdd, onEdit, onDelete }) {
  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-bold">Financeiro</h2>
        <button onClick={onAdd} className="bg-amber-500 hover:bg-amber-600 px-4 py-2 rounded-lg flex items-center gap-2 transition-colors">
          <Plus size={20} /> Nova Transação
        </button>
      </div>
      <div className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden">
        <table className="w-full">
          <thead className="bg-slate-700">
            <tr>
              <th className="text-left p-4">Data</th>
              <th className="text-left p-4">Descrição</th>
              <th className="text-left p-4">Tipo</th>
              <th className="text-right p-4">Valor</th>
              <th className="text-right p-4">Ações</th>
            </tr>
          </thead>
          <tbody>
            {financeiro.length === 0 ? (
              <tr><td colSpan="5" className="text-center p-8 text-slate-400">Nenhuma transação registrada</td></tr>
            ) : (
              financeiro.map(f => (
                <tr key={f.id} className="border-t border-slate-700 hover:bg-slate-750">
                  <td className="p-4">{new Date(f.data).toLocaleDateString('pt-BR')}</td>
                  <td className="p-4">{f.descricao}</td>
                  <td className="p-4">
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      f.tipo === 'receita' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
                    }`}>
                      {f.tipo === 'receita' ? 'Receita' : 'Despesa'}
                    </span>
                  </td>
                  <td className={`p-4 text-right font-bold ${
                    f.tipo === 'receita' ? 'text-green-400' : 'text-red-400'
                  }`}>
                    {f.tipo === 'receita' ? '+' : '-'} R$ {parseFloat(f.valor).toFixed(2)}
                  </td>
                  <td className="p-4 text-right">
                    <button onClick={() => onEdit(f)} className="text-blue-400 hover:text-blue-300 mr-3"><Edit2 size={18}/></button>
                    <button onClick={() => onDelete(f.id)} className="text-red-400 hover:text-red-300"><Trash2 size={18}/></button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}

function Modal({ children, onClose }) {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-slate-800 rounded-xl p-6 max-w-md w-full max-h-[90vh] overflow-y-auto border border-slate-700">
        {children}
      </div>
    </div>
  )
}

function LoteForm({ onSubmit, initialData, onCancel }) {
  const [formData, setFormData] = useState(initialData || { nome: '', raca: '', quantidade: '', dataAlojamento: new Date().toISOString().split('T')[0] })
  
  const handleSubmit = (e) => {
    e.preventDefault()
    onSubmit(formData)
  }

  return (
    <form onSubmit={handleSubmit}>
      <h3 className="text-xl font-bold mb-4">{initialData ? 'Editar Lote' : 'Novo Lote'}</h3>
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Nome do Lote</label>
          <input type="text" required value={formData.nome} onChange={(e) => setFormData({...formData, nome: e.target.value})} className="w-full bg-slate-700 border border-slate-600 rounded px-3 py-2" />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Raça</label>
          <input type="text" required value={formData.raca} onChange={(e) => setFormData({...formData, raca: e.target.value})} className="w-full bg-slate-700 border border-slate-600 rounded px-3 py-2" />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Quantidade de Aves</label>
          <input type="number" required value={formData.quantidade} onChange={(e) => setFormData({...formData, quantidade: e.target.value})} className="w-full bg-slate-700 border border-slate-600 rounded px-3 py-2" />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Data de Alojamento</label>
          <input type="date" required value={formData.dataAlojamento} onChange={(e) => setFormData({...formData, dataAlojamento: e.target.value})} className="w-full bg-slate-700 border border-slate-600 rounded px-3 py-2" />
        </div>
      </div>
      <div className="flex gap-3 mt-6">
        <button type="button" onClick={onCancel} className="flex-1 bg-slate-700 hover:bg-slate-600 px-4 py-2 rounded transition-colors">Cancelar</button>
        <button type="submit" className="flex-1 bg-amber-500 hover:bg-amber-600 px-4 py-2 rounded transition-colors">Salvar</button>
      </div>
    </form>
  )
}

function ProducaoForm({ onSubmit, initialData, lotes, onCancel }) {
  const [formData, setFormData] = useState(initialData || { data: new Date().toISOString().split('T')[0], loteId: '', ovos: '', trincados: '0' })
  
  const handleSubmit = (e) => {
    e.preventDefault()
    onSubmit(formData)
  }

  return (
    <form onSubmit={handleSubmit}>
      <h3 className="text-xl font-bold mb-4">{initialData ? 'Editar Produção' : 'Registrar Produção'}</h3>
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Data</label>
          <input type="date" required value={formData.data} onChange={(e) => setFormData({...formData, data: e.target.value})} className="w-full bg-slate-700 border border-slate-600 rounded px-3 py-2" />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Lote</label>
          <select required value={formData.loteId} onChange={(e) => setFormData({...formData, loteId: e.target.value})} className="w-full bg-slate-700 border border-slate-600 rounded px-3 py-2">
            <option value="">Selecione um lote</option>
            {lotes.map(l => <option key={l.id} value={l.id}>{l.nome}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Ovos Produzidos</label>
          <input type="number" required value={formData.ovos} onChange={(e) => setFormData({...formData, ovos: e.target.value})} className="w-full bg-slate-700 border border-slate-600 rounded px-3 py-2" />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Ovos Trincados</label>
          <input type="number" value={formData.trincados} onChange={(e) => setFormData({...formData, trincados: e.target.value})} className="w-full bg-slate-700 border border-slate-600 rounded px-3 py-2" />
        </div>
      </div>
      <div className="flex gap-3 mt-6">
        <button type="button" onClick={onCancel} className="flex-1 bg-slate-700 hover:bg-slate-600 px-4 py-2 rounded transition-colors">Cancelar</button>
        <button type="submit" className="flex-1 bg-amber-500 hover:bg-amber-600 px-4 py-2 rounded transition-colors">Salvar</button>
      </div>
    </form>
  )
}

function FinanceiroForm({ onSubmit, initialData, onCancel }) {
  const [formData, setFormData] = useState(initialData || { data: new Date().toISOString().split('T')[0], descricao: '', tipo: 'receita', valor: '' })
  
  const handleSubmit = (e) => {
    e.preventDefault()
    onSubmit(formData)
  }

  return (
    <form onSubmit={handleSubmit}>
      <h3 className="text-xl font-bold mb-4">{initialData ? 'Editar Transação' : 'Nova Transação'}</h3>
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Data</label>
          <input type="date" required value={formData.data} onChange={(e) => setFormData({...formData, data: e.target.value})} className="w-full bg-slate-700 border border-slate-600 rounded px-3 py-2" />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Descrição</label>
          <input type="text" required value={formData.descricao} onChange={(e) => setFormData({...formData, descricao: e.target.value})} className="w-full bg-slate-700 border border-slate-600 rounded px-3 py-2" />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Tipo</label>
          <select required value={formData.tipo} onChange={(e) => setFormData({...formData, tipo: e.target.value})} className="w-full bg-slate-700 border border-slate-600 rounded px-3 py-2">
            <option value="receita">Receita</option>
            <option value="despesa">Despesa</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Valor (R$)</label>
          <input type="number" step="0.01" required value={formData.valor} onChange={(e) => setFormData({...formData, valor: e.target.value})} className="w-full bg-slate-700 border border-slate-600 rounded px-3 py-2" />
        </div>
      </div>
      <div className="flex gap-3 mt-6">
        <button type="button" onClick={onCancel} className="flex-1 bg-slate-700 hover:bg-slate-600 px-4 py-2 rounded transition-colors">Cancelar</button>
        <button type="submit" className="flex-1 bg-amber-500 hover:bg-amber-600 px-4 py-2 rounded transition-colors">Salvar</button>
      </div>
    </form>
  )
}

export default App
