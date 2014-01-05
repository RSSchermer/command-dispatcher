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
          
          var command = angular.copy($injector.get(commands[commandName]));
          
          if (typeof command.initialize === 'function') {
            if (listeners.beforeInitializeListeners[commandName]) {
              angular.forEach(listeners.beforeInitializeListeners[commandName], function (listener) {
                $injector.get(listener).notify(command, 'beforeInitialize', commandName);
              });
            }
            
            command.initialize(commandParams);
            
            if (listeners.afterInitializeListeners[commandName]) {
              angular.forEach(listeners.afterInitializeListeners[commandName], function (listener) {
                $injector.get(listener).notify(command, 'afterInitialize', commandName);
              });
            }
          }
          
          if (listeners.beforeExecuteListeners[commandName]) {
            angular.forEach(listeners.beforeExecuteListeners[commandName], function (listener) {
              $injector.get(listener).notify(command, 'beforeExecute', commandName);
            });
          }
          
          command.execute();
          
          if (listeners.afterExecuteListeners[commandName]) {
            angular.forEach(listeners.afterExecuteListeners[commandName], function (listener) {
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
            if (!listeners.beforeInitializeListeners[commandName]) {
              listeners.beforeInitializeListeners[commandName] = [];
            }
            
            listeners.beforeInitializeListeners[commandName].push(listenerService);
            break;
          case 'afterInitialize':
            if (!listeners.afterInitializeListeners[commandName]) {
              listeners.afterInitializeListeners[commandName] = [];
            }
            
            listeners.afterInitializeListeners[commandName].push(listenerService);
            break;
          case 'beforeExecute':
            if (!listeners.beforeExecuteListeners[commandName]) {
              listeners.beforeExecuteListeners[commandName] = [];
            }
            
            listeners.beforeExecuteListeners[commandName].push(listenerService);
            break;
          case 'afterExecute':
            if (!listeners.afterExecuteListeners[commandName]) {
              listeners.afterExecuteListeners[commandName] = [];
            }
            
            listeners.afterExecuteListeners[commandName].push(listenerService);
            break;
          default:
            throw new Error('"'+ listenerType +'" is an unsupported listener type.');
        }
      };
      
      this.$get = function ($injector) {
        return new commandDispatcher($injector, commands, listeners);
      };
    });
})();
