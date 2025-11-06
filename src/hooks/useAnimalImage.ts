import { useEffect, useState } from "react";
const GOOGLE_API_KEY = "AIzaSyBL9PJWfeMBfFcekSZIFGgolQodKNoTR2c";
const GOOGLE_CX = "b679258cd39964f96";

const HOST_PRIORITIES = [
	"commons.wikimedia.org",
	"upload.wikimedia.org",
	"wikipedia.org",
	"nationalgeographic.com",
	"bbc.co.uk",
	"wildlife.org",
	"arkive.org",
];

const ALLOWED_EXT = [".jpg", ".jpeg", ".png", ".webp"];
const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours
const MAX_RETRIES = 3;

interface ImageDimensions {
	width?: string;
	height?: string;
}

interface ImageCandidate {
	link: string;
	mime?: string;
	title?: string;
	snippet?: string;
	image?: ImageDimensions;
	source?: string;
	query?: string;
	score?: number;
}

interface CacheData {
	selected: string | null;
	candidates: ImageCandidate[];
	timestamp: number;
}

interface UseAnimalImageEnhancedReturn {
	imageUrl: string | null;
	candidates: ImageCandidate[];
	loading: boolean;
	error: string | null;
}

export function useAnimalImageEnhanced(
	animalName?: string,
	scientificName?: string
): UseAnimalImageEnhancedReturn {
	const [imageUrl, setImageUrl] = useState<string | null>(null);
	const [candidates, setCandidates] = useState<ImageCandidate[]>([]);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		if (!animalName && !scientificName) {
			setImageUrl(null);
			setCandidates([]);
			return;
		}

		const cacheKey = `animal-image-${animalName || scientificName}`;

		const cachedData = getCachedData(cacheKey);
		if (cachedData) {
			setImageUrl(cachedData.selected);
			setCandidates(cachedData.candidates);
			return;
		}

		let cancelled = false;

		const searchQueries = generateSearchQueries(animalName, scientificName);

		const fetchAndPick = async () => {
			setLoading(true);
			setError(null);

			try {
				const allCandidates = await fetchAllCandidates(searchQueries);

				if (cancelled) return;
				if (allCandidates.length === 0) {
					throw new Error("No suitable images found");
				}

				const scoredCandidates = scoreAndSortCandidates(allCandidates);
				const bestCandidate = selectBestCandidate(scoredCandidates);

				const isValid = bestCandidate?.link ? await validateImageUrl(bestCandidate.link) : false;
				const finalSelected = isValid && bestCandidate?.link ? bestCandidate.link : null;

				cacheData(cacheKey, {
					selected: finalSelected,
					candidates: scoredCandidates,
					timestamp: Date.now()
				});

				if (!cancelled) {
					setCandidates(scoredCandidates);
					setImageUrl(finalSelected);
				}
			} catch (err: any) {
				if (!cancelled) {
					setError(err.message || "Failed to load image");
					setCandidates([]);
					setImageUrl(null);
				}
			} finally {
				if (!cancelled) setLoading(false);
			}
		};

		fetchAndPick();

		return () => {
			cancelled = true;
		};
	}, [animalName, scientificName]);

	return { imageUrl, candidates, loading, error };
}


function generateSearchQueries(animalName?: string, scientificName?: string): string[] {
	const queries: string[] = [];

	if (scientificName) {
		queries.push(
			`${scientificName} animal real photo`,
			`${scientificName} wildlife photography`,
			`${scientificName} species`
		);
	}

	if (animalName) {
		queries.push(
			`${animalName} animal real photo`,
			`${animalName} animal in habitat`,
			`${animalName} portrait photo`,
			`${animalName} wildlife`
		);
	}

	return Array.from(new Set(queries.filter(Boolean as any)));
}

async function fetchAllCandidates(queries: string[]): Promise<ImageCandidate[]> {
	let allCandidates: ImageCandidate[] = [];

	for (const query of queries) {
		if (allCandidates.length >= 8) break; // Limit total candidates

		try {
			const candidates = await fetchImageCandidates(query);
			allCandidates = allCandidates.concat(candidates);
		} catch (error) {
			console.warn(`Failed to fetch for query "${query}":`, error);
		}
	}

	return allCandidates;
}

