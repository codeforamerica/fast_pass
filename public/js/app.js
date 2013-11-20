'use strict';

// ***********************************************************************
// 
// APPLICATION
//
// ***********************************************************************

(function (ng) {

  var FastPass = ng.module(APPLICATION_NAME, [
      APPLICATION_NAME + '.controllers',
      APPLICATION_NAME + '.services',
      APPLICATION_NAME + '.directives',
      APPLICATION_NAME + '.routes'
  ]);

  window.FP = FastPass;

})(angular)
