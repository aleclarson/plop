export default function(action, {checkPath=true, checkAbortOnFail=true} = {}) {

	// it's not even an object, you fail!
	if (typeof action !== 'object') {
		throw Error(`Invalid action object: ${JSON.stringify(action)}`);
	}

	const {path, abortOnFail} = action;

	if (checkPath && (typeof path !== 'string' || path.length === 0)) {
		throw Error(`Invalid path "${path}"`);
	}

	// abortOnFail is optional, but if it's provided it needs to be a Boolean
	if (checkAbortOnFail && abortOnFail !== undefined && typeof abortOnFail !== 'boolean') {
		throw Error(`Invalid value for abortOnFail (${abortOnFail} is not a Boolean)`);
	}

	return true;
}
