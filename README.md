# Angular Command Dispatcher service

Very simple command dispatcher. Original use case was for interaction with an OAuth API. In case the API would respond
with an 'unauthorized' response after the OAuth token timed out, the window would be redirected to the authentication
provider. I needed a way to serialize the action that was unsuccessfull so it could be re-executed after
re-authentication. Using the command pattern and storing the serialized command in local storage seemed like a
reasonable solution.

## Usage
Create an Angular service with at least 1 method `execute()` and optionally one method `initialize()`, which takes a
hash of parameters: 

    var myApp = angular.module('myApp', ['rlCommandDispatcher'])
      .config(function (commandDispatcherProvider) {
        commandDispatcherProvider.registerCommand('sayHello', {
          name: null,
          
          initialize: function (params) {
            this.name = params.name;
          },
          
          execute: function () {
            console.log('Hello '+ this.name || 'World' + '!');
          }
        });
      });

Then in a controller:

    myApp.controller('myCtrl', function (commandDispatcher) {
      commandDispatcher.dispatch('sayHello', {name: 'Bob'});
    });

Optionally register a listener. A listener should at least define the method `notify()`, which will receive 3
parameters: the command object that is listened for, the event name and the command name. 

    myApp.config(function (commandDispatcherProvider) {
        commandDispatcherProvider.registerListener('afterInitialize', 'sayHello', {
          notify: function (command) {
            if (command.name === 'Bob') {
              command.name += ' the Builder';
            }
          }
        });
      });

Valid event types are: `beforeInitialize`, `afterInitialize`, `beforeExecute` and `afterExecute`.