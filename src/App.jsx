import React, { useState, useMemo } from 'react';
import { 
  LayoutDashboard, PlusCircle, Egg, DollarSign, PackageSearch, Users, BarChart4, LogOut,
  Bird, Scale, AlertTriangle, Activity, Bell, Sparkles, Bot, Loader2, Info, Send, 
  FileText, Download, X, Menu, ChevronRight, TrendingUp, ClipboardList, ShoppingCart, 
  Wallet, CheckCircle, Mail, UserPlus, ShieldCheck, ArrowUpRight, ArrowDownRight
} from 'lucide-react';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  BarChart, Bar, ComposedChart
} from 'recharts';

// --- CONFIGURAÇÃO DA API GEMINI ---
const apiKey = ""; 
const GEMINI_MODEL = "gemini-2.5-flash-preview-09-2025";

// --- MOCK DATA INICIAL ---
const mockGalpoes = [
  { id: 'g1', nome: 'Galpão 01 - Isa Brown', dataEntrada: '2026-05-01', avesAlojadas: 4500, idadeSemanas: 21, sistema: 'CAGE_FREE', areaUtil: 645 },
  { id: 'g2', nome: 'Galpão 02 - Lohmann', dataEntrada: '2026-05-15', avesAlojadas: 5000, idadeSemanas: 18, sistema: 'GAIOLA', areaUtil: null }
];

const mockColetas = [
  { id: 'c1', galpaoId: 'g1', data: '2026-05-20', mortalidadeTotal: 2, ovosTotal: 3800, pesoMedio: 60, racaoFornecida: 500, sobra: 5, precoRacao: 2.10 },
  { id: 'c2', galpaoId: 'g1', data: '2026-05-21', mortalidadeTotal: 1, ovosTotal: 3950, pesoMedio: 61, racaoFornecida: 510, sobra: 2, precoRacao: 2.10 },
  { id: 'c3', galpaoId: 'g1', data: '2026-05-22', mortalidadeTotal: 0, ovosTotal: 4100, pesoMedio: 62, racaoFornecida: 520, sobra: 4, precoRacao: 2.15 },
  { id: 'c4', galpaoId: 'g1', data: '2026-05-23', mortalidadeTotal: 8, ovosTotal: 3900, pesoMedio: 62, racaoFornecida: 520, sobra: 10, precoRacao: 2.15 },
  { id: 'c5', galpaoId: 'g1', data: '2026-05-24', mortalidadeTotal: 1, ovosTotal: 4150, pesoMedio: 63, racaoFornecida: 530, sobra: 5, precoRacao: 2.15 }
];

const mockVendas = [
  { id: 'v1', data: '2026-05-21', qtdDuzias: 300, valorTotal: 2400.00, cliente: 'Mercado Central' },
  { id: 'v2', data: '2026-05-23', qtdDuzias: 350, valorTotal: 2800.00, cliente: 'Distribuidora Vale' }
];

