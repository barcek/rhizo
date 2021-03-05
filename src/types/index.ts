export interface Entry {
    readonly name: string;
    meta?: string;
    body: string;
};

export interface Filter {
    readonly nature: string;
    readonly anchor: string;
    readonly typing: unknown;
    readonly status: string;
    readonly source: string;
    isSeen: boolean;
};

export interface View {
    readonly index: number;
    readonly route: string;
    isSet: boolean;
}

