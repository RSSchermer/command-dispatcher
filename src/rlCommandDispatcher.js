"use strict";

(function() {
  var rlCommandDispatcherModule = angular.module('rlCommandDispatcher', []);
  
  rlCommandDispatcherModule
    .provider('commandDispatcher', function () {
      var commands = {};
      var beforeInitializeListeners = {};
      var afterInitializeListeners = {};
      var beforeExecuteListeners = {};
      var afterExecuteListeners = {};
      
      this.registerCommand = function (commandName, commandService) {
        commands[commandName] = commandService;
      };
      
      this.registerListener = function (listenerType, commandName, listenerService) {
        switch (listenerType) {
          case 'beforeInitialize':
            beforeInitializeListeners[commandName].push(listenerService);
          case 'afterInitialize':
            afterInitializeListeners[commandName].push(listenerService);
          case 'beforeExecute':
            beforeExecuteListeners[commandName].push(listenerService);
          case 'afterExecute':
            afterExecuteListeners[commandName].push(listenerService);
          default:
            throw new Error('"'+ listenerType +'" is an unsupported listener type.');
        }
      };
      
      var commandDispatcher = function () {};
      
      commandDispatcher.prototype.dispatch = function (commandName, commandParams) {
        if (!commands[commandName]) {
          throw new Error('Unable to find command with name "'+ commandName +'". Did you register it with the '
            + 'commandDispatcherProvider before registering the listener?');
        }
        
        var command = new commands[commandName];
        
        if (typeof command.initialize === 'function') {
          if (beforeInitializeListeners[commandName]) {
            angular.forEach(beforeInitializeListeners[commandName], function (listener) {
              listener.notify(command, 'beforeInitialize', commandName);
            });
          }
          
          command.initialize(commandParams);
          
          if (afterInitializeListeners[commandName]) {
            angular.forEach(afterInitializeListeners[commandName], function (listener) {
              listener.notify(command, 'afterInitialize', commandName);
            });
          }
        }
        
        if (beforeExecuteListeners[commandName]) {
          angular.forEach(beforeExecuteListeners[commandName], function (listener) {
            listener.notify(command, 'beforeExecute', commandName);
          });
        }
        
        command.execute();
        
        if (afterExecuteListeners[commandName]) {
          angular.forEach(beforeExecuteListeners[commandName], function (listener) {
            listener.notify(command, 'afterExecute', commandName);
          });
        }
      };
      
      this.$get = function () {
        return new commandDispatcher();
      };
    });
})();
