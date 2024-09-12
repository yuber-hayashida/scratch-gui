#!/bin/sh
set -o nounset -o errexit

script_dir_path="$(dirname "$0")"

verbose=false
shows_help=false
directory=""

while getopts "vhd:" opt
do
  case "$opt" in
    v) verbose=true;;
    h) shows_help=true;;
    d) directory="$OPTARG";;
    *) exit 1;;
  esac
done
shift $((OPTIND-1))

if $verbose
then
  # set -o xtrace
  echo "script_dir_path: $script_dir_path"
fi

if test -n "$directory"
then
  cd "$directory"
fi

task_file_paths="$0"
# cwd="$(pwd)"
# cd "$script_dir_path"
if $verbose; then echo "script_dir_path: $script_dir_path" >&2; fi
for file_path in "$(dirname "$0")"/task_*.sh "$(dirname "$0")"/task-*.sh
do
  if ! test -r "$file_path"
  then
    continue
  fi
  task_file_paths="$task_file_paths $file_path"
  # shellcheck disable=SC1090
  . "$file_path"
  if $verbose; then echo "Loaded $file_path" >&2; fi
done
# cd "$cwd"

task_subcmds() { # List subcommands.
  (
    cd "$(dirname "$0")"
    delim=" delim_2ed1065 "
    # shellcheck disable=SC2086
    cnt="$(grep -E -h -e "^subcmd_[_[:alnum:]]+\(" $task_file_paths | sed -r -e 's/^subcmd_//' -e 's/^([^ ()]+)__/\1:/g' -e "s/\(\) *\{ *(# *)?/$delim/")"
    if type delegate_tasks > /dev/null 2>&1
    then
      if delegate_tasks subcmds > /dev/null 2>&1
      then
        cnt="$(printf "%s\n%s" "$cnt" "$(delegate_tasks subcmds | sed -r -e "s/(^[^ ]+) +/\1$delim/")")"
      fi
    fi
    max_len="$(echo "$cnt" | awk '{ if (length($1) > max_len) max_len = length($1) } END { print max_len }')"
    echo "$cnt" | sort | awk -F"$delim" "{ printf \"%-${max_len}s  %s\n\", \$1, \$2 }"
  )
}

task_tasks() { # List tasks.
  (
    delim=" delim_d3984dd "
    # shellcheck disable=SC2086
    cnt="$(grep -E -h -e "^task_[_[:alnum:]]+\(" $task_file_paths | sed -r -e 's/^task_//' -e 's/^([^ ()]+)__/\1:/g' -e "s/\(\) *\{ *(# *)?/$delim/")"
    if type delegate_tasks > /dev/null 2>&1
    then
      if delegate_tasks tasks > /dev/null 2>&1
      then
        cnt="$(printf "%s\n%s" "$cnt" "$(delegate_tasks tasks | sed -r -e "s/(^[^ ]+) +/\1$delim/")")"
      fi
    fi
    max_len="$(echo "$cnt" | awk '{ if (length($1) > max_len) max_len = length($1) } END { print max_len }')"
    echo "$cnt" | sort | awk -F"$delim" "{ printf \"%-${max_len}s  %s\n\", \$1, \$2 }"
  )
}

task_help() { # Show help message.
  (
    cd "$script_dir_path"
    cat <<EOF
Usage:
  $0 <subcommand> [args...]
  $0 <task[arg1,arg2,...]> [tasks...]

Subcommands:
EOF
    task_subcmds | sed -r -e 's/^/  /'
    cat <<EOF

Tasks:
EOF
    task_tasks | sed -r -e 's/^/  /'
  )
}

subcmd_pwd() {
  pwd "$@"
}

subcmd_false() { # Always fail.
  false "$@"
}

task_nop() { # Do nothing.
  echo NOP
}

if test ${#} -eq 0 || $shows_help
then
  task_help
  exit 0
fi

subcmd="$1"
if type subcmd_"$subcmd" > /dev/null 2>&1
then
  shift
  subcmd_"$subcmd" "$@"
  exit 0
fi

for task_with_args in "$@"
do
  task="$task_with_args"
  args=""
  case "$task_with_args" in
    *\[*)
      task="${task_with_args%%\[*}"
      args="$(echo "$task_with_args" | sed -r -e 's/^.*\[//' -e 's/\]$//' -e 's/,/ /')"
      ;;
  esac
  task="$(echo "$task" | sed -r -e 's/:/__/g')"
  if ! type task_"$task" > /dev/null 2>&1
  then
    if type delegate_tasks > /dev/null 2>&1
    then  
      delegate_tasks "$@"
      exit 0
    fi
    echo "Unknown task: $task" >&2
    exit 1
  fi
  # shellcheck disable=SC2086
  task_"$task" $args
done
