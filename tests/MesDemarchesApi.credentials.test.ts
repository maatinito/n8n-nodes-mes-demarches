import { MesDemarchesApi } from '../credentials/MesDemarchesApi.credentials';

describe('MesDemarchesApi Credentials', () => {
	let credentials: MesDemarchesApi;

	beforeEach(() => {
		credentials = new MesDemarchesApi();
	});

	describe('Credential Configuration', () => {
		it('should have correct basic properties', () => {
			expect(credentials.name).toBe('mesDemarchesApi');
			expect(credentials.displayName).toBe('API mes-démarches');
			expect(credentials.documentationUrl).toBe('https://doc.demarches-simplifiees.fr/graphql-api');
		});

		it('should have required server and apiToken properties', () => {
			const properties = credentials.properties;
			expect(properties).toHaveLength(2);

			const serverProperty = properties.find(p => p.name === 'server');
			const tokenProperty = properties.find(p => p.name === 'apiToken');

			expect(serverProperty).toBeDefined();
			expect(serverProperty?.type).toBe('string');
			expect(serverProperty?.required).toBe(true);
			expect(serverProperty?.default).toBe('https://www.mes-demarches.gov.pf');

			expect(tokenProperty).toBeDefined();
			expect(tokenProperty?.type).toBe('string');
			expect(tokenProperty?.required).toBe(true);
			expect(tokenProperty?.typeOptions?.password).toBe(true);
		});

		it('should have proper authentication configuration', () => {
			expect(credentials.authenticate).toBeDefined();
			expect(credentials.authenticate.type).toBe('generic');
			expect(credentials.authenticate.properties?.headers?.Authorization).toBe('=Bearer {{$credentials.apiToken}}');
		});

		it('should have connectivity test configured', () => {
			expect(credentials.test).toBeDefined();
			expect(credentials.test.request?.method).toBe('POST');
			expect(credentials.test.request?.url).toBe('/api/v2/graphql');
			expect((credentials.test.request?.body as any)?.query).toContain('__typename');
			
			expect(credentials.test.rules).toHaveLength(1);
			expect(credentials.test.rules?.[0].type).toBe('responseSuccessBody');
			expect((credentials.test.rules?.[0].properties as any)?.key).toBe('data');
		});
	});

	describe('Default Values', () => {
		it('should use correct default server URL', () => {
			const serverProperty = credentials.properties.find(p => p.name === 'server');
			expect(serverProperty?.default).toBe('https://www.mes-demarches.gov.pf');
			expect(serverProperty?.placeholder).toBe('https://www.mes-demarches.gov.pf');
		});

		it('should have appropriate descriptions', () => {
			const serverProperty = credentials.properties.find(p => p.name === 'server');
			const tokenProperty = credentials.properties.find(p => p.name === 'apiToken');

			expect(serverProperty?.description).toContain('URL du serveur mes-démarches');
			expect(tokenProperty?.description).toContain('Token d\'accès à l\'API GraphQL');
		});
	});
});