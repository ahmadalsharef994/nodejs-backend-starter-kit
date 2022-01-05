#!/bin/bash
cd Medzgo_RestAPI
pm2 stop all
pm2 list
pm2 start /Medzgo_RestAPI/ecosystem.config.json 

tail -f /dev/null

