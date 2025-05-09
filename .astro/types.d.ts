declare module 'astro:content' {
	interface Render {
		'.mdx': Promise<{
			Content: import('astro').MarkdownInstance<{}>['Content'];
			headings: import('astro').MarkdownHeading[];
			remarkPluginFrontmatter: Record<string, any>;
		}>;
	}
}

declare module 'astro:content' {
	interface Render {
		'.md': Promise<{
			Content: import('astro').MarkdownInstance<{}>['Content'];
			headings: import('astro').MarkdownHeading[];
			remarkPluginFrontmatter: Record<string, any>;
		}>;
	}
}

declare module 'astro:content' {
	export { z } from 'astro/zod';

	type Flatten<T> = T extends { [K: string]: infer U } ? U : never;

	export type CollectionKey = keyof AnyEntryMap;
	export type CollectionEntry<C extends CollectionKey> = Flatten<AnyEntryMap[C]>;

	export type ContentCollectionKey = keyof ContentEntryMap;
	export type DataCollectionKey = keyof DataEntryMap;

	// This needs to be in sync with ImageMetadata
	export type ImageFunction = () => import('astro/zod').ZodObject<{
		src: import('astro/zod').ZodString;
		width: import('astro/zod').ZodNumber;
		height: import('astro/zod').ZodNumber;
		format: import('astro/zod').ZodUnion<
			[
				import('astro/zod').ZodLiteral<'png'>,
				import('astro/zod').ZodLiteral<'jpg'>,
				import('astro/zod').ZodLiteral<'jpeg'>,
				import('astro/zod').ZodLiteral<'tiff'>,
				import('astro/zod').ZodLiteral<'webp'>,
				import('astro/zod').ZodLiteral<'gif'>,
				import('astro/zod').ZodLiteral<'svg'>,
				import('astro/zod').ZodLiteral<'avif'>,
			]
		>;
	}>;

	type BaseSchemaWithoutEffects =
		| import('astro/zod').AnyZodObject
		| import('astro/zod').ZodUnion<[BaseSchemaWithoutEffects, ...BaseSchemaWithoutEffects[]]>
		| import('astro/zod').ZodDiscriminatedUnion<string, import('astro/zod').AnyZodObject[]>
		| import('astro/zod').ZodIntersection<BaseSchemaWithoutEffects, BaseSchemaWithoutEffects>;

	type BaseSchema =
		| BaseSchemaWithoutEffects
		| import('astro/zod').ZodEffects<BaseSchemaWithoutEffects>;

	export type SchemaContext = { image: ImageFunction };

	type DataCollectionConfig<S extends BaseSchema> = {
		type: 'data';
		schema?: S | ((context: SchemaContext) => S);
	};

	type ContentCollectionConfig<S extends BaseSchema> = {
		type?: 'content';
		schema?: S | ((context: SchemaContext) => S);
	};

	type CollectionConfig<S> = ContentCollectionConfig<S> | DataCollectionConfig<S>;

	export function defineCollection<S extends BaseSchema>(
		input: CollectionConfig<S>
	): CollectionConfig<S>;

	type AllValuesOf<T> = T extends any ? T[keyof T] : never;
	type ValidContentEntrySlug<C extends keyof ContentEntryMap> = AllValuesOf<
		ContentEntryMap[C]
	>['slug'];

	export function getEntryBySlug<
		C extends keyof ContentEntryMap,
		E extends ValidContentEntrySlug<C> | (string & {}),
	>(
		collection: C,
		// Note that this has to accept a regular string too, for SSR
		entrySlug: E
	): E extends ValidContentEntrySlug<C>
		? Promise<CollectionEntry<C>>
		: Promise<CollectionEntry<C> | undefined>;

	export function getDataEntryById<C extends keyof DataEntryMap, E extends keyof DataEntryMap[C]>(
		collection: C,
		entryId: E
	): Promise<CollectionEntry<C>>;

	export function getCollection<C extends keyof AnyEntryMap, E extends CollectionEntry<C>>(
		collection: C,
		filter?: (entry: CollectionEntry<C>) => entry is E
	): Promise<E[]>;
	export function getCollection<C extends keyof AnyEntryMap>(
		collection: C,
		filter?: (entry: CollectionEntry<C>) => unknown
	): Promise<CollectionEntry<C>[]>;

