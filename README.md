# Outset!
Outset is built on the "MEAN" stack, using the MEAN.JS project as a base.

## Getting Started

 # Located at the root of the repository, the "outset-init.sh" script will bootstrap the project, installing all prerequisites and running the "grunt" task runner. This is not suitable for deployment, but is a great help for getting your development environment up and running.
 # This *should* handle the various steps outlined below, but no guarantees are made :(

## Before You Begin
Before you begin we recommend you read about the basic building blocks that assemble a MEAN.JS application:

 * **MongoDB** - Go through [MongoDB Official Website](http://mongodb.org/) and proceed to their [Official Manual](http://docs.mongodb.org/manual/), which should help you understand NoSQL and MongoDB better.
 * **Express** - The best way to understand express is through its [Official Website](http://expressjs.com/), particularly [The Express Guide](http://expressjs.com/guide.html); you can also go through this [StackOverflow Thread](http://stackoverflow.com/questions/8144214/learning-express-for-node-js) for more resources.
 * **AngularJS** - Angular's [Official Website](http://angularjs.org/) is a great starting point. You can also use [Thinkster Popular Guide](http://www.thinkster.io/), and the [Egghead Videos](https://egghead.io/).
 * **Node.js** - Start by going through [Node.js Official Website](http://nodejs.org/) and this [StackOverflow Thread](http://stackoverflow.com/questions/2353818/how-do-i-get-started-with-node-js), which should get you going with the Node.js platform in no time.


## Prerequisites
Make sure you have installed all these prerequisites on your development machine.

 * Node.js - [Download & Install Node.js](http://www.nodejs.org/download/) and the npm package manager, if you encounter any problems, you can also use this [Github Gist](https://gist.github.com/isaacs/579814) to install Node.js.
 * NPM - Node Package Manager - should be installed by node.
 * MongoDB - [Download & Install MongoDB](http://www.mongodb.org/downloads), and make sure it's running on the default port (27017).
 * Bower - You're going to use the [Bower Package Manager](http://bower.io/) to manage your front-end packages, in order to install it make sure you've installed Node.js and npm, then install bower globally using npm:

```
$ npm install -g bower
```

* Grunt - You're going to use the [Grunt Task Runner](http://gruntjs.com/) to automate your development process, in order to install it make sure you've installed Node.js and npm, then install grunt globally using npm:

```
$ sudo npm install -g grunt-cli

```

Once your globals are configured, trigger the NPM package installer to download and setup all NPM packages.:

```
$ npm install
```

This should trigger the bower install as well, if you have issues, run the following:

```
$ bower install
```

Now that everything is installed, it should be as easy as running grunt from the project root:

```
$ grunt
```

To see formatted output from the new logger (still in migration), use the following (ensure that bunyan is installed)

```
$ grunt | bunyan -o short
```


## Happy Coding! and remember to Build Awesome every day! ##

![Logo_Transparent.png](https://bitbucket.org/repo/nGq9xa/images/2135453670-Logo_Transparent.png)