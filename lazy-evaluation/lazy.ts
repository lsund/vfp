
///////////////////////////////////////////////////////////////////////////////
//  Lazy Evaluation

// Lazy evaluation can be thought about as (1) wrapping a function around each argument
// and (2) _only_ evaluating these functions when they are actually needed
//
// * Consider `lazysum` - this is a function that accepts "lazy" numbers
// and returns the lazy sum of this number.
// * lazysum evaluates its arguments at the last possible moment,
// just before the result.

let lazysum = (a: () => number, b: () => number): () => number => {
  return () => a() + b()
};

// Let's introduce a type variable to make lazysum more readable ...

type Lazy<T> = () => T

// Now it becomes...

lazysum = (a: Lazy<number>, b: Lazy<number>): Lazy<number> => {
  return () => a() + b()
};

const result = lazysum(lazysum(() => 1, () => 2), lazysum(() => 3,  () => 4))

// lazysum works as a normal sum function, but because the `result` is lazy, we have
// to evaluate it with `()` before printing.

console.log('total', result());

///////////////////////////////////////////////////////////////////////////////
// (4) Avoiding large computations

// What can lazyness be useful for? The canonical example is avoiding large computations
// that are not needed. In contrast to strict evaluation where all arguments are evaluated
// _before_ the function body, lazy evaluation only forces the evaluation of those arguments
// actually used by the function.
//
// To illustrate this, let's simulate a large computation by writing an endless loop:

// This function has no bottom.
function bottom<T>(): T {
  return bottom();
}

// Now consider the function `first` that just returns its first argument and ignores
// its second argument

function first<T>(a: T, b: T): T {
  return a;
}

// Even if we only need the first argument, 10, this expression still crashes:
// const x = first(10, bottom())

// This is because both arguments of `first` are evaluated up-front,
// regardless if they are needed or not.

// However if we make the function `first` lazy...
function lazyFirst<T>(a: Lazy<T>, b: Lazy<T>): Lazy<T> {
  return a;
}

// The expression evaluates with no problems
const y = lazyFirst(() => 10, () => bottom())

console.log(y());

// This is because we force the evaluation only of the argument 10.

///////////////////////////////////////////////////////////////////////////////
// Lazy (infinite) lists

// A list can be divided into two parts, its "head" (the first element)
// and its "tail" (the list of remaining elements).
//
// For example, the list (a Javascript Array) [1,2,3] has head = 1 and tail = [2,3]

// If we wanted to define our own list data structure in typescript,
// we could define it recursively in terms of head and tail.

type List<T> = { head: T, tail: List<T> } | null; // null represents the empty list.

// For example, the Javascript Array [1,2,3] is represented as a `List` by filling in the
// numbers in the new structure:

const aList: List<number> =
  { head: 1,
    tail: { head: 2,
            tail: { head: 3,
                    tail: null }}};

// `aList` now contains the same information as `javascriptArray`

const javascriptArray = [1, 2, 3]

// Javascript Arrays are always strict. List can easily be made lazy though,
// if we wrap the list-elements in Lazy<T>.

type LazyList<T> = Lazy<{ head: Lazy<T>, tail: LazyList<T> } | null>;

// And similarly a lazy `aList` would be written as:

let aLazyList: LazyList<number> =
  () => ({ head: () => 1,
           tail: () => ({ head: () => 2,
                          tail: () => ({ head: () => 3,
                                         tail: () => null })})})

// But writing out lazy lists like that quickly becomes tedious.
// Here is a function that converts Javascript Array into a LazyList
function toLazyList<T>(xs: T[]): LazyList<T> {
  return () => {
    return xs.length === 0 ? null : ({
        head: () => xs[0],
        tail: toLazyList(xs.slice(1))
      })
  };
}

// And here is a function that converts a LazyList to a Javascript Array.
function toJavascriptArray<T>(xs: LazyList<T>): T[] {
  let current = xs();
  let ret: T[] = [];
  while (current !== null) {
    ret = ret.concat([current.head()]);
    current = current.tail();
  }
  return ret;
}

// now, it is easy to construct a lazy list
aLazyList = toLazyList(javascriptArray);

// We can inspect the first element by forcing evaluation of the head:
console.log('first element:', aLazyList()!.head());
// The second element is the head of the tail:
console.log('second element:', aLazyList()!.tail()!.head());
// The second element is the head of the tail of the tail:
console.log('third element:', aLazyList()!.tail()!.tail()!.head());

// Converting it back to a javascript array makes it more convenient to print :)
console.log(toJavascriptArray(aLazyList));

///////////////////////////////////////////////////////////////////////////////
// Exercises

// (1) Create a function `range` that accepts one number argument `start`
// and return an infinite LazyList of numbers.  [start, start + 1 ...]
// Trying to evaluate range(1) should never terminate.
//
// function range(start: number): LazyList<number> {
//   ...
// }
//

// (2) Create a function `take` that accepts one argument `n: number`
// and one argument `xs: LazyList<T>` and returns a LazyList<T> of the first n
// elements of xs.
//
// function take<T>(n: number, xs: LazyList<T>): LazyList<T> {
// ...
// }
//
// * What does the following return ?
//
// console.log(toJavascriptArray(take(10, range(100))));

