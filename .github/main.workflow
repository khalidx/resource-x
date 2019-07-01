workflow "Install, build, and test on push" {
  on = "push"
  resolves = ["publish"]
}

action "install" {
  uses = "actions/npm@59b64a598378f31e49cb76f27d6f3312b582f680"
  args = "install"
}

action "test" {
  uses = "actions/npm@59b64a598378f31e49cb76f27d6f3312b582f680"
  needs = ["install"]
  args = "test"
}

action "filter for a version tag" {
  uses = "actions/bin/filter@3c0b4f0e63ea54ea5df2914b4fabf383368cd0da"
  needs = ["test"]
  args = "tag v*"
}

action "publish" {
  uses = "actions/npm@59b64a598378f31e49cb76f27d6f3312b582f680"
  needs = ["filter for a version tag"]
  args = "publish --access=public"
  secrets = ["NPM_AUTH_TOKEN"]
}
