/**
 * Simple command dispatcher module for AngularJS.
 * @version v0.0.3 - 2014-03-12
 * @link https://github.com/RSSchermer/command-dispatcher
 * @author R.S. Schermer
 * @license MIT License, http://www.opensource.org/licenses/MIT
 */

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
                listener.notify(command, 'beforeInitialize', commandName);
              });
            }
            
            command.initialize(commandParams);
            
            if (listeners.afterInitializeListeners[commandName]) {
              angular.forEach(listeners.afterInitializeListeners[commandName], function (listener) {
                listener.notify(command, 'afterInitialize', commandName);
              });
            }
          }
          
          if (listeners.beforeExecuteListeners[commandName]) {
            angular.forEach(listeners.beforeExecuteListeners[commandName], function (listener) {
              listener.notify(command, 'beforeExecute', commandName);
            });
          }
          
          command.execute();
          
          if (listeners.afterExecuteListeners[commandName]) {
            angular.forEach(listeners.afterExecuteListeners[commandName], function (listener) {
              listener.notify(command, 'afterExecute', commandName);
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
        if (typeof listener.notify !== 'function') {
          throw new Error("Listener must have a 'notify' method.");
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
            throw new Error('"'+ listenerType +'" is an unsupported listener type.');
        }
      };
      
      this.$get = function () {
        return new commandDispatcher(commands, listeners);
      };
    });
})();
