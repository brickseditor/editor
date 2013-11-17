'use strict';

angular.module('bricksApp.common')
  .factory('beautify', function () {
    return {
      html: html_beautify // jshint ignore:line
    };
  });
