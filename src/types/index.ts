export interface Entry {
    readonly name: string;
    readonly date: string;
    body: string;
};

export interface Filter {
    readonly anchor: string;
    readonly typing: unknown;
    readonly status: string;
    readonly source: string;
    isOpen: boolean;
};

