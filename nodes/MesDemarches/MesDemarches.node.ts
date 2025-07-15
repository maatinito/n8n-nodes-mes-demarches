import type {
	IExecuteFunctions,
	INodeExecutionData,
	INodeType,
	INodeTypeDescription,
	IRequestOptions,
} from 'n8n-workflow';
import { NodeConnectionType, NodeOperationError } from 'n8n-workflow';

export class MesDemarches implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'Mes-Démarches',
		name: 'mesDemarches',
		icon: 'file:mes-demarches.svg',
		group: ['input'],
		version: 1,
		subtitle: '={{$parameter["operation"]}}',
		description: 'Interagit avec l\'API mes-démarches (Polynésie française)',
		defaults: {
			name: 'Mes-Démarches',
		},
		inputs: [NodeConnectionType.Main],
		outputs: [
			{
				displayName: 'Main',
				type: NodeConnectionType.Main,
			},
		],
		credentials: [
			{
				name: 'mesDemarchesApi',
				required: true,
			},
		],
		properties: [
			{
				displayName: 'Opération',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				options: [
					{
						name: 'Consulter Un Dossier',
						value: 'getDossier',
						description: 'Récupérer les informations complètes d\'un dossier',
						action: 'Consulter un dossier',
					},
					{
						name: 'Consulter Une Démarche',
						value: 'getDemarche',
						description: 'Récupérer les informations d\'une démarche',
						action: "Consulter une démarche",
					},
					{
						name: 'Envoyer Un Message',
						value: 'envoyerMessage',
						description: 'Envoyer un message à l\'usager',
						action: "Envoyer un message à l'usager",
					},
					{
						name: 'Gérer L\'erreur',
						value: 'handleError',
						description: 'Revient au timestamp précédent pour retraiter après échec (workflow d\'erreur)',
						action: "Gérer l'erreur de synchronisation",
					},
					{
						name: 'Lister Les Dossiers',
						value: 'listDossiers',
						description: 'Récupérer les dossiers d\'une démarche avec synchronisation intelligente',
						action: "Lister les dossiers d'une démarche",
					},
					{
						name: 'Modifier Statut Dossier',
						value: 'modifierStatutDossier',
						description: 'Changer l\'état d\'un dossier de manière dynamique (accepter, refuser, etc.)',
						action: "Modifier le statut d'un dossier",
					},
					{
						name: 'Modifier Une Annotation',
						value: 'modifierAnnotation',
						description: 'Modifier une annotation privée',
						action: "Modifier une annotation privée",
					},
				],
				default: 'listDossiers',
			},
			// Paramètres pour getDossier - placés en tête
			{
				displayName: 'Numéro De Dossier',
				name: 'dossierNumber',
				type: 'number',
				displayOptions: {
					show: {
						operation: ['getDossier'],
					},
				},
				default: '',
				placeholder: '456',
				description: 'Numéro du dossier à consulter',
				required: true,
			},
			// Paramètres pour listDossiers
			{
				displayName: 'Numéro De Démarche',
				name: 'demarcheNumber',
				type: 'number',
				displayOptions: {
					show: {
						operation: ['listDossiers', 'getDemarche'],
					},
				},
				default: '',
				placeholder: '123',
				description: 'Numéro de la démarche à consulter',
				required: true,
			},
			{
				displayName: 'Modifiés Depuis',
				name: 'modifiedSince',
				type: 'options',
				displayOptions: {
					show: {
						operation: ['listDossiers'],
					},
				},
				options: [
					{
						name: 'La Dernière Fois',
						value: 'last_run',
						description: 'Récupère les dossiers non encore traités (recommandé)',
					},
					{
						name: 'Cette Date',
						value: 'specific_date',
						description: 'Récupère depuis une date que je choisis',
					},
					{
						name: 'Le Début',
						value: 'beginning',
						description: 'Récupère tous les dossiers depuis le début',
					},
				],
				default: 'last_run',
			},
			{
				displayName: 'Date De Début',
				name: 'sinceDate',
				type: 'dateTime',
				displayOptions: {
					show: {
						operation: ['listDossiers'],
						modifiedSince: ['specific_date'],
					},
				},
				default: '',
				description: 'Récupérer les dossiers modifiés depuis cette date',
				required: true,
			},
			{
				displayName: 'État Des Dossiers',
				name: 'state',
				type: 'options',
				displayOptions: {
					show: {
						operation: ['listDossiers'],
					},
				},
				options: [
					{ name: 'Accepté', value: 'accepte' },
					{ name: 'Classé Sans Suite', value: 'sans_suite' },
					{ name: 'En Construction', value: 'en_construction' },
					{ name: 'En Instruction', value: 'en_instruction' },
					{ name: 'Refusé', value: 'refuse' },
					{ name: 'Tous Les États', value: '' },
				],
				default: '',
				description: 'Filtrer les dossiers par état',
			},
			{
				displayName: 'Format De Sortie',
				name: 'outputFormat',
				type: 'options',
				displayOptions: {
					show: {
						operation: ['listDossiers', 'getDossier'],
					},
				},
				options: [
					{
						name: 'Simplifié',
						value: 'simplified',
						description: 'Format aplati pour intégration (recommandé)',
					},
					{
						name: 'Complet',
						value: 'complete',
						description: 'Objets GraphQL complets avec métadonnées',
					},
				],
				default: 'simplified',
			},
			{
				displayName: 'Inclure',
				name: 'includeOptions',
				type: 'multiOptions',
				displayOptions: {
					show: {
						operation: ['listDossiers'],
					},
				},
				options: [
					{ name: 'Avis', value: 'avis' },
					{ name: 'Champs Et Annotations', value: 'champs' },
					{ name: 'Corrections', value: 'corrections' },
					{ name: 'Géométrie', value: 'geometry' },
					{ name: 'Instructeurs', value: 'instructeurs' },
					{ name: 'Messages', value: 'messages' },
					{ name: 'Traitements', value: 'traitements' },
				],
				default: ['champs'],
				description: 'Données à inclure dans les dossiers. Les champs incluent automatiquement les annotations.',
			},
			{
				displayName: 'Inclure',
				name: 'includeOptions',
				type: 'multiOptions',
				displayOptions: {
					show: {
						operation: ['getDossier'],
					},
				},
				options: [
					{ name: 'Avis', value: 'avis' },
					{ name: 'Champs Et Annotations', value: 'champs' },
					{ name: 'Corrections', value: 'corrections' },
					{ name: 'Géométrie', value: 'geometry' },
					{ name: 'Instructeurs', value: 'instructeurs' },
					{ name: 'Messages', value: 'messages' },
					{ name: 'Traitements', value: 'traitements' },
				],
				default: ['champs'],
				description: 'Données à inclure dans le dossier. Les champs incluent automatiquement les annotations.',
			},
			// Paramètres pour les mutations de dossiers
			{
				displayName: 'Numéro Du Dossier',
				name: 'dossierNumber',
				type: 'number',
				displayOptions: {
					show: {
						operation: ['envoyerMessage', 'modifierAnnotation'],
					},
				},
				default: '',
				placeholder: '123456',
				description: 'Numéro du dossier (exemple: 123456)',
				required: true,
			},
			{
				displayName: 'Motivation',
				name: 'motivation',
				type: 'string',
				displayOptions: {
					show: {
						operation: ['accepterDossier', 'refuserDossier', 'classerSansSuite'],
					},
				},
				default: '',
				placeholder: 'Dossier complet et conforme aux exigences',
				description: 'Motivation de la décision (obligatoire pour refus)',
			},
			{
				displayName: 'Désactiver La Notification',
				name: 'disableNotification',
				type: 'boolean',
				displayOptions: {
					show: {
						operation: ['accepterDossier', 'refuserDossier', 'classerSansSuite', 'passerEnInstruction'],
					},
				},
				default: false,
				description: 'Whether to disable sending email notification to the user',
			},
			{
				displayName: 'Pièce Justificative',
				name: 'justificatif',
				type: 'string',
				displayOptions: {
					show: {
						operation: ['accepterDossier', 'refuserDossier', 'classerSansSuite'],
					},
				},
				default: '',
				placeholder: 'ID du blob de la pièce justificative',
				description: 'ID de la pièce justificative jointe à la décision',
			},
			// Paramètres pour envoyerMessage - Cache intelligent
			{
				displayName: 'ID Ou Email Instructeur',
				name: 'instructeurIdOrEmailMessage',
				type: 'string',
				displayOptions: {
					show: {
						operation: ['envoyerMessage'],
					},
				},
				default: '',
				placeholder: 'clautier@idt.pf ou SW5zdHJ1Y3RldXItMTIz',
				description: 'Email ou ID de l\'instructeur qui envoie le message',
				required: true,
			},
			{
				displayName: 'Message',
				name: 'messageBody',
				type: 'string',
				displayOptions: {
					show: {
						operation: ['envoyerMessage'],
					},
				},
				default: '',
				placeholder: 'Votre message à l\'usager...',
				description: 'Contenu du message à envoyer',
				required: true,
			},
			// TODO: Pièce Jointe - Nécessite 2 appels GraphQL (upload + mutation)
			// {
			//	displayName: 'Pièce Jointe',
			//	name: 'attachment',
			//	type: 'string',
			//	displayOptions: {
			//		show: {
			//			operation: ['envoyerMessage'],
			//		},
			//	},
			//	default: '',
			//	placeholder: 'ID du blob de la pièce jointe',
			//	description: 'ID de la pièce jointe au message',
			// },
			{
				displayName: 'Type De Correction',
				name: 'correction',
				type: 'options',
				displayOptions: {
					show: {
						operation: ['envoyerMessage'],
					},
				},
				options: [
					{ name: 'Aucune', value: '' },
					{ name: 'Incorrect', value: 'incorrect' },
					{ name: 'Incomplet', value: 'incomplete' },
				],
				default: '',
				description: 'Type de correction demandée',
			},
			// Paramètres pour modifierAnnotation - Nouveaux champs avec cache
			{
				displayName: 'ID Ou Email Instructeur',
				name: 'instructeurIdOrEmail',
				type: 'string',
				displayOptions: {
					show: {
						operation: ['modifierAnnotation'],
					},
				},
				default: '',
				placeholder: 'john@domain.com ou SW5zdHJ1Y3RldXItMTIz',
				description: 'Email ou ID de l\'instructeur qui modifie',
				required: true,
			},
			{
				displayName: 'ID Ou Nom Annotation',
				name: 'annotationIdOrName',
				type: 'string',
				displayOptions: {
					show: {
						operation: ['modifierAnnotation'],
					},
				},
				default: '',
				placeholder: 'Statut traitement ou Q2hhbXAtNDU2',
				description: 'Nom ou ID de l\'annotation à modifier',
				required: true,
			},
			{
				displayName: 'Type D\'Annotation',
				name: 'annotationType',
				type: 'options',
				displayOptions: {
					show: {
						operation: ['modifierAnnotation'],
					},
				},
				options: [
					{ name: 'Case À Cocher', value: 'checkbox' },
					{ name: 'Date', value: 'date' },
					{ name: 'Date Et Heure', value: 'datetime' },
					{ name: 'Liste Déroulante', value: 'drop_down_list' },
					{ name: 'Nombre Entier', value: 'integer' },
					{ name: 'Texte', value: 'text' },
				],
				default: 'text',
				description: 'Type de l\'annotation à modifier',
				required: true,
			},
			{
				displayName: 'Valeur',
				name: 'annotationValue',
				type: 'string',
				displayOptions: {
					show: {
						operation: ['modifierAnnotation'],
						annotationType: ['text', 'drop_down_list'],
					},
				},
				default: '',
				placeholder: 'Nouvelle valeur',
				description: 'Nouvelle valeur de l\'annotation',
				required: true,
			},
			{
				displayName: 'Valeur Numérique',
				name: 'annotationValueNumber',
				type: 'number',
				displayOptions: {
					show: {
						operation: ['modifierAnnotation'],
						annotationType: ['integer'],
					},
				},
				default: 0,
				description: 'Nouvelle valeur numérique',
				required: true,
			},
			{
				displayName: 'Valeur Date',
				name: 'annotationValueDate',
				type: 'dateTime',
				displayOptions: {
					show: {
						operation: ['modifierAnnotation'],
						annotationType: ['date', 'datetime'],
					},
				},
				default: '',
				description: 'Nouvelle valeur de date',
				required: true,
			},
			{
				displayName: 'Valeur Booléenne',
				name: 'annotationValueBoolean',
				type: 'boolean',
				displayOptions: {
					show: {
						operation: ['modifierAnnotation'],
						annotationType: ['checkbox'],
					},
				},
				default: false,
				description: 'Whether to set the boolean value to true',
				required: true,
			},
			// Paramètres pour modifierStatutDossier - Approche unifiée
			{
				displayName: 'Numéro De Dossier',
				name: 'dossierNumber',
				type: 'number',
				displayOptions: {
					show: {
						operation: ['modifierStatutDossier'],
					},
				},
				default: '',
				placeholder: '540400',
				description: 'Numéro du dossier à modifier',
				required: true,
			},
			{
				displayName: 'ID Ou Email Instructeur',
				name: 'instructeurIdOrEmailStatut',
				type: 'string',
				displayOptions: {
					show: {
						operation: ['modifierStatutDossier'],
					},
				},
				default: '',
				placeholder: 'clautier@idt.pf ou SW5zdHJ1Y3RldXItMTIz',
				description: 'Email ou ID de l\'instructeur qui modifie le statut',
				required: true,
			},
			{
				displayName: 'Action',
				name: 'actionStatut',
				type: 'options',
				displayOptions: {
					show: {
						operation: ['modifierStatutDossier'],
					},
				},
				options: [
					{ name: 'Accepter', value: 'accepter' },
					{ name: 'Refuser', value: 'refuser' },
					{ name: 'Classer Sans Suite', value: 'classer_sans_suite' },
					{ name: 'Passer En Instruction', value: 'passer_en_instruction' },
				],
				default: 'accepter',
				description: 'Action à effectuer sur le dossier',
				required: true,
			},
			{
				displayName: 'Motivation',
				name: 'motivationStatut',
				type: 'string',
				typeOptions: {
					rows: 3,
				},
				displayOptions: {
					show: {
						operation: ['modifierStatutDossier'],
						actionStatut: ['accepter', 'refuser', 'classer_sans_suite'],
					},
				},
				default: '',
				placeholder: 'Motivation de la décision...',
				description: 'Motivation de la décision (obligatoire pour refuser)',
			},
			// TODO: Justificatif - Nécessite 2 appels GraphQL (upload + mutation)
			// {
			//	displayName: 'Justificatif',
			//	name: 'justificatifStatut',
			//	type: 'string',
			//	displayOptions: {
			//		show: {
			//			operation: ['modifierStatutDossier'],
			//			actionStatut: ['accepter', 'refuser', 'classer_sans_suite'],
			//		},
			//	},
			//	default: '',
			//	placeholder: 'Fichier justificatif...',
			//	description: 'Justificatif de la décision (optionnel)',
			//	required: false,
			// },
			{
				displayName: 'Désactiver Notification',
				name: 'disableNotificationStatut',
				type: 'boolean',
				displayOptions: {
					show: {
						operation: ['modifierStatutDossier'],
					},
				},
				default: false,
				description: 'Whether to disable sending notification to the user',
			},
			{
				displayName: 'Numéro De Démarche',
				name: 'demarcheNumber',
				type: 'number',
				displayOptions: {
					show: {
						operation: ['handleError'],
					},
				},
				default: '',
				placeholder: '123',
				description: 'Numéro de la démarche dont il faut corriger la synchronisation',
				required: true,
			},
		],
	};

	// eslint-disable-next-line no-unused-vars
	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		const items = this.getInputData();
		const operation = this.getNodeParameter('operation', 0) as string;

		// Pour listDossiers, gérer les sorties multiples
		if (operation === 'listDossiers') {
			return await handleListDossiersExecution.call(this, items);
		}

		// Pour les autres opérations, comportement standard avec une seule sortie
		const returnData: INodeExecutionData[] = [];

		for (let i = 0; i < items.length; i++) {
			try {
				let result: any;

				switch (operation) {
					case 'getDemarche':
						result = await getDemarche.call(this, i);
						break;
					case 'getDossier':
						result = await getDossier.call(this, i);
						break;
					case 'envoyerMessage':
						result = await envoyerMessage.call(this, i);
						break;
					case 'modifierAnnotation':
						result = await modifierAnnotation.call(this, i);
						break;
					case 'modifierStatutDossier':
						result = await modifierStatutDossier.call(this, i);
						break;
					case 'handleError':
						result = await handleErrorSynchronization.call(this, i);
						break;
					default:
						throw new NodeOperationError(this.getNode(), `L'opération "${operation}" n'est pas supportée`);
				}

				returnData.push({
					json: result,
					pairedItem: { item: i },
				});
			} catch (error) {
				if (this.continueOnFail()) {
					returnData.push({
						json: { error: (error as Error).message },
						pairedItem: { item: i },
					});
				} else {
					throw error;
				}
			}
		}

		return [returnData]; // Une seule sortie pour toutes les opérations
	}

}

