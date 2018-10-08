#!/usr/bin/env node

const program = require('commander')
const childProcess = require('child_process')
const vnu = require('../vnu-jar')

const checkJava = () => {
	return new Promise((resolve, reject) => {
		childProcess.exec('java -version', (error, stdout, stderr) => {
			if (error) {
				reject('Java is missing')
			}

			const is32bitJava = !stderr.match(/64-Bit/)
			resolve(is32bitJava)
		})
	})
}

const validate = (ignores, dir, otherDirs) => {
	checkJava()
		.then(is32bitJava => {
			const args = [
				'-jar',
				vnu,
				'--asciiquotes',
				'--skip-non-html',
				'--Werror',
        `--filterpattern "${ignores}"`,
        dir
      ]

      otherDirs.forEach(oDir => {
        args.push(oDir)
      })

      // For the 32-bit Java we need to pass `-Xss512k`
      if (is32bitJava) {
        args.splice(0, 0, '-Xss512k')
      }

      return childProcess.spawn('java', args, {
        shell: true,
        stdio: 'inherit'
      })
        .on('exit', process.exit)
		})
}

program
	.version('1.0.0', '-v, --version')
	.command('-vv --validate <ignores> <dir> [otherDirs...]')
  .action(validate)

program.parse(process.argv)
