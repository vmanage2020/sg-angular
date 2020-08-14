// Table data
export interface Table {
    name: string;
    abbreviation: string;
    state: string;
    mobile: number;
    country: string;
    email: string;
}

// Search Data
export interface SearchResult {
    tables: Table[];
    total: number;
}