async function fetchImageCandidates(query: string): Promise<ImageCandidate[]> {
	const encodedQuery = encodeURIComponent(query);
	const url = `https://www.googleapis.com/customsearch/v1?q=${encodedQuery}&cx=${GOOGLE_CX}&searchType=image&imgType=photo&num=8&safe=active&key=${GOOGLE_API_KEY}`;

	for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
		try {
			const response = await fetch(url);

			if (!response.ok) {
				if (response.status === 429 && attempt < MAX_RETRIES) {
					await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
					continue;
				}
				throw new Error(`HTTP ${response.status}: ${response.statusText}`);
			}

			const data = await response.json();

			if (data.error) {
				throw new Error(data.error.message || "Google API error");
			}

			const items = data.items || [];
			return items.map((item: any) => ({
				link: item.link,
				mime: item.mime,
				title: item.title,
				snippet: item.snippet,
				image: item.image,
				source: item.displayLink,
				query: query,
			}));

		} catch (error) {
			if (attempt === MAX_RETRIES) throw error;
			await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
		}
	}

	return [];
}

function scoreAndSortCandidates(candidates: ImageCandidate[]): ImageCandidate[] {
	const filtered = candidates.filter(candidate =>
		candidate.link &&
		ALLOWED_EXT.some(ext =>
			candidate.link.toLowerCase().includes(ext)
		)
	);

	return filtered
	.map(candidate => ({
		...candidate,
		score: calculateCandidateScore(candidate)
	}))
	.sort((a, b) => (b.score || 0) - (a.score || 0));
}

function calculateCandidateScore(candidate: ImageCandidate): number {
	let score = 0;

	const width = candidate.image?.width ? Number(candidate.image.width) : 0;
	const height = candidate.image?.height ? Number(candidate.image.height) : 0;
	const megapixels = (width * height) / 1_000_000;

	if (megapixels > 2) score += 10; // Excellent resolution
	else if (megapixels > 0.5) score += 5; // Good resolution
	else if (megapixels > 0.1) score += 2; // Acceptable resolution

	// Source authority scoring
	try {
		const host = new URL(candidate.link).hostname;
		const hostIndex = HOST_PRIORITIES.findIndex(priority =>
			host.includes(priority)
		);
		if (hostIndex !== -1) {
			score += (HOST_PRIORITIES.length - hostIndex) * 15;
		}
	} catch {
		// Invalid URL, no points for host
	}

	// Aspect ratio preference (avoid extreme ratios)
	if (width && height) {
		const aspectRatio = width / height;
		if (aspectRatio > 0.6 && aspectRatio < 1.8) {
			score += 3; // Prefer normal aspect ratios
		}
	}

	// File format bonus
	const mime = candidate.mime || candidate.link?.split(".").pop();
	if (mime && /jpe?g|png|webp/i.test(String(mime))) {
		score += 5;
	}

	return score;
}

function selectBestCandidate(candidates: ImageCandidate[]): ImageCandidate | null {
	return candidates.length > 0 ? candidates[0] : null;
}

async function validateImageUrl(url: string): Promise<boolean> {
	try {
		const response = await fetch(url, {
			method: 'HEAD',
			mode: 'no-cors'
		});
		return true;
	} catch {
		try {
			const img = new Image();
			return await new Promise((resolve) => {
				img.onload = () => resolve(true);
				img.onerror = () => resolve(false);
				img.src = url;
				setTimeout(() => resolve(false), 5000); // Timeout after 5 seconds
			});
		} catch {
			return false;
		}
	}
}

function getCachedData(cacheKey: string): CacheData | null {
	try {
		const cached = localStorage.getItem(cacheKey);
		if (!cached) return null;

		const parsed = JSON.parse(cached) as CacheData;
		if (Date.now() - parsed.timestamp > CACHE_DURATION) {
			localStorage.removeItem(cacheKey);
			return null;
		}

		return parsed;
	} catch {
		localStorage.removeItem(cacheKey);
		return null;
	}
}

function cacheData(cacheKey: string, data: CacheData): void {
	try {
		localStorage.setItem(cacheKey, JSON.stringify(data));
	} catch (error) {
		console.warn("Failed to cache image data:", error);
	}
}