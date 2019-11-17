/**
 * http://usejsdoc.org/
 */

var chart = [{"department":"Diretoria Colegiada",	"sections":[
															{"section":"Diretoria", "functions": ["Diretor"]},															
															{"section":"Coordenação de Período", "functions":  ["Coordenador"]}
														]
			},
			{"department":"Administração",	"sections":[
												{"section":"Diretoria", "functions": ["Diretor"]},
												{"section":"Coordenação", "functions":  ["Coordenador"]},
												{"section":"Secretaria", "functions":  ["Colaborador"]},
												{"section":"Eventos", "functions":  ["Coordenador","Colaborador"]},
												{"section":"Manutenção", "functions": ["Colaborador"]},
												{"section": "TI" , "functions":  ["Colaborador"]}
											]
		     },
		     {"department":"Atendimento Espiritual",	"sections":[
					{"section":"Diretoria", "functions": ["Diretor"]},
					{"section":"Coordenação", "functions":  ["Coordenador"]},
					{"section":"Recepção", "functions":  ["Coordenador","Colaborador"]},
					{"section":"Fluidoterapia", "functions":  ["Coordenador","Colaborador"]},
					{"section":"Irradiação", "functions": ["Coordenador","Colaborador"]},
					{"section": "Diálogo Fraterno em Grupo" , "functions":  ["Coordenador","Colaborador"]},
					{"section": "Atendimento Inicial" , "functions":  ["Coordenador","Colaborador"]},
					{"section": "Explanação Evangélica" , "functions":  ["Coordenador","Colaborador"]},
					{"section": "Evangelho no Lar" , "functions":  ["Coordenador","Colaborador"]},
					{"section": "Atendimento Fraterno Por Meio do Diálogo" , "functions":  ["Coordenador","Colaborador"]}
				]
		     },
		     {"department":"Assistência Social Espírita",	"sections":[
					{"section":"Diretoria", "functions": ["Diretor"]},
					{"section":"Coordenação", "functions":  ["Coordenador"]},
					{"section":"Colaboração", "functions":  ["Colaborador"]}					
				]
		     },
		     {"department":"Estudo e Prática da Mediunidade",	"sections":[
					{"section":"Diretoria", "functions": ["Diretor"]},
					{"section":"Coordenação", "functions":  ["Coordenador"]},
					{"section":"Grupo de Trabalho", "functions":  ["Coordenador","Colaborador"]},
					{"section":"Estudo da Mediunidade", "functions":  ["Coordenador"]}
				]
		     },
		     {"department":"Estudos Doutrinários",	"sections":[
					{"section":"Diretoria", "functions": ["Diretor"]},
					{"section":"Coordenação", "functions":  ["Coordenador"]},
					{"section":"EIDE I", "functions":  ["Coordenador"]},
					{"section":"EIDE II", "functions":  ["Coordenador"]},
					{"section":"ESDE I", "functions":  ["Coordenador"]},
					{"section":"ESDE II", "functions":  ["Coordenador"]},
					{"section":"EADE", "functions":  ["Coordenador"]},
					{"section":"Grupo de Estudo da Codificação Espírita (GECE)", "functions":  ["Coordenador"]},
					{"section":"Estudo das Obras de André Luiz", "functions":  ["Coordenador"]},
					{"section":"Estudo da Série Psic. de Joanna de Ângelis", "functions":  ["Coordenador"]}
				]
		     },
		     {"department":"Conselho Fiscal", "sections":[
					{"section":"Coordenação", "functions":  ["Coordenador","Colaborador"]}
				]
		     },
		     {"department":"Comunicação",	"sections":[
					{"section":"Diretoria", "functions": ["Diretor"]},
					{"section":"Coordenação", "functions":  ["Coordenador"]},
					{"section":"Colaboração", "functions":  ["Colaborador"]}					
				]
		     },
		     {"department":"Infância e Juventude",	"sections":[
					{"section":"Diretoria", "functions": ["Diretor"]},
					{"section":"Coordenação", "functions":  ["Coordenador"]},
					{"section":"Infância 1", "functions":  ["Coordenador","Colaborador","Estágio"]},
					{"section":"Infância 2", "functions":  ["Coordenador","Colaborador","Estágio"]},
					{"section":"Primeiro Ciclo", "functions":  ["Coordenador","Colaborador","Estágio"]},
					{"section":"Segundo Ciclo", "functions":  ["Coordenador","Colaborador","Estágio"]},
					{"section":"Terceiro Ciclo", "functions":  ["Coordenador","Colaborador","Estágio"]},
					{"section":"Juventude 1", "functions":  ["Coordenador","Colaborador","Estágio"]},
					{"section":"Juventude 2", "functions":  ["Coordenador","Colaborador","Estágio"]}
				]
		     }		     
];

var studySectionDepartment = [
	{"section":"EIDE I","department":"Estudos Doutrinários"},
	{"section":"EIDE II","department":"Estudos Doutrinários"},
	{"section":"ESDE I","department":"Estudos Doutrinários"},
	{"section":"ESDE II","department":"Estudos Doutrinários"},
	{"section":"EADE","department":"Estudos Doutrinários"},
	{"section":"Estudo da Codificação Espírita","department":"Estudos Doutrinários"},
	{"section":"Estudo das Obras de André Luiz","department":"Estudos Doutrinários"},
	{"section":"Estudo da Mediunidade","department":"Estudo e Prática da Mediunidade"},
	{"section":"Estudo da Evangelização - Infância 1","department":"Estudos Doutrinários"},
	{"section":"Estudo da Evangelização - Infância 2","department":"Estudos Doutrinários"},							
	{"section":"Estudo da Evangelização - Primeiro Ciclo","department":"Estudos Doutrinários"},
	{"section":"Estudo da Evangelização - Segundo Ciclo","department":"Estudos Doutrinários"},		
	{"section":"Estudo da Evangelização - Terceiro Ciclo","department":"Estudos Doutrinários"},					
	{"section":"Estudo da Evangelização - Juventude 1","department":"Estudos Doutrinários"},
	{"section":"Estudo da Evangelização - Juventude 2","department":"Estudos Doutrinários"},
	{"section":"Estudo do Evangelho","department":"Estudos Doutrinários"},
	{"section":"Estudo da série psic. Joanna de Ângelis","department":"Estudos Doutrinários"},
	{"section":"Infância 1", "department":"Infância e Juventude"},
	{"section":"Infância 2", "department":"Infância e Juventude"},
	{"section":"Primeiro Ciclo", "department":"Infância e Juventude"},
	{"section":"Segundo Ciclo", "department":"Infância e Juventude"},
	{"section":"Terceiro Ciclo", "department":"Infância e Juventude"},
	{"section":"Juventude 1", "department":"Infância e Juventude"},
	{"section":"Juventude 2","department":"Infância e Juventude"}
]