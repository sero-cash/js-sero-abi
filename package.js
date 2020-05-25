/* jshint ignore:start */
Package.describe({
  name: 'sero:serojs',
  version: '0.0.2',
  summary: 'sero js tools',
  // By default, Meteor will default to using README.md for documentation.
  // To avoid submitting documentation, set this field to null.
  documentation: 'README.md'
});

Package.onUse(function(api) {
  api.versionsFrom('0.0.2');

  // api.use('3stack:bignumber@2.0.0', 'client');

  api.export(['serojs', 'BigNumber'], ['client', 'server']);

  api.addFiles('dist/serojs', ['client', 'server']);
  api.addFiles('package-init.js', ['client', 'server']);
});

// Package.onTest(function(api) {
//   api.use('tinytest');
//   api.use('test');
//   api.addFiles('test-tests.js');
// });
/* jshint ignore:end */
