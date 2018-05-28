#!/bin/bash

if [ "`whoami`" != "root" ]; then
  echo "Please re-run as root."
  exit 1
fi

shopt -s extglob

readonly APP_NAME="homeautomation"
readonly PM2_APP_CONF_FILENAME="pm2_process.json"

main () {
  # get the absolute path of the executable
  local self_path="$0"
  if [ "${self_path:0:1}" != "." ] && [ "${self_path:0:1}" != "/" ]; then
    self_path=./"$self_path"
  fi
  self_path=$( cd -P -- "$(dirname -- "$self_path")" \
        && pwd -P \
        ) && self_path=${self_path}/$(basename -- "$0")

  # resolve symlinks
  while [ -h "$self_path" ]; do
    local dir=$(dirname -- "$self_path")
    local sym=$(readlink -- "$self_path")
    self_path=$( cd -- "$dir" \
          && cd -- $(dirname -- "$sym") \
          && pwd \
          )/$(basename -- "$sym")
  done

  # path
  local readonly PACKAGE_DIR=$(dirname -- "$self_path")/../
  unset -v self_path

  cd ${PACKAGE_DIR}

  local cmd="$1"
  shift
  case ${cmd} in
    config | log | status | start | stop | restart | version )
      ;;

    * )
      cmd="usage"
      ;;
  esac

  ${cmd} "$@" && exit 0 || fail "failed somehow"
}

config () {
  "${EDITOR:-vi}" "${HOMEAUTOMATION_CONFIG_PATH:-/usr/local/etc/homeautomation/config.yml}"

  return 0
}

log () {
  pm2 logs ${APP_NAME} "$@" && return 0
}

status () {
  pm2 status && return 0
}

start () {
  pm2 start ${PM2_APP_CONF_FILENAME} && return 0
}

stop () {
  pm2 stop ${PM2_APP_CONF_FILENAME} && return 0
}

restart() {
  pm2 restart ${PM2_APP_CONF_FILENAME} && return 0
}

version () {
  npm list -g ${APP_NAME} && return 0
}

usage () {
  cat <<EOS

Usage: ${APP_NAME} <command> ...

<command>:

config            Edit configuration.

log               Stream logs.
log --help        Show usage for log stream.

status            Show status of services.
start             Start services.
stop              Stop services.
restart           Restart services.

version           Version info.
help              Output this information.

EOS

  return 0
}

fail () {
  echo "$@" >&2
  exit 1
}

main "$@"
