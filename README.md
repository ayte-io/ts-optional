# @ayte/optional

[![npm](https://img.shields.io/npm/v/@ayte/optional.svg?style=flat-square)](https://www.npmjs.com/package/@ayte/optional)
[![CircleCI/Master](https://img.shields.io/circleci/project/github/ayte-io/ts-optional/master.svg?style=flat-square)](https://circleci.com/gh/ayte-io/ts-optional/tree/master)
[![Coveralls/Master](https://img.shields.io/coveralls/github/ayte-io/ts-optional/master.svg?style=flat-square)](https://coveralls.io/github/ayte-io/ts-optional?branch=master)

## Installation

```bash
yarn add @ayte/optional
# - or -
npm install -S @ayte/optional
```

## Usage

This package is Java [Optional](https://docs.oracle.com/javase/10/docs/api/java/util/Optional.html)
port with some additional features. Optional is a functor / monad that 
allows you to perform operations over identity without explicit null / 
undefined checking every time you need to perform an operation.

To create an Optional, you need to call one of static methods:

```javascript
import Optional from '@ayte/optional';

// will eat anything you provide
const unknown = Optional.ofNullable(dunnoIfPresent);
// will throw if value is null or undefined
const present = Optional.of(value);
// just an empty optional
const empty = Optional.empty();
```

To operate over identity, you have `.map()` and `.flatMap()` methods,
each returning another Optional:

```javascript
const sum = Optional.of(2).map(value => value + value);
const product = Optional.of(2).flatMap(value => Optional.of(value).map(value * value));
```

This allows easy chained operations when identity may or may not be 
present, and when result of operations may be either value or null 
/ undefined. Optional is immutable, so `.map()` and `.flatMap()` return
new optionals:

```javascript
const body = Optional.ofNullable(request.body)
    .map(JSON.parse);

// this will be empty optional both if body was absent and if token
// was absent in body 
const token = body.map(identity => identity.token)
const product = body
  .map(identity => identity.value)
  .flatMap(identity => Optional.ofNullable(multiplier).map(value => value * identity))
```

Filter allows you to pass predicate and turn optional to empty if 
identity doesn't satisfy condition:

```javascript
const length = Optional.ofNullable(collection)
    .map(identity => identity.length)
    // if identity is less than zero, returned optional would be empty
    .filter(identity => identity >= 0);
```

Also you have two methods to rescue probably empty optional:

```javascript
const optional = Optional.empty();
const fallback = optional.fallback(Optional.of(2));
// same as .fallback(), but takes in producer rather than prepared value
const rescued = optional.or(() => Optional.of(2));
```

You also have several methods to unwrap the value:

```javascript
const optional = Optional.empty();
// will throw since identity is absent
const value = optional.get();
const either = optional.orElse(2);
const nullable = optional.orNull();
const produced = optional.orElseGet(() => 2);
const ensured = optional.orElseThrow(() => new Error('Assertion failed'));
```

To inspect current state, you can use `.isPresent() / .isAbsent()` 
methods. Also, there are conditional methods for producing side effects:

```javascript
const optional = Optional.empty();
Optional.empty()
    .ifPresent(value => console.log(value))
    .ifAbsent(() => console.log('nothing here'))
    .peek(value => console.log(value), () => console.log('nothing here'));
```

All those methods return current optional, which allows chaining as 
above.

There are also some utility methods which may help you:

```typescript
const alpha: IOptional<number> = Optional.map(12, x => x * 2);
const beta: IOptional<number> = Optional.flatMap(13, x => Optional.of(12).map(y => x + y));
const gamma: IOptional<number> = Optional.first([12, 13, 14]);
const delta: IOptional<number> = Optional.last([12, 13, 14]);
const exists = Optional.isPresent(null);
const absent = Optional.isAbsent(12);
```

## TypeScript Typings

Baked in, as well as source map.

## Contribution

Send your PRs to **release/0.2** branch.

## Licensing

MIT / Ayte Labs, 2018

Promise to have fun using it.
