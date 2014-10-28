'use strict';

/**
 * Get unique error field name
 */
var getUniqueErrorMessage = function(err) {
	var output;

	try {
		var fieldName = err.err.substring(err.err.lastIndexOf('.$') + 2, err.err.lastIndexOf('_1'));
		output = fieldName.charAt(0).toUpperCase() + fieldName.slice(1) + ' already exists';

	} catch(ex) {
		output = 'Unique field already exists';
	}

	return output;
};

/**
 * Get the error message from error object
 */
exports.getErrorMessage = function(err) {
	var message = '';
	
	if (err.code) {
		switch (err.code) {
			case 11000:
			case 11001:
				message = getUniqueErrorMessage(err);
				break;
			default:
				message = 'Something went wrong';
		}
	} else {
		for (var errName in err.errors) {
			if (err.errors[errName].message) message = err.errors[errName].message;
		}
	}

	return message;
};

/**
 * Get the error message from response data object
 */
exports.getDataErrorMessage = function(data) {
    var message = '';

    if (data.reason) {
        message = data.reason;

        if (data.e) {
            console.error('Failure Error: ', data.e);
        }
    } else if (data.e) {
        message = data.e;
    }

    return message;
};

exports.censor = function(censor) {
    var i = 0;

    return function(key, value) {
        if (i !== 0 && typeof(censor) === 'object' && typeof(value) === 'object' && censor === value)
            return '[Circular]';

        if (i >= 29) // seems to be a harded maximum of 30 serialized objects?
            return '[Unknown]';

        ++i; // so we know we aren't using the original object anymore

        return value;
    };

};
