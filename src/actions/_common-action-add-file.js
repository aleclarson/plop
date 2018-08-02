import path from 'path';
import fs from 'saxon/sync';
import {
	getRenderedTemplate,
	makeDestPath,
	throwStringifiedError,
} from './_common-action-utils';
import isBinary from '@aleclarson/isbinaryfile';
import * as fspp from '../fs-promise-proxy';

export default function* addFile(data, cfg, plop) {
	const fileDestPath = makeDestPath(data, cfg, plop);
	const { force, skipIfExists = false } = cfg;
	try {
		// check path
		let destExists = yield fspp.fileExists(fileDestPath);

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
			yield fspp.makeDir(path.dirname(fileDestPath));

			const absTemplatePath = cfg.templateFile
				&& path.resolve(plop.getPlopfilePath(), cfg.templateFile)
				|| null;

			if (absTemplatePath != null && isBinary.sync(absTemplatePath)) {
				const rawTemplate = yield fspp.readFileRaw(cfg.templateFile);
				yield fspp.writeFileRaw(fileDestPath, rawTemplate);
			} else {
				const renderedTemplate = yield getRenderedTemplate(data, cfg, plop);
				yield fspp.writeFile(fileDestPath, renderedTemplate);
			}
		}

		// return the added file path (relative to the destination path)
		return fileDestPath;
	} catch (err) {
		throwStringifiedError(err);
	}
}
