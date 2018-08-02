import co from 'co';
import fsp from 'saxon';
import {
	getRenderedTemplate,
	makeDestPath,
	throwStringifiedError,
	getRelativeToBasePath
} from './_common-action-utils';

import actionInterfaceTest from './_common-action-interface-check';

export default co.wrap(function*(data, cfg, plop) {
	const interfaceTestResult = actionInterfaceTest(cfg);
	if (interfaceTestResult !== true) {
		throw interfaceTestResult;
	}
	const fileDestPath = makeDestPath(data, cfg, plop);
	try {
		// check path
		const pathExists = yield fsp.exists(fileDestPath);

		if (!pathExists) {
			throw 'File does not exists';
		} else {
			let fileData = yield fsp.read(fileDestPath);
			const replacement = yield getRenderedTemplate(data, cfg, plop);
			fileData = fileData.replace(cfg.pattern, replacement);
			yield fsp.write(fileDestPath, fileData);
		}
		return getRelativeToBasePath(fileDestPath, plop);
	} catch (err) {
		throwStringifiedError(err);
	}
});
