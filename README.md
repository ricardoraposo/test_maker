# Test Maker, love maker

Grab yourself a pre built binary, hope it works.
If it doesn't, you can build it yourself, it's easy.

## Usage
```sh
test_maker "path_to_ts_file"
```

## How to build it
Make sure you have opam and dune installed

```sh
opam install . --deps-only
dune build
```

That's it, good luck!
