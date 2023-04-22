FROM node:10.19.0
RUN apt-get update -y && npm install pm2 -g -y
COPY HEALTHCARE_APP /HEALTHCARE_APP
COPY entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh
RUN apt-get install net-tools -y
ENTRYPOINT ["/entrypoint.sh"]
