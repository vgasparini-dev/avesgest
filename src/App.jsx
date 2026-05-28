import React, { useState, useEffect } from 'react'
import { Home, Users, Egg, TrendingUp, DollarSign, Settings, Plus, X, Edit2, Trash2, AlertTriangle, BarChart3, Warehouse } from 'lucide-react'

function App() {
  // ========== ESTADOS PRINCIPAIS ==========
  const [currentView, setCurrentView] = useState('dashboard')
  const [lotes, setLotes] = useState([])
  const [galpoes, setGalpoes] = useState([])
  const [producao, setProducao] = useState([])
  const [financeiro, setFinanceiro] = useState([])
  const [showModal, setShowModal] = useState(false)
  const [modalType, setModalType] = useState('')
  const [editingItem, setEditingItem] = useState(null)
  const [formData, setFormData] = useState({})

  // ========== CARREGAMENTO DO LOCALSTORAGE ==========
  useEffect(() => {
    const savedLotes = localStorage.getItem('avesgest_lotes')
    const savedGalpoes = localStorage.getItem('avesgest_galpoes')
    const savedProducao = localStorage.getItem('avesgest_producao')
    const savedFinanceiro = localStorage.getItem('avesgest_financeiro')
    
    if (savedLotes) setLotes(JSON.parse(savedLotes))
    if (savedGalpoes) setGalpoes(JSON.parse(savedGalpoes))
    if (savedProducao) setProducao(JSON.parse(savedProducao))
    if (savedFinanceiro) setFinanceiro(JSON.parse(savedFinanceiro))
  }, [])

  // ========== SALVAMENTO NO LOCALSTORAGE ==========
  useEffect(() => { localStorage.setItem('avesgest_lotes', JSON.stringify(lotes)) }, [lotes])
  useEffect(() => { localStorage.setItem('avesgest_galpoes', JSON.stringify(galpoes)) }, [galpoes])
  useEffect(() => { localStorage.setItem('avesgest_producao', JSON.stringify(producao)) }, [producao])
  useEffect(() => { localStorage.setItem('avesgest_financeiro', JSON.stringify(financeiro)) }, [financeiro])

  // ========== FUNÇÕES DE MODAL ==========
  const openModal = (type, item = null) => {
    setModalType(type)
    setEditingItem(item)
    
    if (item) {
      setFormData(item)
    } else {
      if (type === 'lote') {
        setFormData({ lote: '', raca: '', quantidade: '', data: '', galpaoId: '' })
      } else if (type === 'galpao') {
        setFormData({ nome: '', tipo: 'Cage Free', capacidade: '' })
      } else if (type === 'producao') {
        setFormData({ data: '', loteId: '', ovos: '', trincados: '', mortalidade: '', custoRacao: '' })
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

  // ========== FUNÇÕES DE CRUD ==========
  const handleSubmit = (e) => {
    e.preventDefault()
    
    if (modalType === 'lote') {
      if (editingItem) {
        setLotes(lotes.map(l => l.id === editingItem.id ? { ...formData, id: editingItem.id } : l))
      } else {
        setLotes([...lotes, { ...formData, id: Date.now() }])
      }
    } else if (modalType === 'galpao') {
      if (editingItem) {
        setGalpoes(galpoes.map(g => g.id === editingItem.id ? { ...formData, id: editingItem.id } : g))
      } else {
        setGalpoes([...galpoes, { ...formData, id: Date.now() }])
      }
    } else if (modalType === 'producao') {
      if (editingItem) {
        setProducao(producao.map(p => p.id === editingItem.id ? { ...formData, id: editingItem.id } : p))
      } else {
        setProducao([...producao, { ...formData, id: Date.now() }])
      }
    } else if (modalType === 'financeiro') {
      if (editingItem) {
        setFinanceiro(financeiro.map(f => f.id === editingItem.id ? { ...formData, id: editingItem.id } : f))
      } else {
        setFinanceiro([...financeiro, { ...formData, id: Date.now() }])
      }
    }
    
    closeModal()
  }

  const handleDelete = (type, id) => {
    if (!confirm('Tem certeza que deseja excluir?')) return
    
    if (type === 'lote') setLotes(lotes.filter(l => l.id !== id))
    else if (type === 'galpao') setGalpoes(galpoes.filter(g => g.id !== id))
    else if (type === 'producao') setProducao(producao.filter(p => p.id !== id))
    else if (type === 'financeiro') setFinanceiro(financeiro.filter(f => f.id !== id))
  }

  // ========== CÁLCULOS E ESTATÍSTICAS ==========
  const calcularEstatisticas = () => {
    const hoje = new Date().toISOString().split('T')[0]
    const producaoHoje = producao.filter(p => p.data === hoje)
    const totalOvosHoje = producaoHoje.reduce((acc, p) => acc + Number(p.ovos || 0), 0)
    const totalAves = lotes.reduce((acc, l) => acc + Number(l.quantidade || 0), 0)
    
    const mesAtual = new Date().getMonth()
    const anoAtual = new Date().getFullYear()
    const financeiroMes = financeiro.filter(f => {
      const dataF = new Date(f.data)
      return dataF.getMonth() === mesAtual && dataF.getFullYear() === anoAtual
    })
    
    const receitasMes = financeiroMes.filter(f => f.tipo === 'receita').reduce((acc, f) => acc + Number(f.valor || 0), 0)
    const despesasMes = financeiroMes.filter(f => f.tipo === 'despesa').reduce((acc, f) => acc + Number(f.valor || 0), 0)
    const saldoMes = receitasMes - despesasMes
    
    return { totalAves, totalOvosHoje, receitasMes, saldoMes }
  }

  const gerarAlertas = () => {
    const alertas = []
    const hoje = new Date().toISOString().split('T')[0]
    
    // Verificar produção abaixo de 85%
    lotes.forEach(lote => {
      const producaoLote = producao.filter(p => p.loteId === lote.id && p.data === hoje)
      if (producaoLote.length > 0) {
        const totalOvos = producaoLote.reduce((acc, p) => acc + Number(p.ovos || 0), 0)
        const taxaProducao = (totalOvos / Number(lote.quantidade)) * 100
        
        if (taxaProducao < 85) {
          alertas.push({
            tipo: 'warning',
            mensagem: `Lote ${lote.lote}: Produção abaixo de 85% (${taxaProducao.toFixed(1)}%)`
          })
        }
      }
    })
    
    // Verificar mortalidade acima de 0.15%
    galpoes.forEach(galpao => {
      const producaoGalpao = producao.filter(p => {
        const lote = lotes.find(l => l.id === p.loteId)
        return lote && lote.galpaoId === galpao.id && p.data === hoje
      })
      
      producaoGalpao.forEach(p => {
        const taxaMortalidade = Number(p.mortalidade || 0)
        if (taxaMortalidade > 0.15) {
          alertas.push({
            tipo: 'danger',
            mensagem: `Galpão ${galpao.nome}: Mortalidade crítica (${taxaMortalidade}%)`
          })
        }
      })
    })
    
    return alertas
  }

  const calcularCustoPorDuzia = () => {
    const producaoComCusto = producao.filter(p => p.custoRacao && p.ovos)
    if (producaoComCusto.length === 0) return null
    
    const custoTotal = producaoComCusto.reduce((acc, p) => acc + Number(p.custoRacao || 0), 0)
    const ovosTotal = producaoComCusto.reduce((acc, p) => acc + Number(p.ovos || 0), 0)
    const duzias = ovosTotal / 12
    
    return duzias > 0 ? (custoTotal / duzias).toFixed(2) : 0
  }

  const prepararDadosGrafico = () => {
    const ultimos30Dias = producao.slice(-30).map(p => ({
      data: p.data,
      ovos: Number(p.ovos || 0),
      mortalidade: Number(p.mortalidade || 0)
    }))
    return ultimos30Dias
  }

  const stats = calcularEstatisticas()
  const alertas = gerarAlertas()
  const custoPorDuzia = calcularCustoPorDuzia()
  const dadosGrafico = prepararDadosGrafico()

  // ========== RENDERIZAÇÃO DOS COMPONENTES ==========
  
  // Dashboard com Gráficos e Alertas
  const renderDashboard = () => (
    <div>
      <h2 className="text-3xl font-bold mb-6 text-white flex items-center">
        <Home className="mr-3" /> Dashboard
      </h2>
      
      {/* Alertas */}
      {alertas.length > 0 && (
        <div className="mb-6">
          <h3 className="text-xl font-bold text-white mb-3 flex items-center">
            <AlertTriangle className="mr-2" /> Alertas do Sistema
          </h3>
          {alertas.map((alerta, idx) => (
            <div 
              key={idx} 
              className={`p-4 mb-3 rounded-lg border-l-4 ${
                alerta.tipo === 'warning' 
                  ? 'bg-yellow-900/30 border-yellow-500 text-yellow-200' 
                  : 'bg-red-900/30 border-red-500 text-red-200'
              }`}
            >
              <AlertTriangle className="inline mr-2" size={20} />
              {alerta.mensagem}
            </div>
          ))}
        </div>
      )}
      
      {/* Cards de Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="stats-card">
          <Users className="text-blue-400 mb-2" size={32} />
          <p className="text-slate-400 text-sm">Total de Aves</p>
          <p className="text-3xl font-bold text-white">{stats.totalAves}</p>
        </div>
        
        <div className="stats-card">
          <Egg className="text-yellow-400 mb-2" size={32} />
          <p className="text-slate-400 text-sm">Produção Hoje</p>
          <p className="text-3xl font-bold text-white">{stats.totalOvosHoje}</p>
        </div>
        
        <div className="stats-card">
          <DollarSign className="text-green-400 mb-2" size={32} />
          <p className="text-slate-400 text-sm">Receitas (Mês)</p>
          <p className="text-3xl font-bold text-white">R$ {stats.receitasMes.toFixed(2)}</p>
        </div>
        
        <div className="stats-card">
          <TrendingUp className="text-purple-400 mb-2" size={32} />
          <p className="text-slate-400 text-sm">Saldo (Mês)</p>
          <p className={`text-3xl font-bold ${stats.saldoMes >= 0 ? 'text-green-400' : 'text-red-400'}`}>
            R$ {stats.saldoMes.toFixed(2)}
          </p>
        </div>
      </div>
      
      {/* Gráfico de Produção e Mortalidade */}
      <div className="bg-slate-800/50 p-6 rounded-xl border border-slate-700/50 mb-6">
        <h3 className="text-xl font-bold text-white mb-4 flex items-center">
          <BarChart3 className="mr-2" /> Produção de Ovos e Mortalidade (30 dias)
        </h3>
        <div className="h-64 flex items-end justify-between gap-2">
          {dadosGrafico.map((dia, idx) => (
            <div key={idx} className="flex-1 flex flex-col items-center">
              <div className="w-full bg-yellow-500/30 hover:bg-yellow-500/50 transition-all" 
                   style={{ height: `${(dia.ovos / Math.max(...dadosGrafico.map(d => d.ovos))) * 200}px` }}
                   title={`Ovos: ${dia.ovos}`}>
              </div>
              <div className="w-full bg-red-500/30 hover:bg-red-500/50 transition-all mt-1" 
                   style={{ height: `${dia.mortalidade * 10}px` }}
                   title={`Mortalidade: ${dia.mortalidade}%`}>
              </div>
            </div>
          ))}
        </div>
        <div className="flex justify-center gap-6 mt-4">
          <div className="flex items-center">
            <div className="w-4 h-4 bg-yellow-500 mr-2"></div>
            <span className="text-slate-400 text-sm">Produção de Ovos</span>
          </div>
          <div className="flex items-center">
            <div className="w-4 h-4 bg-red-500 mr-2"></div>
            <span className="text-slate-400 text-sm">Mortalidade</span>
          </div>
        </div>
      </div>
    </div>
  )
  
  // Galpões
  const renderGalpoes = () => (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-bold text-white flex items-center">
          <Warehouse className="mr-3" /> Galpões
        </h2>
        <button onClick={() => openModal('galpao')} className="btn-primary">
          <Plus size={20} className="mr-2" /> Novo Galpão
        </button>
      </div>
      
      {galpoes.length === 0 ? (
        <p className="text-slate-400 text-center py-8">Nenhum galpão cadastrado</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-700/50">
                <th className="text-left text-slate-300 py-3">Nome</th>
                <th className="text-left text-slate-300 py-3">Tipo</th>
                <th className="text-left text-slate-300 py-3">Capacidade</th>
                <th className="text-left text-slate-300 py-3">Ações</th>
              </tr>
            </thead>
            <tbody>
              {galpoes.map(galpao => (
                <tr key={galpao.id} className="border-b border-slate-700/50 hover:bg-slate-800/50">
                  <td className="py-3 text-white">{galpao.nome}</td>
                  <td className="py-3 text-white">
                    <span className={`px-3 py-1 rounded-full text-sm ${
                      galpao.tipo === 'Cage Free' ? 'bg-green-900/30 text-green-300' : 'bg-blue-900/30 text-blue-300'
                    }`}>
                      {galpao.tipo}
                    </span>
                  </td>
                  <td className="py-3 text-white">{galpao.capacidade} aves</td>
                  <td className="py-3">
                    <div className="flex gap-2">
                      <button onClick={() => openModal('galpao', galpao)} className="text-blue-400 hover:text-blue-300">
                        <Edit2 size={18} />
                      </button>
                      <button onClick={() => handleDelete('galpao', galpao.id)} className="text-red-400 hover:text-red-300">
                        <Trash2 size={18} />
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
  )
  
  // Lotes de Aves
  const renderLotes = () => (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-bold text-white flex items-center">
          <Users className="mr-3" /> Lotes de Aves
        </h2>
        <button onClick={() => openModal('lote')} className="btn-primary">
          <Plus size={20} className="mr-2" /> Novo Lote
        </button>
      </div>
      
      {lotes.length === 0 ? (
        <p className="text-slate-400 text-center py-8">Nenhum lote cadastrado</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-700/50">
                <th className="text-left text-slate-300 py-3">Lote</th>
                <th className="text-left text-slate-300 py-3">Raça</th>
                <th className="text-left text-slate-300 py-3">Quantidade</th>
                <th className="text-left text-slate-300 py-3">Data</th>
                <th className="text-left text-slate-300 py-3">Galpão</th>
                <th className="text-left text-slate-300 py-3">Ações</th>
              </tr>
            </thead>
            <tbody>
              {lotes.map(lote => {
                const galpao = galpoes.find(g => g.id === lote.galpaoId)
                return (
                  <tr key={lote.id} className="border-b border-slate-700/50 hover:bg-slate-800/50">
                    <td className="py-3 text-white">{lote.lote}</td>
                    <td className="py-3 text-white">{lote.raca}</td>
                    <td className="py-3 text-white">{lote.quantidade}</td>
                    <td className="py-3 text-white">
                      {lote.data && !isNaN(new Date(lote.data)) ? new Date(lote.data).toLocaleDateString('pt-BR') : lote.data || 'Sem data'}
                    </td>
                    <td className="py-3 text-white">{galpao?.nome || 'N/A'}</td>
                    <td className="py-3">
                      <div className="flex gap-2">
                        <button onClick={() => openModal('lote', lote)} className="text-blue-400 hover:text-blue-300">
                          <Edit2 size={18} />
                        </button>
                        <button onClick={() => handleDelete('lote', lote.id)} className="text-red-400 hover:text-red-300">
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
  
  // Produção de Ovos
  const renderProducao = () => (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-bold text-white flex items-center">
          <Egg className="mr-3" /> Produção de Ovos
        </h2>
        <button onClick={() => openModal('producao')} className="btn-primary">
          <Plus size={20} className="mr-2" /> Nova Produção
        </button>
      </div>
      
      {producao.length === 0 ? (
        <p className="text-slate-400 text-center py-8">Nenhuma produção registrada</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-700/50">
                <th className="text-left text-slate-300 py-3">Data</th>
                <th className="text-left text-slate-300 py-3">Lote</th>
                <th className="text-left text-slate-300 py-3">Ovos Produzidos</th>
                <th className="text-left text-slate-300 py-3">Trincados</th>
                <th className="text-left text-slate-300 py-3">Mortalidade (%)</th>
                <th className="text-left text-slate-300 py-3">Custo Ração</th>
                <th className="text-left text-slate-300 py-3">Ações</th>
              </tr>
            </thead>
            <tbody>
              {producao.map(p => {
                const lote = lotes.find(l => l.id === p.loteId)
                return (
                  <tr key={p.id} className="border-b border-slate-700/50 hover:bg-slate-800/50">
                    <td className="py-3 text-white">
                      {p.data && !isNaN(new Date(p.data)) ? new Date(p.data).toLocaleDateString('pt-BR') : p.data || 'Sem data'}
                    </td>
                    <td className="py-3 text-white">{lote?.lote || 'N/A'}</td>
                    <td className="py-3 text-white">{p.ovos}</td>
                    <td className="py-3 text-white">{p.trincados || 0}</td>
                    <td className="py-3 text-white">{p.mortalidade || 0}%</td>
                    <td className="py-3 text-white">{p.custoRacao ? `R$ ${Number(p.custoRacao).toFixed(2)}` : '-'}</td>
                    <td className="py-3">
                      <div className="flex gap-2">
                        <button onClick={() => openModal('producao', p)} className="text-blue-400 hover:text-blue-300">
                          <Edit2 size={18} />
                        </button>
                        <button onClick={() => handleDelete('producao', p.id)} className="text-red-400 hover:text-red-300">
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
  
  // Financeiro
  const renderFinanceiro = () => (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-bold text-white flex items-center">
          <DollarSign className="mr-3" /> Financeiro
        </h2>
        <button onClick={() => openModal('financeiro')} className="btn-primary">
          <Plus size={20} className="mr-2" /> Nova Transação
        </button>
      </div>
      
      {financeiro.length === 0 ? (
        <p className="text-slate-400 text-center py-8">Nenhuma transação registrada</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-700/50">
                <th className="text-left text-slate-300 py-3">Data</th>
                <th className="text-left text-slate-300 py-3">Descrição</th>
                <th className="text-left text-slate-300 py-3">Tipo</th>
                <th className="text-left text-slate-300 py-3">Valor</th>
                <th className="text-left text-slate-300 py-3">Ações</th>
              </tr>
            </thead>
            <tbody>
              {financeiro.map(f => (
                <tr key={f.id} className="border-b border-slate-700/50 hover:bg-slate-800/50">
                  <td className="py-3 text-white">
                    {f.data && !isNaN(new Date(f.data)) ? new Date(f.data).toLocaleDateString('pt-BR') : f.data || 'Sem data'}
                  </td>
                  <td className="py-3 text-white">{f.descricao}</td>
                  <td className="py-3">
                    <span className={`px-3 py-1 rounded-full text-sm ${
                      f.tipo === 'receita' ? 'bg-green-900/30 text-green-300' : 'bg-red-900/30 text-red-300'
                    }`}>
                      {f.tipo === 'receita' ? 'Receita' : 'Despesa'}
                    </span>
                  </td>
                  <td className={`py-3 font-bold ${f.tipo === 'receita' ? 'text-green-400' : 'text-red-400'}`}>
                    R$ {Number(f.valor).toFixed(2)}
                  </td>
                  <td className="py-3">
                    <div className="flex gap-2">
                      <button onClick={() => openModal('financeiro', f)} className="text-blue-400 hover:text-blue-300">
                        <Edit2 size={18} />
                      </button>
                      <button onClick={() => handleDelete('financeiro', f.id)} className="text-red-400 hover:text-red-300">
                        <Trash2 size={18} />
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
  )
  
  // Relatórios com Módulo Financeiro
  const renderRelatorios = () => (
    <div>
      <h2 className="text-3xl font-bold mb-6 text-white flex items-center">
        <TrendingUp className="mr-3" /> Relatórios
      </h2>
      
      {/* Painel Financeiro de Custo por Dúzia */}
      {custoPorDuzia && (
        <div className="bg-gradient-to-r from-green-900/30 to-blue-900/30 p-6 rounded-xl border border-green-700/50 mb-6">
          <h3 className="text-2xl font-bold text-white mb-4 flex items-center">
            <DollarSign className="mr-2" /> Análise Financeira - Custo Alimentar
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-slate-800/50 p-4 rounded-lg">
              <p className="text-slate-400 text-sm mb-2">Custo Alimentar por Dúzia</p>
              <p className="text-3xl font-bold text-green-400">R$ {custoPorDuzia}</p>
            </div>
            <div className="bg-slate-800/50 p-4 rounded-lg">
              <p className="text-slate-400 text-sm mb-2">Total de Dúzias Produzidas</p>
              <p className="text-3xl font-bold text-white">
                {(producao.reduce((acc, p) => acc + Number(p.ovos || 0), 0) / 12).toFixed(0)}
              </p>
            </div>
            <div className="bg-slate-800/50 p-4 rounded-lg">
              <p className="text-slate-400 text-sm mb-2">Custo Total de Ração</p>
              <p className="text-3xl font-bold text-white">
                R$ {producao.reduce((acc, p) => acc + Number(p.custoRacao || 0), 0).toFixed(2)}
              </p>
            </div>
          </div>
          <div className="mt-4 p-4 bg-blue-900/20 rounded-lg">
            <p className="text-blue-300 text-sm">
              💡 <strong>Dica:</strong> Este cálculo considera apenas registros de produção que contêm o custo de ração informado.
              Para melhorar a precisão, registre o custo de ração em todas as coletas diárias.
            </p>
          </div>
        </div>
      )}
      
      {/* Resumo Geral */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-slate-800/50 p-6 rounded-xl border border-slate-700/50">
          <h3 className="text-xl font-bold text-white mb-4">Produção Total</h3>
          <p className="text-4xl font-bold text-yellow-400">
            {producao.reduce((acc, p) => acc + Number(p.ovos || 0), 0)} ovos
          </p>
          <p className="text-slate-400 mt-2">Ovos trincados: {producao.reduce((acc, p) => acc + Number(p.trincados || 0), 0)}</p>
        </div>
        
        <div className="bg-slate-800/50 p-6 rounded-xl border border-slate-700/50">
          <h3 className="text-xl font-bold text-white mb-4">Saldo Financeiro</h3>
          <p className={`text-4xl font-bold ${stats.saldoMes >= 0 ? 'text-green-400' : 'text-red-400'}`}>
            R$ {stats.saldoMes.toFixed(2)}
          </p>
          <p className="text-slate-400 mt-2">Receitas: R$ {stats.receitasMes.toFixed(2)}</p>
        </div>
      </div>
    </div>
  )
  
  // ========== MODAL COMPONENT ==========
  const renderModal = () => {
    if (!showModal) return null
    
    return (
      <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
        <div className="bg-slate-900 p-6 rounded-xl border border-slate-700/50 max-w-md w-full max-h-[90vh] overflow-y-auto">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-2xl font-bold text-white">
              {editingItem ? 'Editar' : 'Novo'} {modalType === 'lote' ? 'Lote' : modalType === 'galpao' ? 'Galpão' : modalType === 'producao' ? 'Produção' : 'Transação'}
            </h3>
            <button onClick={closeModal} className="text-slate-400 hover:text-white">
              <X size={24} />
            </button>
          </div>
          
          <form onSubmit={handleSubmit}>
            {modalType === 'galpao' && (
              <>
                <div className="mb-4">
                  <label className="block text-slate-300 mb-2">Nome do Galpão</label>
                  <input
                    type="text"
                    className="w-full bg-slate-800 text-white border border-slate-700 rounded-lg px-4 py-2"
                    value={formData.nome || ''}
                    onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                    required
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-slate-300 mb-2">Tipo</label>
                  <select
                    className="w-full bg-slate-800 text-white border border-slate-700 rounded-lg px-4 py-2"
                    value={formData.tipo || 'Cage Free'}
                    onChange={(e) => setFormData({ ...formData, tipo: e.target.value })}
                  >
                    <option value="Cage Free">Cage Free</option>
                    <option value="Gaiola">Gaiola</option>
                  </select>
                </div>
                <div className="mb-4">
                  <label className="block text-slate-300 mb-2">Capacidade (aves)</label>
                  <input
                    type="number"
                    className="w-full bg-slate-800 text-white border border-slate-700 rounded-lg px-4 py-2"
                    value={formData.capacidade || ''}
                    onChange={(e) => setFormData({ ...formData, capacidade: e.target.value })}
                    required
                  />
                </div>
              </>
            )}
            
            {modalType === 'lote' && (
              <>
                <div className="mb-4">
                  <label className="block text-slate-300 mb-2">Lote</label>
                  <input
                    type="text"
                    className="w-full bg-slate-800 text-white border border-slate-700 rounded-lg px-4 py-2"
                    value={formData.lote || ''}
                    onChange={(e) => setFormData({ ...formData, lote: e.target.value })}
                    required
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-slate-300 mb-2">Raça</label>
                  <input
                    type="text"
                    className="w-full bg-slate-800 text-white border border-slate-700 rounded-lg px-4 py-2"
                    value={formData.raca || ''}
                    onChange={(e) => setFormData({ ...formData, raca: e.target.value })}
                    required
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-slate-300 mb-2">Quantidade</label>
                  <input
                    type="number"
                    className="w-full bg-slate-800 text-white border border-slate-700 rounded-lg px-4 py-2"
                    value={formData.quantidade || ''}
                    onChange={(e) => setFormData({ ...formData, quantidade: e.target.value })}
                    required
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-slate-300 mb-2">Data de Alojamento</label>
                  <input
                    type="date"
                    className="w-full bg-slate-800 text-white border border-slate-700 rounded-lg px-4 py-2"
                    value={formData.data || ''}
                    onChange={(e) => setFormData({ ...formData, data: e.target.value })}
                    required
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-slate-300 mb-2">Galpão</label>
                  <select
                    className="w-full bg-slate-800 text-white border border-slate-700 rounded-lg px-4 py-2"
                    value={formData.galpaoId || ''}
                    onChange={(e) => setFormData({ ...formData, galpaoId: e.target.value })}
                    required
                  >
                    <option value="">Selecione um galpão</option>
                    {galpoes.map(g => (
                      <option key={g.id} value={g.id}>{g.nome}</option>
                    ))}
                  </select>
                </div>
              </>
            )}
            
            {modalType === 'producao' && (
              <>
                <div className="mb-4">
                  <label className="block text-slate-300 mb-2">Data</label>
                  <input
                    type="date"
                    className="w-full bg-slate-800 text-white border border-slate-700 rounded-lg px-4 py-2"
                    value={formData.data || ''}
                    onChange={(e) => setFormData({ ...formData, data: e.target.value })}
                    required
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-slate-300 mb-2">Lote</label>
                  <select
                    className="w-full bg-slate-800 text-white border border-slate-700 rounded-lg px-4 py-2"
                    value={formData.loteId || ''}
                    onChange={(e) => setFormData({ ...formData, loteId: e.target.value })}
                    required
                  >
                    <option value="">Selecione um lote</option>
                    {lotes.map(l => (
                      <option key={l.id} value={l.id}>{l.lote}</option>
                    ))}
                  </select>
                </div>
                <div className="mb-4">
                  <label className="block text-slate-300 mb-2">Ovos Produzidos</label>
                  <input
                    type="number"
                    className="w-full bg-slate-800 text-white border border-slate-700 rounded-lg px-4 py-2"
                    value={formData.ovos || ''}
                    onChange={(e) => setFormData({ ...formData, ovos: e.target.value })}
                    required
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-slate-300 mb-2">Ovos Trincados</label>
                  <input
                    type="number"
                    className="w-full bg-slate-800 text-white border border-slate-700 rounded-lg px-4 py-2"
                    value={formData.trincados || ''}
                    onChange={(e) => setFormData({ ...formData, trincados: e.target.value })}
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-slate-300 mb-2">Mortalidade (%)</label>
                  <input
                    type="number"
                    step="0.01"
                    className="w-full bg-slate-800 text-white border border-slate-700 rounded-lg px-4 py-2"
                    value={formData.mortalidade || ''}
                    onChange={(e) => setFormData({ ...formData, mortalidade: e.target.value })}
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-slate-300 mb-2">Custo da Ração (R$)</label>
                  <input
                    type="number"
                    step="0.01"
                    className="w-full bg-slate-800 text-white border border-slate-700 rounded-lg px-4 py-2"
                    value={formData.custoRacao || ''}
                    onChange={(e) => setFormData({ ...formData, custoRacao: e.target.value })}
                    placeholder="Opcional - para análise financeira"
                  />
                </div>
              </>
            )}
            
            {modalType === 'financeiro' && (
              <>
                <div className="mb-4">
                  <label className="block text-slate-300 mb-2">Data</label>
                  <input
                    type="date"
                    className="w-full bg-slate-800 text-white border border-slate-700 rounded-lg px-4 py-2"
                    value={formData.data || ''}
                    onChange={(e) => setFormData({ ...formData, data: e.target.value })}
                    required
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-slate-300 mb-2">Descrição</label>
                  <input
                    type="text"
                    className="w-full bg-slate-800 text-white border border-slate-700 rounded-lg px-4 py-2"
                    value={formData.descricao || ''}
                    onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
                    required
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-slate-300 mb-2">Tipo</label>
                  <select
                    className="w-full bg-slate-800 text-white border border-slate-700 rounded-lg px-4 py-2"
                    value={formData.tipo || 'receita'}
                    onChange={(e) => setFormData({ ...formData, tipo: e.target.value })}
                  >
                    <option value="receita">Receita</option>
                    <option value="despesa">Despesa</option>
                  </select>
                </div>
                <div className="mb-4">
                  <label className="block text-slate-300 mb-2">Valor (R$)</label>
                  <input
                    type="number"
                    step="0.01"
                    className="w-full bg-slate-800 text-white border border-slate-700 rounded-lg px-4 py-2"
                    value={formData.valor || ''}
                    onChange={(e) => setFormData({ ...formData, valor: e.target.value })}
                    required
                  />
                </div>
              </>
            )}
            
            <div className="flex gap-4">
              <button type="button" onClick={closeModal} className="flex-1 bg-slate-700 hover:bg-slate-600 text-white py-2 px-4 rounded-lg">
                Cancelar
              </button>
              <button type="submit" className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg">
                Salvar
              </button>
            </div>
          </form>
        </div>
      </div>
    )
  }
  
  // ========== COMPONENTE PRINCIPAL ==========
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Header */}
      <div className="bg-slate-900/50 border-b border-slate-700/50 p-6">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-4xl font-bold text-white flex items-center">
            <div className="bg-gradient-to-r from-yellow-400 to-orange-500 p-3 rounded-full mr-4">
              <Egg size={32} className="text-white" />
            </div>
            AvesGest PRO
          </h1>
          <p className="text-slate-400 mt-2">Gestão Profissional de Aves Poedeiras</p>
        </div>
      </div>
      
      {/* Navigation */}
      <div className="bg-slate-800/30 border-b border-slate-700/50">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex gap-4 overflow-x-auto">
            <button
              onClick={() => setCurrentView('dashboard')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg whitespace-nowrap ${
                currentView === 'dashboard' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white hover:bg-slate-700/50'
              }`}
            >
              <Home size={20} /> Dashboard
            </button>
            <button
              onClick={() => setCurrentView('galpoes')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg whitespace-nowrap ${
                currentView === 'galpoes' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white hover:bg-slate-700/50'
              }`}
            >
              <Warehouse size={20} /> Galpões
            </button>
            <button
              onClick={() => setCurrentView('lotes')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg whitespace-nowrap ${
                currentView === 'lotes' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white hover:bg-slate-700/50'
              }`}
            >
              <Users size={20} /> Lotes
            </button>
            <button
              onClick={() => setCurrentView('producao')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg whitespace-nowrap ${
                currentView === 'producao' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white hover:bg-slate-700/50'
              }`}
            >
              <Egg size={20} /> Produção
            </button>
            <button
              onClick={() => setCurrentView('financeiro')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg whitespace-nowrap ${
                currentView === 'financeiro' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white hover:bg-slate-700/50'
              }`}
            >
              <DollarSign size={20} /> Financeiro
            </button>
            <button
              onClick={() => setCurrentView('relatorios')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg whitespace-nowrap ${
                currentView === 'relatorios' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white hover:bg-slate-700/50'
              }`}
            >
              <TrendingUp size={20} /> Relatórios
            </button>
          </div>
        </div>
      </div>
      
      {/* Content */}
      <div className="max-w-7xl mx-auto p-6">
        {currentView === 'dashboard' && renderDashboard()}
        {currentView === 'galpoes' && renderGalpoes()}
        {currentView === 'lotes' && renderLotes()}
        {currentView === 'producao' && renderProducao()}
        {currentView === 'financeiro' && renderFinanceiro()}
        {currentView === 'relatorios' && renderRelatorios()}
      </div>
      
      {/* Modal */}
      {renderModal()}
    </div>
  )
}

export default App
