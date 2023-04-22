#!/bin/bash
cd HEALTHCARE_APP
pm2 stop all
pm2 list
pm2 start /HEALTHCARE_APP/ecosystem.config.json 

tail -f /dev/null

