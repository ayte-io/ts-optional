export interface IOptional<T> {
    map<V>(transformer: (identity: T) => V): IOptional<V>;
    flatMap<V>(transformer: (identity: T) => IOptional<V>): IOptional<V>;
    filter(predicate: (identity: T) => boolean): IOptional<T>;
    get(): T | never;
    orElse<V = T | null>(value: V): T | V;
    orElseGet<V = T | null>(supplier: () => V): T | V;
    orElseThrow(callback: () => Error): T | never;
    orNull(): T | null;
    isPresent(): boolean;
    isAbsent(): boolean;
    ifPresent(consumer: (value: T) => void): IOptional<T>;
    ifAbsent(callback: () => void): IOptional<T>;
    peek(onPresent: (value: T) => void, onAbsent: () => void): IOptional<T>;
    or(supplier: () => IOptional<T>): IOptional<T>;
    rescue(other: IOptional<T>): IOptional<T>;
    equals(other: IOptional<T>): boolean;
    toString(): string;
}

export class Optional<T> implements IOptional<T> {
    private static EMPTY = new Optional<any>(null);

    private constructor(private readonly identity: T | null) {}

    public map<V>(transformer: (identity: T) => V): IOptional<V> {
        return this.isPresent() ? new Optional(transformer(this.identity as T)) : Optional.empty();
    }

    public flatMap<V>(transformer: (identity: T) => IOptional<V>): IOptional<V> {
        return this.isPresent() ? transformer(this.identity as T) : Optional.empty();
    }

    public filter(predicate: (identity: T) => boolean): IOptional<T> {
        return !this.isPresent() || predicate(this.identity as T) ? this : Optional.empty();
    }

    public get(): T | never {
        return this.orElseThrow(() => new Error('Identity is not present'));
    }

    public orElse<V = T | null>(value: V): T | V {
        return this.isPresent() ? this.identity as T:  value;
    }

    public orElseGet<V = T | null>(supplier: () => V): T | V {
        return this.isPresent() ? this.identity as T : supplier();
    }

    public orElseThrow(callback: () => Error): T | never {
        if (this.isPresent()) {
            return this.identity as T;
        }
        throw callback();
    }

    public orNull(): T | null {
        return this.orElse(null);
    }

    public isPresent(): boolean {
        return Optional.exists(this.identity);
    }

    public isAbsent(): boolean {
        return !Optional.exists(this.identity);
    }

    public ifPresent(consumer: (value: T) => void): IOptional<T> {
        if (this.isPresent()) {
            consumer(this.identity as T);
        }
        return this;
    }

    public ifAbsent(callback: () => void): IOptional<T> {
        if (!this.identity) {
            callback();
        }
        return this;
    }

    public peek(onPresent: (value: T) => void, onAbsent: () => void): IOptional<T> {
        return this.ifPresent(onPresent).ifAbsent(onAbsent);
    }

    public or(supplier: () => IOptional<T>): IOptional<T> {
        return this.identity ? this : supplier();
    }

    public rescue(other: IOptional<T>): IOptional<T> {
        return this.identity ? this : other;
    }

    public equals(other: IOptional<T>): boolean {
        return this.isPresent() === other.isPresent() && this.identity === other.orNull();
    }

    public toString(): string {
        const fill = this.isPresent() ? `identity = ${this.identity}` : 'empty';
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
}