// Fonctions utilitaires pour la conversion des IDs
function numberToGraphQLId(type: string, number: number): string {
	return Buffer.from(`${type}-${number}`).toString('base64');
}



// Fonctions pour la gestion de l'état de synchronisation
const fs = require('fs');
const path = require('path');
const os = require('os');

async function getSinceTimestamp(demarcheNumber: number): Promise<string> {
	const stateFile = path.join(os.homedir(), '.n8n', 'mes-demarches-sync.json');
	
	try {
		const syncState = JSON.parse(fs.readFileSync(stateFile, 'utf8'));
		const state = syncState[`demarche_${demarcheNumber}`];
		
		if (state) {
			// Nouveau format avec current/previous
			if (typeof state === 'object' && state.current) {
				return state.current;
			}
			// Ancien format (string) - migrer
			if (typeof state === 'string') {
				return state;
			}
		}
	} catch (error) {
		// Fichier inexistant, première exécution
	}
	
	// Première exécution : remonter suffisamment loin
	const date = new Date();
	date.setDate(date.getDate() - 90); // 3 mois par sécurité
	return date.toISOString();
}

async function checkErrorWorkflowWarning(this: IExecuteFunctions, itemIndex: number): Promise<INodeExecutionData | null> {
	const modifiedSince = this.getNodeParameter('modifiedSince', itemIndex) as string;
	
	if (modifiedSince === 'last_run') {
		// Vérifier si un workflow d'erreur est configuré
		// Note: Il n'y a pas d'API directe pour vérifier cela dans n8n
		// On peut juste afficher un warning informatif
		return {
			json: {
				warning: "Mode automatique activé",
				recommendation: "Pour éviter les pertes de données en cas d'échec, configurez un workflow d'erreur avec l'action 'Gérer L'erreur'",
				info: "Si votre workflow échoue, utilisez l'action 'Gérer L'erreur' pour reprendre au bon endroit"
			},
			pairedItem: { item: itemIndex }
		};
	}
	
	return null;
}

