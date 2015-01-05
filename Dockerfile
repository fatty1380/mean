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

# currently only works for development
ENV NODE_ENV production

# Port 3000 for server
# Port 35729 for livereload
EXPOSE 80 443
CMD ["grunt"]
