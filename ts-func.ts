#!/usr/bin/env node
import { ArgumentParser } from 'argparse'
import { readFileSync } from 'fs'
import { cleanup, compile } from './index'

function getVerison (pkg: any): string {
  return pkg?.version ?? '0.1.0'
}

function getPackage (): any {
  const pkgContents = readFileSync(`${module.path}/package.json`, 'utf8')
  
  return JSON.parse(pkgContents)
}

async function main (): Promise<void> {
  const parser = new ArgumentParser({
    description: 'TS Func: Azure function.json generator'
  })
  const command = parser.add_subparsers({
    title: 'Commands',
    metavar: '[cleanup | compile]',
    dest: 'command'
  })
  const cleanupParser = command.add_parser('cleanup', {
    help: 'Clean up the current working directory of all emitted function.json.'
  })
  const compileParser = command.add_parser('compile', {
    help: 'Compile .tsfuncrc.(ts|js) in the current working directory and emit function.json.'
  })
  const pkg = getPackage()
  const version = getVerison(pkg)

  compileParser.add_argument('--noEmit', '-n', {
    action: 'store_const',
    const: true,
    required: false,
    default: false,
    help: 'Do not make any changes to the target directory.'
  })

  compileParser.add_argument('--ignoreScripts', '-i', {
    action: 'store_const',
    const: true,
    required: false,
    default: false,
    help: 'Ignore `scriptFile` properties; passes them unmodified to the output json.'
  })

  parser.add_argument('-v', '--version', { action: 'version', version })

  const options = parser.parse_args()

  if (!('help' in options)) {
    switch(options?.command) {
      case 'cleanup':
        await cleanup()
        break
      case 'compile':
        await compile({
          noEmit: options?.noEmit,
          ignoreScripts: options?.ignoreScripts
        })
        break
      default:
        parser.parse_args(['--help'])
        break
    }
  }
}

main().catch(err => {
  console.error(err)
  process.exit(1)
})
