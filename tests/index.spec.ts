import Optional, {IOptional} from '../src';

const PRESENT: {[index: string]: any} = {
    zero: 0,
    one: 1,
    false: false,
    true: true,
    object: {},
    string: '',
    array: []
};

const ABSENT: {[index: string]: any} = {
    null: null,
    undefined: undefined
};

describe('Optional', () => {
    describe('.of()', () => {
        Object.keys(PRESENT).forEach(key => {
            it(`accepts ${key}`, () => {
                expect(Optional.of(PRESENT[key]).isPresent()).toBe(true);
                expect(Optional.of(PRESENT[key]).isAbsent()).toBe(false);
            });
        });

        Object.keys(ABSENT).forEach(key => {
            it(`throws on ${key}`, () => {
                expect(() => Optional.of(ABSENT[key])).toThrow();
            });
        });
    });

    describe('.ofNullable()', () => {
        Object.keys(PRESENT).forEach(key => {
            it(`accepts ${key}`, () => {
                expect(Optional.ofNullable(PRESENT[key]).isPresent()).toBe(true);
                expect(Optional.ofNullable(PRESENT[key]).isAbsent()).toBe(false);
            });
        });

        Object.keys(ABSENT).forEach(key => {
            it(`accepts ${key}`, () => {
                expect(Optional.ofNullable(ABSENT[key]).isPresent()).toBe(false);
                expect(Optional.ofNullable(ABSENT[key]).isAbsent()).toBe(true);
            });
        });
    });

    describe('.first()', () => {
        it('returns empty optional on empty array', () => {
            expect(Optional.first([]).isPresent()).toBe(false);
        });

        it('returns first element on non-empty array', () => {
            expect(Optional.first([1, 2, 3]).get()).toBe(1);
        });

        it('forbids absent argument', () => {
            expect(() => Optional.first(null as unknown as [])).toThrowError();
        });
    });

    describe('.last()', () => {
        it('returns empty optional on empty array', () => {
            expect(Optional.last([]).isPresent()).toBe(false);
        });

        it('returns last element on non-empty array', () => {
            expect(Optional.last([1, 2, 3]).get()).toBe(3);
        });

        it('forbids absent argument', () => {
            expect(() => Optional.last(null as unknown as [])).toThrowError();
        });
    });

    describe('.map()', () => {
        it('calls transformer on present value', () => {
            const result = 12;
            const factory = jest.fn(() => result);
            expect(Optional.map(15, factory).get()).toBe(result);
            expect(factory).toHaveBeenCalledTimes(1);
        });

        it('doesn\'t call transformer on absent value', () => {
            const transformer = jest.fn();
            expect(Optional.map(null, transformer).isPresent()).toBe(false);
            expect(transformer).toHaveBeenCalledTimes(0);
        });

        it('handles transformer returning null', () => {
            const transformer = jest.fn(() => null);
            expect(Optional.map(15, transformer).isPresent()).toBe(false);
            expect(transformer).toHaveBeenCalledTimes(1);
        });

        it('forbids empty transformer', () => {
            expect(() => Optional.map(15, null as unknown as (value: unknown) => any)).toThrowError();
        });
    });

    describe('.flatMap()', () => {
        it('calls transformer on present value', () => {
            const result = 12;
            const factory = jest.fn(() => Optional.of(result));
            expect(Optional.flatMap(15, factory).get()).toBe(result);
            expect(factory).toHaveBeenCalledTimes(1);
        });

        it('doesn\'t call transformer on absent value', () => {
            const transformer = jest.fn(() => Optional.empty());
            expect(Optional.flatMap(null, transformer).isPresent()).toBe(false);
            expect(transformer).toHaveBeenCalledTimes(0);
        });

        it('throws on transformer returning null', () => {
            const transformer = jest.fn(() => null as unknown as IOptional<number>);
            expect(() => Optional.flatMap(15, transformer)).toThrowError();
            expect(transformer).toHaveBeenCalledTimes(1);
        });

        it('forbids empty transformer', () => {
            expect(() => Optional.flatMap(15, null as unknown as (value: unknown) => IOptional<number>)).toThrowError();
        });
    });

    describe('#map()', () => {
        it('runs transformer', () => {
            const value = {};
            const result = {};
            const transformer = jest.fn(() => result);
            expect(Optional.of(value).map(transformer).orElseNull()).toBe(result);
            expect(transformer).toBeCalledTimes(1);
            expect(transformer).toBeCalledWith(value);
        });

        it('correctly handles transformer returning null', () => {
            expect(Optional.of({}).map(() => null).isAbsent()).toBe(true);
        });

        it('does not run transformer on absent identity', () => {
            const transformer = jest.fn(() => 2);
            expect(Optional.empty().map(transformer).isAbsent()).toBe(true);
            expect(transformer).toBeCalledTimes(0);
        });

        it('forbids empty transformer', () => {
            expect(() => Optional.of({}).map(null as unknown as () => unknown)).toThrowError();
        });
    });

    describe('#flatMap()', () => {
        it('runs transformer', () => {
            const value = {};
            const result = {};
            const transformer = jest.fn(() => Optional.of(result));
            expect(Optional.of(value).flatMap(transformer).orElseNull()).toBe(result);
            expect(transformer).toBeCalledTimes(1);
            expect(transformer).toBeCalledWith(value);
        });

        it('throws on transformer returning null', () => {
            const transformer = jest.fn(() => null as unknown as IOptional<number>);
            expect(() => Optional.of(2).flatMap(transformer)).toThrow();
            expect(transformer).toHaveBeenCalledTimes(1);
        });

        it('does not run transformer on absent identity', () => {
            const transformer = jest.fn(() => Optional.of(2));
            expect(Optional.empty().flatMap(transformer).isAbsent()).toBe(true);
            expect(transformer).toBeCalledTimes(0);
        });

        it('forbids empty transformer', () => {
            expect(() => Optional.of({}).flatMap(null as unknown as () => IOptional<unknown>)).toThrowError();
        });
    });

    describe('#filter()', () => {
        it('returns self if predicate passes', () => {
            const value = {};
            const predicate = jest.fn(() => true);
            expect(Optional.of(value).filter(predicate).get()).toBe(value);
            expect(predicate).toBeCalledTimes(1);
            expect(predicate).toBeCalledWith(value);
        });

        it('returns empty if predicate rejects', () => {
            const value = {};
            const predicate = jest.fn(() => false);
            expect(Optional.of(value).filter(predicate).isAbsent()).toBe(true);
            expect(predicate).toBeCalledTimes(1);
            expect(predicate).toBeCalledWith(value);
        });

        it('returns self if empty', () => {
            const predicate = jest.fn(() => true);
            expect(Optional.empty().filter(predicate).isAbsent()).toBe(true);
            expect(predicate).toBeCalledTimes(0);
        });

        it('forbids empty predicate', () => {
            expect(() => Optional.of({}).filter(null as unknown as () => boolean)).toThrowError();
        });
    });

    describe('#satisfies()', () => {
        it('returns false on missing identity', () => {
            const predicate = jest.fn(() => true);
            expect(Optional.empty().satisfies(predicate)).toBe(false);
            expect(predicate).toHaveBeenCalledTimes(0);
        });

        it('returns false on present identity if predicate returns false', () => {
            const predicate = jest.fn(() => false);
            expect(Optional.of(3).satisfies(predicate)).toBe(false);
            expect(predicate).toHaveBeenCalledTimes(1);
        });

        it('returns true on present identity if predicate returns true', () => {
            const predicate = jest.fn(() => true);
            expect(Optional.of(3).satisfies(predicate)).toBe(true);
            expect(predicate).toHaveBeenCalledTimes(1);
        });

        it('forbids empty predicate', () => {
            expect(() => Optional.of({}).satisfies(null as unknown as () => boolean)).toThrowError();
        });
    });

    describe('#dissatisfies()', () => {
        it('returns false on missing identity', () => {
            const predicate = jest.fn(() => true);
            expect(Optional.empty().dissatisfies(predicate)).toBe(false);
            expect(predicate).toHaveBeenCalledTimes(0);
        });

        it('returns false on present identity if predicate returns true', () => {
            const predicate = jest.fn(() => true);
            expect(Optional.of(3).dissatisfies(predicate)).toBe(false);
            expect(predicate).toHaveBeenCalledTimes(1);
        });

        it('returns true on present identity if predicate returns false', () => {
            const predicate = jest.fn(() => false);
            expect(Optional.of(3).dissatisfies(predicate)).toBe(true);
            expect(predicate).toHaveBeenCalledTimes(1);
        });

        it('forbids empty predicate', () => {
            expect(() => Optional.of({}).dissatisfies(null as unknown as () => boolean)).toThrowError();
        });
    });

    describe('#contains()', () => {
        it('returns false on empty optional', () => {
            expect(Optional.empty().contains(12)).toBe(false);

            const comparator = jest.fn(() => true);

            expect(Optional.empty().contains(12, comparator)).toBe(false);
            expect(comparator).toHaveBeenCalledTimes(0);
        });

        it('returns true if comparator is not passed and regular equality check passes', () => {
            expect(Optional.of(12).contains(12)).toBe(true);
        });

        it('returns false if comparator is not passed and regular equality check fails', () => {
            expect(Optional.of(12).contains(13)).toBe(false);
        });

        it('returns true if provided comparator returns true against identity', () => {
            const comparator = jest.fn(() => true);

            expect(Optional.of(12).contains(13, comparator)).toBe(true);
            expect(comparator).toHaveBeenCalledTimes(1);
        });

        it('returns true if provided comparator returns false against identity', () => {
            const comparator = jest.fn(() => false);

            expect(Optional.of(12).contains(12, comparator)).toBe(false);
            expect(comparator).toHaveBeenCalledTimes(1);
        });
    });

    describe('#get()', () => {
        it('throws on empty optional', () => {
            expect(() => Optional.empty().get()).toThrow();
        });

        Object.keys(PRESENT).forEach(key => {
            it(`retrieves present identity (${key})`, () => {
                expect(Optional.of(PRESENT[key]).get()).toBe(PRESENT[key]);
            });
        });
    });

    describe('#orElse()', () => {
        it('returns alternative value on empty optional', () => {
            const value = {};
            expect(Optional.empty().orElse(value)).toBe(value);
        });

        Object.keys(PRESENT).forEach(key => {
            it(`retrieves present identity (${key})`, () => {
                expect(Optional.of(PRESENT[key]).orElse({})).toBe(PRESENT[key]);
            });
        });
    });

    describe('#orElseSupply()', () => {
        it('calls supplier on missing identity', () => {
            const value = {};
            const supplier = jest.fn(() => value);
            expect(Optional.empty().orElseSupply(supplier)).toBe(value);
            expect(supplier).toBeCalledTimes(1);
        });

        it('returns null if supplier returned nullable value', () => {
            const supplier = jest.fn(() => undefined);
            expect(Optional.empty().orElseSupply(supplier)).toBeNull();
            expect(supplier).toBeCalledTimes(1);
        });

        it('doesn\'t call supplier on present identity', () => {
            const value = 12;
            const supplier = jest.fn(() => 13);
            expect(Optional.of(value).orElseSupply(supplier)).toBe(value);
            expect(supplier).toBeCalledTimes(0);
        });

        Object.keys(PRESENT).forEach(key => {
            it(`returns present identity (${key})`, () => {
                const supplier = jest.fn(() => {});
                expect(Optional.of(PRESENT[key]).orElseSupply(supplier)).toBe(PRESENT[key]);
                expect(supplier).toBeCalledTimes(0);
            });
        });

        it('forbids empty supplier', () => {
            expect(() => Optional.of({}).orElseSupply(null as unknown as () => {})).toThrowError();
        });
    });

    describe('#orElseThrow()', () => {
        it('throws on missing identity', () => {
            const error = new Error();
            const supplier = jest.fn(() => error);
            expect(() => Optional.empty().orElseThrow(supplier)).toThrow(error);
            expect(supplier).toBeCalledTimes(1);
        });

        // noinspection DuplicatedCode
        Object.keys(PRESENT).forEach(key => {
            it(`returns present identity (${key})`, () => {
                const supplier = jest.fn(() => new Error());
                expect(Optional.of(PRESENT[key]).orElseThrow(supplier)).toBe(PRESENT[key]);
                expect(supplier).toBeCalledTimes(0);
            });
        });

        it('forbids empty supplier', () => {
            expect(() => Optional.of({}).orElseThrow(null as unknown as () => Error)).toThrowError();
        });
    });

    describe('#orElseNull()', () => {
        it('returns null on missing identity', () => {
            expect(Optional.empty().orElseNull()).toBeNull();
        });

        // noinspection DuplicatedCode
        Object.keys(PRESENT).forEach(key => {
            it(`returns present identity (${key})`, () => {
                const supplier = jest.fn(() => new Error());
                expect(Optional.of(PRESENT[key]).orElseThrow(supplier)).toBe(PRESENT[key]);
                expect(supplier).toBeCalledTimes(0);
            });
        });
    });

    describe('#fallback()', () => {
        it('returns provided optional on absent identity', () => {
            const replacement = Optional.of(2);
            expect(Optional.empty().fallback(replacement)).toBe(replacement);
        });

        it('returns this on present identity', () => {
            const optional = Optional.of(2);
            expect(optional.fallback(Optional.of(3))).toBe(optional);
        });

        it('forbids empty fallback', () => {
            expect(() => Optional.of({}).fallback(null as unknown as IOptional<{}>)).toThrowError();
        });
    });
    
    describe('#supplyFallback()', () => {
        it('calls provided factory on absent identity', () => {
            const fallback = Optional.of(13);
            const factory = jest.fn(() => fallback);
            expect(Optional.empty().supplyFallback(factory)).toBe(fallback);
            expect(factory).toHaveBeenCalledTimes(1);
        });

        it('throws on provided factory returning absent value', () => {
            const factory = jest.fn(() => null as unknown as IOptional<unknown>);
            expect(() => Optional.empty().supplyFallback(factory)).toThrowError();
            expect(factory).toHaveBeenCalledTimes(1);
        });

        it('returns self on present identity', () => {
            const factory = jest.fn(() => Optional.empty<number>());
            const optional: IOptional<number> = Optional.of(12);
            expect(optional.supplyFallback(factory)).toBe(optional);
            expect(factory).toHaveBeenCalledTimes(0);
        });
        it('forbids empty factory', () => {
            expect(() => Optional.of({}).supplyFallback(null as unknown as () => IOptional<{}>)).toThrowError();
        });
    });

    describe('#ifPresent()', () => {
        it('calls consumer with present identity', () => {
            const value = {};
            const consumer = jest.fn(() => value);
            Optional.of(value).ifPresent(consumer);
            expect(consumer).toBeCalledTimes(1);
            expect(consumer).toBeCalledWith(value);
        });

        it('does not call consumer on absent identity', () => {
            const value = {};
            const consumer = jest.fn(() => value);
            Optional.empty().ifPresent(consumer);
            expect(consumer).toBeCalledTimes(0);
        });

        it('forbids empty consumer', () => {
            expect(() => Optional.of({}).ifPresent(null as unknown as () => void)).toThrowError();
        });
    });

    describe('#ifAbsent()', () => {
        it('runs provided unit on absent identity', () => {
            const unit = jest.fn();
            Optional.empty().ifAbsent(unit);
            expect(unit).toBeCalledTimes(1);
        });

        it('does not run provided unit on present identity', () => {
            const unit = jest.fn();
            Optional.of({}).ifAbsent(unit);
            expect(unit).toBeCalledTimes(0);
        });

        it('forbids empty action', () => {
            expect(() => Optional.empty().ifAbsent(null as unknown as () => void)).toThrowError();
        });
    });

    describe('#peek()', () => {
        it('runs consumer with present identity', () => {
            const consumer = jest.fn();
            const unit = jest.fn();
            const value = {};
            Optional.of(value).peek(consumer, unit);
            expect(consumer).toBeCalledTimes(1);
            expect(consumer).toBeCalledWith(value);
            expect(unit).toBeCalledTimes(0);
        });

        it('runs unit on absent identity', () => {
            const consumer = jest.fn();
            const unit = jest.fn();
            Optional.empty().peek(consumer, unit);
            expect(consumer).toBeCalledTimes(0);
            expect(unit).toBeCalledTimes(1);
        });

        it('forbids empty consumer', () => {
            expect(() => Optional.of({}).peek(null as unknown as () => void, () => {})).toThrowError();
        });

        it('forbids empty action', () => {
            expect(() => Optional.of({}).peek(() => {}, null as unknown as () => void)).toThrowError();
        });
    });

    describe('#equals()', () => {
        it('returns true on two empty optionals', () => {
            // @ts-ignore
            expect(Optional.empty().equals(Optional.empty())).toBe(true);
        });

        it('returns false on charged optional against empty optional', () => {
            expect(Optional.of(2).equals(Optional.empty())).toBe(false);
        });

        it('returns false on empty optional against charged optional', () => {
            expect(Optional.empty().equals(Optional.of(2))).toBe(false);
        });

        it('returns true on two optionals with same identity', () => {
            expect(Optional.of(2).equals(Optional.of(2))).toBe(true);
        });

        it('returns false on two optionals with different identities', () => {
            expect(Optional.of({}).equals(Optional.of({}))).toBe(false);
        });

        it('accepts comparator', () => {
            expect(Optional.of({}).equals(Optional.of({}), () => true)).toBe(true);
        });
    });

    describe('#toString()', () => {
        it('prints present identity', () => {
            expect(Optional.of(2).toString()).toBe('Optional {identity=2}');
        });

        it('hints about missing identity', () => {
            expect(Optional.empty().toString()).toBe('Optional {empty}');
        });
    });
});
