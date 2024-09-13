#!/bin/sh
set -o errexit -o nounset

delegate_tasks() {
  volta_cmd run npm -- run "$@" || return $?
}