const mockEquipe = [
  { id: 1, nome: 'Larissa França', email: 'larissa@avesgest.com', cargo: 'Zootecnista / Admin', acesso: 'Total', status: 'Ativo' },
  { id: 2, nome: 'João Pedro', email: 'joao@avesgest.com', cargo: 'Gerente de Produção', acesso: 'Edição', status: 'Ativo' },
  { id: 3, nome: 'Carlos Silva', email: 'carlos.s@avesgest.com', cargo: 'Operador de Granja', acesso: 'Apenas Coleta', status: 'Inativo' }
];

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  const [galpoes, setGalpoes] = useState(mockGalpoes);
  const [coletas, setColetas] = useState(mockColetas);
  const [vendas, setVendas] = useState(mockVendas);
  const [equipe, setEquipe] = useState(mockEquipe);

  // Estados da IA
  const [aiModalOpen, setAiModalOpen] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiResponse, setAiResponse] = useState("");
  const [aiContextTitle, setAiContextTitle] = useState("");

  // --- FUNÇÕES UTILITÁRIAS ---
  const fetchWithBackoff = async (url, options, retries = 5, delay = 1000) => {
    for (let i = 0; i < retries; i++) {
        try {
            const response = await fetch(url, options);
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            return await response.json();
        } catch (error) {
            if (i === retries - 1) throw error;
            await new Promise(res => setTimeout(res, delay));
            delay *= 2;
        }
    }
  };

  const callGeminiIA = async (promptText, systemInstruction, title) => {
    setAiContextTitle(title);
    setAiResponse("");
    setAiLoading(true);
    setAiModalOpen(true);
    try {
        const payload = { contents: [{ parts: [{ text: promptText }] }], systemInstruction: { parts: [{ text: systemInstruction }] } };
        const url = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${apiKey}`;
        const data = await fetchWithBackoff(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
        const generatedText = data.candidates?.[0]?.content?.parts?.[0]?.text;
        if (generatedText) setAiResponse(generatedText);
        else throw new Error("Resposta inválida da API");
    } catch (error) {
        setAiResponse("⚠️ Ocorreu um erro ao consultar a IA. Verifique sua conexão ou tente novamente.");
    } finally {
        setAiLoading(false);
    }
  };

  // --- MÉTRICAS GLOBAIS SEGURAS ---
  const metrics = useMemo(() => {
      const totalAvesIniciais = galpoes.reduce((acc, g) => acc + g.avesAlojadas, 0);
      const mortalidadeGeral = coletas.reduce((acc, c) => acc + c.mortalidadeTotal, 0);
      const totalAvesVivas = totalAvesIniciais - mortalidadeGeral;
      const taxaMortalidadeGlobal = totalAvesIniciais > 0 ? (mortalidadeGeral / totalAvesIniciais) * 100 : 0;

      const sortedColetas = [...coletas].sort((a,b) => new Date(a.data) - new Date(b.data));
      const ultimaData = sortedColetas.length > 0 ? sortedColetas[sortedColetas.length - 1].data : null;
      
      let producaoHoje = 0;
      if(ultimaData) {
          producaoHoje = sortedColetas.filter(c => c.data === ultimaData).reduce((acc, c) => acc + c.ovosTotal, 0);
      }
      const taxaPosturaHoje = totalAvesVivas > 0 ? (producaoHoje / totalAvesVivas) * 100 : 0;

      const totalOvosProduzidos = coletas.reduce((acc, c) => acc + c.ovosTotal, 0);
      const totalOvosVendidos = vendas.reduce((acc, v) => acc + (v.qtdDuzias * 12), 0);
      const estoqueOvosAtual = totalOvosProduzidos - totalOvosVendidos; 

      const receitaTotal = vendas.reduce((acc, v) => acc + v.valorTotal, 0);
      const custoAlimentarTotal = coletas.reduce((acc, c) => acc + ((c.racaoFornecida - (c.sobra || 0)) * (c.precoRacao || 0)), 0);
      const lucroBruto = receitaTotal - custoAlimentarTotal;

      return { totalAvesVivas, mortalidadeGeral, taxaMortalidadeGlobal, producaoHoje, taxaPosturaHoje, totalOvosProduzidos, estoqueOvosAtual, receitaTotal, custoAlimentarTotal, lucroBruto, ultimaData };
  }, [galpoes, coletas, vendas]);

  // --- COMPONENTES DE LAYOUT (TOP NAV) ---
  const TopNav = () => (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-sm">
      <div className="max-w-[1400px] mx-auto px-4 md:px-6 h-16 flex items-center justify-between">
        <div className="flex items-center gap-3">
            <div className="bg-red-600 p-1.5 rounded-lg flex items-center justify-center">
                <Bird className="w-6 h-6 text-white" />
            </div>
            <div className="flex flex-col leading-tight">
                <span className="font-bold text-lg text-slate-800 tracking-tight">AvesGest</span>
                <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest">Pro Edition</span>
            </div>
        </div>
        <nav className="hidden lg:flex items-center gap-1">
            <NavItem id="dashboard" icon={<LayoutDashboard/>} label="Dashboard" />
            <NavItem id="galpoes" icon={<PlusCircle/>} label="Cadastrar" />
            <NavItem id="coleta" icon={<Egg/>} label="Produção" />
            <NavItem id="financeiro" icon={<DollarSign/>} label="Financeiro" />
            <NavItem id="estoque" icon={<PackageSearch/>} label="Estoque" />
            <NavItem id="equipe" icon={<Users/>} label="Equipe" />
            <NavItem id="relatorios" icon={<BarChart4/>} label="Relatórios" />
            <NavItem id="copiloto" icon={<Sparkles/>} label="Copiloto IA" isAI={true} />
        </nav>
        <div className="hidden lg:flex items-center">
            <button className="flex items-center gap-2 text-red-500 hover:text-red-700 font-medium px-4 py-2 transition-colors text-sm">
                <LogOut className="w-4 h-4"/> Sair
            </button>
        </div>
        <button className="lg:hidden p-2 text-slate-600" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
            {isMobileMenuOpen ? <X className="w-6 h-6"/> : <Menu className="w-6 h-6"/>}
        </button>
      </div>
      {isMobileMenuOpen && (
        <div className="lg:hidden absolute top-16 left-0 right-0 bg-white border-b border-slate-200 shadow-lg px-4 py-4 flex flex-col gap-2">
            <NavItem id="dashboard" icon={<LayoutDashboard/>} label="Dashboard" mobile/>
            <NavItem id="galpoes" icon={<PlusCircle/>} label="Cadastrar" mobile/>
            <NavItem id="coleta" icon={<Egg/>} label="Produção" mobile/>
            <NavItem id="financeiro" icon={<DollarSign/>} label="Financeiro" mobile/>
            <NavItem id="estoque" icon={<PackageSearch/>} label="Estoque" mobile/>
            <NavItem id="equipe" icon={<Users/>} label="Equipe" mobile/>
            <NavItem id="relatorios" icon={<BarChart4/>} label="Relatórios" mobile/>
            <NavItem id="copiloto" icon={<Sparkles/>} label="Copiloto IA" isAI={true} mobile/>
        </div>
      )}
    </header>
  );

  const NavItem = ({ id, icon, label, isAI, mobile }) => {
    const isActive = activeTab === id;
    let baseClasses = `flex items-center gap-2 px-3 py-2 rounded-lg font-medium transition-all text-sm cursor-pointer ${mobile ? 'w-full' : ''}`;
    let stateClasses = isActive ? "bg-red-600 text-white shadow-sm" : isAI ? "text-indigo-600 bg-indigo-50 hover:bg-indigo-100" : "text-slate-600 hover:bg-slate-100 hover:text-slate-900";
    return (
      <div onClick={() => { setActiveTab(id); setIsMobileMenuOpen(false); }} className={`${baseClasses} ${stateClasses}`}>
        {React.cloneElement(icon, { className: 'w-4 h-4' })}
        <span>{label}</span>
      </div>
    );
  };

  const KpiCard = ({ title, value, subtitle, icon, color }) => {
    const colors = {
        blue: "text-blue-500 bg-blue-50",
        emerald: "text-green-500 bg-green-50",
        amber: "text-orange-500 bg-orange-50",
        red: "text-red-500 bg-red-50",
        indigo: "text-indigo-500 bg-indigo-50"
    };
    return (
      <div className={`p-5 rounded-2xl border border-slate-100 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow bg-white`}>
          <div className="flex justify-between items-start mb-2">
              <p className="text-sm font-semibold text-slate-500 leading-tight">{title}</p>
              <div className={`p-2 rounded-xl ${colors[color] || colors.blue}`}>{React.cloneElement(icon, { className: 'w-5 h-5' })}</div>
          </div>
          <div>
              <h3 className="text-2xl font-bold text-slate-800 tracking-tight">{value}</h3>
              <p className="text-xs font-medium text-slate-400 mt-1">{subtitle}</p>
          </div>
      </div>
    );
  };

  // --- VIEWS ---

  const DashboardView = () => {
    // Preparar dados seguros para o gráfico misto (Produção vs Mortalidade)
    const chartData = useMemo(() => {
        const map = {};
        coletas.forEach(c => {
            if(!map[c.data]) map[c.data] = { data: c.data, ovos: 0, mortalidade: 0 };
            map[c.data].ovos += c.ovosTotal;
            map[c.data].mortalidade += c.mortalidadeTotal;
        });
        return Object.values(map)
            .sort((a,b) => new Date(a.data) - new Date(b.data))
            .slice(-7)
            .map(d => ({...d, dataFormatada: d.data.split('-').slice(1).reverse().join('/')}));
    }, [coletas]);

    return (
      <div className="p-6 max-w-[1400px] mx-auto space-y-8 animate-fade-in pb-20">
        <div>
            <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-3"><LayoutDashboard className="w-7 h-7 text-slate-700"/> Dashboard</h1>
            <p className="text-slate-500 mt-1">Visão geral da operação. Última atualização: {metrics.ultimaData ? metrics.ultimaData.split('-').reverse().join('/') : 'Hoje'}.</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <KpiCard title="Produção (Últ. Dia)" value={metrics.producaoHoje.toLocaleString('pt-BR')} subtitle="ovos coletados" icon={<Egg />} color="blue" />
          <KpiCard title="Taxa de Postura" value={`${metrics.taxaPosturaHoje.toFixed(1)}%`} subtitle="eficiência do plantel" icon={<Activity />} color={metrics.taxaPosturaHoje > 85 ? "emerald" : "amber"} />
          <KpiCard title="Mortalidade Acum." value={`${metrics.taxaMortalidadeGlobal.toFixed(2)}%`} subtitle={`${metrics.mortalidadeGeral} aves perdidas`} icon={<AlertTriangle />} color="red" />
          <KpiCard title="Resultado Bruto" value={`R$ ${metrics.lucroBruto.toLocaleString('pt-BR', {minimumFractionDigits: 2})}`} subtitle="Receita - Custo Ração" icon={<TrendingUp />} color={metrics.lucroBruto >= 0 ? "emerald" : "red"} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 lg:col-span-2">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-lg font-bold text-slate-800">Evolução: Produção vs Mortalidade</h2>
                    <span className="px-3 py-1 bg-slate-50 text-slate-600 border border-slate-200 rounded-full text-xs font-semibold">Últimos 7 dias</span>
                </div>
                <div className="h-72 w-full">
                     {chartData.length > 0 ? (
                         <ResponsiveContainer width="100%" height="100%">
                             <ComposedChart data={chartData}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                                <XAxis dataKey="dataFormatada" stroke="#94a3b8" fontSize={12} />
                                <YAxis yAxisId="left" stroke="#94a3b8" fontSize={12} />
                                <YAxis yAxisId="right" orientation="right" stroke="#ef4444" fontSize={12} />
                                <Tooltip cursor={{fill: '#f8fafc'}} contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}}/>
                                <Legend wrapperStyle={{fontSize: '12px'}}/>
                                <Bar yAxisId="left" dataKey="ovos" fill="#3b82f6" name="Ovos Produzidos" radius={[4,4,0,0]} barSize={40} />
                                <Line yAxisId="right" type="monotone" dataKey="mortalidade" stroke="#ef4444" name="Mortalidade (Aves)" strokeWidth={3} dot={{r:4}} />
                             </ComposedChart>
                         </ResponsiveContainer>
                     ) : (
                         <div className="h-full flex items-center justify-center text-slate-400">Dados insuficientes para gerar o gráfico.</div>
                     )}
                </div>
            </div>

            <div className="space-y-6">
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col justify-center items-center text-center">
                    <div className="p-4 bg-orange-50 text-orange-500 rounded-full mb-4"><PackageSearch className="w-8 h-8"/></div>
                    <h2 className="text-slate-500 font-medium mb-1">Estoque Físico Estimado</h2>
                    <p className="text-4xl font-black text-slate-800">{Math.floor(metrics.estoqueOvosAtual / 12).toLocaleString('pt-BR')} <span className="text-lg font-medium text-slate-400">dz</span></p>
                    <button onClick={() => setActiveTab('estoque')} className="mt-4 text-red-600 text-sm font-semibold hover:text-red-700 flex items-center gap-1">Ver Detalhes <ChevronRight className="w-4 h-4"/></button>
                </div>

                <div className="bg-red-50 p-6 rounded-2xl border border-red-100">
                    <h2 className="text-red-800 font-bold flex items-center gap-2 mb-2"><Bell className="w-5 h-5" /> Alertas Ativos</h2>
                    <p className="text-sm text-red-700 leading-relaxed mb-4">
                        O sistema detectou variações nos índices de produtividade na última coleta registrada.
                    </p>
                    <button onClick={() => setActiveTab('copiloto')} className="w-full bg-red-600 hover:bg-red-700 text-white font-semibold py-2.5 rounded-xl text-sm shadow-sm transition-colors flex justify-center items-center gap-2">
                        <Sparkles className="w-4 h-4"/> Diagnosticar com IA
                    </button>
                </div>
            </div>
        </div>
      </div>
    );
  };

  const EstoqueView = () => {
      // Unifica coletas (entradas) e vendas (saídas) no Livro Razão
      const extrato = useMemo(() => {
          const entradas = coletas.map(c => ({ id: `e-${c.id}`, data: c.data, tipo: 'ENTRADA', desc: `Coleta (Galpão ${galpoes.find(g=>g.id===c.galpaoId)?.nome || c.galpaoId})`, qtd: c.ovosTotal / 12 }));
          const saidas = vendas.map(v => ({ id: `s-${v.id}`, data: v.data, tipo: 'SAÍDA', desc: `Venda para ${v.cliente}`, qtd: v.qtdDuzias }));
          return [...entradas, ...saidas].sort((a,b) => new Date(b.data) - new Date(a.data));
      }, [coletas, vendas, galpoes]);

      const ticketMedio = vendas.length > 0 ? (metrics.receitaTotal / (metrics.totalOvosProduzidos - metrics.estoqueOvosAtual)*12) : 0;
      const valorEstimadoEstoque = Math.floor(metrics.estoqueOvosAtual / 12) * ticketMedio;

      return (
        <div className="p-6 max-w-[1400px] mx-auto space-y-8 animate-fade-in pb-20">
            <div>
                <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-3"><PackageSearch className="w-7 h-7 text-slate-700"/> Controle de Estoque Físico</h1>
                <p className="text-slate-500 mt-1">Gestão unificada de ovos coletados e expedidos (Baseado em FIFO).</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-gradient-to-br from-slate-800 to-slate-900 p-6 rounded-2xl shadow-md border border-slate-700 text-white relative overflow-hidden">
                    <PackageSearch className="absolute right-[-10%] top-[-10%] w-32 h-32 opacity-10" />
                    <p className="text-slate-300 font-medium mb-1">Saldo Atual Disponível</p>
                    <h3 className="text-4xl font-black">{Math.floor(metrics.estoqueOvosAtual / 12).toLocaleString('pt-BR')} <span className="text-xl font-normal text-slate-400">dúzias</span></h3>
                    <p className="text-sm mt-3 text-emerald-400 flex items-center gap-1"><CheckCircle className="w-4 h-4"/> {metrics.estoqueOvosAtual.toLocaleString('pt-BR')} unidades no total</p>
                </div>
                <KpiCard title="Total Produzido (Histórico)" value={`${Math.floor(metrics.totalOvosProduzidos / 12).toLocaleString('pt-BR')} dz`} subtitle="Entradas" icon={<ArrowDownRight />} color="blue" />
                <KpiCard title="Valor Estimado em Estoque" value={`R$ ${valorEstimadoEstoque.toLocaleString('pt-BR', {minimumFractionDigits: 2})}`} subtitle={`Baseado no Ticket Médio atual`} icon={<Wallet />} color="emerald" />
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                <div className="p-6 border-b border-slate-100 flex justify-between items-center">
                    <h2 className="text-lg font-bold text-slate-800">Livro de Movimentação (Kardex)</h2>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm text-slate-600">
                        <thead className="bg-slate-50 text-slate-500 font-semibold uppercase text-xs">
                            <tr>
                                <th className="px-6 py-4 border-b border-slate-200">Data</th>
                                <th className="px-6 py-4 border-b border-slate-200">Tipo</th>
                                <th className="px-6 py-4 border-b border-slate-200">Descrição</th>
                                <th className="px-6 py-4 border-b border-slate-200">Quantidade</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {extrato.map(mov => (
                                <tr key={mov.id} className="hover:bg-slate-50">
                                    <td className="px-6 py-4 font-medium">{mov.data.split('-').reverse().join('/')}</td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2.5 py-1 text-xs font-bold rounded-lg ${mov.tipo === 'ENTRADA' ? 'bg-blue-50 text-blue-600 border border-blue-100' : 'bg-red-50 text-red-600 border border-red-100'}`}>
                                            {mov.tipo}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">{mov.desc}</td>
                                    <td className={`px-6 py-4 font-bold ${mov.tipo === 'ENTRADA' ? 'text-blue-600' : 'text-red-500'}`}>
                                        {mov.tipo === 'ENTRADA' ? '+' : '-'} {mov.qtd.toLocaleString('pt-BR', {maximumFractionDigits: 1})} dz
                                    </td>
                                </tr>
                            ))}
                            {extrato.length === 0 && <tr><td colSpan="4" className="text-center py-8 text-slate-400">Nenhuma movimentação registrada.</td></tr>}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
      );
  };

  const EquipeView = () => {
    const [novoMembro, setNovoMembro] = useState(false);
    
    return (
        <div className="p-6 max-w-[1400px] mx-auto space-y-8 animate-fade-in pb-20">
            <div className="flex flex-col md:flex-row justify-between md:items-end gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-3"><Users className="w-7 h-7 text-slate-700"/> Gestão de Equipe</h1>
                    <p className="text-slate-500 mt-1">Gerencie os acessos e permissões dos funcionários da granja.</p>
                </div>
                <button onClick={() => setNovoMembro(!novoMembro)} className="bg-red-600 hover:bg-red-700 text-white px-5 py-2.5 rounded-xl flex items-center justify-center gap-2 shadow-sm transition-colors font-medium">
                    <UserPlus className="w-5 h-5" /> Convidar Membro
                </button>
            </div>

            {novoMembro && (
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 mb-6">
                    <h2 className="text-lg font-bold mb-4 text-slate-800">Enviar Convite de Acesso</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div><label className="block text-sm font-medium text-slate-600 mb-1">E-mail do Funcionário</label><input type="email" placeholder="email@exemplo.com" className="w-full p-2.5 border border-slate-200 rounded-xl outline-none focus:border-red-500" /></div>
                        <div><label className="block text-sm font-medium text-slate-600 mb-1">Nível de Acesso</label>
                            <select className="w-full p-2.5 border border-slate-200 rounded-xl outline-none focus:border-red-500 bg-white">
                                <option>Apenas Coleta Diária</option>
                                <option>Acesso Completo (Admin)</option>
                                <option>Apenas Leitura / Relatórios</option>
                            </select>
                        </div>
                        <div className="flex items-end">
                            <button onClick={() => { alert('Convite simulado com sucesso!'); setNovoMembro(false); }} className="w-full bg-slate-800 text-white font-medium py-2.5 rounded-xl hover:bg-slate-900 transition-colors">Enviar Convite</button>
                        </div>
                    </div>
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {equipe.map(m => (
                    <div key={m.id} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col hover:shadow-md transition-shadow">
                        <div className="flex items-start gap-4 mb-4">
                            <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-600 font-bold flex items-center justify-center flex-shrink-0 border border-slate-200">
                                {m.nome.split(' ').map(n=>n[0]).join('').substring(0,2)}
                            </div>
                            <div className="flex-1 overflow-hidden">
                                <h3 className="font-bold text-lg text-slate-800 truncate">{m.nome}</h3>
                                <p className="text-sm text-slate-500 truncate">{m.cargo}</p>
                            </div>
                            {m.status === 'Ativo' ? 
                                <span className="w-3 h-3 bg-green-500 rounded-full flex-shrink-0 mt-2 shadow-sm border border-white"></span> : 
                                <span className="w-3 h-3 bg-slate-300 rounded-full flex-shrink-0 mt-2 shadow-sm border border-white"></span>
                            }
                        </div>
                        <div className="mt-auto space-y-2 pt-4 border-t border-slate-50">
                            <div className="flex items-center gap-2 text-sm text-slate-600"><Mail className="w-4 h-4 text-slate-400"/> <span className="truncate">{m.email}</span></div>
                            <div className="flex items-center gap-2 text-sm text-slate-600"><ShieldCheck className="w-4 h-4 text-slate-400"/> Permissão: <strong>{m.acesso}</strong></div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
  };

  const FinanceiroView = () => {
      const [novaVenda, setNovaVenda] = useState({ data: new Date().toISOString().split('T')[0], qtdDuzias: '', valorTotal: '', cliente: '' });
      const [mensagem, setMensagem] = useState("");

      const handleAddVenda = (e) => {
          e.preventDefault();
          setVendas([...vendas, { id: `v${Date.now()}`, data: novaVenda.data, qtdDuzias: Number(novaVenda.qtdDuzias), valorTotal: Number(novaVenda.valorTotal), cliente: novaVenda.cliente }]);
          setMensagem("Venda registrada com sucesso! DRE atualizado.");
          setNovaVenda({...novaVenda, qtdDuzias: '', valorTotal: '', cliente: ''});
          setTimeout(() => setMensagem(""), 4000);
      };

      return (
        <div className="p-6 max-w-[1400px] mx-auto space-y-8 animate-fade-in pb-20">
            <div>
                <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-3"><DollarSign className="w-7 h-7 text-slate-700"/> Financeiro</h1>
                <p className="text-slate-500 mt-1">Gestão de vendas e DRE simplificado.</p>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 lg:col-span-2">
                    <h2 className="text-xl font-bold text-slate-800 mb-6 border-b border-slate-100 pb-3">Demonstrativo de Resultado (DRE)</h2>
                    <div className="space-y-5">
                        <div className="flex justify-between text-lg font-medium text-slate-600">
                            <span>Receitas Brutas (Venda de Ovos)</span>
                            <span className="text-green-600 font-bold">R$ {metrics.receitaTotal.toLocaleString('pt-BR', {minimumFractionDigits: 2})}</span>
                        </div>
                        <div className="flex justify-between text-lg font-medium text-slate-600">
                            <span>Custos Variáveis (Ração)</span>
                            <span className="text-red-500 font-bold">- R$ {metrics.custoAlimentarTotal.toLocaleString('pt-BR', {minimumFractionDigits: 2})}</span>
                        </div>
                        <div className="pt-5 border-t border-slate-200 flex justify-between text-xl font-black text-slate-800">
                            <span>Margem Bruta</span>
                            <span className={metrics.lucroBruto >= 0 ? 'text-green-600' : 'text-red-600'}>
                                R$ {metrics.lucroBruto.toLocaleString('pt-BR', {minimumFractionDigits: 2})}
                            </span>
                        </div>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                    <h2 className="text-lg font-bold text-slate-800 mb-4">Nova Receita</h2>
                    {mensagem && <div className="mb-4 p-3 bg-green-50 text-green-700 text-sm rounded-lg font-medium">{mensagem}</div>}
                    <form onSubmit={handleAddVenda} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Data</label>
                            <input required type="date" value={novaVenda.data} onChange={(e) => setNovaVenda({...novaVenda, data: e.target.value})} className="w-full p-2.5 border border-slate-200 rounded-xl bg-slate-50 focus:border-red-500 outline-none" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Cliente</label>
                            <input required type="text" value={novaVenda.cliente} onChange={(e) => setNovaVenda({...novaVenda, cliente: e.target.value})} className="w-full p-2.5 border border-slate-200 rounded-xl focus:border-red-500 outline-none" placeholder="Ex: Mercado Local" />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Qtd (Dúzias)</label>
                                <input required type="number" value={novaVenda.qtdDuzias} onChange={(e) => setNovaVenda({...novaVenda, qtdDuzias: e.target.value})} className="w-full p-2.5 border border-slate-200 rounded-xl focus:border-red-500 outline-none" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Valor (R$)</label>
                                <input required type="number" step="0.01" value={novaVenda.valorTotal} onChange={(e) => setNovaVenda({...novaVenda, valorTotal: e.target.value})} className="w-full p-2.5 border border-slate-200 rounded-xl focus:border-red-500 outline-none" />
                            </div>
                        </div>
                        <button type="submit" className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3 rounded-xl transition-colors shadow-sm">Registrar</button>
                    </form>
                </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                <div className="p-6 border-b border-slate-100">
                    <h2 className="text-lg font-bold text-slate-800">Histórico de Receitas</h2>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm text-slate-600">
                        <thead className="bg-slate-50 text-slate-500 font-semibold uppercase text-xs">
                            <tr>
                                <th className="px-6 py-4 border-b border-slate-200">Data</th>
                                <th className="px-6 py-4 border-b border-slate-200">Cliente</th>
                                <th className="px-6 py-4 border-b border-slate-200">Volume</th>
                                <th className="px-6 py-4 border-b border-slate-200">Receita</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {vendas.slice().reverse().map(v => (
                                <tr key={v.id} className="hover:bg-slate-50">
                                    <td className="px-6 py-4 font-medium">{v.data.split('-').reverse().join('/')}</td>
                                    <td className="px-6 py-4">{v.cliente}</td>
                                    <td className="px-6 py-4">{v.qtdDuzias} dz</td>
                                    <td className="px-6 py-4 font-bold text-green-600">R$ {v.valorTotal.toFixed(2)}</td>
                                </tr>
                            ))}
                            {vendas.length === 0 && <tr><td colSpan="4" className="text-center py-8 text-slate-400">Nenhuma receita registrada.</td></tr>}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
      );
  };

  const GalpoesView = () => {
    const [isAdding, setIsAdding] = useState(false);
    const [novoGalpao, setNovoGalpao] = useState({ nome: '', dataEntrada: '', aves: '', idade: '', sistema: 'GAIOLA', area: '' });

    const handleAdd = (e) => {
        e.preventDefault();
        setGalpoes([...galpoes, {
            id: `g${Date.now()}`,
            nome: novoGalpao.nome,
            dataEntrada: novoGalpao.dataEntrada,
            avesAlojadas: Number(novoGalpao.aves),
            idadeSemanas: Number(novoGalpao.idade),
            sistema: novoGalpao.sistema,
            areaUtil: novoGalpao.sistema === 'CAGE_FREE' ? Number(novoGalpao.area) : null
        }]);
        setIsAdding(false);
        setNovoGalpao({ nome: '', dataEntrada: '', aves: '', idade: '', sistema: 'GAIOLA', area: '' });
    };

    return (
        <div className="p-6 max-w-[1400px] mx-auto space-y-8 animate-fade-in pb-20">
            <div className="flex flex-col md:flex-row justify-between md:items-end gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-3"><PlusCircle className="w-7 h-7 text-slate-700"/> Lotes e Galpões</h1>
                    <p className="text-slate-500 mt-1">Gerenciamento de lotes e alojamentos ativos.</p>
                </div>
                {!isAdding && (
                    <button onClick={() => setIsAdding(true)} className="bg-red-600 hover:bg-red-700 text-white px-5 py-2.5 rounded-xl flex items-center gap-2 shadow-sm transition-colors font-medium">
                        <PlusCircle className="w-5 h-5" /> Adicionar Lote
                    </button>
                )}
            </div>

            {isAdding && (
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                    <h2 className="text-lg font-bold mb-6 text-slate-800">Novo Lote/Galpão</h2>
                    <form onSubmit={handleAdd} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        <div><label className="block text-sm font-medium text-slate-600 mb-1">Nome/Identificação</label><input required type="text" value={novoGalpao.nome} onChange={e => setNovoGalpao({...novoGalpao, nome: e.target.value})} className="w-full p-2.5 border border-slate-200 rounded-xl outline-none focus:border-red-500" /></div>
                        <div><label className="block text-sm font-medium text-slate-600 mb-1">Data de Entrada</label><input required type="date" value={novoGalpao.dataEntrada} onChange={e => setNovoGalpao({...novoGalpao, dataEntrada: e.target.value})} className="w-full p-2.5 border border-slate-200 rounded-xl outline-none focus:border-red-500" /></div>
                        <div><label className="block text-sm font-medium text-slate-600 mb-1">Aves Iniciais</label><input required type="number" value={novoGalpao.aves} onChange={e => setNovoGalpao({...novoGalpao, aves: e.target.value})} className="w-full p-2.5 border border-slate-200 rounded-xl outline-none focus:border-red-500" /></div>
                        <div><label className="block text-sm font-medium text-slate-600 mb-1">Idade Inicial (Semanas)</label><input required type="number" value={novoGalpao.idade} onChange={e => setNovoGalpao({...novoGalpao, idade: e.target.value})} className="w-full p-2.5 border border-slate-200 rounded-xl outline-none focus:border-red-500" /></div>
                        <div><label className="block text-sm font-medium text-slate-600 mb-1">Sistema</label>
                            <select value={novoGalpao.sistema} onChange={e => setNovoGalpao({...novoGalpao, sistema: e.target.value})} className="w-full p-2.5 border border-slate-200 rounded-xl outline-none focus:border-red-500 bg-white">
                                <option value="GAIOLA">Gaiolas</option><option value="CAGE_FREE">Cage Free (Piso)</option>
                            </select>
                        </div>
                        {novoGalpao.sistema === 'CAGE_FREE' && (
                            <div><label className="block text-sm font-medium text-slate-600 mb-1">Área Útil (m²)</label><input required type="number" value={novoGalpao.area} onChange={e => setNovoGalpao({...novoGalpao, area: e.target.value})} className="w-full p-2.5 border border-slate-200 rounded-xl outline-none focus:border-red-500" /></div>
                        )}
                        <div className="lg:col-span-3 flex justify-end gap-3 mt-4">
                            <button type="button" onClick={() => setIsAdding(false)} className="px-5 py-2.5 text-slate-600 hover:bg-slate-100 rounded-xl font-medium transition-colors">Cancelar</button>
                            <button type="submit" className="px-6 py-2.5 bg-red-600 text-white rounded-xl font-medium hover:bg-red-700 shadow-sm transition-colors">Salvar Lote</button>
                        </div>
                    </form>
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {galpoes.map(g => (
                    <div key={g.id} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow relative overflow-hidden flex flex-col">
                        <div className={`absolute top-0 left-0 w-1.5 h-full ${g.sistema === 'CAGE_FREE' ? 'bg-green-500' : 'bg-blue-500'}`}></div>
                        <div className="flex justify-between items-start mb-6 pl-2">
                            <h3 className="font-bold text-lg text-slate-800 leading-tight">{g.nome}</h3>
                            <span className={`px-2.5 py-1 text-xs font-bold rounded-lg ${g.sistema === 'CAGE_FREE' ? 'bg-green-50 text-green-600 border border-green-100' : 'bg-blue-50 text-blue-600 border border-blue-100'}`}>
                                {g.sistema === 'CAGE_FREE' ? 'Cage Free' : 'Gaiolas'}
                            </span>
                        </div>
                        <div className="space-y-3 text-sm text-slate-600 pl-2 mt-auto">
                            <div className="flex justify-between border-b border-slate-50 pb-2"><span className="text-slate-400">Aves Alojadas</span><span className="font-bold text-slate-700">{g.avesAlojadas.toLocaleString('pt-BR')} un</span></div>
                            <div className="flex justify-between border-b border-slate-50 pb-2"><span className="text-slate-400">Idade Inicial</span><span className="font-bold text-slate-700">{g.idadeSemanas} semanas</span></div>
                            <div className="flex justify-between"><span className="text-slate-400">Data Entrada</span><span className="font-bold text-slate-700">{new Date(g.dataEntrada).toLocaleDateString('pt-BR')}</span></div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
  };

  const ColetaDiariaView = () => {
    const [galpaoId, setGalpaoId] = useState(galpoes.length > 0 ? galpoes[0].id : '');
    const [data, setData] = useState(new Date().toISOString().split('T')[0]);
    const [mortProlapso, setMortProlapso] = useState('');
    const [mortCanibalismo, setMortCanibalismo] = useState('');
    const [mortNatural, setMortNatural] = useState('');
    const [mortSubita, setMortSubita] = useState('');
    const [ovosTotal, setOvosTotal] = useState('');
    const [pesoMedio, setPesoMedio] = useState('');
    const [racaoFornecida, setRacaoFornecida] = useState('');
    const [sobraRacao, setSobraRacao] = useState('');
    const [precoRacao, setPrecoRacao] = useState('');
    const [mensagem, setMensagem] = useState("");

    const handleSubmit = (e) => {
      e.preventDefault();
      const novaColeta = {
        id: `c${Date.now()}`,
        galpaoId,
        data,
        mortalidadeTotal: Number(mortProlapso) + Number(mortCanibalismo) + Number(mortNatural) + Number(mortSubita),
        ovosTotal: Number(ovosTotal),
        pesoMedio: Number(pesoMedio),
        racaoFornecida: Number(racaoFornecida),
        sobra: Number(sobraRacao),
        precoRacao: Number(precoRacao)
      };

      setColetas([...coletas, novaColeta]);
      setMensagem('Apontamento registrado!');
      
      setOvosTotal(''); setRacaoFornecida(''); setSobraRacao(''); setMortProlapso(''); setMortCanibalismo(''); setMortNatural(''); setMortSubita('');
      setTimeout(() => setMensagem(""), 4000);
    };

    return (
      <div className="p-6 max-w-[1000px] mx-auto space-y-6 animate-fade-in pb-20">
        <div>
            <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-3"><Egg className="w-7 h-7 text-slate-700"/> Apontamento Diário</h1>
            <p className="text-slate-500 mt-1">Lançamento de produção, mortalidade e consumo nutricional.</p>
        </div>

        {mensagem && (
          <div className="p-4 rounded-xl font-medium bg-green-50 text-green-700 border border-green-100 shadow-sm flex items-center gap-3">
            <div className="p-1 bg-green-100 rounded-full"><ClipboardList className="w-4 h-4 text-green-600" /></div>
            {mensagem}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
            <h2 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-5 flex items-center gap-2"><ClipboardList className="w-4 h-4 text-slate-400" /> Identificação</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div><label className="block text-sm font-medium text-slate-600 mb-1">Galpão / Lote</label><select value={galpaoId} onChange={(e) => setGalpaoId(e.target.value)} className="w-full p-2.5 border border-slate-200 rounded-xl bg-slate-50 outline-none focus:border-red-500">{galpoes.map(g => <option key={g.id} value={g.id}>{g.nome}</option>)}</select></div>
              <div><label className="block text-sm font-medium text-slate-600 mb-1">Data da Coleta</label><input required type="date" value={data} onChange={(e) => setData(e.target.value)} className="w-full p-2.5 border border-slate-200 rounded-xl outline-none focus:border-red-500" /></div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
            <h2 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-5 flex items-center gap-2"><Egg className="w-4 h-4 text-orange-400" /> Produção e Nutrição</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div><label className="block text-sm font-medium text-slate-600 mb-1">Ovos (Qtd)</label><input required type="number" value={ovosTotal} onChange={(e) => setOvosTotal(e.target.value)} className="w-full p-2.5 border border-slate-200 rounded-xl outline-none focus:border-red-500" /></div>
              <div><label className="block text-sm font-medium text-slate-600 mb-1">Peso Médio (g)</label><input required type="number" step="0.1" value={pesoMedio} onChange={(e) => setPesoMedio(e.target.value)} className="w-full p-2.5 border border-slate-200 rounded-xl outline-none focus:border-red-500" /></div>
              <div><label className="block text-sm font-medium text-slate-600 mb-1">Ração (kg)</label><input required type="number" step="0.1" value={racaoFornecida} onChange={(e) => setRacaoFornecida(e.target.value)} className="w-full p-2.5 border border-slate-200 rounded-xl outline-none focus:border-red-500" /></div>
              <div><label className="block text-sm font-medium text-slate-600 mb-1">Sobra (kg)</label><input type="number" step="0.1" value={sobraRacao} onChange={(e) => setSobraRacao(e.target.value)} className="w-full p-2.5 border border-slate-200 rounded-xl outline-none focus:border-red-500" /></div>
            </div>
            <div className="mt-4 p-4 bg-slate-50 rounded-xl border border-slate-100 flex items-center gap-4">
                <DollarSign className="w-5 h-5 text-slate-400" />
                <div className="flex-1">
                    <label className="block text-sm font-semibold text-slate-600 mb-1">Custo da Ração (R$/kg) <span className="font-normal text-slate-400">- Opcional para DRE</span></label>
                    <input type="number" step="0.01" value={precoRacao} onChange={(e) => setPrecoRacao(e.target.value)} className="w-full md:w-1/3 p-2.5 border border-slate-200 rounded-lg outline-none focus:border-red-500" />
                </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
             <h2 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-5 flex items-center gap-2"><Bird className="w-4 h-4 text-red-400" /> Mortalidade Diária</h2>
             <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div><label className="block text-sm font-medium text-slate-600 mb-1">Prolapso</label><input type="number" min="0" value={mortProlapso} onChange={(e) => setMortProlapso(e.target.value)} className="w-full p-2.5 border border-slate-200 rounded-xl outline-none focus:border-red-500" /></div>
                <div><label className="block text-sm font-medium text-slate-600 mb-1">Canibalismo</label><input type="number" min="0" value={mortCanibalismo} onChange={(e) => setMortCanibalismo(e.target.value)} className="w-full p-2.5 border border-slate-200 rounded-xl outline-none focus:border-red-500" /></div>
                <div><label className="block text-sm font-medium text-slate-600 mb-1">Morte Natural</label><input type="number" min="0" value={mortNatural} onChange={(e) => setMortNatural(e.target.value)} className="w-full p-2.5 border border-slate-200 rounded-xl outline-none focus:border-red-500" /></div>
                <div><label className="block text-sm font-medium text-slate-600 mb-1">Súbita</label><input type="number" min="0" value={mortSubita} onChange={(e) => setMortSubita(e.target.value)} className="w-full p-2.5 border border-slate-200 rounded-xl outline-none focus:border-red-500" /></div>
             </div>
          </div>

          <div className="flex justify-end pt-2">
             <button type="submit" className="bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-8 rounded-xl shadow-md transition-all flex items-center gap-2">
                 Salvar Apontamento
             </button>
          </div>
        </form>
      </div>
    );
  };

  const RelatoriosView = () => {
    const [modalRelatorio, setModalRelatorio] = useState(null);

    return (
      <div className="p-6 max-w-[1400px] mx-auto space-y-8 animate-fade-in pb-20">
        <div>
            <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-3"><BarChart4 className="w-7 h-7 text-slate-700"/> Relatórios</h1>
            <p className="text-slate-500 mt-1">Gere relatórios detalhados da sua granja</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-4 hover:shadow-md transition-shadow">
                <div className="p-3 bg-orange-50 rounded-xl text-orange-500"><Egg className="w-6 h-6"/></div>
                <div><p className="text-sm font-medium text-slate-500">Produção Total</p><h3 className="text-2xl font-bold text-slate-800">{metrics.totalOvosProduzidos.toLocaleString('pt-BR')}</h3></div>
            </div>
            <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-4 hover:shadow-md transition-shadow">
                <div className="p-3 bg-green-50 rounded-xl text-green-500"><DollarSign className="w-6 h-6"/></div>
                <div><p className="text-sm font-medium text-slate-500">Receita Total</p><h3 className="text-2xl font-bold text-slate-800">R$ {(metrics.receitaTotal / 1000).toFixed(1)}k</h3></div>
            </div>
            <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-4 hover:shadow-md transition-shadow">
                <div className="p-3 bg-blue-50 rounded-xl text-blue-500"><Bird className="w-6 h-6"/></div>
                <div><p className="text-sm font-medium text-slate-500">Total de Aves</p><h3 className="text-2xl font-bold text-slate-800">{metrics.totalAvesVivas.toLocaleString('pt-BR')}</h3></div>
            </div>
            <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-4 hover:shadow-md transition-shadow">
                <div className="p-3 bg-purple-50 rounded-xl text-purple-500"><Activity className="w-6 h-6"/></div>
                <div><p className="text-sm font-medium text-slate-500">Taxa de Postura</p><h3 className="text-2xl font-bold text-slate-800">{metrics.taxaPosturaHoje.toFixed(1)}%</h3></div>
            </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col justify-between hover:shadow-md transition-shadow">
                <div className="flex items-start gap-4 mb-6">
                    <div className="p-3 bg-orange-50 text-orange-500 rounded-xl"><Egg className="w-6 h-6"/></div>
                    <div><h3 className="text-lg font-bold text-slate-800 leading-tight">Relatório de Produção</h3><p className="text-sm text-slate-500 mt-1">Análise detalhada da produção de ovos por período</p></div>
                </div>
                <div className="flex gap-3">
                    <button onClick={() => setModalRelatorio('producao')} className="flex-1 bg-red-50 hover:bg-red-100 text-red-600 font-semibold py-3 rounded-xl flex items-center justify-center gap-2 transition-colors"><FileText className="w-5 h-5" /> Visualizar</button>
                    <button className="px-4 bg-white border border-red-100 hover:bg-red-50 text-red-600 rounded-xl flex items-center justify-center transition-colors"><Download className="w-5 h-5" /></button>
                </div>
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col justify-between hover:shadow-md transition-shadow">
                <div className="flex items-start gap-4 mb-6">
                    <div className="p-3 bg-green-50 text-green-500 rounded-xl"><DollarSign className="w-6 h-6"/></div>
                    <div><h3 className="text-lg font-bold text-slate-800 leading-tight">Relatório Financeiro</h3><p className="text-sm text-slate-500 mt-1">Receitas, despesas operacionais e lucro por período</p></div>
                </div>
                <div className="flex gap-3">
                    <button onClick={() => setActiveTab('financeiro')} className="flex-1 bg-red-50 hover:bg-red-100 text-red-600 font-semibold py-3 rounded-xl flex items-center justify-center gap-2 transition-colors"><FileText className="w-5 h-5" /> Visualizar DRE</button>
                    <button className="px-4 bg-white border border-red-100 hover:bg-red-50 text-red-600 rounded-xl flex items-center justify-center transition-colors"><Download className="w-5 h-5" /></button>
                </div>
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col justify-between hover:shadow-md transition-shadow">
                <div className="flex items-start gap-4 mb-6">
                    <div className="p-3 bg-blue-50 text-blue-500 rounded-xl"><Bird className="w-6 h-6"/></div>
                    <div><h3 className="text-lg font-bold text-slate-800 leading-tight">Relatório por Lote</h3><p className="text-sm text-slate-500 mt-1">Desempenho zootécnico individual de cada lote</p></div>
                </div>
                <div className="flex gap-3">
                    <button onClick={() => setModalRelatorio('lote')} className="flex-1 bg-red-50 hover:bg-red-100 text-red-600 font-semibold py-3 rounded-xl flex items-center justify-center gap-2 transition-colors"><FileText className="w-5 h-5" /> Visualizar</button>
                    <button className="px-4 bg-white border border-red-100 hover:bg-red-50 text-red-600 rounded-xl flex items-center justify-center transition-colors"><Download className="w-5 h-5" /></button>
                </div>
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col justify-between hover:shadow-md transition-shadow relative overflow-hidden">
                <div className="absolute top-0 right-0 p-2"><Sparkles className="w-6 h-6 text-indigo-200"/></div>
                <div className="flex items-start gap-4 mb-6">
                    <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl"><Activity className="w-6 h-6"/></div>
                    <div><h3 className="text-lg font-bold text-slate-800 leading-tight">Relatório de Eficiência (IA)</h3><p className="text-sm text-slate-500 mt-1">Indicadores de produtividade e conversão gerados por IA</p></div>
                </div>
                <div className="flex gap-3">
                    <button onClick={() => setActiveTab('copiloto')} className="flex-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-600 font-semibold py-3 rounded-xl flex items-center justify-center gap-2 transition-colors"><Bot className="w-5 h-5" /> Consultar Copiloto</button>
                </div>
            </div>
        </div>

        {modalRelatorio === 'producao' && (
            <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden animate-fade-in">
                    <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-white">
                        <h3 className="font-bold text-xl text-slate-800 flex items-center gap-2"><Egg className="w-6 h-6 text-orange-500"/> Gráfico de Produção</h3>
                        <button onClick={() => setModalRelatorio(null)} className="text-slate-400 hover:text-slate-600 p-1 bg-slate-50 rounded-lg"><X className="w-6 h-6" /></button>
                    </div>
                    <div className="p-6 overflow-y-auto flex-1 bg-slate-50">
                        <div className="bg-white p-6 rounded-xl border border-slate-100 h-80">
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={[...coletas].sort((a,b) => new Date(a.data) - new Date(b.data))}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                                    <XAxis dataKey="data" stroke="#64748b" tickFormatter={(v) => v.split('-').slice(1).join('/')} />
                                    <YAxis stroke="#64748b" />
                                    <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                                    <Legend />
                                    <Line type="monotone" name="Ovos Coletados" dataKey="ovosTotal" stroke="#f97316" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>
            </div>
        )}

        {modalRelatorio === 'lote' && (
            <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col overflow-hidden animate-fade-in">
                    <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-white">
                        <h3 className="font-bold text-xl text-slate-800 flex items-center gap-2"><Bird className="w-6 h-6 text-blue-500"/> Desempenho por Lote</h3>
                        <button onClick={() => setModalRelatorio(null)} className="text-slate-400 hover:text-slate-600 p-1 bg-slate-50 rounded-lg"><X className="w-6 h-6" /></button>
                    </div>
                    <div className="p-6 overflow-y-auto flex-1 bg-slate-50">
                        {galpoes.map(g => {
                            const cLote = coletas.filter(c => c.galpaoId === g.id);
                            const mortTotal = cLote.reduce((acc, c) => acc + c.mortalidadeTotal, 0);
                            const viab = ((g.avesAlojadas - mortTotal) / g.avesAlojadas) * 100;
                            return (
                                <div key={g.id} className="bg-white p-5 rounded-xl border border-slate-200 mb-4 shadow-sm flex flex-col md:flex-row justify-between md:items-center gap-4">
                                    <div>
                                        <h4 className="font-bold text-lg text-slate-800">{g.nome}</h4>
                                        <p className="text-sm text-slate-500">Idade Entrada: {g.idadeSemanas} semanas | Sistema: {g.sistema}</p>
                                    </div>
                                    <div className="flex gap-6">
                                        <div className="text-center">
                                            <p className="text-xs font-semibold text-slate-400 uppercase">Viabilidade</p>
                                            <p className="font-bold text-lg text-slate-700">{viab.toFixed(2)}%</p>
                                        </div>
                                        <div className="text-center">
                                            <p className="text-xs font-semibold text-slate-400 uppercase">Mortalidade</p>
                                            <p className="font-bold text-lg text-red-500">{mortTotal} aves</p>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        )}
      </div>
    );
  };

  const CopilotoView = () => {
    const [pergunta, setPergunta] = useState("");
    const [resposta, setResposta] = useState("");
    const [loading, setLoading] = useState(false);

    const handleAsk = async (e, promptPredefinido = null) => {
      const textToAsk = typeof promptPredefinido === 'string' ? promptPredefinido : pergunta;
      if (!textToAsk.trim()) return;
      
      setLoading(true);
      setResposta("");
      if(e && e.preventDefault) e.preventDefault();
      
      try {
          const systemContext = `Você é o Copiloto Avícola PRO, uma IA avançada desenvolvida para o sistema AvesGest PRO. CONTEXTO EM TEMPO REAL: Aves Vivas Totais: ${metrics.totalAvesVivas}, Taxa Postura Hoje: ${metrics.taxaPosturaHoje.toFixed(1)}%, Mortalidade: ${metrics.mortalidadeGeral} aves (${metrics.taxaMortalidadeGlobal.toFixed(2)}%), Lucro Bruto (Mês): R$ ${metrics.lucroBruto.toFixed(2)}. Responda diretamente ao avicultor de forma profissional.`;
          const payload = { contents: [{ parts: [{ text: textToAsk }] }], systemInstruction: { parts: [{ text: systemContext }] } };
          const url = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${apiKey}`;
          
          const data = await fetchWithBackoff(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
          const generatedText = data.candidates?.[0]?.content?.parts?.[0]?.text;
          
          if (generatedText) setResposta(generatedText);
          else throw new Error("Resposta inválida");
      } catch (error) {
          setResposta("⚠️ Falha na conexão com o motor neural. Tente novamente.");
      } finally {
          setLoading(false);
      }
    };

    return (
      <div className="p-6 max-w-[1000px] mx-auto space-y-6 animate-fade-in pb-20 flex flex-col h-[calc(100vh-5rem)]">
        <div>
            <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-3"><Bot className="w-7 h-7 text-indigo-600"/> Copiloto IA</h1>
            <p className="text-slate-500 mt-1">Assistente Preditivo conectado aos dados em tempo real da sua granja.</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-2">
             <button onClick={(e) => { setPergunta("Gere uma análise completa."); handleAsk(e, "Gere uma análise completa e sugira cortes de gastos."); }} className="bg-white border border-slate-100 p-4 rounded-2xl text-left hover:border-indigo-300 hover:shadow-sm transition-all group">
                 <h3 className="font-bold text-slate-800 flex items-center gap-2 mb-1"><BarChart4 className="w-4 h-4 text-indigo-500" /> Análise Geral</h3>
                 <p className="text-xs text-slate-500">DRE e Taxa de Postura</p>
             </button>
             <button onClick={(e) => { setPergunta("Faça uma previsão de lucro."); handleAsk(e, "Baseado nos meus custos, faça uma previsão de lucro para 30 dias."); }} className="bg-white border border-slate-100 p-4 rounded-2xl text-left hover:border-indigo-300 hover:shadow-sm transition-all group">
                 <h3 className="font-bold text-slate-800 flex items-center gap-2 mb-1"><TrendingUp className="w-4 h-4 text-indigo-500" /> Previsão 30 Dias</h3>
                 <p className="text-xs text-slate-500">Projeção financeira</p>
             </button>
             <button onClick={(e) => { setPergunta("Como escoar estoque?"); handleAsk(e, "Tenho um estoque de ovos. Qual a melhor estratégia de venda?"); }} className="bg-white border border-slate-100 p-4 rounded-2xl text-left hover:border-indigo-300 hover:shadow-sm transition-all group">
                 <h3 className="font-bold text-slate-800 flex items-center gap-2 mb-1"><PackageSearch className="w-4 h-4 text-indigo-500" /> Estoque</h3>
                 <p className="text-xs text-slate-500">Estratégias de vendas</p>
             </button>
        </div>
        
        <div className="flex-1 bg-white rounded-2xl shadow-sm border border-slate-100 flex flex-col overflow-hidden">
            <div className="flex-1 overflow-y-auto p-6 bg-slate-50/50">
                 {!resposta && !loading && (
                     <div className="h-full flex flex-col items-center justify-center text-slate-300 space-y-4">
                         <Sparkles className="w-12 h-12" />
                         <p className="text-sm font-medium">Faça uma pergunta para iniciar a consultoria.</p>
                     </div>
                 )}
                 {loading && (
                     <div className="flex items-center gap-3 text-indigo-600 bg-indigo-50 p-4 rounded-xl border border-indigo-100 w-fit text-sm font-medium">
                         <Loader2 className="w-4 h-4 animate-spin" /> Analisando os dados da granja...
                     </div>
                 )}
                 {resposta && (
                     <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-sm animate-fade-in text-slate-700 text-sm leading-relaxed whitespace-pre-wrap">
                         <div className="flex items-center gap-2 mb-4 border-b border-slate-100 pb-3">
                             <div className="bg-indigo-100 p-1.5 rounded-lg"><Bot className="w-4 h-4 text-indigo-600" /></div>
                             <h3 className="font-bold text-indigo-900">Parecer Técnico</h3>
                         </div>
                         {resposta}
                     </div>
                 )}
            </div>
            <form onSubmit={handleAsk} className="p-4 bg-white border-t border-slate-100 flex gap-3">
               <input value={pergunta} onChange={(e) => setPergunta(e.target.value)} placeholder="Faça uma pergunta ao Copiloto..." className="flex-1 p-3 border border-slate-200 rounded-xl focus:border-indigo-500 outline-none text-sm bg-slate-50" />
               <button disabled={loading || !pergunta.trim()} type="submit" className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 rounded-xl disabled:opacity-50 transition-all flex items-center justify-center shadow-sm">
                  {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
               </button>
            </form>
        </div>
      </div>
    );
  };

  return (
    <div className="flex flex-col bg-slate-50 min-h-screen font-sans">
      <TopNav />
      <main className="flex-1 overflow-x-hidden">
        {activeTab === 'dashboard' && <DashboardView />}
        {activeTab === 'galpoes' && <GalpoesView />}
        {activeTab === 'coleta' && <ColetaDiariaView />}
        {activeTab === 'financeiro' && <FinanceiroView />}
        {activeTab === 'relatorios' && <RelatoriosView />}
        {activeTab === 'copiloto' && <CopilotoView />}
        {activeTab === 'estoque' && <EstoqueView />}
        {activeTab === 'equipe' && <EquipeView />}
      </main>

      {/* --- MODAL DA IA GLOBAL --- */}
      {aiModalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[85vh] flex flex-col overflow-hidden animate-fade-in">
                <div className="p-5 border-b border-slate-100 flex justify-between items-center">
                    <div className="flex items-center gap-3 text-indigo-700 font-bold text-lg">
                        <Bot className="w-5 h-5" /> {aiContextTitle}
                    </div>
                    <button onClick={() => setAiModalOpen(false)} className="text-slate-400 hover:text-slate-600 p-1 bg-slate-50 rounded-lg"><X className="w-5 h-5" /></button>
                </div>
                <div className="p-6 overflow-y-auto flex-1 bg-slate-50 text-slate-700 text-sm leading-relaxed">
                    {aiLoading ? (
                        <div className="flex flex-col items-center justify-center py-12 text-indigo-600">
                            <Loader2 className="w-8 h-8 animate-spin mb-4" />
                            <p className="font-medium animate-pulse">A IA está avaliando seus dados...</p>
                        </div>
                    ) : (
                        <div className="whitespace-pre-wrap bg-white p-5 rounded-xl border border-slate-200">
                            <div className="flex items-start gap-3 p-3 mb-4 bg-indigo-50 text-indigo-800 rounded-lg border border-indigo-100">
                                <Info className="w-4 h-4 mt-0.5 flex-shrink-0" />
                                <p className="text-xs">Parecer gerado por IA (Gemini). Recomendamos acompanhamento veterinário presencial para patologias.</p>
                            </div>
                            {aiResponse}
                        </div>
                    )}
                </div>
                <div className="p-4 bg-white border-t border-slate-100 flex justify-end">
                    <button onClick={() => setAiModalOpen(false)} className="px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white font-medium rounded-xl transition-colors">Fechar</button>
                </div>
            </div>
        </div>
      )}
    </div>
  );
}
