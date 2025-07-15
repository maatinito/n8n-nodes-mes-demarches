import { MesDemarches } from '../nodes/MesDemarches/MesDemarches.node';
import { NodeConnectionType } from 'n8n-workflow';

describe('MesDemarches Node', () => {
	let node: MesDemarches;

	beforeEach(() => {
		node = new MesDemarches();
	});

	describe('Node Configuration', () => {
		it('should have correct basic properties', () => {
			expect(node.description.displayName).toBe('Mes-Démarches');
			expect(node.description.name).toBe('mesDemarches');
			expect(node.description.version).toBe(1);
			expect(node.description.description).toBe('Interagit avec l\'API mes-démarches (Polynésie française)');
		});

		it('should have correct inputs and outputs', () => {
			expect(node.description.inputs).toEqual([NodeConnectionType.Main]);
			expect(node.description.outputs).toEqual([
				{
					displayName: 'Main',
					type: NodeConnectionType.Main,
				},
			]);
		});

		it('should require credentials', () => {
			expect(node.description.credentials).toEqual([
				{
					name: 'mesDemarchesApi',
					required: true,
				},
			]);
		});

		it('should have seven operations available', () => {
			const operationProperty = node.description.properties?.find(p => p.name === 'operation');
			expect(operationProperty).toBeDefined();
			expect(operationProperty?.options).toHaveLength(7);
			
			const operationValues = operationProperty?.options?.map((opt: any) => opt.value);
			expect(operationValues).toContain('listDossiers');
			expect(operationValues).toContain('getDemarche');
			expect(operationValues).toContain('getDossier');
			expect(operationValues).toContain('envoyerMessage');
			expect(operationValues).toContain('modifierAnnotation');
			expect(operationValues).toContain('modifierStatutDossier');
			expect(operationValues).toContain('handleError');
		});
	});

	describe('Operation Parameters', () => {
		it('should have demarcheNumber parameter for listDossiers and getDemarche', () => {
			const demarcheNumberProperty = node.description.properties?.find(p => p.name === 'demarcheNumber');
			expect(demarcheNumberProperty).toBeDefined();
			expect(demarcheNumberProperty?.displayOptions?.show?.operation).toContain('listDossiers');
			expect(demarcheNumberProperty?.displayOptions?.show?.operation).toContain('getDemarche');
			expect(demarcheNumberProperty?.required).toBe(true);
		});

		it('should have dossierNumber parameter for getDossier', () => {
			const dossierNumberProperty = node.description.properties?.find(p => p.name === 'dossierNumber');
			expect(dossierNumberProperty).toBeDefined();
			expect(dossierNumberProperty?.displayOptions?.show?.operation).toContain('getDossier');
			expect(dossierNumberProperty?.required).toBe(true);
		});

		it('should have modifiedSince parameter for listDossiers', () => {
			const modifiedSinceProperty = node.description.properties?.find(p => p.name === 'modifiedSince');
			expect(modifiedSinceProperty).toBeDefined();
			expect(modifiedSinceProperty?.displayOptions?.show?.operation).toEqual(['listDossiers']);
			expect(modifiedSinceProperty?.default).toBe('last_run');
		});

		it('should have state parameter for listDossiers', () => {
			const stateProperty = node.description.properties?.find(p => p.name === 'state');
			
			expect(stateProperty).toBeDefined();
			expect(stateProperty?.displayOptions?.show?.operation).toEqual(['listDossiers']);
		});

		it('should have includeOptions parameter for both listDossiers and getDossier', () => {
			const listDossiersIncludeOptions = node.description.properties?.find(p => 
				p.name === 'includeOptions' && 
				p.displayOptions?.show?.operation?.includes('listDossiers')
			);
			const getDossierIncludeOptions = node.description.properties?.find(p => 
				p.name === 'includeOptions' && 
				p.displayOptions?.show?.operation?.includes('getDossier')
			);
			
			expect(listDossiersIncludeOptions).toBeDefined();
			expect(getDossierIncludeOptions).toBeDefined();
			expect(listDossiersIncludeOptions?.type).toBe('multiOptions');
			expect(getDossierIncludeOptions?.type).toBe('multiOptions');
		});

		it('should have getDemarche operation without specific include parameters', () => {
			// Dans la nouvelle implémentation, getDemarche n'a pas de paramètres include spécifiques
			// car ils sont hardcodés dans la fonction
			const getDemarcheParams = [
				'includeGroupeInstructeurs',
				'includeService',
				'includeRevision'
			];

			getDemarcheParams.forEach(paramName => {
				const property = node.description.properties?.find(p => 
					p.name === paramName && 
					p.displayOptions?.show?.operation?.includes('getDemarche')
				);
				expect(property).toBeUndefined(); // Ces paramètres n'existent plus dans l'interface
			});
		});

		it('should have outputFormat parameter for data operations', () => {
			const outputFormatProperty = node.description.properties?.find(p => p.name === 'outputFormat');
			expect(outputFormatProperty).toBeDefined();
			expect(outputFormatProperty?.displayOptions?.show?.operation).toContain('listDossiers');
			expect(outputFormatProperty?.displayOptions?.show?.operation).toContain('getDossier');
			expect(outputFormatProperty?.default).toBe('simplified');
		});
	});

	describe('State Options Sorting', () => {
		it('should have state options in alphabetical order', () => {
			const stateProperty = node.description.properties?.find(p => p.name === 'state');
			const stateOptions = stateProperty?.options?.map((opt: any) => opt.name);
			
			// Vérifier que les options sont triées alphabétiquement
			expect(stateOptions).toEqual([
				'Accepté',
				'Classé Sans Suite', 
				'En Construction',
				'En Instruction',
				'Refusé',
				'Tous Les États'
			]);
		});
	});
});

describe('Helper Functions', () => {
	// Ces tests ne peuvent pas être exécutés facilement car les fonctions sont internes
	// mais nous validons la structure générale
	
	it('should export MesDemarches class', () => {
		expect(MesDemarches).toBeDefined();
		expect(typeof MesDemarches).toBe('function');
	});
});