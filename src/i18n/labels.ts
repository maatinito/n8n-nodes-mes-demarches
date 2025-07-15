// Préparation pour l'i18n future - Centralisation des libellés
// Quand n8n supportera l'i18n pour les nœuds personnalisés, 
// il suffira de brancher ce système

export const LABELS = {
	// Node information
	node: {
		displayName: {
			fr: 'Mes-Démarches',
			en: 'Mes-Démarches',
			// Prêt pour d'autres langues : es, de, it, etc.
		},
		description: {
			fr: 'Interagit avec l\'API mes-démarches (Polynésie française)',
			en: 'Interact with mes-démarches API (French Polynesia)',
		}
	},

	// Operations
	operations: {
		listDossiers: {
			name: {
				fr: 'Lister Les Dossiers',
				en: 'List Files'
			},
			description: {
				fr: 'Récupérer les dossiers d\'une démarche avec synchronisation intelligente',
				en: 'Retrieve procedure files with smart synchronization'
			},
			action: {
				fr: 'Lister les dossiers d\'une démarche',
				en: 'List procedure files'
			}
		},
		getDemarche: {
			name: {
				fr: 'Consulter Une Démarche',
				en: 'View Procedure'
			},
			description: {
				fr: 'Récupérer les informations d\'une démarche',
				en: 'Retrieve procedure information'
			},
			action: {
				fr: 'Consulter une démarche',
				en: 'View procedure'
			}
		},
		getDossier: {
			name: {
				fr: 'Consulter Un Dossier',
				en: 'View File'
			},
			description: {
				fr: 'Récupérer les informations complètes d\'un dossier',
				en: 'Retrieve complete file information'
			},
			action: {
				fr: 'Consulter un dossier',
				en: 'View file'
			}
		}
	},

	// Parameters
	parameters: {
		demarcheNumber: {
			displayName: {
				fr: 'Numéro De Démarche',
				en: 'Procedure Number'
			},
			description: {
				fr: 'Numéro de la démarche à consulter',
				en: 'Number of the procedure to view'
			}
		},
		dossierNumber: {
			displayName: {
				fr: 'Numéro De Dossier',
				en: 'File Number'
			},
			description: {
				fr: 'Numéro du dossier à consulter',
				en: 'Number of the file to view'
			}
		},
		syncMode: {
			displayName: {
				fr: 'Mode De Synchronisation',
				en: 'Synchronization Mode'
			},
			options: {
				auto: {
					name: {
						fr: 'Auto (Reprendre Depuis Le Dernier Succès)',
						en: 'Auto (Resume From Last Success)'
					},
					description: {
						fr: 'Recommandé : détecte automatiquement la dernière synchronisation réussie',
						en: 'Recommended: automatically detects last successful synchronization'
					}
				},
				manual: {
					name: {
						fr: 'Date Spécifique',
						en: 'Specific Date'
					},
					description: {
						fr: 'Spécifier manuellement la date de début',
						en: 'Manually specify start date'
					}
				},
				all: {
					name: {
						fr: 'Tous Les Dossiers',
						en: 'All Files'
					},
					description: {
						fr: 'Récupérer tous les dossiers (attention aux performances)',
						en: 'Retrieve all files (performance warning)'
					}
				}
			}
		},
		state: {
			displayName: {
				fr: 'État Des Dossiers',
				en: 'File Status'
			},
			description: {
				fr: 'Filtrer les dossiers par état',
				en: 'Filter files by status'
			},
			options: {
				accepte: {
					fr: 'Accepté',
					en: 'Accepted'
				},
				refuse: {
					fr: 'Refusé',
					en: 'Rejected'
				},
				en_construction: {
					fr: 'En Construction',
					en: 'In Progress'
				},
				en_instruction: {
					fr: 'En Instruction',
					en: 'Under Review'
				},
				sans_suite: {
					fr: 'Classé Sans Suite',
					en: 'Closed Without Action'
				},
				tous: {
					fr: 'Tous Les États',
					en: 'All Statuses'
				}
			}
		},
		attributeFormat: {
			displayName: {
				fr: 'Format Des Attributs',
				en: 'Attribute Format'
			},
			options: {
				original: {
					name: {
						fr: 'Libellés Originaux (Recommandé Pour Baserow)',
						en: 'Original Labels (Recommended For Baserow)'
					},
					description: {
						fr: 'Utilise les libellés des champs tels qu\'ils sont saisis',
						en: 'Uses field labels as they were entered'
					}
				},
				snake_case: {
					name: {
						fr: 'Format Technique (Snake_case)',
						en: 'Technical Format (Snake_case)'
					},
					description: {
						fr: 'Convertit les libellés en format snake_case',
						en: 'Converts labels to snake_case format'
					}
				}
			}
		},
		// Include parameters
		includeChamps: {
			displayName: {
				fr: 'Inclure Les Champs',
				en: 'Include Fields'
			},
			description: {
				fr: 'Whether to include form field values',
				en: 'Whether to include form field values'
			}
		},
		includeAnnotations: {
			displayName: {
				fr: 'Inclure Les Annotations',
				en: 'Include Annotations'
			},
			description: {
				fr: 'Whether to include private annotations',
				en: 'Whether to include private annotations'
			}
		}
		// ... autres paramètres
	}
};

// Helper function pour obtenir un libellé dans la langue courante
export function getLabel(path: string, locale: string = 'fr'): string {
	const keys = path.split('.');
	let value: any = LABELS;
	
	for (const key of keys) {
		value = value?.[key];
		if (!value) break;
	}
	
	return value?.[locale] || value?.fr || path;
}

// Usage future : getLabel('operations.listDossiers.name', 'en')