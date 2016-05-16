test-coveralls:
    @NODE_ENV=test ./node_modules/istanbul/lib/cli.js cover ./node_modules/mocha/bin/_mocha -- -R spec ./atom-sdk/test/request.spec.js ./atom-sdk/test/atom.spec.js ./atom-sdk/test/response.spec.js
