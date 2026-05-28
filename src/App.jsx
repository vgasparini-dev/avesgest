import React, { useState, useMemo } from 'react';
import { 
  LayoutDashboard, Home, ClipboardList, TrendingUp, PlusCircle, 
  Menu, X, Egg, Bird, Scale, AlertTriangle, Activity, DollarSign, Bell,
  Sparkles, Bot, Loader2, Info, MessageSquare, Send
} from 'lucide-react';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer 
} from 'recharts';
import './design-moderno.css';
// --- CONFIGURAÇÃO DA API GEMINI ---
const apiKey = ""; // A chave da API é injetada automaticamente no ambiente
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
  { id: 'c4', galpaoId: 'g1', data: '2026-05-23', mortalidadeTotal: 8, ovosTotal: 3900, pesoMedio: 62, racaoFornecida: 520, sobra: 10, precoRacao: 2.15 }, // Simulação de problema
  { id: 'c5', galpaoId: 'g1', data: '2026-05-24', mortalidadeTotal: 1, ovosTotal: 4150, pesoMedio: 63, racaoFornecida: 530, sobra: 5, precoRacao: 2.15 }
];

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  const [galpoes, setGalpoes] = useState(mockGalpoes);
  const [coletas, setColetas] = useState(mockColetas);

  // Estados globais para a IA
  const [aiModalOpen, setAiModalOpen] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiResponse, setAiResponse] = useState("");
  const [aiContextTitle, setAiContextTitle] = useState("");

  // --- FUNÇÕES UTILITÁRIAS DE API ---
  const fetchWithBackoff = async (url, options, retries = 5, delay = 1000) => {
    for (let i = 0; i < retries; i++) {
        try {
            const response = await fetch(url, options);
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            return await response.json();
        } catch (error) {
            if (i === retries - 1) throw error;
            await new Promise(res => setTimeout(res, delay));
            delay *= 2; // Exponential backoff
        }
    }
  };

  const callGeminiIA = async (promptText, systemInstruction, title) => {
    setAiContextTitle(title);
    setAiResponse("");
    setAiLoading(true);
    setAiModalOpen(true);
    
    try {
        const payload = {
            contents: [{ parts: [{ text: promptText }] }],
            systemInstruction: { parts: [{ text: systemInstruction }] }
        };
        
        const url = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${apiKey}`;
        const data = await fetchWithBackoff(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        const generatedText = data.candidates?.[0]?.content?.parts?.[0]?.text;
        if (generatedText) {
            setAiResponse(generatedText);
        } else {
            throw new Error("Resposta inválida da API");
        }
    } catch (error) {
        setAiResponse("⚠️ Ocorreu um erro ao consultar o Zootecnista IA. Por favor, tente novamente mais tarde.");
    } finally {
        setAiLoading(false);
    }
  };

  // --- MOTOR DE CÁLCULO ZOOTÉCNICO ---
  const calcularAvesVivasNaData = (galpaoId, dataReferencia) => {
    const galpao = galpoes.find(g => g.id === galpaoId);
    if (!galpao) return 0;
    const mortalidadeAcumulada = coletas
      .filter(c => c.galpaoId === galpaoId && new Date(c.data) <= new Date(dataReferencia))
      .reduce((acc, c) => acc + c.mortalidadeTotal, 0);
    return galpao.avesAlojadas - mortalidadeAcumulada;
  };

  const Sidebar = () => (
    <div className={`bg-emerald-800 text-white w-64 min-h-screen flex flex-col transition-transform transform ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0 fixed z-20 md:relative`}>
      <div className="p-6 flex items-center justify-between border-b border-emerald-700">
        <div className="flex items-center gap-2">
          <Egg className="w-8 h-8 text-yellow-400" />
          <span className="text-2xl font-bold tracking-wider">AveGest</span>
        </div>
        <button className="md:hidden text-white" onClick={() => setIsMobileMenuOpen(false)}><X /></button>
      </div>
      <nav className="flex-1 px-4 mt-6 space-y-2">
        <NavItem id="dashboard" icon={<LayoutDashboard />} label="Dashboard" />
        <NavItem id="galpoes" icon={<Home />} label="Lotes e Galpões" />
        <NavItem id="coleta" icon={<ClipboardList />} label="Apontamento Diário" />
        <NavItem id="relatorios" icon={<TrendingUp />} label="Relatórios (Índices)" />
        <NavItem id="assistente" icon={<MessageSquare />} label="Consultoria IA ✨" />
      </nav>
      
      <div className="p-4 border-t border-emerald-700 m-4 rounded-lg bg-emerald-900/50">
          <div className="flex items-center gap-2 text-emerald-200 text-xs mb-2">
              <Sparkles className="w-4 h-4 text-yellow-400" />
              <span>Zootecnia de Precisão</span>
          </div>
          <p className="text-[10px] text-emerald-400 leading-tight">Módulos potencializados com IA Gemini para laudos técnicos rápidos.</p>
      </div>
    </div>
  );

  const NavItem = ({ id, icon, label }) => {
    const isActive = activeTab === id;
    return (
      <button
        onClick={() => { setActiveTab(id); setIsMobileMenuOpen(false); }}
        className={`flex items-center gap-3 px-4 py-3 w-full text-left rounded-lg transition-colors ${isActive ? 'bg-emerald-600 text-white shadow' : 'text-emerald-100 hover:bg-emerald-700 hover:text-white'}`}
      >
        {React.cloneElement(icon, { className: 'w-5 h-5' })}
        <span className="font-medium">{label}</span>
      </button>
    );
  };

  // --- VIEWS ---
  const DashboardView = () => {
    const totalAvesIniciais = galpoes.reduce((acc, g) => acc + g.avesAlojadas, 0);
    const mortalidadeGeral = coletas.reduce((acc, c) => acc + c.mortalidadeTotal, 0);
    const totalAvesVivas = totalAvesIniciais - mortalidadeGeral;

    const chartData = useMemo(() => {
        const dataMap = {};
        coletas.forEach(c => {
            if(!dataMap[c.data]) dataMap[c.data] = { data: c.data, ovos: 0, mortalidade: 0 };
            dataMap[c.data].ovos += c.ovosTotal;
            dataMap[c.data].mortalidade += c.mortalidadeTotal;
        });
        return Object.values(dataMap)
            .sort((a, b) => new Date(a.data) - new Date(b.data))
            .slice(-7)
            .map(d => ({ ...d, data: d.data.split('-').slice(1).join('/') }));
    }, [coletas]);

    const alertas = useMemo(() => {
        const avisos = [];
        galpoes.forEach(g => {
            const coletasDoGalpao = coletas.filter(c => c.galpaoId === g.id).sort((a,b) => new Date(a.data) - new Date(b.data));
            if(coletasDoGalpao.length === 0) return;
            const ultima = coletasDoGalpao[coletasDoGalpao.length - 1];
            const avesVivas = calcularAvesVivasNaData(g.id, ultima.data);
            
            const mortPercent = (ultima.mortalidadeTotal / avesVivas) * 100;
            if(mortPercent > 0.15) {
                avisos.push({ 
                    tipo: 'critico', 
                    texto: `Alta mortalidade no ${g.nome} (${ultima.mortalidadeTotal} aves - ${mortPercent.toFixed(2)}%) em ${ultima.data}.`,
                    contextoIa: `Lote ${g.nome}, ${g.idadeSemanas} semanas, sistema ${g.sistema}. Aves vivas: ${avesVivas}. Ocorreu uma mortalidade repentina de ${ultima.mortalidadeTotal} aves num único dia (${mortPercent.toFixed(2)}%).`
                });
            }
            
            const prodPercent = (ultima.ovosTotal / avesVivas) * 100;
            if(prodPercent < 85 && g.idadeSemanas > 20 && g.idadeSemanas < 60) {
                avisos.push({ 
                    tipo: 'alerta', 
                    texto: `Produção baixa no ${g.nome} (${prodPercent.toFixed(1)}%). Verifique o consumo de ração e ambiência.`,
                    contextoIa: `Lote ${g.nome}, ${g.idadeSemanas} semanas, sistema ${g.sistema}. Aves vivas: ${avesVivas}. A produção de ovos caiu para ${prodPercent.toFixed(1)}%, que é baixo para o pico de produção (idade 20-60 semanas).`
                });
            }
        });
        return avisos;
    }, [coletas, galpoes]);

    const handleConsultarAlertaIA = (alerta) => {
        const systemInstruction = "Você é um Médico Veterinário e Zootecnista especialista em patologia e manejo de aves de postura comercial. O usuário apresentará um alerta do sistema sobre o plantel. Forneça diagnósticos diferenciais breves e 3 recomendações emergenciais de manejo focadas na resolução da crise. Evite textos muito longos.";
        const prompt = `Analise este alerta gerado pela nossa granja de postura: "${alerta.texto}". Contexto do lote: ${alerta.contextoIa}. O que pode estar causando isso e quais ações emergenciais devo tomar hoje?`;
        callGeminiIA(prompt, systemInstruction, "Diagnóstico Inteligente de Alerta");
    };

    return (
      <div className="p-6 max-w-7xl mx-auto space-y-6 animate-fade-in">
        <h1 className="text-3xl font-bold text-slate-800 mb-8">Painel de Controle</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard title="Total de Aves (Ativas)" value={totalAvesVivas.toLocaleString('pt-BR')} icon={<Bird />} color="text-blue-600" bg="bg-white border border-slate-200" />
          <StatCard title="Galpões Ativos" value={galpoes.length} icon={<Home />} color="text-emerald-600" bg="bg-white border border-slate-200" />
          <StatCard title="Total de Coletas" value={coletas.length} icon={<ClipboardList />} color="text-purple-600" bg="bg-white border border-slate-200" />
          <StatCard title="Mortalidade Acumulada" value={mortalidadeGeral} icon={<AlertTriangle />} color="text-red-600" bg="bg-white border border-slate-200" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 lg:col-span-2">
                <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                    <Activity className="w-5 h-5 text-emerald-600" /> Curva de Produção Global (Últimos 7 dias)
                </h2>
                <div className="h-72">
                    {chartData.length > 0 ? (
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={chartData}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                                <XAxis dataKey="data" stroke="#64748b" fontSize={12} />
                                <YAxis yAxisId="left" stroke="#64748b" fontSize={12} />
                                <YAxis yAxisId="right" orientation="right" stroke="#ef4444" fontSize={12} />
                                <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                                <Legend />
                                <Line yAxisId="left" type="monotone" name="Ovos Produzidos" dataKey="ovos" stroke="#10b981" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                                <Line yAxisId="right" type="step" name="Mortalidade" dataKey="mortalidade" stroke="#ef4444" strokeWidth={2} strokeDasharray="5 5" />
                            </LineChart>
                        </ResponsiveContainer>
                    ) : (
                        <div className="h-full flex items-center justify-center text-slate-400">Sem dados suficientes para o gráfico.</div>
                    )}
                </div>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 flex flex-col">
                <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                    <Bell className="w-5 h-5 text-amber-500" /> Alertas do Sistema
                </h2>
                <div className="flex-1 overflow-y-auto space-y-3">
                    {alertas.length === 0 ? (
                        <div className="text-sm text-slate-500 text-center mt-10">Tudo operando dentro da normalidade.</div>
                    ) : (
                        alertas.map((alerta, idx) => (
                            <div key={idx} className={`p-4 rounded-lg border text-sm flex flex-col gap-3 ${alerta.tipo === 'critico' ? 'bg-red-50 border-red-200 text-red-800' : 'bg-amber-50 border-amber-200 text-amber-800'}`}>
                                <div>
                                    <strong>{alerta.tipo === 'critico' ? 'CRÍTICO: ' : 'ATENÇÃO: '}</strong>
                                    {alerta.texto}
                                </div>
                                <button 
                                    onClick={() => handleConsultarAlertaIA(alerta)}
                                    className={`flex items-center justify-center gap-2 py-1.5 px-3 rounded-md font-semibold text-xs transition-colors shadow-sm ${alerta.tipo === 'critico' ? 'bg-red-600 hover:bg-red-700 text-white' : 'bg-amber-600 hover:bg-amber-700 text-white'}`}
                                >
                                    <Sparkles className="w-3 h-3" /> Consultar Zootecnista IA
                                </button>
                            </div>
                        ))
                    )}
                </div>
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
        <div className="p-6 max-w-7xl mx-auto space-y-6 animate-fade-in">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold text-slate-800">Lotes e Galpões</h1>
                {!isAdding && (
                    <button onClick={() => setIsAdding(true)} className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 shadow transition-colors">
                        <PlusCircle className="w-5 h-5" /> Novo Lote
                    </button>
                )}
            </div>

            {isAdding && (
                <div className="bg-white p-6 rounded-xl shadow-sm border border-emerald-200 mb-8">
                    <h2 className="text-lg font-bold mb-4 text-emerald-800">Cadastrar Novo Lote/Galpão</h2>
                    <form onSubmit={handleAdd} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        <div><label className="block text-sm font-medium text-slate-700">Identificação (Nome)</label><input required type="text" value={novoGalpao.nome} onChange={e => setNovoGalpao({...novoGalpao, nome: e.target.value})} className="w-full p-2 border border-slate-300 rounded focus:ring-emerald-500" /></div>
                        <div><label className="block text-sm font-medium text-slate-700">Data de Entrada</label><input required type="date" value={novoGalpao.dataEntrada} onChange={e => setNovoGalpao({...novoGalpao, dataEntrada: e.target.value})} className="w-full p-2 border border-slate-300 rounded focus:ring-emerald-500" /></div>
                        <div><label className="block text-sm font-medium text-slate-700">Aves Iniciais</label><input required type="number" value={novoGalpao.aves} onChange={e => setNovoGalpao({...novoGalpao, aves: e.target.value})} className="w-full p-2 border border-slate-300 rounded focus:ring-emerald-500" /></div>
                        <div><label className="block text-sm font-medium text-slate-700">Idade (Semanas)</label><input required type="number" value={novoGalpao.idade} onChange={e => setNovoGalpao({...novoGalpao, idade: e.target.value})} className="w-full p-2 border border-slate-300 rounded focus:ring-emerald-500" /></div>
                        <div><label className="block text-sm font-medium text-slate-700">Sistema</label>
                            <select value={novoGalpao.sistema} onChange={e => setNovoGalpao({...novoGalpao, sistema: e.target.value})} className="w-full p-2 border border-slate-300 rounded focus:ring-emerald-500">
                                <option value="GAIOLA">Gaiolas</option><option value="CAGE_FREE">Cage Free (Piso)</option>
                            </select>
                        </div>
                        {novoGalpao.sistema === 'CAGE_FREE' && (
                            <div><label className="block text-sm font-medium text-slate-700">Área Útil (m²)</label><input required type="number" value={novoGalpao.area} onChange={e => setNovoGalpao({...novoGalpao, area: e.target.value})} className="w-full p-2 border border-slate-300 rounded focus:ring-emerald-500" /></div>
                        )}
                        <div className="lg:col-span-3 flex justify-end gap-3 mt-2">
                            <button type="button" onClick={() => setIsAdding(false)} className="px-4 py-2 text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg">Cancelar</button>
                            <button type="submit" className="px-6 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700">Salvar Cadastro</button>
                        </div>
                    </form>
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {galpoes.map(g => (
                    <div key={g.id} className="bg-white p-5 rounded-xl shadow-sm border border-slate-200 hover:shadow-md transition-shadow relative overflow-hidden">
                        <div className={`absolute top-0 left-0 w-1 h-full ${g.sistema === 'CAGE_FREE' ? 'bg-green-500' : 'bg-blue-500'}`}></div>
                        <div className="flex justify-between items-start mb-4">
                            <h3 className="font-bold text-lg text-slate-800">{g.nome}</h3>
                            <span className={`px-2 py-1 text-xs font-semibold rounded-full ${g.sistema === 'CAGE_FREE' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'}`}>
                                {g.sistema === 'CAGE_FREE' ? 'Cage Free' : 'Gaiolas'}
                            </span>
                        </div>
                        <div className="space-y-2 text-sm text-slate-600">
                            <p><strong>Aves Alojadas:</strong> {g.avesAlojadas.toLocaleString('pt-BR')} un</p>
                            <p><strong>Idade Entrada:</strong> {g.idadeSemanas} semanas</p>
                            <p><strong>Data Entrada:</strong> {new Date(g.dataEntrada).toLocaleDateString('pt-BR')}</p>
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
    
    // Estados do Formulário
    const [mortProlapso, setMortProlapso] = useState('');
    const [mortCanibalismo, setMortCanibalismo] = useState('');
    const [mortNatural, setMortNatural] = useState('');
    const [mortSubita, setMortSubita] = useState('');
    const [ovosTotal, setOvosTotal] = useState('');
    const [pesoMedio, setPesoMedio] = useState('');
    const [racaoFornecida, setRacaoFornecida] = useState('');
    const [sobraRacao, setSobraRacao] = useState('');
    const [precoRacao, setPrecoRacao] = useState(''); // Novo Campo Financeiro
    
    const [mensagem, setMensagem] = useState({ tipo: '', texto: '' });

    const handleSubmit = (e) => {
      e.preventDefault();
      const mortalidadeTotal = Number(mortProlapso) + Number(mortCanibalismo) + Number(mortNatural) + Number(mortSubita);
      
      const novaColeta = {
        id: `c${Date.now()}`,
        galpaoId,
        data,
        mortalidadeTotal,
        ovosTotal: Number(ovosTotal),
        pesoMedio: Number(pesoMedio),
        racaoFornecida: Number(racaoFornecida),
        sobra: Number(sobraRacao),
        precoRacao: Number(precoRacao)
      };

      setColetas([...coletas, novaColeta]);
      setMensagem({ tipo: 'sucesso', texto: 'Apontamento diário registrado com sucesso!' });
      
      setOvosTotal(''); setRacaoFornecida(''); setSobraRacao(''); setMortProlapso(''); setMortCanibalismo(''); setMortNatural(''); setMortSubita('');
      setTimeout(() => setMensagem({ tipo: '', texto: '' }), 4000);
    };

    return (
      <div className="p-6 max-w-4xl mx-auto space-y-6 animate-fade-in">
        <h1 className="text-3xl font-bold text-slate-800">Apontamento Diário</h1>
        {mensagem.texto && (
          <div className="p-4 rounded-lg font-medium bg-green-100 text-green-800 border border-green-200 shadow-sm flex items-center gap-2">
            <ClipboardList className="w-5 h-5" /> {mensagem.texto}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
            <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2 border-b pb-2"><ClipboardList className="w-5 h-5 text-emerald-600" /> 1. Identificação</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Galpão</label>
                <select value={galpaoId} onChange={(e) => setGalpaoId(e.target.value)} className="w-full p-2 border border-slate-300 rounded-lg bg-slate-50">
                  {galpoes.map(g => <option key={g.id} value={g.id}>{g.nome}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Data da Coleta</label>
                <input required type="date" value={data} onChange={(e) => setData(e.target.value)} className="w-full p-2 border border-slate-300 rounded-lg" />
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
            <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2 border-b pb-2"><Egg className="w-5 h-5 text-yellow-500" /> 2. Produção e Nutrição</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div><label className="block text-sm font-medium text-slate-700 mb-1">Ovos (Qtd)</label><input required type="number" value={ovosTotal} onChange={(e) => setOvosTotal(e.target.value)} className="w-full p-2 border border-slate-300 rounded-lg" placeholder="Ex: 4100" /></div>
              <div><label className="block text-sm font-medium text-slate-700 mb-1">Peso Médio (g)</label><input required type="number" step="0.1" value={pesoMedio} onChange={(e) => setPesoMedio(e.target.value)} className="w-full p-2 border border-slate-300 rounded-lg" placeholder="Ex: 62.5" /></div>
              <div><label className="block text-sm font-medium text-slate-700 mb-1">Ração Fornecida (kg)</label><input required type="number" step="0.1" value={racaoFornecida} onChange={(e) => setRacaoFornecida(e.target.value)} className="w-full p-2 border border-slate-300 rounded-lg" placeholder="Ex: 520" /></div>
              <div><label className="block text-sm font-medium text-slate-700 mb-1">Sobra de Ração (kg)</label><input type="number" step="0.1" value={sobraRacao} onChange={(e) => setSobraRacao(e.target.value)} className="w-full p-2 border border-slate-300 rounded-lg" placeholder="Ex: 5" /></div>
            </div>
            
            <div className="mt-4 p-4 bg-emerald-50 rounded-lg border border-emerald-100 flex items-center gap-4">
                <DollarSign className="w-8 h-8 text-emerald-600" />
                <div className="flex-1">
                    <label className="block text-sm font-bold text-emerald-800 mb-1">Preço da Ração (R$/kg) <span className="text-xs font-normal text-emerald-600">- Opcional para cálculo de custos</span></label>
                    <input type="number" step="0.01" value={precoRacao} onChange={(e) => setPrecoRacao(e.target.value)} className="w-full md:w-1/3 p-2 border border-emerald-200 rounded-lg focus:ring-emerald-500" placeholder="Ex: 2.15" />
                </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
             <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2 border-b pb-2"><Bird className="w-5 h-5 text-red-500" /> 3. Mortalidade Diária</h2>
             <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div><label className="block text-sm font-medium text-slate-700">Prolapso</label><input type="number" min="0" value={mortProlapso} onChange={(e) => setMortProlapso(e.target.value)} className="w-full p-2 border border-slate-300 rounded-lg" /></div>
                <div><label className="block text-sm font-medium text-slate-700">Canibalismo</label><input type="number" min="0" value={mortCanibalismo} onChange={(e) => setMortCanibalismo(e.target.value)} className="w-full p-2 border border-slate-300 rounded-lg" /></div>
                <div><label className="block text-sm font-medium text-slate-700">Morte Natural</label><input type="number" min="0" value={mortNatural} onChange={(e) => setMortNatural(e.target.value)} className="w-full p-2 border border-slate-300 rounded-lg" /></div>
                <div><label className="block text-sm font-medium text-slate-700">Súbita</label><input type="number" min="0" value={mortSubita} onChange={(e) => setMortSubita(e.target.value)} className="w-full p-2 border border-slate-300 rounded-lg" /></div>
             </div>
          </div>

          <div className="flex justify-end">
             <button type="submit" className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 px-8 rounded-xl shadow-lg transition-transform hover:scale-105 flex items-center gap-2">
                 <ClipboardList className="w-5 h-5" /> Salvar Apontamento
             </button>
          </div>
        </form>
      </div>
    );
  };

  const RelatoriosView = () => {
    const [selectedGalpao, setSelectedGalpao] = useState(galpoes.length > 0 ? galpoes[0].id : '');
    const galpao = galpoes.find(g => g.id === selectedGalpao);
    
    const dadosGalpao = coletas
        .filter(c => c.galpaoId === selectedGalpao)
        .sort((a,b) => new Date(a.data) - new Date(b.data));

    if (!galpao || dadosGalpao.length === 0) {
        return (
            <div className="p-6 max-w-7xl mx-auto space-y-6">
                <h1 className="text-3xl font-bold text-slate-800 mb-6">Índices Zootécnicos</h1>
                <select value={selectedGalpao} onChange={(e) => setSelectedGalpao(e.target.value)} className="w-full max-w-md p-2 border border-slate-300 rounded-lg mb-4">
                    {galpoes.map(g => <option key={g.id} value={g.id}>{g.nome}</option>)}
                </select>
                <div className="p-8 bg-white border border-slate-200 rounded-xl text-center text-slate-500">Nenhum dado zootécnico registrado para este galpão ainda.</div>
            </div>
        );
    }

    const ultimaColeta = dadosGalpao[dadosGalpao.length - 1];
    const avesVivasHoje = calcularAvesVivasNaData(selectedGalpao, ultimaColeta.data);
    const avesSeguras = avesVivasHoje > 0 ? avesVivasHoje : 1;

    // Fórmulas Zootécnicas
    const producaoOvosPorcentagem = (ultimaColeta.ovosTotal / avesSeguras) * 100;
    const consumoTotalDiarioKg = ultimaColeta.racaoFornecida - (ultimaColeta.sobra || 0);
    const consumoMedioGramas = (consumoTotalDiarioKg * 1000) / avesSeguras;
    
    const pesoTotalOvosKg = (ultimaColeta.ovosTotal * ultimaColeta.pesoMedio) / 1000;
    const conversaoAlimentarKgKg = pesoTotalOvosKg > 0 ? (consumoTotalDiarioKg / pesoTotalOvosKg) : 0;
    const conversaoAlimentarDz = ultimaColeta.ovosTotal > 0 ? (consumoTotalDiarioKg / (ultimaColeta.ovosTotal / 12)) : 0;

    // Fórmulas Financeiras
    const custoRacaoDia = consumoTotalDiarioKg * (ultimaColeta.precoRacao || 0);
    const duziasProduzidas = ultimaColeta.ovosTotal / 12;
    const custoAlimentarPorDuzia = duziasProduzidas > 0 ? (custoRacaoDia / duziasProduzidas) : 0;

    const mortalidadeTotalLote = dadosGalpao.reduce((acc, c) => acc + c.mortalidadeTotal, 0);
    const viabilidade = ((galpao.avesAlojadas - mortalidadeTotalLote) / galpao.avesAlojadas) * 100;

    const handleGerarParecerIA = () => {
        const systemInstruction = "Você é um Zootecnista sênior, especialista em gestão técnica de granjas de postura. Sua função é avaliar os índices zootécnicos e financeiros do lote atual. Forneça um parecer claro: se está bom, ruim, e dê recomendações construtivas e realistas (manejo, ração, luz, etc). Estruture em tópicos breves para fácil leitura no celular.";
        const prompt = `Gere um Parecer Zootécnico para o seguinte lote de postura (Data base: ${ultimaColeta.data}):\nLote: ${galpao.nome}\nIdade inicial: ${galpao.idadeSemanas} semanas\nViabilidade: ${viabilidade.toFixed(2)}%\nProdução Atual: ${producaoOvosPorcentagem.toFixed(1)}%\nConsumo Médio: ${consumoMedioGramas.toFixed(1)} g/ave\nConversão Alimentar: ${conversaoAlimentarKgKg.toFixed(3)} kg/kg massa\nCusto Alimentar (se informado): R$ ${custoAlimentarPorDuzia.toFixed(2)} por dúzia. Analise o que significa essa CA e produção. Há indicativo de desperdício? Como otimizar?`;
        callGeminiIA(prompt, systemInstruction, `Parecer Técnico Zootécnico - ${galpao.nome}`);
    };

    return (
      <div className="p-6 max-w-7xl mx-auto space-y-6 animate-fade-in">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
            <h1 className="text-3xl font-bold text-slate-800">Índices e Desempenho</h1>
            <select value={selectedGalpao} onChange={(e) => setSelectedGalpao(e.target.value)} className="w-full md:w-auto min-w-[250px] p-2 border border-emerald-300 rounded-lg bg-emerald-50 text-emerald-900 font-semibold focus:ring-emerald-500 shadow-sm">
                {galpoes.map(g => <option key={g.id} value={g.id}>{g.nome}</option>)}
            </select>
        </div>
        
        <div className="flex justify-between items-center mb-2">
            <h2 className="text-lg font-bold text-slate-600">Desempenho Atual ({ultimaColeta.data.split('-').reverse().join('/')})</h2>
            <button 
                onClick={handleGerarParecerIA}
                className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 px-4 rounded-lg shadow-md transition-all flex items-center gap-2 text-sm"
            >
                <Sparkles className="w-4 h-4" /> Gerar Parecer Zootécnico (IA)
            </button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <StatCard title="Viabilidade do Lote" value={`${viabilidade.toFixed(2)}%`} icon={<Activity />} color={viabilidade >= 98 ? "text-emerald-600" : "text-amber-500"} bg="bg-white border border-slate-200" />
            <StatCard title="Produção" value={`${producaoOvosPorcentagem.toFixed(1)}%`} icon={<Egg />} color="text-yellow-600" bg="bg-white border border-slate-200" />
            <StatCard title="Consumo Médio" value={`${consumoMedioGramas.toFixed(1)} g/ave`} icon={<Scale />} color="text-blue-600" bg="bg-white border border-slate-200" />
            
            <div className="bg-white border border-slate-200 p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow">
                <p className="text-sm font-medium text-slate-600 mb-1">Conversão Alimentar</p>
                <div className="flex flex-col">
                    <span className="text-xl font-bold text-slate-800">{conversaoAlimentarKgKg.toFixed(3)} <span className="text-sm font-normal text-slate-500">kg/kg massa</span></span>
                    <span className="text-md font-semibold text-slate-600">{conversaoAlimentarDz.toFixed(3)} <span className="text-xs font-normal text-slate-500">kg/dúzia</span></span>
                </div>
            </div>
        </div>

        {ultimaColeta.precoRacao > 0 && (
            <div className="bg-emerald-50 border border-emerald-200 p-6 rounded-xl shadow-sm mb-8">
                <h2 className="text-lg font-bold text-emerald-800 mb-4 flex items-center gap-2"><DollarSign className="w-5 h-5" /> Indicadores Financeiros (Custo Alimentar)</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div><p className="text-sm font-medium text-emerald-600">Preço da Ração Informado</p><p className="text-2xl font-bold text-emerald-900">R$ {ultimaColeta.precoRacao.toFixed(2)} <span className="text-sm font-normal">/kg</span></p></div>
                    <div><p className="text-sm font-medium text-emerald-600">Custo Total em Ração (Dia)</p><p className="text-2xl font-bold text-emerald-900">R$ {custoRacaoDia.toFixed(2)}</p></div>
                    <div className="bg-white p-4 rounded-lg shadow-inner border border-emerald-100">
                        <p className="text-sm font-bold text-slate-600">Custo Alimentar p/ Dúzia</p>
                        <p className="text-3xl font-black text-emerald-600">R$ {custoAlimentarPorDuzia.toFixed(2)}</p>
                    </div>
                </div>
            </div>
        )}
      </div>
    );
  };

  const AssistenteView = () => {
    const [pergunta, setPergunta] = useState("");
    const [resposta, setResposta] = useState("");
    const [loading, setLoading] = useState(false);

    const handleAsk = async (e) => {
      e.preventDefault();
      if (!pergunta.trim()) return;
      setLoading(true);
      setResposta("");
      
      try {
          const payload = {
              contents: [{ parts: [{ text: pergunta }] }],
              systemInstruction: { parts: [{ text: "Você é um especialista em avicultura de postura (Zootecnista/Veterinário). Responda dúvidas de produtores com clareza, dicas práticas de manejo, ambiência e nutrição. Formate em tópicos curtos e diretos focados na solução." }] }
          };
          
          const url = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${apiKey}`;
          const data = await fetchWithBackoff(url, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(payload)
          });

          const generatedText = data.candidates?.[0]?.content?.parts?.[0]?.text;
          if (generatedText) {
              setResposta(generatedText);
          } else {
              throw new Error("Resposta inválida");
          }
      } catch (error) {
          setResposta("⚠️ Erro ao contatar a IA. Verifique sua conexão e tente novamente.");
      } finally {
          setLoading(false);
      }
    };

    return (
      <div className="p-6 max-w-4xl mx-auto space-y-6 animate-fade-in">
        <h1 className="text-3xl font-bold text-slate-800 flex items-center gap-3">
           <Bot className="w-8 h-8 text-indigo-600" />
           Consultoria Zootécnica IA
        </h1>
        <p className="text-slate-600 text-lg">Descreva sintomas das aves, dúvidas sobre formulação de ração, manejo de ambiência ou sanidade. Nosso Assistente Virtual analisará seu caso e fornecerá recomendações precisas ✨.</p>
        
        <form onSubmit={handleAsk} className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
           <label className="block text-sm font-medium text-slate-700 mb-2">Sua Dúvida ou Problema no Lote</label>
           <textarea 
             value={pergunta}
             onChange={(e) => setPergunta(e.target.value)}
             placeholder="Ex: Minhas aves estão com 45 semanas, a produção caiu 10% nos últimos 3 dias e notei fezes esverdeadas. O que pode ser e como devo proceder com o manejo?"
             className="w-full p-4 border border-slate-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 min-h-[120px] resize-none"
           />
           <div className="flex justify-end mt-4">
               <button disabled={loading || !pergunta.trim()} type="submit" className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-lg flex items-center gap-2 disabled:opacity-50 transition-colors shadow font-semibold">
                  {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
                  {loading ? 'Analisando caso...' : '✨ Perguntar ao Especialista'}
               </button>
           </div>
        </form>

        {resposta && (
           <div className="bg-indigo-50 border border-indigo-100 p-6 rounded-xl shadow-sm animate-fade-in whitespace-pre-wrap text-slate-800 leading-relaxed text-sm md:text-base">
              <div className="flex items-center gap-2 mb-4 text-indigo-800 font-bold border-b border-indigo-200 pb-2">
                  <Sparkles className="w-5 h-5" /> Parecer do Assistente IA
              </div>
              {resposta}
           </div>
        )}
      </div>
    );
  };

  const StatCard = ({ title, value, icon, color, bg }) => (
    <div className={`${bg} p-6 rounded-xl shadow-sm flex items-start gap-4 hover:shadow-md transition-shadow`}>
      <div className={`p-3 rounded-lg bg-slate-50 ${color}`}>{React.cloneElement(icon, { className: 'w-6 h-6' })}</div>
      <div><p className="text-sm font-medium text-slate-600 mb-1">{title}</p><h3 className="text-2xl font-bold text-slate-800">{value}</h3></div>
    </div>
  );

  return (
    <div className="flex bg-slate-50 min-h-screen font-sans relative">
      <Sidebar />
      <div className="md:hidden fixed top-0 left-0 right-0 h-16 bg-emerald-800 text-white flex items-center px-4 z-10 shadow-md">
          <button onClick={() => setIsMobileMenuOpen(true)} className="p-2 -ml-2"><Menu className="w-6 h-6" /></button>
          <span className="ml-2 font-bold text-lg tracking-wide">AveGest</span>
      </div>
      <main className="flex-1 overflow-x-hidden overflow-y-auto pt-16 md:pt-0 relative">
        {activeTab === 'dashboard' && <DashboardView />}
        {activeTab === 'galpoes' && <GalpoesView />}
        {activeTab === 'coleta' && <ColetaDiariaView />}
        {activeTab === 'relatorios' && <RelatoriosView />}
        {activeTab === 'assistente' && <AssistenteView />}
      </main>

      {/* --- MODAL DA INTELIGÊNCIA ARTIFICIAL --- */}
      {aiModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[85vh] flex flex-col overflow-hidden animate-fade-in">
                <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-indigo-50">
                    <div className="flex items-center gap-3 text-indigo-700">
                        <Bot className="w-6 h-6" />
                        <h3 className="font-bold text-lg">{aiContextTitle}</h3>
                    </div>
                    <button onClick={() => setAiModalOpen(false)} className="text-slate-400 hover:text-slate-600 p-1"><X className="w-6 h-6" /></button>
                </div>
                <div className="p-6 overflow-y-auto flex-1 bg-white text-slate-700 leading-relaxed text-sm md:text-base">
                    {aiLoading ? (
                        <div className="flex flex-col items-center justify-center py-12 text-indigo-600">
                            <Loader2 className="w-10 h-10 animate-spin mb-4" />
                            <p className="font-medium animate-pulse">O Zootecnista Virtual está analisando os dados...</p>
                            <p className="text-xs text-slate-400 mt-2">Consultando modelos zootécnicos avançados</p>
                        </div>
                    ) : (
                        <div className="whitespace-pre-wrap">
                            <div className="flex items-start gap-3 p-4 mb-4 bg-blue-50 text-blue-800 rounded-lg border border-blue-100">
                                <Info className="w-5 h-5 mt-0.5 flex-shrink-0" />
                                <p className="text-xs leading-tight">Este parecer foi gerado por Inteligência Artificial (Gemini) e não substitui uma visita técnica presencial. Recomenda-se acompanhamento veterinário local para diagnósticos clínicos.</p>
                            </div>
                            {aiResponse}
                        </div>
                    )}
                </div>
                <div className="p-4 border-t border-slate-100 bg-slate-50 flex justify-end">
                    <button onClick={() => setAiModalOpen(false)} className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg shadow transition-colors">
                        Fechar Laudo
                    </button>
                </div>
            </div>
        </div>
      )}
    </div>
  );
}