	export function getEntry<
		C extends keyof ContentEntryMap,
		E extends ValidContentEntrySlug<C> | (string & {}),
	>(entry: {
		collection: C;
		slug: E;
	}): E extends ValidContentEntrySlug<C>
		? Promise<CollectionEntry<C>>
		: Promise<CollectionEntry<C> | undefined>;
	export function getEntry<
		C extends keyof DataEntryMap,
		E extends keyof DataEntryMap[C] | (string & {}),
	>(entry: {
		collection: C;
		id: E;
	}): E extends keyof DataEntryMap[C]
		? Promise<DataEntryMap[C][E]>
		: Promise<CollectionEntry<C> | undefined>;
	export function getEntry<
		C extends keyof ContentEntryMap,
		E extends ValidContentEntrySlug<C> | (string & {}),
	>(
		collection: C,
		slug: E
	): E extends ValidContentEntrySlug<C>
		? Promise<CollectionEntry<C>>
		: Promise<CollectionEntry<C> | undefined>;
	export function getEntry<
		C extends keyof DataEntryMap,
		E extends keyof DataEntryMap[C] | (string & {}),
	>(
		collection: C,
		id: E
	): E extends keyof DataEntryMap[C]
		? Promise<DataEntryMap[C][E]>
		: Promise<CollectionEntry<C> | undefined>;

	/** Resolve an array of entry references from the same collection */
	export function getEntries<C extends keyof ContentEntryMap>(
		entries: {
			collection: C;
			slug: ValidContentEntrySlug<C>;
		}[]
	): Promise<CollectionEntry<C>[]>;
	export function getEntries<C extends keyof DataEntryMap>(
		entries: {
			collection: C;
			id: keyof DataEntryMap[C];
		}[]
	): Promise<CollectionEntry<C>[]>;

	export function reference<C extends keyof AnyEntryMap>(
		collection: C
	): import('astro/zod').ZodEffects<
		import('astro/zod').ZodString,
		C extends keyof ContentEntryMap
			? {
					collection: C;
					slug: ValidContentEntrySlug<C>;
			  }
			: {
					collection: C;
					id: keyof DataEntryMap[C];
			  }
	>;
	// Allow generic `string` to avoid excessive type errors in the config
	// if `dev` is not running to update as you edit.
	// Invalid collection names will be caught at build time.
	export function reference<C extends string>(
		collection: C
	): import('astro/zod').ZodEffects<import('astro/zod').ZodString, never>;

	type ReturnTypeOrOriginal<T> = T extends (...args: any[]) => infer R ? R : T;
	type InferEntrySchema<C extends keyof AnyEntryMap> = import('astro/zod').infer<
		ReturnTypeOrOriginal<Required<ContentConfig['collections'][C]>['schema']>
	>;

