// Dados padrao para o AvesGest PRO

export const racasPoedeiras = [
  'Hy-Line Brown',
  'Lohmann Brown',
  'Isa Brown',
  'Dekalb White',
  'Lohmann White',
  'Hisex Brown',
  'Hisex White',
  'Novogen Brown',
  'Nick Chick',
  'Outra'
]

export const fasesProducao = [
  'Cria (1-6 semanas)',
  'Recria (7-18 semanas)',
  'Pre-postura (18-20 semanas)',
  'Postura Inicial (21-40 semanas)',
  'Postura Pico (41-60 semanas)',
  'Postura Final (61-80 semanas)',
  'Descarte'
]

export const tiposMortalidade = [
  'Doenca Respiratoria',
  'Doenca Digestiva',
  'Doenca Neurologica',
  'Trauma / Acidente',
  'Calor',
  'Fome / Desidratacao',
  'Cannibalismo',
  'Causa Desconhecida',
  'Outra'
]

export const vacinas = [
  'Newcastle',
  'Bronquite Infecciosa',
  'Gumboro (Doenca de Gumboro)',
  'Marek',
  'Laringotraqueira Infecciosa',
  'Variola Aviaria',
  'Encefalomielite Aviaria',
  'Coriza Infecciosa',
  'Micoplasmose',
  'Salmonela',
  'Outra'
]

export const motivoDescarte = [
  'Fim de vida produtiva',
  'Baixa producao',
  'Problema sanitario',
  'Problema locomotor',
  'Problema reprodutivo',
  'Excesso de machos',
  'Outro'
]

export const tiposInsumo = [
  'Racao Inicial',
  'Racao Crescimento',
  'Racao Pre-Postura',
  'Racao Postura',
  'Nucleo / Premix',
  'Milho',
  'Farelo de Soja',
  'Calcario',
  'Fosfato',
  'Sal',
  'Medicamento',
  'Vacina',
  'Desinfetante',
  'Material de Cama',
  'Embalagem',
  'Outro'
]

export const categoriasDespesa = [
  'Alimentacao',
  'Sanidade',
  'Mao de obra',
  'Energia eletrica',
  'Agua',
  'Manutencao',
  'Embalagem',
  'Transporte',
  'Impostos',
  'Outros'
]

export const categoriasReceita = [
  'Venda de ovos',
  'Venda de aves de descarte',
  'Venda de cama de frango',
  'Outros'
]

export const classificacaoOvos = [
  'Extra (acima de 63g)',
  'Grande (53-63g)',
  'Medio (43-53g)',
  'Pequeno (abaixo de 43g)',
  'Industrial / Trincado',
  'Descarte'
]

export const defaultAppData = {
  lotes: [],
  anotacoes: [],
  insumos: [],
  registrosOvos: [],
  registrosMortalidade: [],
  registrosSanidade: [],
  registrosDescarte: [],
  financeiro: [],
  pesagens: [],
  configuracoes: {
    nomeGranja: '',
    responsavel: '',
    cidade: '',
    estado: '',
    moeda: 'BRL'
  }
}