async function updateSinceFromProcessedDossiers(demarcheNumber: number, dossiers: any[], modifiedSince: string): Promise<void> {
	if (dossiers.length === 0) return;
	
	// Avec ORDER ASC : prendre le plus récent des dossiers traités
	const newestTimestamp = Math.max(...dossiers.map(d => 
		new Date(d.dateDerniereModification).getTime()
	));
	
	// Prochain since = plus récent + 1 seconde
	const nextSince = new Date(newestTimestamp + 1000).toISOString();
	
	const stateFile = path.join(os.homedir(), '.n8n', 'mes-demarches-sync.json');
	
	let syncState: any = {};
	try {
		syncState = JSON.parse(fs.readFileSync(stateFile, 'utf8'));
	} catch (error) {
		// Fichier inexistant
	}
	
	// Créer le répertoire si nécessaire
	const stateDir = path.dirname(stateFile);
	if (!fs.existsSync(stateDir)) {
		fs.mkdirSync(stateDir, { recursive: true });
	}
	
	const key = `demarche_${demarcheNumber}`;
	const currentState = syncState[key];
	
	// Obtenir le timestamp précédent
	let previousTimestamp: string | null = null;
	if (currentState) {
		if (typeof currentState === 'object' && currentState.current) {
			previousTimestamp = currentState.current;
		} else if (typeof currentState === 'string') {
			previousTimestamp = currentState;
		}
	}
	
	// Nouveau format avec current/previous
	syncState[key] = {
		current: nextSince,
		previous: previousTimestamp,
		updated_at: new Date().toISOString(),
		...(modifiedSince === 'beginning' && { initialized: true })
	};
	
	fs.writeFileSync(stateFile, JSON.stringify(syncState, null, 2));
}

