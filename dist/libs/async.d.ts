declare type tCatchHandler<T> = (err: Error, item: T, idx: number) => void;
declare type tDefaultValueOrCatchHandler<T, W> = W | ((err: Error, item: T, idx: number) => W);
interface Array<T> {
    mapAsync<W>(cback: (item: T, idx: number) => Promise<W>, defaultValueOrCatchHandler?: tDefaultValueOrCatchHandler<T, W>): Promise<W[]>;
    forEachAsync(cback: (item: T, idx: number) => Promise<void>, catchHandler?: tCatchHandler<T>): Promise<void>;
    filterAsync(cback: (item: T, idx: number) => Promise<boolean>, defaultValueOrCatchHandler?: tDefaultValueOrCatchHandler<T, boolean>): Promise<T[]>;
}
