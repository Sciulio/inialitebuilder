interface Array<T> {
    mapAsync<W>(cback: (item: T, idx: number) => Promise<W>): Promise<W[]>;
    forEachAsync(cback: (item: T, idx: number) => Promise<void>): Promise<void>;
    filterAsync(cback: (item: T, idx: number) => Promise<boolean>): Promise<T[]>;
}
