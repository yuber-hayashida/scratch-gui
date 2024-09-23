#!/bin/sh
set -o nounset -o errexit

volta_cmd() {
  # Releases · volta-cli/volta https://github.com/volta-cli/volta/releases
  cmd_base=volta
  ver=2.0.1

  exe_ext=
  arc_ext=".tar.gz"
  case "$(uname -s)" in
    Linux)
      case "$(uname -m)" in
        x86_64) os_arch="linux" ;;
        arm64) os_arch="linux-arm" ;;
        *) exit 1;;
      esac
      ;;
    Darwin)
      # Mach-O universal binarries.
      os_arch="macos"
      ;;
    Windows_NT)
      exe_ext=".exe"
      arc_ext=".zip"
      case "$(uname -m)" in
        x86_64) os_arch="windows" ;;
        arm64) os_arch="windows-arm64" ;;
        *) exit 1;;
      esac
      ;;
    *)
      exit 1
      ;;
  esac
  bin_dir_path="$HOME"/.bin
  volta_dir_path="$bin_dir_path/${cmd_base}@${ver}"
  mkdir -p "$volta_dir_path"
  volta_cmd_path="$volta_dir_path/$cmd_base$exe_ext"
  if ! test -x "$volta_cmd_path"
  then
    url=https://github.com/volta-cli/volta/releases/download/v${ver}/volta-${ver}-${os_arch}${arc_ext}
    curl$exe_ext --fail --location "$url" -o - | (cd "$volta_dir_path"; tar$exe_ext -zxf -)
    chmod +x "$volta_dir_path"/*
  fi
  PATH="$volta_dir_path:$PATH" "$cmd_base" "$@" || return $?
}

subcmd_volta() { # Run Volta.
  volta_cmd "$@"
}

subcmd_npm() { # Run npm.
  volta_cmd run npm -- "$@"
}
