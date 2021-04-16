type Materialized<T> = NonNullable<T>;
type Absent = null | undefined;
type Nullable<T> = Materialized<T> | null;
type Indeterminate<T> = Materialized<T> | Absent;
type throws<E = Error> = never;

export interface IOptional<T> {
    /**
     * Returns optional that contains transformed value (if identity is
     * present) or empty optional (if identity is absent or transformer
     * returns absent value).
     *
     * @param transformer Function to be used to convert identity.
     */
    map<V>(transformer: (identity: Materialized<T>) => Indeterminate<V>): IOptional<V>;

    /**
     * Returns optional that contains transformed value (if identity is
     * present and transformer returns non-empty optional) or empty
     * optional otherwise.
     *
     * @param transformer Function to be used to convert identity into
     * optional of another type.
     */
    flatMap<V>(transformer: (identity: Materialized<T>) => IOptional<V>): IOptional<V>;

    /**
     * Convert this optional into an empty optional if predicate returns
     * false on present identity, retain identity otherwise.
     *
     * @param predicate Predicate to check present identity with.
     */
    filter(predicate: (identity: Materialized<T>) => boolean): IOptional<T>;

    /**
     * Returns true if optional contains a value for which passed
     * predicate returns true.
     *
     * @param predicate Predicate to check present identity with.
     */
    satisfies(predicate: (identity: Materialized<T>) => boolean): boolean;

    /**
     * Returns true if optional contains a value for which passed
     * predicate returns false.
     *
     * @param predicate Predicate to check present identity with.
     */
    dissatisfies(predicate: (identity: Materialized<T>) => boolean): boolean;

    /**
     * Provides a way to test identity equality to passed value without
     * unwrapping or additional predicates.
     *
     * @param value Value to test identity against.
     * @param comparator Optional function to test equality.
     */
    contains(value: T, comparator?: (identity: Materialized<T>, comparison: T) => boolean): boolean;

    /**
     * Returns identity or throws if identity is not present.
     */
    get(): Materialized<T> | throws;

    /**
     * Returns identity or (if identity is not present) provided value.
     *
     * @param value Fallback value.
     */
    orElse(value: Indeterminate<T>): Nullable<T>;

    /**
     * Returns identity or (if identity is not present) calls provided
     * factory and returns it's value..
     *
     * @param supplier Fallback value factory.
     */
    orElseSupply(supplier: () => Indeterminate<T>): Nullable<T>;

    /**
     * Returns identity if present, otherwise calls provided factory to
     * create an error and immediately throws it.
     *
     * @param supplier Error factory.
     */
    orElseThrow<E = Error>(supplier: () => E): Materialized<T> | throws<E>;

    /**
     * Returns identity or null thus resolving "maybe it's undefined or maybe
     * it's null" ambiguity.
     */
    orElseNull(): Nullable<T>;

    /**
     * Returns called optional if identity is present, provided
     * reinforcement otherwise.
     *
     * @param reinforcement Fallback optional.
     */
    fallback(reinforcement: IOptional<T>): IOptional<T>;

    /**
     * Returns called optional if identity is present, otherwise calls
     * provided factory and returns it's result.
     *
     * @param supplier Fallback optional factory.
     */
    supplyFallback(supplier: () => IOptional<T>): IOptional<T>;

    /**
     * Whether or not called optional contains present identity.
     */
    isPresent(): boolean;

    /**
     * Whether or not called optional does not contain present identity.
     */
    isAbsent(): boolean;

    /**
     * Feed present identity into provided consumer if called optional
     * contains such present identity.
     *
     * @param consumer Function to be called on identity.
     */
    ifPresent(consumer: (value: Materialized<T>) => void): this;

    /**
     * Call provided action if called optional doesn't contain present
     * identity.
     */
    ifAbsent(action: () => void): this;

    /**
     * Combination of {@link IOptional#ifPresent()} and
     * {@link IOptional#ifAbsent()}.
     */
    peek(onPresent: (value: Materialized<T>) => void, onAbsent: () => void): this;

    /**
     * Equality method to compare two optionals.
     *
     * Returns true if both optionals are empty or identity comparison
     * considered identities equal.
     *
     * @param other Compared optional.
     * @param comparator Supplemental comparator to be called on two
     * identities.
     */
    equals(other: IOptional<T>, comparator?: (a: Materialized<T>, b: Materialized<T>) => boolean): boolean;
    toString(): string;
}

namespace Optional {
    function isPresent<T>(value: Indeterminate<T>): value is Materialized<T>;
    function isPresent<T>(value: Indeterminate<T>): boolean {
        return value !== null && typeof value !== 'undefined';
    }

    function isAbsent<T>(value: Indeterminate<T>): value is Absent;
    function isAbsent<T>(value: Indeterminate<T>): boolean {
        return !isPresent(value);
    }

    function require<T>(value: Indeterminate<T>, onMissing?: () => Error): Materialized<T> | throws {
        if (!isPresent(value)) {
            throw onMissing ? onMissing() : new Error('Absent value provided');
        }

        return value;
    }

    function requireArgument<T>(argument: Indeterminate<T>, name: string): Materialized<T> {
        return require(argument, () => new Error(`Absent value was passed as ${name} argument`));
    }

