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
    metavar: '',
    dest: 'command'
  })
  command.add_parser('cleanup', {
    help: 'Clean up the current working directory of all emitted function.json.'
  })
  command.add_parser('compile', {
    help: 'Compile .tsfuncrc.(ts|js) in the current working directory and emit function.json.'
  })
  const pkg = getPackage()
  const version = getVerison(pkg)

  parser.add_argument('-v', '--version', { action: 'version', version })

  const options = parser.parse_args()

  switch(options?.command) {
    case 'cleanup':
      await cleanup()
      break
    case 'compile':
      await compile()
      break
    default:
      parser.parse_args(['--help'])
      break
  }
}

main().catch(err => {
  console.error(err)
  process.exit(1)
})
