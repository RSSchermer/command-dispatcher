# Angular Command Dispatcher service

Very simple command dispatcher. Original use case was for interaction with an OAuth API. In case the API would respond
with an 'unauthorized' response after the OAuth token timed out, the window would be redirected to the authentication
provider. I needed a way to serialize the action that was unsuccessfull so it could be re-executed after
re-authentication. Using the command pattern and storing the serialized command in local storage seemed like a
reasonable solution.

## Installation

```shell
bower install rolab-command-dispatcher --save
```

## Usage
Create an command with at least an `execute()` method and optionally an `initialize()` method, which takes a
hash of parameters:

```js
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
```

You can then dispatch the command in a controller:

```js
myApp.controller('myCtrl', function (commandDispatcher) {
  commandDispatcher.dispatch('sayHello', {name: 'Bob'});
});
```

Optionally, you can register listeners for 4 different types of event: `beforeInitialize`, `afterInitialize`,
`beforeExecute` and `afterExecute`. A listener will be called with 3 parameters: the command object, the event name
and the command name:

```js
myApp.config(function (commandDispatcherProvider) {
    commandDispatcherProvider.registerListener('afterInitialize', 'sayHello', function (command, eventName, commandName) {
      if (command.name === 'Bob') {
        command.name += ' the Builder';
      }
    });
  });
```


## License

MIT
