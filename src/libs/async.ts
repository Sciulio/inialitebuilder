interface Array<T> {
  mapAsync<W>(cback: (item: T, idx: number) => Promise<W>): Promise<W[]>;
  forEachAsync(cback: (item: T, idx: number) => Promise<void>): Promise<void>;
  filterAsync(cback: (item: T, idx: number) => Promise<boolean>): Promise<T[]>;
}

Array.prototype.mapAsync = async function<T, W>(cback: (item: T, idx: number) => Promise<W>): Promise<W[]> {
  return await Promise.all(this.map(async (item, idx) => await cback(item, idx) ));
}
Array.prototype.forEachAsync = async function<T>(cback: (item: T, idx: number) => Promise<void>): Promise<void> {
  await this.mapAsync(cback);
}
//TODO: preserve sort
Array.prototype.filterAsync = async function<T>(cback: (item: T, idx: number) => Promise<boolean>): Promise<T[]> {
  const resArray: T[] = [];

  await this.mapAsync(async (item, idx) => {
    if (await cback(item, idx)) {
      resArray.push(item);
    }
  });

  return resArray;
}