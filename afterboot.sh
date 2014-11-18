#!/bin/bash
while true; do chromium %u --start-maximized --disable-restore-background-contents --disable-translate --disable-new-tab-first-run localhost; sleep 5s; done