	type ContentEntryMap = {
		"alumni": {
"Abdulazeez.md": {
	id: "Abdulazeez.md";
  slug: "abdulazeez";
  body: string;
  collection: "alumni";
  data: any
} & { render(): Render[".md"] };
"Chisom.md": {
	id: "Chisom.md";
  slug: "chisom";
  body: string;
  collection: "alumni";
  data: any
} & { render(): Render[".md"] };
"Eniola.md": {
	id: "Eniola.md";
  slug: "eniola";
  body: string;
  collection: "alumni";
  data: any
} & { render(): Render[".md"] };
"Favour.md": {
	id: "Favour.md";
  slug: "favour";
  body: string;
  collection: "alumni";
  data: any
} & { render(): Render[".md"] };
"George.md": {
	id: "George.md";
  slug: "george";
  body: string;
  collection: "alumni";
  data: any
} & { render(): Render[".md"] };
"Gorretti.md": {
	id: "Gorretti.md";
  slug: "gorretti";
  body: string;
  collection: "alumni";
  data: any
} & { render(): Render[".md"] };
"Ihuoma.md": {
	id: "Ihuoma.md";
  slug: "ihuoma";
  body: string;
  collection: "alumni";
  data: any
} & { render(): Render[".md"] };
"IjeomaOnwuka.md": {
	id: "IjeomaOnwuka.md";
  slug: "ijeomaonwuka";
  body: string;
  collection: "alumni";
  data: any
} & { render(): Render[".md"] };
"Mayowa-Abikoye.md": {
	id: "Mayowa-Abikoye.md";
  slug: "mayowa-abikoye";
  body: string;
  collection: "alumni";
  data: any
} & { render(): Render[".md"] };
"Mayowa.md": {
	id: "Mayowa.md";
  slug: "mayowa";
  body: string;
  collection: "alumni";
  data: any
} & { render(): Render[".md"] };
"Olushola.md": {
	id: "Olushola.md";
  slug: "olushola";
  body: string;
  collection: "alumni";
  data: any
} & { render(): Render[".md"] };
"Samruddhi.md": {
	id: "Samruddhi.md";
  slug: "samruddhi";
  body: string;
  collection: "alumni";
  data: any
} & { render(): Render[".md"] };
"Wisdom-Ngwueche.md": {
	id: "Wisdom-Ngwueche.md";
  slug: "wisdom-ngwueche";
  body: string;
  collection: "alumni";
  data: any
} & { render(): Render[".md"] };
"Wisdom.md": {
	id: "Wisdom.md";
  slug: "wisdom";
  body: string;
  collection: "alumni";
  data: any
} & { render(): Render[".md"] };
"akshat.md": {
	id: "akshat.md";
  slug: "akshat";
  body: string;
  collection: "alumni";
  data: any
} & { render(): Render[".md"] };
"alhassan-joshua.md": {
	id: "alhassan-joshua.md";
  slug: "alhassan-joshua";
  body: string;
  collection: "alumni";
  data: any
} & { render(): Render[".md"] };
"amara.md": {
	id: "amara.md";
  slug: "amara";
  body: string;
  collection: "alumni";
  data: any
} & { render(): Render[".md"] };
"anuoluwapo.md": {
	id: "anuoluwapo.md";
  slug: "anuoluwapo";
  body: string;
  collection: "alumni";
  data: any
} & { render(): Render[".md"] };
"arafat.md": {
	id: "arafat.md";
  slug: "arafat";
  body: string;
  collection: "alumni";
  data: any
} & { render(): Render[".md"] };
"audrey.md": {
	id: "audrey.md";
  slug: "audrey";
  body: string;
  collection: "alumni";
  data: any
} & { render(): Render[".md"] };
"blessing.md": {
	id: "blessing.md";
  slug: "blessing";
  body: string;
  collection: "alumni";
  data: any
} & { render(): Render[".md"] };
"catherine.md": {
	id: "catherine.md";
  slug: "catherine";
  body: string;
  collection: "alumni";
  data: any
} & { render(): Render[".md"] };
"damilola.md": {
	id: "damilola.md";
  slug: "damilola";
  body: string;
  collection: "alumni";
  data: any
} & { render(): Render[".md"] };
"daniel.md": {
	id: "daniel.md";
  slug: "daniel";
  body: string;
  collection: "alumni";
  data: any
} & { render(): Render[".md"] };
"danyal.md": {
	id: "danyal.md";
  slug: "danyal";
  body: string;
  collection: "alumni";
  data: any
} & { render(): Render[".md"] };
"darko.md": {
	id: "darko.md";
  slug: "darko";
  body: string;
  collection: "alumni";
  data: any
} & { render(): Render[".md"] };
"david.md": {
	id: "david.md";
  slug: "david";
  body: string;
  collection: "alumni";
  data: any
} & { render(): Render[".md"] };
"deborah.md": {
	id: "deborah.md";
  slug: "deborah";
  body: string;
  collection: "alumni";
  data: any
} & { render(): Render[".md"] };
"desmond.md": {
	id: "desmond.md";
  slug: "desmond";
  body: string;
  collection: "alumni";
  data: any
} & { render(): Render[".md"] };
"ella.md": {
	id: "ella.md";
  slug: "ella";
  body: string;
  collection: "alumni";
  data: any
} & { render(): Render[".md"] };
"ese.md": {
	id: "ese.md";
  slug: "ese";
  body: string;
  collection: "alumni";
  data: any
} & { render(): Render[".md"] };
"felicia.md": {
	id: "felicia.md";
  slug: "felicia";
  body: string;
  collection: "alumni";
  data: any
} & { render(): Render[".md"] };
"geoffrey.md": {
	id: "geoffrey.md";
  slug: "geoffrey";
  body: string;
  collection: "alumni";
  data: any
} & { render(): Render[".md"] };
"gloria.md": {
	id: "gloria.md";
  slug: "gloria";
  body: string;
  collection: "alumni";
  data: any
} & { render(): Render[".md"] };
"harpreet.md": {
	id: "harpreet.md";
  slug: "harpreet";
  body: string;
  collection: "alumni";
  data: any
} & { render(): Render[".md"] };
"ijeoma.md": {
	id: "ijeoma.md";
  slug: "ijeoma";
  body: string;
  collection: "alumni";
  data: any
} & { render(): Render[".md"] };
"jamin.md": {
	id: "jamin.md";
  slug: "jamin";
  body: string;
  collection: "alumni";
  data: any
} & { render(): Render[".md"] };
"joshua.md": {
	id: "joshua.md";
  slug: "joshua";
  body: string;
  collection: "alumni";
  data: any
} & { render(): Render[".md"] };
"khadijah.md": {
	id: "khadijah.md";
  slug: "khadijah";
  body: string;
  collection: "alumni";
  data: any
} & { render(): Render[".md"] };
"makanju.md": {
	id: "makanju.md";
  slug: "makanju";
  body: string;
  collection: "alumni";
  data: any
} & { render(): Render[".md"] };
"maryblessing.md": {
	id: "maryblessing.md";
  slug: "maryblessing";
  body: string;
  collection: "alumni";
  data: any
} & { render(): Render[".md"] };
"musab.md": {
	id: "musab.md";
  slug: "musab";
  body: string;
  collection: "alumni";
  data: any
} & { render(): Render[".md"] };
"ngozi_peace.md": {
	id: "ngozi_peace.md";
  slug: "ngozi_peace";
  body: string;
  collection: "alumni";
  data: any
} & { render(): Render[".md"] };
"ojochogwu.md": {
	id: "ojochogwu.md";
  slug: "ojochogwu";
  body: string;
  collection: "alumni";
  data: any
} & { render(): Render[".md"] };
"olamiji.md": {
	id: "olamiji.md";
  slug: "olamiji";
  body: string;
  collection: "alumni";
  data: any
} & { render(): Render[".md"] };
"olanetsoft.md": {
	id: "olanetsoft.md";
  slug: "olanetsoft";
  body: string;
  collection: "alumni";
  data: any
} & { render(): Render[".md"] };
"reet.md": {
	id: "reet.md";
  slug: "reet";
  body: string;
  collection: "alumni";
  data: any
} & { render(): Render[".md"] };
"stacy.md": {
	id: "stacy.md";
  slug: "stacy";
  body: string;
  collection: "alumni";
  data: any
} & { render(): Render[".md"] };
"teri.md": {
	id: "teri.md";
  slug: "teri";
  body: string;
  collection: "alumni";
  data: any
} & { render(): Render[".md"] };
"wachiou.md": {
	id: "wachiou.md";
  slug: "wachiou";
  body: string;
  collection: "alumni";
  data: any
} & { render(): Render[".md"] };
};
"cohort": {
"Samruddhi.md": {
	id: "Samruddhi.md";
  slug: "samruddhi";
  body: string;
  collection: "cohort";
  data: any
} & { render(): Render[".md"] };
"Stacy.md": {
	id: "Stacy.md";
  slug: "stacy";
  body: string;
  collection: "cohort";
  data: any
} & { render(): Render[".md"] };
};
"cohort-3": {
"Abdulazeez.md": {
	id: "Abdulazeez.md";
  slug: "abdulazeez";
  body: string;
  collection: "cohort-3";
  data: any
} & { render(): Render[".md"] };
"Chisom.md": {
	id: "Chisom.md";
  slug: "chisom";
  body: string;
  collection: "cohort-3";
  data: any
} & { render(): Render[".md"] };
"Eniola.md": {
	id: "Eniola.md";
  slug: "eniola";
  body: string;
  collection: "cohort-3";
  data: any
} & { render(): Render[".md"] };
"Favour.md": {
	id: "Favour.md";
  slug: "favour";
  body: string;
  collection: "cohort-3";
  data: any
} & { render(): Render[".md"] };
"George.md": {
	id: "George.md";
  slug: "george";
  body: string;
  collection: "cohort-3";
  data: any
} & { render(): Render[".md"] };
"Gorretti.md": {
	id: "Gorretti.md";
  slug: "gorretti";
  body: string;
  collection: "cohort-3";
  data: any
} & { render(): Render[".md"] };
"Harpreet.md": {
	id: "Harpreet.md";
  slug: "harpreet";
  body: string;
  collection: "cohort-3";
  data: any
} & { render(): Render[".md"] };
"Ihuoma.md": {
	id: "Ihuoma.md";
  slug: "ihuoma";
  body: string;
  collection: "cohort-3";
  data: any
} & { render(): Render[".md"] };
"IjeomaOnwuka.md": {
	id: "IjeomaOnwuka.md";
  slug: "ijeomaonwuka";
  body: string;
  collection: "cohort-3";
  data: any
} & { render(): Render[".md"] };
"Mayowa-Abikoye.md": {
	id: "Mayowa-Abikoye.md";
  slug: "mayowa-abikoye";
  body: string;
  collection: "cohort-3";
  data: any
} & { render(): Render[".md"] };
"Mayowa.md": {
	id: "Mayowa.md";
  slug: "mayowa";
  body: string;
  collection: "cohort-3";
  data: any
} & { render(): Render[".md"] };
"Olushola.md": {
	id: "Olushola.md";
  slug: "olushola";
  body: string;
  collection: "cohort-3";
  data: any
} & { render(): Render[".md"] };
"Samruddhi.md": {
	id: "Samruddhi.md";
  slug: "samruddhi";
  body: string;
  collection: "cohort-3";
  data: any
} & { render(): Render[".md"] };
"Wisdom-Ngwueche.md": {
	id: "Wisdom-Ngwueche.md";
  slug: "wisdom-ngwueche";
  body: string;
  collection: "cohort-3";
  data: any
} & { render(): Render[".md"] };
"Wisdom.md": {
	id: "Wisdom.md";
  slug: "wisdom";
  body: string;
  collection: "cohort-3";
  data: any
} & { render(): Render[".md"] };
"akshat.md": {
	id: "akshat.md";
  slug: "akshat";
  body: string;
  collection: "cohort-3";
  data: any
} & { render(): Render[".md"] };
"amara.md": {
	id: "amara.md";
  slug: "amara";
  body: string;
  collection: "cohort-3";
  data: any
} & { render(): Render[".md"] };
"anuoluwapo.md": {
	id: "anuoluwapo.md";
  slug: "anuoluwapo";
  body: string;
  collection: "cohort-3";
  data: any
} & { render(): Render[".md"] };
"arafat.md": {
	id: "arafat.md";
  slug: "arafat";
  body: string;
  collection: "cohort-3";
  data: any
} & { render(): Render[".md"] };
"audrey.md": {
	id: "audrey.md";
  slug: "audrey";
  body: string;
  collection: "cohort-3";
  data: any
} & { render(): Render[".md"] };
"catherine.md": {
	id: "catherine.md";
  slug: "catherine";
  body: string;
  collection: "cohort-3";
  data: any
} & { render(): Render[".md"] };
"daniel.md": {
	id: "daniel.md";
  slug: "daniel";
  body: string;
  collection: "cohort-3";
  data: any
} & { render(): Render[".md"] };
"danyal.md": {
	id: "danyal.md";
  slug: "danyal";
  body: string;
  collection: "cohort-3";
  data: any
} & { render(): Render[".md"] };
"david.md": {
	id: "david.md";
  slug: "david";
  body: string;
  collection: "cohort-3";
  data: any
} & { render(): Render[".md"] };
"deborah.md": {
	id: "deborah.md";
  slug: "deborah";
  body: string;
  collection: "cohort-3";
  data: any
} & { render(): Render[".md"] };
"ella.md": {
	id: "ella.md";
  slug: "ella";
  body: string;
  collection: "cohort-3";
  data: any
} & { render(): Render[".md"] };
"ese.md": {
	id: "ese.md";
  slug: "ese";
  body: string;
  collection: "cohort-3";
  data: any
} & { render(): Render[".md"] };
"felicia.md": {
	id: "felicia.md";
  slug: "felicia";
  body: string;
  collection: "cohort-3";
  data: any
} & { render(): Render[".md"] };
"geoffrey.md": {
	id: "geoffrey.md";
  slug: "geoffrey";
  body: string;
  collection: "cohort-3";
  data: any
} & { render(): Render[".md"] };
"ijeoma.md": {
	id: "ijeoma.md";
  slug: "ijeoma";
  body: string;
  collection: "cohort-3";
  data: any
} & { render(): Render[".md"] };
"jamin.md": {
	id: "jamin.md";
  slug: "jamin";
  body: string;
  collection: "cohort-3";
  data: any
} & { render(): Render[".md"] };
"joshua.md": {
	id: "joshua.md";
  slug: "joshua";
  body: string;
  collection: "cohort-3";
  data: any
} & { render(): Render[".md"] };
"makanju.md": {
	id: "makanju.md";
  slug: "makanju";
  body: string;
  collection: "cohort-3";
  data: any
} & { render(): Render[".md"] };
"musab.md": {
	id: "musab.md";
  slug: "musab";
  body: string;
  collection: "cohort-3";
  data: any
} & { render(): Render[".md"] };
"ngozi_peace.md": {
	id: "ngozi_peace.md";
  slug: "ngozi_peace";
  body: string;
  collection: "cohort-3";
  data: any
} & { render(): Render[".md"] };
"ojochogwu.md": {
	id: "ojochogwu.md";
  slug: "ojochogwu";
  body: string;
  collection: "cohort-3";
  data: any
} & { render(): Render[".md"] };
"olamiji.md": {
	id: "olamiji.md";
  slug: "olamiji";
  body: string;
  collection: "cohort-3";
  data: any
} & { render(): Render[".md"] };
"stacy.md": {
	id: "stacy.md";
  slug: "stacy";
  body: string;
  collection: "cohort-3";
  data: any
} & { render(): Render[".md"] };
"wachiou.md": {
	id: "wachiou.md";
  slug: "wachiou";
  body: string;
  collection: "cohort-3";
  data: any
} & { render(): Render[".md"] };
};
"cohort-4": {
"abdul-qawi-laniyan.md": {
	id: "abdul-qawi-laniyan.md";
  slug: "abdul-qawi-laniyan";
  body: string;
  collection: "cohort-4";
  data: any
} & { render(): Render[".md"] };
"samuel-uzor.md": {
	id: "samuel-uzor.md";
  slug: "samuel-uzor";
  body: string;
  collection: "cohort-4";
  data: any
} & { render(): Render[".md"] };
};
"curriculum": {
"community-building.md": {
	id: "community-building.md";
  slug: "community-building";
  body: string;
  collection: "curriculum";
  data: any
} & { render(): Render[".md"] };
"conferences-and-events.md": {
	id: "conferences-and-events.md";
  slug: "conferences-and-events";
  body: string;
  collection: "curriculum";
  data: any
} & { render(): Render[".md"] };
"content-creation.md": {
	id: "content-creation.md";
  slug: "content-creation";
  body: string;
  collection: "curriculum";
  data: any
} & { render(): Render[".md"] };
"dev-marketing-evangelism.md": {
	id: "dev-marketing-evangelism.md";
  slug: "dev-marketing-evangelism";
  body: string;
  collection: "curriculum";
  data: any
} & { render(): Render[".md"] };
"documentation-and-technical-writing.md": {
	id: "documentation-and-technical-writing.md";
  slug: "documentation-and-technical-writing";
  body: string;
  collection: "curriculum";
  data: any
} & { render(): Render[".md"] };
"dx-engineering.md": {
	id: "dx-engineering.md";
  slug: "dx-engineering";
  body: string;
  collection: "curriculum";
  data: any
} & { render(): Render[".md"] };
"metrics-and-value-prop.md": {
	id: "metrics-and-value-prop.md";
  slug: "metrics-and-value-prop";
  body: string;
  collection: "curriculum";
  data: any
} & { render(): Render[".md"] };
"open-source.md": {
	id: "open-source.md";
  slug: "open-source";
  body: string;
  collection: "curriculum";
  data: any
} & { render(): Render[".md"] };
};
"faqs": {
"have-more-questions.md": {
	id: "have-more-questions.md";
  slug: "have-more-questions";
  body: string;
  collection: "faqs";
  data: any
} & { render(): Render[".md"] };
"how-do-I-enroll.md": {
	id: "how-do-I-enroll.md";
  slug: "how-do-i-enroll";
  body: string;
  collection: "faqs";
  data: any
} & { render(): Render[".md"] };
"how-do-I-pay.md": {
	id: "how-do-I-pay.md";
  slug: "how-do-i-pay";
  body: string;
  collection: "faqs";
  data: any
} & { render(): Render[".md"] };
"what-is-dx-mentorship.md": {
	id: "what-is-dx-mentorship.md";
  slug: "what-is-dx-mentorship";
  body: string;
  collection: "faqs";
  data: any
} & { render(): Render[".md"] };
};
"graduates": {
"TEMPLATE.md": {
	id: "TEMPLATE.md";
  slug: "template";
  body: string;
  collection: "graduates";
  data: any
} & { render(): Render[".md"] };
};
"mentors": {
"angie.md": {
	id: "angie.md";
  slug: "angie";
  body: string;
  collection: "mentors";
  data: any
} & { render(): Render[".md"] };
"bdougie.md": {
	id: "bdougie.md";
  slug: "bdougie";
  body: string;
  collection: "mentors";
  data: any
} & { render(): Render[".md"] };
"chanel.md": {
	id: "chanel.md";
  slug: "chanel";
  body: string;
  collection: "mentors";
  data: any
} & { render(): Render[".md"] };
"chulo.md": {
	id: "chulo.md";
  slug: "chulo";
  body: string;
  collection: "mentors";
  data: any
} & { render(): Render[".md"] };
"dom.md": {
	id: "dom.md";
  slug: "dom";
  body: string;
  collection: "mentors";
  data: any
} & { render(): Render[".md"] };
"lisa.md": {
	id: "lisa.md";
  slug: "lisa";
  body: string;
  collection: "mentors";
  data: any
} & { render(): Render[".md"] };
"rizel.md": {
	id: "rizel.md";
  slug: "rizel";
  body: string;
  collection: "mentors";
  data: any
} & { render(): Render[".md"] };
"salma.md": {
	id: "salma.md";
  slug: "salma";
  body: string;
  collection: "mentors";
  data: any
} & { render(): Render[".md"] };
"tajas.md": {
	id: "tajas.md";
  slug: "tajas";
  body: string;
  collection: "mentors";
  data: any
} & { render(): Render[".md"] };
};
"posts": {
"DevRel-in-Open-Source.md": {
	id: "DevRel-in-Open-Source.md";
  slug: "devrel-in-open-source";
  body: string;
  collection: "posts";
  data: any
} & { render(): Render[".md"] };
"announcing-dxmentorship-cohort-3.md": {
	id: "announcing-dxmentorship-cohort-3.md";
  slug: "announcing-dxmentorship-cohort-3";
  body: string;
  collection: "posts";
  data: any
} & { render(): Render[".md"] };
"announcing-dxmentorship-cohort-4.md": {
	id: "announcing-dxmentorship-cohort-4.md";
  slug: "announcing-dxmentorship-cohort-4";
  body: string;
  collection: "posts";
  data: any
} & { render(): Render[".md"] };
"building-active-developer-communities-devrel.md": {
	id: "building-active-developer-communities-devrel.md";
  slug: "building-active-developer-communities-devrel";
  body: string;
  collection: "posts";
  data: any
} & { render(): Render[".md"] };
"effective-technical-documentation-developersohort.md": {
	id: "effective-technical-documentation-developersohort.md";
  slug: "effective-technical-documentation-developersohort";
  body: string;
  collection: "posts";
  data: any
} & { render(): Render[".md"] };
"hacktoberfest-for-dev-advocates.md": {
	id: "hacktoberfest-for-dev-advocates.md";
  slug: "hacktoberfest-for-dev-advocates";
  body: string;
  collection: "posts";
  data: any
} & { render(): Render[".md"] };
"mentorship-for-early-dev-advocates.md": {
	id: "mentorship-for-early-dev-advocates.md";
  slug: "mentorship-for-early-dev-advocates";
  body: string;
  collection: "posts";
  data: any
} & { render(): Render[".md"] };
};

	};

	type DataEntryMap = {
		
	};

	type AnyEntryMap = ContentEntryMap & DataEntryMap;

	type ContentConfig = never;
}
