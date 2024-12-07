export type Iter<T> = Iterator<T, undefined, undefined>;

export function* zip<A, B>(a: Iter<A>, b: Iter<B>): Iter<[A, B]> {
    let aNext = a.next();
    let bNext = b.next();
    while (!aNext.done && !bNext.done) {
        yield [aNext.value, bNext.value];
        aNext = a.next();
        bNext = b.next();
    }
}

export function iterable<T>(i: Iter<T>): Iterable<T, undefined, undefined> {
    return {
        [Symbol.iterator]: () => i,
    };
}

export function iterate<T>(i: T[]): Iter<T> {
    return i[Symbol.iterator]();
}

export function* range(a: number, b: number): Iter<number> {
    for (let i = a; i < b; i++) {
        yield i;
    }
}

export function* map<T, U>(i: Iter<T>, f: (t: T) => U): Iter<U> {
    for (let next = i.next(); !next.done; next = i.next()) {
        yield f(next.value);
    }
}

export function* scan<A, T, U>(
    i: Iter<T>,
    f: (a: A, t: T) => [A, U],
    a: A
): Iter<U> {
    for (let next = i.next(); !next.done; next = i.next()) {
        const result = f(a, next.value);
        a = result[0];
        yield result[1];
    }
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

export function* gaps(i: Iter<number>): Iter<number> {
    let prev = 0;
    for (let pc = i.next(); !pc.done; pc = i.next()) {
        while (prev < pc.value) {
            yield prev;
            prev++;
        }
    }
}
