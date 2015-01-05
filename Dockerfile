FROM node:0.10-onbuild

MAINTAINER Patrick Fowler, pat@joinoutset.com

WORKDIR /var/app/current

# Install Mean.JS Prerequisites
RUN npm install -g grunt-cli
RUN npm install -g bower

# Install Mean.JS packages
# ADD package.json /home/mean/package.json
RUN npm install

# Manually trigger bower. Why doesnt this work via npm install?
# ADD .bowerrc /home/mean/.bowerrc
# ADD bower.json /home/mean/bower.json
RUN bower install --config.interactive=false --allow-root

# Make everything available for start
# ADD . /home/mean

ENV NODE_ENV production
ENV DB_1_PORT_27017_TCP_ADDReb "172.31.7.158"
ENV GOOGLE_ANALYTICS_TRACKING_ID "UA-52626400-1"

ENV MAILER_FROM "Outset <info@joinoutset.com>"

# These are sandbox Values:
ENV BRAINTREE_MERCHANT_ID "9thy557h7r7t5x95"
ENV BRAINTREE_PUBLIC_KEY "sfnrsv2k6c78574s"
ENV BRAINTREE_PRIVATE_KEY "9da8cb7ae133c4021633f00e495fbf77"

# Port 3000 for server
# Port 35729 for livereload
EXPOSE 80 443
CMD ["grunt"]
