export interface Entry {
    readonly name: string;
    meta?: string;
    body: string;
    view?: View;
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
    index: number;
    route: string;
    isSet: boolean;
}

