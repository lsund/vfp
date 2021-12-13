
type Lazy<T> = () => T

type LazyList<T> = Lazy<{ head: Lazy<T>, tail: LazyList<T> } | null>;

///////////////////////////////////////////////////////////////////////////////
// Exercises

// * Create a function `range` that accepts one number argument `start`
// and return an infinite LazyList of numbers.  [start, start + 1 ...]

function range(start: number): LazyList<number> {
  return () => ({ head: () => start, tail: range(start + 1) });
}

// * Create a function `take` that accepts one argument `n: number`
// and one argument `xs: LazyList<T>` and returns a LazyList<T> of the first n
// elements of xs.

function take<T>(n: number, xs: LazyList<T>): LazyList<T> {
  return () => {
    return n === 0 ? null : ({head: xs()!.head, tail: take(n - 1, xs()!.tail)});
  };
}

