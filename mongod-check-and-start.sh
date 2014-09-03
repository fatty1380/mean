# this script checks if the mongod is running, starts it if not

if pgrep -q mongod; then
    echo MONGO IS RUNNING;
else
    echo STARTING MONGOD!;
    mongod;
fi

exit 0;