    export function first<T>(source: Array<Indeterminate<T>>): IOptional<T> {
        requireArgument(source, 'source');

        return source.length > 0 ? ofNullable(source[0]) : empty();
    }

    export function last<T>(source: Array<Indeterminate<T>>): IOptional<T> {
        requireArgument(source, 'source');

        return source.length > 0 ? ofNullable(source[source.length - 1]) : empty();
    }

    export function map<T, V>(value: Indeterminate<T>, transformer: Materialized<(argument: Materialized<T>) => Indeterminate<V>>): IOptional<V> {
        requireArgument(transformer, 'transformer');

        return isPresent(value) ? ofNullable(transformer(value)) : empty();
    }

    export function flatMap<T, V>(value: Indeterminate<T>, transformer: Materialized<(argument: Materialized<T>) => IOptional<V>>): IOptional<V> {
        requireArgument(transformer, 'transformer')

        if (isAbsent(value)) {
            return empty();
        }

        return require(transformer(value), () => new Error('Transformer returned absent value instead of IOptional'));
    }

    class Optional<T> implements IOptional<T> {
        public constructor(private readonly identity: Indeterminate<T>) {}

        public map<V>(transformer: (identity: Materialized<T>) => Indeterminate<V>): IOptional<V> {
            return isPresent(this.identity) ? map(this.identity, transformer) : empty();
        }

        public flatMap<V>(transformer: (identity: Materialized<T>) => IOptional<V>): IOptional<V> {
            return flatMap(this.identity, transformer);
        }

        public filter(predicate: (identity: Materialized<T>) => boolean): IOptional<T> {
            requireArgument(predicate, 'predicate');

            return isAbsent(this.identity) || predicate(this.identity) ? this : empty();
        }

        public satisfies(predicate: (identity: Materialized<T>) => boolean): boolean {
            return isPresent(this.identity) && predicate(this.identity);
        }

        public dissatisfies(predicate: (identity: Materialized<T>) => boolean): boolean {
            return isPresent(this.identity) && !predicate(this.identity);
        }

        public contains(value: T, comparator?: (identity: Materialized<T>, comparison: T) => boolean): boolean {
            if (isAbsent(this.identity)) {
                return false;
            }

            if (comparator) {
                return comparator(this.identity, value);
            }

            return this.identity === value;
        }

        public get(): Materialized<T> | throws {
            return this.orElseThrow(() => new Error('Identity is not present'));
        }

        public orElse(value: Indeterminate<T>): Nullable<T> {
            if (isPresent(this.identity)) {
                return this.identity;
            }

            return isPresent(value) ? value : null;
        }

        public orElseSupply(supplier: () => Indeterminate<T>): Nullable<T> {
            requireArgument(supplier, 'supplier');

            if (isPresent(this.identity)) {
                return this.identity;
            }

            const value = supplier();

            return isPresent(value) ? value : null;
        }

        public orElseThrow<E = Error>(supplier: () => E): Materialized<T> | throws<E> {
            requireArgument(supplier, 'supplier');

            if (isPresent(this.identity)) {
                return this.identity;
            }

            throw supplier();
        }

        public orElseNull(): Materialized<T> | null {
            return this.orElse(null);
        }

        public fallback(other: IOptional<T>): IOptional<T> {
            requireArgument(other, 'other');

            return this.isPresent() ? this : other;
        }

        public supplyFallback(supplier: () => IOptional<T>): IOptional<T> {
            requireArgument(supplier, 'supplier');

            if (this.isPresent()) {
                return this;
            }

            return require(supplier(), () => new Error('Provided supplier returned empty value instead of optional'));
        }

        public isPresent(): boolean {
            return isPresent(this.identity);
        }

        public isAbsent(): boolean {
            return isAbsent(this.identity);
        }

        public ifPresent(consumer: (value: Materialized<T>) => void): this {
            requireArgument(consumer, 'consumer');

            if (isPresent(this.identity)) {
                consumer(this.identity);
            }

            return this;
        }

        public ifAbsent(action: () => void): this {
            requireArgument(action, 'action');

            if (this.isAbsent()) {
                action();
            }

            return this;
        }

        public peek(onPresent: (value: Materialized<T>) => void, onAbsent: () => void): this {
            return this.ifPresent(onPresent).ifAbsent(onAbsent);
        }

        public equals(other: IOptional<T>, comparator?: (a: Materialized<T>, b: Materialized<T>) => boolean): boolean {
            if (isAbsent(this.identity) !== other.isAbsent()) {
                return false;
            }

            if (isAbsent(this.identity)) {
                return true;
            }

            const opposite = other.get();

            if (comparator) {
                return comparator(this.identity, opposite);
            }

            return this.identity === opposite;
        }

        public toString(): string {
            const fill = this.isPresent() ? `identity=${this.identity}` : 'empty';
            return `Optional {${fill}}`;
        }
    }

    export function empty<T>(): IOptional<T> {
        return new Optional<T>(null);
    }

    export function of<T>(identity: Materialized<T>): IOptional<T> {
        require(identity, () => new Error('Absent identity provided'));

        return new Optional(identity);
    }

    export function ofNullable<T>(identity: Indeterminate<T>): IOptional<T> {
        return new Optional(identity);
    }
}

export default Optional;