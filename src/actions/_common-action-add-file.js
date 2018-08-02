import path from 'path';
import fs from 'saxon/sync';
import fsp from 'saxon';
import {
	getRenderedTemplate,
	makeDestPath,
	throwStringifiedError,
} from './_common-action-utils';
import isBinary from '@aleclarson/isbinaryfile';

export default function* addFile(data, cfg, plop) {
	const fileDestPath = makeDestPath(data, cfg, plop);
	const { force, skipIfExists = false } = cfg;
	try {
		// check path
		let destExists = yield fsp.exists(fileDestPath);

		// if we are forcing and the file already exists, delete the file
		if (force === true && destExists) {
			fs.remove(fileDestPath, true);
			destExists = false;
		}

		// we can't create files where one already exists
		if (destExists) {
			if (skipIfExists) return;
			throw {
				path: fileDestPath,
				error: 'File already exists',
			};
		} else {
			yield fsp.mkdir(path.dirname(fileDestPath));

			const absTemplatePath = cfg.templateFile
				&& path.resolve(plop.getPlopfilePath(), cfg.templateFile)
				|| null;

			if (absTemplatePath != null && isBinary.sync(absTemplatePath)) {
				const rawTemplate = yield fsp.read(cfg.templateFile, null);
				yield fsp.write(fileDestPath, rawTemplate);
			} else {
				const renderedTemplate = yield getRenderedTemplate(data, cfg, plop);
				yield fsp.write(fileDestPath, renderedTemplate);
			}
		}

		// return the added file path (relative to the destination path)
		return fileDestPath;
	} catch (err) {
		throwStringifiedError(err);
	}
}
