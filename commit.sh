#!/bin/bash
text="commits"
if [[ $1 != '' ]]; then
    text=$1
fi
hg addremove && hg commit -m "$text" && hg push
