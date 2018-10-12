export interface IOptional<T> {
    map<V>(transformer: (identity: T) => V | null | undefined): IOptional<V>;
    flatMap<V>(transformer: (identity: T) => IOptional<V>): IOptional<V>;
    filter(predicate: (identity: T) => boolean): IOptional<T>;
    get(): T | never;
    orElse<V = T | null>(value: V): T | V;
    orElseGet<V = T | null>(supplier: () => V): T | V;
    orElseThrow(supplier: () => Error): T | never;
    orNull(): T | null;
    or(supplier: () => IOptional<T>): IOptional<T>;
    fallback(other: IOptional<T>): IOptional<T>;
    isPresent(): boolean;
    isAbsent(): boolean;
    ifPresent(consumer: (value: T) => void): this;
    ifAbsent(unit: () => void): this;
    peek(onPresent: (value: T) => void, onAbsent: () => void): this;
    equals(other: IOptional<T>, comparator?: (a: T, b: T) => boolean): boolean;
    toString(): string;
}

export class Optional<T> implements IOptional<T> {
    private static EMPTY = new Optional<any>(null);

    private constructor(private readonly identity: T | null | undefined) {}

    public map<V>(transformer: (identity: T) => V | null | undefined): IOptional<V> {
        Optional.ensure(transformer);
        if (!this.isPresent()) {
            return Optional.empty();
        }
        const value = transformer(this.identity as T);
        return Optional.exists(value) ? new Optional(value) : Optional.empty();
    }

    public flatMap<V>(transformer: (identity: T) => IOptional<V>): IOptional<V> {
        if (this.isAbsent()) {
            return Optional.empty();
        }
        Optional.ensure(transformer);
        return Optional.ensure(transformer(this.identity as T));
    }

    public filter(predicate: (identity: T) => boolean): IOptional<T> {
        Optional.ensure(predicate);
        return !this.isPresent() || predicate(this.identity as T) ? this : Optional.empty();
    }

    public get(): T | never {
        return this.orElseThrow(() => new Error('Identity is not present'));
    }

    public orElse<V = T | null>(value: V): T | V {
        return this.isPresent() ? this.identity as T : value;
    }

    public orElseGet<V = T | null>(supplier: () => V): T | V {
        return this.isPresent() ? this.identity as T : Optional.ensure(supplier)();
    }

    public orElseThrow(supplier: () => Error): T | never {
        if (this.isPresent()) {
            return this.identity as T;
        }
        throw Optional.ensure(supplier)();
    }

    public orNull(): T | null {
        return this.orElse(null);
    }

    public or(supplier: () => IOptional<T>): IOptional<T> {
        if (this.isPresent()) {
            return this;
        }
        const result = Optional.ensure(supplier)();
        return Optional.ensure(result);
    }

    public fallback(other: IOptional<T>): IOptional<T> {
        return this.isPresent() ? this : Optional.ensure(other);
    }

    public isPresent(): boolean {
        return Optional.exists(this.identity);
    }

    public isAbsent(): boolean {
        return !Optional.exists(this.identity);
    }

    public ifPresent(consumer: (value: T) => void): this {
        if (this.isPresent()) {
            Optional.ensure(consumer)(this.identity as T);
        }
        return this;
    }

    public ifAbsent(unit: () => void): this {
        if (!this.identity) {
            Optional.ensure(unit)();
        }
        return this;
    }

    public peek(onPresent: (value: T) => void, onAbsent: () => void): this {
        return this.ifPresent(onPresent).ifAbsent(onAbsent);
    }

    public equals(other: IOptional<T>, comparator?: (a: T, b: T) => boolean): boolean {
        const present = this.isPresent();
        if (present !== other.isPresent()) {
            return false;
        } else if (!present) {
            return true;
        }
        const arbiter = comparator || ((a, b) => a === b);
        return arbiter(this.identity as T, other.get());
    }

    public toString(): string {
        const fill = this.isPresent() ? `identity=${this.identity}` : '';
        return `Optional {${fill}}`;
    }

    public static empty<T>(): IOptional<T> {
        return Optional.EMPTY;
    }

    public static of<T>(identity: T): IOptional<T> {
        if (!Optional.exists(identity)) {
            throw new Error('Null provided as identity');
        }
        return new Optional(identity);
    }

    public static ofNullable<T>(identity: T | undefined | null): IOptional<T> {
        return Optional.exists(identity) ? Optional.of(identity as T) : Optional.empty();
    }

    private static exists<T>(value: T | null | undefined): boolean {
        return typeof value !== 'undefined' && value !== null;
    }

    private static ensure<T>(item: T | null | undefined, message?: string): T {
        if (!item) {
            /* istanbul ignore next line */
            throw new Error(message || 'Absent value passed');
        }
        return item;
    }
}
