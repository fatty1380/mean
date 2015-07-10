# meanjs-init.sh
# --------------
# A bootstrapping script which takes the guidelines from http://meanjs.org/docs.html and http://meanjs.org/generator.html to
# setup all reccomended packages in your environment.
#
# Feedback and changes welcome!

# Check Arguments
while [ "$1" != "" ]; do
    case $1 in
        -d | --debug )          modeDebug=true
                                ;;
        -v | --verbose )		modeVerbose=true
								;;
        * )                     echo 'Unknown Argument "'$1'"'
                                ;;
    esac
    shift
done

# Bootstrapping
command -v gcc >/dev/null 2>&1 || { echo >&2 "I require gcc but it's not installed.  Aborting."; exit 1; }

# Installing Node and NPM
# Taken from https://gist.github.com/isaacs/579814
if command -v npm > /dev/null ; then
	echo "npm is installed";
else
	echo "Installing 'npm' from latest";

	echo 'export PATH=$HOME/local/bin:$PATH' >> ~/.bashrc
	. ~/.bashrc
	mkdir ~/local
	mkdir ~/node-latest-install
	cd ~/node-latest-install
	curl http://nodejs.org/dist/node-latest.tar.gz | tar xz --strip-components=1
	./configure --prefix=~/local
	make install # ok, fine, this step probably takes more than 30 seconds...
	curl https://www.npmjs.org/install.sh | sh
fi

# Check for and install Node.js (if necessary)
if command -v node > /dev/null; then
	echo "Node.js is installed globally";
else
	echo "Installing 'Node.js' from latest";

	npm install -g node;

	if command -v node >/dev/null; then
		echo "Completed Global installation of 'Node.js'";
	else
		echo "Node failed to be installed. Exiting";
		exit 1;
	fi

fi

# Check for and install MongoDB (if necessary)
if command -v mongod > /dev/null; then
	echo "MongoDB is installed";
else
	echo "Installing 'MongoDB' from latest";

	mongolink='unknown'
	platform='unknown'
	unamestr=`uname`
	if [[ "$unamestr" == 'Linux' ]]; then
	   	platform='linux';
	   	echo platform;
	   	mongodir='mongodb-linux-x86_64-2.6.3';
	   	mongolink='https://fastdl.mongodb.org/linux/mongodb-linux-x86_64-2.6.3.tgz';
	elif [[ "$unamestr" == 'FreeBSD' ]]; then
	   	platform='freebsd'
	   	echo platform;
	   	mongodir='mongodb-linux-x86_64-2.6.3';
	   	mongolink='https://fastdl.mongodb.org/linux/mongodb-linux-x86_64-2.6.3.tgz';
	elif [[ "$unamestr" == 'Darwin' ]]; then
		platform='mac'
	   	echo platform;
	   	mongodir='mongodb-osx-x86_64-2.6.3';
	   	mongolink='https://fastdl.mongodb.org/osx/mongodb-osx-x86_64-2.6.3.tgz';
	fi

	`curl -# -C - -o "${mongolink}" "~"`;

	echo "Finished MongoDB Download";

	`tar -zxvf "~/${mongodir}.tgz"`;

	echo "untared";

	`mkdir -p ../mongodb`;
	`cp -R -n "~/${mongodir}/ ../mongodb"`

	MONGO_HOME=`$(cd ../mongodb; pwd)`

	echo 'export PATH=/usr/local/bin:$MONGO_HOME' >> ~/.bash_profile

	if command -v mongod > /dev/null; then
		echo "MongoDB was successfully installed at ${MONGO_HOME}";
	fi
fi

# Check for and install Bower (if necessary)
if command -v bower > /dev/null; then
	echo "Bower is installed globally";
else
	echo "Installing 'Bower' from latest";

	npm install -g bower;

	if command -v bower > /dev/null; then
		echo "Completed global installation of Bower";
	else
		echo "Bower failed to be installed. Exiting";
		exit 1;
	fi
fi

# Check for and install Grunt-cli package (if necessary)
if command -v grunt > /dev/null; then
	echo "Grunt is installed globally";
else
	echo "Installing 'grunt-cli' from latest";

	npm install -g grunt-cli;

	if npm -g ls grunt-cli -parseable > /dev/null; then
		echo "Completed global installation of Grunt";
	else
		echo "Grunt failed to be installed. Exiting";
		exit 1;
	fi
fi

# Check for and install Yeoman (if necessary)
if command -v yo > /dev/null; then
	echo "Yeoman is installed globally";
else
	echo "Installing 'Bower' from latest";

	npm install -g yo;

	if command -v yo > /dev/null; then
		echo "Completed global installation of Yeoman";
	else
		echo "Yeoman failed to be installed. Exiting";
		exit 1;
	fi
fi

# Check for and install MeanJS Yeoman Generator (if necessary)
if npm -g list generator-meanjs -parseable > /dev/null; then
	echo "MeanJS Yeoman Generator is installed globally";
else
	echo "Installing 'MeanJS Yeoman Generator' from latest";

	npm install -g generator-meanjs

	if npm -g ls generator-meanjs -parseable > /dev/null; then
		echo "Completed global installation of MeanJS Yeoman Generator";
	else
		echo "MeanJS Yeoman Generator failed to be installed. Exiting";
		exit 1;
	fi
fi

# Check if there is a data directory:
if [ ! -d "./data/db" ]; then
	echo "Creating empty Mongo Data Directory at ./data/db";
	mkdir -p ./data/db;
fi

# Running Outset _________________________________________________________

npm install;

# Check if MongoDB is running - launch if it is not active
if ps ax | grep mongod | grep -v grep > /dev/null; then
	echo "MongoDB Daemon is already running";
else
	echo "Launching MongoDB Daemon";

	./mongod-check-and-start.sh ./data/db &

	sleep 5;
fi

# Check if gruntis running - launch if not
if ps cax | grep grunt > /dev/null; then
	echo "Grunt Task Runner is already active";
else
	echo "Launching Grunt Task Runner";

	if [ "$modeVerbose" = true ] ; then
		DEBUG=express:* grunt&
	else
		grunt&
	fi
fi

# If Debugging, launch node-inspector
if [ "$modeDebug" = true ] ; then
	sleep 10;
    echo 'Attaching Node-Inspector for Debugging'
    node-inspector&
fi

echo "Finished Launching Outset!"
