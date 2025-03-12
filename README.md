# Test Maker, love maker

Grab yourself a pre built binary, hope it works.
If it doesn't, you can build it yourself, it's easy.

## Installation
### Linux

```sh
wget https://github.com/ricardoraposo/test_maker/releases/download/v1.4/test-maker-linux-x64.tar.gz
tar -xf test-maker-linux-x64.tar.gz
sudo mv test_maker /usr/local/bin
```

## Usage
```sh
test_maker "path_to_ts_file"
```

## How to build it
Make sure you have cargo installed

```sh
cargo build --release
```

That's it, good luck!
