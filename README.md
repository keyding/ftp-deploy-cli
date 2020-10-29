# ftp-deploy-cli

FTP deploy for Node.js

## Installation

```bash
npm install -D ftp-deploy-cli
```

## Usage

### Help

```bash
$ deploy

Usage: deploy [options] [command]

Options:
  -v, --version   output the version number
  -h, --help      display help for command

Commands:
  init            Init configuration information.
  config          view the configuration file - ftp.config.js.
  start           Upload with the configuration file - ftp.config.js.
  help [command]  display help for command
```

### Configuration information. (Generate configuration file `ftp.config.js`)

```bash
$ deploy init

? Please input host: ftp.example.com
? Please input port: 33321
? Please input user: username
? Please input password: password
? Please input targetDir: /remote/path/dir
? Please input localDir: dist
✔  success   Configuration file ftp.config.js has been generated. Run `deploy start` to uploador `deploy config` to view configuration.
```

### View configuration file.

```bash
$ deploy config

{
  "host": "ftp.example.com",
  "port": "33321",
  "user": "username",
  "password": "password",
  "targetDir": "/remote/path/dir",
  "localDir": "dist"
}
```

### Upload files.

```bash
$ deploy start

ℹ  info      Connecting ...
✔  success   Connection succeeded.
ℹ  info      Ready to upload ...
☐  pending   404.html
☐  pending   about.html
☐  pending   0.styles.9ebdc6f5.css
☐  pending   search.83621669.svg
☐  pending   10.b6a73a91.js
☐  pending   11.daf20416.js
☐  pending   12.955428e1.js
☐  pending   13.9984181b.js
☐  pending   14.ca37eab7.js
☐  pending   15.acab2bd3.js
☐  pending   2.b2920a5a.js
☐  pending   3.b726f14a.js
☐  pending   4.9fc19d0b.js
...
....
✔  success   Upload successfully. Total: 225.456 KB
```

## Notice

The configuration file will be automatically added to `.ignore`. If the addition fails, please configure it yourself to avoid pushing account information to `Git`.

## Contributors

[pineapple](https://github.com/pineapplejs)

## License

[MIT](http://opensource.org/licenses/MIT)