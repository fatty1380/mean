# this script checks if the mongod is running, starts it if not

if pgrep -q mongod; then
    echo MONGO IS RUNNING;
else
    echo STARTING MONGOD!;

    if [ -z "$1" ]; then
        mongod;
    else
        echo ... with arg $1;
        mongod --dbpath $1;
    fi
fi

exit 0;
