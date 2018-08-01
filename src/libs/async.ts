type tCatchHandler<T> = (err: Error, item: T, idx: number) => void;
type tDefaultValueOrCatchHandler<T, W> = W | ((err: Error, item: T, idx: number) => W)

interface Array<T> {
  mapAsync<W>(
    cback: (item: T, idx: number) => Promise<W>,
    defaultValueOrCatchHandler?: tDefaultValueOrCatchHandler<T, W>
  ): Promise<W[]>;

  forEachAsync(
    cback: (item: T, idx: number) => Promise<void>,
    catchHandler?: tCatchHandler<T>
  ): Promise<void>;

  filterAsync(
    cback: (item: T, idx: number) => Promise<boolean>,
    defaultValueOrCatchHandler?:  tDefaultValueOrCatchHandler<T, boolean>
  ): Promise<T[]>;
}

Array.prototype.mapAsync = async function <T, W>(
  cback: (item: T, idx: number) => Promise<W>,
  defaultValueOrCatchHandler?: tDefaultValueOrCatchHandler<T, W>
): Promise<W[]> {
  if (defaultValueOrCatchHandler) {
    return await Promise.all(this.map(async (item, idx) => {
      try {
        return await cback(item, idx);
      } catch (e) {
        if (typeof defaultValueOrCatchHandler == "function") {
          return defaultValueOrCatchHandler(e, item, idx);
        }
      }
      return defaultValueOrCatchHandler;
    }));
  } else {
    //return await Promise.all(this.map(async (item, idx) => await cback(item, idx)));
    return await Promise.all(this.map(await cback));
  }
}

Array.prototype.forEachAsync = async function <T>(
  cback: (item: T, idx: number) => Promise<void>,
  catchHandler?: (err: Error, item: T, idx: number) => void
): Promise<void> {
  await this.mapAsync(cback, catchHandler);
}

Array.prototype.filterAsync = async function <T>(
  cback: (item: T, idx: number) => Promise<boolean>,
  defaultValueOrCatchHandler?: tDefaultValueOrCatchHandler<T, boolean>
): Promise<T[]> {
  const clone = this.slice(0);
  const indices: number[] = [];

  if (defaultValueOrCatchHandler) {
    await this.mapAsync(async (item, idx) => {
      if (!await cback(item, idx)) {
        indices.push(idx);
      }
    }, (err, item, idx) => {
      if (typeof defaultValueOrCatchHandler == "function" ?
        defaultValueOrCatchHandler(err, item, idx) :
        defaultValueOrCatchHandler
      ) {
        indices.push(idx);
      }
    });
  } else {
    await this.mapAsync(async (item, idx) => {
      if (!await cback(item, idx)) {
        indices.push(idx);
      }
    });
  }

  return clone.filter((item, idx) => !indices.some(id => id == idx));
}