async function handleListDossiersExecution(this: IExecuteFunctions, items: INodeExecutionData[]): Promise<INodeExecutionData[][]> {
	const returnData: INodeExecutionData[] = [];
	let allSuccess = true;
	let processedDossiers: any[] = [];
	let demarcheNumber: number;
	
	for (let i = 0; i < items.length; i++) {
		try {
			demarcheNumber = this.getNodeParameter('demarcheNumber', i) as number;
			
			// Vérifier et afficher le warning si nécessaire
			const warning = await checkErrorWorkflowWarning.call(this, i);
			if (warning) {
				returnData.push(warning);
			}
			
			// Toujours mode "par lot" - traiter un lot par exécution
			const batchResult = await getPagedDossiers.call(this, i);
			
			batchResult.dossiers.forEach((dossier: any) => {
				returnData.push({
					json: dossier,
					pairedItem: { item: i },
				});
			});
			
			processedDossiers = batchResult.dossiers;
			
		} catch (error) {
			allSuccess = false;
			if (this.continueOnFail()) {
				returnData.push({
					json: { error: (error as Error).message },
					pairedItem: { item: i },
				});
			} else {
				throw error;
			}
		}
	}
	
	// SAUVEGARDER UNIQUEMENT si tout s'est bien passé
	if (allSuccess && processedDossiers.length > 0) {
		const modifiedSince = this.getNodeParameter('modifiedSince', 0) as string;
		await updateSinceFromProcessedDossiers(demarcheNumber!, processedDossiers, modifiedSince);
	}
	
	return [returnData]; // Une seule sortie
}




async function getPagedDossiers(this: IExecuteFunctions, itemIndex: number, cursor?: string): Promise<{
	dossiers: any[],
	hasMore: boolean,
	nextCursor?: string,
	pageSize: number,
	totalProcessed?: number
}> {
	const demarcheNumber = this.getNodeParameter('demarcheNumber', itemIndex) as number;
	const modifiedSince = this.getNodeParameter('modifiedSince', itemIndex) as string;
	const outputFormat = this.getNodeParameter('outputFormat', itemIndex) as string;
	const state = this.getNodeParameter('state', itemIndex) as string;
	const includeOptions = this.getNodeParameter('includeOptions', itemIndex) as string[];
	
	// Paramètres techniques fixes
	const pageSize = 100; // Maximum mes-démarches
	const order = 'ASC'; // Obligatoire pour éviter perte de données
	
	// Logique métier : champs inclut automatiquement les annotations
	const includeChamps = includeOptions.includes('champs');
	const includeAnnotations = includeOptions.includes('champs'); // Inclus avec champs
	const includeTraitements = includeOptions.includes('traitements');
	const includeInstructeurs = includeOptions.includes('instructeurs');
	const includeMessages = includeOptions.includes('messages');
	const includeAvis = includeOptions.includes('avis');
	const includeCorrections = includeOptions.includes('corrections');
	const includeGeometry = includeOptions.includes('geometry');

	// Déterminer la date de début selon le mode
	let updatedSince: string | undefined;
	
	if (modifiedSince === 'specific_date') {
		const sinceDate = this.getNodeParameter('sinceDate', itemIndex) as string;
		updatedSince = sinceDate;
	} else if (modifiedSince === 'last_run') {
		updatedSince = await getSinceTimestamp(demarcheNumber);
	} else if (modifiedSince === 'beginning') {
		// Depuis le début : 1 an en arrière
		const oneYearAgo = new Date();
		oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
		updatedSince = oneYearAgo.toISOString();
	}

	// Construire les variables pour la requête GraphQL paginée
	const variables = {
		demarcheNumber,
		...(state && { state }),
		order,
		...(updatedSince && { updatedSince }),
		first: pageSize,
		...(cursor && { after: cursor }),
		includeDossiers: true,
		includeChamps,
		includeAnotations: includeAnnotations,
		includeTraitements,
		includeInstructeurs,
		includeAvis,
		includeMessages,
		includeCorrections,
		includeGeometry,
	};

	const response = await makeStoredQueryRequest.call(this, 'ds-query-v2', 'getDemarche', variables);
	
	if (!response.data?.demarche) {
		throw new NodeOperationError(this.getNode(), `Démarche ${demarcheNumber} non trouvée ou non accessible`);
	}

	const demarche = response.data.demarche;
	const dossiers = demarche.dossiers.nodes;
	const pageInfo = demarche.dossiers.pageInfo;

	// Transformer les données selon le format demandé
	const transformedDossiers = dossiers.map((dossier: any) => {
		return transformDossierData(dossier, 'original', outputFormat);
	});

	return {
		dossiers: transformedDossiers,
		hasMore: pageInfo.hasNextPage,
		nextCursor: pageInfo.endCursor,
		pageSize,
	};
}

// L'ancienne fonction listDossiers n'est plus utilisée
// La logique a été déplacée vers handleListDossiersExecution

async function getDemarche(this: IExecuteFunctions, itemIndex: number): Promise<any> {
		const demarcheNumber = this.getNodeParameter('demarcheNumber', itemIndex) as number;
		const includeGroupeInstructeurs = true;
		const includeService = true;
		const includeRevision = false;

		// Utiliser la requête stockée getDemarche optimisée
		const variables = {
			demarcheNumber,
			includeGroupeInstructeurs,
			includeService,
			includeRevision,
			includeDossiers: false, // Ne pas inclure les dossiers pour cette opération
			includePendingDeletedDossiers: false,
			includeDeletedDossiers: false,
			includeChamps: false,
			includeAnotations: false,
			includeTraitements: false,
			includeInstructeurs: includeGroupeInstructeurs, // Utiliser la même valeur que les groupes
			includeAvis: false,
			includeMessages: false,
			includeCorrections: false,
			includeGeometry: false,
		};

		const response = await makeStoredQueryRequest.call(this, 'ds-query-v2', 'getDemarche', variables);
		
		if (!response.data?.demarche) {
			throw new NodeOperationError(this.getNode(), `Démarche ${demarcheNumber} non trouvée ou non accessible`);
		}

		return response.data.demarche;
}

