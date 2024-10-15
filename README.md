# Test Maker, love maker

Grab yourself a pre built binary, hope it works.
If it doesn't, you can build it yourself, it's easy.

## Installation
### Linux

```sh
wget https://github.com/ricardoraposo/test_maker/releases/download/v1.2/test_maker_linux.tar
tar -xf test_maker_linux.tar
sudo mv test_maker /usr/local/bin
```

### MacOS

```sh
wget https://github.com/ricardoraposo/test_maker/releases/download/v1.2/test_maker_osx.zip
unzip test_maker_osx.zip
sudo mv test_maker /usr/local/bin
```

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
