export interface Entry {
    readonly name: string;
    readonly date?: string;
    readonly edit?: string;
    readonly team?: string[];
    meta?: string;
    body: string;
};

export interface Filter {
    readonly anchor: string;
    readonly typing: unknown;
    readonly status: string;
    readonly source: string;
    isSeen: boolean;
};

