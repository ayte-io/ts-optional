import {Optional} from '../src';

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

    describe('#map()', () => {
        it('runs transformer', () => {
            const value = {};
            const result = {};
            const transformer = jest.fn(() => result);
            expect(Optional.of(value).map(transformer).orNull()).toBe(result);
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
    });

    describe('#flatMap()', () => {
        it('runs transformer', () => {
            const value = {};
            const result = {};
            const transformer = jest.fn(() => Optional.of(result));
            expect(Optional.of(value).flatMap(transformer).orNull()).toBe(result);
            expect(transformer).toBeCalledTimes(1);
            expect(transformer).toBeCalledWith(value);
        });

        it('throws on transformer returning null', () => {
            const transformer = () => null;
            // @ts-ignore
            expect(() => Optional.of(2).flatMap(transformer)).toThrow();
        });

        it('does not run transformer on absent identity', () => {
            const transformer = jest.fn(() => Optional.of(2));
            expect(Optional.empty().flatMap(transformer).isAbsent()).toBe(true);
            expect(transformer).toBeCalledTimes(0);
        });
    });

    describe('#filter', () => {
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

    describe('#orElseGet()', () => {
        it('calls supplier on missing identity', () => {
            const value = {};
            const supplier = jest.fn(() => value);
            expect(Optional.empty().orElseGet(supplier)).toBe(value);
            expect(supplier).toBeCalledTimes(1);
        });

        Object.keys(PRESENT).forEach(key => {
            it(`returns present identity (${key})`, () => {
                const supplier = jest.fn(() => {});
                expect(Optional.of(PRESENT[key]).orElseGet(supplier)).toBe(PRESENT[key]);
                expect(supplier).toBeCalledTimes(0);
            });
        });
    });

    describe('#orElseThrow()', () => {
        it('throws on missing identity', () => {
            const error = new Error();
            const supplier = jest.fn(() => error);
            expect(() => Optional.empty().orElseThrow(supplier)).toThrow(error);
            expect(supplier).toBeCalledTimes(1);
        });

        Object.keys(PRESENT).forEach(key => {
            it(`returns present identity (${key})`, () => {
                const supplier = jest.fn(() => new Error());
                expect(Optional.of(PRESENT[key]).orElseThrow(supplier)).toBe(PRESENT[key]);
                expect(supplier).toBeCalledTimes(0);
            });
        });
    });

    describe('#orNull()', () => {
        it('returns null on missing identity', () => {
            expect(Optional.empty().orNull()).toBeNull();
        });

        Object.keys(PRESENT).forEach(key => {
            it(`returns present identity (${key})`, () => {
                const supplier = jest.fn(() => new Error());
                expect(Optional.of(PRESENT[key]).orElseThrow(supplier)).toBe(PRESENT[key]);
                expect(supplier).toBeCalledTimes(0);
            });
        });
    });

    describe('#or()', () => {
        it('calls provided supplier on missing identity', () => {
            const replacement = Optional.of(2);
            const supplier = jest.fn(() => replacement);
            expect(Optional.empty().or(supplier)).toBe(replacement);
            expect(supplier).toBeCalledTimes(1);
        });

        it('does not call supplier and returns self on present identity', () => {
            const supplier = jest.fn(() => Optional.empty());
            const optional = Optional.of(2);
            expect(optional.or(supplier)).toBe(optional);
            expect(supplier).toBeCalledTimes(0);
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
    });

    describe('#equals()', () => {
        it('returns true on two empty optionals', () => {
            // @ts-ignore
            expect(new Optional(null).equals(new Optional(null))).toBe(true);
        });

        it('returns false on charged optional against empty optional', () => {
            expect(Optional.of(2).equals(Optional.empty())).toBe(false);
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
            expect(Optional.empty().toString()).toBe('Optional {}');
        });
    });
});
