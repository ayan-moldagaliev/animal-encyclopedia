export interface Animal {
	name: string;
	taxonomy: Record<string, string>,
	characteristics: Record<string, string | number | string[]>,
	locations: string[],
	image?: string;
}