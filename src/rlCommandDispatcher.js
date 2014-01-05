'use strict';

(function() {
  var rlCommandDispatcherModule = angular.module('rlCommandDispatcher', []);
  
  rlCommandDispatcherModule
    .provider('commandDispatcher', function () {
      var commands = {};
      var listeners = {
        beforeInitializeListeners: {},
        afterInitializeListeners: {},
        beforeExecuteListeners: {},
        afterExecuteListeners: {}
      };
      
      var commandDispatcher = function ($injector, commands, listeners) {
        this.dispatch = function (commandName, commandParams) {
          if (!commands[commandName]) {
            throw new Error('Unable to find command with name "'+ commandName +'". Did you register it with the '
              + 'commandDispatcherProvider before registering the listener?');
          }
          
          var command = new ($injector.get(commands[commandName]));
          
          if (typeof command.initialize === 'function') {
            if (beforeInitializeListeners[commandName]) {
              angular.forEach(beforeInitializeListeners[commandName], function (listener) {
                $injector.get(listener).notify(command, 'beforeInitialize', commandName);
              });
            }
            
            command.initialize(commandParams);
            
            if (afterInitializeListeners[commandName]) {
              angular.forEach(afterInitializeListeners[commandName], function (listener) {
                $injector.get(listener).notify(command, 'afterInitialize', commandName);
              });
            }
          }
          
          if (beforeExecuteListeners[commandName]) {
            angular.forEach(beforeExecuteListeners[commandName], function (listener) {
              $injector.get(listener).notify(command, 'beforeExecute', commandName);
            });
          }
          
          command.execute();
          
          if (afterExecuteListeners[commandName]) {
            angular.forEach(beforeExecuteListeners[commandName], function (listener) {
              $injector.get(listener).notify(command, 'afterExecute', commandName);
            });
          }
        };
      };
      
      this.registerCommand = function (commandName, commandService) {
        commands[commandName] = commandService;
      };
      
      this.registerListener = function (listenerType, commandName, listenerService) {
        switch (listenerType) {
          case 'beforeInitialize':
            listeners.beforeInitializeListeners[commandName].push(listenerService);
          case 'afterInitialize':
            listeners.afterInitializeListeners[commandName].push(listenerService);
          case 'beforeExecute':
            listeners.beforeExecuteListeners[commandName].push(listenerService);
          case 'afterExecute':
            listeners.afterExecuteListeners[commandName].push(listenerService);
          default:
            throw new Error('"'+ listenerType +'" is an unsupported listener type.');
        }
      };
      
      this.$get = function ($injector) {
        return new commandDispatcher($injector, commands, listeners);
      };
    });
})();