async function getDossier(this: IExecuteFunctions, itemIndex: number): Promise<any> {
		const dossierNumber = this.getNodeParameter('dossierNumber', itemIndex) as number;
		const outputFormat = this.getNodeParameter('outputFormat', itemIndex) as string;
		const includeOptions = this.getNodeParameter('includeOptions', itemIndex) as string[];
		
		// Logique métier : champs inclut automatiquement les annotations
		const includeChamps = includeOptions.includes('champs');
		const includeAnnotations = includeOptions.includes('champs'); // Inclus avec champs
		const includeTraitements = includeOptions.includes('traitements');
		const includeInstructeurs = includeOptions.includes('instructeurs');
		const includeMessages = includeOptions.includes('messages');
		const includeAvis = includeOptions.includes('avis');
		const includeCorrections = includeOptions.includes('corrections');
		const includeGeometry = includeOptions.includes('geometry');

		// Utiliser la requête stockée getDossier optimisée
		const variables = {
			dossierNumber,
			includeChamps,
			includeAnotations: includeAnnotations,
			includeTraitements,
			includeInstructeurs,
			includeMessages,
			includeAvis,
			includeCorrections,
			includeGeometry,
		};

		const response = await makeStoredQueryRequest.call(this, 'ds-query-v2', 'getDossier', variables);
		
		if (!response.data?.dossier) {
			throw new NodeOperationError(this.getNode(), `Dossier ${dossierNumber} non trouvé ou non accessible`);
		}

		const dossier = response.data.dossier;
		return transformDossierData(dossier, 'original', outputFormat);
}

function transformDossierData(dossier: any, attributeFormat: string = 'original', outputFormat: string = 'simplified'): any {
		const transformed: any = {
			...dossier,
		};

		if (outputFormat === 'complete') {
			// Format complet : objets GraphQL complets indexés par libellé formaté
			if (dossier.champs) {
				const champsObject: any = {};
				const champsArray: any[] = [];
				
				dossier.champs.forEach((champ: any) => {
					const key = formatAttributeName(champ.label, attributeFormat);
					// Objet complet indexé par libellé pour drag & drop fiable
					champsObject[key] = {
						id: champ.id,
						label: champ.label,
						type: champ.__typename,
						value: champ.stringValue || champ.value,
						stringValue: champ.stringValue,
						...champ // Toutes les autres propriétés GraphQL
					};
					// Array pour itération si nécessaire
					champsArray.push(champsObject[key]);
				});
				
				transformed.champs = champsObject;
				transformed.champsArray = champsArray; // Backup array
			}

			if (dossier.annotations) {
				const annotationsObject: any = {};
				const annotationsArray: any[] = [];
				
				dossier.annotations.forEach((annotation: any) => {
					const key = formatAttributeName(annotation.label, attributeFormat);
					// Objet complet indexé par libellé pour drag & drop fiable
					annotationsObject[key] = {
						id: annotation.id,
						label: annotation.label,
						type: annotation.__typename,
						value: annotation.stringValue || annotation.value,
						stringValue: annotation.stringValue,
						...annotation // Toutes les autres propriétés GraphQL
					};
					// Array pour itération si nécessaire
					annotationsArray.push(annotationsObject[key]);
				});
				
				transformed.annotations = annotationsObject;
				transformed.annotationsArray = annotationsArray; // Backup array
			}

			return transformed;
		}

		// Format simplifié : transformer en objets libellé → valeur
		if (dossier.champs) {
			const champsObject: any = {};
			dossier.champs.forEach((champ: any) => {
				const key = formatAttributeName(champ.label, attributeFormat);
				champsObject[key] = champ.stringValue || champ.value;
			});
			transformed.champs = champsObject;
		}

		// Transformer les annotations
		if (dossier.annotations) {
			const annotationsObject: any = {};
			dossier.annotations.forEach((annotation: any) => {
				const key = formatAttributeName(annotation.label, attributeFormat);
				annotationsObject[key] = annotation.stringValue || annotation.value;
			});
			transformed.annotations = annotationsObject;
		}

		return transformed;
}

function formatAttributeName(label: string, format: string): string {
		if (format === 'original') {
			return label.trim();
		}

		// Format snake_case
		return label
			.toLowerCase()
			.replace(/[^\w\sàâäéèêëïîôöùûüÿç-]/g, '') // Supprimer la ponctuation
			.replace(/\s+/g, '_') // Remplacer espaces par underscores
			.replace(/-+/g, '_') // Remplacer tirets par underscores
			.substring(0, 50); // Limiter la longueur
}

// Fonction pour les requêtes stockées optimisées
async function makeStoredQueryRequest(this: IExecuteFunctions, queryId: string, operationName: string, variables: any): Promise<any> {
	const credentials = await this.getCredentials('mesDemarchesApi');
	
	const options: IRequestOptions = {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
			'Authorization': `Bearer ${credentials.apiToken}`,
		},
		uri: `${credentials.server}/api/v2/graphql`,
		body: {
			queryId, // ID de la requête stockée
			operationName, // Nom de l'opération GraphQL
			variables,
		},
		json: true,
	};

	// Log pour debug
	console.log('🔍 [DEBUG] Stored Query Request:', {
		url: options.uri,
		hasToken: !!(credentials.apiToken),
		tokenPrefix: credentials.apiToken ? (credentials.apiToken as string).substring(0, 10) + '...' : 'none',
		queryId,
		operationName,
		variables
	});

	const response = await this.helpers.request(options);

	// Log pour debug
	console.log('📥 [DEBUG] Stored Query Response:', {
		hasData: !!response.data,
		hasErrors: !!response.errors,
		errors: response.errors,
		dataKeys: response.data ? Object.keys(response.data) : []
	});

	if (response.errors) {
		throw new NodeOperationError(this.getNode(), `Erreur GraphQL: ${response.errors.map((e: any) => e.message).join(', ')}`);
	}

	return response;
}




async function envoyerMessage(this: IExecuteFunctions, itemIndex: number): Promise<any> {
	const dossierNumber = this.getNodeParameter('dossierNumber', itemIndex) as number;
	const instructeurIdOrEmail = this.getNodeParameter('instructeurIdOrEmailMessage', itemIndex) as string;
	const messageBody = this.getNodeParameter('messageBody', itemIndex) as string;
	const attachment = this.getNodeParameter('attachment', itemIndex, '') as string;
	const correction = this.getNodeParameter('correction', itemIndex, '') as string;

	// Convertir le numéro de dossier en ID GraphQL
	const dossierId = numberToGraphQLId('Dossier', dossierNumber);
	
	// Résoudre l'instructeur via cache intelligent
	const instructeurId = await resolveInstructeurId.call(this, instructeurIdOrEmail, dossierNumber);

	const mutation = `
		mutation EnvoyerMessage($input: DossierEnvoyerMessageInput!) {
			dossierEnvoyerMessage(input: $input) {
				message {
					id
					body
					createdAt
				}
				errors {
					message
				}
			}
		}
	`;

	const variables = {
		input: {
			dossierId,
			instructeurId,
			body: messageBody,
			...(attachment && { attachment }),
			...(correction && { correction }),
		},
	};

	return await makeGraphQLMutation.call(this, mutation, variables, 'EnvoyerMessage');
}

