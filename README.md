#DTC Profiles
---
Profiles app for the DTC.

# Kano/Raspberry Pi
---
Change Chromium's start page by editing this file:
/usr/share/kano-desktop/kdesk/kdesktop/Internet.lnk

Turn off the screen saver:
/usr/share/kano-desktop/kdesk/.kdeskrc
ScreenSaverTimeout: 0

Setup post-receive hook in repo:
	#!/bin/sh
	git --work-tree=/home/Joey/apps/dtcprofiles --git-dir=/home/Joey/repo/dtcprofiles checkout -f
	node /home/Joey/apps/dtcprofiles/stop.js
	sudo ./home/Joey/apps/dtcprofiles/start.sh

Create service:

	#!/bin/sh
	# /etc/init.d/dtcprofiles
	### BEGIN INIT INFO
	# Provides: dtcprofiles
	# Required-Start:
	# Required-Stop:
	# Should-Start:
	# Should-Stop:
	# Default-Start: 2 3 4 5
	# Default-Stop: 0 1 6
	# Short-Description: Start and stop dtcprofiles
	# Description: DTCProfiles app
	### END INIT INFO

	USER='root'
	case "$1" in
	        start)
	                su $USER -c '/home/Joey/apps/dtcprofiles/start.sh :1'
	                echo "Starting DTCProfiles app for $USER "
	                ;;
	        stop)
	                su $USER -c 'node /home/Joey/apps/dtcprofiles/stop.js :1'
	                echo "DTCProfiles app stopped"
	                ;;
	        *)
	                echo "Usage: /etc/init.d/dtcprofiles {start|stop}"
	                exit 1
	                ;;
	esac
	exit 0

Start service at startup:
sudo update-rc.d dtcprofiles defaults

