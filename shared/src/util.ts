export type Iter<T> = Iterator<T, undefined, undefined> &
    Iterable<T, undefined, undefined>;

export function* zip<A, B>(a: Iter<A>, b: Iter<B>): Iter<[A, B]> {
    let aNext = a.next();
    let bNext = b.next();
    while (!aNext.done && !bNext.done) {
        yield [aNext.value, bNext.value];
        aNext = a.next();
        bNext = b.next();
    }
}

export function iterate<T>(i: T[]): Iter<T> {
    return i[Symbol.iterator]();
}

export function* range(a: number, b: number): Iter<number> {
    for (let i = a; i < b; i++) {
        yield i;
    }
}

export function* chain<T>(a: Iter<T>, b: Iter<T>): Iter<T> {
    yield* a;
    yield* b;
}

export function* map<T, U>(i: Iter<T>, f: (t: T) => U): Iter<U> {
    for (const t of i) {
        yield f(t);
    }
}

export function* scan<A, T, U>(
    i: Iter<T>,
    f: (a: A, t: T) => [A, U],
    a: A
): Iter<U> {
    for (const t of i) {
        const result = f(a, t);
        a = result[0];
        yield result[1];
    }
}

export function* enumerate<T>(i: Iter<T>): Iter<[number, T]> {
    let n = 0;
    for (const t of i) {
        yield [n, t];
        n++;
    }
}

export function filter<T>(i: Iter<T>, f: (t: T) => boolean): Iter<T>;
export function* filter<T>(i: Iter<T>, f: (t: T) => boolean): Iter<T> {
    for (const t of i) {
        if (f(t)) {
            yield t;
        }
    }
}

export function* gaps(i: Iter<number>): Iter<number> {
    let prev = 0;
    for (const pc of i) {
        while (prev < pc) {
            yield prev;
            prev++;
        }
    }
}