async function modifierAnnotation(this: IExecuteFunctions, itemIndex: number): Promise<any> {
	const dossierNumber = this.getNodeParameter('dossierNumber', itemIndex) as number;
	const instructeurIdOrEmail = this.getNodeParameter('instructeurIdOrEmail', itemIndex) as string;
	const annotationIdOrName = this.getNodeParameter('annotationIdOrName', itemIndex) as string;
	const annotationType = this.getNodeParameter('annotationType', itemIndex) as string;

	// Convertir le numéro de dossier en ID GraphQL
	const dossierId = numberToGraphQLId('Dossier', dossierNumber);
	
	// Résoudre l'instructeur via cache intelligent
	const instructeurId = await resolveInstructeurId.call(this, instructeurIdOrEmail, dossierNumber);
	
	// Résoudre l'annotation via cache intelligent
	const annotationId = await resolveAnnotationId.call(this, annotationIdOrName, dossierNumber);

	let value: any;
	let mutationName: string;
	let inputType: string;

	// Déterminer la valeur et le type de mutation selon le type d'annotation
	switch (annotationType) {
		case 'text':
		case 'drop_down_list':
			value = this.getNodeParameter('annotationValue', itemIndex) as string;
			mutationName = 'dossierModifierAnnotationText';
			inputType = 'DossierModifierAnnotationTextInput';
			break;
		case 'integer':
			value = this.getNodeParameter('annotationValueNumber', itemIndex) as number;
			mutationName = 'dossierModifierAnnotationIntegerNumber';
			inputType = 'DossierModifierAnnotationIntegerNumberInput';
			break;
		case 'date':
			value = this.getNodeParameter('annotationValueDate', itemIndex) as string;
			mutationName = 'dossierModifierAnnotationDate';
			inputType = 'DossierModifierAnnotationDateInput';
			if (value) {
				value = new Date(value).toISOString().split('T')[0]; // Format YYYY-MM-DD
			}
			break;
		case 'datetime':
			value = this.getNodeParameter('annotationValueDate', itemIndex) as string;
			mutationName = 'dossierModifierAnnotationDatetime';
			inputType = 'DossierModifierAnnotationDatetimeInput';
			if (value) {
				value = new Date(value).toISOString(); // Format ISO complet
			}
			break;
		case 'checkbox':
			value = this.getNodeParameter('annotationValueBoolean', itemIndex) as boolean;
			mutationName = 'dossierModifierAnnotationCheckbox';
			inputType = 'DossierModifierAnnotationCheckboxInput';
			break;
		default:
			throw new NodeOperationError(this.getNode(), `Type d'annotation non supporté: ${annotationType}`);
	}

	const mutation = `
		mutation ModifierAnnotation($input: ${inputType}!) {
			${mutationName}(input: $input) {
				annotation {
					id
					label
					stringValue
				}
				errors {
					message
				}
			}
		}
	`;

	const variables = {
		input: {
			dossierId,
			instructeurId,
			annotationId,
			value,
		},
	};

	return await makeGraphQLMutation.call(this, mutation, variables, 'ModifierAnnotation');
}

// Fonction utilitaire pour les mutations GraphQL
async function makeGraphQLMutation(this: IExecuteFunctions, mutation: string, variables: any, operationName: string): Promise<any> {
	const credentials = await this.getCredentials('mesDemarchesApi');
	
	const options: IRequestOptions = {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
			'Authorization': `Bearer ${credentials.apiToken}`,
		},
		uri: `${credentials.server}/api/v2/graphql`,
		body: {
			query: mutation,
			variables,
			operationName,
		},
		json: true,
	};

	// Log pour debug
	console.log('🔍 [DEBUG] GraphQL Mutation Request:', {
		url: options.uri,
		hasToken: !!(credentials.apiToken),
		tokenPrefix: credentials.apiToken ? (credentials.apiToken as string).substring(0, 10) + '...' : 'none',
		operationName,
		variables
	});

	const response = await this.helpers.request(options);

	// Log pour debug
	console.log('📥 [DEBUG] GraphQL Mutation Response:', {
		hasData: !!response.data,
		hasErrors: !!response.errors,
		errors: response.errors,
		dataKeys: response.data ? Object.keys(response.data) : []
	});

	if (response.errors) {
		throw new NodeOperationError(this.getNode(), `Erreur GraphQL: ${response.errors.map((e: any) => e.message).join(', ')}`);
	}

	// Retourner la donnée principale de la mutation
	const mutationKey = Object.keys(response.data)[0];
	const mutationResult = response.data[mutationKey];
	
	if (mutationResult.errors && mutationResult.errors.length > 0) {
		throw new NodeOperationError(this.getNode(), `Erreur de mutation: ${mutationResult.errors.map((e: any) => e.message).join(', ')}`);
	}

	return mutationResult;
}

async function handleErrorSynchronization(this: IExecuteFunctions, itemIndex: number): Promise<any> {
	const demarcheNumber = this.getNodeParameter('demarcheNumber', itemIndex) as number;
	
	const stateFile = path.join(os.homedir(), '.n8n', 'mes-demarches-sync.json');
	
	let syncState: any = {};
	try {
		syncState = JSON.parse(fs.readFileSync(stateFile, 'utf8'));
	} catch (error) {
		return {
			error: 'Fichier de synchronisation introuvable',
			message: 'Aucune synchronisation précédente trouvée pour cette démarche'
		};
	}
	
	const key = `demarche_${demarcheNumber}`;
	const currentState = syncState[key];
	
	if (!currentState) {
		return {
			error: 'Aucune synchronisation trouvée',
			message: `Aucune synchronisation précédente trouvée pour la démarche ${demarcheNumber}`
		};
	}
	
	// Vérifier s'il y a un timestamp précédent
	let previousTimestamp: string | null = null;
	if (typeof currentState === 'object' && currentState.previous) {
		previousTimestamp = currentState.previous;
	} else if (typeof currentState === 'string') {
		// Ancien format - impossible de faire un rollback
		return {
			error: 'Rollback impossible',
			message: 'Format de synchronisation trop ancien. Utilisez "Le Début" pour reinitialiser.'
		};
	}
	
	if (!previousTimestamp) {
		return {
			error: 'Aucun timestamp précédent',
			message: 'Aucun timestamp précédent disponible pour effectuer un rollback'
		};
	}
	
	// Effectuer le rollback
	const currentTimestamp = currentState.current;
	syncState[key] = {
		current: previousTimestamp,
		previous: previousTimestamp,
		rolled_back_at: new Date().toISOString(),
		rolled_back_from: currentTimestamp,
		reason: 'Workflow error - manual rollback'
	};
	
	// Créer le répertoire si nécessaire
	const stateDir = path.dirname(stateFile);
	if (!fs.existsSync(stateDir)) {
		fs.mkdirSync(stateDir, { recursive: true });
	}
	
	fs.writeFileSync(stateFile, JSON.stringify(syncState, null, 2));
	
	return {
		success: true,
		message: `Rollback effectué pour la démarche ${demarcheNumber}`,
		details: {
			rolled_back_from: currentTimestamp,
			rolled_back_to: previousTimestamp,
			next_execution_will_start_from: previousTimestamp
		}
	};
}

