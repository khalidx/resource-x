import {Hook} from '@oclif/config'

import {showBanner} from '../../library/cli/banner'

const hook: Hook<'init'> = async function (opts) {
  await showBanner()
}

export default hook
