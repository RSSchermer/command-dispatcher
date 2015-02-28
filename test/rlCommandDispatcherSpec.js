describe("rlCommandDispatcher", function() {
  var cdProvider, cdService;

  beforeEach(function () {
    angular.module('rlCommandDispatcher.test', ['rlCommandDispatcher'])
      .config(function (commandDispatcherProvider) {
        cdProvider = commandDispatcherProvider;
      });

    angular.mock.module('rlCommandDispatcher', 'rlCommandDispatcher.test');

    angular.mock.inject(function($injector) {
      cdService = $injector.invoke(cdProvider.$get);
    });
  });

  describe('provider', function () {
    it('should throw an error on command without execute method', function () {
      expect(function () {
        cdProvider.registerCommand('someCommand', {
          someMethod: function () {}
        });
      }).toThrow("Command must have an 'execute' method.");
    });

    it('should throw an error on listener that is not a function', function () {
      expect(function () {
        cdProvider.registerListener('beforeExecute', 'someCommand', 'notAFunction');
      }).toThrow("Listener must be a function.");
    });

    it('should throw an error on unsupported listener type', function () {
      expect(function () {
        cdProvider.registerListener('unsupportedListenerType', 'someCommand', function () {});
      }).toThrow('"unsupportedListenerType" is not a supported listener type.');
    });
  });

  describe('service', function () {
    it('should call the commands execute method on dispatch', function () {
      var command = {
        name: null,

        execute: function () {
          console.log('Hello '+ this.name || 'World' + '!');
        }
      };

      spyOn(command, 'execute');

      cdProvider.registerCommand('sayHello', command);
      cdService.dispatch('sayHello');

      expect(command.execute).toHaveBeenCalled();
    });

    it('should call the commands initialize method when defined', function () {
      var command = {
        name: null,

        initialize: function () {
          this.name = 'Bob';
        },

        execute: function () { }
      };

      spyOn(command, 'initialize');

      cdProvider.registerCommand('sayHello', command);
      cdService.dispatch('sayHello');

      expect(command.initialize).toHaveBeenCalled();
    });

    it('should pass a paramater hash to the initialize method', function () {
      var command = {
        name: null,

        initialize: function (params) {
          this.name = params.name;
        },

        execute: function () { }
      };

      spyOn(command, 'initialize');

      cdProvider.registerCommand('sayHello', command);
      cdService.dispatch('sayHello', {name: 'Bob'});

      expect(command.initialize).toHaveBeenCalledWith({name: 'Bob'});
    });

    it('should not call an initialize listener when there is no initiaze method on the command', function () {
      cdProvider.registerCommand('someCommand', {
        execute: function () {}
      });

      var beforeInitializeListenerSpy = jasmine.createSpy('beforeInitializeListenerSpy');
      var afterInitializeListenerSpy = jasmine.createSpy('afterInitializeListenerSpy');

      cdProvider.registerListener('beforeInitialize', 'someCommand', beforeInitializeListenerSpy);
      cdProvider.registerListener('beforeInitialize', 'someCommand', afterInitializeListenerSpy);

      cdService.dispatch('someCommand');

      expect(beforeInitializeListenerSpy).not.toHaveBeenCalled();
      expect(afterInitializeListenerSpy).not.toHaveBeenCalled();
    });

    it('should call all before-initialize listeners when there is an initialize command', function () {
      cdProvider.registerCommand('someCommand', {
        initialize: function () {},

        execute: function () {}
      });

      var beforeInitializeListenerSpy = jasmine.createSpy('beforeInitializeListenerSpy');
      var otherBeforeInitializeListenerSpy = jasmine.createSpy('otherBeforeInitializeListenerSpy');

      cdProvider.registerListener('beforeInitialize', 'someCommand', beforeInitializeListenerSpy);
      cdProvider.registerListener('beforeInitialize', 'someCommand', otherBeforeInitializeListenerSpy);

      cdService.dispatch('someCommand');

      expect(beforeInitializeListenerSpy).toHaveBeenCalled();
      expect(otherBeforeInitializeListenerSpy).toHaveBeenCalled();
    });

    it('should call all after-initialize listeners when there is an initialize command', function () {
      cdProvider.registerCommand('someCommand', {
        initialize: function () {},

        execute: function () {}
      });

      var afterInitializeListenerSpy = jasmine.createSpy('afterInitializeListenerSpy');
      var otherAfterInitializeListenerSpy = jasmine.createSpy('otherAfterInitializeListenerSpy');

      cdProvider.registerListener('afterInitialize', 'someCommand', afterInitializeListenerSpy);
      cdProvider.registerListener('afterInitialize', 'someCommand', otherAfterInitializeListenerSpy);

      cdService.dispatch('someCommand');

      expect(afterInitializeListenerSpy).toHaveBeenCalled();
      expect(otherAfterInitializeListenerSpy).toHaveBeenCalled();
    });

    it('should call all before-execute listeners', function () {
      cdProvider.registerCommand('someCommand', {
        execute: function () {}
      });

      var beforeExecuteListenerSpy = jasmine.createSpy('beforeExecuteListenerSpy');
      var otherBeforeExecuteListenerSpy = jasmine.createSpy('otherBeforeExecuteListenerSpy');

      cdProvider.registerListener('beforeExecute', 'someCommand', beforeExecuteListenerSpy);
      cdProvider.registerListener('beforeExecute', 'someCommand', otherBeforeExecuteListenerSpy);

      cdService.dispatch('someCommand');

      expect(beforeExecuteListenerSpy).toHaveBeenCalled();
      expect(otherBeforeExecuteListenerSpy).toHaveBeenCalled();
    });

    it('should call all after-execute listeners', function () {
      cdProvider.registerCommand('someCommand', {
        execute: function () {}
      });

      var afterExecuteListenerSpy = jasmine.createSpy('afterExecuteListenerSpy');
      var otherAfterExecuteListenerSpy = jasmine.createSpy('otherAfterExecuteListenerSpy');

      cdProvider.registerListener('afterExecute', 'someCommand', afterExecuteListenerSpy);
      cdProvider.registerListener('afterExecute', 'someCommand', otherAfterExecuteListenerSpy);

      cdService.dispatch('someCommand');

      expect(afterExecuteListenerSpy).toHaveBeenCalled();
      expect(otherAfterExecuteListenerSpy).toHaveBeenCalled();
    });

    it('should pass the command, the listener type and the command name to listeners', function () {
      var command = {
        initialize: function () {},

        execute: function () {}
      };

      cdProvider.registerCommand('someCommand', command);

      var beforeInitializeListenerSpy = jasmine.createSpy('beforeInitializeListenerSpy');
      var afterInitializeListenerSpy = jasmine.createSpy('afterInitializeListenerSpy');
      var beforeExecuteListenerSpy = jasmine.createSpy('beforeExecuteListenerSpy');
      var afterExecuteListenerSpy = jasmine.createSpy('afterExecuteListenerSpy');

      cdProvider.registerListener('beforeInitialize', 'someCommand', beforeInitializeListenerSpy);
      cdProvider.registerListener('afterInitialize', 'someCommand', afterInitializeListenerSpy);
      cdProvider.registerListener('beforeExecute', 'someCommand', beforeExecuteListenerSpy);
      cdProvider.registerListener('afterExecute', 'someCommand', afterExecuteListenerSpy);

      cdService.dispatch('someCommand');

      expect(beforeInitializeListenerSpy).toHaveBeenCalledWith(command, 'beforeInitialize', 'someCommand');
      expect(afterInitializeListenerSpy).toHaveBeenCalledWith(command, 'afterInitialize', 'someCommand');
      expect(beforeExecuteListenerSpy).toHaveBeenCalledWith(command, 'beforeExecute', 'someCommand');
      expect(afterExecuteListenerSpy).toHaveBeenCalledWith(command, 'afterExecute', 'someCommand');
    });
  });
});
