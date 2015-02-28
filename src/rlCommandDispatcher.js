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

      var commandDispatcher = function (commands, listeners) {
        this.dispatch = function (commandName, commandParams) {
          if (!commands[commandName]) {
            throw new Error('Unable to find command with name "'+ commandName +'". Did you register it with the '
              + 'commandDispatcherProvider before registering the listener?');
          }

          var command = angular.copy(commands[commandName]);

          if (typeof command.initialize === 'function') {
            if (listeners.beforeInitializeListeners[commandName]) {
              angular.forEach(listeners.beforeInitializeListeners[commandName], function (listener) {
                listener(command, 'beforeInitialize', commandName);
              });
            }

            command.initialize(commandParams);

            if (listeners.afterInitializeListeners[commandName]) {
              angular.forEach(listeners.afterInitializeListeners[commandName], function (listener) {
                listener(command, 'afterInitialize', commandName);
              });
            }
          }

          if (listeners.beforeExecuteListeners[commandName]) {
            angular.forEach(listeners.beforeExecuteListeners[commandName], function (listener) {
              listener(command, 'beforeExecute', commandName);
            });
          }

          command.execute();

          if (listeners.afterExecuteListeners[commandName]) {
            angular.forEach(listeners.afterExecuteListeners[commandName], function (listener) {
              listener(command, 'afterExecute', commandName);
            });
          }
        };
      };

      this.registerCommand = function (commandName, command) {
        if (typeof command.execute !== 'function') {
          throw new Error("Command must have an 'execute' method.");
        }

        commands[commandName] = command;
      };

      this.registerListener = function (listenerType, commandName, listener) {
        if (typeof listener !== 'function') {
          throw new Error("Listener must be a function.");
        }

        switch (listenerType) {
          case 'beforeInitialize':
            if (!listeners.beforeInitializeListeners[commandName]) {
              listeners.beforeInitializeListeners[commandName] = [];
            }

            listeners.beforeInitializeListeners[commandName].push(listener);
            break;
          case 'afterInitialize':
            if (!listeners.afterInitializeListeners[commandName]) {
              listeners.afterInitializeListeners[commandName] = [];
            }

            listeners.afterInitializeListeners[commandName].push(listener);
            break;
          case 'beforeExecute':
            if (!listeners.beforeExecuteListeners[commandName]) {
              listeners.beforeExecuteListeners[commandName] = [];
            }

            listeners.beforeExecuteListeners[commandName].push(listener);
            break;
          case 'afterExecute':
            if (!listeners.afterExecuteListeners[commandName]) {
              listeners.afterExecuteListeners[commandName] = [];
            }

            listeners.afterExecuteListeners[commandName].push(listener);
            break;
          default:
            throw new Error('"'+ listenerType +'" is not a supported listener type.');
        }
      };

      this.$get = function () {
        return new commandDispatcher(commands, listeners);
      };
    });
})();