// Cache global pour éviter les requêtes répétitives
const demarcheCache = new Map<number, any>();
const dossierToDemarcheCache = new Map<number, number>();

async function makeMinimalGraphQLQuery(this: IExecuteFunctions, query: string, variables: any): Promise<any> {
	const credentials = await this.getCredentials('mesDemarchesApi');
	
	const options: IRequestOptions = {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
			'Authorization': `Bearer ${credentials.apiToken}`,
		},
		uri: `${credentials.server}/api/v2/graphql`,
		body: {
			query,
			variables,
		},
		json: true,
	};

	const response = await this.helpers.request(options);

	if (response.errors) {
		throw new NodeOperationError(this.getNode(), `Erreur GraphQL: ${response.errors.map((e: any) => e.message).join(', ')}`);
	}

	return response;
}

async function getDemarcheNumberFromDossier(this: IExecuteFunctions, dossierNumber: number): Promise<number> {
	// Vérifier le cache d'abord
	if (dossierToDemarcheCache.has(dossierNumber)) {
		return dossierToDemarcheCache.get(dossierNumber)!;
	}

	// Requête GraphQL minimale
	const query = `
		query GetDemarcheFromDossier($dossierNumber: Int!) {
			dossier(number: $dossierNumber) {
				demarche {
					number
				}
			}
		}
	`;

	const variables = { dossierNumber };

	const response = await makeMinimalGraphQLQuery.call(this, query, variables);
	
	if (!response.data?.dossier?.demarche) {
		throw new NodeOperationError(this.getNode(), `Dossier ${dossierNumber} non trouvé ou pas de démarche associée`);
	}

	const demarcheNumber = response.data.dossier.demarche.number;
	dossierToDemarcheCache.set(dossierNumber, demarcheNumber);
	
	return demarcheNumber;
}

async function buildDemarcheCache(this: IExecuteFunctions, demarcheNumber: number): Promise<any> {
	if (demarcheCache.has(demarcheNumber)) {
		return demarcheCache.get(demarcheNumber);
	}

	const cache = {
		instructeurs: new Map<string, string>(), // email/id -> id
		annotations: new Map<string, string>()   // label/id -> id
	};

	// Récupérer les infos de la démarche
	const variables = {
		demarcheNumber,
		includeDossiers: true,
		first: 1, // Juste un dossier pour avoir les annotations
		includeChamps: false,
		includeAnotations: true,
		includeTraitements: false,
		includeInstructeurs: true, // Les instructeurs dans les groupes
		includeGroupeInstructeurs: true, // Les groupes d'instructeurs
		includeMessages: false,
		includeAvis: false,
		includeCorrections: false,
		includeGeometry: false
	};

	const response = await makeStoredQueryRequest.call(this, 'ds-query-v2', 'getDemarche', variables);
	const demarche = response.data?.demarche;

	if (!demarche) {
		throw new NodeOperationError(this.getNode(), `Démarche ${demarcheNumber} non trouvée`);
	}

	// LOG: Structure de la démarche
	console.log('🔍 [DEBUG] Structure demarche:', {
		demarcheNumber,
		hasGroupeInstructeurs: !!demarche.groupeInstructeurs,
		groupeInstructeursLength: demarche.groupeInstructeurs?.length || 0,
		groupeInstructeursKeys: demarche.groupeInstructeurs ? Object.keys(demarche.groupeInstructeurs[0] || {}) : [],
		hasInstructeurs: !!demarche.instructeurs,
		instructeursLength: demarche.instructeurs?.length || 0
	});

	// Construire le cache instructeurs depuis groupeInstructeurs
	if (demarche.groupeInstructeurs) {
		console.log('🔍 [DEBUG] GroupeInstructeurs trouvés:', demarche.groupeInstructeurs.length);
		
		demarche.groupeInstructeurs.forEach((groupe: any, groupeIndex: number) => {
			console.log(`🔍 [DEBUG] Groupe ${groupeIndex}:`, {
				groupeKeys: Object.keys(groupe),
				hasInstructeurs: !!groupe.instructeurs,
				instructeursCount: groupe.instructeurs?.length || 0
			});
			
			if (groupe.instructeurs) {
				groupe.instructeurs.forEach((instructeur: any, instructeurIndex: number) => {
					console.log(`🔍 [DEBUG] Instructeur ${groupeIndex}-${instructeurIndex}:`, {
						id: instructeur.id,
						email: instructeur.email,
						allKeys: Object.keys(instructeur)
					});
					
					if (instructeur.email) {
						cache.instructeurs.set(instructeur.email, instructeur.id);
						console.log(`✅ [DEBUG] Ajouté au cache: ${instructeur.email} → ${instructeur.id}`);
					}
					cache.instructeurs.set(instructeur.id, instructeur.id); // ID -> ID direct
				});
			}
		});
	} else {
		console.log('⚠️ [DEBUG] Aucun groupeInstructeurs trouvé dans la démarche');
	}

	// Construire le cache annotations depuis le premier dossier
	if (demarche.dossiers && demarche.dossiers.nodes && demarche.dossiers.nodes.length > 0) {
		const firstDossier = demarche.dossiers.nodes[0];
		if (firstDossier.annotations) {
			firstDossier.annotations.forEach((annotation: any) => {
				if (annotation.label) {
					cache.annotations.set(annotation.label, annotation.id);
				}
				cache.annotations.set(annotation.id, annotation.id); // ID -> ID direct
			});
		}
	}

	// LOG: Résumé du cache final
	console.log('📋 [DEBUG] Cache instructeurs final:', {
		totalInstructeurs: cache.instructeurs.size,
		emails: Array.from(cache.instructeurs.keys()).filter(k => (k as string).includes('@')),
		ids: Array.from(cache.instructeurs.keys()).filter(k => !(k as string).includes('@'))
	});

	demarcheCache.set(demarcheNumber, cache);
	return cache;
}


function isEmail(input: string): boolean {
	return input.includes('@') && input.includes('.');
}

function isAnnotationId(input: string): boolean {
	// Spécifique aux annotations
	try {
		const decoded = Buffer.from(input, 'base64').toString();
		return decoded.includes('Champ-');
	} catch {
		return false;
	}
}

function isInstructeurId(input: string): boolean {
	// Spécifique aux instructeurs
	try {
		const decoded = Buffer.from(input, 'base64').toString();
		return decoded.includes('Instructeur-');
	} catch {
		return false;
	}
}

