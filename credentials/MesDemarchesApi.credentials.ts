import type {
	IAuthenticateGeneric,
	ICredentialTestRequest,
	ICredentialType,
	INodeProperties,
} from 'n8n-workflow';

export class MesDemarchesApi implements ICredentialType {
	name = 'mesDemarchesApi';

	displayName = 'API mes-démarches';

	documentationUrl = 'https://doc.demarches-simplifiees.fr/graphql-api';

	properties: INodeProperties[] = [
		{
			displayName: 'Serveur Mes-Démarches',
			name: 'server',
			type: 'string',
			default: 'https://www.mes-demarches.gov.pf',
			placeholder: 'https://www.mes-demarches.gov.pf',
			description: 'URL du serveur mes-démarches (sans /api/v2/graphql)',
			required: true,
		},
		{
			displayName: 'Token API',
			name: 'apiToken',
			type: 'string',
			typeOptions: { password: true },
			default: '',
			placeholder: 'Votre token API',
			description: 'Token d\'accès à l\'API GraphQL mes-démarches',
			required: true,
		},
	];

	// Configuration pour l'authentification Bearer
	authenticate: IAuthenticateGeneric = {
		type: 'generic',
		properties: {
			headers: {
				Authorization: '=Bearer {{$credentials.apiToken}}',
			},
		},
	};

	// Test de connectivité
	test: ICredentialTestRequest = {
		request: {
			baseURL: '={{$credentials.server}}',
			url: '/api/v2/graphql',
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			body: {
				query: `query TestConnection { __typename }`,
			},
		},
		rules: [
			{
				type: 'responseSuccessBody',
				properties: {
					key: 'data',
					value: {},
					message: 'Token invalide ou erreur serveur. Vérifiez votre token et l\'URL du serveur.',
				},
			},
		],
	};
}