export type Iter<T> = Iterator<T, undefined, undefined>;

export function iterable<T>(i: Iter<T>): Iterable<T, undefined, undefined> {
    return {
        [Symbol.iterator]: () => i,
    };
}

export function* enumerate<T>(i: Iter<T>): Iter<[number, T]> {
    let n = 0;
    for (let next = i.next(); !next.done; next = i.next()) {
        yield [n, next.value];
        n++;
    }
}

export function* filter<T>(i: Iter<T>, f: (t: T) => boolean): Iter<T> {
    for (let next = i.next(); !next.done; next = i.next()) {
        if (f(next.value)) {
            yield next.value;
        }
    }
}