async function resolveInstructeurId(this: IExecuteFunctions, input: string, dossierNumber: number): Promise<string> {
	console.log('🔍 [DEBUG] Résolution instructeur:', { input, dossierNumber });
	
	// 1) Test direct ID GraphQL
	if (isInstructeurId(input)) {
		console.log('✅ [DEBUG] ID instructeur direct détecté');
		return input;
	}

	// 2) Si email détecté → besoin du cache
	if (isEmail(input)) {
		console.log('📧 [DEBUG] Email détecté, récupération du cache...');
		
		const demarcheNumber = await getDemarcheNumberFromDossier.call(this, dossierNumber);
		console.log('🔢 [DEBUG] Numéro démarche récupéré:', demarcheNumber);
		
		const cache = await buildDemarcheCache.call(this, demarcheNumber);
		const instructeurId = cache.instructeurs.get(input);

		console.log('🔍 [DEBUG] Recherche dans cache:', {
			email: input,
			found: !!instructeurId,
			instructeurId,
			cacheSize: cache.instructeurs.size,
			availableEmails: Array.from(cache.instructeurs.keys()).filter(k => (k as string).includes('@'))
		});

		if (!instructeurId) {
			throw new NodeOperationError(this.getNode(), `Instructeur avec email '${input}' non trouvé dans la démarche`);
		}

		return instructeurId;
	}

	// 3) Fallback : assume que c'est un ID (peut-être ancien format)
	if (input.trim()) {
		console.log('⚠️ [DEBUG] Fallback ID:', input);
		return input;
	}

	throw new NodeOperationError(this.getNode(), `Instructeur invalide: '${input}'`);
}

async function resolveAnnotationId(this: IExecuteFunctions, input: string, dossierNumber: number): Promise<string> {
	// 1) Test direct ID GraphQL
	if (isAnnotationId(input)) {
		return input;
	}

	// 2) Si ce n'est pas un ID → c'est un libellé → besoin du cache
	const demarcheNumber = await getDemarcheNumberFromDossier.call(this, dossierNumber);
	const cache = await buildDemarcheCache.call(this, demarcheNumber);
	const annotationId = cache.annotations.get(input);

	if (!annotationId) {
		throw new NodeOperationError(this.getNode(), `Annotation avec le nom '${input}' non trouvée dans la démarche`);
	}

	return annotationId;
}

async function modifierStatutDossier(this: IExecuteFunctions, itemIndex: number): Promise<any> {
	const dossierNumber = this.getNodeParameter('dossierNumber', itemIndex) as number;
	const instructeurIdOrEmail = this.getNodeParameter('instructeurIdOrEmailStatut', itemIndex) as string;
	const action = this.getNodeParameter('actionStatut', itemIndex) as string;
	const motivation = this.getNodeParameter('motivationStatut', itemIndex, '') as string;
	const justificatif = this.getNodeParameter('justificatifStatut', itemIndex, '') as string;
	const disableNotification = this.getNodeParameter('disableNotificationStatut', itemIndex, false) as boolean;

	console.log('🔄 [DEBUG] Modification statut dossier:', {
		dossierNumber,
		instructeurIdOrEmail,
		action,
		motivation: motivation ? 'présente' : 'absente',
		justificatif: justificatif ? 'présent' : 'absent',
		disableNotification
	});

	// Convertir le numéro de dossier en ID GraphQL
	const dossierId = numberToGraphQLId('Dossier', dossierNumber);
	
	// Résoudre l'instructeur via cache intelligent
	const instructeurId = await resolveInstructeurId.call(this, instructeurIdOrEmail, dossierNumber);
	
	// Validation spécifique selon l'action
	if (action === 'refuser' && !motivation.trim()) {
		throw new NodeOperationError(this.getNode(), 'La motivation est obligatoire pour refuser un dossier');
	}

	// Routage vers la fonction spécifique selon l'action
	switch (action) {
		case 'accepter':
			return await executeAccepterDossier.call(this, dossierId, instructeurId, motivation, justificatif, disableNotification);
			
		case 'refuser':
			return await executeRefuserDossier.call(this, dossierId, instructeurId, motivation, justificatif, disableNotification);
			
		case 'classer_sans_suite':
			return await executeClasserSansSuite.call(this, dossierId, instructeurId, motivation, justificatif, disableNotification);
			
		case 'passer_en_instruction':
			return await executePasserEnInstruction.call(this, dossierId, instructeurId, disableNotification);
			
		default:
			throw new NodeOperationError(this.getNode(), `Action non supportée: ${action}`);
	}
}

// Fonctions d'exécution réutilisables pour les changements de statut
async function executeAccepterDossier(this: IExecuteFunctions, dossierId: string, instructeurId: string, motivation?: string, justificatif?: string, disableNotification?: boolean): Promise<any> {
	const mutation = `
		mutation AccepterDossier($input: DossierAccepterInput!) {
			dossierAccepter(input: $input) {
				dossier {
					id
					number
					state
					motivation
					dateDerniereModification
				}
				errors {
					message
				}
			}
		}
	`;

	const variables = {
		input: {
			dossierId,
			instructeurId,
			...(motivation && { motivation }),
			...(justificatif && { justificatif }),
			disableNotification: !!disableNotification,
		},
	};

	return await makeGraphQLMutation.call(this, mutation, variables, 'AccepterDossier');
}

async function executeRefuserDossier(this: IExecuteFunctions, dossierId: string, instructeurId: string, motivation: string, justificatif?: string, disableNotification?: boolean): Promise<any> {
	const mutation = `
		mutation RefuserDossier($input: DossierRefuserInput!) {
			dossierRefuser(input: $input) {
				dossier {
					id
					number
					state
					motivation
					dateDerniereModification
				}
				errors {
					message
				}
			}
		}
	`;

	const variables = {
		input: {
			dossierId,
			instructeurId,
			motivation,
			...(justificatif && { justificatif }),
			disableNotification: !!disableNotification,
		},
	};

	return await makeGraphQLMutation.call(this, mutation, variables, 'RefuserDossier');
}

async function executeClasserSansSuite(this: IExecuteFunctions, dossierId: string, instructeurId: string, motivation?: string, justificatif?: string, disableNotification?: boolean): Promise<any> {
	const mutation = `
		mutation ClasserSansSuite($input: DossierClasserSansSuiteInput!) {
			dossierClasserSansSuite(input: $input) {
				dossier {
					id
					number
					state
					motivation
					dateDerniereModification
				}
				errors {
					message
				}
			}
		}
	`;

	const variables = {
		input: {
			dossierId,
			instructeurId,
			...(motivation && { motivation }),
			...(justificatif && { justificatif }),
			disableNotification: !!disableNotification,
		},
	};

	return await makeGraphQLMutation.call(this, mutation, variables, 'ClasserSansSuite');
}

async function executePasserEnInstruction(this: IExecuteFunctions, dossierId: string, instructeurId: string, disableNotification?: boolean): Promise<any> {
	const mutation = `
		mutation PasserEnInstruction($input: DossierPasserEnInstructionInput!) {
			dossierPasserEnInstruction(input: $input) {
				dossier {
					id
					number
					state
					dateDerniereModification
				}
				errors {
					message
				}
			}
		}
	`;

	const variables = {
		input: {
			dossierId,
			instructeurId,
			disableNotification: !!disableNotification,
		},
	};

	return await makeGraphQLMutation.call(this, mutation, variables, 'PasserEnInstruction');
}

